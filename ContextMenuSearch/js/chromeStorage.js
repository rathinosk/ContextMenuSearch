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

let USE_SYNC_STORAGE = false;

/**
 * isSyncStorageAvailable
 * Checks if chrome.storage.sync is available.
 * @returns {boolean} - True if sync storage is available, false otherwise.
 */
function isSyncStorageAvailable() {
    try {
        return typeof chrome !== 'undefined' && chrome.storage && typeof chrome.storage.sync !== 'undefined';
    } catch (e) {
        console.error("isSyncStorageAvailable: Error checking sync storage availability: ", e);
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
    // console.log(`getStorageArea: Using ${USE_SYNC_STORAGE ? 'sync' : 'local'} storage.`);
    return USE_SYNC_STORAGE ? chrome.storage.sync : chrome.storage.local;
}

/**
 * setItem
 * Sets an item in storage.
 * @param {string} key - The key to store the item under.
 * @param {any} value - The value to store.
 * @returns {Promise<void>} - A promise that resolves when the item is stored.
 */
async function setItem(key, value) {
    return new Promise((resolve, reject) => {
        getStorageArea().set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                console.error(`setItem: Error setting item ${key}: ${chrome.runtime.lastError}`);
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * getItem
 * Gets an item from storage.
 * @param {string} key - The key of the item to retrieve.
 * @returns {Promise<any>} - A promise that resolves with the retrieved value, or undefined if not found.
 */
async function getItem(key) {
    return new Promise((resolve, reject) => {
        getStorageArea().get(key, (result) => {
            if (chrome.runtime.lastError) {
                console.error(`getItem: Error getting item ${key}: ${chrome.runtime.lastError}`);
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}

/**
 * removeItem
 * Removes an item from storage.
 * @param {string} key - The key of the item to remove.
 * @returns {Promise<void>} - A promise that resolves when the item is removed.
 */
async function removeItem(key) {
    return new Promise((resolve, reject) => {
        getStorageArea().remove(key, () => {
            if (chrome.runtime.lastError) {
                console.error(`removeItem: Error removing item ${key}: ${chrome.runtime.lastError}`);
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * clearStorage
 * Clears all items from the current storage area.
 * @returns {Promise<void>} - A promise that resolves when the storage area is cleared.
 */
async function clearStorage() {
    return new Promise((resolve, reject) => {
        getStorageArea().clear(() => {
            if (chrome.runtime.lastError) {
                console.error(`clearStorage: Error clearing storage: ${chrome.runtime.lastError}`);
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * migrateDataFromLocalToSync
 * Migrates data from chrome.storage.local to chrome.storage.sync.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
async function migrateDataFromLocalToSync() {
    if (!USE_SYNC_STORAGE) {
        console.log("migrateDataFromLocalToSync: Sync storage not available, skipping migration.");
        return;
    }

    try {
        const localStorageData = await new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (data) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(data);
                }
            });
        });

        if (Object.keys(localStorageData).length === 0) {
            console.log("migrateDataFromLocalToSync: No data in local storage, skipping migration.");
            return;
        }

        await new Promise((resolve, reject) => {
            chrome.storage.sync.set(localStorageData, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });

        await new Promise((resolve, reject) => {
            chrome.storage.local.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });

        console.log("migrateDataFromLocalToSync: Data migration from local to sync complete.");
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
    if (USE_SYNC_STORAGE) {
        const syncData = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, (data) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(data);
                }
            });
        });

        if (Object.keys(syncData).length === 0) {
            // Sync storage is empty, check local storage
            const localStorageData = await new Promise((resolve, reject) => {
                chrome.storage.local.get(null, (data) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(data);
                    }
                });
            });

            if (Object.keys(localStorageData).length > 0) {
                // Local storage has data, migrate to sync
                await migrateDataFromLocalToSync();
            } else {
                // Both sync and local are empty, set default config in sync
                await setItem('_allSearch', DEFAULT_CONFIG);
                console.log("initializeStorage: Default configuration set in sync storage.");
            }
        } else {
            // Sync storage has data, clear local storage
            await new Promise((resolve, reject) => {
                chrome.storage.local.clear(() => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            console.log("initializeStorage: Sync storage has data, local storage cleared.");
        }
    } else {
        // Use local storage, set default if empty
        const localStorageData = await new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (data) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(data);
                }
            });
        });

        if (Object.keys(localStorageData).length === 0) {
            await setItem('_allSearch', DEFAULT_CONFIG);
            console.log("initializeStorage: Default configuration set in local storage.");
        }
    }
}


