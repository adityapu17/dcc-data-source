export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM produk_records ORDER BY tahun DESC, bulan DESC'
  ).all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO produk_records (id, bulan, tahun, produk, totalInteraksi, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(id, body.bulan, body.tahun, body.produk, body.totalInteraksi, now, now).run();
  return Response.json({ id, ...body, createdAt: now, updatedAt: now });
}
