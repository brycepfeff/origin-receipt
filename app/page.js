"use client";

import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Stable mock values (safe for SSR)
  const mockHash = useMemo(
    () => "b3d7c9f0a0e1c2d3f4a5b6c7d8e9f00112233445566778899aabbccddeeff00",
    []
  );
  const shortHash = useMemo(
    () => `${mockHash.slice(0, 10)}…${mockHash.slice(-10)}`,
    [mockHash]
  );
  const mockId = useMemo(() => "or_" + mockHash.slice(0, 12), [mockHash]);

  // Timestamp must be client-generated to avoid hydration mismatch
  const [ts, setTs] = useState("—");

  useEffect(() => {
    const now = new Date();
    const iso = now.toISOString();
    const formatted = iso.replace("T", " ").replace("Z", " UTC");
    setTs(formatted);
  }, []);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize(formatBytes(f.size));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize(formatBytes(f.size));
  }

  return (
    <div className="shell">
      <BackgroundDecor />

      <header className="header">
        <div className="brand">
          <div className="mark" aria-hidden="true">
            <span className="markDot" />
          </div>
          <div className="brandText">
            <div className="brandName">Origin Receipt</div>
            <div className="brandTag">Proof of existence for your media</div>
          </div>
        </div>

        <nav className="nav">
          <a className="navLink" href="#how">
            How it works
          </a>
          <a className="navLink" href="#verify">
            Verify
          </a>
          <a className="navLink navCta" href="#demo">
            Try demo
          </a>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="heroCopy">
            <h1 className="h1">Turn a video into a verifiable receipt in seconds.</h1>
            <p className="sub">
              Upload a file. We generate a fingerprint and timestamped receipt you can share. The
              goal is simple: a credibility signal that is easy to verify.
            </p>

            <div className="heroActions">
              <a className="button buttonPrimary" href="#demo">
                Generate a receipt
              </a>
              <a className="button buttonGhost" href="#how">
                See how it works
              </a>
            </div>

            <div className="trustRow" aria-label="Trust indicators">
              <TrustPill title="No content hosted" desc="Receipts only" />
              <TrustPill title="Fast" desc="Seconds, not minutes" />
              <TrustPill title="Portable" desc="Shareable link" />
            </div>
          </div>

          <div className="heroCard">
            <div className="cardTop">
              <div className="cardTitle">Receipt Preview</div>
              <div className="chip">Demo</div>
            </div>

            <div className="receipt">
              <Row k="Receipt ID" v={mockId} mono />
              <Row k="Timestamp" v={ts} mono />
              <Row k="Fingerprint" v={shortHash} mono />
              <div className="divider" />
              <div className="receiptNote">
                This is a preview UI. Next we will generate real hashes and real receipt links.
              </div>
            </div>

            <div className="cardBottom">
              <div className="mini">
                <div className="miniDot" />
                <div className="miniText">Designed for mobile-first verification</div>
              </div>
              <button className="button buttonSmall" type="button" disabled>
                Share receipt
              </button>
            </div>
          </div>
        </section>

        <section id="demo" className="grid">
          <div className="panel">
            <div className="panelHead">
              <h2 className="h2">Generate a receipt</h2>
              <p className="p">
                Drag a video or image below. Backend comes next. UI is wired for it already.
              </p>
            </div>

            <div
              className={`drop ${dragOver ? "dropActive" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="dropIcon" aria-hidden="true">
                ⬆︎
              </div>
              <div className="dropText">
                <div className="dropTitle">Drop your file here</div>
                <div className="dropSub">MP4, MOV, JPG, PNG. Up to whatever we set later.</div>
              </div>

              <div className="dropActions">
                <label className="button buttonPrimary buttonWide">
                  Choose file
                  <input
                    className="fileInput"
                    type="file"
                    accept="video/*,image/*"
                    onChange={onPickFile}
                  />
                </label>
                <button className="button buttonGhost buttonWide" type="button" disabled>
                  Generate receipt
                </button>
              </div>

              <div className="dropMeta">
                {fileName ? (
                  <div className="metaBox">
                    <div className="metaTitle">Selected</div>
                    <div className="metaValue" title={fileName}>
                      {fileName}
                    </div>
                    <div className="metaHint">{fileSize}</div>
                  </div>
                ) : (
                  <div className="metaBox metaMuted">
                    <div className="metaTitle">Tip</div>
                    <div className="metaValue">Start with a short clip for the demo.</div>
                    <div className="metaHint">We will optimize uploads next.</div>
                  </div>
                )}

                <div className="metaBox">
                  <div className="metaTitle">What you get</div>
                  <ul className="metaList">
                    <li>Fingerprint (hash)</li>
                    <li>Timestamped receipt</li>
                    <li>Shareable verification link</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panelHead" id="verify">
              <h2 className="h2">Verify a receipt</h2>
              <p className="p">
                Investors love this because it is dead simple: paste a receipt ID, confirm match.
              </p>
            </div>

            <div className="verifyBox">
              <label className="field">
                <span className="fieldLabel">Receipt ID</span>
                <input
                  className="input"
                  placeholder="or_b3d7c9f0a0e1"
                  inputMode="text"
                  autoComplete="off"
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Optional: re-upload file to compare</span>
                <input className="input" type="file" accept="video/*,image/*" disabled />
              </label>

              <button className="button buttonPrimary" type="button" disabled>
                Verify
              </button>

              <div className="callout">
                <div className="calloutTitle">Pitch line</div>
                <div className="calloutText">
                  “We do not guess what is authentic. We issue a receipt at the moment the file
                  exists, then anyone can verify it later.”
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="how">
          <h2 className="h2">How it works</h2>
          <div className="steps">
            <Step n="1" title="Fingerprint" desc="We hash the file so any change becomes detectable." />
            <Step n="2" title="Receipt" desc="We store a timestamped receipt that can be referenced later." />
            <Step n="3" title="Verify" desc="Anyone can verify the receipt and confirm file match." />
          </div>
        </section>

        <footer className="footer">
          <div className="footerLeft">
            <div className="brandNameSmall">Origin Receipt</div>
            <div className="footerNote">MVP UI. Backend next.</div>
          </div>
          <div className="footerRight">
            <a className="navLink" href="#demo">
              Demo
            </a>
            <a className="navLink" href="#how">
              How it works
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function TrustPill({ title, desc }) {
  return (
    <div className="pill">
      <div className="pillTitle">{title}</div>
      <div className="pillDesc">{desc}</div>
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="row">
      <div className="rowKey">{k}</div>
      <div className={`rowVal ${mono ? "mono" : ""}`}>{v}</div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="step">
      <div className="stepNum">{n}</div>
      <div className="stepBody">
        <div className="stepTitle">{title}</div>
        <div className="stepDesc">{desc}</div>
      </div>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="bg" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
    </>
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
