import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

function shortHash(h) {
  if (!h) return "";
  return `${h.slice(0, 10)}…${h.slice(-10)}`;
}

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

export default async function ReceiptPage({ params }) {
  // Next 16: params can be a Promise
  const resolved = await params;
  const id = resolved?.id;

  if (!id) {
    return (
      <div className="shell">
        <div className="bg" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <main className="main">
          <section className="panel">
            <div className="panelHead">
              <h1 className="h2">Receipt</h1>
              <p className="p">Missing receipt id in URL.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  await ensureTable();

  const { rows } = await sql`
    SELECT id, content_hash, created_at, filename, mime, size_bytes
    FROM receipts
    WHERE id = ${id}
    LIMIT 1;
  `;

  const r = rows?.[0] || null;

  return (
    <div className="shell">
      <div className="bg" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <header className="header">
        <div className="brand">
          <div className="mark" aria-hidden="true">
            <span className="markDot" />
          </div>
          <div className="brandText">
            <div className="brandName">Origin Receipt</div>
            <div className="brandTag">Public verification</div>
          </div>
        </div>

        <nav className="nav">
          <a className="navLink navCta" href="/">
            New receipt
          </a>
        </nav>
      </header>

      <main className="main">
        <section className="panel" style={{ overflow: "visible" }}>
          <div className="panelHead">
            <h1 className="h2">Receipt</h1>
            <p className="p">
              This page proves a specific file fingerprint existed at a specific time.
            </p>
          </div>

          <div className="verifyBox">
            {!r ? (
              <div className="callout">
                <div className="calloutTitle">Not found</div>
                <div className="calloutText">
                  No receipt exists for <span className="mono">{id}</span>.
                </div>
              </div>
            ) : (
              <>
                <div className="callout">
                  <div className="calloutTitle">Verified receipt</div>
                  <div className="calloutText">
                    Receipt ID <span className="mono">{r.id}</span> exists in the database.
                  </div>
                </div>

                <div className="receipt" style={{ padding: 0 }}>
                  <div className="row">
                    <div className="rowKey">Receipt ID</div>
                    <div className="rowVal mono">{r.id}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Timestamp</div>
                    <div className="rowVal mono">
                      {new Date(r.created_at).toISOString().replace("T", " ").replace("Z", " UTC")}
                    </div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Fingerprint</div>
                    <div
                      className="rowVal mono"
                      title={r.content_hash}
                    >
                      {shortHash(r.content_hash)}
                    </div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Filename</div>
                    <div className="rowVal">{r.filename || "—"}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Type</div>
                    <div className="rowVal">{r.mime || "—"}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Size</div>
                    <div className="rowVal">
                      {Number(r.size_bytes || 0).toLocaleString()} bytes
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="receiptNote">
                    Next step: “Verify by re-upload” to recompute hash and compare.
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
