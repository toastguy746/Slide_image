import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { code } = req.query;
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ error: '잘못된 번호' });
  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const photos = (data?.photos || []).map(p => ({ url: String(p.url), name: String(p.name || '') }));
    if (!photos.length) return res.status(400).json({ error: '사진이 없어요' });

    // 사진 순서를 그대로 담은 목록 파일
    await put(`rooms/${code}/manifest.json`, JSON.stringify({ photos }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}