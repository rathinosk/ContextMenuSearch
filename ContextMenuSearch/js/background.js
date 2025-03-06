importScripts('encoding.min.js');

const defaultConfig = '[["-1","YouTube","http://www.youtube.com/results?search_query=TESTSEARCH",true],["-1","Bing","http://www.bing.com/search?q=TESTSEARCH",true],["-1","Bing Images","http://www.bing.com/images/search?q=TESTSEARCH",true],["-1","IMDB","http://www.imdb.com/find?s=all&q=TESTSEARCH",true],["-1","Wikipedia","http://en.wikipedia.org/wiki/Special:Search?search=TESTSEARCH&go=Go",true],["-1","Yahoo!","http://search.yahoo.com/search?vc=&p=TESTSEARCH",true],["-1","Maps","https://www.google.com/maps/search/TESTSEARCH",true]]';

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
// Check if data exists in chrome.storage.local
        chrome.storage.local.get((result) => {
        console.log('Got storage.local ', result);
        if (chrome.runtime.lastError || !result._allSearch || (result._allSearch?.length ?? 0) < 1) {
            // If data is not found, set default configuration and load context menu items
            chrome.storage.local.set({ _allSearch: defaultConfig }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error setting default configuration:', chrome.runtime.lastError);
                } else {
                    console.log('Default configuration set.');
                    loadContextMenuItems();
                }
            });
        } else {
            loadContextMenuItems();
        }
    });
});

// Listener for changes in chrome.storage.local
chrome.storage.onChanged.addListener(() => {
    loadContextMenuItems();
});

// Ensure loadContextMenuItems calls are not overlapping
let isExecutingLoadContextMenuItems = false;
let loadContextMenuItemsQueue = [];

/**
 * Function to load context menu items
 * @returns {Promise<void>} - A promise that resolves when the context menu items are loaded
 * @throws {Error} - If _allSearch is undefined
 * @throws {Error} - If an error occurs while clearing existing items
**/
async function loadContextMenuItems() {
    if (isExecutingLoadContextMenuItems) {
        return new Promise((resolve, reject) => {
            loadContextMenuItemsQueue.push({ resolve, reject });
        });
    }

    isExecutingLoadContextMenuItems = true;

    try {
        console.log("loadContextMenuItems called");

        console.log("Clearing existing items");
        await new Promise((resolve) => {
            chrome.contextMenus.removeAll(() => {
                console.log('All context menu items have been removed.');
                resolve();
            });
        });

        const allData = await getAllData();

        console.log("loadContextMenuItems data = ", allData);

        if (!allData._allSearch) {
            throw new Error('_allSearch is undefined');
        }

        const _all = JSON.parse(allData._allSearch);
        const numentries = _all?.length ?? 0;

        console.log(_all);
        console.log(numentries);

        for (let i = 0; i < numentries; i++) {
            if (_all[i][3]) {
                if (_all[i][1] === "" && _all[i][2] === "") {
                    // Show separator
                    chrome.contextMenus.create({ id: i.toString(), type: "separator", contexts: ["selection"] });
                } else {
                    _all[i][0] = chrome.contextMenus.create({ id: _all[i][2], title: _all[i][1], contexts: ["selection"] });
                }
            } else {
                _all[i][0] = -1;
            }
        }

        const ask_options = looseCompareBooleanOrStrings(await getItem("_askOptions"), true);

        if (ask_options) {
            // Show separator
            chrome.contextMenus.create({ id: "separator", type: "separator", contexts: ["selection"] });
            // Show the item for linking to extension options
            chrome.contextMenus.create({ id: "options.html", title: "Options", contexts: ["selection"] });
        }
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
 * Function to detect the encoding of a given text
* @param {string} text - The text to detect encoding for
* @returns {string} - The detected encoding or 'UTF-8'
*/
function detectEncoding(text) {
    const detected = Encoding.detect(text);
    return detected || 'UTF-8';
}

/**
 * Function to convert text encoding
* @param {string} text - The text to convert
* @param {string} toEncoding - The target encoding
* @param {string} [fromEncoding=null] - The source encoding (optional)
* @returns {string} - The converted text
*/
function convertEncoding(text, toEncoding, fromEncoding = null) {
    const detectedEncoding = fromEncoding || detectEncoding(text);

    return Encoding.convert(text, {
        to: toEncoding,
        from: detectedEncoding
    });
}

/**
 * Function to get all data from chrome.storage.local
* @returns {Promise<Object>} - A promise that resolves to the data object
*/
async function getAllData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get((result) => {
            // The result is an object containing the keys and their values
            if (chrome.runtime.lastError) {
                console.log("getAllData error ", chrome.runtime.lastError);
                reject(chrome.runtime.lastError); // Reject the promise if there's an error
            } else {
                console.log("getAllData success ", result);
                resolve(result); // Resolve the promise with the result object
            }
        });
    });
}

// Listener for context menu item clicks
chrome.contextMenus.onClicked.addListener(searchOnClick);

/**
 * Function to replace all instances of a search value in a text
* @param {string} text - The text to search within
* @param {string} searchValue - The value to search for
* @param {string} replaceValue - The value to replace with
* @returns {string} - The modified text
*/
function replaceAllInstances(text, searchValue, replaceValue) {
    const regex = new RegExp(searchValue, 'g');
    return text.replace(regex, replaceValue);
}

/**
 * Function to split text by space
* @param {string} text - The text to split
* @returns {string[]} - The array of split text
*/
function splitBySpace(text) {
    return text.split(" ");
}

/**
 * Function to loosely compare boolean or string values
* @param {any} a - The first value
* @param {any} b - The second value
* @returns {boolean} - True if values are loosely equal, otherwise false
*/
function looseCompareBooleanOrStrings(a, b) {
    return a.toString().toLowerCase() === b.toString().toLowerCase();
}

/**
 * Function to handle context menu item clicks
 * @param {Object} menuInfo - Information about the clicked menu item
 * @param {Object} tab - The tab where the click occurred
 */
async function searchOnClick(menuInfo, tab) {
    console.log(menuInfo);
    console.log(tab);

    const ask_fg = !looseCompareBooleanOrStrings(await getItem("_askBg"), true);
    const ask_next = looseCompareBooleanOrStrings(await getItem("_askNext"), true);

    console.log("Foreground = ", ask_fg);
    console.log("Next = ", ask_next);

    const configuredLink = menuInfo.menuItemId;

    // Split the configured link
    const split = splitBySpace(configuredLink);

    // Loop on the output
    for (const item of split) {
        
        // Open the link
        let targetURL = item;

        // urlEncode the selection text
        var encodedText = Encoding.urlEncode(menuInfo.selectionText); 

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

        // Replace the search term in the URL without encoding for %S
        targetURL = replaceAllInstances(targetURL, "NOENCODESEARCH", menuInfo.selectionText);

        // Replace the search term in the URL with encoding for %s and TESTSEARCH
        targetURL = replaceAllInstances(targetURL, "%s", encodedText);
        targetURL = replaceAllInstances(targetURL, "TESTSEARCH", encodedText);

        const createProperties = {
            url: targetURL,
            active: ask_fg,
        };

        if (ask_next) {
            if (Number.isInteger(tab.id) && tab.id >= 0) {
                createProperties.index = tab.index + 1;
                createProperties.openerTabId = tab.id;
            } else {
                // Get the active tab in the current window
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (activeTab && Number.isInteger(activeTab.id) && activeTab.id >= 0) {
                    createProperties.index = activeTab.index + 1;
                    createProperties.openerTabId = activeTab.id;
                } else {
                    // If no valid active tab, open as the last tab
                    createProperties.index = undefined;
                }
            }
        } else {
            if (Number.isInteger(tab.id) && tab.id >= 0) {
                createProperties.openerTabId = tab.id;
            }
        }

        try {
            chrome.tabs.create(createProperties);
        } catch (error) {
            console.error("Error creating tab:", error);
        }
    }
}

/**
 * Async function to get an item from chrome.storage.local
* @param {string} key - The key to retrieve
* @returns {Promise<any>} - A promise that resolves to the value of the key
*/
async function getItem(key) {
    try {
        const result = await chrome.storage.local.get(key);
        const value = result[key] !== undefined ? result[key] : "null";
        return value;
    } catch (e) {
        return "null";
    }
}