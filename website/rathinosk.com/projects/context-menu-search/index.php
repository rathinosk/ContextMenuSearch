<?php 
// This is a simple PHP file that generates a static HTML page with information about the Context Menu Search extension.
// File Path: t:\source\ContextMenuSearch\website\rathinosk.com\projects\context-menu-search\index.php 
// Server Path: /projects/context-menu-search/index.php
// URL: https://rathinosk.com/projects/context-menu-search/index.php
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Context Menu Search Extension</title>
    <link rel="stylesheet" href="../css/projects.css">

    <script>
        /**
         * openModal
         * Opens the modal and displays the clicked image in full size.
         * 
         * @param {HTMLImageElement} img - The image element that was clicked.
         */
        function openModal(img) {
            try {
                var modal = document.getElementById("myModal");
                var modalImg = document.getElementById("img01");
                var captionText = document.getElementById("caption");
                modal.style.display = "block";
                modalImg.src = img.src;
                captionText.innerHTML = img.alt;
            } catch (error) {
                console.error("Error opening modal: ", error);
            }
        }

        /**
         * closeModal
         * Closes the modal.
         */
        function closeModal() {
            try {
                var modal = document.getElementById("myModal");
                modal.style.display = "none";
            } catch (error) {
                console.error("Error closing modal: ", error);
            }
        }
    </script>
</head>
<body>

    <header>
        <h1>Context Menu Search Extension</h1>
        <p>Your browser's context menu search made easy!</p>
    </header>

    <main>
        <section id="introduction">
            <!-- The Modal -->
            <div style="align-items: center; display: flex; justify-content: center;">
                <div id="myModal" class="modal" onclick="closeModal()">
                    <span class="close" onclick="closeModal()">&times;</span>
                    <img class="modal-content" id="img01">
                    <div id="caption"></div>
                </div>
            </div>

            <h2>Introduction</h2>
            <p>The Context Menu Search extension allows you to quickly search selected text using various search engines directly from the context menu (right-click menu) of your browser.</p>
        </section>

        <section id="screenshots">
            <h2>Screenshots</h2>
            <div style="display: flex; justify-content: center;">
                <div class="screenshot" style="margin-right: 10px; text-align: center;">
                    <img src="images/screenshot01.jpg" alt="Adding a Search Engine" width="320" height="200" onclick="openModal(this)">
                    <p>Adding a Search Engine</p>
                </div>
                <div class="screenshot" style="text-align: center;">
                    <img src="images/screenshot02.jpg" alt="Managing Search Engine Order" width="320" height="200" onclick="openModal(this)">
                    <p>Managing Search Engine Order</p>
                </div>
            </div>
        </section>

        <section id="features">
            <h2>Features</h2>
            <ul>
                <li>Add as many search engines as you need.</li>
                <li>Easy to use and configure.</li>
                <li>Increased performance and stability over the original plugin.</li>
                <li>Improved User Interface.</li>
                <li>Improved Configuration Management (Google Browser Sync coming soon!)</li>
                <li>Quickly add and remove search engines to your right-click menu.</li>
                <li>Choose from a selection of over 50 popular search engines.</li>
                <li>Open search results in a new tab, with options to open in the foreground or background, and customize tab placement.</li>
                <li>Effortlessly reorder your search engines within options screen.</li>
            </ul>
            <h3>Provided Search Engines:</h3>
            <ul>
                <li><b>Web Search:</b> Google, Ask, Bing Search, DuckDuckGo, Startpage, Ecosia, Yahoo! Japan, Yahoo! Search, Dogpile, Metacrawler, Wolfram Alpha, Reddit</li>
                <li><b>Development Search:</b> GitHub, Stack Overflow</li>
                <li><b>Image Search:</b> Google Images, Bing Images, flickr</li>
                <li><b>News:</b> Google News, Bing News, CNN, BBC World, Yahoo! News, The Guardian</li>
                <li><b>Social Search:</b> Facebook, X/Twitter, Bluesky, Instagram, Tumblr, Google Groups, Pinterest, Myspace</li>
                <li><b>Gaming Search:</b> Steam, Epic Games, GOG, Xbox Live, Sony PSN, Twitch</li>
                <li><b>Music &amp; Movies:</b> Spotify, Pandora, iTunes, Last.fm, Yahoo! Music, YouTube Music, Google Play Music, MTV, IMDb, Rotten Tomatoes</li>
                <li><b>Videos:</b> YouTube, Google Videos, Bing Videos, Metacafe, Vimeo</li>
                <li><b>Shopping:</b> E-bay US, Amazon US, Walmart, Target, Best Buy, Newegg, Google Products, Bing Shopping, Yahoo Shopping</li>
                <li><b>Other:</b> Archive.org, Wikipedia EN, Google Definition, Google Scholar</li>
            </ul>
        </section>

        <section id="manual">
            <h2>Manual</h2>
            <h3>Adding a Search Engine</h3>
            <ol>
                <li>Go to the extension options page.</li>
                <li>Click on "Add Search Engine".</li>
                <li>Enter the name of the search engine.</li>
                <li>Enter the URL of the search engine, replacing the search query with <code>%s</code>.</li>
                <li>Save the settings.</li>
            </ol>

            <h3>Using the Extension</h3>
            <ol>
                <li>Select the text you want to search.<br /></li>
                <li>Right-click on the selected text.<br /><br /><img src="images/base_menu.png" alt="Base Menu"><br /></li>
                <li>Choose the search engine from the context menu.<br /><br /><img src="images/context_menu.png" alt="Context Menu"><br /></li>
                <li>The search results will open in a new tab.</li>
            </ol>
        </section>
    </main>

    <br />
    <br />
    <br />
    <br />
    
    <footer>
        <p>&copy; <?php echo date("Y"); ?> Rathinosk. All rights reserved.</p>
    </footer>





</body>
</html>