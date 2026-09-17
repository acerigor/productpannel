/* CorePanel shared search index — powers the global top-header search chip.
   Two arrays hang off window: SEARCH_NAV (nav destinations) and
   SEARCH_ENTITIES (records the user can jump straight to). Each entity's URL
   includes ?q=<term>; the destination page's local search reads ?q on load
   and pre-fills its own input. Hand-authored to mirror per-page seeds since
   this is a static prototype with no shared datastore. */
(function(){
  window.SEARCH_NAV = [
    { label:'Dashboard',                 url:'index.html',                         category:'Page' },
    { label:'Organizations',              url:'organization_list.html',             category:'Page' },
    { label:'Settings',                  url:'settings.html',                      category:'Page' },
    { label:'Organization',              url:'organization.html',                  category:'Settings' },
    { label:'Logo Setting',              url:'settings.html',                      category:'Settings' },
    { label:'Other Setting',             url:'settings.html',                      category:'Settings' },
    { label:'Tooltips',                  url:'tooltips.html',                      category:'Settings' },
    { label:'Default Bid Formula',       url:'defaultbidformula.html',             category:'Settings' },
    { label:'Set Pagination',            url:'settings.html',                      category:'Settings' },
    { label:'Shipping Cost Mapping',     url:'settings.html',                      category:'Settings' },
    { label:'Auction',                   url:'auction.html',                       category:'Settings' },
    { label:'Auction Fees',              url:'auctionfees.html',                   category:'Settings' },
    { label:'Auction Assignment',        url:'auctionassignment.html',             category:'Settings' },
    { label:'Sheet Management',          url:'sheetmanagement.html',               category:'Settings' },
    { label:'Script Management',         url:'scriptmanagement.html',              category:'Settings' },
    { label:'Script Alert',              url:'settings.html',                      category:'Settings' }
  ];

  window.SEARCH_ENTITIES = [];
})();
