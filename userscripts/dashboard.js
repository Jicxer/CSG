// ==UserScript==
// @name        Dashboard refresh
// @namespace   Violentmonkey Scripts
// @match       https://cc.cooksolutionsgroup.com/Support/Dashboard/TicketDashboard#
// @grant       none
// @version     1.0
// @author      Angel H. Lule Beltran
// @description Refreshes the board
// ==/UserScript==

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
      // Call your function
      myFunction();
    }
  });
   
  function myFunction() {
    console.log('Hotkey triggered: Ctrl + q');
    // Your logic here
    RefreshGridAndGaugeWithFilters();
  }
   