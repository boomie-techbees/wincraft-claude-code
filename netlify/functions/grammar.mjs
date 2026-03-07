const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const RATE_LIMIT = 30;
const RATE_WINDOW = 15 * 60 * 1000;
const requests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  requests.set(ip, recent);
  if (requests.size > 1000) {
    for (const [key, times] of requests) {
      const valid = times.filter(t => now - t < RATE_WINDOW);
      if (valid.length === 0) requests.delete(key);
      else requests.set(key, valid);
    }
  }
  return true;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('client-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid input. Text must be a string under 5000 characters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: `You are a helpful spelling and grammar checker. The user will provide text describing a personal achievement or "win". Check it for spelling errors, grammar issues, and awkward phrasing. Return your response as JSON with this exact structure:
{
  "hasSuggestions": boolean,
  "correctedText": "the corrected version of the text (or the original if no changes needed)",
  "suggestions": ["list of specific changes you made and why"]
}
Only return the JSON object, no other text.`,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.content[0].text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '');
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Grammar function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
