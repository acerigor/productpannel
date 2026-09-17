/* ============================================================================
   CoreConnect — shared notifications system
   ----------------------------------------------------------------------------
   Data: localStorage['cc_notifications'] = array of
     { id, type, leadNo, leadName, leadAv, leadColor, title, body, ts, read }
     type ∈ 'sms' | 'email' | 'call' | 'appt'
   API on window: ccNotifAll/ByType/Unread/Get/Add/MarkRead/MarkAllRead/Render/SyncBellDot/Seed.
   Hooks into the existing per-page #notif-panel scaffold (tabs, body, bell dot).
   ============================================================================ */
(function(){
  var KEY = 'cc_notifications';
  var TYPES = ['sms','email','call','appt','comment','coreconnect','corebuy'];
  var TAB_LABELS = { all:'All', unread:'Unread', sms:'SMS', email:'Emails', call:'Calls', appt:'Appointments', comment:'Comments' };
  var _list = null;
  var _currentTab = 'all';
  var _search = '';
  var _unreadOnly = false;
  var _sourceFilters = [];
  var FILTER_OPTIONS = [
    { key:'coreconnect', label:'CoreConnect', color:'#4f7cff', types:['coreconnect'] },
    { key:'corebuy',     label:'CoreBuy',     color:'#34c759', types:['corebuy'] },
    { key:'corerecon',   label:'CoreRecon',    color:'#a78bfa', types:['comment'] }
  ];

  /* ── persistence ─────────────────────────────────────────────────────── */
  function load(){
    if(_list) return _list;
    try{ var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if(Array.isArray(s)) _list = s; }catch(e){}
    if(!_list) _list = [];
    return _list;
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(_list||[])); }catch(e){} }

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function initialsOf(name){ var p = String(name||'').trim().split(/\s+/); return (((p[0]||'')[0]||'')+((p.length>1&&p[p.length-1][0])||'')).toUpperCase(); }
  function colorFor(name){
    var palette = ['#534AB7','#0F6E56','#B73D5B','#3D81B7','#B77B3D','#22c88a','#e85555','#f5a623','#6e9dff','#2dd4bf'];
    var h=0, n=String(name||''); for(var i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))>>>0;
    return palette[h % palette.length];
  }
  function relTime(ts){
    var d = (Date.now() - ts) / 1000;
    if(d < 45) return 'Just now';
    if(d < 3600) return Math.round(d/60) + 'm ago';
    if(d < 86400) return Math.round(d/3600) + 'h ago';
    if(d < 172800) return 'Yesterday';
    var dt = new Date(ts), MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return MO[dt.getMonth()] + ' ' + dt.getDate();
  }
  function depthPrefix(){
    var p = (window.location && location.pathname || '').replace(/\\/g,'/');
    return (p.indexOf('/Settings/')>=0 || p.indexOf('/reputation/')>=0) ? '../../' : '../';
  }

  /* ── API ─────────────────────────────────────────────────────────────── */
  function all(){ return load().slice().sort(function(a,b){ return b.ts - a.ts; }); }
  function byType(t){ return all().filter(function(n){ return n.type===t; }); }
  function unread(){ return all().filter(function(n){ return !n.read; }); }
  function get(id){ return load().find(function(n){ return n.id===id; }); }
  function add(n){
    load();
    var rec = Object.assign({ id:'ntf'+Date.now()+'_'+Math.floor(Math.random()*1000), ts: n.ts || Date.now(), read:false }, n);
    _list.unshift(rec);
    save();
    render(_currentTab); syncBellDot();
    return rec;
  }
  function markRead(id){ var n=get(id); if(n && !n.read){ n.read=true; save(); render(_currentTab); syncBellDot(); } }
  function markUnread(id){ var n=get(id); if(n && n.read){ n.read=false; save(); render(_currentTab); syncBellDot(); } }
  function markAllRead(){ load().forEach(function(n){ n.read=true; }); save(); render(_currentTab); syncBellDot(); }
  function removeNotif(id){ _list = _list.filter(function(n){ return n.id !== id; }); save(); render(_currentTab); syncBellDot(); }

  /* ── seed (idempotent) ───────────────────────────────────────────────── */
  function seed(){
    load();
    if(_list.length > 0) return;
    var leads = (window.CCLeads && window.CCLeads.LEADS) ? window.CCLeads.LEADS : null;
    var pool = [];
    if(leads){
      pool = leads.slice(0,20).map(function(l){ return { no:l.no, name:l.name||'Unknown', av:initialsOf(l.name||'??'), color:l.ac||colorFor(l.name) }; });
    } else {
      pool = [
        {no:1,name:'Sarah Kim',av:'SK',color:'#534AB7'},{no:2,name:'James Donovan',av:'JD',color:'#22c88a'},
        {no:3,name:'Maria Lopez',av:'ML',color:'#B73D5B'},{no:4,name:'Andre Coleman',av:'AC',color:'#0F6E56'},
        {no:5,name:'Priya Shah',av:'PS',color:'#3D81B7'},{no:6,name:'Kevin Ng',av:'KN',color:'#B77B3D'}
      ];
    }
    var smsLines = ['Thanks, will check in tonight.','Can we move it to 3pm?','Got the docs, thank you!','Is the vehicle still available?','Sounds good — see you then.'];
    var emailSubj = ['Re: Financing options','Following up on your visit','Loan paperwork attached','Re: Trade-in appraisal','Question about my appointment'];
    var apptTypes = ['Test drive','Delivery','Trade-in appraisal','Walk-around','Financing discussion'];
    function pick(arr,i){ return arr[i % arr.length]; }
    var now = Date.now(), HOUR = 3600*1000, MIN = 60*1000;
    var seeds = [
      { type:'sms',   p: pool[0], title:'New SMS', body: pick(smsLines,0), ts: now - 4*MIN,   read:false },
      { type:'appt',  p: pool[1], title:'Appointment created', body: pick(apptTypes,1)+' — Today 3:30 PM', ts: now - 18*MIN, read:false },
      { type:'email', p: pool[2], title:'New email', body: pick(emailSubj,2), ts: now - 42*MIN, read:false },
      { type:'sms',   p: pool[4], title:'New SMS', body: pick(smsLines,3), ts: now - 2*HOUR, read:false },
      { type:'appt',  p: pool[5], title:'Appointment created', body: pick(apptTypes,4)+' — Tomorrow 10:00 AM', ts: now - 3*HOUR, read:false },
      { type:'email', p: pool[0], title:'New email', body: pick(emailSubj,1), ts: now - 5*HOUR, read:true },
      { type:'sms',   p: pool[2], title:'New SMS', body: pick(smsLines,4), ts: now - 11*HOUR, read:true },
      { type:'appt',  p: pool[3], title:'Appointment created', body: pick(apptTypes,0)+' — Fri 2:00 PM', ts: now - 16*HOUR, read:true },
      { type:'email', p: pool[4], title:'New email', body: pick(emailSubj,3), ts: now - 22*HOUR, read:true }
    ];
    /* Call seeds: derive from REAL missed-call data via CCLeads.callCountsForLead.
       Fallback to hardcoded mocks only when leads/API aren't available. */
    if(leads && window.CCLeads && typeof CCLeads.callCountsForLead === 'function'){
      var missedLeads = leads.filter(function(l){ return (CCLeads.callCountsForLead(l).missed||0) > 0; }).slice(0, 6);
      var callOffsets = [80*MIN, 7*HOUR, 26*HOUR, 4*HOUR, 13*HOUR, 30*HOUR]; // stagger across last 30h
      missedLeads.forEach(function(L, i){
        seeds.push({
          type:'call',
          p: { no:L.no, name:L.name||'Unknown', av:initialsOf(L.name||'??'), color:L.ac||colorFor(L.name) },
          title:'Missed call', body:'Inbound, not answered',
          ts: now - (callOffsets[i] || ((i+1)*4*HOUR)),
          read: i >= 2  // first 2 unread, rest read
        });
      });
    } else {
      // Fallback for pages without CCLeads loaded
      seeds.push({ type:'call', p: pool[3], title:'Missed call', body:'Inbound, not answered', ts: now - 80*MIN, read:false });
      seeds.push({ type:'call', p: pool[1], title:'Missed call', body:'Inbound, not answered', ts: now - 7*HOUR, read:true });
      seeds.push({ type:'call', p: pool[5], title:'Missed call', body:'Inbound, not answered', ts: now - 26*HOUR, read:true });
    }
    _list = seeds.map(function(s){
      return { id:'ntf_seed_'+Math.floor(Math.random()*1e9), type:s.type, leadNo:s.p.no, leadName:s.p.name, leadAv:s.p.av, leadColor:s.p.color, title:s.title, body:s.body, ts:s.ts, read:s.read };
    });
    save();
  }

  /* ── render ──────────────────────────────────────────────────────────── */
  var ICONS = {
    sms:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    call:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    appt:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    coreconnect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    corebuy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
  };
  var TYPE_COLOR = { sms:'#2dd4bf', email:'#6e9dff', call:'#e85555', appt:'#f5a623', comment:'#a78bfa', coreconnect:'#4f7cff', corebuy:'#34c759' };
  var TYPE_BGTINT = { sms:'rgba(45,212,191,.14)', email:'rgba(110,157,255,.14)', call:'rgba(232,85,85,.14)', appt:'rgba(245,166,35,.14)', comment:'rgba(167,139,250,.14)', coreconnect:'rgba(79,124,255,.14)', corebuy:'rgba(52,199,89,.14)' };

  function rowHtml(n){
    var typeBg = TYPE_BGTINT[n.type]||'rgba(255,255,255,.06)', typeFg = TYPE_COLOR[n.type]||'#6e9dff';
    return '<button class="cc-ntf-row'+(n.read?'':' is-unread')+'" data-id="'+esc(n.id)+'" onclick="ccNotifClickRow(\''+esc(n.id)+'\')">'
      + '<span class="cc-ntf-ic" style="background:'+typeBg+';color:'+typeFg+'">'+ICONS[n.type]+'</span>'
      + '<span class="cc-ntf-av" style="background:'+esc(n.leadColor||'#4f7cff')+'">'+esc(n.leadAv||'??')+'</span>'
      + '<span class="cc-ntf-txt">'
        + '<span class="cc-ntf-line"><strong>'+esc(n.title)+'</strong> &middot; '+esc(n.leadName||'')+'</span>'
        + '<span class="cc-ntf-body">'+esc(n.body)+'</span>'
        + '<span class="cc-ntf-time">'+esc(relTime(n.ts))+'</span>'
      + '</span>'
      + '<span class="cc-ntf-actions">'
        + (n.read
          ? '<span class="cc-ntf-act" title="Mark as unread" onclick="event.stopPropagation();ccNotifMarkUnread(\''+esc(n.id)+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg></span>'
          : '<span class="cc-ntf-act" title="Mark as read" onclick="event.stopPropagation();ccNotifMarkRead(\''+esc(n.id)+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"/><polyline points="22 7 13.5 12.5 2 7"/><polyline points="16 19 19 22 23 18"/></svg></span>')
        + '<span class="cc-ntf-act" title="Delete" onclick="event.stopPropagation();ccNotifRemove(\''+esc(n.id)+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></span>'
      + '</span>'
      + '<span class="cc-ntf-dot" aria-hidden="true"></span>'
    + '</button>';
  }
  function listFor(tab){
    if(tab==='all') return all();
    if(tab==='unread') return unread();
    return byType(tab);
  }
  function applyUnreadFilter(list){
    if(!_unreadOnly) return list;
    return list.filter(function(n){ return n.type === 'comment' && !n.read; });
  }
  function applySourceFilter(list){
    if(!_sourceFilters.length) return list;
    var allowed = [];
    _sourceFilters.forEach(function(key){
      var opt = FILTER_OPTIONS.find(function(o){ return o.key === key; });
      if(opt) allowed = allowed.concat(opt.types);
    });
    return list.filter(function(n){ return allowed.indexOf(n.type) !== -1; });
  }
  function applySearch(list){
    var q = String(_search||'').trim().toLowerCase();
    if(!q) return list;
    return list.filter(function(n){
      return (String(n.title||'').toLowerCase().indexOf(q) !== -1) ||
             (String(n.body ||'').toLowerCase().indexOf(q) !== -1) ||
             (String(n.leadName||'').toLowerCase().indexOf(q) !== -1) ||
             (String(n.type ||'').toLowerCase().indexOf(q) !== -1);
    });
  }
  function render(tab){
    if(tab) _currentTab = tab;
    var body = document.getElementById('notif-body'); if(!body) return;
    var list = applySearch(applySourceFilter(applyUnreadFilter(listFor(_currentTab))));
    if(!list.length){
      body.innerHTML = '<div class="notif-empty"><div class="notif-empty-icon">🔔</div>' + (_search ? 'No matches' : 'You\'re all caught up') + '</div>';
    } else {
      body.innerHTML = list.map(rowHtml).join('');
    }
    // markall button enabled state
    var ma = document.getElementById('notif-markall'); if(ma) ma.disabled = unread().length === 0;
  }
  function syncBellDot(){
    var dot = document.getElementById('header-bell-dot');
    if(!dot) return;
    if(unread().length > 0) dot.classList.add('show'); else dot.classList.remove('show');
  }

  /* ── click → navigate + mark read ────────────────────────────────────── */
  function clickRow(id){
    var n = get(id); if(!n) return;
    markRead(id);
    var depth = depthPrefix();
    var url;
    // SMS / Email: open the inline contact panel on the CURRENT page if available;
    // fall back to navigating to the leads page if no inline panel is loaded.
    if(n.type === 'comment'){
      try { if(typeof window.closeNotifications === 'function') window.closeNotifications(); } catch(e){}
      if(typeof window.rlOpenVehicleDetails === 'function' && n.vdSrno != null){
        window.rlOpenVehicleDetails(n.vdSrno);
        return;
      }
      window.location.href = 'runlist.html?vd=' + encodeURIComponent(n.vdSrno || '');
      return;
    }
    if(n.type==='sms' || n.type==='email'){
      if(typeof window.openContactPanel === 'function'){
        try{ if(typeof window.closeNotifications === 'function') window.closeNotifications(); }catch(e){}
        window._cpFromBell = true;
        window.openContactPanel(n.leadNo, n.type === 'sms' ? 'sms' : 'email');
        return;
      }
      var tab = (n.type==='sms') ? 'sms' : 'email';
      url = depth + 'coreconnect_leads_v83/coreconnect_leads_v83.html?openLead=' + encodeURIComponent(n.leadNo||'') + '&tab=' + tab;
    } else if(n.type==='appt'){
      url = depth + 'coreconnect_appointments/coreconnect_appointments.html';
    } else if(n.type==='call'){
      url = depth + 'call_history/coreconnect_call_history_v31.html?focus=' + encodeURIComponent(n.leadNo||'');
    } else if(n.type==='coreconnect'){
      if(typeof window.showNavToast === 'function') window.showNavToast('CoreConnect', 'Opening in CoreConnect...');
      return;
    } else if(n.type==='corebuy'){
      if(typeof window.showNavToast === 'function') window.showNavToast('CoreBuy', 'Opening in CoreBuy...');
      return;
    }
    if(!url) return;
    window.location.href = url;
  }

  /* ── inject row CSS (one-time, in <head>) ────────────────────────────── */
  function injectCss(){
    if(document.getElementById('cc-ntf-style')) return;
    var css = ''
      + '.cc-ntf-row{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;width:100%;background:transparent;border:none;border-bottom:0.5px solid var(--brd);cursor:pointer;text-align:left;font-family:var(--font);transition:background .12s;position:relative;}'
      + '.cc-ntf-row:hover{background:rgba(255,255,255,.04);}'
      + '.cc-ntf-row:last-child{border-bottom:none;}'
      + '.cc-ntf-ic{width:30px;height:30px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;}'
      + '.cc-ntf-ic svg{width:15px;height:15px;}'
      + '.cc-ntf-av{width:26px;height:26px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;letter-spacing:.3px;margin-top:2px;}'
      + '.cc-ntf-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}'
      + '.cc-ntf-line{font-size:12.5px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-line strong{font-weight:600;}'
      + '.cc-ntf-body{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-time{font-size:11px;color:var(--mu);margin-top:1px;}'
      + '.cc-ntf-actions{display:none;align-items:center;gap:4px;flex:none;margin-top:2px;}'
      + '.cc-ntf-act{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--mu);cursor:pointer;transition:all .12s;}'
      + '.cc-ntf-act svg{width:14px;height:14px;}'
      + '.cc-ntf-act:hover{background:rgba(255,255,255,.08);color:var(--tx);}'
      + '.cc-ntf-row:hover .cc-ntf-actions{display:flex;}'
      + '.cc-ntf-row:hover .cc-ntf-dot{display:none;}'
      + '.cc-ntf-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex:none;margin-top:6px;opacity:0;}'
      + '.cc-ntf-row.is-unread .cc-ntf-dot{opacity:1;}'
      + '.cc-ntf-row.is-unread{background:rgba(79,124,255,.04);}'
      + '.notif-tab.icon-tab{padding:10px 10px;gap:5px;}'
      + '.notif-tab .nt-ic{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;}'
      + '.notif-tab .nt-ic svg{width:16px;height:16px;display:block;}'
      + '.notif-tabs:has(.notif-search){padding:10px 14px;border-bottom:0.5px solid var(--brd);}'
      + '.notif-search{position:relative;display:flex;align-items:center;width:100%;}'
      + '.notif-search-ic{position:absolute;left:10px;width:14px;height:14px;color:var(--mu);pointer-events:none;}'
      + '.notif-search-input{width:100%;height:34px;padding:0 12px 0 32px;background:var(--sur2);border:0.5px solid var(--brd2);border-radius:8px;color:var(--tx);font-family:var(--font);font-size:13px;outline:none;transition:border-color .15s;}'
      + '.notif-search-input:focus{border-color:var(--ac);}'
      + '.notif-search-input::placeholder{color:var(--mu);}'
      + '.notif-search{gap:8px;}'
      + '.notif-filter-btn{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--sur2);border:0.5px solid var(--brd2);border-radius:8px;cursor:pointer;color:var(--mu);transition:all .12s;position:relative;}'
      + '.notif-filter-btn:hover{border-color:var(--ac);color:var(--tx);}'
      + '.notif-filter-btn.is-active{color:var(--ac);border-color:var(--ac);background:rgba(79,124,255,.08);}'
      + '.notif-filter-btn svg{width:14px;height:14px;}'
      + '.notif-filter-dd{display:none;position:absolute;top:40px;right:0;min-width:180px;background:var(--sur);border:0.5px solid var(--brd2);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:20;padding:6px 0;}'
      + '.notif-filter-dd.open{display:block;}'
      + '.notif-filter-item{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;font-family:var(--font);font-size:12.5px;color:var(--tx);transition:background .1s;}'
      + '.notif-filter-item:hover{background:rgba(255,255,255,.04);}'
      + '.notif-filter-item.checked{color:var(--ac);}'
      + '.notif-filter-dot{width:8px;height:8px;border-radius:50%;flex:none;}'
      + '.notif-filter-check{margin-left:auto;width:14px;height:14px;color:var(--ac);opacity:0;}'
      + '.notif-filter-item.checked .notif-filter-check{opacity:1;}'
      + '.notif-filter-check svg{width:14px;height:14px;}';
    var st = document.createElement('style'); st.id='cc-ntf-style'; st.textContent = css; document.head.appendChild(st);
  }

  /* ── extend tabs with per-type tabs (idempotent) ─────────────────────── */
  var TAB_ICONS = {
    unread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/></svg>',
    sms: ICONS.sms, email: ICONS.email, call: ICONS.call, appt: ICONS.appt, comment: ICONS.comment
  };
  function iconTabInner(key){
    return '<span class="nt-ic">'+TAB_ICONS[key]+'</span><span class="notif-tab-count" id="notif-count-'+key+'">0</span>';
  }
  function extendTabs(){
    var tabs = document.querySelector('.notif-tabs'); if(!tabs) return;
    if(tabs.querySelector('.notif-search-input')) return; // already replaced
    var filterItems = FILTER_OPTIONS.map(function(o){
      return '<div class="notif-filter-item" data-filter="'+o.key+'" onclick="toggleNotifFilter(\''+o.key+'\')">'
        + '<span class="notif-filter-dot" style="background:'+o.color+'"></span>'
        + '<span>'+o.label+'</span>'
        + '<span class="notif-filter-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>'
        + '</div>';
    }).join('');
    tabs.innerHTML =
      '<div class="notif-search">' +
        '<svg class="notif-search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>' +
        '<input class="notif-search-input" type="text" placeholder="Search notifications…" oninput="setNotifSearch(this.value)"/>' +
        '<button class="notif-filter-btn" id="notif-filter-btn" onclick="event.stopPropagation();toggleNotifFilterDD()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>' +
          '<div class="notif-filter-dd" id="notif-filter-dd" onclick="event.stopPropagation()">' + filterItems + '</div>' +
        '</button>' +
      '</div>';
    _currentTab = 'all';
  }

  /* ── override per-page placeholder functions ─────────────────────────── */
  function installOverrides(){
    var prevOpen = window.openNotifications;
    window.openNotifications = function(){
      if(typeof prevOpen === 'function') prevOpen();
      else {
        var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell');
        if(p && b){ if(p.parentElement!==document.body) document.body.appendChild(p); p.classList.add('open'); b.classList.add('active'); }
      }
      render(_currentTab);
    };
    window.setNotifTab = function(tab){
      _currentTab = tab;
      document.querySelectorAll('.notif-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab')===tab); });
      render(tab);
    };
    window.setNotifSearch = function(q){
      _search = q || '';
      render(_currentTab);
    };
    window.setNotifUnreadOnly = function(on){
      _unreadOnly = !!on;
      render(_currentTab);
    };
    window.markAllNotificationsRead = function(){ markAllRead(); };
    window.ccNotifClickRow = clickRow;
    window.toggleNotifFilterDD = function(){
      var dd = document.getElementById('notif-filter-dd');
      if(dd) dd.classList.toggle('open');
    };
    window.toggleNotifFilter = function(key){
      var idx = _sourceFilters.indexOf(key);
      if(idx >= 0) _sourceFilters.splice(idx, 1); else _sourceFilters.push(key);
      var items = document.querySelectorAll('.notif-filter-item');
      items.forEach(function(el){ el.classList.toggle('checked', _sourceFilters.indexOf(el.getAttribute('data-filter')) >= 0); });
      var btn = document.getElementById('notif-filter-btn');
      if(btn) btn.classList.toggle('is-active', _sourceFilters.length > 0);
      render(_currentTab);
    };
  }

  /* ── public API ──────────────────────────────────────────────────────── */
  window.ccNotifAll = all;
  window.ccNotifByType = byType;
  window.ccNotifUnread = unread;
  window.ccNotifGet = get;
  window.ccNotifAdd = add;
  window.ccNotifMarkRead = markRead;
  window.ccNotifMarkUnread = markUnread;
  window.ccNotifMarkAllRead = markAllRead;
  window.ccNotifRemove = removeNotif;
  window.ccNotifSeed = seed;
  window.ccNotifRender = render;
  window.ccNotifSyncBellDot = syncBellDot;
  window.ccNotifClickRow = clickRow;

  var SEED_FLAG = 'buysmart:notif:seeded:v4-orgs';
  var VD_SEED_MIN = 60*1000, VD_SEED_HR = 3600*1000;
  var NOTIF_VD_TEAM = [
    { name:'Sarah Kim',     av:'SK', color:'#534AB7' },
    { name:'James Donovan', av:'JD', color:'#22C88A' },
    { name:'Maria Lopez',   av:'ML', color:'#B73D5B' },
    { name:'Andre Coleman', av:'AC', color:'#0F6E56' },
    { name:'Priya Shah',    av:'PS', color:'#3D81B7' },
    { name:'Kevin Ng',      av:'KN', color:'#B77B3D' }
  ];
  var NOTIF_VD_SEEDS = [
    { srno:1, year:2019, make:'HYUNDAI', model:'TUCSON', vin:'KM8J33AL8KU938601', authorIdx:0, offsetMs:  4*VD_SEED_MIN, text:'Rear bumper has a small crack, but easy fix.' },
    { srno:1, year:2019, make:'HYUNDAI', model:'TUCSON', vin:'KM8J33AL8KU938601', authorIdx:1, offsetMs: 22*VD_SEED_MIN, text:'MMR looks strong — worth pushing to floor + 500.' },
    { srno:1, year:2019, make:'HYUNDAI', model:'TUCSON', vin:'KM8J33AL8KU938601', authorIdx:2, offsetMs:  3*VD_SEED_HR,  text:'Interior in great shape for the mileage.' },
    { srno:2, year:2016, make:'LINCOLN', model:'MKX',    vin:'2LMPJ8LR1GBL35202', authorIdx:3, offsetMs: 15*VD_SEED_MIN, text:'Prior lease — expect wear on driver seat.' },
    { srno:2, year:2016, make:'LINCOLN', model:'MKX',    vin:'2LMPJ8LR1GBL35202', authorIdx:4, offsetMs:  2*VD_SEED_HR,  text:'Carfax clean, no accidents reported.' },
    { srno:3, year:2019, make:'RAM',     model:'1500',   vin:'1C6RR6LT0KS529203', authorIdx:5, offsetMs: 40*VD_SEED_MIN, text:'Structural alteration flagged — needs inspection.' },
    { srno:3, year:2019, make:'RAM',     model:'1500',   vin:'1C6RR6LT0KS529203', authorIdx:0, offsetMs:  5*VD_SEED_HR,  text:'Skipping. Too much risk on the frame.' },
    { srno:4, year:2018, make:'HONDA',   model:'Civic',  vin:'JHMFC1F73JX016304', authorIdx:2, offsetMs: 55*VD_SEED_MIN, text:'Hail damage + prior lease + title absent. Pass.' },
    { srno:5, year:2020, make:'TOYOTA',  model:'RAV4',   vin:'2T3P1RFV0LC072105', authorIdx:3, offsetMs: 30*VD_SEED_MIN, text:'Priced right for the trim. Bidding.' },
    { srno:5, year:2020, make:'TOYOTA',  model:'RAV4',   vin:'2T3P1RFV0LC072105', authorIdx:1, offsetMs:  4*VD_SEED_HR,  text:'Full service records on file — nice find.' }
  ];
  function seedIfEmpty(){
    load();
    // Legacy purge — strip old CoreConnect seed rows AND the v2 SMS/email mix.
    var before = _list.length;
    _list = _list.filter(function(n){
      if(!n || typeof n.id !== 'string') return true;
      if(n.id.indexOf('ntf_seed_') === 0) return false;
      if(n.id.indexOf('ntf_v2_')   === 0) return false;
      if(n.id.indexOf('ntf_v3_')   === 0) return false;
      return true;
    });
    if(_list.length !== before) save();
    // Drop the stale v2 flag so it doesn't linger.
    try { localStorage.removeItem('buysmart:notif:seeded:v2'); } catch(e){}
    try { localStorage.removeItem('buysmart:notif:seeded:v3-comments'); } catch(e){}
    // Seed v3 comments once per install.
    try { if(localStorage.getItem(SEED_FLAG) === '1') return; } catch(e){}
    var now = Date.now();
    NOTIF_VD_SEEDS.forEach(function(s){
      var p = NOTIF_VD_TEAM[s.authorIdx % NOTIF_VD_TEAM.length];
      var ts = now - s.offsetMs;
      _list.unshift({
        id: 'ntf_v3_' + Math.floor(Math.random()*1e9),
        type: 'comment',
        leadNo: s.srno,
        leadName: p.name, leadAv: p.av, leadColor: p.color,
        title: s.year + ' ' + s.make + ' ' + s.model,
        body:  s.text,
        ts:    ts,
        read:  (now - ts) > (2 * VD_SEED_HR),
        vdSrno: s.srno, vdVin: s.vin,
        vdYear: s.year, vdMake: s.make, vdModel: s.model
      });
    });
    // CoreConnect & CoreBuy org-level notifications
    var ORG_SEEDS = [
      { type:'coreconnect', name:'John Carter',    av:'JC', color:'#3D81B7', title:'New Lead Assigned',        body:'John Carter assigned to Sarah Kim.',           offsetMs: 3*VD_SEED_MIN,  read:false },
      { type:'coreconnect', name:'Sarah Kim',      av:'SK', color:'#534AB7', title:'Lead Status Changed',      body:'2019 Hyundai Tucson moved to Negotiation.',    offsetMs: 25*VD_SEED_MIN, read:false },
      { type:'coreconnect', name:'Andre Coleman',   av:'AC', color:'#0F6E56', title:'Appointment Rescheduled',  body:'Andre Coleman rescheduled to Sep 6.',          offsetMs: 1*VD_SEED_HR,   read:false },
      { type:'corebuy',     name:'Kevin Ng',        av:'KN', color:'#B77B3D', title:'Vehicle Won',              body:'2020 Toyota RAV4 won at Manheim for $18,500.', offsetMs: 10*VD_SEED_MIN, read:false },
      { type:'corebuy',     name:'Priya Shah',      av:'PS', color:'#3D81B7', title:'New Bid Placed',           body:'$15,200 bid on 2019 Ram 1500 at ADESA.',       offsetMs: 40*VD_SEED_MIN, read:false },
      { type:'corebuy',     name:'James Donovan',   av:'JD', color:'#22C88A', title:'Runlist Updated',          body:'3 vehicles added to Friday runlist.',           offsetMs: 2*VD_SEED_HR,   read:true }
    ];
    ORG_SEEDS.forEach(function(s){
      _list.unshift({
        id: 'ntf_v4_' + Math.floor(Math.random()*1e9),
        type: s.type,
        leadNo: 0,
        leadName: s.name, leadAv: s.av, leadColor: s.color,
        title: s.title,
        body: s.body,
        ts: now - s.offsetMs,
        read: s.read
      });
    });
    _list.sort(function(a,b){ return b.ts - a.ts; });
    save();
    try { localStorage.setItem(SEED_FLAG, '1'); } catch(e){}
  }
  function migrateCommentFields(){
    load();
    var changed = false;
    _list.forEach(function(n){
      if(!n || n.type !== 'comment') return;
      if(n.vdYear != null && n.vdMake && n.vdModel) return;
      var t = String(n.title||'').trim();
      if(!t) return;
      var parts = t.split(/\s+/);
      var y = parseInt(parts[0], 10);
      if(!isNaN(y) && n.vdYear == null){ n.vdYear = y; changed = true; }
      if(parts.length >= 2 && !n.vdMake){  n.vdMake  = parts[1]; changed = true; }
      if(parts.length >= 3 && !n.vdModel){ n.vdModel = parts.slice(2).join(' '); changed = true; }
    });
    if(changed) save();
  }
  function migrateCommentTitles(){
    load();
    var changed = false;
    _list.forEach(function(n){
      if(n && n.type === 'comment' && typeof n.title === 'string' && n.title.indexOf('New comment · ') === 0){
        n.title = n.title.slice('New comment · '.length);
        changed = true;
      }
    });
    if(changed) save();
  }
  function init(){
    injectCss();
    seedIfEmpty();
    migrateCommentTitles();
    migrateCommentFields();
    extendTabs();
    installOverrides();
    render(_currentTab);
    syncBellDot();
    document.addEventListener('click', function(){ var dd = document.getElementById('notif-filter-dd'); if(dd) dd.classList.remove('open'); });

    // Leads page deep-link handler: ?openLead=N&tab=X
    try{
      var m = location.href.match(/[?&]openLead=([^&]+)(?:&tab=([^&]+))?/);
      if(m && typeof window.openContactPanel === 'function'){
        var leadNo = parseInt(decodeURIComponent(m[1]), 10);
        var tab = m[2] ? decodeURIComponent(m[2]) : 'all';
        setTimeout(function(){ try{ window.openContactPanel(leadNo, tab); }catch(e){} }, 50);
      }
    }catch(e){}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
