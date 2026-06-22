# LumeCortex — Sweep 3: Make It Truly Useable
**Verified against commit:** `601b075`  
**Date:** June 21, 2026  
**For:** Gemini Implementation Agent

Read this entire document before writing a single line of code. Apply fixes in order. Push when done.

---

## The Big Picture: What's Broken and Why

After two cleanup sweeps, the repo is structurally clean. But the app still isn't useable because:

1. **The Chat page shows "Coming Soon" — even though the full chat UI is already written.** This is the most important fix. The code exists, it just isn't being called.
2. **The home screen AI widget is disabled.** Same issue — the backend connection exists, the widget is just artificially disabled.
3. **Weather shows fake data** derived from a math hash of the city name.
4. **Signal Chat has no backend** — looks live, does nothing.
5. **Bookmarks use browser `prompt()` dialogs** inside a premium OS UI.

---

## Fix 1 — Chat Page: The Full UI Is Already Written, Just Not Called

**This is the single most important fix.**

**File:** `src/lume/06_signals.lume`

The `renderChat()` function at the top of the file currently shows this placeholder:

```javascript
function renderChat(container) {
  define layout = dom.create('div', { className: 'chat-layout', styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', textAlign: 'center', padding: '2rem' } })
  
  define avatar = dom.create('div', { className: 'welcome-avatar', styles: { opacity: '0.5', marginBottom: '1rem', fontSize: '3rem' } })
  avatar.textContent = '⚛'
  layout.appendChild(avatar)

  define title = dom.create('h2', { className: 'welcome-title', styles: { color: 'var(--cyan)', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800' } })
  title.textContent = 'Axiom42 Agent'
  layout.appendChild(title)

  define subtitle = dom.create('p', { className: 'welcome-subtitle', styles: { color: 'var(--t2)', maxWidth: '400px', lineHeight: '1.5' } })
  subtitle.textContent = 'Coming Soon. The autonomous deterministic agent is currently undergoing Trust Layer certification and will be available shortly.'
  layout.appendChild(subtitle)

  container.appendChild(layout)
}
```

**Everything below this function** — `showAxiomWelcome()`, `startConversationWith()`, `sendChatMessage()`, `loadChatConversation()`, `appendChatMsg()`, `populateChatSidebar()` — is fully implemented and working. The full chat UI exists. It's just not being called.

**Replace the entire `renderChat()` function with this:**

```javascript
function renderChat(container) {
  define active = activeConversation.get()
  define convs = conversations.get()

  /// ── Outer layout ──
  define layout = dom.create('div', { className: 'chat-layout', styles: { display: 'flex', height: '100%', overflow: 'hidden' } })

  /// ── Sidebar ──
  define sidebar = dom.create('div', { className: 'chat-sidebar' })

  define newBtn = dom.create('button', {
    className: 'new-conv-btn',
    html: '＋ New Conversation',
    onClick: createNewConversation
  })
  sidebar.appendChild(newBtn)

  define convList = dom.create('div', { className: 'conv-list', id: 'chat-conv-list' })
  sidebar.appendChild(convList)
  layout.appendChild(sidebar)

  /// ── Main area ──
  define main = dom.create('div', { className: 'chat-main', styles: { flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' } })

  define chatHeader = dom.create('div', { className: 'chat-header' })
  define chatTitle = dom.create('div', { className: 'chat-title', id: 'active-chat-title', text: active ? (active.title || 'Conversation') : 'Axiom42 Agent' })
  chatHeader.appendChild(chatTitle)
  main.appendChild(chatHeader)

  define msgArea = dom.create('div', { className: 'chat-msg-area', id: 'chat-msg-area' })
  main.appendChild(msgArea)

  /// Typing indicator
  define typing = dom.create('div', { className: 'chat-typing', id: 'chat-typing', styles: { display: 'none' } })
  typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>'
  main.appendChild(typing)

  /// Input bar
  define inputBar = dom.create('div', {
    className: 'chat-input-bar', id: 'chat-input-bar',
    styles: { display: active ? 'flex' : 'none' }
  })
  define textInput = dom.create('input', {
    className: 'chat-text-input', id: 'chat-text-input',
    attrs: { type: 'text', placeholder: 'Ask Axiom anything...', autocomplete: 'off' },
    onKeydown: (e) => { if (e.key === 'Enter') sendChatMessage() }
  })
  define sendBtn = dom.create('button', { className: 'chat-send-btn', html: '→', onClick: sendChatMessage })
  inputBar.appendChild(textInput)
  inputBar.appendChild(sendBtn)
  main.appendChild(inputBar)

  layout.appendChild(main)
  container.appendChild(layout)

  /// Populate sidebar and load active conversation
  populateChatSidebar()
  if (active) {
    loadChatConversation(active.id, active.title)
  } else {
    showAxiomWelcome(msgArea)
  }

  window.sendChatMessage = sendChatMessage
  window.createNewConversation = createNewConversation
}
```

**Also add these CSS classes** to `src/lume/01c_styles_pages.lume` or the nearest styles file if they don't already exist:

```css
.chat-layout { display: flex; height: 100%; overflow: hidden; }
.chat-sidebar { width: 220px; border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; padding: 0.75rem; gap: 0.5rem; overflow-y: auto; }
.chat-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.chat-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--glass-border); }
.chat-title { font-size: 0.85rem; font-weight: 700; color: var(--t1); }
.chat-msg-area { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.chat-input-bar { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid var(--glass-border); }
.chat-text-input { flex: 1; background: var(--card); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.5rem 0.75rem; color: var(--t1); font-size: 0.78rem; font-family: var(--sans); outline: none; }
.chat-text-input:focus { border-color: var(--cyan); }
.chat-send-btn { background: var(--cyan); color: #000; border: none; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
.chat-typing { display: flex; align-items: center; gap: 4px; padding: 0.5rem 1rem; }
.typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); opacity: 0.5; animation: typingPulse 1.2s ease-in-out infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingPulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
.new-conv-btn { width: 100%; padding: 0.5rem; background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); border-radius: 8px; color: var(--cyan); font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: var(--sans); }
.conv-item { padding: 0.5rem 0.6rem; border-radius: 8px; cursor: pointer; border: 1px solid transparent; }
.conv-item:hover, .conv-item.active { background: rgba(6,182,212,0.06); border-color: rgba(6,182,212,0.15); }
.conv-item-title { font-size: 0.72rem; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-item-meta { font-size: 0.55rem; color: var(--t3); margin-top: 0.15rem; }
.msg { max-width: 80%; padding: 0.6rem 0.85rem; border-radius: 12px; font-size: 0.78rem; line-height: 1.6; }
.msg.user { align-self: flex-end; background: var(--cyan); color: #000; border-radius: 12px 12px 2px 12px; }
.msg.agent { align-self: flex-start; background: var(--card); border: 1px solid var(--glass-border); border-radius: 12px 12px 12px 2px; }
.msg-sender { font-size: 0.55rem; font-weight: 700; color: var(--cyan); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 4px; }
.msg-agent-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); }
.msg-body { color: var(--t1); }
.meta { font-size: 0.5rem; color: var(--t3); margin-top: 0.25rem; font-family: var(--mono); }
```

**Before you finish Fix 1, verify:** Open the app, click Chat in the dock, confirm you see the welcome screen with suggestion chips and a working input bar, not "Coming Soon."

---

## Fix 2 — Home Dashboard: Enable the AI Chat Widget

**File:** `src/lume/05_dashboard.lume` — `renderChatWidget()` function

The current widget is fully disabled. Replace the entire `renderChatWidget()` function with a live version that wires to `sendHomeMessage()`:

```javascript
function renderChatWidget(card) {
  define wrap = dom.create('div')
  wrap.appendChild(dom.create('div', { className: 'widget-title', text: '💬 Ask Axiom' }))
  define inputWrap = dom.create('div', { styles: { display: 'flex', gap: '0.3rem' } })
  define input = dom.create('input', {
    className: 'chat-widget-input',
    id: 'home-input',
    attrs: { type: 'text', placeholder: 'Ask anything...', autocomplete: 'off' },
    onKeydown: (e) => { if (e.key === 'Enter' && e.target.value.trim()) sendHomeMessage(e.target.value.trim()) }
  })
  define btn = dom.create('button', {
    className: 'chat-widget-btn', text: '→',
    onClick: () => {
      define val = dom.select('#home-input')
      if (val && val.value.trim()) sendHomeMessage(val.value.trim())
    }
  })
  inputWrap.appendChild(input)
  inputWrap.appendChild(btn)
  wrap.appendChild(inputWrap)
  card.appendChild(wrap)
}
```

---

## Fix 3 — Weather Widget: Real Data or Clear Demo Label

**File:** `src/lume/05_dashboard.lume` — `renderWeatherWidget()` function

**Option A — OpenWeatherMap (preferred):**

Get Jason's approval to use the OpenWeatherMap free API key (1,000 calls/day free). Replace the hash-based fake data with a real fetch:

```javascript
function renderWeatherWidget(card) {
  define wrap = dom.create('div', { className: 'weather-widget' })
  wrap.innerHTML = '<div class="ww-loading" style="color:var(--t3);font-size:0.7rem">Loading weather...</div>'
  card.appendChild(wrap)

  let loc = window.localStorage.getItem('cortex-location') || 'Nashville,TN,US'

  fetch('https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(loc) + '&appid=YOUR_OWM_KEY&units=imperial')
    .then(r => r.json())
    .then(d => {
      define temp = Math.round(d.main?.temp || 0)
      define high = Math.round(d.main?.temp_max || temp)
      define low = Math.round(d.main?.temp_min || temp)
      define cond = d.weather?.[0]?.description || 'Clear'
      define city = d.name || loc
      wrap.innerHTML = '<div class="ww-temp">' + temp + '°F</div><div class="ww-info"><div class="ww-loc">' + city + '</div><div class="ww-cond">' + cond + ' · H:' + high + '° L:' + low + '°</div></div>'
    })
    .catch(() => {
      wrap.innerHTML = '<div class="ww-temp">—°</div><div class="ww-info"><div class="ww-loc">' + loc + '</div><div class="ww-cond">Weather unavailable</div></div>'
    })
}
```

Replace `YOUR_OWM_KEY` with the actual API key. Ask Jason for it before implementing.

**Option B — Demo label (if no API key yet):**

Just add `(Demo)` to the widget title so users know it's not live:

```javascript
/// Change this line in renderWeatherWidget():
wrap.innerHTML = '<div class="ww-temp">' + temp + '°</div>...'
/// Add to widget title:
wrap.appendChild(dom.create('div', { text: '☀ Weather (Demo)', ... }))
```

---

## Fix 4 — Signal Chat: Connect or Hide

**File:** `src/lume/03_shell.lume`

Signal Chat currently has a UI panel but `sendSignalMsg()` appends messages locally with no backend. **Two options — ask Jason which to do:**

**Option A — Hide it until it's real:**  
Remove the signal bubble entirely from the shell. Delete these two blocks from `buildShell()`:
- The `signalBubble` button creation and `root.appendChild(signalBubble)`  
- The `signalPanel` creation and `root.appendChild(signalPanel)`

**Option B — Connect to a real backend:**  
Wire `sendSignalMsg()` to a WebSocket or polling endpoint. Requires a backend chat service. This is a larger feature — scope it separately with Jason before building.

**Recommendation:** Hide it for now (Option A). A broken chat feature visible to 500 new users is worse than no chat feature.

---

## Fix 5 — Bookmarks: Replace prompt() with In-OS Modal

**File:** `src/lume/05_dashboard.lume` — `renderBookmarksWidget()` function

Find the add button click handler:
```javascript
onClick: () => {
  define label = prompt('Link name:')
  define url = prompt('URL:')
  if (label && url) {
    bookmarks.push({ label, url: url.startsWith('http') ? url : 'https://' + url })
    saveBookmarks(bookmarks)
    navigateTo('home')
  }
}
```

Replace with an in-OS modal (same pattern as `showWidgetConfigurator`):
```javascript
onClick: () => {
  define existing = dom.select('#bm-add-modal')
  if (existing) existing.remove()

  define overlay = dom.create('div', { id: 'bm-add-modal', className: 'wc-overlay', onClick: (e) => { if (e.target === overlay) overlay.remove() } })
  define panel = dom.create('div', { className: 'wc-panel', styles: { maxWidth: '320px' } })
  panel.innerHTML = '<div class="wc-header"><span>⭐ Add Bookmark</span><button class="wc-close" onclick="document.getElementById(\'bm-add-modal\').remove()">✕</button></div>'

  define form = dom.create('div', { styles: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' } })
  define labelInput = dom.create('input', { attrs: { type: 'text', placeholder: 'Name (e.g. GitHub)', id: 'bm-label-input' }, className: 'chat-text-input' })
  define urlInput = dom.create('input', { attrs: { type: 'text', placeholder: 'URL (e.g. github.com)', id: 'bm-url-input' }, className: 'chat-text-input' })
  define saveBtn = dom.create('button', {
    className: 'wc-apply', text: 'Add Bookmark',
    onClick: () => {
      define l = dom.select('#bm-label-input').value.trim()
      define u = dom.select('#bm-url-input').value.trim()
      if (l && u) {
        bookmarks.push({ label: l, url: u.startsWith('http') ? u : 'https://' + u })
        saveBookmarks(bookmarks)
        overlay.remove()
        navigateTo('home')
      }
    }
  })
  form.appendChild(labelInput)
  form.appendChild(urlInput)
  form.appendChild(saveBtn)
  panel.appendChild(form)
  overlay.appendChild(panel)
  document.body.appendChild(overlay)
  setTimeout(() => dom.select('#bm-label-input').focus(), 50)
}
```

---

## Fix 6 — API_BASE Still Points to Render

**File:** `src/lume/02_router.lume`

```javascript
define API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://lume-cortex.onrender.com'
```

Once the Coolify migration is complete, update `'https://lume-cortex.onrender.com'` to the new Coolify domain. **Do not change this until Jason confirms the Coolify backend is live.** Leave it pointing to Render for now.

---

## Verification Checklist (Run Through These After Every Fix)

Before pushing, manually test each of these in the browser:

- [ ] Click **Chat** in the dock → see Axiom welcome screen with suggestion chips, not "Coming Soon"
- [ ] Click a suggestion chip → conversation starts, agent responds
- [ ] Type a message and press Enter → sends and gets a response
- [ ] Click **+ New Conversation** → creates a new conversation
- [ ] On the Home dashboard → "Ask Axiom" widget has an active input, not grayed out
- [ ] Type in the home AI widget → navigates to Chat with the message queued
- [ ] Click a bookmark's **+ Add link** → in-OS modal appears, not a browser prompt
- [ ] Open Launchpad → click Axiom Studio → native install modal appears with SmartScreen warning text
- [ ] Weather widget shows data (real or labeled Demo — not silently fake)
- [ ] Signal Chat bubble either works or is gone — it is not showing as active when it isn't

---

## After All Fixes

```bash
git add -A
git commit -m "feat: enable chat, home AI widget, bookmarks modal, weather, signal chat cleanup"
git push origin main
```

Do not mark complete until the push is confirmed and you have run through the verification checklist above.
