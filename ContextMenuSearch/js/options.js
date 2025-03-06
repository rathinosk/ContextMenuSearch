/**
 * ContextMenuSearch Options Page
 *
 * This file contains the JavaScript code for the options page of the ContextMenuSearch extension.
 * It handles the initialization of the options page, saving and restoring options,
 * and adding new search engines.
 */

/**
 * log
 * Log a message to the console with a timestamp.
 * @param {string} txt - The message to log.
 */
function log(txt) {
    try {
        let now = new Date();
        console.log(now.toLocaleTimeString() + ": " + txt);
    } catch (e) {
        console.error("Error during logging: ", e);
    }
}

/**
 * initializeOptions
 * Initialize the options page.
 */
async function initializeOptions() {
    log("initializeOptions: Initializing options page.");
    showpage(1);
    await restoreOptions();
}

/**
 * Chrome storage change listener
 * Listen for changes in Chrome storage and restore options.
 */
chrome.storage.onChanged.addListener(async (changes) => {
    await restoreOptions();
});

/**
 * showToast
 * Show a toast message with the provided message.
 * @param {string} message - The message to display in the toast.
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
 * Save imported configuration after validating the JSON.
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
 * Save other options.
 */
async function saveOtherOptions() {
    log("saveOtherOptions: Saving other options.");
    const askBg = document.getElementById("ask_bg").checked;
    const askNext = document.getElementById("ask_next").checked;
    const askOptions = document.getElementById("ask_options").checked;

    await setItem("_askBg", askBg);
    await setItem("_askNext", askNext);
    await setItem("_askOptions", askOptions);

    showToast("Options Saved");
}

/**
 * saveOptions
 * Save all options.
 */
async function saveOptions() {
    log("saveOptions: Saving all options.");
    const optionsList = document.getElementById("options_list_ul");
    const maxIndex = optionsList.childElementCount;
    const allOptions = new Array(maxIndex);

    for (let i = 0; i < maxIndex; i++) {
        const curNum = optionsList.children[i].getAttribute('index');
        const itemNode = optionsList.children[i];

        const title = itemNode.querySelector(`#listItemName${curNum}`)?.value ?? "";
        const link = itemNode.querySelector(`#listItemLink${curNum}`)?.value ?? "";
        const isEnabled = itemNode.querySelector(`#listItemEnab${curNum}`)?.checked ?? false;

        allOptions[i] = ["-1", title, link, isEnabled];
    }

    const stringified = JSON.stringify(allOptions);
    await setItem("_allSearch", stringified);

    const askBg = document.getElementById("ask_bg").checked;
    const askNext = document.getElementById("ask_next").checked;

    await setItem("_askBg", askBg);
    await setItem("_askNext", askNext);

    showToast("Options Saved");
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
 * Restore options from storage and format the JSON for the "exporttext" box.
 */
async function restoreOptions() {
    
    log("restoreOptions: Restoring options from storage.");
    const optionsList = document.getElementById("options_list_ul");
    optionsList.innerHTML = "";

    const rawConfigJson = await getItem("_allSearch");
    //log(`restoreOptions: Raw JSON: ${rawConfigJson}`);

    try {
        // Attempt to format the JSON for better readability
        const formattedJson = compactJson(rawConfigJson);
        //log(`restoreOptions: Formatted JSON: ${formattedJson}`);

        // Display the formatted JSON in the export text box
        document.getElementById("exporttext").value = formattedJson;
    } catch (error) {
        // If formatting fails (e.g., invalid JSON), fall back to the original string
        log(`restoreOptions: Error formatting JSON: ${error}`);
        document.getElementById("exporttext").value = rawConfigJson;
    }

    const parsedArray = JSON.parse(rawConfigJson) || [];
    //log(`restoreOptions: Parsed JSON: ${parsedArray}`);

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

    if (isTrue(askBg)) document.getElementById("ask_bg").checked = true;
    if (isTrue(askNext)) document.getElementById("ask_next").checked = true;
    if (isTrue(askOptions)) document.getElementById("ask_options").checked = true;

    log("restoreOptions: Options restored from storage.");
}

/**
 * isTrue
 * Check if a value is true.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is true, otherwise false.
 */
function isTrue(value) {
    return value === true || value === "true";
}

/**
 * remove
 * Remove an item from the list.
 * @param {number} index - The index of the item to remove.
 */
function remove(index) {
    log(`remove: Removing item at index ${index}.`);
    const listOfSearchOptions = document.getElementById("options_list_ul");
    const listItemToRemove = document.getElementById(`listItem${index}`);
    listOfSearchOptions.removeChild(listItemToRemove);
}

/**
 * createListItem
 * Create a new list item.
 * @param {number} curNum - The current index number.
 * @param {boolean} isSeparator - Whether the item is a separator.
 * @returns {HTMLElement} - The new list item element.
 */
function createListItem(curNum, isSeparator) {
    const newListItem = document.createElement('li');
    newListItem.setAttribute('index', curNum);
    newListItem.setAttribute('id', `listItem${curNum}`);

    const innerHTML = `
        <div align='center'>
            <div class='dragIcon' style='width:20px;'></div>
            ${isSeparator ? `
                <hr style='width:138px;'></hr>
                <hr style='width:458px;'></hr>
            ` : `
                <input type='text' class='listItemName' id='listItemName${curNum}' size='20' maxlength='30'>
                <input type='text' class='listItemLink' id='listItemLink${curNum}' size='80' maxlength='5000'>
            `}
            <input type='checkbox' class='checkStyle' id='listItemEnab${curNum}' style='width:40px;'>
            <button index='${curNum}' class='removeButtonStyle' id='listItemRemoveButton${curNum}' style='width:40px;'>X</button>
        </div>
    `;
    newListItem.innerHTML = innerHTML;

    // Add event listener to the remove button
    newListItem.querySelector(`#listItemRemoveButton${curNum}`).addEventListener('click', function(event) {
        const index = event.target.getAttribute('index');
        remove(index);
    });

    return newListItem;
}

/**
 * addItem
 * Add a new item to the list.
 * @param {Array} item - The item to add.
 */
function addItem(item) {
    log("addItem: Adding a new item to the list.");
    const optionsList = document.getElementById('options_list_ul');
    const curNum = optionsList.childElementCount;
    const newListItem = createListItem(curNum, false);
    optionsList.appendChild(newListItem);

    // Set data to the new list item using querySelector
    newListItem.querySelector(`#listItemName${curNum}`).value = item[1];
    newListItem.querySelector(`#listItemLink${curNum}`).value = item[2];
    if (item[3]) newListItem.querySelector(`#listItemEnab${curNum}`).checked = item[3];
}

/**
 * addSeparator
 * Add a separator to the list.
 * @param {Array} item - The item to add as a separator.
 */
function addSeparator(item) {
    log("addSeparator: Adding a separator to the list.");
    const optionsList = document.getElementById('options_list_ul');
    const curNum = optionsList.childElementCount;
    const newListItem = createListItem(curNum, true);
    optionsList.appendChild(newListItem);

    item = item || ["-1", "", "", true];

    // Set data to the new list item using querySelector
    if (item[3]) newListItem.querySelector(`#listItemEnab${curNum}`).checked = item[3];
}

/**
 * addOption
 * Add a new option manually.
 */
async function addOption() {
    log("addOption: Adding a new option manually.");
    const newName = document.getElementById("newname").value;
    const newLink = document.getElementById("newlink").value;

    const stringified = await getItem("_allSearch");
    const parsedArray = JSON.parse(stringified);

    const length = (parsedArray?.length ?? 0);
    const newOptions = new Array(length + 1);

    for (let i = 0; i < length; i++) {
        newOptions[i] = parsedArray[i].slice(0);
    }

    newOptions[length] = ["-1", newName, newLink, true];

    const newString = JSON.stringify(newOptions);
    await setItem("_allSearch", newString);

    document.getElementById("newname").value = "";
    document.getElementById("newlink").value = "";
    showToast("New Item Added");
    setTimeout(() => { showpage(2); }, 1250);
}

/**
 * resetDefault
 * Reset to default options.
 */
function resetDefault() {
    
    const DEFAULT_CONFIG = '[["-1","YouTube","http://www.youtube.com/results?search_query=TESTSEARCH",true],["-1","Bing","http://www.bing.com/search?q=TESTSEARCH",true],["-1","Bing Images","http://www.bing.com/images/search?q=TESTSEARCH",true],["-1","IMDB","http://www.imdb.com/find?s=all&q=TESTSEARCH",true],["-1","Wikipedia","http://en.wikipedia.org/wiki/Special:Search?search=TESTSEARCH&go=Go",true],["-1","Yahoo!","http://search.yahoo.com/search?vc=&p=TESTSEARCH",true],["-1","Maps","https://www.google.com/maps/search/TESTSEARCH",true]]';

    log("resetDefault: Resetting to default options.");

    // clearChromeStorage();
    
    chrome.storage.local.set({ _allSearch: DEFAULT_CONFIG }, () => {
        if (chrome.runtime.lastError) {
            log(`resetDefault: Error setting default configuration: ${chrome.runtime.lastError}`);
            showToast('Error resetting default configuration.');
        } else {
            log('resetDefault: Default configuration set.');
            showToast('Options reset to default.');
            restoreOptions(); // Reload options to reflect the reset
        }
    });

}

/**
 * addFromList
 * Add options from a predefined list.
 */
async function addFromList() {
    log("addFromList: Adding options from a predefined list.");
    try {
        const numOptions = document.getElementById("numoptions").value;

        for (let j = 1; j <= numOptions; j++) {
            const checkbox = document.getElementById(`s${j}`);
            if (checkbox && checkbox.checked) {
                const newName = document.getElementById(`names${j}`).value;
                const newLink = document.getElementById(`links${j}`).value;

                const stringified = await getItem("_allSearch");
                const parsedArray = JSON.parse(stringified);

                const length = (parsedArray?.length ?? 0);
                const newOptions = new Array(length + 1);

                for (let i = 0; i < length; i++) {
                    newOptions[i] = parsedArray[i].slice(0);
                }

                newOptions[length] = ["-1", newName, newLink, true];

                const newString = JSON.stringify(newOptions);
                await setItem("_allSearch", newString);
                document.getElementById(`s${j}`).checked = false;
            }
        }

        showToast("New Items Added");
        setTimeout(() => { showpage(2); }, 1250);
    } catch (error) {
        log(`addFromList: Error adding items from list: ${error}`);
        showToast('An error occurred while adding search engines.');
    }
}

/**
 * showpage
 * Show the specified page.
 * @param {number} page - The page number to show.
 */
function showpage(page) {
    log(`showpage: Showing page ${page}.`);
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`page${i}`).style.display = (i === page) ? "block" : "none";
    }
}

/**
 * Document ready function
 * Initialize the options page and set up event listeners.
 */
$(document).ready(function() {
    generateSearchEngineList();
    initializeOptions();
    $(function() {
        $("#options_list_ul").sortable({ opacity: 0.3, cursor: 'move', update: function() {
            log("$(document).ready: Reordered options list.");
        }});

        $("#showpage_1").click(() => { showpage(1); });
        $("#showpage_2").click(() => { showpage(2); });
        $("#showpage_3").click(() => { showpage(3); });
        $("#showpage_4").click(() => { showpage(4); });
        $("#add_option").click(() => { addOption(); });
        $("#add_from_list").click(() => { addFromList(); });
        $("#save_options").click(() => { saveOptions(); });
        $("#add_separator").click(() => { addSeparator(); });
        $("#resetdefault").click(() => { resetDefault(); });
        $("#save_otheroptions").click(() => { saveOtherOptions(); });
        $("#save_import").click(() => { saveImport(); });
    });
});
