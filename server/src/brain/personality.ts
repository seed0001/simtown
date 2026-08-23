// Personality engine — the stable layer, ported in spirit from Engines/personality/.
// Unlike emotion/goals, this doesn't fluctuate turn to turn. It just carries
// the resident's fixed persona and voice verbatim from the single source of
// truth (client/src/city/residents.ts) so nothing here ever drifts from it.

export interface PersonalityTraits {
  persona: string
  voice: string
}

export class PersonalityEngine {
  constructor(private readonly traits: PersonalityTraits) {}

  describe(): string {
    return this.traits.persona
  }

  voiceNotes(): string {
    return this.traits.voice
  }
}
