// ==UserScript==
// @name        EditTicket CC for Workflow Efficiency - Cook Solutions Group
// @namespace   Violentmonkey Scripts
// @match       https://cc.cooksolutionsgroup.com/Support/Support/EditTicket*
// @grant       none
// @version     1.2.0
// @author      John Ivan Chan & Angel H. Lule Beltran
// @updateURL   https://github.com/Jicxer/CSG/blob/main/userscripts/EditTicket%20CC%20for%20Workflow%20Efficiency%20-%20Cook%20Solutions%20Group.js
// @downloadURL https://github.com/Jicxer/CSG/blob/main/userscripts/EditTicket%20CC%20for%20Workflow%20Efficiency%20-%20Cook%20Solutions%20Group.js
// @description Makes CC 05:12 8/9/25
// ==/UserScript==


"use strict";

//=====================================================================================================================================================================\\
//                                                                        Start: Helper & Misc functions
//=====================================================================================================================================================================\\

//// Grabbed from stackoverflow https://stackoverflow.com/questions/64387549/wait-for-settimeout-to-complete-then-proceed-to-execute-rest-of-the-code - Yousaf
function wait(seconds) {
   return new Promise(resolve => {
      setTimeout(resolve, seconds * 1000);
   });
}
//=======================================================
// Start: Click save button helper function
//=======================================================
function clickSaveButton(){
    const saveButton = document.querySelector('.EditTicket');
    saveButton.click();
    console.log('Clicked save button');
}

//=======================================================
// Start: Helper function for checking if there's a resource
//=======================================================
function checkResources(){
  const resourceTable = document.getElementById('tblResources');
  if(!resourceTable){
    return console.log("No resource table found");
  }

  const emptyResource = resourceTable.querySelector('.no-records-found');
  if(emptyResource){
    console.log('There is no resource yet, go ahead and assign');
    return true;
  }
  return false;
}

/**
 * Helper: Finds an option in a dropdown by value and label text.
 * @param {HTMLSelectElement} dropdown - The dropdown element to search in
 * @param {string} targetValue - The value attribute to match
 * @param {string} targetLabel - The visible text (innerText) to match (case-insensitive, trimmed)
 * @returns {HTMLOptionElement|null} The matching option or null if not found
 */
function findOption(dropdown, targetLabel) {
  return Array.from(dropdown.options).find(option =>
    option.textContent.trim().toLowerCase() === targetLabel.toLowerCase()
  );
}

//=======================================================
// Start: Add Notes Checkbox Function
//=======================================================
/**
 * Feature: Auto-uncheck Add Notes checkboxes
 * Description: Underlying function responsible for unchecking Addnotes checkboxes
 */
function handleAddNotesCheckboxes(){
  const checkboxIDs = ['chkContact', 'chkResources', 'chkCC'];
  checkboxIDs.forEach(id => {
    const checkbox = document.getElementById(id);
    // This never gets checked but might as well be safe.
    if(!checkbox){
      console.log(id, 'not found');
      return;
    }
    if(checkbox.checked){
      console.log(id, 'is checked, unchecking now...');
      checkbox.click();
    }
    else{
      console.log(id, 'already unchecked');
    }
  })
}

// Override Ctrl + S and make it save the ticket :o
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the default save action
        console.log('Ctrl+S was pressed, but default action is overridden!');
        clickSaveButton();
    }
});

// Overrides ctrl + q and brings up add notes modal.
// Press again to submit the notes. Feel free to change it to whatever.
document.addEventListener('keydown', function(event){
  if(event.ctrlKey && event.key === 'q'){
    event.preventDefault();

    const modal = document.querySelector('#modal-addnote');
    const isVisible = modal && !modal.classList.contains('mfp-hide');

    if(isVisible){
      console.log("Pressed ctrl + q when modal was visible!");
      SubmitNotes(true);
    }
    else{
      console.log("Pressed ctrl + q when modal was not visible!");
      addSupportNotes(true);
    }
  }
});
//=====================================================================================================================================================================\\
//                                                                        Start: SAN Functions
//=====================================================================================================================================================================\\






//=====================================================================================================================================================================\\
//                                                                        Start: ATM Functions
//=====================================================================================================================================================================\\

//=======================================================
// Start: getLabel function
//=======================================================
/**
 * Feature: Find matching keywords from title and returns the corresponding label
 * Description:
 *  Create a list of strings with label & keywords typically found in the title
 *  Iterate through this list and see if there is a match then return the selected label if there is a match
 */
function getLabel(){

  // Define a list of strings that contain typical indications for the item
  let itemCategories = {
    "No Withdrawal Activity": [
      'no withdrawals dispatch'
    ],
    "No Transaction Activity" : [
      "Notification for ACTMON",
      "Business Rule : No Transactions Activity, Fault Descr : No transaction activity",
      "ATM Processing Transactions",
      "ATM Inactive greater than"
    ],
    "Lost Comms": [
      "comm dispatch",
      "offline",
      "Business Rule : Lost Communication, Fault Descr : Session closed by partner",
      "In Service to Off-Line",
      "CommR Dispatch",
      "Online",
      "Notification for COMMUNICATION FAILURE",
      "(5003, critical)",
      "(113, info)",
      "(5004, suspect)",
      "status='C7'",
      "Terminal Off Line As Of",
      "Terminal Closed As Of",
      "Category: Supervisor Dispatch",
      "Business Rule : Out of Service, Fault Descr : No Load",
      "(30, suspect)",
      "Business Rule : Risk Condition, Fault Descr : Excessive txn reversals",
      "Status code Description :DEVICE IS CLOSED" // Notes
    ],
    "Depositor": [
      "Depository Dispatch",
      "Business Rule : Device Fault, Fault Descr : Depository down",
      "Notification for DEPOSITORY FAILURE",
      "(2009, critical)",
      "Notification for CK/MICR READER FAILURE for Device",
      " (2211, suspect)",
      "Business Rule : Device Fault, Fault Descr : Envelope printer down",
      "Business Rule : Device Fault, Fault Descr : Document depository down",
      "Business Rule : Printer Paper Other Supply Problems, Fault Descr : Depository low/full",
      "Status code Description :DEPOSITORY DOWN"
    ],
    "Dispenser": [
      "Dispenser Dispatch",
      "Business Rule : Device Fault, Fault Descr : Cash handler down",
      "Notification for MULTIPLE DISPENSER FAILURE",
      "Business Rule : Device Fault, Fault Descr : Cash handler bill jammed",
      "status='0010'",
      "status='0008'",
      "(2001, critical)",
      "(2005, critical)",
      "Notification for DIVERT FAILURE",
      "Category: Cash Out Dispatch",
      "Business Rule : Device Fault, Fault Descr : Canister",
      "Business Rule : Device Fault, Fault Descr : Cash hand bills not seen exit",
      "Notification for DISPENSER FAILURE",
      "Notification for CASH THRESHOLD LIMIT REACHED"
    ],
    "Printer": [
      "Receipt Printer Dispatch",
      "(2047, critical)",
      "Business Rule : Device Fault, Fault Descr : Cons prt head jam/go busy fail",
      "Business Rule : Device Fault, Fault Descr : Cons prt paper not load or jam",
      "Business Rule : Printer Paper Other Supply Problems, Fault Descr : Consumer printer fault",
      "Business Rule : Device Fault, Fault Descr : Consumer prt paper jam",
      "Notification for RECEIPT PRINTER FAILURE"
    ],
    "Card Reader": [
      "Card reader Dispatch",
      "Business Rule : Out of Service, Fault Descr : Card reader fault",
      "Notification for EMV CARD READER FAILURE",
      "(2280, suspect)",
      "(2020, critical)",
      "(2281, critical)"
    ],
    "Cassette":[
      "status='0016'",
      "Cassettes of type",
      "(50, critical)"
    ],
    "EPP": [
      "Business Rule : Out of Service, Fault Descr : Encryptor down",
      "Notification for ENCRYPTION FAILURE for Device",
      "Category: Encryptor Dispatch"
    ],
    "Anti Skimming" : [
      "Business Rule : Out of Service, Fault Descr : Card skimming fraud detected Hard Fault",
      "Category: Security Dispatch",
      "(2031, critical)"
    ]
  };

  const titleValue = document.getElementById('txtTitle').value.trim().toLowerCase();
  // Create an array from all the notes & select the last element or return an empty a string
  const ticketNotes = Array.from(document.querySelectorAll('.notice_info'));
  const parentNote = ticketNotes.at(-1)?.textContent.trim().toLowerCase() || '';
  console.log(parentNote);
  // Create an array based on the set defined strings objects
  // Look for keywords in title defined by ItemCategories
  let selectedLabel = null;
  for (const [label, keywords] of Object.entries(itemCategories)) {
    for (const keyword of keywords){
      if(titleValue.includes(keyword.toLowerCase()) || (parentNote.includes(keyword.toLowerCase()))){
        console.log('found a keyword: ', keyword);
        selectedLabel = label;
        break;
      }
    }
    if (selectedLabel) break;
  }
  console.log('Found a matching label:', selectedLabel);
  return selectedLabel;
}

//=======================================================
// Start: selectItem function
//=======================================================
/**
 * Feature: Select the item based on the item drop down options
 * Description: Turn the dropdown into an array and match keywords/labels based off obj variable
 */
function selectItem(){

  // Check if this drop down is disabled
  const selectItemDropDown = document.getElementById('ddlSubTypeItem');
  if(selectItemDropDown.disabled){
    return console.log('EXITED FUNCTION: Select Item dropdown is disabled');
  }
  // Grab the correct label based on title patterns
  let label = getLabel();
  if(!label){
    return console.log('EXITED selectItem FUNCTION: label is null');
  }
  console.log("New lable:", label);

  // Create an array based on the dropdown values
  const ItemOptionsArray = Array.from(selectItemDropDown.options).map(opt => ({
    label: opt.textContent.trim(),
    value: opt.value
  }));
  console.log(ItemOptionsArray);

  const matchedOption = ItemOptionsArray.find(
  opt => opt.label.toLowerCase() === label.toLowerCase()
  );

  console.log("Matched Option:", matchedOption);
  // Change the select item value
  selectItemDropDown.value = matchedOption.value;
  // dropdown.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Dropdown set to: ${label} (value: ${label})`);
}

//=======================================================
// Start: Assign to Me change state Function
//=======================================================
/**
 * Feature: Automatically change the state to "in progress" after assigning the ticket to user using "assign to me button"
 * Description: Function responsible for change state to "in progress"
 */
async function setStatusToInProgress(){
  const statusDropDown = document.getElementById('ddlStatus');
  if (!statusDropDown){
    console.log("Drop down not found");
  }

  // Changing in-progress value differs from SAN/ITM&ATM tickets. SAN in progres = 610, ITM/ATM in progress = 153.
  // Change the state based on statetyperecid & trim 'in progress'.
  await wait(2);
  const inProgressOption = findOption(statusDropDown, 'in progress');

  if(!inProgressOption){
    console.log('In Progress option not found');
    return;
  }
  statusDropDown.value = inProgressOption.value;

  // Play around with this and see if it matters to keep; might be imporant to have that time buffer as the rest of the options appear
  // statusDropDown.dispatchEvent(new Event('change', {bubbles: true}));
  console.log('Status changed to In Progress');
  // Change the type and subtype dropdowns
  console.log('Changing type and subtype dropdowns');
  autoChangeType();
  console.log("Changing Item type");
  selectItem();
  console.log('Saving ticket state');
  setTimeout(clickSaveButton, 1000);

}

/**
 * Feature: Assign to Me button click functionality
 * Description:
 *  Attaches a click event listener to "Assign to Me" button
 *  When clicked, triggers delayed call to ticket state "in progress" - (attempts to) prevent multiple listeners with handlerAttched
 */
function hookAssignButton(){
  const assignButton = document.querySelector(".assigntome");
  const saveButton = document.querySelector('.EditTicket');

  // If the button exists and no other listeners
  if(assignButton && !assignButton.dataset.handlerAttached) {
    assignButton.addEventListener('click', () => {

      console.log('Assign to Me button clicked');
      setTimeout(setStatusToInProgress, 4500);
    });
    assignButton.dataset.handlerAttached = true; // attached listener
  }
}

/**
 * Feature: Change type and subtype option on subtype based on ITM/ATM tickets.
 * Description: Change the "type" & "subtype" portion of the ticket when working on an ATM/ITM ticket as specified on the Board dropdown
 */
function autoChangeType(){
  const boardDropDown = document.getElementById('ddlBoard');
  const typeDropDown = document.getElementById('ddlType');
  const subtypeDropDown = document.getElementById('ddlSubType');
  if (!boardDropDown || !typeDropDown || !subtypeDropDown){
    return console.log("Error finding one of dropdowns");
  }

  // Change values for type and subtype based on the board value. Essentially looking for "ATM/ITM"
  // There is no statetyperecid like in Progress drop down but it is 14. Hopefully this is consistent acorss all ATM/ITM tickets.
  // Find if these exists first before changing
  const ATMITMOption = findOption(boardDropDown, 'atm/itm');
  // Option for hardware is 73 for type dropdown
  const hardwareOption = findOption(typeDropDown, 'hardware');

  if(!ATMITMOption || !hardwareOption){
    console.log('Dropdown options could not be found.');
  }

  // If the value of the board dropdown is ATM/ITM, then proceed with changing the other values.
  // Change value of type dropdown to Hardware & subtype dropdown to Network Notification
  console.log('Board dropdown value: ', boardDropDown.value);
  console.log('AtmITMoption value:', ATMITMOption.value);
  if(boardDropDown.value === ATMITMOption.value){

    // Change the value to hardware & since subtype dropdown is initially disabled until input, create an event.
    typeDropDown.value = hardwareOption.value;
    typeDropDown.dispatchEvent(new Event('change', {bubbles: true}));

    // Value for "network notification" is 114. Alternatively can just find keywords like prior variables.
    // This is initially disabled so we wait until there's something for type dropdown.
    const subtypeOption = findOption(subtypeDropDown, 'network notification');
    if(!subtypeOption){
      console.log(subtypeOption, 'could not be found');
    }
    subtypeDropDown.value = subtypeOption.value;
    subtypeOption.dispatchEvent(new Event('change', {bubbles: true}));

    //call save function here
    console.log('Successfully updated ticket');
  }
}

window.addEventListener('load', hookAssignButton);

let emptyTicket = null;
// Set up MutationObserver to observe the DOM
const bodyObserver = new MutationObserver(() => {

  // Detect the notes modal when visible after clicking "add notes" then uncheck boxes.
  const modal = document.querySelector('#modal-addnote');
  if (!modal.classList.contains('mfp-hide')) {
    console.log('Add notes modal is visible!');
    handleAddNotesCheckboxes();
  }
  // Calling Assign Button & change type and subtype dropdowns.
    emptyTicket = checkResources();
    console.log('emptyTicket:', emptyTicket);
    if(!emptyTicket){
      console.log("Ticket is taken, returning");
      return;
    }
    hookAssignButton();
});

// Watch all children, direct or not.
bodyObserver.observe(document.body, { childList: true, subtree: true });
