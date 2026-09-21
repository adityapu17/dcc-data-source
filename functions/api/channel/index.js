export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM channel_records ORDER BY tahun DESC, bulan DESC'
  ).all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO channel_records
      (id, bulan, tahun, channel, totalInteraksi, responseTime, aht, scr, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    body.bulan,
    body.tahun,
    body.channel,
    body.totalInteraksi,
    body.responseTime ?? null,
    body.aht ?? null,
    body.scr ?? null,
    now,
    now
  ).run();
  return Response.json({ id, ...body, createdAt: now, updatedAt: now });
}
