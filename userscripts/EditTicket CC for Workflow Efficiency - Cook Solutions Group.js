// ==UserScript==
// @name        EditTicket CC for Workflow Efficiency - Cook Solutions Group
// @namespace   Violentmonkey Scripts
// @match       https://cc.cooksolutionsgroup.com/Support/Support/EditTicket*
// @grant       none
// @version     1.2.4
// @author      John Ivan Chan & Angel H. Lule Beltran
// @updateURL   https://github.com/Jicxer/CSG/blob/main/userscripts/EditTicket%20CC%20for%20Workflow%20Efficiency%20-%20Cook%20Solutions%20Group.js
// @downloadURL https://github.com/Jicxer/CSG/blob/main/userscripts/EditTicket%20CC%20for%20Workflow%20Efficiency%20-%20Cook%20Solutions%20Group.js
// @description Makes CC 04:47 8/30/25
// ==/UserScript==


"use strict";

let itemCategories = {
  "No Withdrawal Activity": [
    'no withdrawals dispatch'
  ],
  "No Transaction Activity" : [
    "Notification for ACTMON",
    "Business Rule : No Transactions Activity, Fault Descr : No transaction activity",
    "ATM Processing Transactions",
    "ATM Inactive greater than",
    "ZERO TRANS TERMINAL/8 HOURS",
    "ZERO TRANS TERMINAL/12 HOURS"
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
    "Status code Description :DEVICE IN MAINTENANCE",
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
    "Status code Description :DEPOSITORY LOW/FULL", // notes
    "Status code Description :DEPOSITORY DOWN",
    "Depositor"
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
    "Status code Description :CASH HANDLER DOWN",
    "Status code Description :CANISTER", // notes
    "Notification for CASH THRESHOLD LIMIT REACHED"
  ],
  "Printer": [
    "Receipt Printer Dispatch",
    "(2047, critical)",
    "Business Rule : Device Fault, Fault Descr : Cons prt head jam/go busy fail",
    "Business Rule : Device Fault, Fault Descr : Cons prt paper not load or jam",
    "Business Rule : Printer Paper Other Supply Problems, Fault Descr : Consumer printer fault",
    "Business Rule : Device Fault, Fault Descr : Consumer prt paper jam",
    "Status code Description :CONSUMER PRINTER DOWN", //notes
    "Notification for RECEIPT PRINTER FAILURE"
  ],
  "Card Reader": [
    "Card reader Dispatch",
    "Business Rule : Out of Service, Fault Descr : Card reader fault",
    "Notification for EMV CARD READER FAILURE",
    "(2280, suspect)",
    "(2020, critical)",
    "(2281, critical)",
    "Status code Description :Mult. Card Reader/Writer Warns", // notes
    "Status code Description :CARD READER/WRITER DOWN", // notes
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
    "(2031, critical)",
    "Status code Description :POSSIBLE SKIMMING DEVICE DETECTED" //notes
  ]
};

let companyCategories = {
  "CU Anytime": [
    'COXK'
  ],
  "Southern Michigan Bank and Trust":[
    'AtmApp:JSout2370'
  ],
  "Buckholts State Bank":[
    'I369000'
  ],
  "Cook Solutions Group":[
    'Cook Solutions Group'
  ],
  "Vibe Credit Union":[
    'CK55'
  ],
  "Isabella Bank":[
    "AtmApp:IB"
  ]
};

//=====================================================================================================================================================================\\
//                                                                        Start: Helper & Misc functions
//=====================================================================================================================================================================\\

//// Grabbed from stackoverflow https://stackoverflow.com/questions/64387549/wait-for-settimeout-to-complete-then-proceed-to-execute-rest-of-the-code - Yousaf
function wait(ms) {
   return new Promise(resolve => {
      setTimeout(resolve, ms);
   });
}

async function waitForSelector(selector, timeoutMs = 5000, pollIntervalMs = 100){
  const startTime = Date.now();
  while(Date.now() - startTime < timeoutMs){
    const element = document.querySelector(selector);
    if(element){
      console.log('Found element within timeframe', selector)
      return element;
    }
    await wait(pollIntervalMs);
  }
  console.log(`Could not find selector ${selector}`);
  return null;
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
  let dropDownArray = Array.from(dropdown.options).find(option =>
    option.textContent.trim().toLowerCase() === targetLabel.toLowerCase());
  if(!dropDownArray){
    return console.log(`FUNCTION findOption: Could not find ${targetLabel} from ${dropdown}.`);
  }
  return dropDownArray;
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
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault(); // Prevent the default save action
        console.log('Ctrl+S was pressed, but default action is overridden!');
        clickSaveButton();
    }
});

document.addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === '-') {
        event.preventDefault(); // Prevent the default save action
        const assignButton = document.querySelector(".assigntome");
        await main();
        if(!(assignButton.hasAttribute('disabled'))){
            console.log("Ccking assign to me");
            assignButton.click();
        }

    }
});

// Overrides ctrl + q and brings up add notes modal.
// Press again to submit the notes. Feel free to change it to whatever.
document.addEventListener('keydown', function(event){
  if(event.ctrlKey && event.key.toLowerCase() === 'q'){
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

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'i') {
    e.preventDefault();
    try {
      const val = customPrompt();
      addNotes(val);
    } catch (err) {
      console.error('Error in custom prompt or adding notes:', err);
    }
  }
});

async function customPrompt(callback) {
  const overlay = document.createElement('div');
  overlay.style = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.4);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:99999;
  `;

  const box = document.createElement('div');
  box.style = `
    background:#fff;
    padding:20px;
    border-radius:8px;
    max-width:600px;
    width:80%;
    box-shadow:0 6px 20px rgba(0,0,0,.25);
  `;

  box.innerHTML = `
    <h3>Enter notes</h3>
    <textarea id="noteInput" style="width:100%;height:100px;"></textarea>
    <div style="margin-top:10px;text-align:right">
      <button id="cancelBtn">Cancel</button>
      <button id="okBtn">OK</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  function close() {
    overlay.remove();
  }

  box.querySelector('#cancelBtn').onclick = close;
  box.querySelector("#noteInput").focus();
  box.querySelector('#okBtn').onclick = () => {
    const val = document.getElementById('noteInput').value;
    callback(val);
    close();
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Optional: ESC key cancels
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Enter') {
    const val = document.getElementById('noteInput').value;
    callback(val);
    close();
    document.removeEventListener('keydown', escHandler);
    }
  });
}

//=====================================================================================================================================================================\\
//                                                                        Start: SAN Functions
//=====================================================================================================================================================================\\
document.addEventListener('keydown', function(event){
  if(event.ctrlKey && event.key === '`'){
    event.preventDefault();
    console.log('Pressed SAN hotkey');
    const videoModal = document.getElementById('FilePreviewModal');
    const visibleModal = videoModal.getAttribute('aria-hidden') === 'false';
    const closeButton = videoModal.querySelector('.btn-secondary');

    const videoLink = document.querySelector('.file-preview');
    const validLink = videoLink && videoLink.textContent?.includes('.mp4');

    if(!validLink){
      console.log('Not a valid link...');
      return;
    }
    if(visibleModal){
      console.log('Modal is visible');
      closeButton.click();
      closeAsNFF();
    }
    else{
      console.log('Pressed when modal is not visible');
      videoLink.click();
    }
  }
});

async function closeAsNFF(){
  const boardDropDown = await waitForSelector('#ddlBoard');
  const statusDropDown = await waitForSelector('#ddlStatus');
  const subTypeDropDown = await waitForSelector('#ddlSubTypeItem');

  const sanSelected = findOption(boardDropDown, 'SAN').selected;
  const retroSelected = findOption(boardDropDown, 'SAN - Retroactive').selected;
  if (!sanSelected && !retroSelected) {
    return console.log('Neither SAN/Retro were selected');
  }
  console.log('Changing the value for the notes to no fraud found!');
  await addNotes('Video reviewed, no fraud found');
  statusDropDown.value = findOption(statusDropDown, 'closed')?.value;
  subTypeDropDown.value = findOption(subTypeDropDown, 'no fraud found')?.value;
  clickSaveButton();
}

async function addNotes(notes){
  addSupportNotes(true);
  await wait(1000);
  const addNotestxt = await waitForSelector('#txtNoteDescription');
  if(!addNotestxt){
    return console.log('Textbox not found');
  }
  addNotestxt.value = notes;
  SubmitNotes(true);
}
//=====================================================================================================================================================================\\
//                                                                        Start: ATM Functions
//=====================================================================================================================================================================\\

//=======================================================
// Start: getLabel function
//=======================================================
/**
 * Feature: Find matching keywords from title and returns the corresponding label
 * Description:
 *  Pass a specific category variable as a parameter
 *  Iterate through this list and see if there is a match then return the selected label if there is a match
 */
function getLabel(category){
  const titleValue = document.getElementById('txtTitle').value.trim().toLowerCase();
  const ticketNotes = Array.from(document.querySelectorAll('.notice_info'));
  const parentNote = ticketNotes.at(-1)?.textContent.trim().toLowerCase() || '';

  let selectedLabel = null;
  for (const [label, keywords] of Object.entries(category)) {
    for (const keyword of keywords){
      if(titleValue.includes(keyword.toLowerCase()) || (parentNote.includes(keyword.toLowerCase()))){
        selectedLabel = label;
        break;
      }
    }
    if (selectedLabel) break;
  }
  return selectedLabel;
}

async function addEquipment(){
  //handleaddNewEquipmentClick();
}
/**
 * Feature: Select the location based on title.
 * Description:
 *  Compare an array from the dropdown options and compare to title
    If the title contains the terminal name, pick that location
 */
async function selectLocation(){
  const titleValue = document.getElementById('txtTitle').value.trim().toLowerCase();
  const ticketNotes = Array.from(document.querySelectorAll('.notice_info'));
  let locationDropDown = await waitForSelector('#ddlLocation');
  if(!locationDropDown){
    return console.log(`EXITED selectLocation FUNCTION: locationDropDown is null: ${locationDropDown}`);
  }
  const ItemOptionsArray = Array.from(locationDropDown.options).map(opt => ({
    label: opt.textContent,
    customerNumber: opt.value,
    terminal: opt.dataset.subtitle3,
    address: opt.dataset.subtitle + ' ' + opt.dataset.subtitle2
  }));
  console.log(ItemOptionsArray);
  console.log("titleValue:", titleValue);

  const matchedOption = ItemOptionsArray.find(
  opt => titleValue.includes(opt.terminal?.toLowerCase())
  );

  if(!matchedOption){
    return console.log(`EXITED selectLocation FUNCTION: matchedOption is null: ${matchedOption}`);
  }
  console.log(matchedOption);
  console.log(matchedOption.customerNumber)
  // Location dropdown #ddlLocation values are CST numbers according to CC.
  locationDropDown.value = matchedOption.customerNumber;
  locationDropDown.dispatchEvent(new Event('change', {bubbles: true}));
  console.log(`Changing dropdown to ${matchedOption.label}`);
  return;
}
/**
 * Feature: Interact with #ddlSupportCompany dropdown and auto select an option based on title
 * Description:
 *  Identify company drop down, retrieve the label from title and pick the company.
 */
async function selectCompany(){
  let companyDropDown = await waitForSelector('#ddlSupportCompany');
  if(companyDropDown.options.length <= 2){
    console.log(`selectCompany FUNCTION: - ${companyDropDown.options.length}`);
    return;
  }

  let companyLabel = getLabel(companyCategories);
  console.log(`${companyLabel}`);
  if(companyDropDown.selectedIndex === 0){
    if(companyLabel){
      companyDropDown.value = findOption(companyDropDown, companyLabel).value;
      companyDropDown.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`Dropdown set to: ${companyLabel} (value: ${companyLabel})`);
      //await selectLocation(); // Move this eventually to main
      return true;
    }
    console.log(`selectCompany FUNCTION: companyLabel is null - ${companyLabel}`);
    companyDropDown.value = findOption(companyDropDown, 'Cook Solutions Group').value;
    companyDropDown.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  console.log("selectCompany FUNCTION: Ticket already has an item selected!");
  return;
}



//=======================================================
// Start: selectItem function
//=======================================================
/**
 * Feature: Select the item based on the item drop down options
 * Description: Turn the dropdown into an array and match keywords/labels based off obj variable
 */
async function selectItem(){
  const selectItemDropDown = await waitForSelector('#ddlSubTypeItem');
  if(!selectItemDropDown){
    return console.log('EXITED selectItem FUNCTION: Item drop down not found.');
  }

  let label = getLabel(itemCategories);
  if(!label){
    return console.log(`EXITED selectItem FUNCTION: ${label} not found.`);
  }
  const matchedOption = findOption(selectItemDropDown, label)
  selectItemDropDown.value = matchedOption.value;
  return console.log(`Dropdown set to: ${label} (value: ${label})`);
}
/**
 * Feature: Change type and subtype option on subtype based on ITM/ATM tickets.
 * Description: Change the "type" & "subtype" portion of the ticket when working on an ATM/ITM ticket as specified on the Board dropdown
 */
async function autoChangeType(){
  const boardDropDown = await waitForSelector('#ddlBoard')
  const ATMITMOption = findOption(boardDropDown, 'atm/itm');

  if(boardDropDown.value === ATMITMOption.value){
    const typeDropDown = await waitForSelector('#ddlType');
    typeDropDown.value = findOption(typeDropDown, 'hardware').value;
    typeDropDown.dispatchEvent(new Event('change', {bubbles: true}));

    const subTypeDropDown = await waitForSelector('#ddlSubType');
    subTypeDropDown.value = findOption(subTypeDropDown, 'network notification').value;
    subTypeDropDown.dispatchEvent(new Event('change', {bubbles: true}));
    return console.log('Successfully updated ticket');
  }
  return console.log("EXITED autoChangeType FUNCTION: Not on ATM/ITM Board.")
}

//=======================================================
// Start: Assign to Me change state Function
//=======================================================
/**
 * Feature: Automatically change the state to "in progress" after assigning the ticket to user using "assign to me button"
 * Description: Function responsible for change state to "in progress"
 */
async function setStatusToInProgress(){
  const statusDropDown = await waitForSelector('#ddlStatus');
  if (!statusDropDown){
    return console.log('EXITED setStatusToInProgress FUNCTION: Status drop down not found.');
  }

  const inProgressOption = findOption(statusDropDown, 'in progress');
  statusDropDown.value = inProgressOption.value;
  console.log('setStatusToInProgress FUNCTION: Status changed to In Progress');
  return;
}

/**
 * Feature: Assign to Me button click functionality
 * Description:
 *  Attaches a click event listener to "Assign to Me" button
 *  When clicked, triggers delayed call to ticket state "in progress" - (attempts to) prevent multiple listeners with handlerAttched
 */
async function hookAssignButton(){
  const assignButton = document.querySelector(".assigntome");
  if(assignButton && !assignButton.dataset.handlerAttached) {
    assignButton.addEventListener('click', async () => {
      console.log('FUNCTION hookAssignButton: Calling Main');
      await main(autoSave = true);
    });
    assignButton.dataset.handlerAttached = true; // attached listener
  }
}



window.addEventListener('load', hookAssignButton);
let emptyTicket = null;
let autoSave = null;

async function main(autoSave){
  console.log("FUNCTION main: Changing Ticket");
  let changedCompanyDropDown = await selectCompany();
  console.log(`changedCompanyDropDown: ${changedCompanyDropDown}`);
  await setStatusToInProgress();
  await autoChangeType();
  await selectItem();
  /*
  if(changedCompanyDropDown){
    console.log("Changed Company Drop Down");
    //await selectLocation();
    //await addEquipment();
  }
*/
  if(autoSave){
    await wait(2000);
    await clickSaveButton();
  }
}

const bodyObserver = new MutationObserver(() => {
  (async () => {
    const modal = document.querySelector('#modal-addnote');
    if (modal && !modal.classList.contains('mfp-hide')) {
      handleAddNotesCheckboxes();
    }
    const emptyTicket = checkResources();
    if (!emptyTicket) {
      console.log("Ticket is taken, returning");
      return;
    }
    await hookAssignButton();
  })();
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
