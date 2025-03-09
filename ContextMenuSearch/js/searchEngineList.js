/** searchEngineList.js
 * 
 * This file contains the list of search engines that are displayed on the options page.
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
 * generateSearchEngineList
 * Generate the list of search engines and display them on the options page.
 * 
 * To add a new search engine, add a new object to the searchEngines array.
 * The object should have the following properties:
 * - category: The category of the search engine. This will be displayed as a heading. 
 *      If the category is the same as the previous search engine, it will not be displayed again.
 *      If the category is different, a new heading will be displayed.
 *
 * - name: The name of the search engine. This will be displayed as a label.
 * 
 * - link: The search URL definitions follow the same pattern as the search URL in the user options.
 * 
 *   The search URL for the search engine. Replace the search term with "TESTSEARCH" or "%s" depending on the search engine.
 *   When the user performs a search, "TESTSEARCH" will be replaced with the actual search term.
 *   If the search requires no URL encoding, use "NOENCODESEARCH" instead of "TESTSEARCH".
 */
function generateSearchEngineList() {
    const searchEngines = [
        { category: "Web search", name: "Google", link: "http://www.google.com/search?q=TESTSEARCH" },
        { category: "Web search", name: "Ask", link: "http://www.ask.com/web?q=TESTSEARCH" },
        { category: "Web search", name: "Bing Search", link: "http://www.bing.com/search?q=TESTSEARCH" },
        { category: "Web search", name: "DuckDuckGo", link: "https://duckduckgo.com/?q=TESTSEARCH" },
        { category: "Web search", name: "Startpage", link: "https://www.startpage.com/sp/search?q=TESTSEARCH" },
        { category: "Web search", name: "Ecosia", link: "https://www.ecosia.org/search?q=TESTSEARCH" },
        { category: "Web search", name: "Yahoo! Japan", link: "http://search.yahoo.co.jp/search?p=TESTSEARCH" },
        { category: "Web search", name: "Yahoo! Search", link: "http://search.yahoo.com/search?p=TESTSEARCH" },
        { category: "Web search", name: "Dogpile", link: "http://www.dogpile.com/dogpile/ws/results/Web/TESTSEARCH/1/417/TopNavigation/Relevance/iq=true/zoom=off/_iceUrlFlag=7?_IceUrl=true" },
        { category: "Web search", name: "Metacrawler", link: "http://www.metacrawler.com/metacrawler/ws/results/Web/TESTSEARCH/1/417/TopNavigation/Relevance/iq=true/zoom=off/_iceUrlFlag=7?_IceUrl=true" },
        { category: "Web search", name: "Wolfram Alpha", link: "http://www.wolframalpha.com/input/?i=TESTSEARCH" },
        { category: "Web search", name: "Reddit", link: "http://www.google.com/search?q=site:reddit.com+TESTSEARCH" },
        { category: "Music & Movies", name: "Spotify", link: "https://open.spotify.com/search/TESTSEARCH" },
        { category: "Music & Movies", name: "Pandora", link: "http://www.pandora.com/search/TESTSEARCH" },
        { category: "Music & Movies", name: "iTunes", link: "http://itunes.apple.com/us/album/TESTSEARCH" },
        { category: "Music & Movies", name: "Last.fm", link: "http://www.last.fm/search?q=TESTSEARCH" },
        { category: "Music & Movies", name: "Yahoo! Music", link: "http://new.music.yahoo.com/search/?p=TESTSEARCH" },
        { category: "Music & Movies", name: "YouTube Music", link: "https://music.youtube.com/search?q=TESTSEARCH" },
        { category: "Music & Movies", name: "Google Play Music", link: "https://play.google.com/store/search?q=TESTSEARCH" },
        { category: "Music & Movies", name: "MTV", link: "http://www.mtv.com/search/?q=TESTSEARCH" },
        { category: "Music & Movies", name: "IMDb", link: "http://www.imdb.com/find?s=all&q=TESTSEARCH" },
        { category: "Music & Movies", name: "Rotten Tomatoes", link: "http://www.rottentomatoes.com/search/full_search.php?search=TESTSEARCH" },
        { category: "Shopping", name: "E-bay US", link: "http://shop.ebay.com/?_nkw=TESTSEARCH&_sacat=See-All-Categories" },
        { category: "Shopping", name: "Amazon US", link: "http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=TESTSEARCH&x=0&y=0" },
        { category: "Shopping", name: "Walmart", link: "https://www.walmart.com/search?q=TESTSEARCH" },
        { category: "Shopping", name: "Target", link: "https://www.target.com/s?searchTerm=TESTSEARCH" },
        { category: "Shopping", name: "Best Buy", link: "http://www.bestbuy.com/site/searchpage.jsp?_dyncharset=ISO-8859-1&_dynSessConf=-3947329785467320985&id=pcat17071&type=page&st=TESTSEARCH&sc=Global&cp=1&nrp=15&sp=&qp=&list=n&iht=y&usc=All+Categories&ks=960" },
        { category: "Shopping", name: "Newegg", link: "http://www.newegg.com/Product/ProductList.aspx?Submit=ENE&DEPA=0&Order=BESTMATCH&Description=TESTSEARCH" },
        { category: "Shopping", name: "Craigslist", link: "http://www.google.com/search?q=site:craigslist.org+TESTSEARCH" },
        { category: "Shopping", name: "Lowes", link: "https://www.lowes.com/search?searchTerm=TESTSEARCH" },
        { category: "Shopping", name: "Home Depot", link: "https://www.homedepot.com/s/TESTSEARCH" },
        { category: "Shopping", name: "Google Products", link: "http://www.google.com/products?q=TESTSEARCH&aq=f" },
        { category: "Shopping", name: "Bing Shopping", link: "http://www.bing.com/shopping/search?q=TESTSEARCH&go=&form=QBRE" },
        { category: "Shopping", name: "Yahoo Shopping", link: "http://search.yahoo.com/search?vc=&p=TESTSEARCH" },
        { category: "Social Search", name: "Facebook", link: "http://www.facebook.com/#!/search/?q=TESTSEARCH" },
        { category: "Social Search", name: "X/Twitter", link: "https://x.com/search?q=TESTSEARCH&src=typed_query" },
        { category: "Social Search", name: "Bluesky", link: "https://bsky.app/search?q=TESTSEARCH" },
        { category: "Social Search", name: "Instagram", link: "http://instagram.com/TESTSEARCH" },
        { category: "Social Search", name: "Tumblr", link: "http://www.tumblr.com/search/TESTSEARCH" },
        { category: "Social Search", name: "Google Groups", link: "http://groups.google.com/groups/search?q=TESTSEARCH" },
        { category: "Social Search", name: "Pinterest", link: "http://pinterest.com/search/?q=TESTSEARCH" },
        { category: "Social Search", name: "Myspace", link: "http://searchservice.myspace.com/index.cfm?fuseaction=sitesearch.results&orig=search_Header&origpfc=FriendFinder&type=AllMySpace&qry=TESTSEARCH&submit=Search" },
        { category: "Image search", name: "Google Images", link: "http://www.google.com/images?q=TESTSEARCH" },
        { category: "Image search", name: "Bing Images", link: "http://www.bing.com/images/search?q=TESTSEARCH" },
        { category: "Image search", name: "Imgur", link: "http://imgur.com/search?q=TESTSEARCH" },
        { category: "Image search", name: "flickr", link: "http://www.flickr.com/search/?q=TESTSEARCH&w=all" },
        { category: "Image search", name: "500px", link: "https://500px.com/search?q=TESTSEARCH" },
        { category: "Image search", name: "deviantART", link: "http://www.deviantart.com/?q=TESTSEARCH" },
        { category: "News", name: "Google News", link: "http://news.google.com/news/search?q=TESTSEARCH" },
        { category: "News", name: "Bing News", link: "http://www.bing.com/news/search?q=TESTSEARCH&go=&form=QBLH&scope=news&filt=all&qs=n&sk=" },
        { category: "News", name: "CNN", link: "http://edition.cnn.com/search/?query=TESTSEARCH&primaryType=mixed&sortBy=date" },
        { category: "News", name: "BBC World", link: "http://search.bbc.co.uk/search?go=toolbar&uri=/&q=TESTSEARCH" },
        { category: "News", name: "Yahoo! News", link: "http://news.search.yahoo.com/search/news?p=TESTSEARCH" },
        { category: "News", name: "Techdirt", link: "https://www.techdirt.com/search/?q=TESTSEARCH" },
        { category: "News", name: "The Guardian", link: "http://www.guardian.co.uk/search?q=TESTSEARCH" },
        { category: "Other", name: "Archive.org", link: "https://archive.org/search.php?query=TESTSEARCH" },
        { category: "Other", name: "Wikipedia EN", link: "http://en.wikipedia.org/w/index.php?title=Special:Search&search=TESTSEARCH" },
        { category: "Other", name: "Google Definition", link: "http://www.google.com/search?hl=en&q=define:TESTSEARCH" },
        { category: "Other", name: "Google Scholar", link: "https://scholar.google.com/scholar?q=TESTSEARCH" },
        { category: "Development Search", name: "GitHub", link: "https://github.com/search?q=TESTSEARCH" },
        { category: "Development Search", name: "Stack Overflow", link: "https://stackoverflow.com/search?q=TESTSEARCH" },
        { category: "Development Search", name: "CodeProject", link: "https://www.codeproject.com/search.aspx?q=TESTSEARCH" },
        { category: "Development Search", name: "Visual Studio", link: "https://visualstudio.microsoft.com/search/?query=TESTSEARCH" },
        { category: "Gaming Search", name: "Steam", link: "https://store.steampowered.com/search/?term=TESTSEARCH" },
        { category: "Gaming Search", name: "Epic Games", link: "https://store.epicgames.com/en-US/search?q=TESTSEARCH" },
        { category: "Gaming Search", name: "GOG", link: "https://www.gog.com/en/games?query=TESTSEARCH" },
        { category: "Gaming Search", name: "Xbox Live", link: "https://www.xbox.com/en-US/search?q=TESTSEARCH" },
        { category: "Gaming Search", name: "Sony PSN", link: "https://store.playstation.com/en-us/search/TESTSEARCH" },
        { category: "Gaming Search", name: "Twitch", link: "https://www.twitch.tv/search?term=TESTSEARCH" },
        { category: "Videos", name: "YouTube", link: "http://www.youtube.com/results?search_query=TESTSEARCH" },
        { category: "Videos", name: "Google Videos", link: "http://www.google.com/search?q=TESTSEARCH&tbo=p&tbs=vid:1&source=vgc&hl=en&aq=f" },
        { category: "Videos", name: "Bing Videos", link: "http://www.bing.com/videos/search?q=TESTSEARCH" },
        { category: "Videos", name: "Metacafe", link: "http://www.metacafe.com/results/TESTSEARCH/" },
        { category: "Videos", name: "Vimeo", link: "http://vimeo.com/search?q=TESTSEARCH" },
    ];

    log("generateSearchEngineList: Generating search engine list.");
    log("-- Search Engine Count: " + searchEngines.length);

    let html = `
        <div class="contain">
            <input type="hidden" id="numoptions" value="${searchEngines.length}">
            <div id="searchEngineList">
    `;

    let currentCategory = null;

    for (let i = 0; i < searchEngines.length; i++) {
        const engine = searchEngines[i];

        if (engine.category !== currentCategory) {
            if (currentCategory !== null) {
                html += '</table></div>';
            }
            html += `<div class="left"><u>${engine.category}</u><table>`;
            currentCategory = engine.category;
        }

        html += `
            <tr>
                <td><input type="checkbox" id="s${i + 1}"></td>
                <td>${engine.name}
                    <input type="hidden" id="names${i + 1}" value="${engine.name}">
                    <input type="hidden" id="links${i + 1}" value="${engine.link}">
                </td>
            </tr>
        `;
    }

    html += '</table></div>';
    
    html += `
            </div>
            <div class="clear"></div>
            <button id="add_from_list">
                Add selected options
            </button>
            <br />
            <div id="status_addfromlist"></div>
        </div>
    `;

    log("generateSearchEngineList: Setting searchEngineList HTML");
    document.getElementById('searchEngineList').outerHTML = html;
}
