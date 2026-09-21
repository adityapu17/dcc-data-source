export async function onRequestPut({ params, request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE produk_records SET bulan=?, tahun=?, produk=?, totalInteraksi=?, updatedAt=? WHERE id=?`
  ).bind(body.bulan, body.tahun, body.produk, body.totalInteraksi, now, params.id).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ params, env }) {
  await env.DB.prepare('DELETE FROM produk_records WHERE id=?').bind(params.id).run();
  return Response.json({ ok: true });
}
