// The town clock.
//
// PLACEHOLDER: SPEC.md §2 says the server is the authority on time and §1 that
// the world keeps running while nobody is connected. There is no server yet, so
// this derives town time from the wall clock against a fixed epoch. That keeps
// it deterministic — every browser that opens SimTown right now agrees on what
// time it is in town — and it will be replaced by the server's clock, not
// extended. Nothing should ever write to town time from the client.

/** Real seconds per town minute is 1/TIME_SCALE — a town day takes 24 real minutes. */
export const TIME_SCALE = 60

export const DAY_MINUTES = 24 * 60
export const WEEK_MINUTES = 7 * DAY_MINUTES

/** Sunday 2026-01-04 00:00 UTC. Anchors day 0 to a Sunday so dayOfWeek 0 = Sunday. */
const EPOCH_MS = Date.UTC(2026, 0, 4, 0, 0, 0)

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface TownTime {
  /** days since the town began */
  day: number
  /** 0 = Sunday */
  dayOfWeek: number
  hour: number
  minute: number
  /** minutes since midnight, fractional */
  minuteOfDay: number
  /** minutes since Sunday 00:00, fractional; wraps every WEEK_MINUTES */
  minuteOfWeek: number
}

export function townTimeAt(realMs: number): TownTime {
  const townMinutes = ((realMs - EPOCH_MS) / 1000) * (TIME_SCALE / 60)
  const day = Math.floor(townMinutes / DAY_MINUTES)
  const minuteOfDay = townMinutes - day * DAY_MINUTES
  const dayOfWeek = ((day % 7) + 7) % 7
  return {
    day,
    dayOfWeek,
    hour: Math.floor(minuteOfDay / 60),
    minute: Math.floor(minuteOfDay % 60),
    minuteOfDay,
    minuteOfWeek: dayOfWeek * DAY_MINUTES + minuteOfDay,
  }
}

export function nowTownTime(): TownTime {
  return townTimeAt(Date.now())
}

/** "Tuesday 07:45" */
export function formatTownTime(t: TownTime): string {
  const hh = String(t.hour).padStart(2, '0')
  const mm = String(t.minute).padStart(2, '0')
  return `${DAY_NAMES[t.dayOfWeek]} ${hh}:${mm}`
}
