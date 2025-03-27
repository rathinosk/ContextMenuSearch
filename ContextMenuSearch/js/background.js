importScripts('encoding.min.js', 'chromeSTorage.js');

/**
 * initialize
 * Initializes the extension by setting up storage and loading context menu items.
 * @returns {Promise<void>}
 */
async function initialize() {
    try {
        await initializeStorage();
        await loadContextMenuItems();
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(initialize);

// Listener for changes in chrome.storage
chrome.storage.onChanged.addListener(loadContextMenuItems);

// Listener for when the browser starts
chrome.runtime.onStartup.addListener(async () => {
    log("Browser startup detected.");
    await initialize();
});

// Listener for when a tab is activated
chrome.tabs.onActivated.addListener(async () => {
    log("Tab activated.");
    await initialize();
});

// Listener for when a new tab is created
chrome.tabs.onCreated.addListener(async () => {
    log("Tab created.");
    await initialize();
});

// Listener for when the browser window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        log("Window focus changed.");
        await initialize();
    }
});

// Flag to prevent overlapping calls to loadContextMenuItems
let isExecutingLoadContextMenuItems = false;
let loadContextMenuItemsQueue = [];

/**
 * loadContextMenuItems
 * Loads context menu items based on data stored in storage.
 * Uses a queue to prevent overlapping calls.
 * @returns {Promise<void>}
 */
async function loadContextMenuItems() {
    if (isExecutingLoadContextMenuItems) {
        return new Promise((resolve, reject) => {
            loadContextMenuItemsQueue.push({ resolve, reject });
        });
    }

    isExecutingLoadContextMenuItems = true;

    try {
        log("loadContextMenuItems called");

        // Clear existing context menu items
        await clearContextMenuItems();

        // Retrieve all necessary data from storage
        const allData = await getAllSearchData();

        // Process and create context menu items
        await processContextMenuItems(allData);

        // Add options item if enabled
        await addOptionsContextMenuItem(allData._askOptions);

    } catch (error) {
        console.error('Error in loadContextMenuItems:', error);
    } finally {
        isExecutingLoadContextMenuItems = false;
        if (loadContextMenuItemsQueue.length > 0) {
            const nextCall = loadContextMenuItemsQueue.shift();
            loadContextMenuItems().then(nextCall.resolve).catch(nextCall.reject);
        }
    }
}

/**
 * clearContextMenuItems
 * Clears all existing context menu items.
 * @returns {Promise<void>}
 */
async function clearContextMenuItems() {
    return new Promise((resolve) => {
        try {
            chrome.contextMenus.removeAll(() => {
                log('All context menu items have been removed.');
                resolve();
            });
        } catch (error) {
            console.error("Error removing context menus: ", error);
            resolve(); // Resolve anyway to continue execution
        }
    });
}

/**
 * getAllSearchData
 * Retrieves all search-related data from storage.
 * @returns {Promise<Object>} - An object containing _allSearch and _askOptions.
 */
async function getAllSearchData() {
    const allData = {};
    allData._allSearch = await getItem("_allSearch");
    allData._askOptions = await getItem("_askOptions");

    log("loadContextMenuItems data = ", allData);

    if (!allData._allSearch) {
        throw new Error('_allSearch is undefined');
    }
    return allData;
}

/**
 * processContextMenuItems
 * Processes the _allSearch data to create context menu items.
 * @param {Object} allData - The data object containing _allSearch.
 * @returns {Promise<void>}
 */
async function processContextMenuItems(allData) {
    try {
        const _all = JSON.parse(allData._allSearch);
        const numEntries = _all?.length ?? 0;

        log(_all);
        log(numEntries);

        for (let i = 0; i < numEntries; i++) {
            if (_all[i][3]) {
                try {
                    if (_all[i][1] === "" && _all[i][2] === "") {
                        // Show separator
                        chrome.contextMenus.create({ id: i.toString(), type: "separator", contexts: ["selection"] });
                    } else {
                        _all[i][0] = chrome.contextMenus.create({ id: _all[i][2], title: _all[i][1], contexts: ["selection"] });
                    }
                } catch (error) {
                    console.error("Error creating context menu item: ", i, error);
                }
            } else {
                _all[i][0] = -1;
            }
        }
    } catch (jsonError) {
        console.error("Error parsing or processing _allSearch data:", jsonError);
    }
}

/**
 * addOptionsContextMenuItem
 * Adds the options context menu item if the askOptions setting is enabled.
 * @param {string} askOptions - The _askOptions value from storage.
 * @returns {Promise<void>}
 */
async function addOptionsContextMenuItem(askOptions) {
    if (looseCompareBooleanOrStrings(askOptions, true)) {
        try {
            // Show separator
            chrome.contextMenus.create({ id: "separator", type: "separator", contexts: ["selection"] });
            // Show the item for linking to extension options
            chrome.contextMenus.create({ id: "options.html", title: "Options", contexts: ["selection"] });
        } catch (error) {
            console.error("Error creating options context menu items: ", error);
        }
    }
}

/**
 * detectEncoding
 * Detects the encoding of a given text.
 * @param {string} text - The text to detect encoding for.
 * @returns {string} - The detected encoding or 'UTF-8' if detection fails.
 */
function detectEncoding(text) {
    try {
        const detected = Encoding.detect(text);
        return detected || 'UTF-8';
    } catch (error) {
        console.error("Error detecting encoding: ", error);
        return 'UTF-8';
    }
}

/**
 * convertEncoding
 * Converts text encoding from one format to another.
 * @param {string} text - The text to convert.
 * @param {string} toEncoding - The target encoding.
 * @param {string} [fromEncoding=null] - The source encoding (optional). If null, it will attempt to detect the encoding.
 * @returns {string} - The converted text.
 */
function convertEncoding(text, toEncoding, fromEncoding = null) {
    try {
        const detectedEncoding = fromEncoding || detectEncoding(text);

        return Encoding.convert(text, {
            to: toEncoding,
            from: detectedEncoding
        });
    } catch (error) {
        console.error("Error converting encoding: ", error);
        return text; // Return the original text on error
    }
}

/**
 * getAllData
 * Retrieves all data from chrome.storage.local.
 * @returns {Promise<Object>} - A promise that resolves to the data object.
 */
async function getAllData() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get((result) => {
                // The result is an object containing the keys and their values
                if (chrome.runtime.lastError) {
                    log("getAllData error ", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError); // Reject the promise if there's an error
                } else {
                    log("getAllData success ", result);
                    resolve(result); // Resolve the promise with the result object
                }
            });
        } catch (error) {
            console.error("Error in getAllData:", error);
            reject(error); // Reject the promise if there's an error
        }
    });
}

// Listener for context menu item clicks
chrome.contextMenus.onClicked.addListener(searchOnClick);

/**
 * replaceAllInstances
 * Replaces all instances of a search value in a text with a replace value.
 * @param {string} text - The text to search within.
 * @param {string} searchValue - The value to search for.
 * @param {string} replaceValue - The value to replace with.
 * @returns {string} - The modified text.
 */
function replaceAllInstances(text, searchValue, replaceValue) {
    try {
        const regex = new RegExp(searchValue, 'g');
        return text.replace(regex, replaceValue);
    } catch (error) {
        console.error("Error replacing all instances: ", error);
        return text; // Return the original text on error
    }
}

/**
 * splitBySpace
 * Splits text by space.
 * @param {string} text - The text to split.
 * @returns {string[]} - The array of split text.
 */
function splitBySpace(text) {
    try {
        return text.split(" ");
    } catch (error) {
        console.error("Error splitting by space: ", error);
        return [text]; // Return the original text as a single element array on error
    }
}

/**
 * looseCompareBooleanOrStrings
 * Compares two values (boolean or string) loosely.
 * @param {any} a - The first value.
 * @param {any} b - The second value.
 * @returns {boolean} - True if values are loosely equal, otherwise false.
 */
function looseCompareBooleanOrStrings(a, b) {
    try {
        // Check if either a or b is undefined or null
        if (a === undefined || a === null || b === undefined || b === null) {
            return a == b; // Use loose equality to handle null == undefined
        }
        return a.toString().toLowerCase() === b.toString().toLowerCase();
    } catch (error) {
        console.error("Error comparing values: ", error);
        return false; // Return false on error
    }
}

/**
 * searchOnClick
 * Handles context menu item clicks, retrieves configuration, and opens the search URL.
 * @param {Object} menuInfo - Information about the clicked menu item.
 * @param {Object} tab - The tab where the click occurred.
 * @returns {void}
 */
async function searchOnClick(menuInfo, tab) {
    log(menuInfo);
    log(tab);

    try {
        const askFg = !looseCompareBooleanOrStrings(await getItem("_askBg"), true);
        const askNext = looseCompareBooleanOrStrings(await getItem("_askNext"), true);

        log("Foreground = ", askFg);
        log("Next = ", askNext);

        const configuredLinks = splitBySpace(menuInfo.menuItemId);

        for (const configuredLink of configuredLinks) {
            await openSearchUrl(configuredLink, menuInfo, tab, askFg, askNext);
        }
    } catch (error) {
        console.error("Error in searchOnClick:", error);
    }
}

/**
 * openSearchUrl
 * Opens the search URL in a new tab based on the configured link and user preferences.
 * @param {string} configuredLink - The configured link from the context menu item.
 * @param {Object} menuInfo - Information about the clicked menu item.
 * @param {Object} tab - The tab where the click occurred.
 * @param {boolean} askFg - Whether to open the tab in the foreground.
 * @param {boolean} askNext - Whether to open the tab next to the current tab.
 * @returns {Promise<void>}
 */
async function openSearchUrl(configuredLink, menuInfo, tab, askFg, askNext) {
    try {
        let targetURL = configuredLink;
        const encodedText = Encoding.urlEncode(menuInfo.selectionText);

        // Handle encoding conversion
        const encodingMatch = targetURL.match(/%\{s:([^}]+)\}/);
        if (encodingMatch) {
            const [fullMatch, encodings] = encodingMatch;
            const [fromEncoding, toEncoding] = encodings.split('-').map(e => e.trim());

            let encodedConvertText = '';
            if (fromEncoding && toEncoding) {
                encodedConvertText = convertEncoding(encodedText, toEncoding, fromEncoding);
            } else if (fromEncoding) {
                encodedConvertText = convertEncoding(encodedText, fromEncoding);
            }

            targetURL = replaceAllInstances(targetURL, fullMatch, Encoding.urlEncode(encodedConvertText));
        }

        // Replace search terms in the URL
        targetURL = replaceAllInstances(targetURL, "NOENCODESEARCH", menuInfo.selectionText);
        targetURL = replaceAllInstances(targetURL, "%s", encodedText);
        targetURL = replaceAllInstances(targetURL, "TESTSEARCH", encodedText);

        // Configure tab properties
        const createProperties = {
            url: targetURL,
            active: askFg,
        };

        // Set tab index based on user preferences
        if (askNext) {
            if (Number.isInteger(tab.id) && tab.id >= 0) {
                createProperties.index = tab.index + 1;
                createProperties.openerTabId = tab.id;
            } else {
                const activeTab = await getActiveTab();
                if (activeTab && Number.isInteger(activeTab.id) && activeTab.id >= 0) {
                    createProperties.index = activeTab.index + 1;
                    createProperties.openerTabId = activeTab.id;
                }
            }
        } else {
            if (Number.isInteger(tab.id) && tab.id >= 0) {
                createProperties.openerTabId = tab.id;
            }
        }

        // Create the new tab
        await createTab(createProperties);

    } catch (error) {
        console.error("Error in openSearchUrl:", error);
    }
}

/**
 * getActiveTab
 * Retrieves the currently active tab in the current window.
 * @returns {Promise<chrome.tabs.Tab>} - A promise that resolves to the active tab, or null if not found.
 */
async function getActiveTab() {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return activeTab || null;
    } catch (error) {
        console.error("Error getting active tab:", error);
        return null;
    }
}

/**
 * createTab
 * Creates a new tab with the given properties.
 * @param {Object} createProperties - The properties for creating the tab.
 * @returns {Promise<chrome.tabs.Tab>} - A promise that resolves to the created tab, or null if creation fails.
 */
async function createTab(createProperties) {
    try {
        const newTab = await chrome.tabs.create(createProperties);
        return newTab;
    } catch (error) {
        console.error("Error creating tab:", error);
        return null;
    }
}

/**
 * getItem
 * Retrieves an item from chrome.storage.local.
 * @param {string} key - The key to retrieve.
 * @returns {Promise<any>} - A promise that resolves to the value of the key, or "null" if not found or on error.
 */
async function getItem(key) {
    try {
        const result = await chrome.storage.local.get(key);
        const value = result[key] !== undefined ? result[key] : "null";
        return value;
    } catch (e) {
        console.error("Error getting item from storage: ", e);
        return "null";
    }
}