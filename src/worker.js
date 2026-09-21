export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'channel'|'produk', id?]
  const resource = parts[1];
  const id = parts[2];
  const table = resource === 'channel' ? 'channel_records' : resource === 'produk' ? 'produk_records' : null;
  if (!table) return new Response('Not found', { status: 404 });

  if (request.method === 'GET' && !id) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM ${table} ORDER BY tahun DESC, bulan DESC`
    ).all();
    return Response.json(results);
  }

  if (request.method === 'POST' && !id) {
    const body = await request.json();
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    if (table === 'channel_records') {
      await env.DB.prepare(
        `INSERT INTO channel_records
          (id, bulan, tahun, channel, totalInteraksi, responseTime, aht, scr, createdAt, updatedAt)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        newId, body.bulan, body.tahun, body.channel, body.totalInteraksi,
        body.responseTime ?? null, body.aht ?? null, body.scr ?? null, now, now
      ).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO produk_records (id, bulan, tahun, produk, totalInteraksi, createdAt, updatedAt)
         VALUES (?,?,?,?,?,?,?)`
      ).bind(newId, body.bulan, body.tahun, body.produk, body.totalInteraksi, now, now).run();
    }
    return Response.json({ id: newId, ...body, createdAt: now, updatedAt: now });
  }

  if (request.method === 'PUT' && id) {
    const body = await request.json();
    const now = new Date().toISOString();
    if (table === 'channel_records') {
      await env.DB.prepare(
        `UPDATE channel_records
         SET bulan=?, tahun=?, channel=?, totalInteraksi=?, responseTime=?, aht=?, scr=?, updatedAt=?
         WHERE id=?`
      ).bind(
        body.bulan, body.tahun, body.channel, body.totalInteraksi,
        body.responseTime ?? null, body.aht ?? null, body.scr ?? null, now, id
      ).run();
    } else {
      await env.DB.prepare(
        `UPDATE produk_records SET bulan=?, tahun=?, produk=?, totalInteraksi=?, updatedAt=? WHERE id=?`
      ).bind(body.bulan, body.tahun, body.produk, body.totalInteraksi, now, id).run();
    }
    return Response.json({ ok: true });
  }

  if (request.method === 'DELETE' && id) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE id=?`).bind(id).run();
    return Response.json({ ok: true });
  }

  return new Response('Method not allowed', { status: 405 });
}
