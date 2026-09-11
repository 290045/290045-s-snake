const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");
const uiOverlay = document.getElementById("ui-overlay");
const menuTitle = document.getElementById("menu-title");
const menuText = document.getElementById("menu-text");
const playBtn = document.getElementById("play-btn");

const gridSize = 35; 
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 1, dy = 0;
let nextDx = 1, nextDy = 0;
let score = 0, highscore = 0;
let isPlaying = false;
let lastLogicTime = 0;
const logicInterval = 140; 
let stars = [];

for(let i=0; i<40; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
    });
}

resetGameData();
generateFood();
requestAnimationFrame(gameLoop);
playBtn.addEventListener("click", handleMenuClick);

function resetGameData() {
    snake = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
    dx = 1; dy = 0; nextDx = 1; nextDy = 0;
    score = 0; scoreElement.innerText = score;
}

function handleMenuClick() {
    uiOverlay.classList.add("hidden");
    resetGameData();
    generateFood();
    isPlaying = true;
    lastLogicTime = performance.now();
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    if (isPlaying) {
        const elapsed = currentTime - lastLogicTime;
        if (elapsed >= logicInterval) {
            updateLogic();
            lastLogicTime = currentTime - (elapsed % logicInterval);
        }
        const interpolationProgress = (currentTime - lastLogicTime) / logicInterval;
        draw(interpolationProgress);
    } else {
        draw(0);
    }
}

function updateLogic() {
    dx = nextDx; dy = nextDy;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return gameOver();
    for (let cell of snake) {
        if (head.x === cell.x && head.y === cell.y) return gameOver();
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.innerText = score;
        if (score > highscore) { highscore = score; highscoreElement.innerText = highscore; }
        generateFood();
    } else {
        snake.pop();
    }
}

function drawBackground() {
    ctx.fillStyle = "#050512"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.alpha += (Math.random() - 0.5) * 0.05;
        star.alpha = Math.max(0.2, Math.min(1, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function draw(progress) {
    drawBackground();
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    ctx.shadowBlur = 15; ctx.shadowColor = "#00E5FF";
    ctx.beginPath(); ctx.arc(centerX, centerY, gridSize / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00E5FF"; ctx.fill(); ctx.shadowBlur = 0;

    snake.forEach((cell, index) => {
        let currentX = cell.x, currentY = cell.y;
        if (isPlaying) {
            if (index === 0) {
                currentX = (cell.x - dx) + (dx * progress); currentY = (cell.y - dy) + (dy * progress);
            } else {
                const prev = snake[index - 1];
                currentX = cell.x + (prev.x - cell.x) * (progress - 1); currentY = cell.y + (prev.y - cell.y) * (progress - 1);
            }
        }
        const renderX = currentX * gridSize, renderY = currentY * gridSize;
        if (index === 0) {
            ctx.fillStyle = "#7C4DFF"; ctx.beginPath(); ctx.arc(renderX + gridSize/2, renderY + gridSize/2, gridSize/2, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = index % 2 === 0 ? "#651FFF" : "#7C4DFF";
            ctx.beginPath(); ctx.roundRect(renderX + 3, renderY + 3, gridSize - 6, gridSize - 6, 8); ctx.fill();
        }
    });
}

function generateFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * tileCount); food.y = Math.floor(Math.random() * tileCount);
        valid = true;
        for (let cell of snake) { if (cell.x === food.x && cell.y === food.y) valid = false; }
    }
}

function gameOver() {
    isPlaying = false;
    menuTitle.innerText = "MISSION FAILED"; menuTitle.style.color = "#FF1744";
    menuText.innerText = `Final Cargo Collected: ${score}`; playBtn.innerText = "RESPAWN";
    uiOverlay.classList.remove("hidden");
}

window.addEventListener("keydown", e => {
    if (!isPlaying && (e.key === " " || e.key === "Enter")) return handleMenuClick();
    switch (e.key.toLowerCase()) {
        case "arrowup": case "w": if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
        case "arrowdown": case "s": if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
        case "arrowleft": case "a": if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
        case "arrowright": case "d": if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    }
});
