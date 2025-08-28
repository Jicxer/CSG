(() => {
  "use strict";

  // Click the Save button
  function clickSaveButton() {
    const btn = document.querySelector(".EditTicket");
    if (!btn) {
      console.log("Save button not found");
      return;
    }
    btn.click();
    console.log("Clicked save button");
  }

  // Find an option in a dropdown by label text
  function findOption(dropdown, targetLabel) {
    return Array.from(dropdown.options).find(opt =>
      opt.textContent.trim().toLowerCase() === targetLabel.toLowerCase()
    );
  }

  // Handle add-notes checkboxes
  function handleAddNotesCheckboxes() {
    const checkboxIDs = ["chkContact", "chkResources", "chkCC"];
    checkboxIDs.forEach(id => {
      const box = document.getElementById(id);
      if (!box) {
        console.log(id, "not found");
        return;
      }
      if (box.checked) {
        console.log(id, "is checked, unchecking now...");
        box.click();
      } else {
        console.log(id, "already unchecked");
      }
    });
  }

  // Close as Lost Comms
  async function closeasLCMS() {
    const boardDropdown = document.getElementById("ddlBoard");
    const statusDropdown = document.getElementById("ddlStatus");
    const typeDropdown = document.getElementById("ddlType");
    const subTypeDropdown = document.getElementById("ddlSubType");
    const subTypeItemDropdown = document.getElementById("ddlSubTypeItem");

    if (!boardDropdown || !statusDropdown || !subTypeDropdown || !subTypeItemDropdown) {
      console.log("One of dropdowns not found");
      return;
    }

    const atmSelected = findOption(boardDropdown, "atm/itm")?.selected;
    if (!atmSelected) {
      console.log("atm/itm was not selected");
      return;
    }

    await addNotes();

    console.log("Closing the ticket to lost comms");

    // 1) Set Type = Hardware and wait for SubType to contain our target
    setSelectByLabel(typeDropdown, "hardware");
    await waitForOption(subTypeDropdown, "network notification", 8000);

    // 2) Now set SubType = Network Notification and wait for SubTypeItem to populate
    setSelectByLabel(subTypeDropdown, "network notification");
    await waitForOption(subTypeItemDropdown, "lost comms", 8000);

    // 3) Only after the above are confirmed, set Status and SubTypeItem
    setSelectByLabel(statusDropdown, "fixed");
    setSelectByLabel(subTypeItemDropdown, "lost comms");

    clickSaveButton();
  }

  // Helper: set a <select> by visible label & fire change
  function setSelectByLabel(selectEl, label) {
    if (!selectEl) return;
    const opt = findOption(selectEl, label);
    if (!opt) {
      console.log(`Option "${label}" not found for`, selectEl.id || selectEl.name);
      return;
    }
    selectEl.value = opt.value;
    // Fire both 'input' and 'change' to satisfy different frameworks
    selectEl.dispatchEvent(new Event('input', { bubbles: true }));
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Helper: wait until a specific option (by label) exists on a select
  function waitForOption(selectEl, label, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      if (!selectEl) {
        reject(new Error('waitForOption: selectEl is null'));
        return;
      }

      // Immediate check
      if (findOption(selectEl, label)) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (findOption(selectEl, label)) {
          observer.disconnect();
          resolve();
        }
      });

      // Observe the select's subtree because <option> nodes are children
      observer.observe(selectEl, { childList: true, subtree: true });

      // Fallback timeout
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for option "${label}" on ${selectEl.id || selectEl.name}`));
      }, timeoutMs);

      // Also listen for 'change' events in case framework replaces the node
      const onChange = () => {
        if (findOption(selectEl, label)) {
          cleanup();
          resolve();
        }
      };

      selectEl.addEventListener('change', onChange, { once: true });

      function cleanup() {
        clearTimeout(timer);
        observer.disconnect();
        selectEl.removeEventListener('change', onChange);
      }
    });
  }

  // Wait helper
  function wait(seconds) {
    return new Promise(resolve => {
      setTimeout(resolve, 1000 * seconds);
    });
  }

  // Add notes
  async function addNotes() {
    addSupportNotes(true);
    console.log("Waiting 1 second...");
    await wait(1);
    console.log("Finished waiting");

    console.log("Changing the value for the notes to 'Terminal is up and in service'");
    const noteBox = document.getElementById("txtNoteDescription");
    if (!noteBox) {
      console.log("Textbox not found");
      return;
    }
    noteBox.value = "Terminal is up and in service";
    SubmitNotes(true);
  }

  // Observer for modal popup
  const bodyObserver = new MutationObserver(() => {
    const modal = document.querySelector("#modal-addnote");
    if (modal && !modal.classList.contains("mfp-hide")) {
      console.log("Add notes modal is visible!");
      handleAddNotesCheckboxes();
    }
  });

  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // Run script
  closeasLCMS();
})();
