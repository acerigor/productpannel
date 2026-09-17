# BuySmart — starter kit

Dark-themed HTML/CSS/JS starter, seeded from the Dialpad CoreConnect design system.
No build step — open `index.html` in any browser.

## Layout

```
buysmart/
├── index.html          ← skeleton page (top-header + sidebar + main area)
├── README.md           ← this file
└── shared/             ← the whole design system, 12 files
    ├── app.css                 ← core tokens + top-header, sidebar, modal, table, form, toast, notif, drawer
    ├── contact-panel.css       ← .assign-popup, .lblp-* rows, contact panel
    ├── settings.css            ← .set-page-head, .set-scroll, .ur-back, .ur-row
    ├── date-picker.css / date-picker.js       ← CCDatePicker.open({...})
    ├── time-picker.css / time-picker.js       ← CCTimePicker.open({...})
    ├── dialer.css / dialer.js                 ← optional dialer widget
    ├── notifications.js        ← notif panel behavior
    ├── contact-panel.js        ← contact panel behavior
    └── leads-comms.js          ← CCLeads.TEAM sample roster (delete or replace with your data)
```

## CSS design tokens (defined in `shared/app.css` `:root`)

| Variable | Purpose |
|---|---|
| `--bg` | Page background |
| `--sur` | Surface / card |
| `--sur2` | Secondary surface (inputs, buttons, hover) |
| `--brd`, `--brd2` | Borders |
| `--tx` | Primary text |
| `--mu` | Muted text |
| `--ac`, `--ac2` | Accent (blue) — fills / links |
| `--gr` | Green (success) |
| `--rd` | Red (destructive) |
| `--am` | Amber (warning) |
| `--font` | Body font family |
| `--mono` | Mono font family |

## Reusable classes

### Layout & shell

```html
<div class="top-header">
  <div class="th-left">
    <button class="hamburger-btn" onclick="toggleMobileDrawer()">…svg…</button>
    <div class="logo"><div class="logo-mark">…</div><span class="logo-text">BuySmart</span></div>
  </div>
  <div class="top-header-right">
    <button class="header-bell" onclick="toggleNotifications(event)">…</button>
  </div>
</div>

<div class="sidebar">
  <div class="sidebar-nav">
    <div class="sb-item active" data-label="Home" onclick="navClick('Home')">…svg…</div>
    <div class="sb-item" data-label="Settings" onclick="navClick('Settings')">…svg…</div>
  </div>
  <div class="sb-account">BS</div>
</div>

<div class="mobile-drawer-backdrop" onclick="closeMobileDrawer()"></div>
<div class="mobile-drawer">
  <div class="md-nav">
    <div class="md-item"><svg/><span>Home</span></div>
  </div>
</div>
```

### Page head

```html
<div class="set-page-head">
  <a class="ur-back" href="…"><svg/><span>Back</span></a>
  <span class="set-page-title">Page title</span>
</div>
<div class="set-scroll">
  <section class="set-section">…</section>
</div>
```

### Modal (add `modal-fullscreen-mobile` for full-screen on phones)

```html
<div class="modal-backdrop modal-fullscreen-mobile" id="my-modal" onclick="if(event.target===this)closeMyModal()">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Title</div>
      <button class="modal-close" onclick="closeMyModal()">✕</button>
    </div>
    <div class="modal-body">
      <div>
        <div class="modal-section-title">Field label</div>
        <div class="modal-field"><input type="text"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="modal-cancel" onclick="closeMyModal()">Cancel</button>
      <button class="modal-save" onclick="saveMyModal()">Save</button>
    </div>
  </div>
</div>
```
Open/close: `element.classList.add('open')` / `.remove('open')`.

### Select-shell (custom popup dropdown inside `.modal-field`)

```html
<div class="modal-field" id="my-field">
  <button type="button" class="form-select-btn" onclick="openMyPopup(event)">
    <span class="form-select-val form-select-mu" id="my-val">Select</span>
    <svg class="form-select-chev">…chevron…</svg>
  </button>
</div>
<input type="hidden" id="my-hidden" value=""/>

<div class="assign-popup" id="my-popup" style="display:none;">
  <div class="lblp-list" id="my-list"></div>
</div>
```
Pair with `.assign-popup` positioned via `getBoundingClientRect()` and toggle
`.modal-field.open` on the field to rotate the chevron.

### Multi-select / picker rows

```html
<div class="lblp-item on" onclick="pick('id1')">
  <span class="lblp-dot" style="background:#22c88a;"></span>
  <span class="lblp-name">Positive</span>
  <span class="lblp-check"><svg/></span>
</div>
```
`.on` toggles the trailing green check.

### Data table

```html
<div class="table-wrap">
  <table class="data-table data-table--right-actions">
    <thead><tr><th>Name</th><th>Value</th><th></th></tr></thead>
    <tbody>
      <tr>
        <td>Alice</td>
        <td>Foo</td>
        <td><button class="list-action-btn del"><svg/>Delete</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Buttons

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>

<div class="period-toggle" role="tablist">
  <button class="pt-seg active">Daily</button>
  <button class="pt-seg">Weekly</button>
</div>
```

### Search pill

```html
<div class="search-pill">
  <svg>…magnifier…</svg>
  <input type="text" placeholder="Search…" oninput="onSearch(this.value)"/>
</div>
```

### Nav toast

```html
<div class="nav-toast" id="nav-toast">
  <div class="nav-toast-icon"><svg/></div>
  <div class="nav-toast-text">
    <strong id="nav-toast-title">Title</strong>
    <span id="nav-toast-body">Body</span>
  </div>
  <button class="nav-toast-close" onclick="hideNavToast()">✕</button>
</div>
```
JS: `showNavToast(title, body)` and `hideNavToast()`.

### Card grid (Settings hub pattern)

```html
<div class="set-grid">
  <div class="set-card" onclick="…">
    <div class="set-card-ic"><svg/></div>
    <div class="set-card-txt">
      <div class="set-card-title">Card title</div>
      <div class="set-card-sub">Subtitle</div>
    </div>
  </div>
</div>
```

### List rows (settings sub-page)

```html
<div class="ur-list">
  <div class="ur-row">
    <div class="ur-row-ic"><svg/></div>
    <div class="ur-row-txt">
      <div class="ur-row-title">Row title</div>
      <div class="ur-row-sub">Row subtitle</div>
    </div>
    <div class="ur-row-actions"><button class="list-action-btn">Edit</button></div>
  </div>
</div>
```

## JS globals

| API | Purpose |
|---|---|
| `showNavToast(title, body)` / `hideNavToast()` | Fire the corner toast (see `index.html`) |
| `toggleMobileDrawer()` / `closeMobileDrawer()` | Hamburger drawer |
| `toggleNotifications(e)` / `closeNotifications()` | Notif panel |
| `CCDatePicker.open({anchor, value, onChange})` | Date picker popup |
| `CCTimePicker.open({anchor, value, onChange})` | Time picker popup |
| `CCLeads.TEAM` | Sample roster in `leads-comms.js` — edit or clear once you have real data |

## Getting started

1. Open `index.html` in a browser. You should see the BuySmart top-header, sidebar, and an empty content area.
2. Add your pages inside `set-scroll > set-section`.
3. New pages? Copy `index.html`, change the `set-page-title`, drop content in.
4. New components? Prefer combining the shared classes above before writing new CSS. Every class in this cheatsheet lives in `shared/*.css` and stays consistent app-wide.

## Notes

- No build step. Vanilla HTML/CSS/JS. Works from `file://` or any static server.
- Dark theme only. All colors reference the CSS variables above; override in a project-local `<style>` block to rebrand.
- `leads-comms.js` ships with 18 sample team members under `CCLeads.TEAM`. Delete or replace once you have real data.
