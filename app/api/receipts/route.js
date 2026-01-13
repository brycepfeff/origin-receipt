import { sql } from "@vercel/postgres";
import crypto from "crypto";

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

function sha256Hex(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function makeIdFromHash(hash) {
  return `or_${hash.slice(0, 12)}`;
}

export async function POST(request) {
  try {
    await ensureTable();

    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    const contentHash = sha256Hex(buf);
    const id = makeIdFromHash(contentHash);

    // Insert if not exists (id deterministic from file hash)
    await sql`
      INSERT INTO receipts (id, content_hash, filename, mime, size_bytes)
      VALUES (${id}, ${contentHash}, ${file.name ?? null}, ${file.type ?? null}, ${buf.length})
      ON CONFLICT (id) DO NOTHING;
    `;

    // Fetch receipt (for created_at)
    const { rows } = await sql`
      SELECT id, content_hash, created_at, filename, mime, size_bytes
      FROM receipts
      WHERE id = ${id}
      LIMIT 1;
    `;

    const r = rows?.[0];
    return new Response(
      JSON.stringify({
        receipt: {
          id: r.id,
          contentHash: r.content_hash,
          createdAt: r.created_at,
          filename: r.filename,
          mime: r.mime,
          sizeBytes: Number(r.size_bytes ?? 0),
        },
        url: `/r/${id}`,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: err?.message || String(err),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
