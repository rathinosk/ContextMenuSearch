/** chromeStorage.js
 * This file contains functions to interact with chrome.storage.local.
 * The functions are async and return Promises.
 * The functions are:
 * - setItem(key, value)
 * - getItem(key)
 * - clearChromeStorage()
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
 * Async function to set an item in chrome.storage.local
 * @param {string} key - The key to set in storage.
 * @param {any} value - The value to set for the key.
 */
async function setItem(key, value) {
    try {
        //log(`setItem: Inside setItem: ${key}: ${value}`);

        // Set the item in chrome.storage.local
        await chrome.storage.local.set({ [key]: value });
    } catch (e) {
        log("setItem: Error inside setItem");
        log(e);
    }
    // log(`setItem: Return from setItem ${key}: ${value}`);
}

/**
 * Async function to get an item from chrome.storage.local
 * @param {string} key - The key to retrieve from storage.
 * @returns {Promise<any>} - The value associated with the key, or "null" if not found.
 */
async function getItem(key) {
    log(`getItem: Get Item: ${key}`);
    try {
        const result = await chrome.storage.local.get(key);
        const value = result[key] !== undefined ? result[key] : "null";

        // log(`getItem: Returning value: ${value}`);
        return value;
    } catch (e) {
        log(`getItem: Error inside getItem() for key: ${key}`);
        log(e);
        return "null";
    }
}

/**
 * Async function to clear all items from chrome.storage.local
 */
async function clearChromeStorage() {
    log("clearChromeStorage: Clearing chrome.storage.local");
    try {
        await chrome.storage.local.clear();
        log("clearChromeStorage: Chrome storage cleared.");
    } catch (e) {
        log("clearChromeStorage: Error clearing storage.");
        log(e);
    }
}


