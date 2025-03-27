/**
 * Chrome Storage Management Module
 *
 * This module provides functions for managing Chrome storage,
 * using chrome.storage.sync if available and falling back to
 * chrome.storage.local if not. It also handles migrating data
 * from local to sync storage.
 */

// Set the default configuration for the extension
const DEFAULT_CONFIG = '['
+ '["-1","Google","http://www.google.com/search?q=TESTSEARCH",true],'
+ '["-1","DuckDuckGo","https://duckduckgo.com/?q=TESTSEARCH",true],'
+ '["-1","Maps","https://www.google.com/maps/search/TESTSEARCH",true],'
+ '["-1","YouTube","http://www.youtube.com/results?search_query=TESTSEARCH",true],'
+ '["-1","","",true],'
+ '["-1","E-bay US","http://shop.ebay.com/?_nkw=TESTSEARCH&_sacat=See-All-Categories",true],'
+ '["-1","Amazon US","http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=TESTSEARCH&x=0&y=0",true],'
+ '["-1","Steam","https://store.steampowered.com/search/?term=TESTSEARCH",true],'
+ '["-1","","",true],'
+ '["-1","GitHub","https://github.com/search?q=TESTSEARCH",true],'
+ '["-1","IMDB","http://www.imdb.com/find?s=all&q=TESTSEARCH",true],'
+ '["-1","Wikipedia EN","http://en.wikipedia.org/w/index.php?title=Special:Search&search=TESTSEARCH",true]'
+ ']';

let USE_SYNC_STORAGE = false;
let DEBUG_MODE = false; // Initialize as false, will be updated later

/**
* log
* Logs a message to the console with a timestamp if DEBUG_MODE is enabled.
* @param {string} message - The message to log.
*/
function log(message) {
    if (DEBUG_MODE) {
        try {
            const now = new Date();
            console.log(`${now.toLocaleTimeString()}: ${message}`);
        } catch (error) {
            console.error("Error during logging:", error);
        }
    }
}

/**
* isSyncStorageAvailable
* Checks if chrome.storage.sync is available.
* @returns {boolean} - True if sync storage is available, false otherwise.
*/
function isSyncStorageAvailable() {
try {
    return typeof chrome !== 'undefined' && chrome.storage && typeof chrome.storage.sync !== 'undefined';
} catch (error) {
    console.error("isSyncStorageAvailable: Error checking sync storage availability:", error);
    return false;
}
}

USE_SYNC_STORAGE = isSyncStorageAvailable();

/**
* getStorageArea
* Determines which storage area to use based on availability.
* @returns {chrome.storage.StorageArea} - The storage area to use (sync or local).
*/
function getStorageArea() {
log(`getStorageArea: Using ${USE_SYNC_STORAGE ? 'sync' : 'local'} storage.`);
return USE_SYNC_STORAGE ? chrome.storage.sync : chrome.storage.local;
}

/**
* handleStorageError
* Handles errors that occur during storage operations.
* @param {string} operation - The name of the storage operation.
* @param {string} key - The storage key involved in the operation.
* @throws {Error} - Throws an error if chrome.runtime.lastError is set.
*/
function handleStorageError(operation, key) {
if (chrome.runtime.lastError) {
    const errorMessage = `${operation}: Error ${key ? `with key "${key}"` : ""} : ${chrome.runtime.lastError.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
}
}

/**
* setItem
* Sets an item in storage.
* @param {string} key - The key to store the item under.
* @param {any} value - The value to store.
* @returns {Promise<void>} - A promise that resolves when the item is stored.
*/
async function setItem(key, value) {
log(`setItem: Setting item with key "${key}"`);
await getStorageArea().set({ [key]: value });
handleStorageError("setItem", key);
}

/**
* getItem
* Gets an item from storage.
* @param {string} key - The key of the item to retrieve.
* @returns {Promise<any>} - A promise that resolves with the retrieved value, or undefined if not found.
*/
async function getItem(key) {
log(`getItem: Getting item with key "${key}"`);
const result = await getStorageArea().get(key);
handleStorageError("getItem", key);
return result[key];
}

/**
* removeItem
* Removes an item from storage.
* @param {string} key - The key of the item to remove.
* @returns {Promise<void>} - A promise that resolves when the item is removed.
*/
async function removeItem(key) {
log(`removeItem: Removing item with key "${key}"`);
await getStorageArea().remove(key);
handleStorageError("removeItem", key);
}

/**
* clearStorage
* Clears all items from the current storage area.
* @returns {Promise<void>} - A promise that resolves when the storage area is cleared.
*/
async function clearStorage() {
log("clearStorage: Clearing storage");
await getStorageArea().clear();
handleStorageError("clearStorage");
}

/**
* migrateDataFromLocalToSync
* Migrates data from chrome.storage.local to chrome.storage.sync.
* @returns {Promise<void>} - A promise that resolves when the migration is complete.
*/
async function migrateDataFromLocalToSync() {
if (!USE_SYNC_STORAGE) {
    log("migrateDataFromLocalToSync: Sync storage not available, skipping migration.");
    return;
}

try {
    log("migrateDataFromLocalToSync: Starting data migration from local to sync.");
    const localStorageData = await chrome.storage.local.get(null);
    handleStorageError("migrateDataFromLocalToSync (get local)");

    if (Object.keys(localStorageData).length === 0) {
        log("migrateDataFromLocalToSync: No data in local storage, skipping migration.");
        return;
    }

    await chrome.storage.sync.set(localStorageData);
    handleStorageError("migrateDataFromLocalToSync (set sync)");

    await chrome.storage.local.clear();
    handleStorageError("migrateDataFromLocalToSync (clear local)");

    log("migrateDataFromLocalToSync: Data migration from local to sync complete.");
} catch (error) {
    console.error(`migrateDataFromLocalToSync: Error during data migration: ${error}`);
}
}

/**
* initializeStorage
* Initializes the storage, migrating data if necessary and setting defaults if storage is empty.
* @returns {Promise<void>} - A promise that resolves when the storage is initialized.
*/
async function initializeStorage() {
log("initializeStorage: Initializing storage.");
try {
    // Load the debug mode setting
    const askDebug = await getItem("_askDebug");
    DEBUG_MODE = askDebug === true || askDebug === "true";
    log(`initializeStorage: Debug mode is ${DEBUG_MODE ? 'enabled' : 'disabled'}.`);

    if (USE_SYNC_STORAGE) {
        const syncData = await chrome.storage.sync.get(null);
        handleStorageError("initializeStorage (get sync)");

        if (Object.keys(syncData).length === 0) {
            // Sync storage is empty, check local storage
            const localStorageData = await chrome.storage.local.get(null);
            handleStorageError("initializeStorage (get local)");

            if (Object.keys(localStorageData).length > 0) {
                // Local storage has data, migrate to sync
                await migrateDataFromLocalToSync();
            } else {
                // Both sync and local are empty, set default config in sync
                await setItem('_allSearch', DEFAULT_CONFIG);
                log("initializeStorage: Default configuration set in sync storage.");
            }
        } else {
            // Sync storage has data, clear local storage
            await chrome.storage.local.clear();
            handleStorageError("initializeStorage (clear local)");
            log("initializeStorage: Sync storage has data, local storage cleared.");
        }
    } else {
        // Use local storage, set default if empty
        const localStorageData = await chrome.storage.local.get(null);
        handleStorageError("initializeStorage (get local)");

        if (Object.keys(localStorageData).length === 0) {
            await setItem('_allSearch', DEFAULT_CONFIG);
            log("initializeStorage: Default configuration set in local storage.");
        }
    }
} catch (error) {
    console.error("initializeStorage: Error during storage initialization:", error);
}
}
