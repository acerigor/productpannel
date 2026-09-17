/* Shared date-range picker — window.CCDateRangePicker
 *
 * Usage:
 *   CCDateRangePicker.open({
 *     anchor:   HTMLElement,
 *     from:     'MM/DD/YYYY' | null,   // seed start date
 *     to:       'MM/DD/YYYY' | null,   // seed end date
 *     onApply:  function({from, to}){ ... },   // fires on Apply when both set
 *     onCancel: function(){ ... }              // optional
 *   });
 *   CCDateRangePicker.close();
 *   CCDateRangePicker.isOpen();
 *
 * Depends on:
 *   - shared/contact-panel.css       (.assign-popup chrome)
 *   - shared/date-range-picker.css   (.cc-drp-* layout)
 */
(function(w){
  var POP_ID = 'cc-drp-pop';
  var PREV_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"/></svg>';
  var NEXT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
  var WARN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  var WDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var state = {
    anchor: null,
    onApply: null, onCancel: null,
    from: null, to: null,        // Date | null
    focus: 'from',                // 'from' | 'to'
    leftYear: 0, leftMonth: 0,    // left grid month
    open: false
  };

  function pad2(n){ return (n<10?'0':'')+n; }
  function fmtDate(d){ return pad2(d.getMonth()+1)+'/'+pad2(d.getDate())+'/'+d.getFullYear(); }
  function fmtLabel(d){ return MONTHS_SHORT[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }
  function parseDate(s){
    if(!s) return null;
    var m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m) return null;
    var d = new Date(parseInt(m[3],10), parseInt(m[1],10)-1, parseInt(m[2],10));
    return isNaN(d.getTime()) ? null : d;
  }
  function sameDay(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function stripTime(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function ensure(){
    var pop = document.getElementById(POP_ID);
    if(pop) return pop;
    pop = document.createElement('div');
    pop.id = POP_ID;
    pop.className = 'assign-popup cc-drp-pop';
    pop.style.display = 'none';
    pop.innerHTML = ''
      + '<div class="cc-drp-chips">'
      +   '<button class="cc-drp-chip" id="cc-drp-chip-from" data-focus="from"></button>'
      +   '<button class="cc-drp-chip" id="cc-drp-chip-to"   data-focus="to"></button>'
      + '</div>'
      + '<div class="cc-drp-nav-row">'
      +   '<button class="cc-drp-nav" data-nav="prev" aria-label="Previous month">'+PREV_SVG+'</button>'
      +   '<div class="cc-drp-titles"><div class="cc-drp-title" id="cc-drp-title-l"></div><div class="cc-drp-title" id="cc-drp-title-r"></div></div>'
      +   '<button class="cc-drp-nav" data-nav="next" aria-label="Next month">'+NEXT_SVG+'</button>'
      + '</div>'
      + '<div class="cc-drp-grids">'
      +   '<div><div class="cc-drp-wdays">'+WDAYS.map(function(d){return '<span class="cc-drp-wday">'+d+'</span>';}).join('')+'</div><div class="cc-drp-grid" id="cc-drp-grid-l"></div></div>'
      +   '<div><div class="cc-drp-wdays">'+WDAYS.map(function(d){return '<span class="cc-drp-wday">'+d+'</span>';}).join('')+'</div><div class="cc-drp-grid" id="cc-drp-grid-r"></div></div>'
      + '</div>'
      + '<div class="cc-drp-foot">'
      +   '<button class="cc-drp-today" id="cc-drp-today">Today</button>'
      +   '<div class="cc-drp-warn" id="cc-drp-warn">'+WARN_SVG+'<span>Kindly specify your date range</span></div>'
      +   '<div class="cc-drp-actions">'
      +     '<button class="cc-drp-cancel" id="cc-drp-cancel">Cancel</button>'
      +     '<button class="cc-drp-apply"  id="cc-drp-apply">Apply</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(pop);

    pop.querySelectorAll('.cc-drp-nav').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var dir = btn.getAttribute('data-nav') === 'next' ? 1 : -1;
        state.leftMonth += dir;
        if(state.leftMonth < 0){ state.leftMonth = 11; state.leftYear--; }
        else if(state.leftMonth > 11){ state.leftMonth = 0; state.leftYear++; }
        render();
      });
    });
    pop.querySelectorAll('.cc-drp-chip').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        state.focus = btn.getAttribute('data-focus');
        render();
      });
    });
    pop.querySelector('#cc-drp-today').addEventListener('click', function(e){
      e.stopPropagation();
      var now = new Date();
      state.from = null;
      state.to   = null;
      state.focus = 'from';
      state.leftYear  = now.getFullYear();
      state.leftMonth = now.getMonth();
      var warn = pop.querySelector('#cc-drp-warn');
      if(warn) warn.classList.remove('show');
      if(typeof state.onApply === 'function') state.onApply({ from: null, to: null });
      w.CCDateRangePicker.close();
    });
    pop.querySelector('#cc-drp-cancel').addEventListener('click', function(e){
      e.stopPropagation();
      if(typeof state.onCancel === 'function') state.onCancel();
      w.CCDateRangePicker.close();
    });
    pop.querySelector('#cc-drp-apply').addEventListener('click', function(e){
      e.stopPropagation();
      if(!state.from || !state.to){
        pop.querySelector('#cc-drp-warn').classList.add('show');
        return;
      }
      var val = { from: fmtDate(state.from), to: fmtDate(state.to) };
      if(typeof state.onApply === 'function') state.onApply(val);
      w.CCDateRangePicker.close();
    });
    return pop;
  }

  function renderMonthGrid(gridEl, year, month){
    var first = new Date(year, month, 1);
    var startDow = first.getDay();
    var daysInMonth = new Date(year, month+1, 0).getDate();
    var daysInPrev  = new Date(year, month, 0).getDate();
    var today = stripTime(new Date());
    var cells = [];
    for(var i=startDow-1; i>=0; i--){
      cells.push({ y:(month===0?year-1:year), m:(month===0?11:month-1), d:daysInPrev - i, other:true });
    }
    for(var d=1; d<=daysInMonth; d++){ cells.push({ y:year, m:month, d:d, other:false }); }
    var nextD = 1;
    while(cells.length < 42){
      cells.push({ y:(month===11?year+1:year), m:(month===11?0:month+1), d:nextD++, other:true });
    }
    var lo = null, hi = null;
    if(state.from && state.to){ lo = state.from < state.to ? state.from : state.to; hi = state.from < state.to ? state.to : state.from; }
    gridEl.innerHTML = cells.map(function(c, idx){
      var dt = new Date(c.y, c.m, c.d);
      var cls = 'cc-drp-cell';
      if(c.other) cls += ' other-month';
      if(sameDay(dt, today)) cls += ' today';
      var isStart = false, isEnd = false, isIn = false;
      if(lo && hi){
        if(sameDay(dt, lo)) isStart = true;
        else if(sameDay(dt, hi)) isEnd = true;
        else if(dt > lo && dt < hi) isIn = true;
      } else if(state.from && sameDay(dt, state.from)){
        isStart = true;
      }
      if(isStart) cls += ' range-start';
      if(isEnd)   cls += ' range-end';
      if(isIn)    cls += ' in-range';
      // Connector bars — extend the range fill under the round endpoint toward the neighbor cell
      if(isStart && lo && hi){
        var nextIdx = idx + 1;
        var next = cells[nextIdx];
        if(next){
          var ndt = new Date(next.y, next.m, next.d);
          if(sameDay(ndt, hi) || (ndt > lo && ndt < hi)) cls += ' has-next';
        }
      }
      if(isEnd && lo && hi){
        var prev = cells[idx-1];
        if(prev){
          var pdt = new Date(prev.y, prev.m, prev.d);
          if(sameDay(pdt, lo) || (pdt > lo && pdt < hi)) cls += ' has-prev';
        }
      }
      return '<button class="'+cls+'" data-y="'+c.y+'" data-m="'+c.m+'" data-d="'+c.d+'">'+c.d+'</button>';
    }).join('');
    gridEl.querySelectorAll('.cc-drp-cell').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var y = parseInt(btn.getAttribute('data-y'),10);
        var m = parseInt(btn.getAttribute('data-m'),10);
        var day = parseInt(btn.getAttribute('data-d'),10);
        var picked = new Date(y, m, day);
        onCellPick(picked);
      });
    });
  }

  function onCellPick(picked){
    // First click sets from, second sets to; swap if reversed. Third restarts.
    if(state.focus === 'from' || !state.from || (state.from && state.to)){
      state.from = picked;
      state.to = null;
      state.focus = 'to';
    } else {
      if(picked < state.from){
        state.to = state.from;
        state.from = picked;
      } else {
        state.to = picked;
      }
      state.focus = 'from';
    }
    // Clear any warning once user makes progress
    var warn = document.getElementById('cc-drp-warn');
    if(warn) warn.classList.remove('show');
    render();
  }

  function render(){
    var pop = ensure();
    var rightMonth = state.leftMonth === 11 ? 0 : state.leftMonth + 1;
    var rightYear  = state.leftMonth === 11 ? state.leftYear + 1 : state.leftYear;
    pop.querySelector('#cc-drp-title-l').textContent = MONTHS[state.leftMonth] + ' ' + state.leftYear;
    pop.querySelector('#cc-drp-title-r').textContent = MONTHS[rightMonth] + ' ' + rightYear;
    // Chips
    var fromChip = pop.querySelector('#cc-drp-chip-from');
    var toChip   = pop.querySelector('#cc-drp-chip-to');
    if(state.from){ fromChip.textContent = fmtLabel(state.from); fromChip.classList.remove('placeholder'); }
    else { fromChip.textContent = 'Start date'; fromChip.classList.add('placeholder'); }
    if(state.to){ toChip.textContent = fmtLabel(state.to); toChip.classList.remove('placeholder'); }
    else { toChip.textContent = 'End date'; toChip.classList.add('placeholder'); }
    fromChip.classList.toggle('active', state.focus === 'from');
    toChip.classList.toggle('active', state.focus === 'to');
    // Grids
    renderMonthGrid(pop.querySelector('#cc-drp-grid-l'), state.leftYear, state.leftMonth);
    renderMonthGrid(pop.querySelector('#cc-drp-grid-r'), rightYear, rightMonth);
  }

  function positionUnder(anchor){
    var pop = ensure();
    var r = anchor.getBoundingClientRect();
    var popW = pop.getBoundingClientRect().width || 560;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - popW - 8));
    pop.style.left = left + 'px';
    pop.style.top  = (r.bottom + 6) + 'px';
  }

  w.CCDateRangePicker = {
    open: function(o){
      o = o || {};
      if(!o.anchor) return;
      var pop = ensure();
      if(state.open && state.anchor === o.anchor){ this.close(); return; }
      var f = parseDate(o.from), t = parseDate(o.to);
      state.from = f;
      state.to   = t;
      state.focus = f ? (t ? 'from' : 'to') : 'from';
      var seed = f || new Date();
      state.leftYear  = seed.getFullYear();
      state.leftMonth = seed.getMonth();
      state.onApply  = o.onApply  || null;
      state.onCancel = o.onCancel || null;
      state.anchor = o.anchor;
      pop.style.display = 'block';
      // Reset warn
      var warn = pop.querySelector('#cc-drp-warn'); if(warn) warn.classList.remove('show');
      render();
      positionUnder(o.anchor);
      state.open = true;
    },
    close: function(){
      var pop = document.getElementById(POP_ID);
      if(pop) pop.style.display = 'none';
      state.open = false;
      state.anchor = null;
      state.onApply = null;
      state.onCancel = null;
    },
    isOpen: function(){ return state.open; }
  };

  document.addEventListener('mousedown', function(e){
    if(!state.open) return;
    if(e.target.closest && e.target.closest('#'+POP_ID)) return;
    if(state.anchor && state.anchor.contains && state.anchor.contains(e.target)) return;
    w.CCDateRangePicker.close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && state.open) w.CCDateRangePicker.close();
  });
  window.addEventListener('resize', function(){
    if(state.open && state.anchor) positionUnder(state.anchor);
  });
})(window);
