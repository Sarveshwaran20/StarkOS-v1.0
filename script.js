function runClockSystem() {
  const timeElement = document.getElementById("hud-time");
  const dateElement = document.getElementById("hud-date");
  const options = { weekday: "short", month: "short", day: "numeric" };

  setInterval(() => {
    const now = new Date();
    timeElement.innerText = now.toLocaleTimeString("en-US", { hour12: false });
    dateElement.innerText =
      now.toLocaleDateString("en-US", options).toUpperCase() + " // STARK OS";
  }, 1000);
}
runClockSystem();

let globalFocusIndex = 100;

function openWindow(id) {
  const targetWindow = document.getElementById(id);
  if (targetWindow) {
    targetWindow.style.display = "flex";
    focusWindow(targetWindow);
  }
}

function closeWindow(id) {
  const targetWindow = document.getElementById(id);
  if (targetWindow) {
    targetWindow.style.display = "none";
  }
}

function focusWindow(element) {
  globalFocusIndex++;
  element.style.zIndex = globalFocusIndex;
}

const draggableWindows = document.querySelectorAll(".stark-window");

draggableWindows.forEach((windowComponent) => {
  const headerZone = windowComponent.querySelector(".window-header");
  let draggingActive = false;
  let mouseStartX, mouseStartY;

  windowComponent.addEventListener("mousedown", () =>
    focusWindow(windowComponent),
  );

  headerZone.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("close-btn")) return;
    draggingActive = true;
    mouseStartX = event.clientX - windowComponent.offsetLeft;
    mouseStartY = event.clientY - windowComponent.offsetTop;
  });

  document.addEventListener("mousemove", (event) => {
    if (!draggingActive) return;
    windowComponent.style.left = `${event.clientX - mouseStartX}px`;
    windowComponent.style.top = `${event.clientY - mouseStartY}px`;
  });

  document.addEventListener("mouseup", () => {
    draggingActive = false;
  });
});

function toggleSidebar() {
  const sidebar = document.getElementById("desktop-sidebar");
  const toggleIcon = document.getElementById("toggle-icon");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    toggleIcon.innerText = ">>";
  } else {
    toggleIcon.innerText = "<<";
  }
}

const inputField = document.getElementById("jarvis-input");
const outputDisplay = document.getElementById("terminal-output");

const coreProtocols = {
  help: () =>
    displayLog(
      "PROTOCOLS AVAILABLE: open logs, open media, open schematics, close all, clear, diagnostic",
    ),
  diagnostic: () => displayLog("SYSTEM INTEGRITY: 100%. ARC REACTOR: STABLE."),
  clear: () => (outputDisplay.innerHTML = ""),
  "open logs": () => {
    openWindow("notes-window");
    displayLog("LAUNCHING ENCRYPTED LOG MODULE...");
  },
  "open media": () => {
    openWindow("video-window");
    displayLog("ESTABLISHING RECON SATELLITE VIDEO FEED...");
  },
  "open schematics": () => {
    openWindow("photo-window");
    displayLog("UPLINKING SCHEMATIC LOADER...");
  },
  "close all": () => {
    closeWindow("notes-window");
    closeWindow("photo-window");
    closeWindow("video-window");
    displayLog("TERMINATED ALL EXTRA VEHICULAR WINDOW PROCESSES.");
  },
};

function displayLog(text) {
  const messageLine = document.createElement("div");
  messageLine.style.marginTop = "6px";
  messageLine.innerText = text;
  outputDisplay.appendChild(messageLine);
  outputDisplay.scrollTop = outputDisplay.scrollHeight;
}

inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const executedCommand = inputField.value.toLowerCase().trim();
    if (!executedCommand) return;

    inputField.value = "";
    const inputEcho = document.createElement("div");
    inputEcho.style.opacity = "0.5";
    inputEcho.style.marginTop = "12px";
    inputEcho.innerText = `> ${executedCommand}`;
    outputDisplay.appendChild(inputEcho);

    if (coreProtocols[executedCommand]) {
      coreProtocols[executedCommand]();
    } else {
      displayLog(`ERR: UNRECOGNIZED SYSTEM CODE '${executedCommand}'.`);
    }
    outputDisplay.scrollTop = outputDisplay.scrollHeight;
  }
});

const logsTextarea = document.getElementById("stark-notes");
if (localStorage.getItem("starkOS_Logs")) {
  logsTextarea.value = localStorage.getItem("starkOS_Logs");
}
logsTextarea.addEventListener("input", () => {
  localStorage.setItem("starkOS_Logs", logsTextarea.value);
});

function downloadLogs() {
  const textContent = document.getElementById("stark-notes").value;

  if (!textContent.trim()) {
    displayLog("ERR: LOG IS EMPTY. CANNOT EXPORT.");
    return;
  }

  const textBlob = new Blob([textContent], { type: "text/plain" });
  const blobUrl = URL.createObjectURL(textBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = blobUrl;
  downloadLink.download = "stark_mainframe_log.txt";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(blobUrl);

  displayLog("LOG SUCCESSFULLY EXPORTED TO LOCAL DRIVE.");
}

const schematicLoader = document.getElementById("local-image-loader");
const emptyStateMsg = document.getElementById("schematic-empty-state");
const canvasArea = document.getElementById("canvas-container");
const activeImg = document.getElementById("active-schematic-img");
const matrixFilterSelect = document.getElementById("matrix-filter-select");
const clearMarkersBtn = document.getElementById("clear-markers-btn");
const gameSelect = document.getElementById("game-select");
const mapSelect = document.getElementById("map-select");

const tacticalArchives = {
  csgo: {
    dust2: { name: "Dust II", url: "./Dust2.png" },
    mirage: { name: "Mirage", url: "./mirage.jpg" },
    inferno: { name: "Inferno", url: "./inferno.jpg" },
    nuke: { name: "Nuke", url: "./Nuke.jpg" },
  },
  codm: {
    crash: { name: "Crash", url: "./crash.jpg" },
    nuketown: { name: "Nuketown", url: "./nuketown.jpg" },
    crossfire: { name: "Crossfire", url: "./cross.jpg" },
    firingrange: { name: "Firing Range", url: "./firing.jpg" },
  },
};

schematicLoader.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  if (!selectedFile || !selectedFile.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    activeImg.src = loadEvent.target.result;
    emptyStateMsg.style.display = "none";
    canvasArea.style.display = "inline-block";

    matrixFilterSelect.disabled = false;
    clearMarkersBtn.disabled = false;

    clearActiveMarkers();
  };
  reader.readAsDataURL(selectedFile);
});

gameSelect.addEventListener("change", (e) => {
  const game = e.target.value;
  mapSelect.innerHTML = '<option value="">SELECT MAP...</option>';

  if (!game) {
    mapSelect.disabled = true;
    mapSelect.innerHTML = '<option value="">AWAITING GAME INPUT...</option>';
    return;
  }

  mapSelect.disabled = false;
  const maps = tacticalArchives[game];
  for (const mapKey in maps) {
    const option = document.createElement("option");
    option.value = mapKey;
    option.innerText = maps[mapKey].name;
    mapSelect.appendChild(option);
  }
});

mapSelect.addEventListener("change", (e) => {
  const mapKey = e.target.value;
  const gameKey = gameSelect.value;
  if (!mapKey || !gameKey) return;

  activeImg.src = tacticalArchives[gameKey][mapKey].url;
  emptyStateMsg.style.display = "none";
  canvasArea.style.display = "inline-block";
  matrixFilterSelect.disabled = false;
  clearMarkersBtn.disabled = false;
  clearActiveMarkers();
  mapSelect.value = "";
});

matrixFilterSelect.addEventListener("change", (e) => {
  activeImg.className = "";
  const currentVal = e.target.value;
  if (currentVal !== "none") {
    activeImg.classList.add(`filter-${currentVal}`);
  }
});

canvasArea.addEventListener("click", (event) => {
  if (
    event.target.classList.contains("hud-marker") ||
    event.target.closest(".hud-marker-label")
  )
    return;

  const bounds = canvasArea.getBoundingClientRect();
  const clickX = event.clientX - bounds.left;
  const clickY = event.clientY - bounds.top;

  const userAnnotation = prompt("ENTER COMPONENT TAC-DATA / NODE NAME:");
  if (!userAnnotation) return;

  const pinMarker = document.createElement("div");
  pinMarker.className = "hud-marker";
  pinMarker.style.left = `${clickX}px`;
  pinMarker.style.top = `${clickY}px`;

  const pinLabel = document.createElement("div");
  pinLabel.className = "hud-marker-label";
  pinLabel.innerText = userAnnotation.toUpperCase();

  pinMarker.appendChild(pinLabel);
  canvasArea.appendChild(pinMarker);
});

clearMarkersBtn.addEventListener("click", clearActiveMarkers);

function clearActiveMarkers() {
  const currentMarkers = canvasArea.querySelectorAll(".hud-marker");
  currentMarkers.forEach((m) => m.remove());
}

const contextMenu = document.getElementById("context-menu");

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();

  contextMenu.style.display = "flex";

  const menuWidth = contextMenu.offsetWidth;
  const menuHeight = contextMenu.offsetHeight;

  let posX = event.clientX;
  let posY = event.clientY;

  if (posX + menuWidth > window.innerWidth) {
    posX = window.innerWidth - menuWidth - 10;
  }

  if (posY + menuHeight > window.innerHeight) {
    posY = window.innerHeight - menuHeight - 10;
  }

  contextMenu.style.left = `${posX}px`;
  contextMenu.style.top = `${posY}px`;
});

document.addEventListener("click", (event) => {
  if (event.button !== 2) {
    contextMenu.style.display = "none";
  }
});

window.addEventListener("load", () => {
  const bootScreen = document.getElementById("boot-screen");
  const bootText = document.getElementById("boot-text");

  const bootSteps = [
    "INITIALIZING STARK OS KERNEL...",
    "ESTABLISHING SECURE CONNECTION...",
    "BYPASSING MAINFRAME ENCRYPTION...",
    "ARC REACTOR ONLINE. CAPACITY 100%.",
    "WELCOME BACK, SIR.",
  ];

  let delay = 0;

  bootSteps.forEach((step, index) => {
    setTimeout(() => {
      bootText.innerHTML += `<div>> ${step}</div>`;
    }, delay);
    delay += 600;
  });

  setTimeout(() => {
    bootScreen.style.opacity = "0";
    setTimeout(() => {
      bootScreen.style.display = "none";
    }, 500);
  }, delay + 1000);
});

function closeImageViewer() {
  document.getElementById("image-viewer-modal").style.display = "none";
  document.getElementById("viewer-img").src = "";
}

function initializeWeatherSystem() {
  const weatherDisplay = document.getElementById("hud-weather");

  if (!navigator.geolocation) {
    weatherDisplay.innerText = "ERR: SATELLITE LINK UNAVAILABLE";
    return;
  }

  function fetchWeatherData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const apiKey = "b27a65c44a73a52ecf72f50c632be1ac";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) throw new Error("API_AUTH_ERR");
        return response.json();
      })
      .then((data) => {
        const temp = Math.round(data.main.temp);
        const conditionText = data.weather[0].description.toUpperCase();
        const cityName = data.name.toUpperCase();

        weatherDisplay.innerText = `LOC: ${cityName} // TEMP: ${temp}°C // ${conditionText}`;

        triggerWelcomeSequence(cityName);
      })
      .catch((error) => {
        weatherDisplay.innerText =
          "ERR: METEOROLOGICAL DATA CORRUPT (CHECK API KEY)";
      });
  }

  function locationError() {
    weatherDisplay.innerText = "ERR: SATELLITE UPLINK DENIED";
  }

  navigator.geolocation.getCurrentPosition(fetchWeatherData, locationError);
}

function triggerWelcomeSequence(locationName) {
  const outputDisplay = document.getElementById("terminal-output");
  if (!outputDisplay) return;

  const welcomeHeader = document.createElement("div");
  welcomeHeader.style.color = "#00f3ff";
  welcomeHeader.style.marginTop = "15px";
  welcomeHeader.style.borderTop = "1px dashed rgba(0, 243, 255, 0.3)";
  welcomeHeader.style.paddingTop = "10px";
  welcomeHeader.innerText = `[RECON LINK ACTIVE] SECURITY CLEARED FOR DETECTED HUB: ${locationName}`;

  const welcomeMessage = document.createElement("div");
  welcomeMessage.style.color = "#ff3333";
  welcomeMessage.style.textShadow = "0 0 8px #ff3333";
  welcomeMessage.innerText =
    ">> J.A.R.V.I.S.: WELCOME BACK TO THE MAINFRAME, SIR. ALL LOGISTICS ARCHIVES ARE ONLINE.";

  outputDisplay.appendChild(welcomeHeader);
  outputDisplay.appendChild(welcomeMessage);
  outputDisplay.scrollTop = outputDisplay.scrollHeight;
}

setTimeout(initializeWeatherSystem, 2000);
