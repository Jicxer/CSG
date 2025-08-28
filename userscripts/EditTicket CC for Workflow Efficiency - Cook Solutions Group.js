// ==UserScript==
// @name        EditTicket CC for Workflow Efficiency Test
// @namespace   Violentmonkey Scripts
// @match       https://cc.cooksolutionsgroup.com/Support/Support/EditTicket*
// @grant       none
// @version     1.2.2
// @author      John Ivan Chan & Angel H. Lule Beltran
// @description Makes CC 05:44 8/9/25
// ==/UserScript==

"use strict";

// ===================================
// Helpers
// ===================================

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function clickSaveButton() {
  const saveButton = document.querySelector('.EditTicket');
  if (!saveButton) {
    console.log('Save button not found');
    return;
  }
  saveButton.click();
  console.log('Clicked save button');
}

/**
 * Find an option in a <select> by its visible label (case-insensitive).
 * @param {HTMLSelectElement} dropdown
 * @param {string} targetLabel
 * @returns {HTMLOptionElement|null}
 */
function findOption(dropdown, targetLabel) {
  if (!dropdown) return null;
  return Array.from(dropdown.options).find(
    opt => opt.textContent.trim().toLowerCase() === targetLabel.toLowerCase()
  ) || null;
}

function handleAddNotesCheckboxes() {
  ['chkContact', 'chkResources', 'chkCC'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (!checkbox) {
      console.log(id, 'not found');
      return;
    }
    if (checkbox.checked) {
      console.log(id, 'is checked, unchecking now...');
      checkbox.click();
    } else {
      console.log(id, 'already unchecked');
    }
  });
}

function checkResources() {
  const resourceTable = document.getElementById('tblResources');
  if (!resourceTable) {
    console.log("No resource table found");
    return false;
  }
  const emptyResource = resourceTable.querySelector('.no-records-found');
  if (emptyResource) {
    console.log('There is no resource yet, go ahead and assign');
    return true;
  }
  console.log('Ticket already has a resource');
  return false;
}

// ===================================
// ATM helpers
// ===================================

function getLabel() {
  const itemCategories = {
    "No Withdrawal Activity": [
      'no withdrawals dispatch'
    ],
    "No Transaction Activity": [
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
      "Status code Description :DEVICE IN MAINTENANCE",
      "Status code Description :DEVICE IS CLOSED"
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
      "Status code Description :DEPOSITORY LOW/FULL",
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
      "Status code Description :CANISTER",
      "Notification for CASH THRESHOLD LIMIT REACHED"
    ],
    "Printer": [
      "Receipt Printer Dispatch",
      "(2047, critical)",
      "Business Rule : Device Fault, Fault Descr : Cons prt head jam/go busy fail",
      "Business Rule : Device Fault, Fault Descr : Cons prt paper not load or jam",
      "Business Rule : Printer Paper Other Supply Problems, Fault Descr : Consumer printer fault",
      "Business Rule : Device Fault, Fault Descr : Consumer prt paper jam",
      "Status code Description :CONSUMER PRINTER DOWN",
      "Notification for RECEIPT PRINTER FAILURE"
    ],
    "Card Reader": [
      "Card reader Dispatch",
      "Business Rule : Out of Service, Fault Descr : Card reader fault",
      "Notification for EMV CARD READER FAILURE",
      "(2280, suspect)",
      "(2020, critical)",
      "(2281, critical)",
      "Status code Description :Mult. Card Reader/Writer Warns",
      "Status code Description :CARD READER/WRITER DOWN"
    ],
    "Cassette": [
      "status='0016'",
      "Cassettes of type",
      "(50, critical)"
    ],
    "EPP": [
      "Business Rule : Out of Service, Fault Descr : Encryptor down",
      "Notification for ENCRYPTION FAILURE for Device",
      "Category: Encryptor Dispatch"
    ],
    "Anti Skimming": [
      "Business Rule : Out of Service, Fault Descr : Card skimming fraud detected Hard Fault",
      "Category: Security Dispatch",
      "(2031, critical)",
      "Status code Description :POSSIBLE SKIMMING DEVICE DETECTED"
    ]
  };

  const titleEl = document.getElementById('txtTitle');
  const titleValue = (titleEl?.value || '').trim().toLowerCase();

  const ticketNotes = Array.from(document.querySelectorAll('.notice_info'));
  const parentNote = ticketNotes.at(-1)?.textContent.trim().toLowerCase() || '';

  let selectedLabel = null;
  for (const [label, keywords] of Object.entries(itemCategories)) {
    for (const keyword of keywords) {
      const k = keyword.toLowerCase();
      if (titleValue.includes(k) || parentNote.includes(k)) {
        console.log('found a keyword:', keyword);
        selectedLabel = label;
        break;
      }
    }
    if (selectedLabel) break;
  }

  console.log('Found a matching label:', selectedLabel);
  return selectedLabel;
}

function selectItem() {
  const selectItemDropDown = document.getElementById('ddlSubTypeItem');
  if (!selectItemDropDown) {
    console.log('Select Item dropdown not found');
    return;
  }
  if (selectItemDropDown.disabled) {
    console.log('EXITED FUNCTION: Select Item dropdown is disabled');
    return;
  }

  const label = getLabel();
  if (!label) {
    console.log('EXITED selectItem FUNCTION: label is null');
    return;
  }
  console.log("New label:", label);

  const matchedOption = Array.from(selectItemDropDown.options).find(
    opt => opt.textContent.trim().toLowerCase() === label.toLowerCase()
  );

  console.log("Matched Option:", matchedOption);
  if (!matchedOption) {
    console.log('No matching option found for label:', label);
    return;
  }

  selectItemDropDown.value = matchedOption.value;
  selectItemDropDown.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Dropdown set to: ${label} (value: ${matchedOption.value})`);
}

async function setStatusToInProgress() {
  const statusDropDown = document.getElementById('ddlStatus');
  if (!statusDropDown) {
    console.log("Status dropdown not found");
    return;
  }

  // Give the page a beat to populate options
  await wait(2);

  const inProgressOption = findOption(statusDropDown, 'in progress');
  if (!inProgressOption) {
    console.log('In Progress option not found');
    return;
  }
  statusDropDown.value = inProgressOption.value;
  // statusDropDown.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('Status changed to In Progress');

  console.log('Changing type and subtype dropdowns');
  autoChangeType();

  console.log("Changing Item type");
  selectItem();

  console.log('Saving ticket state');
  setTimeout(clickSaveButton, 1000);
}

// ===================================
// Assign button hook/unhook
// ===================================

// Stable handler (must not be anonymous so we can remove it later)
function assignClickHandler() {
  console.log('Assign to Me button clicked');
  setTimeout(setStatusToInProgress, 4500);
}

function hookAssignButton() {
  const assignButton = document.querySelector(".assigntome");
  if (assignButton && !assignButton.dataset.handlerAttached) {
    assignButton.addEventListener('click', assignClickHandler);
    assignButton.dataset.handlerAttached = 'true';
    console.log("Assign button listener attached");
  }
}

function unhookAssignButton() {
  const assignButton = document.querySelector(".assigntome");
  if (assignButton && assignButton.dataset.handlerAttached) {
    assignButton.removeEventListener('click', assignClickHandler);
    delete assignButton.dataset.handlerAttached;
    console.log('Assign button listener removed');
  }
}

// Scoped query inside the function so it never relies on outer scope.
function clickAssignButton() {
  const assignButton = document.querySelector(".assigntome");
  if (!assignButton) {
    console.log('Assign to Me button not found');
    return;
  }
  console.log('Assign to Me button clicked');
  assignButton.click();
  setTimeout(setStatusToInProgress, 4500);
}

function autoChangeType() {
  const boardDropDown   = document.getElementById('ddlBoard');
  const typeDropDown    = document.getElementById('ddlType');
  const subtypeDropDown = document.getElementById('ddlSubType');

  if (!boardDropDown || !typeDropDown || !subtypeDropDown) {
    console.log("Error finding one of dropdowns");
    return;
  }

  const ATMITMOption  = findOption(boardDropDown, 'atm/itm');
  const hardwareOption = findOption(typeDropDown, 'hardware');

  if (!ATMITMOption || !hardwareOption) {
    console.log('Dropdown options could not be found.');
    return;
  }

  if (boardDropDown.value === ATMITMOption.value) {
    typeDropDown.value = hardwareOption.value;
    typeDropDown.dispatchEvent(new Event('change', { bubbles: true }));

    const subtypeOption = findOption(subtypeDropDown, 'network notification');
    if (!subtypeOption) {
      console.log('Subtype option "network notification" could not be found');
      return;
    }
    subtypeDropDown.value = subtypeOption.value;
    // dispatch on the SELECT element, not the OPTION element:
    subtypeDropDown.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('Successfully updated ticket');
  }
}

// Backtick quick-assign: press ` to put In Progress, set types, select item, then assign/save
document.addEventListener('keydown', async (event) => {
  if (event.key === '`' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();

    // First thing: disable the normal Assign-to-Me click handler
    unhookAssignButton();

    const statusDropDown = document.getElementById('ddlStatus');
    if (!statusDropDown) {
      console.log("Status dropdown not found");
      return;
    }

    // await wait(2);
    const inProgressOption = findOption(statusDropDown, 'in progress');
    if (!inProgressOption) {
      console.log('In Progress option not found');
      return;
    }
    statusDropDown.value = inProgressOption.value;
    console.log('Status changed to In Progress (via backtick)');

    autoChangeType();
    selectItem();

    // You can save OR assign, depending on which flow you want:
    setTimeout(clickAssignButton, 1000);
    // or: setTimeout(clickSaveButton, 1000);
  }
});


// Override Ctrl+S to save
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    console.log('Ctrl+S was pressed, overriding to save ticket');
    clickSaveButton();
  }
});

// Ctrl+Q toggles/ submits add-note modal
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'q') {
    event.preventDefault();

    const modal = document.querySelector('#modal-addnote');
    const isVisible = modal && !modal.classList.contains('mfp-hide');

    if (isVisible) {
      console.log("Pressed ctrl+q when modal was visible!");
      // Page-provided functions:
      if (typeof SubmitNotes === 'function') SubmitNotes(true);
    } else {
      console.log("Pressed ctrl+q when modal was not visible!");
      if (typeof addSupportNotes === 'function') addSupportNotes(true);
    }
  }
});

// Hook assign button on load
window.addEventListener('load', hookAssignButton);

// Observe DOM mutations (modal appear, ticket resource emptiness)
const bodyObserver = new MutationObserver(() => {
  const modal = document.querySelector('#modal-addnote');
  if (modal && !modal.classList.contains('mfp-hide')) {
    console.log('Add notes modal is visible!');
    handleAddNotesCheckboxes();
  }

  // If you only want to auto-prepare flows when the ticket has no resource:
  const emptyTicket = checkResources();
  if (!emptyTicket) {
    // You can still hook listeners regardless:
    hookAssignButton();
    return;
  }

  hookAssignButton();
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
