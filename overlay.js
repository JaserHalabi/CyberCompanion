/**
 * CyberCompanion — Tutorial State Manager & Overlay Renderer
 * 
 * Manages the state of solved challenges, calculates XP and levels,
 * and renders the overlay UI (progress dashboard, toasts, hints).
 */

class TutorialStateManager {
  constructor() {
    this.challengesData = null; // From challenges.json
    this.solvedChallenges = new Map(); // key -> { solvedAt, xp }
    this.totalXP = 0;
    this.level = 1;
    this.activePageHint = null;

    this.LEVELS = [
      { max: 0, name: "Script Kiddie" },
      { max: 500, name: "Apprentice" },
      { max: 1200, name: "Hacker" },
      { max: 2500, name: "Pro Hacker" },
      { max: 5000, name: "Elite Hacker" },
      { max: 8000, name: "Legendary" }
    ];
  }

  async loadData() {
    try {
      const res = await fetch('challenges.json');
      this.challengesData = await res.json();
    } catch (e) {
      console.error('Failed to load challenges.json', e);
    }
  }

  restore() {
    const saved = localStorage.getItem('cybercompanion_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.solved) {
          this.solvedChallenges = new Map(Object.entries(data.solved));
        }
        this.totalXP = data.totalXP || 0;
        this.recalculateLevel();
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }
  }

  persist() {
    localStorage.setItem('cybercompanion_progress', JSON.stringify({
      solved: Object.fromEntries(this.solvedChallenges),
      totalXP: this.totalXP
    }));
  }

  recalculateLevel() {
    this.level = 1;
    for (let i = 1; i < this.LEVELS.length; i++) {
      if (this.totalXP >= this.LEVELS[i].max) {
        this.level = i + 1;
      } else {
        break;
      }
    }
  }

  getChallengeInfo(key) {
    if (!this.challengesData || !this.challengesData.mappings[key]) {
      return { xp: 100, module: null, celebrationText: "Challenge solved!" }; // Default
    }
    return this.challengesData.mappings[key];
  }

  handleChallengeSolved(payload) {
    if (!payload || !payload.key) return null;
    
    // Ignore if already solved in our state
    if (this.solvedChallenges.has(payload.key)) return null;

    const info = this.getChallengeInfo(payload.key);
    const xpGained = info.xp || 100;

    const oldLevel = this.level;

    this.solvedChallenges.set(payload.key, {
      name: payload.name || payload.key,
      solvedAt: Date.now(),
      xp: xpGained,
      module: info.module
    });

    this.totalXP += xpGained;
    this.recalculateLevel();
    this.persist();

    return {
      challenge: payload,
      info: info,
      xpGained: xpGained,
      leveledUp: this.level > oldLevel
    };
  }

  handleChallengesSync(data) {
    if (!data || !data.challenges) return false;
    
    let stateChanged = false;
    const oldLevel = this.level;

    data.challenges.forEach(ch => {
      if (ch.solved && !this.solvedChallenges.has(ch.key)) {
        const info = this.getChallengeInfo(ch.key);
        const xpGained = info.xp || 100;
        
        this.solvedChallenges.set(ch.key, {
          name: ch.name || ch.key,
          solvedAt: Date.now(),
          xp: xpGained,
          module: info.module
        });
        
        this.totalXP += xpGained;
        stateChanged = true;
      }
    });

    if (stateChanged) {
      this.recalculateLevel();
      this.persist();
    }

    return {
      stateChanged,
      leveledUp: this.level > oldLevel
    };
  }

  handlePageChange(data) {
    if (!this.challengesData || !this.challengesData.pageHints) return null;

    // pageHints keys look like "/#/login"; the webview reports hash as "#/login".
    // Normalise both to a single leading slash so either form matches.
    const norm = (h) => '/' + String(h || '').replace(/^\/+/, '');
    const hints = this.challengesData.pageHints;
    const hash = norm(data.hash);

    let hint = hints[data.hash] || hints[hash] || null;

    if (!hint) {
      // Longest-prefix match so nested routes still resolve.
      let bestLen = -1;
      for (const [key, val] of Object.entries(hints)) {
        const nk = norm(key);
        if (hash.startsWith(nk) && nk.length > bestLen) { hint = val; bestLen = nk.length; }
      }
    }

    this.activePageHint = hint || null;
    return this.activePageHint;
  }

  getProgress() {
    const atMax = this.level >= this.LEVELS.length;
    // Thresholds for the current and next level, so the bar fills across the
    // current band rather than from zero every time.
    const currentFloor = this.LEVELS[Math.min(this.level - 1, this.LEVELS.length - 1)].max;
    const nextLevelXp = atMax ? this.LEVELS[this.LEVELS.length - 1].max : this.LEVELS[this.level].max;

    const span = Math.max(1, nextLevelXp - currentFloor);
    const intoLevel = Math.max(0, this.totalXP - currentFloor);
    const xpPercent = atMax ? 100 : Math.max(0, Math.min(100, Math.floor((intoLevel / span) * 100)));

    const levelName = this.LEVELS[Math.min(this.level - 1, this.LEVELS.length - 1)].name;
    const solvedCount = this.solvedChallenges.size;

    const recent = Array.from(this.solvedChallenges.entries())
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => b.solvedAt - a.solvedAt)
      .slice(0, 5);

    return {
      totalXP: this.totalXP,
      level: this.level,
      levelName,
      nextLevelXp,
      xpPercent,
      solvedCount,
      recent
    };
  }
}

class OverlayRenderer {
  constructor(stateManager) {
    this.state = stateManager;
    this.container = document.getElementById('overlayContent');
    this.toastsContainer = document.getElementById('achievementToasts');
    this.hintContainer = document.getElementById('contextHint');
  }

  renderDashboard() {
    if (!this.container) return;

    const progress = this.state.getProgress();

    this.container.innerHTML = `
      <div class="xp-section" id="xpSection">
        <div class="xp-header">
          <div class="level-badge">
            <span class="level-label">Level</span>
            <span class="level-value">${progress.level}</span>
            <span class="level-title">${progress.levelName}</span>
          </div>
          <div class="xp-stats">
            <div class="xp-current">${progress.totalXP} XP</div>
            <div class="xp-next">/ ${progress.nextLevelXp} XP</div>
          </div>
        </div>
        <div class="xp-bar-container">
          <div class="xp-bar-fill" id="xpBarFill" style="transform: scaleX(${progress.xpPercent / 100})"></div>
        </div>
        <div class="level-up-glow" id="levelUpGlow"></div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/></svg></div>
          <div class="stat-info">
            <span class="stat-value">${progress.solvedCount}</span>
            <span class="stat-label">Solved</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C8 10 7 12 7 14a5 5 0 0 0 10 0c0-5-5-8-5-12z"/></svg></div>
          <div class="stat-info">
            <span class="stat-value">${progress.recent.length ? 'Active' : 'Idle'}</span>
            <span class="stat-label">Streak</span>
          </div>
        </div>
      </div>

      <div class="section-heading">Recent Achievements</div>
      <div class="recent-list">
        ${progress.recent.length === 0 ? '<div class="empty-state">No challenges solved yet. Boot the lab and start hacking!</div>' : ''}
        ${progress.recent.map(ch => `
          <div class="recent-item">
            <div class="recent-name">${this.escapeHtml(ch.name)}</div>
            <div class="recent-xp">+${ch.xp}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  updateXP(newXP, percent, leveledUp) {
    const xpSection = document.getElementById('xpSection');
    if (xpSection) {
      const fill = document.getElementById('xpBarFill');
      // scaleX instead of width: the bar animates on the compositor (see overlay.css).
      if (fill) fill.style.transform = `scaleX(${percent / 100})`;
      
      const current = xpSection.querySelector('.xp-current');
      if (current) current.textContent = `${newXP} XP`;
      
      if (leveledUp) {
        const glow = document.getElementById('levelUpGlow');
        if (glow) {
          glow.classList.remove('active');
          void glow.offsetWidth; // trigger reflow
          glow.classList.add('active');
        }
        // Re-render whole dashboard to update level numbers
        setTimeout(() => this.renderDashboard(), 1000);
      }
    } else {
      this.renderDashboard();
    }
  }

  showAchievementToast(result) {
    if (!this.toastsContainer) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    const leveledUp = !!result.leveledUp;
    if (leveledUp) toast.classList.add('level-up');

    // Confetti is reserved for level-ups: one short fall (cc-confetti in motion.css).
    if (leveledUp) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-container';
      for (let i = 0; i < 16; i++) {
        const c = document.createElement('div');
        c.className = i % 3 === 0 ? 'confetti confetti-accent' : 'confetti';
        c.style.left = `${Math.random() * 100}%`;
        c.style.animationDelay = `${Math.round(Math.random() * 200)}ms`;
        confetti.appendChild(c);
      }
      toast.appendChild(confetti);
    }

    const challengeInfo = result.info || {};
    const challengeName = typeof result.challenge === 'string' 
      ? result.challenge 
      : (result.challenge && result.challenge.name) || 'Challenge';
    const xpAmount = result.xpGained || result.xp || 0;

    const moduleLink = challengeInfo.module 
      ? `<div class="toast-link" onclick="window.__overlay.goToModule('${challengeInfo.module}')">Review Module</div>`
      : '';

    let levelLine = '';
    if (leveledUp && this.state && typeof this.state.getProgress === 'function') {
      const p = this.state.getProgress();
      levelLine = `<div class="toast-level">Level ${p.level} &middot; ${this.escapeHtml(p.levelName)}</div>`;
    }

    toast.innerHTML += `
      <div class="toast-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/></svg></div>
      <div class="toast-content">
        <div class="toast-title">Challenge Solved</div>
        <div class="toast-challenge">${this.escapeHtml(challengeName)}</div>
        <div class="toast-xp">+${xpAmount} XP</div>
        ${levelLine}
        ${moduleLink}
      </div>
      <button class="toast-close" onclick="this.parentElement.classList.add('hiding'); setTimeout(() => this.parentElement.remove(), 400)">✕</button>
    `;

    this.toastsContainer.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.add('hiding');
        setTimeout(() => {
          if (document.body.contains(toast)) toast.remove();
        }, 400);
      }
    }, 6000);
  }

  showContextHint(hint) {
    if (!this.hintContainer) return;
    
    if (!hint) {
      this.hideContextHint();
      return;
    }

    const modulesHtml = (hint.relatedModules || []).map(m => 
      `<span class="hint-module-badge">${m}</span>`
    ).join('');

    this.hintContainer.innerHTML = `
      <div class="context-hint-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
      <div class="context-hint-content">
        <div class="context-hint-title">${this.escapeHtml(hint.title)}</div>
        <div class="context-hint-body">${this.escapeHtml(hint.body)}</div>
        <div class="context-hint-modules">${modulesHtml}</div>
      </div>
      <button class="context-hint-close" onclick="window.__overlay.renderer.hideContextHint()">✕</button>
    `;
    
    this.hintContainer.style.display = 'flex';
    this.hintContainer.classList.remove('hiding');
  }

  hideContextHint() {
    if (!this.hintContainer || this.hintContainer.style.display === 'none') return;
    this.hintContainer.classList.add('hiding');
    setTimeout(() => {
      this.hintContainer.style.display = 'none';
      this.hintContainer.classList.remove('hiding');
    }, 300);
  }

  escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialization & Bridge
// ═══════════════════════════════════════════════════════════════════════════════

const stateManager = new TutorialStateManager();
const overlayRenderer = new OverlayRenderer(stateManager);

window.__overlay = {
  stateManager,
  renderer: overlayRenderer,
  
  async init(webviewEl) {
    await stateManager.loadData();
    stateManager.restore();
    overlayRenderer.renderDashboard();

    // Listen to IPC messages from the webview
    webviewEl.addEventListener('ipc-message', (event) => {
      if (event.channel === 'challenge:solved') {
        const result = stateManager.handleChallengeSolved(event.args[0]);
        if (result) {
          overlayRenderer.showAchievementToast(result);
          const prog = stateManager.getProgress();
          overlayRenderer.updateXP(prog.totalXP, prog.xpPercent, result.leveledUp);
          
          // Re-render dashboard after a slight delay to show it in the recent list
          setTimeout(() => overlayRenderer.renderDashboard(), 1000);
        }
      } 
      else if (event.channel === 'challenges:sync') {
        const result = stateManager.handleChallengesSync(event.args[0]);
        if (result && result.stateChanged) {
          overlayRenderer.renderDashboard();
        }
      }
      else if (event.channel === 'page:changed') {
        const hint = stateManager.handlePageChange(event.args[0]);
        if (hint) {
          overlayRenderer.showContextHint(hint);
        } else {
          overlayRenderer.hideContextHint();
        }
      }
      else if (event.channel === 'juiceshop:ready') {
        console.log('Juice Shop / CyberMart loaded inside Webview');
      }
      else if (event.channel === 'cybermart:proxy-request') {
        const { id, email, password } = event.args[0];
        // Store the pending proxy ID so Forward/Drop can reply
        if (window.__app) {
          window.__app.triggerBurpSimIntercept(id,
            `POST /rest/user/login HTTP/1.1\nHost: cyber-mart.local\nContent-Type: application/json\n\n{"email":"${email}","password":"${password}"}`
          );
        }
      }
    });

    // Also listen for main process backup API hits
    if (window.labAPI && window.labAPI.onJuiceshopApiHit) {
      window.labAPI.onJuiceshopApiHit((data) => {
        // We could trigger a manual webview refresh here if needed
      });
    }

    // Periodic bulk sync so XP still tracks if the realtime hook misses an event.
    // Only polls while the webview is actually showing (saves work in Study/SOC mode).
    if (this._syncTimer) clearInterval(this._syncTimer);
    this._syncTimer = setInterval(() => {
      const labVisible = typeof window.__app?.isLabMode === 'function' ? window.__app.isLabMode() : true;
      if (labVisible && webviewEl && webviewEl.executeJavaScript && webviewEl.isConnected) {
        webviewEl.executeJavaScript("fetch('/api/Challenges').catch(function(){})").catch(() => {});
      }
    }, 5000);
  },

  goToModule(moduleId) {
    // Exit lab mode so the module content is visible.
    if (window.__app && window.__app.isLabMode && window.__app.isLabMode() && window.__app.toggleLabMode) {
      window.__app.toggleLabMode();
    }
    // Prefer the app's own selector; fall back to matching nav items by data-module.
    if (window.__app && typeof window.__app.selectModuleById === 'function') {
      window.__app.selectModuleById(moduleId);
      return;
    }
    const item = document.querySelector(`.nav-item[data-module="${moduleId}"]`);
    if (item) item.click();
  }
};
