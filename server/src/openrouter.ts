// Server-only OpenRouter client. The API key never leaves this process —
// SimTown's hard rule is that the browser never talks to an LLM provider
// directly (SPEC.md §2).

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Player/visitor conversations use a stronger paid-tier model. NPC-to-NPC
// chatter (residents talking to each other, unprompted by a human) uses free
// models instead — SPEC.md §11 budgets conversation generation, and
// background town chatter is exactly the kind of volume that should cost
// nothing. Free models on OpenRouter share a public capacity pool and 429
// under load fairly often, so this tier tries a short list of them in order
// and falls through to the next on failure, rather than pinning to a single
// model or hanging on retries — a 20s timeout per attempt keeps a stuck
// upstream from blocking the scheduler.
export type ModelTier = 'default' | 'free'

function freeModelFallbacks(): string[] {
  return [
    process.env.OPENROUTER_FREE_MODEL || 'z-ai/glm-5.2:free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
  ]
}

async function callModel(model: string, messages: ChatMessage[], apiKey: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://simtown.local',
      'X-Title': 'SimTown',
    },
    body: JSON.stringify({ model, messages, temperature: 0.8 }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const body = await res.text()
    const err = new Error(`OpenRouter request failed (${res.status}) for ${model}: ${body}`) as Error & {
      status?: number
    }
    err.status = res.status
    throw err
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error(`OpenRouter response had no content for ${model}: ${JSON.stringify(data)}`)
  }
  return content.trim()
}

export async function chatCompletion(messages: ChatMessage[], tier: ModelTier = 'default'): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Copy server/.env.example to server/.env and fill it in.',
    )
  }

  if (tier === 'default') {
    const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash'
    return callModel(model, messages, apiKey)
  }

  const attempts: string[] = []
  for (const model of freeModelFallbacks()) {
    try {
      return await callModel(model, messages, apiKey)
    } catch (err) {
      attempts.push(`${model}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  throw new Error(`All free models exhausted:\n${attempts.join('\n')}`)
}
