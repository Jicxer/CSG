// ==UserScript==
// @name         SAN Ticket Workflow Efficiency
// @namespace    Violentmonkey Scripts
// @match        https://cc.cooksolutionsgroup.com/Support/Support/EditTicket*
// @grant        none
// @version      1.0
// @author       -
// @description  SAN 8/2/2025, 8:40:01 PM
// ==/UserScript==

"use strict";

//=======================================================
// Start: Click save button helper function
//=======================================================
function clickSaveButton() {
    const saveButton = document.querySelector('.EditTicket');
    saveButton.click();
    console.log('Clicked save button');
}

/**
 * Helper: Finds an option in a dropdown by label text.
 * @param {HTMLSelectElement} dropdown - The dropdown element to search in
 * @param {string} targetLabel - The visible text (case-insensitive, trimmed)
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
 */
function handleAddNotesCheckboxes() {
    const checkboxIDs = ['chkContact', 'chkResources', 'chkCC'];

    checkboxIDs.forEach(id => {
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


async function closeasLCMS() {
    const boardDropdown = document.getElementById('ddlBoard');
    const statusDropDown = document.getElementById('ddlStatus');
    const itemDropDown = document.getElementById('ddlSubTypeItem');

    if (!boardDropdown || !statusDropDown || !itemDropDown) {
        console.log("One of dropdowns not found");
        return;
    }

    const atmSelected = findOption(boardDropdown, 'atm/itm')?.selected;

    if (!atmSelected) {
        console.log('atm/itm was not selected');
        return;
    }

    await addNotes();

    console.log('Closing the ticket to lost comms');
    statusDropDown.value = findOption(statusDropDown, 'fixed')?.value;
    itemDropDown.value = findOption(itemDropDown, 'lost comms')?.value;
    clickSaveButton();
}

// Wait helper
function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

async function addNotes() {
    addSupportNotes(true);
    console.log('Waiting 1 second...');
    await wait(1);
    console.log('Finished waiting');

    console.log('Changing the value for the notes to "no fraud found"');
    const addNotestxt = document.getElementById('txtNoteDescription');
    if (!addNotestxt) {
        console.log('Textbox not found');
        return;
    }
    addNotestxt.value = "Terminal is up and in service";
    SubmitNotes(true);
}

// Observe DOM for Add Notes modal visibility
const bodyObserver = new MutationObserver(() => {
    const modal = document.querySelector('#modal-addnote');
    if (!modal.classList.contains('mfp-hide')) {
        console.log('Add notes modal is visible!');
        handleAddNotesCheckboxes();
    }
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
