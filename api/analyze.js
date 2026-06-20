module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const msg = (body.messages || [])[0] || {};

    const parts = (msg.content || []).map(block => {
      if (block.type === 'image') {
        return { inline_data: { mime_type: block.source.media_type, data: block.source.data } };
      }
      return { text: block.text || '' };
    });

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: body.max_tokens || 1000 },
        }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(upstream.status).json(data);
    }

    const text = ((data.candidates || [])[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('');

    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    console.error('analyze error:', e.message);
    return res.status(502).json({ error: e.message });
  }
};
