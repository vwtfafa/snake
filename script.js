const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const playerScoreDiv = document.getElementById("playerScore");
const leaderboardList = document.getElementById("leaderboardList");

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = "right";
let score = 0;
let gameInterval;
let playerName = "";

// Spiel starten
function startGame() {
    playerName = document.getElementById("playerNameInput").value.trim();
    if (!playerName) {
        alert("Bitte gib deinen Namen ein.");
        return;
    }

    startScreen.style.display = "none";
    canvas.style.display = "block";
    playerScoreDiv.style.display = "block";

    resetGame();
    gameInterval = setInterval(gameLoop, 150);
    fetchLeaderboard();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = "right";
    score = 0;
    food = generateFood();
    updateScore();
}

function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }
    clearCanvas();
    drawSnake();
    drawFood();
}

function moveSnake() {
    const head = { ...snake[0] };
    if (direction === "right") head.x++;
    if (direction === "left") head.x--;
    if (direction === "up") head.y--;
    if (direction === "down") head.y++;

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = generateFood();
        updateScore();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width / 20 ||
        head.y >= canvas.height / 20 ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        return true;
    }
    return false;
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / 20)),
        y: Math.floor(Math.random() * (canvas.height / 20)),
    };
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = "#00FF7F";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
}

function drawFood() {
    ctx.fillStyle = "#FF4500";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

function endGame() {
    clearInterval(gameInterval);
    gameOverScreen.style.display = "flex";
    sendScoreToServer();
}

function restartGame() {
    gameOverScreen.style.display = "none";
    startGame();
}

function updateScore() {
    playerScoreDiv.textContent = `Punkte: ${score}`;
}

function sendScoreToServer() {
    fetch("https://snakesever.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: score }),
    }).then(() => fetchLeaderboard());
}

function fetchLeaderboard() {
    fetch("https://snakesever.onrender.com/leaderboard")
        .then(response => response.json())
        .then(data => {
            leaderboardList.innerHTML = "";
            data.forEach(entry => {
                const listItem = document.createElement("li");
                listItem.textContent = `${entry.name}: ${entry.score}`;
                leaderboardList.appendChild(listItem);
            });
        });
}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "down") direction = "up";
    if (e.key === "ArrowDown" && direction !== "up") direction = "down";
    if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
    if (e.key === "ArrowRight" && direction !== "left") direction = "right";
});
