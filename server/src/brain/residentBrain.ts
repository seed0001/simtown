import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  type Resident,
  fullName,
  homeOf,
  workplaceOf,
  relationshipsOf,
  isOnShiftAt,
  getResident,
} from '../towndata/city/residents.ts'
import { addressOf, type BuildingEntry } from '../towndata/city/registry.ts'
import { nowTownTime, formatTownTime, type TownTime } from '../towndata/sim/clock.ts'
import { chatCompletion, type ChatMessage } from '../openrouter.ts'
import { EmotionEngine, type EmotionState } from './emotion.ts'
import { GoalsEngine, type GoalsState } from './goals.ts'
import { MemoryEngine, type MemoryEvent } from './memory.ts'
import { PersonalityEngine } from './personality.ts'

interface PersistedBrainState {
  emotion: EmotionState
  goals: GoalsState
  memory: MemoryEvent[]
}

export interface ConversationTurn {
  speaker: string // resident id
  text: string
}

interface Counterpart {
  id: string
  label: string // display name
  /** true when the other party is another resident (a peer), not a human visitor */
  isPeer: boolean
  /** the real, seeded tie between the two residents, if any — grounds why they'd talk at all */
  relationshipNote?: string
}

/**
 * One resident's complete cognition stack: personality (stable), emotion and
 * goals (fluctuating, computed here), and memory (persistent, per counterpart
 * — human visitor or fellow resident, the model doesn't distinguish). The LLM
 * is called exactly once per turn, purely to phrase a line — every fact it's
 * given (where he is, how he feels, what he remembers, who he's talking to
 * and why) is computed by these modules first. It cannot know anything this
 * class didn't hand it.
 */
export class ResidentBrain {
  private readonly resident: Resident
  private readonly personality: PersonalityEngine
  private readonly emotion: EmotionEngine
  private readonly goals: GoalsEngine
  private readonly memory: MemoryEngine
  private readonly statePath: string

  constructor(residentId: string, seedConcerns: string[], statePath: string) {
    const resident = getResident(residentId)
    if (!resident) throw new Error(`no resident with id ${residentId} in towndata/city/residents.ts`)
    this.resident = resident
    this.personality = new PersonalityEngine({ persona: resident.persona, voice: resident.voice })
    this.statePath = statePath

    const persisted = this.load()
    this.emotion = new EmotionEngine(persisted?.emotion)
    this.goals = new GoalsEngine(
      persisted?.goals ?? { concerns: seedConcerns.map((text) => ({ text, intensity: 0.5 })) },
    )
    this.memory = new MemoryEngine(persisted?.memory ?? [])
  }

  get id(): string {
    return this.resident.id
  }

  get name(): string {
    return fullName(this.resident)
  }

  private load(): PersistedBrainState | undefined {
    if (!existsSync(this.statePath)) return undefined
    return JSON.parse(readFileSync(this.statePath, 'utf-8')) as PersistedBrainState
  }

  private persist(): void {
    mkdirSync(dirname(this.statePath), { recursive: true })
    const snapshot: PersistedBrainState = {
      emotion: this.emotion.getState(),
      goals: this.goals.getState(),
      memory: this.memory.getState(),
    }
    writeFileSync(this.statePath, JSON.stringify(snapshot, null, 2), 'utf-8')
  }

  /** Where the resident actually is right now, derived from their real schedule — never guessed. */
  private currentLocation(t: TownTime): { building: BuildingEntry; status: string } {
    if (isOnShiftAt(this.resident, t.minuteOfWeek)) {
      const workplace = workplaceOf(this.resident)
      if (workplace) return { building: workplace, status: 'at work' }
    }
    const home = homeOf(this.resident)
    if (home) return { building: home, status: 'at home' }
    throw new Error(`${this.resident.id} has neither a valid workplace nor home in registry.ts`)
  }

  private buildSystemPrompt(t: TownTime, counterpart: Counterpart, nextLineInstruction: string): string {
    const { building, status } = this.currentLocation(t)
    const name = fullName(this.resident)
    const relationships = relationshipsOf(this.resident.id)
      .map((r) => r.note)
      .filter(Boolean)
      .join(' ')

    const priorEvents = this.memory.recentWith(counterpart.id, 8)
    const memoryBlock =
      priorEvents.length === 0
        ? `You have never spoken with ${counterpart.label} before now. Do not imply otherwise.`
        : [
            `You have spoken with ${counterpart.label} before, first on ${this.memory.firstMetAt(counterpart.id)}. Actual past exchanges, oldest first:`,
            ...priorEvents.map((e) => `- (${e.atTownTime}) them: "${e.visitorSaid}" — you: "${e.residentSaid}"`),
          ].join('\n')

    const whoIsThis = counterpart.isPeer
      ? `You are talking with ${counterpart.label}, a fellow resident of the town — a real person you actually know, not a stranger.` +
        (counterpart.relationshipNote ? ` What's actually true between you: ${counterpart.relationshipNote}` : ' You have no established relationship beyond being fellow residents — do not invent one.')
      : `You are talking with ${counterpart.label}, a visitor. You do not know anything about who they are beyond what's in your actual memory below.`

    return [
      `You are ${name}, a real resident of SimTown, a small persistent simulated town. You are not an AI assistant, you must never say you are one, break character, or refer to yourself as a language model or a simulation from the inside.`,
      ``,
      `WHO YOU ARE (fixed — never contradict this):`,
      this.personality.describe(),
      relationships ? `\nPeople in your life: ${relationships}` : '',
      ``,
      `HOW YOU TALK:`,
      this.personality.voiceNotes(),
      ``,
      `RIGHT NOW:`,
      `- It is ${formatTownTime(t)} in town.`,
      `- You are ${status}, at ${building.name} (${addressOf(building)}).`,
      ``,
      `HOW YOU FEEL RIGHT NOW (your actual state — describe it in your own words, don't just recite this list):`,
      this.emotion.describe(),
      ``,
      `ON YOUR MIND:`,
      this.goals.describe(),
      ``,
      `WHO YOU'RE TALKING TO:`,
      whoIsThis,
      ``,
      `WHAT YOU ACTUALLY REMEMBER ABOUT THEM:`,
      memoryBlock,
      ``,
      `STRICT RULES:`,
      `- Only state specific facts, memories, or past events that appear above. Never invent a memory, a name, a past conversation, or a town event that wasn't given to you here.`,
      `- If you don't have information to answer something, respond the way a real person would — say you don't know, ask a question, or deflect. Do not fabricate an answer and present it as fact.`,
      `- Speak in 1-4 short sentences, the way ${this.resident.firstName} actually talks. This is a spoken conversation, not written text — no stage directions, no asterisks, no emoji.`,
      ``,
      nextLineInstruction,
    ]
      .filter((line) => line !== '')
      .join('\n')
  }

  /** A human visitor said something to this resident. Uses the higher-quality default model. */
  async chat(visitorId: string, message: string): Promise<string> {
    const t = nowTownTime()
    const systemPrompt = this.buildSystemPrompt(
      t,
      { id: visitorId, label: visitorId, isPeer: false },
      `Reply to what they just said, as yourself.`,
    )

    const priorTurns: ChatMessage[] = this.memory
      .recentWith(visitorId, 4)
      .flatMap((e): ChatMessage[] => [
        { role: 'user', content: e.visitorSaid },
        { role: 'assistant', content: e.residentSaid },
      ])

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...priorTurns,
      { role: 'user', content: message },
    ]

    const reply = await chatCompletion(messages)

    this.memory.record({
      atTownTime: formatTownTime(t),
      atRealMs: Date.now(),
      visitorId,
      visitorSaid: message,
      residentSaid: reply,
    })
    // a real conversation is a small, ordinary social touch — nudge, not invent
    this.emotion.update({ loneliness: -0.04, affection: 0.02, boredom: -0.05 })
    this.persist()

    return reply
  }

  /**
   * Produce this resident's next line in a live conversation with another
   * resident. `transcript` is the shared, neutral record of the exchange so
   * far — this resident's own lines map to "assistant", the other's to
   * "user". Uses the free model tier: NPC-to-NPC chatter is unbounded
   * background volume and SPEC.md §11 says it should cost nothing.
   */
  async speakTo(other: { id: string; name: string }, transcript: ConversationTurn[]): Promise<string> {
    const t = nowTownTime()
    const relationshipNote = relationshipsOf(this.resident.id).find(
      (r) => r.a === other.id || r.b === other.id,
    )?.note

    const nextLineInstruction =
      transcript.length === 0
        ? `Say the first thing — open the conversation naturally, given where you both are, what's on your mind, and what's actually true between you two.`
        : `Say the next line in this conversation, responding to what ${other.name} just said.`

    const systemPrompt = this.buildSystemPrompt(
      t,
      { id: other.id, label: other.name, isPeer: true, relationshipNote },
      nextLineInstruction,
    )

    const priorTurns: ChatMessage[] = transcript.map((turn) => ({
      role: turn.speaker === this.resident.id ? 'assistant' : 'user',
      content: turn.text,
    }))

    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...priorTurns]

    return chatCompletion(messages, 'free')
  }

  /** Record a completed peer conversation into this resident's own memory and nudge their state. */
  recordConversation(other: { id: string; name: string }, transcript: ConversationTurn[]): void {
    const t = nowTownTime()
    const rendered = transcript
      .map((turn) => `${turn.speaker === this.resident.id ? this.resident.firstName : other.name}: ${turn.text}`)
      .join(' / ')

    this.memory.record({
      atTownTime: formatTownTime(t),
      atRealMs: Date.now(),
      visitorId: other.id,
      visitorSaid: `(a conversation with ${other.name})`,
      residentSaid: rendered,
    })
    this.emotion.update({ loneliness: -0.05, affection: 0.03, boredom: -0.04 })
    this.persist()
  }

  describeState() {
    return {
      resident: fullName(this.resident),
      emotion: this.emotion.getState(),
      goals: this.goals.getState(),
      memoryCount: this.memory.getState().length,
    }
  }
}
