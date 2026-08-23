// Memory engine — ported and trimmed from Engines/memory/memory_core_gramps.py.
// Event-sourced, persistent, keyed per conversation partner. This is the
// module that makes "remembers me" true across restarts instead of only
// within one chat window: the LLM is handed these exact past exchanges as
// fact, verbatim, and is never allowed to assert a memory that isn't here.

export interface MemoryEvent {
  atTownTime: string
  atRealMs: number
  visitorId: string
  visitorSaid: string
  residentSaid: string
}

export class MemoryEngine {
  private events: MemoryEvent[]

  constructor(initial: MemoryEvent[] = []) {
    this.events = initial
  }

  record(event: MemoryEvent): void {
    this.events.push(event)
  }

  recentWith(visitorId: string, n = 6): MemoryEvent[] {
    return this.events.filter((e) => e.visitorId === visitorId).slice(-n)
  }

  hasMetBefore(visitorId: string): boolean {
    return this.events.some((e) => e.visitorId === visitorId)
  }

  firstMetAt(visitorId: string): string | undefined {
    return this.events.find((e) => e.visitorId === visitorId)?.atTownTime
  }

  getState(): MemoryEvent[] {
    return this.events
  }
}
