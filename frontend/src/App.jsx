import { useState, useEffect, useRef, useCallback } from "react";

const REACTIONS = ["ACK", "LOL", "WOW", "GG", "RIP", "???"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PROFANITY = ["spam", "hate"];

function generateCode() {
  const a = ["cold", "lost", "grey", "raw", "iron", "void", "dark", "null", "dead", "hex"];
  const b = ["river", "stone", "wire", "flame", "clock", "root", "blade", "echo", "node", "gate"];
  return `${a[Math.random() * a.length | 0]}-${b[Math.random() * b.length | 0]}-${(Math.random() * 900 + 100) | 0}`;
}
function clean(t) { return PROFANITY.reduce((s, w) => s.replace(new RegExp(w, "gi"), "[REDACTED]"), t); }
function hm(ts) { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }); }
function toDataURL(f) { return new Promise((r, j) => { const x = new FileReader(); x.onload = () => r(x.result); x.onerror = j; x.readAsDataURL(f); }); }

class Room {
  constructor(code, uid, name, cb) {
    this.uid = uid; this._n = name;
    this.ch = new BroadcastChannel(`cc3:${code}`);
    this.ch.onmessage = e => { if (e.data.from !== uid) cb(e.data); };
  }
  emit(type, p = {}) { const m = { type, from: this.uid, fromName: this._n, ...p, ts: Date.now() }; this.ch.postMessage(m); return m; }
  close() { this.ch.close(); }
}

const registry = {};

// Matrix rain characters
const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMN";

export default function App() {
  const [phase, setPhase] = useState("lobby");
  const [myName, setMyName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [uid] = useState(() => `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`);
  const [partner, setPartner] = useState(null);
  const [online, setOnline] = useState(true);
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [code, setCode] = useState("");
  const [rxns, setRxns] = useState({});
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [upPct, setUpPct] = useState(null);
  const [rec, setRec] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [booted, setBooted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);

  const chRef = useRef(null);
  const ttRef = useRef(null);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const matrixRef = useRef(null);

  // Matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const cols = Math.floor(W / 16);
    const drops = Array(cols).fill(1);
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "13px 'Courier New',monospace";
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const brightness = Math.random();
        ctx.fillStyle = brightness > 0.97 ? "#ffffff" : brightness > 0.8 ? "#00ff41" : `rgba(0,${Math.floor(180 + 75 * brightness)},${Math.floor(50 * brightness)},${0.3 + brightness * 0.7})`;
        ctx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(matrixRef.current); window.removeEventListener("resize", resize); };
  }, []);

  // Boot sequence
  useEffect(() => {
    const lines = [
      "CODECHAT OS v2.4.1 — ANONYMOUS TERMINAL",
      "INITIALIZING SECURE CHANNEL...",
      "LOADING ENCRYPTION MODULES....... [OK]",
      "ESTABLISHING PEER PROTOCOL......... [OK]",
      "MEMORY WIPE ON EXIT: ENABLED",
      "NO LOGS. NO TRACES. NO ACCOUNTS.",
      "─────────────────────────────────────",
      "SYSTEM READY. AWAITING INPUT.",
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) { setBootLines(p => [...p, lines[i]]); i++; }
      else { clearInterval(iv); setTimeout(() => setBooted(true), 400); }
    }, 120);
    return () => clearInterval(iv);
  }, []);

  // Cursor blink
  useEffect(() => {
    const iv = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(iv);
  }, []);

  // Random glitch
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 120 + Math.random() * 80);
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const on = useCallback((ev) => {
    if (ev.type === "join") { setPartner({ id: ev.from, name: ev.fromName }); setOnline(true); chRef.current?.emit("ack"); }
    else if (ev.type === "ack") { setPartner({ id: ev.from, name: ev.fromName }); setOnline(true); }
    else if (ev.type === "message") { setMsgs(p => [...p, { id: ev.msgId, from: ev.from, name: ev.fromName, text: ev.text, file: ev.file || null, audio: ev.audio || null, ts: ev.ts, mine: false }]); }
    else if (ev.type === "typing") { setTyping(true); clearTimeout(ttRef._p); ttRef._p = setTimeout(() => setTyping(false), 2200); }
    else if (ev.type === "stop_typing") { setTyping(false); }
    else if (ev.type === "reaction") { setRxns(p => { const r = { ...(p[ev.msgId] || {}) }; r[ev.emoji] = (r[ev.emoji] || 0) + 1; return { ...p, [ev.msgId]: r }; }); }
    else if (ev.type === "leave") { setOnline(false); setTyping(false); sys(`PEER ${ev.fromName} DISCONNECTED — CONNECTION TERMINATED`); }
  }, []);

  function sys(text) { setMsgs(p => [...p, { id: `s${Date.now()}`, system: true, text, ts: Date.now() }]); }

  function join() {
    const n = myName.trim(), c = codeInput.trim().toLowerCase();
    if (!n) { setErr("ERR: IDENTITY STRING REQUIRED"); return; }
    if (!c) { setErr("ERR: ACCESS CODE REQUIRED"); return; }
    if (!registry[c]) registry[c] = { users: [] };
    if (registry[c].users.length >= 2 && !registry[c].users.find(u => u.id === uid)) { setErr("ERR: CHANNEL CAPACITY EXCEEDED [MAX:2]"); return; }
    registry[c].users.push({ id: uid, name: n });
    const ch = new Room(c, uid, n, on); chRef.current = ch;
    setCode(c); setPhase("waiting"); setErr(""); ch.emit("join");
  }

  function leave() {
    chRef.current?.emit("leave"); chRef.current?.close(); chRef.current = null;
    if (registry[code]) { registry[code].users = registry[code].users.filter(u => u.id !== uid); if (!registry[code].users.length) delete registry[code]; }
    setPhase("lobby"); setMsgs([]); setPartner(null); setTyping(false); setDraft(""); setRxns({});
  }

  useEffect(() => { if (phase === "waiting" && partner) { setPhase("chat"); sys(`PEER ${partner.name} AUTHENTICATED — SECURE CHANNEL ESTABLISHED`); } }, [partner]);

  function send() {
    const t = clean(draft.trim()); if (!t) return;
    const id = `m${Date.now()}`;
    setMsgs(p => [...p, { id, from: uid, name: myName, text: t, ts: Date.now(), mine: true }]);
    chRef.current?.emit("message", { msgId: id, text: t }); setDraft(""); chRef.current?.emit("stop_typing"); inputRef.current?.focus();
  }

  function onDraft(v) {
    setDraft(v); chRef.current?.emit("typing");
    clearTimeout(ttRef.current); ttRef.current = setTimeout(() => chRef.current?.emit("stop_typing"), 1500);
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { setErr("ERR: FILE SIZE EXCEEDS 5MB LIMIT"); return; }
    setUpPct(0); const iv = setInterval(() => setUpPct(p => p >= 88 ? 88 : p + 14), 55);
    const url = await toDataURL(file); clearInterval(iv); setUpPct(100); setTimeout(() => setUpPct(null), 400);
    const id = `m${Date.now()}f`; const fm = { id, from: uid, name: myName, file: { name: file.name, type: file.type, url, size: file.size }, ts: Date.now(), mine: true };
    setMsgs(p => [...p, fm]); chRef.current?.emit("message", { msgId: id, file: fm.file });
  }

  async function startRec() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s); chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" }); s.getTracks().forEach(t => t.stop());
        const r = new FileReader(); r.onload = () => {
          const url = r.result; const id = `m${Date.now()}a`;
          setMsgs(p => [...p, { id, from: uid, name: myName, audio: url, ts: Date.now(), mine: true }]);
          chRef.current?.emit("message", { msgId: id, audio: url });
        }; r.readAsDataURL(blob);
      };
      mr.start(); mrRef.current = mr; setRec(true);
    } catch { setErr("ERR: AUDIO DEVICE ACCESS DENIED"); }
  }
  function stopRec() { mrRef.current?.stop(); setRec(false); }

  function react(msgId, emoji) {
    setRxns(p => { const r = { ...(p[msgId] || {}) }; r[emoji] = (r[emoji] || 0) + 1; return { ...p, [msgId]: r }; });
    chRef.current?.emit("reaction", { msgId, emoji }); setHovered(null);
  }

  function copyCode() { navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }

  // ── STYLES
  const G = "#00ff41"; // phosphor green
  const GD = "#00cc33"; // dim green
  const GDD = "#005a14"; // very dim
  const GF = "#00ff8844"; // faint green

  const termFont = "'Share Tech Mono','Courier New',monospace";

  return (
    <div style={{ minHeight: "100vh", background: "#000000", fontFamily: termFont, color: G, overflow: "hidden", position: "relative", cursor: "default" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#000;overflow:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#005a14}
        ::-webkit-scrollbar-track{background:#000}

        /* CRT scanlines */
        .crt::after{
          content:'';
          position:fixed;inset:0;
          background:repeating-linear-gradient(0deg,rgba(0,0,0,0.35) 0px,rgba(0,0,0,0.35) 1px,transparent 1px,transparent 3px);
          pointer-events:none;z-index:9998;
        }

        /* CRT vignette */
        .crt::before{
          content:'';
          position:fixed;inset:0;
          background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.8) 100%);
          pointer-events:none;z-index:9997;
        }

        /* Phosphor glow on text */
        .glow{ text-shadow:0 0 8px #00ff41,0 0 20px #00ff4155; }
        .glow-sm{ text-shadow:0 0 4px #00ff41,0 0 10px #00ff4133; }
        .glow-dim{ text-shadow:0 0 3px #00cc3366; }

        /* Glitch animation */
        @keyframes glitch{
          0%{transform:none;opacity:1}
          7%{transform:skewX(-15deg);opacity:.75}
          10%{transform:none;opacity:1}
          27%{transform:none;opacity:1}
          30%{transform:skewX(8deg) translateX(2px);opacity:.9}
          35%{transform:none;opacity:1}
          52%{transform:none;opacity:1}
          55%{transform:translateX(-3px);opacity:.85}
          60%{transform:none;opacity:1}
          100%{transform:none;opacity:1}
        }
        .glitch-active{ animation:glitch 0.3s linear; }

        /* Typing cursor blink */
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .cursor{ animation:blink 1.06s step-end infinite; }

        /* Scan line sweep */
        @keyframes scanSweep{
          0%{top:-10%}100%{top:110%}
        }
        .scan-sweep{
          position:fixed;left:0;width:100%;height:3px;
          background:linear-gradient(180deg,transparent,rgba(0,255,65,0.06),transparent);
          animation:scanSweep 8s linear infinite;
          pointer-events:none;z-index:9996;
        }

        /* Boot line animation */
        @keyframes bootLine{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .boot-line{ animation:bootLine 0.15s ease forwards; }

        /* Message slide in */
        @keyframes msgIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        .msg-in{ animation:msgIn 0.18s ease; }

        /* Input terminal style */
        .term-input{
          background:transparent;
          border:none;
          color:#00ff41;
          font-family:'Share Tech Mono','Courier New',monospace;
          font-size:14px;
          width:100%;
          outline:none;
          caret-color:#00ff41;
          letter-spacing:1px;
        }
        .term-input::placeholder{color:#005a14}
        .term-input::selection{background:#00ff4133}

        /* Box borders */
        .term-box{
          border:1px solid #005a14;
          padding:12px 16px;
          position:relative;
        }
        .term-box:focus-within{ border-color:#00cc33; box-shadow:0 0 12px #00ff4115,inset 0 0 8px #00ff410a; }

        /* Buttons */
        .term-btn{
          background:transparent;
          border:1px solid #005a14;
          color:#00cc33;
          font-family:'Share Tech Mono','Courier New',monospace;
          font-size:12px;
          padding:8px 18px;
          letter-spacing:2px;
          text-transform:uppercase;
          cursor:pointer;
          transition:all .1s;
        }
        .term-btn:hover{ border-color:#00ff41; color:#00ff41; box-shadow:0 0 12px #00ff4122; background:#00ff4108; }
        .term-btn:active{ transform:scale(0.98); }
        .term-btn.primary{ border-color:#00cc33; color:#00ff41; box-shadow:0 0 8px #00ff4122; }
        .term-btn.primary:hover{ background:#00ff4112; box-shadow:0 0 20px #00ff4133; }
        .term-btn.danger{ border-color:#3a0000; color:#880000; }
        .term-btn.danger:hover{ border-color:#cc0000; color:#ff4444; box-shadow:0 0 10px #ff000022; background:#ff000008; }
        .term-btn.rec-btn{ border-color:#660000; color:#ff3333; animation:recPulse 0.8s infinite; }
        @keyframes recPulse{0%,100%{box-shadow:0 0 4px #ff000044}50%{box-shadow:0 0 16px #ff0000aa}}

        /* Reaction tags */
        .rxn-tag{
          font-size:10px; padding:2px 8px; letter-spacing:1.5px;
          border:1px solid #004010; color:#008020;
          cursor:pointer; transition:all .1s;
          font-family:'Share Tech Mono','Courier New',monospace;
        }
        .rxn-tag:hover{ border-color:#00ff41; color:#00ff41; box-shadow:0 0 8px #00ff4133; }

        audio{ filter:invert(1) sepia(1) saturate(5) hue-rotate(80deg); width:180px; height:24px; }

        /* Progress bar */
        @keyframes progScan{from{background-position:0 0}to{background-position:40px 0}}
        .prog-bar{
          height:2px;
          background:repeating-linear-gradient(90deg,#00ff41 0,#00ff41 20px,#004010 20px,#004010 40px);
          background-size:40px;
          animation:progScan .4s linear infinite;
          transition:width .06s linear;
        }
      `}</style>

      {/* Matrix canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.18, pointerEvents: "none" }} />

      {/* CRT overlay */}
      <div className="crt" />

      {/* Scan sweep */}
      <div className="scan-sweep" />

      {/* ── BOOT SCREEN */}
      {!booted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0, padding: 40 }}>
          <div style={{ width: "100%", maxWidth: 600 }}>
            <div className="glow" style={{ fontSize: 20, letterSpacing: "4px", marginBottom: 20, color: G }}>
              CODECHAT TERMINAL
            </div>
            {bootLines.map((l, i) => (
              <div key={i} className="boot-line glow-dim" style={{ fontSize: 12, letterSpacing: "1px", lineHeight: 2, color: i === bootLines.length - 1 ? G : GD }}>
                {`> `}{l}
              </div>
            ))}
            {bootLines.length > 0 && <span className="cursor" style={{ color: G }}>_</span>}
          </div>
        </div>
      )}

      {/* ── LOBBY */}
      {phase === "lobby" && booted && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 540 }} className={glitchActive ? "glitch-active" : ""}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div className="glow" style={{ fontSize: 28, letterSpacing: "8px", fontWeight: "normal", color: G, lineHeight: 1 }}>
                CODECHAT
              </div>
              <div style={{ fontSize: 11, color: GD, letterSpacing: "3px", marginTop: 6 }}>
                ANONYMOUS PEER-TO-PEER TERMINAL v2.4.1
              </div>
              <div style={{ height: 1, background: `linear-gradient(90deg,${GDD},${GD},${GDD})`, marginTop: 14, boxShadow: `0 0 6px ${G}44` }} />
            </div>

            {/* UID display */}
            <div style={{ fontSize: 11, color: GDD, letterSpacing: "1.5px", marginBottom: 24 }}>
              SESSION_ID: <span style={{ color: GD }}>{uid}</span>
              <span className="cursor" style={{ color: G }}> _</span>
            </div>

            {/* Form */}
            <div style={{ marginBottom: 4, fontSize: 10, color: GDD, letterSpacing: "2px" }}>ENTER CREDENTIALS</div>
            <div style={{ height: 1, background: GDD, marginBottom: 16 }} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: GD, letterSpacing: "1.5px", marginBottom: 8 }}>
                {'>'} IDENTITY_STRING
              </div>
              <div className="term-box">
                <input className="term-input glow-sm" placeholder="type your handle_" value={myName} maxLength={20}
                  onChange={e => setMyName(e.target.value)} onKeyDown={e => e.key === "Enter" && join()} />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: GD, letterSpacing: "1.5px", marginBottom: 8 }}>
                {'>'} ACCESS_CODE
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="term-box" style={{ flex: 1 }}>
                  <input className="term-input glow-sm" placeholder="enter or generate_" value={codeInput} style={{ letterSpacing: "2px" }}
                    onChange={e => setCodeInput(e.target.value.toLowerCase())} onKeyDown={e => e.key === "Enter" && join()} />
                </div>
                <button className="term-btn" onClick={() => setCodeInput(generateCode())} style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                  GEN
                </button>
              </div>
              <div style={{ fontSize: 10, color: GDD, marginTop: 6, letterSpacing: "1px" }}>
                # SHARE CODE TO ESTABLISH ENCRYPTED CHANNEL
              </div>
            </div>

            {err && (
              <div style={{ fontSize: 12, color: "#ff4444", letterSpacing: "1px", marginBottom: 18, padding: "8px 12px", border: "1px solid #440000", background: "#110000" }}>
                {err}
              </div>
            )}

            <button className="term-btn primary" style={{ width: "100%", padding: "12px", fontSize: 13, letterSpacing: "4px" }} onClick={join}>
              {'>>>'} CONNECT
            </button>

            <div style={{ marginTop: 28, display: "flex", gap: 24, borderTop: "1px solid #001a04", paddingTop: 16 }}>
              {["NO LOGS", "NO SIGNUP", "AUTO-WIPE"].map(t => (
                <div key={t} style={{ fontSize: 10, color: GDD, letterSpacing: "2px" }}>
                  <span style={{ color: GD }}>+</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WAITING */}
      {phase === "waiting" && booted && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 500 }}>
            <div style={{ fontSize: 11, color: GDD, letterSpacing: "2px", marginBottom: 20 }}>
              CHANNEL: {code.toUpperCase()} / STATUS: LISTENING
            </div>
            <div style={{ height: 1, background: GDD, marginBottom: 24 }} />

            <div className="glow" style={{ fontSize: 16, letterSpacing: "3px", marginBottom: 6 }}>
              AWAITING PEER CONNECTION
            </div>
            <div style={{ fontSize: 12, color: GD, letterSpacing: "1px", marginBottom: 28 }}>
              # share access code to establish secure link
            </div>

            <div style={{ border: "1px solid #004010", padding: "20px 24px", marginBottom: 24, background: "#001a0440" }}>
              <div style={{ fontSize: 10, color: GDD, letterSpacing: "2px", marginBottom: 10 }}>ACCESS_CODE</div>
              <div className="glow" style={{ fontSize: 22, letterSpacing: "6px", fontWeight: "normal", color: G, marginBottom: 16 }}>
                {code.toUpperCase()}
              </div>
              <button className="term-btn" onClick={copyCode} style={{ fontSize: 11 }}>
                {copied ? "COPIED TO CLIPBOARD" : "COPY CODE"}
              </button>
            </div>

            <div style={{ fontSize: 12, color: GDD, letterSpacing: "1px", marginBottom: 6 }}>
              SCANNING FOR PEER
              <span style={{ display: "inline-flex", gap: 2, marginLeft: 8 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                  <span key={i} style={{
                    display: "inline-block", width: 6, height: 6,
                    background: GD,
                    animation: `blink 1.2s ${i * 0.15}s infinite`,
                    opacity: 0.6,
                  }} />
                ))}
              </span>
            </div>

            <div style={{ height: 1, background: GDD, margin: "24px 0" }} />

            <button className="term-btn danger" onClick={leave} style={{ fontSize: 11 }}>
              ABORT CONNECTION
            </button>
          </div>
        </div>
      )}

      {/* ── CHAT */}
      {phase === "chat" && booted && (
        <div
          style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 800, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
        >
          {dragging && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.92)", border: "1px dashed #004010", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="glow" style={{ fontSize: 14, letterSpacing: "4px" }}>DROP TO TRANSMIT</div>
            </div>
          )}

          {/* Status bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 20px",
            borderBottom: "1px solid #001a04",
            background: "rgba(0,0,0,0.85)",
            flexShrink: 0,
            fontSize: 11,
            letterSpacing: "1.5px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div>
                <span style={{ color: GDD }}>PEER: </span>
                <span className="glow-sm" style={{ color: G }}>{partner?.name?.toUpperCase()}</span>
                <span style={{
                  display: "inline-block", width: 6, height: 6,
                  background: online ? "#00ff41" : "#440000",
                  borderRadius: "50%", marginLeft: 8,
                  boxShadow: online ? "0 0 6px #00ff41" : undefined,
                  verticalAlign: "middle",
                }} />
                <span style={{ color: online ? "#00aa22" : "#660000", marginLeft: 4, fontSize: 10 }}>
                  {typing ? "TRANSMITTING..." : online ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ color: GDD }}>CH: <span style={{ color: GD }}>{code.toUpperCase()}</span></span>
              <span style={{ color: GDD }}>{hm(Date.now())}</span>
              <button className="term-btn danger" onClick={leave} style={{ padding: "4px 12px", fontSize: 10 }}>DISCONNECT</button>
            </div>
          </div>

          {/* Upload */}
          {upPct !== null && (
            <div style={{ background: "#000", borderBottom: "1px solid #001a04", padding: "6px 20px", flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: GDD, letterSpacing: "1.5px", marginBottom: 3 }}>TRANSMITTING FILE... {upPct}%</div>
              <div style={{ background: "#001a04", overflow: "hidden" }}>
                <div className="prog-bar" style={{ width: `${upPct}%` }} />
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", fontFamily: termFont }}>
            {msgs.map(msg => (
              <div key={msg.id} className="msg-in"
                style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: msg.system ? "flex-start" : "flex-start" }}
                onMouseEnter={() => { if (!msg.system) setHovered(msg.id) }}
                onMouseLeave={() => setHovered(null)}
              >
                {msg.system ? (
                  <div style={{ fontSize: 11, color: GDD, letterSpacing: "1px", padding: "4px 0", borderLeft: `2px solid #002a08`, paddingLeft: 10, marginBottom: 4 }}>
                    # {msg.text}
                  </div>
                ) : (
                  <>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: msg.mine ? G : GD, letterSpacing: "1.5px" }}>
                        {msg.mine ? `[${myName.toUpperCase()}]` : `[${msg.name.toUpperCase()}]`}
                      </span>
                      <span style={{ fontSize: 9, color: GDD, letterSpacing: "0.5px" }}>{hm(msg.ts)}</span>
                      {msg.mine && <span style={{ fontSize: 9, color: GDD }}>{'>>>'}</span>}
                    </div>

                    {/* Message body */}
                    <div style={{
                      padding: "8px 14px",
                      background: msg.mine ? "#001a0488" : "#00000066",
                      border: `1px solid ${msg.mine ? "#004010" : "#001a04"}`,
                      borderLeft: `3px solid ${msg.mine ? G : GD}`,
                      maxWidth: "80%",
                      fontSize: 13,
                      color: msg.mine ? G : GD,
                      lineHeight: 1.6,
                      letterSpacing: "0.5px",
                      wordBreak: "break-word",
                      ...(msg.mine ? { textShadow: `0 0 8px ${G}44` } : { textShadow: `0 0 6px ${GD}33` }),
                    }}>
                      {msg.text && <span>{msg.text}</span>}
                      {msg.audio && <audio controls><source src={msg.audio} type="audio/webm" /></audio>}
                      {msg.file && (
                        msg.file.type.startsWith("image/") ? (
                          <img src={msg.file.url} alt={msg.file.name} style={{ maxWidth: 200, maxHeight: 160, display: "block", filter: "sepia(1) saturate(3) hue-rotate(80deg) brightness(0.85)", borderRadius: 0, border: "1px solid #004010" }} />
                        ) : (
                          <a href={msg.file.url} download={msg.file.name}
                            style={{ color: GD, fontSize: 12, textDecoration: "none", borderBottom: `1px solid ${GDD}`, letterSpacing: "1px" }}>
                            [FILE] {msg.file.name} ({(msg.file.size / 1024).toFixed(0)}KB)
                          </a>
                        )
                      )}
                    </div>

                    {/* Reactions */}
                    {rxns[msg.id] && Object.keys(rxns[msg.id]).length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {Object.entries(rxns[msg.id]).map(([em, ct]) => (
                          <span key={em} className="rxn-tag" onClick={() => react(msg.id, em)}>
                            {em}{ct > 1 && <span style={{ color: GDD, marginLeft: 3 }}>[{ct}]</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reaction picker */}
                    {hovered === msg.id && (
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {REACTIONS.map(em => (
                          <button key={em} className="rxn-tag" onClick={() => react(msg.id, em)} style={{ background: "transparent", fontFamily: termFont, cursor: "pointer" }}>
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ marginBottom: 8, fontSize: 12, color: GDD, letterSpacing: "1px" }}>
                [{partner?.name?.toUpperCase()}] <span style={{ color: GD }}>TRANSMITTING</span>
                <span style={{ display: "inline-flex", gap: 2, marginLeft: 6 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ display: "inline-block", width: 5, height: 10, background: G, animation: `blink 0.8s ${i * 0.15}s infinite`, opacity: 0.8 }} />
                  ))}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            borderTop: "1px solid #001a04",
            background: "rgba(0,0,0,0.9)",
            flexShrink: 0,
          }}>
            <input type="file" id="fi" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />

            {/* Command line input */}
            <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{ color: GD, fontSize: 13, letterSpacing: "2px", flexShrink: 0, marginRight: 8 }}>
                [{myName.toUpperCase()}] {'>>'}
              </span>
              <input
                ref={inputRef}
                className="term-input"
                placeholder={online ? "type message and press enter_" : "PEER OFFLINE — CHANNEL CLOSED"}
                value={draft}
                onChange={e => onDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                disabled={!online}
                style={{ flex: 1, fontSize: 13, letterSpacing: "0.5px" }}
              />
              {cursorVisible && !draft && <span style={{ color: G, fontSize: 13 }}>_</span>}
            </div>

            {/* Bottom toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 20px 10px", borderTop: "1px solid #001a04" }}>
              <button className="term-btn" onClick={() => document.getElementById("fi").click()} style={{ fontSize: 10, padding: "5px 12px", letterSpacing: "1.5px" }}>
                ATTACH
              </button>
              <button
                className={rec ? "term-btn rec-btn" : "term-btn"}
                onMouseDown={startRec} onMouseUp={stopRec}
                onTouchStart={startRec} onTouchEnd={stopRec}
                style={{ fontSize: 10, padding: "5px 12px", letterSpacing: "1.5px" }}
              >
                {rec ? "[REC]" : "VOICE"}
              </button>
              <div style={{ flex: 1 }} />
              <button className="term-btn primary" onClick={send} disabled={!draft.trim()} style={{ fontSize: 10, padding: "5px 16px", letterSpacing: "2px" }}>
                TRANSMIT
              </button>
            </div>
            {rec && <div style={{ fontSize: 10, color: "#ff4444", letterSpacing: "1.5px", padding: "0 20px 8px" }}>
              [REC ACTIVE] RELEASE TO TRANSMIT AUDIO
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}