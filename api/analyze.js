export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    // Translate Anthropic-format request body → Gemini format
    const msg = (req.body.messages || [])[0] || {};
    const parts = (msg.content || []).map(block => {
      if (block.type === 'image') {
        return { inline_data: { mime_type: block.source.media_type, data: block.source.data } };
      }
      return { text: block.text || '' };
    });

    const geminiBody = {
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: req.body.max_tokens || 1000 },
    };

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    // Translate Gemini response → Anthropic format so the client code needs no changes
    const text = ((data.candidates || [])[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('');

    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    return res.status(502).json({ error: 'Upstream request failed', detail: e.message });
  }
}
