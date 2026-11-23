import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const { code } = req.query;
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ error: '4자리 숫자를 입력해 주세요.' });
  try {
    const { blobs } = await list({ prefix: `rooms/${code}/manifest` });
    if (!blobs.length) return res.status(404).json({ error: '해당 번호로 배포된 사진이 없어요.' });

    // 같은 번호로 여러 번 올라왔다면 가장 최근 것 사용
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const r = await fetch(blobs[0].url);
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
