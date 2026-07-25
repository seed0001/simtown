// Single source of truth for every person who lives in SimTown.
//
// The town starts small on purpose. Residents move in over time, households
// form and dissolve, and any house in registry.ts without a household on it is
// available housing stock (see vacantHomes). Nothing here is a schedule or a
// plan — plans are authored nightly by the LLM. This file is only *who people
// are*: persona, voice, home, job, money, and ties.
//
// To edit a resident, find them here by name. Homes and workplaces are
// building ids from registry.ts; run validateResidents() to catch a typo.

import { BUILDINGS, addressOf, getBuilding, type BuildingEntry } from './registry'

export type Gender = 'male' | 'female'

/** Shape of a household. Families arrive later, when kids are born in town. */
export type HouseholdKind = 'couple' | 'roommates' | 'solo' | 'family'

export interface Household {
  id: string
  kind: HouseholdKind
  /** building id from registry.ts; must be a house */
  homeId: string
  /** resident ids, in no particular order */
  memberIds: string[]
  /** day of town history this household formed. 0 = founding. */
  formedDay: number
}

export interface Job {
  title: string
  /** building id from registry.ts */
  workplaceId: string
  /** days worked, 0 = Sunday */
  days: number[]
  /** 24h clock; endHour <= startHour means the shift runs overnight */
  startHour: number
  endHour: number
}

export interface Resident {
  id: string
  firstName: string
  lastName: string
  age: number
  gender: Gender
  /** household id from HOUSEHOLDS */
  householdId: string
  job: Job
  /** opening bank balance, dollars */
  balance: number
  /** what they look like in-world */
  appearance: Appearance
  /** who they are — the persona prompt the LLM speaks and plans from */
  persona: string
  /** how they talk — voice notes for dialogue generation */
  voice: string
  /** day of town history they arrived. 0 = founding resident. */
  arrivedDay: number
}

/** What a resident looks like. Drives the body mesh in scene/Person.tsx. */
export interface Appearance {
  skin: string
  hair: string
  hairStyle: 'short' | 'long' | 'bun' | 'thin' | 'bald'
  shirt: string
  pants: string
  shoes: string
  /** overall height multiplier, roughly 0.94–1.06 */
  height: number
  /** torso/shoulder width multiplier, roughly 0.92–1.14 */
  build: number
}

export type RelationKind = 'spouse' | 'roommate' | 'friend' | 'rival' | 'sibling'

export interface Relationship {
  a: string
  b: string
  kind: RelationKind
  /** what the tie actually is, in a line — context for generated dialogue */
  note?: string
}

// ---------- households ----------

export const HOUSEHOLDS: Household[] = [
  {
    id: 'hh-ilori',
    kind: 'couple',
    homeId: 'main-106', // Rosewood House, 106 Main Street
    memberIds: ['marcus-ilori', 'nadia-ilori'],
    formedDay: 0,
  },
  {
    id: 'hh-brandt',
    kind: 'couple',
    homeId: 'main-99', // Aspen Cottage, 99 Main Street
    memberIds: ['theo-brandt', 'priya-raman-brandt'],
    formedDay: 0,
  },
  {
    id: 'hh-juniper',
    kind: 'roommates',
    homeId: 'oak-203', // Juniper House, 203 Oak Avenue
    memberIds: ['wes-okonjo', 'ines-vidal'],
    formedDay: 0,
  },
  {
    id: 'hh-blum',
    kind: 'solo',
    homeId: 'maple-306', // Fern Cottage, 306 Maple Avenue
    memberIds: ['harriet-blum'],
    formedDay: 0,
  },
]

// ---------- residents ----------

export const RESIDENTS: Resident[] = [
  {
    id: 'marcus-ilori',
    firstName: 'Marcus',
    lastName: 'Ilori',
    age: 47,
    gender: 'male',
    householdId: 'hh-ilori',
    job: {
      title: 'Cook & co-owner',
      workplaceId: 'main-112', // Bluebird Diner
      days: [1, 2, 3, 4, 5, 6],
      startHour: 5,
      endHour: 15,
    },
    balance: 1240,
    appearance: {
      skin: '#6b4a35',
      hair: '#231d1a',
      hairStyle: 'short',
      shirt: '#f2efe6', // cook's whites
      pants: '#3b4048',
      shoes: '#2a2724',
      height: 1.03,
      build: 1.14,
    },
    persona:
      'Runs the grill at the Bluebird, which he and Nadia bought eleven years ago and have never quite finished paying off. Up at 4:40 without an alarm. Judges a town by whether its diner is honest and people by whether they finish the plate. Generous with food, tight with money, and quietly afraid the place will not last another bad winter.',
    voice: 'Short declarative sentences. Warms up only when the subject is food.',
    arrivedDay: 0,
  },
  {
    id: 'nadia-ilori',
    firstName: 'Nadia',
    lastName: 'Ilori',
    age: 45,
    gender: 'female',
    householdId: 'hh-ilori',
    job: {
      title: 'Bookkeeper',
      workplaceId: 'oak-202', // Meridian Offices
      days: [1, 2, 3, 4, 5],
      startHour: 9,
      endHour: 17,
    },
    balance: 6800,
    appearance: {
      skin: '#6b4a35',
      hair: '#241c18',
      hairStyle: 'bun',
      shirt: '#7d8fa8',
      pants: '#2f3440',
      shoes: '#33302c',
      height: 0.98,
      build: 0.95,
    },
    persona:
      'Keeps the books at Meridian by day and the Bluebird’s by night, which makes her the only person in town who knows exactly how thin the diner’s margin is. Precise, unsentimental, relentlessly loyal. She notices when numbers do not add up, and when people do not either.',
    voice: 'Dry and exact. Asks a question instead of making an accusation.',
    arrivedDay: 0,
  },
  {
    id: 'theo-brandt',
    firstName: 'Theo',
    lastName: 'Brandt',
    age: 33,
    gender: 'male',
    householdId: 'hh-brandt',
    job: {
      title: 'Grocer',
      workplaceId: 'maple-305', // Green Grocer
      days: [2, 3, 4, 5, 6],
      startHour: 8,
      endHour: 17,
    },
    balance: 980,
    appearance: {
      skin: '#e0b08a',
      hair: '#8a6a3a',
      hairStyle: 'short',
      shirt: '#4e8a5c', // grocer's green
      pants: '#7a6a52',
      shoes: '#4a3f34',
      height: 1.02,
      build: 1.06,
    },
    persona:
      'Works the floor at the Green Grocer and knows every regular’s usual order. Constitutionally incapable of saying no — to a discount, a favor, or a twenty-minute conversation in the produce aisle. Happiest when the store is busy, which he keeps confusing with profitable.',
    voice: 'Warm and fast, over-shares. Trails off checking you are still with him.',
    arrivedDay: 0,
  },
  {
    id: 'priya-raman-brandt',
    firstName: 'Priya',
    lastName: 'Raman-Brandt',
    age: 35,
    gender: 'female',
    householdId: 'hh-brandt',
    job: {
      title: 'Paralegal',
      workplaceId: 'oak-206', // Sandstone Tower
      days: [1, 2, 3, 4, 5],
      startHour: 8,
      endHour: 19,
    },
    balance: 9400,
    appearance: {
      skin: '#b3805a',
      hair: '#1c1512',
      hairStyle: 'long',
      shirt: '#2c3550', // blazer
      pants: '#20263a',
      shoes: '#26221f',
      height: 0.99,
      build: 0.93,
    },
    persona:
      'Paralegal at a firm in Sandstone Tower, first one in and often the last one out. She married Theo for exactly the openness that now exhausts her: he gives it away, she counts it. Wants out of the tower and into something of her own, and has not said so out loud yet.',
    voice: 'Measured and careful. Says less than she is thinking; what she says is chosen.',
    arrivedDay: 0,
  },
  {
    id: 'wes-okonjo',
    firstName: 'Wes',
    lastName: 'Okonjo',
    age: 26,
    gender: 'male',
    householdId: 'hh-juniper',
    job: {
      title: 'Clerk',
      workplaceId: 'maple-311', // Red Rocket Records
      days: [0, 3, 4, 5, 6],
      startHour: 11,
      endHour: 19,
    },
    balance: 210,
    appearance: {
      skin: '#5a3d2b',
      hair: '#1a1512',
      hairStyle: 'short',
      shirt: '#8e2f28', // band tee
      pants: '#2b3038',
      shoes: '#d8d2c4',
      height: 1.01,
      build: 0.97,
    },
    persona:
      'Behind the counter at Red Rocket, where he would work for free and very nearly does. Encyclopedic about records, hopeless about rent, permanently three days from broke. Treats every conversation as an opening to recommend something.',
    voice: 'Enthusiastic and tangential. Name-drops bands nobody asked about.',
    arrivedDay: 0,
  },
  {
    id: 'ines-vidal',
    firstName: 'Ines',
    lastName: 'Vidal',
    age: 28,
    gender: 'female',
    householdId: 'hh-juniper',
    job: {
      title: 'Overnight attendant',
      workplaceId: 'main-115', // Gas & Go
      days: [0, 1, 2, 3, 4],
      startHour: 22,
      endHour: 6,
    },
    balance: 3150,
    appearance: {
      skin: '#c99a72',
      hair: '#2a211c',
      hairStyle: 'long',
      shirt: '#39506b', // station polo
      pants: '#2a2f38',
      shoes: '#2e2b28',
      height: 0.97,
      build: 1.0,
    },
    persona:
      'Works the overnight register at Gas & Go, which means she sees the town at its least guarded — who is driving at three in the morning, who is buying what, who is not going home. Sleeps through the afternoon. Says almost nothing and forgets nothing.',
    voice: 'Flat and brief, occasionally devastating. Answers the question asked, not the one implied.',
    arrivedDay: 0,
  },
  {
    id: 'harriet-blum',
    firstName: 'Harriet',
    lastName: 'Blum',
    age: 61,
    gender: 'female',
    householdId: 'hh-blum',
    job: {
      title: 'Owner',
      workplaceId: 'maple-315', // Blue Harbor Books
      days: [0, 2, 3, 4, 5, 6],
      startHour: 10,
      endHour: 18,
    },
    balance: 14500,
    appearance: {
      skin: '#e8c4a0',
      hair: '#c9c4bd', // gone grey
      hairStyle: 'thin',
      shirt: '#7a5f86', // cardigan
      pants: '#4a4250',
      shoes: '#3b3530',
      height: 0.95,
      build: 1.04,
    },
    persona:
      'Has owned Blue Harbor Books for twenty-six years. Widowed nine, and has arranged her life so that the shop is where people come to her rather than the other way round. The closest thing the town has to a historian: she remembers who lived in your house before you did.',
    voice: 'Unhurried and wry. Fond of the long way round to a point.',
    arrivedDay: 0,
  },
]

// ---------- ties beyond the household ----------
// Spouse and roommate ties are implied by HOUSEHOLDS and derived below; only
// relationships that cross households are seeded here. Friendships that form
// from play are recorded by the sim, not added to this list by hand.

export const SEEDED_RELATIONSHIPS: Relationship[] = [
  {
    a: 'harriet-blum',
    b: 'nadia-ilori',
    kind: 'friend',
    note: 'Thursday-evening chess at the bookshop, going on six years.',
  },
  {
    a: 'marcus-ilori',
    b: 'theo-brandt',
    kind: 'friend',
    note: 'The Bluebird buys its produce from the Green Grocer. The standing order is also a standing conversation.',
  },
  {
    a: 'wes-okonjo',
    b: 'harriet-blum',
    kind: 'friend',
    note: 'She lets him tape gig flyers in the window; she pretends not to notice him reading on the clock.',
  },
  {
    a: 'ines-vidal',
    b: 'marcus-ilori',
    kind: 'friend',
    note: 'She comes off the overnight shift as he is opening. Most mornings she is his first customer.',
  },
  {
    a: 'priya-raman-brandt',
    b: 'harriet-blum',
    kind: 'friend',
    note: 'Harriet keeps recommending books about people who quit their jobs. Priya keeps buying them.',
  },
]

// ---------- lookups ----------

export function getResident(id: string): Resident | undefined {
  return RESIDENTS.find((r) => r.id === id)
}

export function getHousehold(id: string): Household | undefined {
  return HOUSEHOLDS.find((h) => h.id === id)
}

export function fullName(r: Resident): string {
  return `${r.firstName} ${r.lastName}`
}

/** The building a resident lives in. */
export function homeOf(r: Resident): BuildingEntry | undefined {
  const hh = getHousehold(r.householdId)
  return hh ? getBuilding(hh.homeId) : undefined
}

/** The building a resident works in. */
export function workplaceOf(r: Resident): BuildingEntry | undefined {
  return getBuilding(r.job.workplaceId)
}

export function residentsOf(householdId: string): Resident[] {
  return RESIDENTS.filter((r) => r.householdId === householdId)
}

/** Everyone living at a given building id. Empty for an unoccupied house. */
export function residentsAt(buildingId: string): Resident[] {
  const hh = HOUSEHOLDS.filter((h) => h.homeId === buildingId)
  return hh.flatMap((h) => residentsOf(h.id))
}

/** Everyone who works at a given building id. */
export function staffOf(buildingId: string): Resident[] {
  return RESIDENTS.filter((r) => r.job.workplaceId === buildingId)
}

// ---------- shifts ----------
// Time is measured in minutes-of-week: 0 is Sunday 00:00, 10080 wraps back to
// it. A shift is one [start, end) window; an overnight shift simply has an end
// past the day boundary, so nothing special-cases midnight.

export const WEEK_MINUTES = 7 * 24 * 60

export interface ShiftSpan {
  /** minutes of week */
  start: number
  /** minutes of week; may run past WEEK_MINUTES for an overnight shift */
  end: number
}

/** Every shift a resident works in a week. */
export function shiftSpans(r: Resident): ShiftSpan[] {
  const { days, startHour, endHour } = r.job
  const lengthHours = endHour > startHour ? endHour - startHour : endHour + 24 - startHour
  return days.map((d) => {
    const start = d * 1440 + startHour * 60
    return { start, end: start + lengthHours * 60 }
  })
}

/**
 * True when minute-of-week `t` falls inside [start, end). Start and end may run
 * past the end of the week; the comparison wraps, so a Saturday-night shift
 * spilling into Sunday morning works without a special case.
 */
export function inWeekWindow(t: number, start: number, end: number): boolean {
  const length = end - start
  if (length <= 0) return false
  const wrap = (n: number) => ((n % WEEK_MINUTES) + WEEK_MINUTES) % WEEK_MINUTES
  return wrap(wrap(t) - wrap(start)) < length
}

/** True while the resident is on the clock at this minute of the week. */
export function isOnShiftAt(r: Resident, minuteOfWeek: number): boolean {
  return shiftSpans(r).some((s) => inWeekWindow(minuteOfWeek, s.start, s.end))
}

/** True while the shift covers this hour, handling overnight shifts. */
export function isOnShift(r: Resident, day: number, hour: number): boolean {
  return isOnShiftAt(r, day * 1440 + hour * 60)
}

/** Every relationship a resident has, household ties included. */
export function relationshipsOf(id: string): Relationship[] {
  return allRelationships().filter((rel) => rel.a === id || rel.b === id)
}

/** Household ties (spouse/roommate) derived from HOUSEHOLDS, plus the seeded ones. */
export function allRelationships(): Relationship[] {
  const derived: Relationship[] = []
  for (const hh of HOUSEHOLDS) {
    if (hh.kind === 'solo') continue
    const kind: RelationKind = hh.kind === 'couple' ? 'spouse' : 'roommate'
    for (let i = 0; i < hh.memberIds.length; i++) {
      for (let j = i + 1; j < hh.memberIds.length; j++) {
        derived.push({ a: hh.memberIds[i], b: hh.memberIds[j], kind })
      }
    }
  }
  return [...derived, ...SEEDED_RELATIONSHIPS]
}

// ---------- growth ----------
// The town is meant to fill in over time. These are the questions the sim asks
// when someone moves in, a couple gets a place of their own, or a household
// splits up.

/** House building ids currently claimed by a household. */
export function occupiedHomeIds(): string[] {
  return HOUSEHOLDS.map((h) => h.homeId)
}

/** Houses standing empty — the housing stock a new household can move into. */
export function vacantHomes(): BuildingEntry[] {
  const taken = new Set(occupiedHomeIds())
  return BUILDINGS.filter((b) => b.kind === 'house' && !taken.has(b.id))
}

/** True when every house is spoken for and the town has to build to grow. */
export function needsNewHousing(): boolean {
  return vacantHomes().length === 0
}

/** Businesses with no one on staff — open roles for a resident who moves in. */
export function unstaffedBusinesses(): BuildingEntry[] {
  return BUILDINGS.filter((b) => b.kind !== 'house' && staffOf(b.id).length === 0)
}

// ---------- validation ----------

/**
 * Consistency check over the cast. Returns a list of problems, empty when the
 * data is sound. Cheap enough to call from a test or a dev-time assertion.
 */
export function validateResidents(): string[] {
  const problems: string[] = []
  const residentIds = new Set<string>()
  const householdIds = new Set(HOUSEHOLDS.map((h) => h.id))

  for (const r of RESIDENTS) {
    if (residentIds.has(r.id)) problems.push(`duplicate resident id: ${r.id}`)
    residentIds.add(r.id)

    if (!householdIds.has(r.householdId)) {
      problems.push(`${r.id} belongs to unknown household ${r.householdId}`)
    }
    if (!getBuilding(r.job.workplaceId)) {
      problems.push(`${r.id} works at unknown building ${r.job.workplaceId}`)
    }
    if (r.job.days.some((d) => d < 0 || d > 6)) {
      problems.push(`${r.id} has a day outside 0-6`)
    }
  }

  const claimedHomes = new Set<string>()
  for (const hh of HOUSEHOLDS) {
    const home = getBuilding(hh.homeId)
    if (!home) {
      problems.push(`household ${hh.id} lives at unknown building ${hh.homeId}`)
    } else if (home.kind !== 'house') {
      problems.push(`household ${hh.id} lives at ${addressOf(home)}, which is not a house`)
    }
    if (claimedHomes.has(hh.homeId)) {
      problems.push(`two households claim ${hh.homeId}`)
    }
    claimedHomes.add(hh.homeId)

    if (hh.memberIds.length === 0) problems.push(`household ${hh.id} has no members`)
    if (hh.kind === 'solo' && hh.memberIds.length !== 1) {
      problems.push(`solo household ${hh.id} has ${hh.memberIds.length} members`)
    }
    if (hh.kind === 'couple' && hh.memberIds.length !== 2) {
      problems.push(`couple household ${hh.id} has ${hh.memberIds.length} members`)
    }
    for (const id of hh.memberIds) {
      if (!residentIds.has(id)) {
        problems.push(`household ${hh.id} lists unknown resident ${id}`)
      } else if (getResident(id)!.householdId !== hh.id) {
        problems.push(`${id} is listed in ${hh.id} but points at ${getResident(id)!.householdId}`)
      }
    }
  }

  for (const rel of SEEDED_RELATIONSHIPS) {
    if (!residentIds.has(rel.a)) problems.push(`relationship names unknown resident ${rel.a}`)
    if (!residentIds.has(rel.b)) problems.push(`relationship names unknown resident ${rel.b}`)
    if (rel.a === rel.b) problems.push(`${rel.a} is in a relationship with themself`)
  }

  return problems
}
