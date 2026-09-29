/* Shared report list for reporting.html and report-edit.html.
   Persisted in localStorage so edits survive navigation between the two pages. */
(function(){
  var KEY = 'corepanel-reports';

  var DEFAULTS = [
    { id:1,  name:'Lead Response Time Report',   owner:'System', desc:'Get Response Time Report', src:'Lead Source', status:'Active' },
    { id:2,  name:'Lead Volume Report',          owner:'System', desc:'Get filtered Volume Leads', src:'Lead Source', status:'Active' },
    { id:3,  name:'Appointment Set Rate Report', owner:'System', desc:'Get filtered Appintment Leads', src:'Lead Source', status:'Active' },
    { id:4,  name:'Delivered Units Report',      owner:'System', desc:'Get Vehicles Sold within timeframe Report', src:'Sales Source', status:'Active' },
    { id:5,  name:'Appointment Show Rate Report',owner:'System', desc:'Displays the percentage of scheduled appointments where customers actually showed up, helping evaluate appointment effectiveness.', src:'Appointment', status:'Active' },
    { id:6,  name:'Active-Inactive Lead Report', owner:'System', desc:'Get Active or Inactive Leads', src:'Lead Source', status:'Active' },
    { id:7,  name:'Lead Source Report',          owner:'System', desc:'Get filtered Sourse Leads', src:'Lead Source', status:'Active' },
    { id:8,  name:'Lead Aging Report',           owner:'System', desc:'Get leads based on aging days', src:'Lead Source', status:'Active' },
    { id:9,  name:'Lost Lead Analysis Report',   owner:'System', desc:'Get Lost (Inactive) Leads Analysis Report', src:'Lead Source', status:'Active' },
    { id:10, name:'Sales Activity Report',       owner:'System', desc:'Get Report of Sales Activity', src:'Sales', status:'Active' },
    { id:11, name:'Lead Conversion Report',      owner:'System', desc:'Get lead to sale conversion rates', src:'Lead Source', status:'Active' },
    { id:12, name:'Appointment No-Show Report',  owner:'System', desc:'Get appointments customers did not attend', src:'Appointment', status:'Active' },
    { id:13, name:'Sales Performance Report',    owner:'System', desc:'Get sales performance by representative', src:'Sales', status:'Active' },
    { id:14, name:'Inventory Aging Report',      owner:'System', desc:'Get vehicles by days in inventory', src:'Sales Source', status:'Active' },
    { id:15, name:'Call Activity Report',        owner:'System', desc:'Get inbound and outbound call activity', src:'Lead Source', status:'Active' },
    { id:16, name:'Revenue Summary Report',      owner:'System', desc:'Get revenue totals within timeframe', src:'Sales Source', status:'Active' }
  ];

  var DEFAULT_COLUMNS = [
    { field:'Contact',        header:'Contact' },
    { field:'Customer Name',  header:'Customer Name' },
    { field:'First Response', header:'First Response' },
    { field:'Response Type',  header:'Response Type' },
    { field:'Minutes',        header:'Response Time in HH: MM' },
    { field:'Source',         header:'Source' },
    { field:'Stock No',       header:'Stock No' }
  ];

  var DEFAULT_FILTER_FIELDS = [
    'Contact', 'Customer Name', 'Stock No', 'Vehicle',
    'Assigned User', 'Assigned Label', 'Created Date', 'Active'
  ];

  var ADMIN_USERS = ['Amin Hussain', 'Amin Hussain FL', 'Amin Hussain DS'];

  window.ReportsStore = {
    SOURCES: ['Lead Source', 'Sales Source', 'Appointment', 'Sales'],
    OPERATORS: ['-', 'Is', 'Is not', 'Contains', 'Greater than', 'Less than', 'Between'],
    defaultPermissions: function(){
      return ADMIN_USERS.map(function(u){ return { user:u, view:false, exec:false }; });
    },
    defaultFilters: function(src){
      return DEFAULT_FILTER_FIELDS.map(function(f){
        return { field:f, def:false, op:'-', val:'', ds:src || 'Lead Source', visible:false };
      });
    },
    defaultColumns: function(src){
      return DEFAULT_COLUMNS.map(function(c){
        return { field:c.field, header:c.header, ds:src || 'Lead Source' };
      });
    },
    load: function(){
      try {
        var raw = localStorage.getItem(KEY);
        if(raw) return JSON.parse(raw);
      } catch(e){}
      return DEFAULTS.map(function(r){ return Object.assign({}, r); });
    },
    save: function(reports){
      try { localStorage.setItem(KEY, JSON.stringify(reports)); } catch(e){}
    },
    get: function(id){
      return this.load().filter(function(r){ return r.id === id; })[0] || null;
    },
    update: function(id, changes){
      var all = this.load();
      var r = all.filter(function(x){ return x.id === id; })[0];
      if(!r) return null;
      Object.keys(changes).forEach(function(k){ r[k] = changes[k]; });
      this.save(all);
      return r;
    }
  };
})();
