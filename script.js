function runClockSystem() {
  const timeElement = document.getElementById('hud-time');
  const dateElement = document.getElementById('hud-date');
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  
  setInterval(() => {
    const now = new Date();
    timeElement.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    dateElement.innerText = now.toLocaleDateString('en-US', options).toUpperCase() + ' // STARK OS';
  }, 1000);
}
runClockSystem();

let globalFocusIndex = 100;

function openWindow(id) {
  const targetWindow = document.getElementById(id);
  if (targetWindow) {
    targetWindow.style.display = 'flex';
    focusWindow(targetWindow);
  }
}

function closeWindow(id) {
  const targetWindow = document.getElementById(id);
  if (targetWindow) {
    targetWindow.style.display = 'none';
  }
}

function focusWindow(element) {
  globalFocusIndex++;
  element.style.zIndex = globalFocusIndex;
}

const draggableWindows = document.querySelectorAll('.stark-window');

draggableWindows.forEach(windowComponent => {
  const headerZone = windowComponent.querySelector('.window-header');
  let draggingActive = false;
  let mouseStartX, mouseStartY;

  windowComponent.addEventListener('mousedown', () => focusWindow(windowComponent));

  headerZone.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('close-btn')) return;
    draggingActive = true;
    mouseStartX = event.clientX - windowComponent.offsetLeft;
    mouseStartY = event.clientY - windowComponent.offsetTop;
  });

  document.addEventListener('mousemove', (event) => {
    if (!draggingActive) return;
    windowComponent.style.left = `${event.clientX - mouseStartX}px`;
    windowComponent.style.top = `${event.clientY - mouseStartY}px`;
  });

  document.addEventListener('mouseup', () => {
    draggingActive = false;
  });
});

const inputField = document.getElementById('jarvis-input');
const outputDisplay = document.getElementById('terminal-output');

const coreProtocols = {
  'help': () => displayLog('PROTOCOLS: open logs, open media, open schematics, play snake, protocol 84, close all, clear'),
  'diagnostic': () => displayLog('SYSTEM INTEGRITY: 100%. ARC REACTOR: STABLE.'),
  'clear': () => outputDisplay.innerHTML = '',
  'open logs': () => { openWindow('notes-window'); displayLog('LAUNCHING ENCRYPTED LOG MODULE...'); },
  'open media': () => { openWindow('video-window'); displayLog('ESTABLISHING RECON SATELLITE VIDEO FEED...'); },
  'open schematics': () => { openWindow('photo-window'); displayLog('UPLINKING SCHEMATIC LOADER...'); },
  'close all': () => {
    closeWindow('notes-window'); closeWindow('photo-window'); closeWindow('video-window'); closeWindow('snake-window');
    displayLog('TERMINATED ALL EXTRA VEHICULAR WINDOW PROCESSES.');
  },
  'avengers assemble': () => triggerEasterEgg(),
  'protocol 84': () => initiateSelfDestruct(),
  'play snake': () => { openWindow('snake-window'); startSnakeGame(); displayLog('NEURAL ARCADE ENGAGED. USE ARROW KEYS.'); }
};

function displayLog(text) {
  const messageLine = document.createElement('div');
  messageLine.style.marginTop = '6px';
  messageLine.innerText = text;
  outputDisplay.appendChild(messageLine);
  outputDisplay.scrollTop = outputDisplay.scrollHeight;
}

inputField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const executedCommand = inputField.value.toLowerCase().trim();
    if (!executedCommand) return;
    
    inputField.value = '';
    const inputEcho = document.createElement('div');
    inputEcho.style.opacity = '0.5';
    inputEcho.style.marginTop = '12px';
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

const logsTextarea = document.getElementById('stark-notes');
if (localStorage.getItem('starkOS_Logs')) {
  logsTextarea.value = localStorage.getItem('starkOS_Logs');
}
logsTextarea.addEventListener('input', () => {
  localStorage.setItem('starkOS_Logs', logsTextarea.value);
});

function downloadLogs() {
  const textContent = document.getElementById('stark-notes').value;
  
  if (!textContent.trim()) {
    displayLog('ERR: LOG IS EMPTY. CANNOT EXPORT.');
    return;
  }
  
  const textBlob = new Blob([textContent], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(textBlob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = 'stark_mainframe_log.txt';
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  URL.revokeObjectURL(blobUrl);
  
  displayLog('LOG SUCCESSFULLY EXPORTED TO LOCAL DRIVE.');
}

const schematicLoader = document.getElementById('local-image-loader');
const emptyStateMsg = document.getElementById('schematic-empty-state');
const canvasArea = document.getElementById('canvas-container');
const activeImg = document.getElementById('active-schematic-img');
const matrixFilterSelect = document.getElementById('matrix-filter-select');
const clearMarkersBtn = document.getElementById('clear-markers-btn');
const gameSelect = document.getElementById('game-select');
const mapSelect = document.getElementById('map-select');

const tacticalArchives = {
  'csgo': {
    'dust2': { name: 'Dust II', url: './dust2.jpg' },
    'mirage': { name: 'Mirage', url: './mirage.jpg' },
    'inferno': { name: 'Inferno', url: './inferno.jpg' },
    'nuke': { name: 'Nuke', url: './nuke.jpg' }
  },
  'codm': {
    'crash': { name: 'Crash', url: './crash.jpg' },
    'nuketown': { name: 'Nuketown', url: './nuketown.jpg' },
    'crossfire': { name: 'Crossfire', url: './crossfire.jpg' },
    'firingrange': { name: 'Firing Range', url: './firingrange.jpg' }
  }
};

if (schematicLoader) {
  schematicLoader.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      activeImg.src = loadEvent.target.result;
      emptyStateMsg.style.display = 'none';
      canvasArea.style.display = 'inline-block';
      
      matrixFilterSelect.disabled = false;
      clearMarkersBtn.disabled = false;
      
      clearActiveMarkers();
    };
    reader.readAsDataURL(selectedFile);
  });
}

if (gameSelect) {
  gameSelect.addEventListener('change', (e) => {
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
      const option = document.createElement('option');
      option.value = mapKey;
      option.innerText = maps[mapKey].name;
      mapSelect.appendChild(option);
    }
  });
}

if (mapSelect) {
  mapSelect.addEventListener('change', (e) => {
    const mapKey = e.target.value;
    const gameKey = gameSelect.value;
    if (!mapKey || !gameKey) return;

    activeImg.src = tacticalArchives[gameKey][mapKey].url;
    emptyStateMsg.style.display = 'none';
    canvasArea.style.display = 'inline-block';
    matrixFilterSelect.disabled = false;
    clearMarkersBtn.disabled = false;
    clearActiveMarkers();
    mapSelect.value = '';
  });
}

if (matrixFilterSelect) {
  matrixFilterSelect.addEventListener('change', (e) => {
    activeImg.className = '';
    const currentVal = e.target.value;
    if (currentVal !== 'none') {
      activeImg.classList.add(`filter-${currentVal}`);
    }
  });
}

if (canvasArea) {
  canvasArea.addEventListener('click', (event) => {
    if (event.target.classList.contains('hud-marker') || event.target.closest('.hud-marker-label')) return;

    const bounds = canvasArea.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;

    const userAnnotation = prompt("ENTER COMPONENT TAC-DATA / NODE NAME:");
    if (!userAnnotation) return;

    const pinMarker = document.createElement('div');
    pinMarker.className = 'hud-marker';
    pinMarker.style.left = `${clickX}px`;
    pinMarker.style.top = `${clickY}px`;

    const pinLabel = document.createElement('div');
    pinLabel.className = 'hud-marker-label';
    pinLabel.innerText = userAnnotation.toUpperCase();
    
    pinMarker.appendChild(pinLabel);
    canvasArea.appendChild(pinMarker);
  });
}

if (clearMarkersBtn) {
  clearMarkersBtn.addEventListener('click', clearActiveMarkers);
}

function clearActiveMarkers() {
  const currentMarkers = canvasArea.querySelectorAll('.hud-marker');
  currentMarkers.forEach(m => m.remove());
}

const contextMenu = document.getElementById('context-menu');

document.addEventListener('contextmenu', (event) => {
  event.preventDefault(); 
  
  contextMenu.style.display = 'flex';
  
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

document.addEventListener('click', (event) => {
  if (event.button !== 2) { 
    contextMenu.style.display = 'none';
  }
});

window.addEventListener('load', () => {
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  
  const bootSteps = [
    "INITIALIZING STARK OS KERNEL...",
    "ESTABLISHING SECURE CONNECTION...",
    "BYPASSING MAINFRAME ENCRYPTION...",
    "ARC REACTOR ONLINE. CAPACITY 100%.",
    "WELCOME BACK, SIR."
  ];

  let delay = 0;

  bootSteps.forEach((step) => {
    setTimeout(() => {
      bootText.innerHTML += `<div>> ${step}</div>`;
    }, delay);
    delay += 600; 
  });

  setTimeout(() => {
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      bootScreen.style.display = 'none';
    }, 500); 
  }, delay + 1000); 
});

function closeImageViewer() {
  document.getElementById('image-viewer-modal').style.display = 'none';
  document.getElementById('viewer-img').src = ''; 
}

function initializeWeatherSystem() {
  const weatherDisplay = document.getElementById('hud-weather');

  if (!navigator.geolocation) {
    weatherDisplay.innerText = "ERR: SATELLITE LINK UNAVAILABLE";
    return;
  }

  function fetchWeatherData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // API Key Injected from User Screenshot
    const apiKey = 'b27a65c44a73a52ecf72f50c632be1ac'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('API_AUTH_ERR');
        return response.json();
      })
      .then(data => {
        const temp = Math.round(data.main.temp);
        const conditionText = data.weather[0].description.toUpperCase();
        const cityName = data.name.toUpperCase();
        
        weatherDisplay.innerText = `LOC: ${cityName} // TEMP: ${temp}°C // ${conditionText}`;
        triggerWelcomeSequence(cityName);
      })
      .catch(error => {
        weatherDisplay.innerText = "ERR: METEOROLOGICAL DATA CORRUPT (CHECK API KEY)";
      });
  }

  function locationError() {
    weatherDisplay.innerText = "ERR: SATELLITE UPLINK DENIED";
  }

  navigator.geolocation.getCurrentPosition(fetchWeatherData, locationError);
}

function triggerWelcomeSequence(locationName) {
  const outputDisp = document.getElementById('terminal-output');
  if (!outputDisp) return;

  const welcomeHeader = document.createElement('div');
  welcomeHeader.style.color = 'var(--neon-pink)';
  welcomeHeader.style.marginTop = '15px';
  welcomeHeader.style.borderTop = '1px dashed var(--neon-purple)';
  welcomeHeader.style.paddingTop = '10px';
  welcomeHeader.innerText = `[RECON LINK ACTIVE] SECURITY CLEARED FOR DETECTED HUB: ${locationName}`;

  const welcomeMessage = document.createElement('div');
  welcomeMessage.style.color = 'var(--hacker-red)';
  welcomeMessage.style.textShadow = '0 0 8px var(--hacker-red)';
  welcomeMessage.innerText = ">> J.A.R.V.I.S.: WELCOME BACK TO THE MAINFRAME, SIR. ALL LOGISTICS ARCHIVES ARE ONLINE.";

  outputDisp.appendChild(welcomeHeader);
  outputDisp.appendChild(welcomeMessage);
  outputDisp.scrollTop = outputDisp.scrollHeight;
}

setTimeout(initializeWeatherSystem, 2000);

function triggerEasterEgg() {
  const art = `
             .-------.
           .'         '.
          /    / \\      \\
         |    /   \\      |
         |   /_____\\_____|____>
         |  /       \\    |
          \\ \\       /   /
           '.\\     /  .'
             '-------'
  `;
  const lines = art.split('\n');
  lines.forEach(line => {
    const artDiv = document.createElement('div');
    artDiv.style.color = 'var(--neon-pink)'; 
    artDiv.style.whiteSpace = 'pre';
    artDiv.style.fontWeight = 'bold';
    artDiv.innerText = line;
    outputDisplay.appendChild(artDiv);
  });
  displayLog(">> AVENGERS INITIATIVE PROTOCOL ACCEPTED.");
}

function initiateSelfDestruct() {
  displayLog(">> CRITICAL WARNING: PROTOCOL 84 ENGAGED.");
  document.body.classList.add('self-destruct-active');
  
  const overlay = document.getElementById('self-destruct-overlay');
  const counter = document.getElementById('sd-countdown');
  overlay.style.display = 'flex';
  
  let count = 10;
  const interval = setInterval(() => {
    count--;
    counter.innerText = count;
    if (count <= 0) {
      clearInterval(interval);
      document.body.innerHTML = `
        <div style="height: 100vh; width: 100vw; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--hacker-red); font-family: 'Rajdhani', monospace;">
          <h1 style="font-size: 4rem;">SYSTEM TERMINATED</h1>
          <p style="font-size: 1.5rem; margin-top: 20px; color: var(--neon-purple); cursor: pointer;" onclick="location.reload()">[ CLICK TO REBOOT MAINFRAME ]</p>
        </div>
      `;
      document.body.classList.remove('self-destruct-active');
    }
  }, 1000);
}

let snakeGameInterval;
function startSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('snake-score');
  const restartBtn = document.getElementById('snake-restart-btn');
  
  if (restartBtn) restartBtn.style.display = 'none';
  
  const gridSize = 20;
  let snake = [{x: 160, y: 160}];
  let dx = gridSize;
  let dy = 0;
  let appleX = 100;
  let appleY = 100;
  let score = 0;

  if (snakeGameInterval) clearInterval(snakeGameInterval);

  function randomTen(min, max) {
    return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
  }

  function spawnApple() {
    appleX = randomTen(0, canvas.width - gridSize);
    appleY = randomTen(0, canvas.height - gridSize);
  }

  function drawGame() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === appleX && head.y === appleY) {
      score += 10;
      scoreDisplay.innerText = `SCORE: ${score}`;
      spawnApple();
    } else {
      snake.pop(); 
    }

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || hasEatenItself(head)) {
      clearInterval(snakeGameInterval);
      ctx.fillStyle = "rgba(255, 0, 124, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "30px Rajdhani";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "20px Rajdhani";
      ctx.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
      
      if (restartBtn) restartBtn.style.display = 'inline-block';
      return;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff007c';
    ctx.fillRect(appleX, appleY, gridSize - 2, gridSize - 2);

    ctx.fillStyle = '#00ff66';
    snake.forEach(part => {
      ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    });
  }

  function hasEatenItself(head) {
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
  }

  document.onkeydown = (event) => {
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (event.key === 'ArrowLeft' && !goingRight) { dx = -gridSize; dy = 0; }
    if (event.key === 'ArrowUp' && !goingDown) { dx = 0; dy = -gridSize; }
    if (event.key === 'ArrowRight' && !goingLeft) { dx = gridSize; dy = 0; }
    if (event.key === 'ArrowDown' && !goingUp) { dx = 0; dy = gridSize; }
  };

  spawnApple();
  scoreDisplay.innerText = `SCORE: 0`;
  snakeGameInterval = setInterval(drawGame, 100);
}

const snakeRestartBtn = document.getElementById('snake-restart-btn');
if (snakeRestartBtn) {
  snakeRestartBtn.addEventListener('click', startSnakeGame);
}

const osSearch = document.getElementById('os-search');
if (osSearch) {
  osSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const query = osSearch.value.trim();
      
      if (query) {
        if (outputDisplay) {
          displayLog(`>> EXECUTING GLOBAL SEARCH PROTOCOL: '${query}'`);
        }
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        osSearch.value = '';
      }
    }
  });
}
