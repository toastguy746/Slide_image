import { list, del } from '@vercel/blob';

const TTL_MS = 24 * 60 * 60 * 1000; // 배포한 번호는 24시간 유지

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    for (let tries = 0; tries < 40; tries++) {
      const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const { blobs } = await list({ prefix: `rooms/${code}/` });
      if (blobs.length === 0) return res.status(200).json({ code });

      // 이미 쓰인 번호라도 24시간이 지났으면 지우고 재사용
      const newest = Math.max(...blobs.map(b => new Date(b.uploadedAt).getTime()));
      if (Date.now() - newest > TTL_MS) {
        await del(blobs.map(b => b.url));
        return res.status(200).json({ code });
      }
    }
    return res.status(503).json({ error: '사용 가능한 번호가 없어요. 잠시 후 다시 시도해 주세요.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
