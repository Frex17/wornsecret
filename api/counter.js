const SUPABASE_URL = 'https://bnbdzumwxubrwtxgfvyp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json'
  };

  if (req.method === 'GET') {
    // Get current count
    const r = await fetch(SUPABASE_URL + '/rest/v1/counter?select=value&limit=1', { headers });
    const d = await r.json();
    return res.json({ value: d[0] ? d[0].value : 0 });
  }

  if (req.method === 'POST') {
    // Increment via RPC
    const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/increment_counter', {
      method: 'POST', headers, body: JSON.stringify({})
    });
    const val = await r.json();
    return res.json({ value: val });
  }

  res.status(405).end();
}
