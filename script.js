// Timer instellingen
const timerSettings = {
    time15: 15 * 60, // 15 minuten in seconden
    time25: 25 * 60, // 25 minuten in seconden
    shortBreak: 5 * 60 // 5 minuten in seconden
};

// Timer status
let timer = {
    mode: 'time25', // Standaard 25 minuten
    timeLeft: 0, // Standaard op 0 seconden zetten
    isRunning: false,
    interval: null,
    isCoffeeBreak: false, // Bijhouden of we in koffiepauze zitten
    focusTask: '' // Nieuwe property voor de focustaak
};

// DOM elementen selecteren
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.querySelector('.progress-container');
const time15Btn = document.getElementById('time-15');
const time25Btn = document.getElementById('time-25');
const activeTimeDisplay = document.getElementById('active-time');
const container = document.querySelector('.container');
const coffeeBtn = document.getElementById('coffee-btn');
const focusTaskElement = document.getElementById('focus-task');

// Event listeners toevoegen
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
progressContainer.addEventListener('click', handleProgressBarClick);
time15Btn.addEventListener('click', () => setTimerDuration('time15'));
time25Btn.addEventListener('click', () => setTimerDuration('time25'));
coffeeBtn.addEventListener('click', setUpCoffeeBreak);

// Tijdsduur instellen
function setTimerDuration(duration) {
    // Huidige timer stoppen
    pauseTimer();
    
    // Timer instellen
    timer.mode = duration;
    timer.timeLeft = timerSettings[duration];
    timer.isCoffeeBreak = false; // Reset koffiepauze status
    
    // Visuele updates
    if (duration === 'time15') {
        time15Btn.classList.add('active');
        time25Btn.classList.remove('active');
        activeTimeDisplay.textContent = "Gekozen tijd: 15 minuten";
        container.style.background = 'linear-gradient(135deg, #ffffff, #e6eef7)';
    } else {
        time15Btn.classList.remove('active');
        time25Btn.classList.add('active');
        activeTimeDisplay.textContent = "Gekozen tijd: 25 minuten";
        container.style.background = 'linear-gradient(135deg, #ffffff, #e6eef7)';
    }
    
    // Timer updaten
    updateTimer();
}

// Voortgangsbalk bijwerken
function updateProgressBar() {
    const totalTime = timerSettings[timer.mode];
    const percentage = (timer.timeLeft / totalTime) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Als we in koffiepauze zitten, Q-blauw kleur gebruiken
    if (timer.isCoffeeBreak) {
        progressBar.style.backgroundColor = '#1A2A56'; // Q-logo blauw
    } 
    // Anders, standaard Q-blauw gebruiken
    else {
        progressBar.style.backgroundColor = '#1A2A56'; // Q-logo blauw
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
    if (!timer.isRunning) {
        // Vervang de prompt met het modale venster
        if (!timer.focusTask && !timer.isCoffeeBreak) {
            showFocusModal();
            return;
        }
        
        // Rest van de startTimer functie blijft hetzelfde
        if (timer.timeLeft === 0) {
            timer.timeLeft = timerSettings[timer.mode];
        }
        
        timer.isRunning = true;
        startBtn.textContent = 'Bezig...';
        timer.interval = setInterval(() => {
            if (timer.timeLeft > 0) {
                timer.timeLeft--;
                updateTimer();
            }
            if (timer.timeLeft === 0) {
                pauseTimer();
                playAlarmSound();
                alert(`${timer.mode.charAt(0).toUpperCase() + timer.mode.slice(1)} afgerond!`);
            }
        }, 1000);
    }
}

// Timer pauzeren
function pauseTimer() {
    timer.isRunning = false;
    clearInterval(timer.interval);
    startBtn.textContent = 'Start'; // Zet de tekst terug naar 'Start'
    // Terugzetten van de originele titel
    document.title = "Pomodoro Timer";
}

// Timer resetten
function resetTimer() {
    pauseTimer();
    timer.timeLeft = timerSettings[timer.mode];
    timer.focusTask = ''; // Reset de focustaak
    focusTaskElement.innerHTML = ''; // Verwijder de focustaak tekst
    updateTimer();
    startBtn.textContent = 'Start';
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

// Koffie pauze instellen
function setUpCoffeeBreak() {
    // Stop de huidige timer
    pauseTimer();
    
    // Stel de timer in op 5 minuten
    timer.mode = 'shortBreak';
    timer.timeLeft = timerSettings.shortBreak; // 5 minuten in seconden
    timer.isCoffeeBreak = true; // Markeer als koffiepauze
    timer.focusTask = ''; // Reset de focustaak
    focusTaskElement.innerHTML = ''; // Verwijder de focustaak tekst
    
    // Update de timer weergave
    updateTimer();
    
    // Reset tijdknoppen actieve status
    time15Btn.classList.remove('active');
    time25Btn.classList.remove('active');
    activeTimeDisplay.textContent = "Actief profiel: Qoffie";
    
    // Update de container kleur naar een gradient met het Q-logo blauw
    container.style.background = 'linear-gradient(135deg, #ffffff, #1A2A56)';
}

// Nieuwe functies voor het modale venster
function showFocusModal() {
    const modal = document.getElementById('focus-modal');
    const focusInput = document.getElementById('focus-input');
    const confirmBtn = document.getElementById('confirm-focus');
    const cancelBtn = document.getElementById('cancel-focus');

    modal.style.display = 'flex';
    focusInput.focus();

    confirmBtn.onclick = () => {
        const task = focusInput.value.trim();
        if (task) {
            timer.focusTask = task;
            focusTaskElement.innerHTML = `<p class="focus-text">Focus taak: ${task}</p>`;
            modal.style.display = 'none';
            focusInput.value = '';
            startTimer();
        }
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        focusInput.value = '';
    };

    // Sluit het modale venster als er buiten wordt geklikt
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            focusInput.value = '';
        }
    };

    // Enter toets ondersteuning
    focusInput.onkeyup = (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        } else if (e.key === 'Escape') {
            cancelBtn.click();
        }
    };
}

// Initialiseer de timer
updateTimer(); 