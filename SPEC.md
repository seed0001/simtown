# SimTown — Specification

An immersive, persistent, multiplayer 3D town where every resident is an
AI-driven person with a persona, a memory, a job, a bank account, and a
place in a living economy — and where logging in means *becoming* one of
them.

Everything in this document was agreed in conversation with Travis.
Items marked **PROPOSAL** or listed under Open Questions are not yet
decided and need sign-off before being built.

---

## 1. Vision

- A thriving small city that is an **ecosystem**: every person has a job
  or role that feeds the ecosystem, and every building plays a role in
  it. Nothing is decorative.
- **Emergent, not scripted.** No static daily rules. What happened
  yesterday shapes what residents do tomorrow.
- **The world never stops.** The simulation runs continuously
  server-side whether or not anyone is connected. Log in after three
  days away and three days of town history happened without you.
- **Deeply immersive 3D** — first-person, walkable streets, enterable
  buildings, real addresses (already built), plus weather and scenarios
  that happen *to* the town.

## 2. Hard Rules (server-enforced, non-negotiable)

1. **Kids are protected.** Child NPCs can never be ported into, never
   harmed, and no bad interactions toward them are possible. This is
   enforced in server logic, not left to prompts or client checks.
2. **No client-side secrets.** The OpenRouter key lives only on the
   server (Railway environment variables). The browser never talks to
   OpenRouter directly.
3. **The server is the authority** on time, positions, money, memory,
   and world state. The client renders and sends input.

## 3. Architecture

| Piece | Decision |
| --- | --- |
| Deployment | **Railway** |
| Client | Existing React Three Fiber app (kept), becomes a networked view/controller |
| Server | New server in this repo: runs the persistent simulation, owns all state, proxies all LLM calls |
| LLM access | **OpenRouter**, server-side only; model choices configurable per task (dialogue vs planning vs director) |
| Realtime | WebSockets between client and server (multiplayer positions, chat, world events) |
| Persistence | Server-side storage on Railway so memories/accounts survive deploys — Postgres vs. volume: **open question** |

### What the LLM does — and does not — do

- LLM **does**: speak as residents (player chat), generate NPC-to-NPC
  conversations, write each resident's next-day plan overnight, and act
  as the Town Director.
- LLM **does not**: make real-time decisions during the day. Daytime is
  deterministic execution of the current plan. This is the primary
  credit-cost control.

## 4. The Daily Loop

1. **Daytime — execution.** Every resident carries out today's plan:
   where to be, when, doing what. Movement, work, purchases, and
   encounters are simulated deterministically. No tokens spent on
   walking to work.
2. **Everything is recorded.** Conversations, purchases, encounters,
   weather, a slow day at the shop, a skipped shift — all become events
   in the residents' memory logs.
3. **Overnight — planning.** For each resident, the LLM receives their
   persona + yesterday's events + account balance + relevant town state
   and produces tomorrow's plan, plus distilled lasting memories.
   Yesterday writes tomorrow: a broke resident picks up extra work; a
   shopkeeper with two dead days plans a sidewalk sale.

## 5. Residents

- **The town starts small and grows.** Rather than seeding a full city,
  launch with a **founding cast** and let the population expand as the
  sim runs: residents move in, households form and split, and couples
  get places of their own. New arrivals need housing, so the **map
  grows with the population** (§10).
- **Founding cast — 7 adults across 4 households** (built, in
  `client/src/city/residents.ts`):
  - 2 married couples (4 adults) — the relationship core and the
    source of future children
  - 1 roommate pair (2 adults)
  - 1 solo resident (1 adult)
- **22 adults across 12 households** is the shape the town grows
  *toward*, not a launch requirement. Six of the ten existing houses
  start vacant; when they fill, the town has to build.
- Every adult has: a **persona** (who they are, how they talk), a
  **memory** (persistent, event-sourced, distilled nightly), a **job**
  with a real workplace address, a **home** address, a **bank account**,
  and **relationships** (spouse, roommates, friendships that form from
  interactions).
- NPC-to-NPC conversations are LLM-generated when residents cross
  paths; both parties remember them, so gossip and relationships
  propagate and influence future plans.
- The adult cast (names, personas, marriages, who lives where, who
  works where) is designed **with Travis** — never invented
  unilaterally. The founding seven are built and awaiting his review;
  everyone after them arrives through town history.

### Kids

- The town launches **childless**. Children are **born over time** to
  resident couples because the sim decided they were — town history,
  not seed data.
- Kids are full hard-rule protected (see §2).
- **PROPOSAL:** kids age slowly over long-running town history. Whether
  and how fast is undecided.

### Travelers

- Non-portable visitor NPCs pass through town (arriving, spending,
  leaving). They are the economy's **external money inflow** — a closed
  town economy is zero-sum; travelers buying gas, meals, and motel
  rooms inject fresh cash.

## 6. Players: Porting Into Residents

- **Accounts.** Players log in with a persistent account.
- On login you choose **male or female**, and the server assigns you a
  **random** adult resident of that gender. You do not choose which.
- Your account shows the **history of past residents** you've ported
  into.
- **You take over their whole life**: body, house, spouse, job, bank
  account, and today's plan becomes your to-do list.
- **The handoff cuts both ways.** While you drive, your actions are
  recorded as that resident's experiences. When you log off, the AI
  resumes mid-stream, remembering "their" day — which was actually
  yours. Skip your shift and blow the grocery money, and the overnight
  planner, your spouse, and the town react.
- **Multiplayer capacity = adult population**, so capacity grows as the
  town does — 7 at founding, 22 at full build-out. Each human inhabits
  a different resident, visible to the others in-world.

## 7. Economy

- **Every adult resident and every building has an account.** Money
  really moves: wages flow from employer accounts to workers; purchases
  flow back (lunch at the diner debits the buyer and credits the
  Bluebird; the Bluebird buys produce from the Green Grocer).
- A closed, auditable loop with **traveler spending as external
  inflow**.
- Every building has an economic role: shops sell, the diner feeds the
  lunch rush, offices pay salaries, the gas station and motel capture
  traveler money, civic buildings are publicly funded.
- **Open question:** business ownership by residents and rent/operating
  costs — include at launch, or add after the core loop is proven.

## 8. Jobs & Minigames

- Jobs are **real, detailed minigames** — multi-step, press-E-and-do-
  the-work interactions, not standing decoratively at a counter:
  grill and serve orders at the diner, ring up and stock the grocery,
  run the gas station register, and so on.
- Doing the job well or badly moves **real money** in the economy.
- Job roster spans **regular jobs** (grocery, diner, shops, offices)
  and **civic jobs** (police officer, city worker), plus roles like the
  motel keeper. Full roster is designed with the cast (§5).

## 9. Town Director

- An **LLM Town Director** runs **once per game day**. It reads the
  state of the town and authors what happens next: weather, storm
  damage, a stranger rolling through, scenario events.
- Director events feed directly into the world (damage, closures,
  visitors) and into residents' plans and memories.

## 10. The Map

The existing town (10 houses, 4 shops, diner, gas station, 5 offices,
6 named streets, enterable interiors) is kept and **expanded**:

- **+2 houses** (12 households for 22 adults)
- **Police station** (police officer job)
- **City hall** (city worker job, civic anchor)
- **Motel** (travelers stay and spend)
- **Simtown Municipal Airport** — east of Birch Street, at the end of
  Main Street. A single north-south strip, apron, helipad, hangar,
  control tower, and an enterable terminal at **130 Main Street**.
  Light aircraft and helicopters arrive, park, and depart on a fixed
  daily schedule (~3 movements a day) driven by the town clock, so it
  costs no tokens. **Scenery for now**: nobody works there and nobody
  gets off the aircraft. It is the obvious arrival point for the
  travelers in §5 once they exist.
- **School — built.** Simtown Public School sits on the south edge of
  town at 1 Central Boulevard, a big K–12 block with one classroom per
  grade. Unlike other buildings it has no 3D interior: its door opens a
  separate website (`client/public/school/`) — a directory hub plus a
  page per classroom. The rooms stand empty for now (the town launches
  childless); this is the first address to use the generic `link` field
  on a building, the intended pattern for turning any address into its
  own site.

## 11. Cost Controls (credits are a first-class constraint)

- Daytime simulation burns **zero** tokens.
- One planning call per adult per game night; one director call per
  game day.
- NPC-to-NPC conversation generation is budgeted (not every crossing
  needs a full generated exchange).
- Model tiers are configurable per task via OpenRouter — cheap models
  for ambient chatter, stronger models for planning/director.

## 12. Open Questions (need Travis's call before or during build)

1. Cast & personas: workshop the 22 adults together (names, marriages,
   homes, jobs, personalities).
2. Kid aging: yes/no and speed (§5 PROPOSAL).
3. Business ownership + rent at launch vs. later (§7).
4. Persistence tech on Railway: Postgres vs. volume-backed store.
5. Which OpenRouter models for each task tier.
6. Conversation budget numbers (how many generated NPC-NPC exchanges
   per day).
7. Behavior boundaries for players beyond the kid hard-rules (what
   anti-social play is allowed toward adults, and how the town responds).

## 13. Build Phases — PROPOSAL (order of construction, for discussion)

1. **Server skeleton + persistent clock/world state** on Railway;
   client connects, sees the shared town and time.
2. **Residents in the world**: cast seeded, deterministic schedules
   executing, walking commutes, buildings occupied. (No LLM yet.)
   *Standing in client-side as a placeholder* — bodies, a town clock,
   home/work presence and commutes all run in the browser today
   (`client/src/sim/`). Step 1 replaces that clock and those positions
   with the server's; the placeholder is written to be deleted, not
   extended.
3. **Economy rails**: accounts, wages, purchases, traveler inflow.
4. **LLM layer**: personas + player chat, then NPC-NPC conversations,
   then the overnight planner, then the Town Director.
5. **Porting**: login accounts, gender pick, random assignment,
   possession/handoff both ways, multiplayer visibility.
6. **Job minigames**, iterating job by job.
7. **Map expansion + civic jobs + weather/scenarios.**
8. **Kids** (births, protections already enforced from day one).

No phase starts without an explicit go-ahead (see CLAUDE.md standing
rule).
