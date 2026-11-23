import { put } from '@vercel/blob';

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { code, i } = req.query;
  if (!/^\d{4}$/.test(code) || !/^\d{1,4}$/.test(i)) {
    return res.status(400).json({ error: '잘못된 요청' });
  }
  try {
    const body = await readBody(req);
    const blob = await put(`rooms/${code}/img-${i}.jpg`, body, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}