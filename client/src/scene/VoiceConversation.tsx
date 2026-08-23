// Walk up to a resident, they greet you; walk away, the conversation ends.
// No separate page, no picking who to talk to — proximity to a resident who
// actually has a brain online (server/) is the only trigger. Mirrors how
// InteractionSystem tracks the closest person each frame, but owns its own
// distance thresholds and a full greet -> listen -> reply loop instead of
// just a look-at card.

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RESIDENTS, fullName } from '../city/residents'
import { getInterior } from '../city/interiors'
import { nowTownTime } from '../sim/clock'
import { indoorPositionOf, outdoorPositionOf } from '../sim/presence'
import type { Mode } from './InteractionSystem'
import { talkableResidents, greet, chat, type ResidentSummary } from '../voice/brainClient'

const TALK_DIST = 3.2
// bigger than TALK_DIST on purpose — ends the conversation once you've
// actually walked off, not the instant you edge past the trigger radius
const LEAVE_DIST = 5.5

export type VoiceStatus = 'greeting' | 'listening' | 'thinking' | 'speaking' | 'unavailable'

export interface VoiceState {
  residentId: string
  residentName: string
  status: VoiceStatus
  lastLine: { speaker: 'you' | 'them'; text: string } | null
}

function getVisitorId(): string {
  let id = localStorage.getItem('simtown_visitor_name')
  if (!id) {
    id = (window.prompt('What should residents call you?') || 'a visitor').trim() || 'a visitor'
    localStorage.setItem('simtown_visitor_name', id)
  }
  return id
}

// the Web Speech API has no DOM-lib typings; declare just what's used here
interface SpeechRecognitionResultEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: SpeechRecognitionResultEvent) => void) | null
  onerror: ((e: unknown) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export default function VoiceConversation({
  mode,
  onStateChange,
}: {
  mode: Mode
  onStateChange: (s: VoiceState | null) => void
}) {
  const camera = useThree((s) => s.camera)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const [talkable, setTalkable] = useState<ResidentSummary[]>([])
  useEffect(() => {
    talkableResidents().then(setTalkable)
  }, [])
  const talkableRef = useRef(talkable)
  talkableRef.current = talkable

  const accum = useRef(0)
  const activeIdRef = useRef<string | null>(null)
  const cancelledRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const setState = (s: VoiceState | null) => onStateChange(s)

  const stopListening = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }

  const endConversation = () => {
    cancelledRef.current = true
    speechSynthesis.cancel()
    stopListening()
    activeIdRef.current = null
    setState(null)
  }

  const speak = (text: string) =>
    new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(text)
      utter.onend = () => resolve()
      utter.onerror = () => resolve()
      speechSynthesis.speak(utter)
    })

  const startListening = (residentId: string, residentName: string) => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = async (e) => {
      if (cancelledRef.current || activeIdRef.current !== residentId) return
      const transcript = e.results[0][0].transcript
      setState({ residentId, residentName, status: 'thinking', lastLine: { speaker: 'you', text: transcript } })
      try {
        const { reply } = await chat(residentId, getVisitorId(), transcript)
        if (cancelledRef.current || activeIdRef.current !== residentId) return
        setState({ residentId, residentName, status: 'speaking', lastLine: { speaker: 'them', text: reply } })
        await speak(reply)
      } catch {
        if (cancelledRef.current || activeIdRef.current !== residentId) return
        setState({
          residentId,
          residentName,
          status: 'speaking',
          lastLine: { speaker: 'them', text: '(missed that)' },
        })
      }
      if (cancelledRef.current || activeIdRef.current !== residentId) return
      setState({ residentId, residentName, status: 'listening', lastLine: null })
      startListening(residentId, residentName)
    }
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const startConversation = async (residentId: string, residentName: string) => {
    cancelledRef.current = false
    activeIdRef.current = residentId
    setState({ residentId, residentName, status: 'greeting', lastLine: null })
    try {
      const { reply } = await greet(residentId, getVisitorId())
      if (cancelledRef.current || activeIdRef.current !== residentId) return
      setState({ residentId, residentName, status: 'speaking', lastLine: { speaker: 'them', text: reply } })
      await speak(reply)
      if (cancelledRef.current || activeIdRef.current !== residentId) return
      setState({ residentId, residentName, status: 'listening', lastLine: null })
      startListening(residentId, residentName)
    } catch {
      if (cancelledRef.current || activeIdRef.current !== residentId) return
      setState({ residentId, residentName, status: 'unavailable', lastLine: null })
    }
  }

  useFrame((_, delta) => {
    accum.current += delta
    if (accum.current < 0.15) return
    accum.current = 0

    const ids = new Set(talkableRef.current.map((r) => r.id))
    if (ids.size === 0) return

    const px = camera.position.x
    const pz = camera.position.z
    const m = modeRef.current
    const town = nowTownTime()

    let closest: { id: string; name: string; d: number } | null = null
    for (const r of RESIDENTS) {
      if (!ids.has(r.id)) continue
      const at = m.view === 'city' ? outdoorPositionOf(r, town) : indoorPositionOf(r, town, m.id, getInterior(m.id))
      if (!at) continue
      const d = Math.hypot(at.x - px, at.z - pz)
      if (!closest || d < closest.d) closest = { id: r.id, name: fullName(r), d }
    }

    const active = activeIdRef.current
    if (!active) {
      if (closest && closest.d < TALK_DIST) startConversation(closest.id, closest.name)
      return
    }
    const activeDist = closest && closest.id === active ? closest.d : Infinity
    if (activeDist > LEAVE_DIST) endConversation()
  })

  useEffect(() => endConversation, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
