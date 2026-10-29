# CyberCompanion (Cyber Academy)

**Note: This project is currently a Work In Progress (WIP).**

CyberCompanion is an interactive, fully offline desktop application built with Electron. It teaches web application security through hands-on tool tutorials, built-in practice labs, and in-app simulators, with a red-team learning path and a separate blue-team section. Nothing is downloaded and nothing touches a real network target.

Created by **Jaser Halabi**
[LinkedIn Profile](https://www.linkedin.com/in/jaser-halabi/)

---

## 🎯 Features

- **Red-team learning path** (modules 01-06): offline tutorials for the tools used in a web assessment, in a sensible learning order:
  - Nmap network scanning
  - SQL injection (SQLi)
  - Cross-Site Scripting (XSS)
  - sqlmap automation
  - Burp Suite proxy interception
  - Hydra brute-forcing

  Each module has a concept explanation, an analogy, a hands-on tutorial, and a reference table, plus an interactive tutorial overlay and an in-app simulator (terminal-style Nmap, Hydra and sqlmap simulators, an XSS sandbox, and a Burp-style intercept panel).
- **Blue-team section** (B1-B3):
  - **SOC Analyst Simulator**: triage streaming log alerts, flag real threats, and pick the right remediation.
  - **Network Traffic Analyst**: a Wireshark/tcpdump tutorial with a packet-capture lab and display-filter practice.
  - **Defenses**: one page collecting the fixes and mitigations for every attack covered in the red-team path.
- **Five built-in offline practice labs**, each opened in its own window from the relevant module: a Burp Suite interception lab, a SQL injection lab, a price tampering lab, a cookie manipulation lab, and an HTTP header manipulation lab. They are fully self-contained pages bundled with the app.
- **Terminal-style interface**: monospace UI with a collapsible sidebar, a home screen with a "continue" row that remembers your last module, and four themes (default, hacker, pink, light).
- **Legal-use framing**: every tutorial states that the commands are for systems you own or the built-in labs. Wordlists and credentials are referenced, not shipped.

## 🛠️ Technology Stack

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (Electron main process)
- **Packaging**: electron-builder

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) and npm (used to install dependencies and run the app in development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JaserHalabi/CyberAcademy.git
   cd CyberAcademy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Run the tests** (optional)
   ```bash
   npm test
   ```

### Building for Production
To build a standalone installer for Windows:
```bash
npm run dist
```
The compiled installer will be available in the `dist/` directory.

## 📝 License
This project is licensed under the MIT License.
