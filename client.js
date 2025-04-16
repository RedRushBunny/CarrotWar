const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId = null;
let players = []; // Данные всех игроков
let direction = { x: 0, y: 0 }; // Направление движения
let isFiring = false; // Состояние стрельбы

// WebSocket connection
const socket = new WebSocket("ws://209.127.202.183:8080");

socket.addEventListener("open", () => {
    console.log("Connected to server");
});

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "init") {
        playerId = data.id;
    } else if (data.type === "update") {
        players = data.state; // Обновляем состояние всех игроков
    }
});

// Обработка нажатий клавиш
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") direction.y = -1;
    if (e.key === "ArrowDown") direction.y = 1;
    if (e.key === "ArrowLeft") direction.x = -1;
    if (e.key === "ArrowRight") direction.x = 1;
    if (e.key === " ") isFiring = true;

    // Отправляем данные на сервер
    socket.send(JSON.stringify({ direction, isFiring }));
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") direction.y = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") direction.x = 0;
    if (e.key === " ") isFiring = false;

    // Отправляем данные на сервер
    socket.send(JSON.stringify({ direction, isFiring }));
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем всех игроков
    players.forEach((player) => {
        ctx.fillStyle = player.id === playerId ? "blue" : "red";
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
