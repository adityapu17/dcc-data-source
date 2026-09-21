export async function onRequestPut({ params, request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE channel_records
     SET bulan=?, tahun=?, channel=?, totalInteraksi=?, responseTime=?, aht=?, scr=?, updatedAt=?
     WHERE id=?`
  ).bind(
    body.bulan,
    body.tahun,
    body.channel,
    body.totalInteraksi,
    body.responseTime ?? null,
    body.aht ?? null,
    body.scr ?? null,
    now,
    params.id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM channel_records WHERE id=?').bind(params.id).run();
  return Response.json({ ok: true });
}
