import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getBrain, AVAILABLE_RESIDENT_IDS } from './residents/index.ts'
import { converse } from './social/converse.ts'
import { ENCOUNTER_RULES } from './social/encounters.ts'
import { startScheduler } from './social/scheduler.ts'
import { nowTownTime, formatTownTime } from './towndata/sim/clock.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json())
app.use(express.static(join(__dirname, '..', 'public')))

app.get('/api/residents', (_req, res) => {
  res.json(AVAILABLE_RESIDENT_IDS.map((id) => ({ id, name: getBrain(id).name })))
})

app.post('/api/chat', async (req, res) => {
  const { residentId, visitorId, message } = req.body ?? {}
  if (typeof residentId !== 'string' || !AVAILABLE_RESIDENT_IDS.includes(residentId)) {
    return res.status(400).json({ error: `residentId must be one of: ${AVAILABLE_RESIDENT_IDS.join(', ')}` })
  }
  if (typeof visitorId !== 'string' || !visitorId.trim()) {
    return res.status(400).json({ error: 'visitorId is required' })
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }
  try {
    const reply = await getBrain(residentId).chat(visitorId.trim(), message.trim())
    res.json({ reply })
  } catch (err) {
    console.error('[chat] failed:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

// two residents talk to each other, unprompted — free-tier model, both sides remember it afterward
app.post('/api/converse', async (req, res) => {
  const { a, b, exchanges } = req.body ?? {}
  if (typeof a !== 'string' || !AVAILABLE_RESIDENT_IDS.includes(a)) {
    return res.status(400).json({ error: `a must be one of: ${AVAILABLE_RESIDENT_IDS.join(', ')}` })
  }
  if (typeof b !== 'string' || !AVAILABLE_RESIDENT_IDS.includes(b)) {
    return res.status(400).json({ error: `b must be one of: ${AVAILABLE_RESIDENT_IDS.join(', ')}` })
  }
  if (a === b) {
    return res.status(400).json({ error: 'a and b must be different residents' })
  }
  try {
    const transcript = await converse(getBrain(a), getBrain(b), typeof exchanges === 'number' ? exchanges : 3)
    res.json({ transcript })
  } catch (err) {
    console.error('[converse] failed:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

// debug/proof endpoint — the actual numeric state behind whatever a resident just said
app.get('/api/state/:residentId', (req, res) => {
  if (!AVAILABLE_RESIDENT_IDS.includes(req.params.residentId)) {
    return res.status(404).json({ error: `unknown resident ${req.params.residentId}` })
  }
  res.json(getBrain(req.params.residentId).describeState())
})

// debug endpoint — what the scheduler sees right now, without waiting real minutes for a window to open
app.get('/api/encounters', (_req, res) => {
  const t = nowTownTime()
  res.json({
    townTime: formatTownTime(t),
    rules: ENCOUNTER_RULES.map((rule) => ({
      a: rule.a,
      b: rule.b,
      reason: rule.reason,
      activeRightNow: rule.isActive(t),
    })),
  })
})

const port = Number(process.env.PORT) || 8787
app.listen(port, () => {
  console.log(`SimTown resident-brain server listening on http://localhost:${port}`)
  startScheduler()
})
