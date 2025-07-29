// ==UserScript==
// @name        Dashboard refresh
// @namespace   Violentmonkey Scripts
// @match       https://cc.cooksolutionsgroup.com/Support/Dashboard/TicketDashboard
// @grant       none
// @version     1.0
// @author      Angel H. Lule Beltran & Ivan Chan
// @description Refreshes the board 7/27/25 05:11
// ==/UserScript==

'use strict';

let mousePositionY = 0;
let scrollTimeout = null;
let observerActivated = false;

// Track the mouse
document.addEventListener('mousemove', (e) => {
  mousePositionY = e.clientY + window.scrollY;
});

// Ctrl+Q listener
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key.toLowerCase() === 'q') {

    myFunction();
  }
});

// Selects the 100-ticket link
function select_100() {
  const menu_items = document.querySelectorAll('[role=menuitem]');
  for (const item of menu_items) {
    if (item.textContent.trim() === '100') {
      const link = item.querySelector('a');
      if (link) {
        return link;
      }
    }
  }
  return null;
}

// Main trigger function
function myFunction() {

  console.log('Ctrl + Q pressed: Refreshing gauge...');
  observerActivated = true;
  RefreshGridAndGaugeWithFilters();
}

function getPage(){

  let currPage = document.querySelector('li.page-item.active');
  console.log("Current page is:", currPage.textContent);
  sessionStorage.setItem('prevPage', currPage.textContent.trim());
}

// Be able to search when not scrolled all the way up
function usableSearchBar(){

}

// Observer to wait for DOM settle after refresh
const bodyObserver = new MutationObserver(() => {
  if (!observerActivated) return;

  if (scrollTimeout) clearTimeout(scrollTimeout);

  /*
  document.addEventListener('click', function(event){
    const pageNav = document.querySelectorAll('a.page-link');
    for (let i = 0; i < pageNav.length; i++){
      if(pageNav[i].textContent !== '<' || pageNav[i].textContent !== '>'){
        console.log(pageNav[i]);
      }
    }

  });
  */

  scrollTimeout = setTimeout(() => {
    console.log('DOM appears settled. Scrolling to saved mouse position...');
    window.scrollTo({ top: mousePositionY, behavior: 'auto' });

    // Now try to find the link again (fresh DOM)
    const link = select_100();
    if (link) {
      console.log("Clicking '100' link after DOM refresh...");
      link.click();
    } else {
      console.log("Could not find '100' link after refresh.");
    }

    observerActivated = false; // Reset flag
  }, 700); // Slightly increased delay
});

// Always watch the DOM
bodyObserver.observe(document.body, { childList: true, subtree: true });
