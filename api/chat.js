// Vercel serverless function. Picks the best configured AI and keeps keys server-side.
// Priority: Claude (ANTHROPIC_API_KEY) > Gemini (GEMINI_API_KEY). Both optional.
const SYS = `You are the Meridian Capital assistant, a friendly educator on personal finance in Canada (TFSA, RRSP, FHSA, RESP, RRIF, ETFs, stocks, funds, GICs, CPP/OAS, students, newcomers, seniors, fraud safety). Be concise and accurate, state 2026 limits only if sure (TFSA $7,000; RRSP $33,810; FHSA $8,000/yr, $40,000 lifetime; max CPP at 65 $1,507.65/month; max OAS Oct-Dec 2026 $762.50 for 65-74 and $838.75 for 75+; Bank of Canada policy rate 2.50% as of Oct 28 2026; Canada CPI inflation 3.1% in Oct 2026; 2026 federal brackets 14% to $58,523, 20.5% to $117,045, 26% to $181,440, 29% to $258,482, 33% above; basic personal amount $16,452), tell users to verify on canada.ca or CRA My Account, never give personalized investment, tax or legal advice, and suggest booking an advisor for personal decisions.`;
const CLAUDE = (process.env.CLAUDE_MODEL ? [process.env.CLAUDE_MODEL] : ['claude-fable-5-2', 'claude-opus-5-5', 'claude-sonnet-5-5']);
const GEMINI = (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-flash-latest', 'gemini-3-flash-preview', 'gemini-2.5-flash']);

async function claude(key, msgs) {
  for (const model of CLAUDE) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 700, system: SYS, messages: msgs })
    });
    if (!r.ok) continue;
    const d = await r.json();
    const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    if (text) return { reply: text, provider: 'Claude', model };
  }
  return null;
}
async function gemini(key, msgs) {
  const contents = msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
  for (const model of GEMINI) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents })
    });
    if (!r.ok) continue;
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.map(p => p.text).join('');
    if (text) return { reply: text, provider: 'Gemini', model };
  }
  return null;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ck = process.env.ANTHROPIC_API_KEY, gk = process.env.GEMINI_API_KEY;
  if (!ck && !gk) return res.status(503).json({ error: 'No AI key set' });
  let msgs = (req.body?.messages || []).slice(-10).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.text || '').slice(0, 2000)
  }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();   // must start with a user turn
  msgs = msgs.filter((m, i) => !i || m.role !== msgs[i - 1].role); // must alternate
  if (!msgs.length) return res.status(400).json({ error: 'No message' });
  try {
    const out = (ck && await claude(ck, msgs)) || (gk && await gemini(gk, msgs));
    if (!out) return res.status(502).json({ error: 'AI unavailable' });
    res.status(200).json(out);
  } catch (e) { res.status(500).json({ error: 'Request failed' }); }
}



