/**
 * ContextMenuSearch Options Page
 *
 * This file contains the JavaScript code for the options page of the ContextMenuSearch extension.
 * It handles the initialization of the options page, saving and restoring options,
 * and adding new search engines.
 */

/**
 * initializeOptions
 * Initializes the options page by restoring saved options, saving them to ensure context menu initialization,
 * updating the storage type display, and updating the version number.
 * @returns {Promise<void>} - A promise that resolves after initializing the options page.
 */
async function initializeOptions() {
    log("initializeOptions: Initializing options page.");
    showpage(1);
    await restoreOptions();
    await saveOptions(); // Save options to ensure context menu is initialized - possible fix for Issue #4
    await updateStorageTypeDisplay();
    await updateVersionNumber();
}

/**
 * Chrome storage change listener
 * Listens for changes in Chrome storage and restores options when changes occur.
 * @param {object} changes - An object containing the changes in Chrome storage.
 * @returns {Promise<void>} - A promise that resolves after restoring the options.
 */
chrome.storage.onChanged.addListener(async (changes) => {
    await restoreOptions();
});

/**
 * showToast
 * Displays a toast message on the screen for a short duration.
 * @param {string} message - The message to be displayed in the toast.
 * @returns {void}
 */
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.className = "show";
    toast.innerHTML = message;
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

/**
 * validateSearchEngineJson
 * Validates the structure of the search engine JSON to ensure it matches the expected format.
 * @param {string} jsonString - The JSON string to validate.
 * @returns {boolean} - True if the JSON is valid, false otherwise.
 */
function validateSearchEngineJson(jsonString) {
    try {
        const parsedArray = JSON.parse(jsonString);

        if (!Array.isArray(parsedArray)) {
            log("validateSearchEngineJson: JSON is not an array.");
            return false;
        }

        for (const item of parsedArray) {
            if (!Array.isArray(item)) {
                log("validateSearchEngineJson: Item is not an array.");
                return false;
            }

            if (item.length !== 4) {
                log("validateSearchEngineJson: Item length is not 4.");
                return false;
            }

            if (typeof item[0] !== 'string' || typeof item[1] !== 'string' || typeof item[2] !== 'string' || typeof item[3] !== 'boolean') {
                log("validateSearchEngineJson: Item types are incorrect.");
                return false;
            }
        }

        log("validateSearchEngineJson: JSON is valid.");
        return true;
    } catch (error) {
        log(`validateSearchEngineJson: JSON parsing error: ${error}`);
        return false;
    }
}

/**
 * saveImport
 * Saves imported configuration after validating the JSON.
 * @returns {Promise<void>}
 */
async function saveImport() {
    log("saveImport: Saving imported configuration.");
    const exportText = document.getElementById("exporttext").value;

    if (!validateSearchEngineJson(exportText)) {
        showToast("Invalid Search Engine JSON Format");
        return;
    }

    try {
        await setItem("_allSearch", exportText);
        showToast("New Configuration Imported");
    } catch (error) {
        log(`saveImport: Invalid JSON: ${error}`);
        showToast("Invalid JSON Configuration");
    }
}

/**
 * saveOtherOptions
 * Saves miscellaneous options such as background asking, next page asking, options asking, and debug mode.
 * @returns {Promise<void>}
 */
async function saveOtherOptions() {
    log("saveOtherOptions: Saving other options.");
    const askBg = document.getElementById("ask_bg").checked;
    const askNext = document.getElementById("ask_next").checked;
    const askOptions = document.getElementById("ask_options").checked;
    const askDebug = document.getElementById("ask_debug").checked;

    try {
        await setItem("_askBg", askBg);
        await setItem("_askNext", askNext);
        await setItem("_askOptions", askOptions);
        await setItem("_askDebug", askDebug);
        showToast("Options Saved");
    } catch (error) {
        log(`saveOtherOptions: Error saving options: ${error}`);
        showToast("Error saving options.");
    }
}

/**
 * saveOptions
 * Saves all options, including search engine configurations and other settings.
 * @returns {Promise<void>}
 */
async function saveOptions() {
    log("saveOptions: Saving all options.");
    try {
        const optionsList = document.getElementById("options_list_ul");
        const maxIndex = optionsList.childElementCount;
        const allOptions = [];

        for (let i = 0; i < maxIndex; i++) {
            const curNum = optionsList.children[i].getAttribute('index');
            const itemNode = optionsList.children[i];

            const title = itemNode.querySelector(`#listItemName${curNum}`)?.value ?? "";
            const link = itemNode.querySelector(`#listItemLink${curNum}`)?.value ?? "";
            const isEnabled = itemNode.querySelector(`#listItemEnab${curNum}`)?.checked ?? false;

            allOptions.push(["-1", title, link, isEnabled]);
        }

        const stringified = JSON.stringify(allOptions);
        await setItem("_allSearch", stringified);

        const askBg = document.getElementById("ask_bg").checked;
        const askNext = document.getElementById("ask_next").checked;
        const askOptions = document.getElementById("ask_options").checked;
        const askDebug = document.getElementById("ask_debug").checked;

        await setItem("_askBg", askBg);
        await setItem("_askNext", askNext);
        await setItem("_askOptions", askOptions);
        await setItem("_askDebug", askDebug);

        showToast("Options Saved");
    } catch (error) {
        log(`saveOptions: Error saving options: ${error}`);
        showToast("Error saving options.");
    }
}

/**
 * compactJson
 * Takes a raw JSON object, and produces a collapsed version of it.
 * This is useful for displaying JSON objects with many nested levels in a more readable format.
 * @param {string} json - The JSON object to collapse.
 * @returns {string} - The collapsed JSON object as a string.
 */
function compactJson(json) {
    try {
        const parsedJson = JSON.parse(json);
        if (!Array.isArray(parsedJson)) {
            throw new Error("Invalid JSON format: Expected an array.");
        }

        const formattedJson = parsedJson.map(item => `    ${JSON.stringify(item)}`).join(',\n');
        return `[\n${formattedJson}\n]`;
    } catch (error) {
        log(`compactJson: Error processing JSON: ${error}`);
        return json; // Return the original JSON string if an error occurs
    }
}

/**
 * restoreOptions
 * Restores options from storage and populates the options page with these values.
 * Formats the JSON for the "exporttext" box.
 * @returns {Promise<void>}
 */
async function restoreOptions() {
    log("restoreOptions: Restoring options from storage.");
    const optionsList = document.getElementById("options_list_ul");
    optionsList.innerHTML = "";

    try {
        const rawConfigJson = await getItem("_allSearch");
        const formattedJson = compactJson(rawConfigJson);
        document.getElementById("exporttext").value = formattedJson;

        let parsedArray = [];
        try {
            parsedArray = JSON.parse(rawConfigJson) || [];
        } catch (parseError) {
            log(`restoreOptions: Error parsing JSON: ${parseError}`);
            showToast("Error parsing stored JSON. Please check your configuration.");
        }

        for (const item of parsedArray) {
            if (item && item.length === 4 && item[1] !== "" && item[2] !== "") {
                addItem(item);
            } else {
                addSeparator(item);
            }
        }

        const askBg = await getItem("_askBg");
        const askNext = await getItem("_askNext");
        const askOptions = await getItem("_askOptions");
        const askDebug = await getItem("_askDebug");

        document.getElementById("ask_bg").checked = isTrue(askBg);
        document.getElementById("ask_next").checked = isTrue(askNext);
        document.getElementById("ask_options").checked = isTrue(askOptions);
        document.getElementById("ask_debug").checked = isTrue(askDebug);

        log("restoreOptions: Options restored from storage.");

    } catch (error) {
        log(`restoreOptions: Error restoring options: ${error}`);
        showToast("Error restoring options. Please check the console for details.");
    }
}

/**
 * isTrue
 * Checks if a value is considered true.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is true or the string "true", otherwise false.
 */
function isTrue(value) {
    return value === true || value === "true";
}

/**
 * remove
 * Removes an item from the list based on its index.
 * @param {number} index - The index of the item to remove.
 * @returns {void}
 */
function remove(index) {
    log(`remove: Removing item at index ${index}.`);
    try {
        const listOfSearchOptions = document.getElementById("options_list_ul");
        const listItemToRemove = document.getElementById(`listItem${index}`);
        listOfSearchOptions.removeChild(listItemToRemove);
        showToast("Item Removed");
    } catch (error) {
        log(`remove: Error removing item: ${error}`);
        showToast("Error removing item. Please check the console for details.");
    }
}

/**
 * createListItem
 * Creates a new list item element for the options list.
 * @param {number} curNum - The current index number for the list item.
 * @param {boolean} isSeparator - Determines if the list item is a separator or a regular item.
 * @returns {HTMLElement} - The newly created list item element.
 */
function createListItem(curNum, isSeparator) {
    const newListItem = document.createElement('li');
    newListItem.setAttribute('index', curNum);
    newListItem.setAttribute('id', `listItem${curNum}`);

    let innerHTML;
    if (isSeparator) {
        innerHTML = `
            <div align='center'>
                <div class='dragIcon' style='width:20px;'></div>
                <hr style='width:138px;'></hr>
                <hr style='width:458px;'></hr>
                <input type='checkbox' class='checkStyle' id='listItemEnab${curNum}' style='width:40px;'>
                <button index='${curNum}' class='removeButtonStyle' id='listItemRemoveButton${curNum}' style='width:40px;'>X</button>
            </div>
        `;
    } else {
        innerHTML = `
            <div align='center'>
                <div class='dragIcon' style='width:20px;'></div>
                <input type='text' class='listItemName' id='listItemName${curNum}' size='20' maxlength='30'>
                <input type='text' class='listItemLink' id='listItemLink${curNum}' size='80' maxlength='5000'>
                <input type='checkbox' class='checkStyle' id='listItemEnab${curNum}' style='width:40px;'>
                <button index='${curNum}' class='removeButtonStyle' id='listItemRemoveButton${curNum}' style='width:40px;'>X</button>
            </div>
        `;
    }

    newListItem.innerHTML = innerHTML;

    // Add event listener to the remove button
    const removeButton = newListItem.querySelector(`#listItemRemoveButton${curNum}`);
    if (removeButton) {
        removeButton.addEventListener('click', function(event) {
            const index = event.target.getAttribute('index');
            remove(index);
        });
    }

    return newListItem;
}

/**
 * addItem
 * Adds a new item to the options list.
 * @param {Array} item - An array containing the item's data: ["-1", title, link, isEnabled].
 * @returns {void}
 */
function addItem(item) {
    log("addItem: Adding a new item to the list.");
    try {
        const optionsList = document.getElementById('options_list_ul');
        const curNum = optionsList.childElementCount;
        const newListItem = createListItem(curNum, false);
        optionsList.appendChild(newListItem);

        newListItem.querySelector(`#listItemName${curNum}`).value = item[1];
        newListItem.querySelector(`#listItemLink${curNum}`).value = item[2];
        newListItem.querySelector(`#listItemEnab${curNum}`).checked = !!item[3]; // Ensure boolean value
    } catch (error) {
        log(`addItem: Error adding item: ${error}`);
        showToast("Error adding item. Please check the console for details.");
    }
}

/**
 * addSeparator
 * Adds a separator to the options list.
 * @param {Array} item - An array containing the separator's data, can be null or undefined.
 * @returns {void}
 */
function addSeparator(item) {
    log("addSeparator: Adding a separator to the list.");
    try {
        const optionsList = document.getElementById('options_list_ul');
        const curNum = optionsList.childElementCount;
        const newListItem = createListItem(curNum, true);
        optionsList.appendChild(newListItem);

        // Use default values if item is null or undefined
        const isEnabled = item ? !!item[3] : true;
        newListItem.querySelector(`#listItemEnab${curNum}`).checked = isEnabled;
    } catch (error) {
        log(`addSeparator: Error adding separator: ${error}`);
        showToast("Error adding separator. Please check the console for details.");
    }
}

/**
 * addCustom
 * Adds a new custom search engine to the list based on user input.
 * @returns {Promise<void>}
 */
async function addCustom() {
    log("addOption: Adding a new option manually.");
    try {
        const newName = document.getElementById("newname").value;
        const newLink = document.getElementById("newlink").value;

        if (!newName || !newLink) {
            showToast("Please enter both a name and a link.");
            return;
        }

        const stringified = await getItem("_allSearch");
        const parsedArray = JSON.parse(stringified) || [];

        const newOptions = [...parsedArray, ["-1", newName, newLink, true]];

        const newString = JSON.stringify(newOptions);
        await setItem("_allSearch", newString);

        document.getElementById("newname").value = "";
        document.getElementById("newlink").value = "";
        showToast("New Item Added");
        setTimeout(() => { showpage(2); }, 1250);
    } catch (error) {
        log(`addCustom: Error adding custom option: ${error}`);
        showToast("Error adding custom option. Please check the console for details.");
    }
}

/**
 * resetDefault
 * Resets all options to their default values.
 * @returns {void}
 */
function resetDefault() {
    log("resetDefault: Resetting to default options.");

    if (confirm("Are you sure you want to reset all options to default? This action cannot be undone.")) {
        setItem("_allSearch", DEFAULT_CONFIG)
            .then(() => {
                log('resetDefault: Default configuration set.');
                showToast('Options reset to default.');
                restoreOptions(); // Reload options to reflect the reset
            })
            .catch(error => {
                log(`resetDefault: Error setting default configuration: ${error}`);
                showToast('Error resetting default configuration.');
            });
    } else {
        log("resetDefault: Reset cancelled by user.");
        showToast("Reset cancelled.");
    }
}

/**
 * addBuiltIn
 * Adds built-in search engine options to the list based on user selection.
 * @returns {Promise<void>}
 */
async function addBuiltIn() {
    log("addBuiltIn: Adding options from a predefined list.");
    try {
        const numOptions = document.getElementById("numoptions").value;

        for (let j = 1; j <= numOptions; j++) {
            const checkbox = document.getElementById(`s${j}`);
            if (checkbox && checkbox.checked) {
                const newName = document.getElementById(`names${j}`).value;
                const newLink = document.getElementById(`links${j}`).value;

                if (!newName || !newLink) {
                    log(`addBuiltIn: Missing name or link for option ${j}.`);
                    showToast(`Missing name or link for option ${j}.`);
                    continue;
                }

                const stringified = await getItem("_allSearch");
                const parsedArray = JSON.parse(stringified) || [];

                const newOptions = [...parsedArray, ["-1", newName, newLink, true]];

                const newString = JSON.stringify(newOptions);
                await setItem("_allSearch", newString);
                checkbox.checked = false;
            }
        }

        showToast("New Items Added");
        setTimeout(() => { showpage(2); }, 1250);
    } catch (error) {
        log(`addBuiltIn: Error adding items from list: ${error}`);
        showToast('An error occurred while adding search engines.');
    }
}

/**
 * showpage
 * Shows a specific page by setting its display style to "block" and hiding the others.
 * @param {number} page - The page number to show (1-4).
 * @returns {void}
 */
function showpage(page) {
    log(`showpage: Showing page ${page}.`);
    for (let i = 1; i <= 4; i++) {
        const pageElement = document.getElementById(`page${i}`);
        if (pageElement) {
            pageElement.style.display = (i === page) ? "block" : "none";
        } else {
            log(`showpage: Page element with ID 'page${i}' not found.`);
        }
    }
}

/**
 * updateStorageTypeDisplay
 * Updates the storage type display on the About page.
 * @returns {Promise<void>}
 */
async function updateStorageTypeDisplay() {
    log("updateStorageTypeDisplay: Updating storage type display.");
    const storageTypeElement = document.getElementById("storage_type");
    try {
        const storageArea = getStorageArea();
        const storageType = storageArea === chrome.storage.sync ? "Chrome Sync" : "Local";
        storageTypeElement.textContent = `Storage Type: ${storageType}`;
    } catch (error) {
        log(`updateStorageTypeDisplay: Error determining storage type: ${error}`);
        storageTypeElement.textContent = "Storage Type: Error determining storage type";
    }
}

/**
 * updateVersionNumber
 * Updates the version number on the About page to match the manifest.json version.
 * @returns {Promise<void>}
 */
async function updateVersionNumber() {
    log("updateVersionNumber: Updating version number display.");
    const versionElement = document.getElementById("extension_version");
    try {
        const manifestData = chrome.runtime.getManifest();
        const version = manifestData.version;
        versionElement.textContent = `Version ${version}`;
    } catch (error) {
        log(`updateVersionNumber: Error getting manifest info: ${error}`);
        versionElement.textContent = "Version: Error determining version";
    }
}

/**
 * Document ready function
 * Initializes the options page and sets up event listeners after the document is fully loaded.
 * @returns {void}
 */
$(document).ready(function() {
    generateSearchEngineList();
    initializeStorage().then(() => {
        initializeOptions();
        updateStorageTypeDisplay();
        updateVersionNumber();
    });

    $(function() {
        $("#options_list_ul").sortable({
            opacity: 0.3,
            cursor: 'move',
            update: function() {
                log("$(document).ready: Reordered options list.");
            }
        });

        // Page Navigation
        $("#showpage_1").click(() => { showpage(1); });
        $("#showpage_2").click(() => { showpage(2); });
        $("#showpage_3").click(() => { showpage(3); });
        $("#showpage_4").click(() => { showpage(4); });

        // Search Engines Page
        $("#add_custom").click(() => { addCustom(); });
        $("#add_built_in").click(() => { addBuiltIn(); });

        // Manage Menu Page
        $("#add_separator").click(() => { addSeparator(); });
        $("#save_menu_config").click(() => { saveOptions(); });

        // Other Options Page
        $("#save_menu_options").click(() => { saveOtherOptions(); });
        $("#save_import").click(() => { saveImport(); });
        $("#reset_default").click(() => { resetDefault(); });
    });
});
