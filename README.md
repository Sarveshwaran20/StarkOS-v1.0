# StarkOS-v1.1


StarkOS is a browser-based, simulated operating system (WebTop) featuring a custom window manager and a functional command-line terminal. Built entirely from scratch using vanilla web technologies, it features a Cyberpunk/J.A.R.V.I.S. inspired aesthetic.

## Features

* **Custom Window Manager:** Draggable, glassmorphic application windows and a macOS-style floating dock for navigation.
* **Functional Terminal:** A command-line interface that controls the OS, launches apps, and triggers hidden protocols.
* **Integrated Applications:**
  * **Neural Snake:** A fully playable HTML5 Canvas arcade game with score tracking.
  * **Schematic Analyzer:** An interactive map viewer with holographic CSS filters and coordinate pin-dropping.
  * **Encrypted Logs:** A local text editor that utilizes JavaScript Blobs to export real `.txt` files to your machine.
* **Live APIs:** Integrates the HTML5 Geolocation API and OpenWeather API to display real-time local weather and city data on the central HUD.
* **Global Search:** A dock-integrated search bar that executes web queries in a new browser tab.

## Technologies Used

* **HTML5:** Canvas API and semantic structure.
* **CSS3:** Flexbox, backdrop-filters, and keyframe animations.
* **JavaScript (ES6+):** DOM manipulation, local storage, async API fetching, and game loops. (No external frameworks used).

## Setup & Installation

StarkOS runs entirely client-side. No server setup is required.

Terminal Commands
Open the Terminal app from the dock and type the following commands:

help - Lists available commands.

open logs - Opens the text editor.

open schematics - Opens the map analyzer.

open media - Opens the video player.

play snake - Launches the arcade game.

close all - Closes all open windows.

clear - Clears the terminal output.

protocol 84 - Initiates self-destruct sequence.

avengers assemble - Deploys the Avengers Initiative protocol.
