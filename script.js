// Timer instellingen
const timerSettings = {
    pomodoro: 25 * 60, // 25 minuten in seconden
    shortBreak: 5 * 60, // 5 minuten in seconden
    longBreak: 15 * 60 // 15 minuten in seconden
};

// Profielinstellingen
const profileSettings = {
    roel: {
        pomodoro: 25 * 60, // 25 minuten in seconden voor Roel
        shortBreak: 6 * 60, // 6 minuten in seconden
        longBreak: 15 * 60, // 15 minuten in seconden
        containerColor: 'linear-gradient(135deg, #ffffff, #e6eef7)', /* Wit naar lichtblauw */
        progressBarColor: '#1A2A56' /* Bijgewerkt naar Q-logo blauw */
    },
    jeroen: {
        pomodoro: 25 * 60, // 25 minuten in seconden voor Jeroen
        shortBreak: 5 * 60, // 5 minuten in seconden
        longBreak: 15 * 60, // 15 minuten in seconden
        containerColor: 'linear-gradient(135deg, #ffffff, #e6eef7)', /* Wit naar lichtblauw */
        progressBarColor: '#1A2A56' /* Bijgewerkt naar Q-logo blauw */
    }
};

// Timer status
let timer = {
    mode: 'pomodoro',
    timeLeft: 0, // Standaard op 0 seconden zetten in plaats van timerSettings.pomodoro
    isRunning: false,
    interval: null,
    isCoffeeBreak: false // Nieuwe eigenschap om bij te houden of we in koffiepauze zitten
};

// Actief profiel
let activeProfile = null;

// DOM elementen selecteren
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.querySelector('.progress-container');
const profileRoelBtn = document.getElementById('profile-roel');
const profileJeroenBtn = document.getElementById('profile-jeroen');
const activeProfileDisplay = document.getElementById('active-profile');
const container = document.querySelector('.container');
const coffeeBtn = document.getElementById('coffee-btn');

// Event listeners toevoegen
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
progressContainer.addEventListener('click', handleProgressBarClick);
profileRoelBtn.addEventListener('click', () => switchProfile('roel'));
profileJeroenBtn.addEventListener('click', () => switchProfile('jeroen'));
coffeeBtn.addEventListener('click', setUpCoffeeBreak);

// Voortgangsbalk bijwerken
function updateProgressBar() {
    const totalTime = timerSettings[timer.mode];
    const percentage = (timer.timeLeft / totalTime) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Als we in koffiepauze zitten, Q-blauw kleur gebruiken
    if (timer.isCoffeeBreak) {
        progressBar.style.backgroundColor = '#1A2A56'; // Bijgewerkt naar Q-logo blauw
    }
    // Anders, als er een actief profiel is, gebruik die kleur
    else if (activeProfile) {
        progressBar.style.backgroundColor = profileSettings[activeProfile].progressBarColor;
    } 
    // Anders, gebruik de standaardkleur (Q-logo blauw)
    else {
        progressBar.style.backgroundColor = '#1A2A56'; // Bijgewerkt naar Q-logo blauw
    }
}

// Timer updaten
function updateTimer() {
    const formattedTime = formatTime(timer.timeLeft);
    timeDisplay.textContent = formattedTime;
    
    // Update voortgangsbalk
    updateProgressBar();
    
    // Update pagina titel met huidige tijd
    if (timer.isRunning) {
        document.title = `(${formattedTime}) Pomodoro Timer`;
    } else {
        document.title = `Pomodoro Timer`;
    }
    
    if (timer.timeLeft === 0) {
        pauseTimer();
        if (timer.isRunning) { // Alleen geluid afspelen als timer actief was
            playAlarmSound();
            alert(`${timer.mode.charAt(0).toUpperCase() + timer.mode.slice(1)} afgerond!`);
        }
        // Reset niet automatisch uitvoeren als er geen timer actief was
    }
}

// Timer starten
function startTimer() {
    if (activeProfile === null && !timer.isCoffeeBreak) {
        alert("Selecteer eerst een profiel of kies voor een Cop koffie!");
        return;
    }
    
    if (!timer.isRunning) {
        // Alleen starten als er tijd over is
        if (timer.timeLeft > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                timer.timeLeft--;
                updateTimer();
            }, 1000);
        } else {
            alert("Stel eerst een timer in door een profiel te kiezen!");
        }
    }
}

// Timer pauzeren
function pauseTimer() {
    timer.isRunning = false;
    clearInterval(timer.interval);
    // Terugzetten van de originele titel
    document.title = "Pomodoro Timer";
}

// Timer resetten
function resetTimer() {
    pauseTimer();
    timer.timeLeft = timerSettings[timer.mode];
    // Als we niet in koffiepauze zijn, reset de isCoffeeBreak vlag
    if (!timer.isCoffeeBreak) {
        timer.isCoffeeBreak = false;
    }
    updateTimer();
}

// Wisselen tussen modes (pomodoro, korte pauze, lange pauze)
function switchMode(mode) {
    // Timer stoppen en resetten naar de nieuwe mode
    pauseTimer();
    timer.mode = mode;
    timer.timeLeft = timerSettings[mode];
    updateTimer();
}

// Tijd formatteren (seconden naar mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Klik op de voortgangsbalk verwerken
function handleProgressBarClick(e) {
    // Positie van de klik in de container bepalen
    const rect = progressContainer.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    
    // Nieuwe tijd berekenen op basis van klikpositie
    // 1-clickPosition om de richting om te keren (links = bijna afgelopen, rechts = volle tijd)
    const totalTime = timerSettings[timer.mode];
    const newTime = Math.round(totalTime * (1-clickPosition));
    
    // Timer updaten met de nieuwe tijd
    timer.timeLeft = newTime;
    updateTimer();
    
    // Als de timer al draaide, blijf doorgaan
    if (timer.isRunning) {
        pauseTimer(); // Stop de huidige timer
        startTimer(); // Start opnieuw met de nieuwe tijd
    }
}

// Alarmsignaal afspelen
function playAlarmSound() {
    // Eenvoudige pieptoon afspelen
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
}

// Profiel wisselen
function switchProfile(profile) {
    // Huidige timer stoppen
    pauseTimer();
    
    // Profiel updaten
    activeProfile = profile;
    timer.isCoffeeBreak = false; // Reset koffiepauze status
    
    // Visuele updates voor profiel
    if (profile === 'roel') {
        profileRoelBtn.classList.add('active');
        profileJeroenBtn.classList.remove('active');
        activeProfileDisplay.textContent = "Actief profiel: Roel";
        container.style.background = profileSettings.roel.containerColor;
    } else {
        profileRoelBtn.classList.remove('active');
        profileJeroenBtn.classList.add('active');
        activeProfileDisplay.textContent = "Actief profiel: Jeroen";
        container.style.background = profileSettings.jeroen.containerColor;
    }
    
    // Timer instellingen updaten
    Object.keys(timerSettings).forEach(key => {
        timerSettings[key] = profileSettings[profile][key];
    });
    
    // Timer resetten naar nieuwe instellingen
    timer.timeLeft = timerSettings[timer.mode]; // Nu wordt tijd van profiel ingesteld
    updateTimer();
}

// Koffie pauze instellen
function setUpCoffeeBreak() {
    // Stop de huidige timer
    pauseTimer();
    
    // Stel de timer in op 5 minuten
    timer.mode = 'shortBreak';
    timer.timeLeft = 5 * 60; // 5 minuten in seconden
    timer.isCoffeeBreak = true; // Markeer als koffiepauze
    
    // Update de timer weergave
    updateTimer();
    
    // Reset profielknoppen actieve status
    profileRoelBtn.classList.remove('active');
    profileJeroenBtn.classList.remove('active');
    activeProfileDisplay.textContent = "Actief profiel: Qoffie";
    
    // Update de container kleur naar een gradient met het Q-logo blauw
    container.style.background = 'linear-gradient(135deg, #ffffff, #1A2A56)';
}

// Initialiseer de timer
updateTimer(); 