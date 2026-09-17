/* BuySmart shell — top header, notifications panel, sidebar, mobile drawer, nav toast.
   Call BuySmartShell.init({ page, title }) once per page after the shell's script
   tags have loaded. Page keys: home, runlist, purchase, alert settings,
   purchase location, sheet queue, data queue, bid queue, add new bucket, settings. */
(function(){
  var THEME_STORE = 'buysmart:theme';
  function loadTheme(){
    try { var v = localStorage.getItem(THEME_STORE); return (v === 'light') ? 'light' : 'dark'; }
    catch(e){ return 'dark'; }
  }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  }
  applyTheme(loadTheme());
  window.toggleTheme = function(){
    var next = (loadTheme() === 'light') ? 'dark' : 'light';
    try { localStorage.setItem(THEME_STORE, next); } catch(e){}
    applyTheme(next);
  };

  var NAV_ROUTES = {
    'Dashboard': 'index.html',
    'Products': 'organization_list.html',
    'Runlist': 'runlist.html',
    'Purchase': 'purchase.html',
    'Alert Settings': 'alertsettings.html',
    'Purchase Location': 'purchaselocation.html',
    'Settings': 'settings.html',
    'Account': 'account.html'
    // Sheet Queue / Data Queue / Bid Queue / Add New Bucket — no page yet; toast fallback.
  };

  var SHELL_HTML = [
    '<div class="top-header">',
    '  <div class="th-left" style="display:flex;align-items:center;gap:10px;">',
    '    <button class="hamburger-btn" id="hamburger-btn" onclick="toggleMobileDrawer()" aria-label="Open menu">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    '    </button>',
    '    <div class="logo" onclick="toggleProductSwitcher(event)">',
    '      <div class="logo-mark" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg class="logo-mark-svg" viewBox="0 0 324 221" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BuySmart logo" style="width:100%;height:100%;"><path d="M72.30,32.52 L72.30,32.52 Q85.97,12.00 110.63,12.00 L246.25,12.00 Q270.90,12.00 257.23,32.52 L210.61,102.44 Q196.93,122.96 172.27,122.96 L36.66,122.96 Q12.00,122.96 25.68,102.44 Z" fill="#1E6BFF"/><path d="M113.39,118.82 L113.39,118.82 Q127.07,98.30 151.73,98.30 L287.34,98.30 Q312.00,98.30 298.32,118.82 L251.70,188.74 Q238.03,209.26 213.37,209.26 L77.75,209.26 Q53.10,209.26 66.77,188.74 Z" fill="#3D3DCC"/></svg></div>',
    '      <span class="logo-text">CorePanel</span>',
    '      <svg class="logo-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
    '    </div>',
    '  </div>',
    '  <div class="th-search assign-search" id="th-search-wrap" onclick="thExpand()">',
    '    <button type="button" class="th-search-back" onclick="event.stopPropagation();thCollapse()" aria-label="Close search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button>',
    '    <svg class="th-search-magnifier" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    '    <input id="th-search-input" type="text" placeholder="Search organizations" autocomplete="off" oninput="thSearch(this.value)" onfocus="thSearch(this.value)" onkeydown="thSearchKey(event)"/>',
    '    <button type="button" class="th-search-clear" onclick="event.stopPropagation();thClear()" aria-label="Clear search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
    '    <div class="th-search-menu" id="th-search-menu" role="listbox"></div>',
    '  </div>',
    '  <div class="top-header-right">',
    '    <button class="header-theme" id="header-theme" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle theme">',
    '      <svg class="th-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    '      <svg class="th-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    '    </button>',
    '    <button class="header-bell" id="header-bell" data-label="Notifications" onclick="toggleNotifications(event)" aria-label="Notifications">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    '      <span class="header-bell-dot" id="header-bell-dot"></span>',
    '    </button>',
    '  </div>',
    '</div>',

    '<div class="notif-panel" id="notif-panel">',
    '  <div class="notif-header">',
    '    <span class="notif-title">Notifications</span>',
    '    <div class="notif-header-actions">',
    '      <div class="notif-toggle-row">',
    '        <span class="tog off" id="notif-unread-tog" onclick="toggleUnreadComments()"></span>',
    '        <span class="notif-toggle-label">Unread</span>',
    '      </div>',
    '      <button class="notif-close" onclick="closeNotifications()" aria-label="Close">',
    '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '      </button>',
    '    </div>',
    '  </div>',
    '  <div class="notif-tabs">',
    '    <button class="notif-tab active" data-tab="all" onclick="setNotifTab(\'all\')">All <span class="notif-tab-count" id="notif-count-all">0</span></button>',
    '    <button class="notif-tab" data-tab="unread" onclick="setNotifTab(\'unread\')">Unread <span class="notif-tab-count" id="notif-count-unread">0</span></button>',
    '  </div>',
    '  <div class="notif-body" id="notif-body"></div>',
    '  <div class="notif-footer">',
    '    <button class="notif-viewall" onclick="viewAllNotifications()">View All Notification</button>',
    '  </div>',
    '</div>',

    '<div class="sidebar">',
    '  <div class="sidebar-nav">',
    '    <div class="sb-item" data-nav="home" data-label="Dashboard" onclick="navClick(\'Dashboard\')">',
    '      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 13.5H15"/><path d="M9.5 13.5V9.5H6.5V13.5"/><path d="M2.5 7.29309V13.5"/><path d="M13.5 13.5V7.29309"/><path d="M1.5 8.29315L7.64625 2.14628C7.69269 2.09979 7.74783 2.06291 7.80853 2.03775C7.86923 2.01259 7.93429 1.99963 8 1.99963C8.06571 1.99963 8.13077 2.01259 8.19147 2.03775C8.25217 2.06291 8.30731 2.09979 8.35375 2.14628L14.5 8.29315"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="products" data-label="Products" onclick="navClick(\'Products\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="runlist" data-label="Runlist" onclick="navClick(\'Runlist\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="purchase" data-label="Purchase" onclick="navClick(\'Purchase\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="alert settings" data-label="Alert Settings" onclick="navClick(\'Alert Settings\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="purchase location" data-label="Purchase Location" onclick="navClick(\'Purchase Location\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="sheet queue" data-label="Sheet Queue" onclick="navClick(\'Sheet Queue\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="data queue" data-label="Data Queue" onclick="navClick(\'Data Queue\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
    '    </div>',
    '    <div class="sb-item" data-nav="bid queue" data-label="Bid Queue" onclick="navClick(\'Bid Queue\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 13-8.5 8.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/><path d="M14 21h7"/></svg>',
    '    </div>',
    '    <div class="sb-item" id="sb-add-bucket" data-nav="add new bucket" data-label="Add New Bucket" onclick="navClick(\'Add New Bucket\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    '    </div>',
    '    <div class="sidebar-nav-spacer"></div>',
    '    <div class="sb-divider"></div>',
    '    <div class="sb-item" data-nav="settings" data-label="Settings" onclick="navClick(\'Settings\')">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    '    </div>',
    '  </div>',
    '  <div class="sb-account" title="Account" onclick="navClick(\'Account\')">BS</div>',
    '</div>',

    '<div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop" onclick="closeMobileDrawer()"></div>',
    '<div class="mobile-drawer" id="mobile-drawer">',
    '  <div class="md-nav">',
    '    <div class="md-item" data-nav="home" onclick="navClick(\'Dashboard\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 13.5H15"/><path d="M9.5 13.5V9.5H6.5V13.5"/><path d="M2.5 7.29309V13.5"/><path d="M13.5 13.5V7.29309"/><path d="M1.5 8.29315L7.64625 2.14628C7.69269 2.09979 7.74783 2.06291 7.80853 2.03775C7.86923 2.01259 7.93429 1.99963 8 1.99963C8.06571 1.99963 8.13077 2.01259 8.19147 2.03775C8.25217 2.06291 8.30731 2.09979 8.35375 2.14628L14.5 8.29315"/></svg>',
    '      <span>Dashboard</span>',
    '    </div>',
    '    <div class="md-item" data-nav="products" onclick="navClick(\'Products\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    '      <span>Products</span>',
    '    </div>',
    '    <div class="md-item" data-nav="runlist" onclick="navClick(\'Runlist\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    '      <span>Runlist</span>',
    '    </div>',
    '    <div class="md-item" data-nav="purchase" onclick="navClick(\'Purchase\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    '      <span>Purchase</span>',
    '    </div>',
    '    <div class="md-item" data-nav="alert settings" onclick="navClick(\'Alert Settings\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    '      <span>Alert Settings</span>',
    '    </div>',
    '    <div class="md-item" data-nav="purchase location" onclick="navClick(\'Purchase Location\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    '      <span>Purchase Location</span>',
    '    </div>',
    '    <div class="md-item" data-nav="sheet queue" onclick="navClick(\'Sheet Queue\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    '      <span>Sheet Queue</span>',
    '    </div>',
    '    <div class="md-item" data-nav="data queue" onclick="navClick(\'Data Queue\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
    '      <span>Data Queue</span>',
    '    </div>',
    '    <div class="md-item" data-nav="bid queue" onclick="navClick(\'Bid Queue\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 13-8.5 8.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/><path d="M14 21h7"/></svg>',
    '      <span>Bid Queue</span>',
    '    </div>',
    '    <div class="md-item" id="md-add-bucket" data-nav="add new bucket" onclick="navClick(\'Add New Bucket\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    '      <span>Add New Bucket</span>',
    '    </div>',
    '    <div class="md-divider"></div>',
    '    <div class="md-item" data-nav="settings" onclick="navClick(\'Settings\');closeMobileDrawer();">',
    '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>',
    '      <span>Settings</span>',
    '    </div>',
    '  </div>',
    '</div>',

    '<div class="product-switcher" id="product-switcher">',
    '  <a class="ps-item ps-active" data-pid="buysmart" href="index.html">',
    '    <svg class="ps-ic" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    '    <span>CorePanel</span>',
    '  </a>',
    '  <a class="ps-item" data-pid="reputation" href="#" onclick="event.preventDefault();closeProductSwitcher();showNavToast(\'Reputation is coming soon\',\'This product is not yet available.\');">',
    '    <svg class="ps-ic" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    '    <span>Reputation</span>',
    '  </a>',
    '</div>',

    '<div class="nav-toast" id="nav-toast">',
    '  <div class="nav-toast-icon">',
    '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    '  </div>',
    '  <div class="nav-toast-text">',
    '    <strong id="nav-toast-title">Coming soon</strong>',
    '    <span id="nav-toast-body">This section is under construction.</span>',
    '  </div>',
    '  <button class="nav-toast-close" onclick="hideNavToast()" title="Dismiss">&#x2715;</button>',
    '</div>',

    '<div class="modal-backdrop modal-fullscreen-mobile" id="bucket-modal" onclick="if(event.target===this)closeAddBucketModal()">',
    '  <div class="modal modal--wide">',
    '    <div class="modal-header">',
    '      <div class="modal-title">Add New Bucket</div>',
    '      <button class="modal-close" onclick="closeAddBucketModal()" aria-label="Close">&#x2715;</button>',
    '    </div>',
    '    <div class="modal-body">',
    '      <div class="us-add-section" style="grid-template-columns:1fr;">',
    '        <div class="us-add-field" style="grid-column:auto;margin-top:0;">',
    '          <div class="bk-radio-row">',
    '            <label class="bk-radio"><input type="radio" name="bk-type" value="IDMS"/> <span>IDMS</span></label>',
    '            <label class="bk-radio"><input type="radio" name="bk-type" value="Runlist" checked/> <span>Runlist</span></label>',
    '          </div>',
    '        </div>',
    '        <div class="us-add-field" style="grid-column:auto;margin-top:0;">',
    '          <label><span class="bk-req">*</span> Bucket Name</label>',
    '          <input type="text" id="bk-name" placeholder="Enter Bucket Name" style="width:100%;" oninput="bkSyncSave()"/>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="modal-footer" style="justify-content:flex-end;">',
    '      <button class="modal-save" id="bk-save" onclick="saveAddBucket()" disabled>Save</button>',
    '      <button class="modal-cancel" onclick="closeAddBucketModal()">Cancel</button>',
    '    </div>',
    '  </div>',
    '</div>',

    '<div class="modal-backdrop modal-fullscreen-mobile" id="queue-modal" onclick="if(event.target===this)closeQueueModal()">',
    '  <div class="modal modal--xwide">',
    '    <div class="modal-header">',
    '      <div class="modal-title" id="queue-modal-title">Sheet Queue</div>',
    '      <button class="modal-close" onclick="closeQueueModal()">&#x2715;</button>',
    '    </div>',
    '    <div class="modal-body" style="padding:0;">',
    '      <div class="table-wrap" style="margin:0;border:none;border-radius:0;">',
    '        <div class="table-scroll" style="border-radius:0;">',
    '          <table>',
    '            <thead>',
    '              <tr id="queue-thead-row"></tr>',
    '            </thead>',
    '            <tbody id="queue-tbody"></tbody>',
    '          </table>',
    '        </div>',
    '        <div class="queue-empty" id="queue-empty">No data available</div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  // ─── Handlers (exposed as globals so inline onclick attrs resolve) ──────────
  var navToastTimer = null;

  var QUEUE_LABELS = ['Sheet Queue', 'Data Queue', 'Bid Queue'];

  var QUEUE_COLS = {
    'Sheet Queue': [
      { label:'No',         width:60  },
      { label:'Sheet Name', width:240 },
      { label:'Date',       width:150 },
      { label:'Status',     width:150 },
      { label:'Priority',   width:150 },
      { label:'Remove',     width:120 }
    ],
    'Data Queue': [
      { label:'No',         width:60  },
      { label:'Store Name', width:280 },
      { label:'Status',     width:180 },
      { label:'Priority',   width:180 },
      { label:'Remove',     width:140 }
    ],
    'Bid Queue': [
      { label:'No',         width:60  },
      { label:'Sheet Name', width:240 },
      { label:'Type',       width:150 },
      { label:'Status',     width:150 },
      { label:'Priority',   width:150 },
      { label:'Remove',     width:120 }
    ]
  };

  window.navClick = function(label){
    document.querySelectorAll('.sb-item, .md-item').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-nav') === label.toLowerCase() || (el.querySelector('span') && el.querySelector('span').textContent === label));
    });
    if(QUEUE_LABELS.indexOf(label) !== -1){
      window.openQueueModal(label);
      return;
    }
    if(label === 'Add New Bucket'){
      window.openAddBucketModal();
      return;
    }
    if(typeof label === 'string' && label.indexOf('bucket:') === 0){
      var _bid = label.slice(7);
      window.location.href = 'runlist.html?bucket=' + encodeURIComponent(_bid);
      return;
    }
    if(NAV_ROUTES[label]){
      window.location.href = NAV_ROUTES[label];
      return;
    }
    window.showNavToast(label + ' is coming soon', 'This section is under construction.');
  };

  window.openQueueModal = function(label){
    var m = document.getElementById('queue-modal');
    if(!m) return;
    document.getElementById('queue-modal-title').textContent = label;
    var cols = QUEUE_COLS[label] || [];
    var last = cols.length - 1;
    document.getElementById('queue-thead-row').innerHTML = cols.map(function(c, i){
      var edgeRadius = (i === 0 || i === last) ? 'border-radius:0;' : '';
      return '<th style="width:' + c.width + 'px;' + edgeRadius + '">' + c.label + '</th>';
    }).join('');
    document.getElementById('queue-tbody').innerHTML = '';
    document.getElementById('queue-empty').style.display = 'block';
    m.classList.add('open');
  };
  var BUCKETS_STORE = 'buysmart:buckets';
  var BUCKET_ICON_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18l-2 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 7z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

  function loadBuckets(){
    try { var v = JSON.parse(localStorage.getItem(BUCKETS_STORE) || '[]'); return Array.isArray(v) ? v : []; }
    catch(e){ return []; }
  }
  function saveBuckets(list){
    try { localStorage.setItem(BUCKETS_STORE, JSON.stringify(list)); } catch(e){}
  }
  function bkEscape(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  window.renderBuckets = function(){
    var list = loadBuckets();
    document.querySelectorAll('.sb-bucket, .md-bucket').forEach(function(el){ el.remove(); });

    var sbAnchor = document.getElementById('sb-add-bucket');
    var mdAnchor = document.getElementById('md-add-bucket');

    // Insert in reverse so items appear in list order directly after the anchor.
    for(var i = list.length - 1; i >= 0; i--){
      var b = list[i];
      var label = bkEscape(b.name);
      var nav   = 'bucket:' + b.id;

      if(sbAnchor){
        var sb = document.createElement('div');
        sb.className = 'sb-item sb-bucket';
        sb.setAttribute('data-nav', nav);
        sb.setAttribute('data-label', label);
        sb.setAttribute('data-tooltip', label);
        sb.setAttribute('onclick', "navClick('" + nav + "')");
        sb.innerHTML = BUCKET_ICON_SVG;
        sbAnchor.parentNode.insertBefore(sb, sbAnchor.nextSibling);
      }
      if(mdAnchor){
        var md = document.createElement('div');
        md.className = 'md-item md-bucket';
        md.setAttribute('data-nav', nav);
        md.setAttribute('onclick', "navClick('" + nav + "');closeMobileDrawer();");
        md.innerHTML = BUCKET_ICON_SVG + '<span>' + label + '</span>';
        mdAnchor.parentNode.insertBefore(md, mdAnchor.nextSibling);
      }
    }

    var params = new URLSearchParams(location.search);
    var activeNav = params.get('bucket') ? 'bucket:' + params.get('bucket') : null;
    if(activeNav){
      document.querySelectorAll('.sb-item, .md-item').forEach(function(el){
        el.classList.toggle('active', el.getAttribute('data-nav') === activeNav);
      });
    }
  };

  window.openAddBucketModal = function(){
    var m = document.getElementById('bucket-modal');
    if(!m) return;
    var runlist = m.querySelector('input[name="bk-type"][value="Runlist"]');
    if(runlist) runlist.checked = true;
    var name = document.getElementById('bk-name');
    if(name){ name.value = ''; }
    var save = document.getElementById('bk-save');
    if(save) save.disabled = true;
    m.classList.add('open');
    setTimeout(function(){ if(name) name.focus(); }, 30);
  };
  window.closeAddBucketModal = function(){
    var m = document.getElementById('bucket-modal');
    if(m) m.classList.remove('open');
  };
  window.bkSyncSave = function(){
    var save = document.getElementById('bk-save');
    var name = document.getElementById('bk-name');
    if(!save || !name) return;
    save.disabled = name.value.trim().length === 0;
  };
  window.saveAddBucket = function(){
    var name = document.getElementById('bk-name').value.trim();
    if(!name){ return; }
    var type = 'Runlist';
    var checked = document.querySelector('input[name="bk-type"]:checked');
    if(checked) type = checked.value;
    var list = loadBuckets();
    var id = 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    list.push({ id: id, name: name, type: type });
    saveBuckets(list);
    window.renderBuckets();
    window.closeAddBucketModal();
    if(typeof window.showNavToast === 'function'){
      window.showNavToast('Bucket added', type + ' bucket "' + name + '" created.');
    }
  };

  window.closeQueueModal = function(){
    var m = document.getElementById('queue-modal');
    if(m) m.classList.remove('open');
  };

  window.toggleMobileDrawer = function(){
    var d = document.getElementById('mobile-drawer'), b = document.getElementById('mobile-drawer-backdrop');
    if(!d || !b) return;
    if(d.classList.contains('open')) window.closeMobileDrawer();
    else { d.classList.add('open'); b.classList.add('open'); }
  };
  window.closeMobileDrawer = function(){
    var d = document.getElementById('mobile-drawer'), b = document.getElementById('mobile-drawer-backdrop');
    if(d) d.classList.remove('open'); if(b) b.classList.remove('open');
  };

  window.showNavToast = function(title, body){
    var t = document.getElementById('nav-toast'); if(!t) return;
    if(title) document.getElementById('nav-toast-title').textContent = title;
    if(body)  document.getElementById('nav-toast-body').textContent  = body;
    t.classList.add('show');
    if(navToastTimer) clearTimeout(navToastTimer);
    navToastTimer = setTimeout(window.hideNavToast, 4000);
  };
  window.hideNavToast = function(){
    var t = document.getElementById('nav-toast'); if(t) t.classList.remove('show');
    if(navToastTimer){ clearTimeout(navToastTimer); navToastTimer = null; }
  };

  window.toggleNotifications = function(e){ if(e) e.stopPropagation(); var p = document.getElementById('notif-panel'); if(!p) return; if(p.classList.contains('open')) window.closeNotifications(); else window.openNotifications(); };
  window.openNotifications = function(){ var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell'); if(!p||!b) return; if(p.parentElement !== document.body) document.body.appendChild(p); window.positionNotifications(); p.classList.add('open'); b.classList.add('active'); };
  window.toggleUnreadComments = function(){
    var tog = document.getElementById('notif-unread-tog');
    if(!tog) return;
    tog.classList.toggle('off');
    var isOn = !tog.classList.contains('off');
    if(typeof window.setNotifUnreadOnly === 'function') window.setNotifUnreadOnly(isOn);
  };
  window.viewAllNotifications = function(){
    try { window.closeNotifications && window.closeNotifications(); } catch(e){}
    window.location.href = 'allnotifications.html';
  };
  window.closeNotifications = function(){ var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell'); if(p) p.classList.remove('open'); if(b) b.classList.remove('active'); };
  window.positionNotifications = function(){ var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell'); if(!p||!b) return; var r = b.getBoundingClientRect(); var w = p.offsetWidth || 420; p.style.top = (r.bottom + 8) + 'px'; p.style.left = Math.max(8, r.right - w) + 'px'; };
  window.setNotifTab = function(t){ document.querySelectorAll('.notif-tab').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === t); }); };
  window.markAllNotificationsRead = function(){};

  // ── Product switcher (BuySmart / Reputation) ─────────────────────────
  window.toggleProductSwitcher = function(e){
    if(e) e.stopPropagation();
    var logo = document.querySelector('.logo');
    var ps = document.getElementById('product-switcher');
    if(!logo || !ps) return;
    if(ps.parentElement !== document.body) document.body.appendChild(ps);
    var willOpen = !ps.classList.contains('ps-open');
    if(willOpen) window.positionProductSwitcher();
    ps.classList.toggle('ps-open', willOpen);
    logo.classList.toggle('ps-open', willOpen);
  };
  window.positionProductSwitcher = function(){
    var logo = document.querySelector('.logo');
    var ps = document.getElementById('product-switcher');
    if(!logo || !ps) return;
    var r = logo.getBoundingClientRect();
    ps.style.left = r.left + 'px';
    ps.style.top = (r.bottom + 8) + 'px';
  };
  window.closeProductSwitcher = function(){
    var logo = document.querySelector('.logo');
    var ps = document.getElementById('product-switcher');
    if(logo) logo.classList.remove('ps-open');
    if(ps) ps.classList.remove('ps-open');
  };
  document.addEventListener('mousedown', function(e){
    var ps = document.getElementById('product-switcher');
    if(!ps || !ps.classList.contains('ps-open')) return;
    if(e.target.closest && (e.target.closest('.logo') || e.target.closest('#product-switcher'))) return;
    window.closeProductSwitcher();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') window.closeProductSwitcher(); });
  window.addEventListener('scroll', function(){ var ps = document.getElementById('product-switcher'); if(ps && ps.classList.contains('ps-open')) window.positionProductSwitcher(); }, true);

  // ── Global search (top-header chip) ────────────────────────────────────
  var TH_SEARCH_CSS = [
    '.th-search{position:relative;flex:1;max-width:440px;margin:0 24px;min-width:180px;}',
    '.th-search input{background:transparent;border:none;outline:none;font-size:13px;color:var(--tx);width:100%;height:100%;padding:0;}',
    '.th-search input:-webkit-autofill,.th-search input:-webkit-autofill:hover,.th-search input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px var(--sur) inset;-webkit-text-fill-color:var(--tx);caret-color:var(--tx);transition:background-color 5000s ease-in-out 0s;}',
    '.th-search input::placeholder{color:var(--mu);}',
    '.th-search svg{color:var(--mu);flex-shrink:0;}',
    '.th-search-menu{position:absolute;left:0;right:0;top:calc(100% + 6px);background:var(--sur);border:0.5px solid var(--brd);border-radius:10px;box-shadow:0 8px 24px rgba(15,17,23,.12),0 2px 6px rgba(15,17,23,.08);max-height:60vh;overflow-y:auto;padding:6px 0;display:none;z-index:80;}',
    '.th-search-menu.open{display:block;}',
    '.thsm-group{padding:6px 12px 4px;font-size:10.5px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--mu);}',
    '.thsm-row{display:flex;align-items:center;gap:10px;padding:8px 12px;text-decoration:none;color:var(--tx);font-size:13px;cursor:pointer;}',
    '.thsm-row:hover,.thsm-row.thsm-active{background:var(--sur2);}',
    '.thsm-cat{font-size:10.5px;font-weight:600;color:var(--mu);background:var(--sur2);border-radius:6px;padding:2px 6px;flex-shrink:0;}',
    '.thsm-row:hover .thsm-cat,.thsm-row.thsm-active .thsm-cat{background:var(--sur);}',
    '.thsm-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.thsm-sub{color:var(--mu);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40%;}',
    '.thsm-empty{padding:12px;text-align:center;color:var(--mu);font-size:12.5px;}',
    /* Desktop: back + clear buttons live inside the search pill but stay hidden */
    '.th-search-back,.th-search-clear{display:none;}',
    /* Mobile default: collapse the whole search into an icon-only button */
    '@media (max-width:640px){',
    '  .th-search{flex:0 0 auto;margin:0 8px 0 auto;min-width:0;max-width:none;width:44px;height:44px;padding:0;justify-content:center;cursor:pointer;overflow:hidden;}',
    '  .th-search-magnifier{width:16px !important;height:16px !important;color:var(--tx);}',
    '  .th-search input{display:none;}',
    '  .th-search-menu{display:none;}',
    '  .thsm-sub{display:none;}',
    /* Mobile expanded: overlay the top-header with back + input + clear */
    '  .th-search.expanded{position:fixed;top:0;left:0;right:0;width:auto;height:64px;margin:0;padding:0 8px;background:var(--bg);border-radius:0;border:0;border-bottom:0.5px solid var(--brd2);gap:6px;justify-content:flex-start;z-index:200;cursor:text;overflow:visible;}',
    '  .th-search.expanded .th-search-magnifier{display:none;}',
    '  .th-search.expanded input{display:block;flex:1;font-size:15px;height:auto;padding:0 4px;}',
    '  .th-search.expanded .th-search-back{display:inline-flex;background:transparent;border:none;width:36px;height:36px;align-items:center;justify-content:center;color:var(--tx);cursor:pointer;padding:0;border-radius:8px;flex:0 0 auto;}',
    '  .th-search.expanded .th-search-back:hover{background:var(--sur2);}',
    '  .th-search.expanded .th-search-back svg{display:block;width:20px;height:20px;color:var(--tx);}',
    '  .th-search.expanded .th-search-clear{display:inline-flex;background:transparent;border:none;width:32px;height:32px;align-items:center;justify-content:center;color:var(--mu);cursor:pointer;padding:0;border-radius:8px;flex:0 0 auto;}',
    '  .th-search.expanded .th-search-clear:hover{background:var(--sur2);color:var(--tx);}',
    '  .th-search.expanded .th-search-clear svg{display:block;width:16px;height:16px;color:currentColor;}',
    '  .th-search.expanded .th-search-menu{display:block;position:fixed;top:64px;left:0;right:0;border-radius:0;border:0;border-top:0.5px solid var(--brd2);max-height:calc(100vh - 64px);}',
    '  .th-search.expanded .th-search-menu:not(.open){display:none;}',
    '}'
  ].join('');

  function thEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function thMatches(item, q){
    var hay = (item.label + ' ' + (item.sub||'') + ' ' + (item.category||'')).toLowerCase();
    return hay.indexOf(q) !== -1;
  }
  window.thSearch = function(raw){
    var menu = document.getElementById('th-search-menu');
    if(!menu) return;
    var q = String(raw||'').trim().toLowerCase();
    if(!q){ menu.classList.remove('open'); menu.innerHTML = ''; return; }
    var nav = (window.SEARCH_NAV || []).filter(function(x){ return thMatches(x, q); }).slice(0, 6);
    var ents = (window.SEARCH_ENTITIES || []).filter(function(x){ return thMatches(x, q); }).slice(0, 14);
    var html = '';
    if(nav.length){
      html += '<div class="thsm-group">Pages</div>';
      html += nav.map(function(x){
        return '<a class="thsm-row" role="option" href="' + thEsc(x.url) + '"><span class="thsm-cat">' + thEsc(x.category) + '</span><span class="thsm-label">' + thEsc(x.label) + '</span></a>';
      }).join('');
    }
    if(ents.length){
      html += '<div class="thsm-group">Results</div>';
      html += ents.map(function(x){
        return '<a class="thsm-row" role="option" href="' + thEsc(x.url) + '"><span class="thsm-cat">' + thEsc(x.category) + '</span><span class="thsm-label">' + thEsc(x.label) + '</span>' + (x.sub ? '<span class="thsm-sub">' + thEsc(x.sub) + '</span>' : '') + '</a>';
      }).join('');
    }
    if(!html) html = '<div class="thsm-empty">No matches</div>';
    menu.innerHTML = html;
    menu.classList.add('open');
  };
  window.thSearchKey = function(e){
    var menu = document.getElementById('th-search-menu');
    if(!menu) return;
    var rows = Array.prototype.slice.call(menu.querySelectorAll('.thsm-row'));
    var idx = rows.findIndex(function(r){ return r.classList.contains('thsm-active'); });
    if(e.key === 'Escape'){ menu.classList.remove('open'); e.target.blur(); return; }
    if(e.key === 'ArrowDown'){ e.preventDefault(); if(!rows.length) return; if(idx>=0) rows[idx].classList.remove('thsm-active'); var next = rows[(idx+1) % rows.length]; next.classList.add('thsm-active'); next.scrollIntoView({block:'nearest'}); return; }
    if(e.key === 'ArrowUp'){ e.preventDefault(); if(!rows.length) return; if(idx>=0) rows[idx].classList.remove('thsm-active'); var prev = rows[(idx<=0 ? rows.length : idx) - 1]; prev.classList.add('thsm-active'); prev.scrollIntoView({block:'nearest'}); return; }
    if(e.key === 'Enter'){ if(idx>=0){ e.preventDefault(); window.location.href = rows[idx].getAttribute('href'); } }
  };
  window.thExpand = function(){
    if(window.innerWidth > 640) return;
    var wrap = document.getElementById('th-search-wrap');
    if(!wrap || wrap.classList.contains('expanded')) return;
    wrap.classList.add('expanded');
    var input = document.getElementById('th-search-input');
    if(input) setTimeout(function(){ input.focus(); }, 20);
  };
  window.thCollapse = function(){
    var wrap  = document.getElementById('th-search-wrap');
    var menu  = document.getElementById('th-search-menu');
    var input = document.getElementById('th-search-input');
    if(input){ input.value = ''; input.blur(); }
    if(menu){ menu.classList.remove('open'); menu.innerHTML = ''; }
    if(wrap){ wrap.classList.remove('expanded'); }
  };
  window.thClear = function(){
    var input = document.getElementById('th-search-input');
    if(!input) return;
    input.value = '';
    window.thSearch('');
    input.focus();
  };
  document.addEventListener('mousedown', function(e){
    var wrap = document.getElementById('th-search-wrap');
    var menu = document.getElementById('th-search-menu');
    if(!wrap || !menu || !menu.classList.contains('open')) return;
    if(!wrap.contains(e.target)) menu.classList.remove('open');
  });
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')){
      var input = document.getElementById('th-search-input');
      if(input){ e.preventDefault(); input.focus(); input.select(); }
    }
  });

  document.addEventListener('click', function(e){ var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell'); if(p && p.classList.contains('open') && !(b && b.contains(e.target)) && !p.contains(e.target)) window.closeNotifications(); });
  window.addEventListener('resize', function(){ var p = document.getElementById('notif-panel'); if(p && p.classList.contains('open')) window.positionNotifications(); var ps = document.getElementById('product-switcher'); if(ps && ps.classList.contains('ps-open')) window.positionProductSwitcher(); });

  // ─── Public init ───────────────────────────────────────────────────────────
  window.BuySmartShell = {
    init: function(opts){
      opts = opts || {};
      var page = (opts.page || 'home').toLowerCase();
      var title = opts.title || '';

      // Inject shell CSS additions once (search chip).
      if(!document.getElementById('th-search-style')){
        var st = document.createElement('style');
        st.id = 'th-search-style';
        st.textContent = TH_SEARCH_CSS;
        document.head.appendChild(st);
      }

      // Inject shell before the .root.main-area (or append to body if not found).
      var host = document.createElement('div');
      host.innerHTML = SHELL_HTML;
      var root = document.querySelector('.root.main-area');
      var frag = document.createDocumentFragment();
      while(host.firstChild) frag.appendChild(host.firstChild);
      if(root && root.parentNode){
        root.parentNode.insertBefore(frag, root);
      } else {
        document.body.appendChild(frag);
      }

      // Mark active nav item.
      document.querySelectorAll('.sb-item, .md-item').forEach(function(el){
        el.classList.toggle('active', el.getAttribute('data-nav') === page);
      });

      // Set page title.
      var titleEl = document.querySelector('.set-page-title');
      if(titleEl && title) titleEl.textContent = title;

      // Re-apply theme (defensive after markup injection).
      applyTheme(loadTheme());

      // Populate notifications now that markup is in the DOM.
      if(typeof window.renderNotifications === 'function') window.renderNotifications();

      // Render user-created buckets into the sidebar + mobile drawer.
      if(typeof window.renderBuckets === 'function') window.renderBuckets();

      // Apply ?q= prefill from global search into the page's local search input.
      try {
        var q = new URLSearchParams(location.search).get('q');
        if(q){
          var pairs = [
            ['us-search',  'usFilter'],
            ['ur-search',  'urFilter'],
            ['uaa-search', 'uaaFilter'],
            ['as-search',  'asFilter'],
            ['pl-search',  'plFilter'],
            ['an-search',  'anFilter'],
            ['sm-search',  'smFilter']
          ];
          setTimeout(function(){
            for(var i=0;i<pairs.length;i++){
              var input = document.getElementById(pairs[i][0]);
              var fn = window[pairs[i][1]];
              if(input && typeof fn === 'function'){
                input.value = q;
                fn(q);
                break;
              }
            }
          }, 0);
        }
      } catch(e){}
    }
  };
})();
