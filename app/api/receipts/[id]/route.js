import { sql } from "@vercel/postgres";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      content_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      filename TEXT,
      mime TEXT,
      size_bytes BIGINT
    );
  `;
}

export async function GET(_request, { params }) {
  try {
    await ensureTable();

    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const { rows } = await sql`
      SELECT id, content_hash, created_at, filename, mime, size_bytes
      FROM receipts
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (!rows?.length) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    const r = rows[0];
    return new Response(
      JSON.stringify({
        id: r.id,
        contentHash: r.content_hash,
        createdAt: r.created_at,
        filename: r.filename,
        mime: r.mime,
        sizeBytes: Number(r.size_bytes ?? 0),
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: err?.message || String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
