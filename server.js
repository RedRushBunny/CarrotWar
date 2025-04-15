const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
let players = new Map();

wss.on("connection", (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    players.set(id, { x: 400, y: 300, id, direction: { x: 0, y: 0 }, isFiring: false });

    // Отправляем клиенту его ID
    ws.send(JSON.stringify({ type: "init", id }));

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        const player = players.get(id);

        if (player) {
            player.direction = data.direction || { x: 0, y: 0 };
            player.isFiring = data.isFiring || false;
        }
    });

    ws.on("close", () => {
        players.delete(id);
    });
});

// Обновляем состояние игроков каждые 50 мс
setInterval(() => {
    players.forEach((player) => {
        // Обновляем позиции игроков на основе направления
        player.x += player.direction.x * 5;
        player.y += player.direction.y * 5;

        // Ограничиваем движение в пределах поля
        player.x = Math.max(0, Math.min(800, player.x));
        player.y = Math.max(0, Math.min(600, player.y));
    });

    // Рассылаем обновленное состояние всем клиентам
    const state = Array.from(players.values());
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "update", state }));
        }
    });
}, 50);