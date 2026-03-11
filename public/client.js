const socket = io();

// ดึงข้อมูลห้องจาก LocalStorage (ถ้ามี) เพื่อให้ตอนเปลี่ยนหน้าข้อมูลไม่หาย
let room = localStorage.getItem("room");

// --- ฟังก์ชันสำหรับปุ่มกด ---

function createRoom() {
    socket.emit("createRoom");
}

function joinRoom() {
    const roomInput = document.getElementById("room");
    if (roomInput) {
        room = roomInput.value;
        socket.emit("joinRoom", room);
        localStorage.setItem("room", room);
        document.getElementById("status").innerText = "Waiting host...";
    }
}

function startGame() {
    socket.emit("startGame", room);
}

// --- การรับข้อมูลจาก Server ---

socket.on("roomCreated", (id) => {
    room = id;
    localStorage.setItem("room", room);
    const roomCodeElem = document.getElementById("roomCode");
    if (roomCodeElem) roomCodeElem.innerText = "Room Code: " + room;
});

socket.on("gameStarted", () => {
    window.location.href = "/bingo.html";
});

// เมื่อเข้าหน้า bingo.html ให้ขอข้อมูลกระดานทันที
if (window.location.pathname === "/bingo.html") {
    socket.emit("joinRoom", room); // จอยห้องอีกครั้งเพื่อความชัวร์หลังเปลี่ยนหน้า
    socket.emit("getBoard", room);
}

// ฟังก์ชันหา Path รูปภาพ (อ้างอิงตามชื่อใน server.js)
function getImageUrl(name) {
    const people = ["Anan","Ben","Chai","Dom","Ek","Film","Guy","Hong","Ice","Jame","Ken","Leo","Max","Nat","Oak","Pete","Q","Rin","Som","Ton","Uan","Vee","Win","Xiang","Yut"];
    const fruits = ["Apple","Banana","Mango","Orange","Pineapple","Watermelon","Papaya","Strawberry","Grape","Coconut"];

    if (people.includes(name)) return `/img/people/${name.toLowerCase()}.png`;
    if (fruits.includes(name)) return `/img/fruits/${name.toLowerCase()}.png`;
    return "/img/default.png"; // รูปสำรองถ้าหาไม่เจอ
}

socket.on("boardData", (board) => {
    const boardDiv = document.getElementById("board");
    if (!boardDiv) return;
    
    boardDiv.innerHTML = "";

    board.forEach(row => {
        row.forEach(cell => {
            const div = document.createElement("div");
            div.className = "cell";

            if (cell === "⭐") {
                div.classList.add("star");
                div.innerText = "⭐";
            } else {
                // ส่วนของรูปภาพ
                const img = document.createElement("img");
                img.src = getImageUrl(cell);
                img.onerror = () => { img.style.display = 'none'; }; // ถ้าไม่มีไฟล์รูปให้ซ่อนไป

                // ส่วนของชื่อ
                const span = document.createElement("span");
                span.innerText = cell;

                div.appendChild(img);
                div.appendChild(span);
            }

            // คลิกเพื่อมาร์คช่อง
            div.onclick = () => {
                div.classList.toggle("marked");
            };

            boardDiv.appendChild(div);
        });
    });
});

socket.on("playerCount", (count) => {
    const playerDisplay = document.getElementById("playerCount");
    if (playerDisplay) {
        playerDisplay.innerText = count;
    }
});