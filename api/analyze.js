module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-haiku-4-5-20251001',
        max_tokens: body.max_tokens || 1000,
        messages: body.messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return res.status(upstream.status).json(data);
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error('analyze error:', e.message);
    return res.status(502).json({ error: e.message });
  }
};
