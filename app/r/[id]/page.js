import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function shortHash(h) {
  if (!h) return "";
  return `${h.slice(0, 10)}…${h.slice(-10)}`;
}

function getBaseUrlFromHeaders() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  if (!host) return null;
  return `${proto}://${host}`;
}

export default async function ReceiptPage({ params }) {
  const id = params?.id;

  // Guard: if the route param is missing, show a clean message
  if (!id) {
    return (
      <div className="shell">
        <div className="bg" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <main className="main">
          <div className="panel">
            <div className="panelHead">
              <h1 className="h2">Receipt</h1>
              <p className="p">Missing receipt id in URL.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const baseUrl = getBaseUrlFromHeaders();
  const apiUrl = baseUrl ? `${baseUrl}/api/receipts/${id}` : null;

  let data = null;
  if (apiUrl) {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (res.ok) data = await res.json();
  }

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
            {!data ? (
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
                    Receipt ID <span className="mono">{data.id}</span> exists in our database.
                  </div>
                </div>

                <div className="receipt" style={{ padding: 0 }}>
                  <div className="row">
                    <div className="rowKey">Receipt ID</div>
                    <div className="rowVal mono">{data.id}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Timestamp</div>
                    <div className="rowVal mono">
                      {new Date(data.createdAt).toISOString().replace("T", " ").replace("Z", " UTC")}
                    </div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Fingerprint</div>
                    <div className="rowVal mono" title={data.contentHash}>
                      {shortHash(data.contentHash)}
                    </div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Filename</div>
                    <div className="rowVal">{data.filename || "—"}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Type</div>
                    <div className="rowVal">{data.mime || "—"}</div>
                  </div>

                  <div className="row">
                    <div className="rowKey">Size</div>
                    <div className="rowVal">{Number(data.sizeBytes || 0).toLocaleString()} bytes</div>
                  </div>

                  <div className="divider" />
                  <div className="receiptNote">
                    Next: add “Verify by re-upload” to recompute hash and compare.
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
