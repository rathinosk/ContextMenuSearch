importScripts('encoding.min.js');

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

const DEFAULT_CONFIG = '[["-1","YouTube","http://www.youtube.com/results?search_query=TESTSEARCH",true],["-1","Bing","http://www.bing.com/search?q=TESTSEARCH",true],["-1","Bing Images","http://www.bing.com/images/search?q=TESTSEARCH",true],["-1","IMDB","http://www.imdb.com/find?s=all&q=TESTSEARCH",true],["-1","Wikipedia","http://en.wikipedia.org/wiki/Special:Search?search=TESTSEARCH&go=Go",true],["-1","Yahoo!","http://search.yahoo.com/search?vc=&p=TESTSEARCH",true],["-1","Maps","https://www.google.com/maps/search/TESTSEARCH",true]]';

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
    // Check if data exists in chrome.storage.local
    chrome.storage.local.get((result) => {
        console.log('Got storage.local ', result);
        if (chrome.runtime.lastError || !result._allSearch || (result._allSearch?.length ?? 0) < 1) {
            // If data is not found, set default configuration and load context menu items
            try {
                chrome.storage.local.set({ _allSearch: DEFAULT_CONFIG }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error setting default configuration:', chrome.runtime.lastError);
                    } else {
                        console.log('Default configuration set.');
                        loadContextMenuItems();
                    }
                });
            } catch (error) {
                console.error('Error setting default configuration:', error);
            }
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
 * loadContextMenuItems
 * Loads context menu items based on data stored in chrome.storage.local.
 * Prevents overlapping calls using a queue.
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
        console.log("loadContextMenuItems called");

        console.log("Clearing existing items");
        await new Promise((resolve) => {
            try {
                chrome.contextMenus.removeAll(() => {
                    console.log('All context menu items have been removed.');
                    resolve();
                });
            } catch (e) {
                console.error("Error removing context menus: ", e);
                resolve(); // Resolve anyway to continue execution
            }
        });

        const allData = await getAllData();

        console.log("loadContextMenuItems data = ", allData);

        if (!allData._allSearch) {
            throw new Error('_allSearch is undefined');
        }

        try {
            const _all = JSON.parse(allData._allSearch);
            const numentries = _all?.length ?? 0;

            console.log(_all);
            console.log(numentries);

            for (let i = 0; i < numentries; i++) {
                if (_all[i][3]) {
                    try {
                        if (_all[i][1] === "" && _all[i][2] === "") {
                            // Show separator
                            chrome.contextMenus.create({ id: i.toString(), type: "separator", contexts: ["selection"] });
                        } else {
                            _all[i][0] = chrome.contextMenus.create({ id: _all[i][2], title: _all[i][1], contexts: ["selection"] });
                        }
                    } catch (e) {
                        console.error("Error creating context menu item: ", i, e);
                    }
                } else {
                    _all[i][0] = -1;
                }
            }
        } catch (jsonError) {
            console.error("Error parsing or processing _allSearch data:", jsonError);
        }

        const askOptions = looseCompareBooleanOrStrings(await getItem("_askOptions"), true);

        if (askOptions) {
            try {
                // Show separator
                chrome.contextMenus.create({ id: "separator", type: "separator", contexts: ["selection"] });
                // Show the item for linking to extension options
                chrome.contextMenus.create({ id: "options.html", title: "Options", contexts: ["selection"] });
            } catch (e) {
                console.error("Error creating options context menu items: ", e);
            }
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
                    console.log("getAllData error ", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError); // Reject the promise if there's an error
                } else {
                    console.log("getAllData success ", result);
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
    console.log(menuInfo);
    console.log(tab);

    const askFg = !looseCompareBooleanOrStrings(await getItem("_askBg"), true);
    const askNext = looseCompareBooleanOrStrings(await getItem("_askNext"), true);

    console.log("Foreground = ", askFg);
    console.log("Next = ", askNext);

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
            active: askFg,
        };

        if (askNext) {
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