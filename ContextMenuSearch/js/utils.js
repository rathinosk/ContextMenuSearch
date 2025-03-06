/** @module utils 
 * @desc Utility functions for ContextMenuSearch.
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

// Export the log function
export { log };
