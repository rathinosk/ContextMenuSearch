Context Menu Search
=================

Context Menu Search is a powerful Chrome/Edge extension that enhances your browsing experience by allowing you to add multiple search engines to the right-click context menu. This extension provides a convenient way to search for selected text using your preferred search engines directly from the context menu.

## Features

- **Multiple Search Engines**: Add and manage multiple search engines to the right-click context menu.
- **Customizable Search Options**: Configure the search results to open in a new tab, either as a focused tab or a background tab.
- **Tab Placement**: Set the location of the newly opened tab to be either next to the current tab or at the end of the tab list.
- **Order Management**: Arrange the order of the search engines in the context menu according to your preference.
- **Predefined Search Engines**: Choose from a list of more than 60 commonly used search engines for easy setup.
- **Custom Search Engines**: Add custom search engines that are not included in the predefined list.
- **Remote Search Configuration (Upcoming Feature)**: Read the search configuration from a remote URL. Great for sharing configuration between browsers or with other users.

## Installation

Install Context Menu Search from: 
- Chrome Web Store: [Context Menu Search](https://chromewebstore.google.com/detail/context-menu-search/jiemcgfaaankhcphdbfbilkldedojieb?hl=en)
- Edge Web Store: [Context Menu Search](https://microsoftedge.microsoft.com/addons/detail/context-menu-search/endcepcjbpjjpbapcccldpjoapkjiccd)

## Usage

1. Select the text you want to search for. This can be on any web page or within a PDF file displayed inside the browser. For some text, you may need to hold down **ALT** (On Mac, use **Option**) to select the text. 
2. Right-click to open the context menu. Select "Context Menu Search".
3. Choose your desired search engine from your list.
4. The search results will open in a new tab, new window or sidebar based on your configured options.

## Customization
Context Menu Search is highly customizable to fit your workflow. All customization options are accessible via the extension’s options page. Changes are applied instantly and do not require a browser restart.

The main customization options are as follows:

### Adding Search Engines (Search Engines Page)
- **Predefined Engines:**  
  Access the options page to select from over 60 popular search engines. Simply check the ones you want to appear in your context menu.
- **Custom Engines:**  
  Add your own search engines by specifying a display name and a search URL. Use `TESTSEARCH` or `%s` in the URL as a placeholder for the selected text.  
  *Example:*  
  ```
  Name: DuckDuckGo  
  URL: https://duckduckgo.com/?q=TESTSEARCH
  ```
### Managing Search Engines Menu
- **Reordering the menu**  
  Using the reorder handle, simply drag and drop search engines to reorder them. The order here determines how they appear in your context menu.
  Newly added search engines always appear at the bottomn of the list.
- **Hiding menu items**
  Uncheck the "Enabled" checkboxes to hide search engines that you wish to hide. This allows you to maintain the links, but unclutter the menu when you don't need them.
- **Edit/Delete:**  
  You can edit the name or link for search engine, or delete them entirely.
- **Add Menu Separator**
  Click the "Add Menu Separator" button to add a menu separator. It will appear at the bottom of the list, but can be moved like any other menu item.

When you are done customizing the menu, be sure to click the "Save Configuration" button. The new configuration will take effect immediately without a browser restart.

## Advanced Options

### Search Results Options (Changes coming soon)

- **Always open search results in a background tab**
(changing) This forces search results to be opened in a background tab. By default, results will open in a foreground tab.  
_This will be replaced with an "Opening Mode" option in a future update, which supports tabs, windows and browser sidebar._
- **Always open the new search tab next to the current tab**
(changing) This forces the new tab to appear next to the current tab.  By default it opens as the last tab.  
_With the upcoming update, this will only apply to modes that open a new tab._
- **Show a link to extension options at the bottom of the context menu**
This causes the addition of an "Options" entry at the bottom of the context menu. This can be useful if make frequent changes to the menu.
- **Enable Debug Mode (Increases console logging)**
This causes the plugin to produce extra console logging. This can cause performance issues and should only be turned on when debugging the extension.

### Export/Import Search Options (JSON)
Your current configuration is shown in a large text box.
- **Export:**  
  Save your current search engine configuration to a file for backup or sharing.
- **Import:**  
  Load a previously saved configuration file to quickly restore or share your setup.

### Remote Configuration (Upcoming)
- **Sync from URL:**  
  Optionally, load your search engine list from a remote JSON file. See the section below for details.

### Reset to Defaults
- **Reset Configuration**  
  If needed, you can reset all settings and search engines to their original defaults by clicking the "Reset Configuration" button. This cannot be undone.

## Remote Search Configuration (Upcoming Feature)

A new feature is being implemented to allow loading the search engine configuration from a public JSON URL. This will let you manage and update your context menu remotely.

**How it works:**
- **Manual Import:** Paste a URL and fetch/apply the configuration once.
- **Optional Auto-Sync on Startup:** Store a URL and auto-fetch it when the browser starts (with throttling to avoid repeated requests).

**Important CORS Note:**  
The extension cannot bypass browser CORS restrictions. The remote host must allow cross-origin requests or the fetch will fail. This is a browser security constraint and cannot be overridden.

Make sure your host returns headers like:
- `Access-Control-Allow-Origin: *`
- `Content-Type: application/json; charset=utf-8`

Good options include:
- Raw JSON file on GitHub (https://raw.githubusercontent.com)
- A JSON file hosted on GitHub Pages (https://docs.github.com/en/pages)
- Any server you control where you can set headers appropriately

**Other details:**
- Only http(s) URLs are supported.
- In theory, basic URL authentication should work ("https://username:password@host.domain.tld")
- The JSON must match the current format:  
  An array of arrays, each item:  
  `["-1", "Display Name", "URL with TESTSEARCH or %s", true/false]`
- No extra extension permissions will be added; success depends on the remote server allowing CORS.
- If you need periodic sync (e.g., every X hours) beyond startup, an alarms-based option may be added later.

**Troubleshooting:**
- If it fails, you’ll typically see a “Failed to fetch” or CORS error. Try hosting from a location that sets the headers above, or test with a raw GitHub URL.
- You can check the extension’s logs via `chrome://extensions` → Context Menu Search → Service worker “Inspect”, or open the Options page and look at the DevTools console.

**Note:**  
Reliability depends on the remote host’s CORS support, but this should work well on hosts that comply with CORS

## Support

For any issues or feature requests, please visit the [Github Issue Tracker](https://github.com/rathinosk/ContextMenuSearch/issues) and open an issue.

## License

This project is licensed under the MIT License. See the [LICENSE](./ContextMenuSearch/LICENSE) file for details.

## Attribution
- Original ContextMenuSearch by Ashutosh Dwivedi (https://github.com/ashutoshetw/ContextMenuSearch)
- Original Encoding Code by Yuichi Sakagami (https://github.com/cti1650/ContextMenuSearch)
- Encoding library by "polygonplanet" (https://github.com/polygonplanet/encoding.js)
