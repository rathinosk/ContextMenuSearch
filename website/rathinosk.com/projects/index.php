<?php
// This is a simple PHP file that generates a static HTML page with a list of projects.
// File Path: t:\source\GameStation56\website\rathinosk.com\projects\index.php
// Server Path: /projects/index.php
// URL: https://rathinosk.com/projects/index.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rathinosk's Projects</title>
    <link rel="stylesheet" href="css/projects.css">
</head>
<body>

    <header>
        <h1>Rathinosk's Development Projects</h1>
    </header>

    <main>
        <section class="project">
            <h2>Game Station 56</h2>
            <p>Game Station 56  a private gaming community where members enjoy a curated selection of multiplayer games, including Minecraft and other titles chosen by the community.</p>
            <a href="https://gs56.org/">View Project</a>
        </section>

        <section class="project">
            <h2>Context Menu Search Chrome Plugin</h2>
            <p>Context Menu Search is a Chrome extension that allows users to search selected text using a variety of search engines, including Google, Bing, and DuckDuckGo.</p>
            <a href="./context-menu-search">View Project</a>
        </section>

        <!-- Add more project sections as needed -->
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Rathinosk. All rights reserved.</p>
    </footer>

</body>
</html>