let timeLeft = 150;
let timerId = null;
let totalDuration = 150;

const countdownEl = document.getElementById("countdown");
const progressBar = document.getElementById("progress-bar");
const scoreTotalEl = document.getElementById("score-total");
const scoreInputs = document.querySelectorAll(".score-input");
const scoreResetButton = document.getElementById("score-reset");
const teamAvatars = document.querySelectorAll(".team-avatar");

const avatarPalette = [
    "#0056b3",
    "#00796b",
    "#7b1fa2",
    "#c2185b",
    "#d84315",
    "#2e7d32",
    "#3949ab",
    "#745043",
    "#006d77",
    "#8a6d00",
];

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function updateUI() {
    countdownEl.textContent = formatTime(timeLeft);
    const progress = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
    progressBar.style.width = `${progress}%`;

    countdownEl.classList.remove("timer-critical");
    countdownEl.style.color = "";

    if (timeLeft < 10) {
        countdownEl.classList.add("timer-critical");
    } else if (timeLeft < 30) {
        countdownEl.style.color = "#b54708";
    }

    if (timeLeft <= 0) {
        clearInterval(timerId);
        timerId = null;
        countdownEl.textContent = "00:00";
    }
}

function toggleTimer() {
    if (timerId) return;
    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateUI();
        }
    }, 1000);
    document.getElementById("btn-start").style.boxShadow = "0 0 0 5px rgba(6, 118, 71, 0.16)";
    document.getElementById("btn-pause").style.boxShadow = "";
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    document.getElementById("btn-start").style.boxShadow = "";
    document.getElementById("btn-pause").style.boxShadow = "0 0 0 5px rgba(181, 71, 8, 0.16)";
}

function resetTimer() {
    pauseTimer();
    timeLeft = 150;
    totalDuration = 150;
    updateUI();
    document.getElementById("btn-pause").style.boxShadow = "";
}

function addTime(seconds) {
    timeLeft = seconds;
    totalDuration = seconds;
    updateUI();
}

function switchTab(targetId) {
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
    });

    document.querySelectorAll("[data-tab-target]").forEach((tab) => {
        const isActive = tab.dataset.tabTarget === targetId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });
}

document.querySelectorAll("[data-tab-target]").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tabTarget));
});

function getTeamInitial(teamName) {
    const trimmedName = teamName.trim();
    return trimmedName ? trimmedName[0].toLocaleUpperCase("vi-VN") : "?";
}

function getStablePaletteIndex(value) {
    return Array.from(value).reduce((hash, char) => hash + char.charCodeAt(0), 0) % avatarPalette.length;
}

function initTeamAvatars() {
    teamAvatars.forEach((avatar) => {
        const teamName = avatar.dataset.team || avatar.textContent || "";
        const color = avatarPalette[getStablePaletteIndex(teamName)];
        avatar.textContent = getTeamInitial(teamName);
        avatar.style.setProperty("--avatar-bg", color);
        avatar.setAttribute("title", teamName);
    });
}

function updateScoreTotal() {
    const total = Array.from(scoreInputs).reduce((sum, input) => {
        const quantity = Math.max(0, Math.floor(Number(input.value) || 0));
        const scoreValue = Number(input.dataset.scoreValue) || 0;
        return sum + quantity * scoreValue;
    }, 0);

    scoreTotalEl.textContent = total.toLocaleString("vi-VN");
}

scoreInputs.forEach((input) => {
    input.addEventListener("input", updateScoreTotal);
});

scoreResetButton.addEventListener("click", () => {
    scoreInputs.forEach((input) => {
        input.value = "0";
    });
    updateScoreTotal();
});

updateUI();
updateScoreTotal();
initTeamAvatars();
