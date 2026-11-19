// Live public data from the Bank of Canada Valet API (no key needed).
const S = { policyRate: 'V39079', usdcad: 'FXUSDCAD', eurcad: 'FXEURCAD' };
export default async function handler(req, res) {
  try {
    const out = {};
    await Promise.all(Object.entries(S).map(async ([k, id]) => {
      const r = await fetch(`https://www.bankofcanada.ca/valet/observations/${id}/json?recent=1`);
      const o = (await r.json()).observations?.[0];
      out[k] = { value: +o[id].v, date: o.d };
    }));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ ...out, source: 'Bank of Canada Valet API' });
  } catch (e) { res.status(502).json({ error: 'unavailable' }); }
}
