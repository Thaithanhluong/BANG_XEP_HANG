let timeLeft = 150;
let timerId = null;
let totalDuration = 150;

const STORAGE_KEY = "orc-2026-leaderboard";
const countdownEl = document.getElementById("countdown");
const progressBar = document.getElementById("progress-bar");
const scoreTotalEl = document.getElementById("score-total");
const scoreInputs = document.querySelectorAll(".score-input");
const scoreResetButton = document.getElementById("score-reset");
const podiumEl = document.getElementById("podium");
const leaderboardBodyEl = document.getElementById("leaderboard-body");
const teamNameInput = document.getElementById("team-name");
const teamScoreInput = document.getElementById("team-score");
const teamTimeInput = document.getElementById("team-time");
const saveResultButton = document.getElementById("save-result");
const resultMessageEl = document.getElementById("result-message");

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

let leaderboardData = loadLeaderboard();

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function timeToSeconds(timeValue) {
    const [minutes = "0", seconds = "0"] = timeValue.split(":");
    return Number(minutes) * 60 + Number(seconds);
}

function normalizeTimeInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function completeTimeInput(value) {
    const digits = value.replace(/\D/g, "").padStart(4, "0").slice(-4);
    const minutes = digits.slice(0, 2);
    const seconds = Math.min(Number(digits.slice(2)), 59).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
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

function createAvatar(teamName, className) {
    const avatar = document.createElement("span");
    const color = avatarPalette[getStablePaletteIndex(teamName)];

    avatar.className = `team-avatar ${className}`;
    avatar.dataset.team = teamName;
    avatar.textContent = getTeamInitial(teamName);
    avatar.style.setProperty("--avatar-bg", color);
    avatar.setAttribute("title", teamName);
    avatar.setAttribute("aria-hidden", "true");

    return avatar;
}

function getSortedLeaderboard() {
    return [...leaderboardData].sort((firstTeam, secondTeam) => {
        if (secondTeam.score !== firstTeam.score) {
            return secondTeam.score - firstTeam.score;
        }

        return timeToSeconds(firstTeam.time) - timeToSeconds(secondTeam.time);
    });
}

function loadLeaderboard() {
    try {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(savedData)) {
            return [];
        }

        return savedData
            .filter((team) => team && typeof team.name === "string")
            .map((team) => ({
                name: team.name.trim(),
                score: Math.max(0, Math.floor(Number(team.score) || 0)),
                time: /^\d{2}:\d{2}$/.test(team.time) ? team.time : "00:00",
            }))
            .filter((team) => team.name);
    } catch (error) {
        return [];
    }
}

function saveLeaderboard() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboardData));
}

function renderEmptyLeaderboard() {
    podiumEl.innerHTML = `
        <div class="empty-state">
            <span class="material-symbols-outlined">add_circle</span>
            <strong>Chưa có dữ liệu</strong>
            <span>Thêm kết quả đầu tiên để bắt đầu bảng xếp hạng.</span>
        </div>
    `;

    leaderboardBodyEl.innerHTML = `
        <div class="empty-row">
            Nhập tên đội, điểm số và thời gian ở khung bên trái.
        </div>
    `;
}

function createPodiumCard(team, rank) {
    const rankClass = rank === 1 ? "first" : rank === 2 ? "second" : "third";
    const card = document.createElement("article");
    card.className = `podium-card ${rankClass} podium-float`;

    const profile = document.createElement("div");
    profile.className = "podium-profile";
    profile.append(createAvatar(team.name, "podium-avatar"));

    const rankBadge = document.createElement("span");
    rankBadge.className = "rank-badge";
    rankBadge.textContent = rank;
    profile.append(rankBadge);

    const copy = document.createElement("div");
    copy.className = "podium-copy";

    const name = document.createElement("p");
    name.className = "team-name";
    name.textContent = team.name;

    const score = document.createElement("span");
    score.className = "score";
    score.textContent = team.score.toLocaleString("vi-VN");

    copy.append(name, score);

    const block = document.createElement("div");
    block.className = "podium-block";
    block.innerHTML = `<span>#${rank}</span>`;

    card.append(profile, copy, block);
    return card;
}

function renderPodium(sortedData) {
    const podiumOrder = [sortedData[1], sortedData[0], sortedData[2]];
    const rankOrder = [2, 1, 3];

    podiumEl.innerHTML = "";
    podiumEl.classList.toggle("podium-single", sortedData.length === 1);
    podiumEl.classList.toggle("podium-pair", sortedData.length === 2);
    podiumOrder.forEach((team, index) => {
        if (team) {
            podiumEl.append(createPodiumCard(team, rankOrder[index]));
        }
    });
}

function fillResultForm(team) {
    teamNameInput.value = team.name;
    teamScoreInput.value = team.score;
    teamTimeInput.value = team.time;
    resultMessageEl.textContent = `Đang sửa kết quả của ${team.name}.`;
}

function createTableRow(team, rank) {
    const row = document.createElement("button");
    row.className = `table-row${rank === 1 ? " leader" : ""}`;
    row.type = "button";
    row.addEventListener("click", () => fillResultForm(team));

    const rankCell = document.createElement("div");
    rankCell.className = "rank-cell";
    rankCell.innerHTML = `<span class="rank-accent"></span><span class="table-rank">#${rank}</span>`;

    const teamCell = document.createElement("div");
    teamCell.className = "table-team";
    const teamName = document.createElement("span");
    teamName.textContent = team.name;
    teamCell.append(createAvatar(team.name, "table-avatar"), teamName);

    const scoreCell = document.createElement("div");
    scoreCell.className = "mono table-score";
    scoreCell.textContent = team.score.toLocaleString("vi-VN");

    const timeCell = document.createElement("div");
    timeCell.className = "mono text-right text-[#667085]";
    timeCell.textContent = team.time;

    row.append(rankCell, teamCell, scoreCell, timeCell);
    return row;
}

function renderLeaderboard() {
    const sortedData = getSortedLeaderboard();

    if (!sortedData.length) {
        renderEmptyLeaderboard();
        return;
    }

    renderPodium(sortedData);
    leaderboardBodyEl.innerHTML = "";
    sortedData.forEach((team, index) => {
        leaderboardBodyEl.append(createTableRow(team, index + 1));
    });
}

function setResultMessage(message) {
    resultMessageEl.textContent = message;
}

function upsertResult() {
    const name = teamNameInput.value.trim();
    const score = Math.max(0, Math.floor(Number(teamScoreInput.value) || 0));
    const time = completeTimeInput(teamTimeInput.value);

    if (!name) {
        setResultMessage("Vui lòng nhập tên đội.");
        teamNameInput.focus();
        return;
    }

    const existingIndex = leaderboardData.findIndex((team) => team.name.toLocaleLowerCase("vi-VN") === name.toLocaleLowerCase("vi-VN"));
    const result = { name, score, time };

    if (existingIndex >= 0) {
        leaderboardData[existingIndex] = result;
        setResultMessage(`Đã cập nhật kết quả của ${name}.`);
    } else {
        leaderboardData.push(result);
        setResultMessage(`Đã thêm ${name} vào bảng xếp hạng.`);
    }

    teamTimeInput.value = time;
    saveLeaderboard();
    renderLeaderboard();
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

teamTimeInput.addEventListener("input", () => {
    teamTimeInput.value = normalizeTimeInput(teamTimeInput.value);
});

teamTimeInput.addEventListener("blur", () => {
    if (teamTimeInput.value) {
        teamTimeInput.value = completeTimeInput(teamTimeInput.value);
    }
});

saveResultButton.addEventListener("click", upsertResult);

[teamNameInput, teamScoreInput, teamTimeInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            upsertResult();
        }
    });
});

updateUI();
updateScoreTotal();
renderLeaderboard();
