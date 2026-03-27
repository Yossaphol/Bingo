const socket = io();

// ดึงข้อมูลห้องจาก LocalStorage (ถ้ามี) เพื่อให้ตอนเปลี่ยนหน้าข้อมูลไม่หาย
let room = localStorage.getItem("room");

// --- [เพิ่ม] ส่วนจัดการหน้าแรก (OTP UI) ---
const roomInputs = document.querySelectorAll('.room-box');

if (roomInputs.length > 0) {
    roomInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < roomInputs.length - 1) {
                roomInputs[index + 1].focus();
                roomInputs[index + 1].classList.add('active');
                roomInputs[index].classList.remove('active');
            }
            // เมื่อกรอกครบ 4 ช่อง ให้ Join อัตโนมัติ
            const fullCode = Array.from(roomInputs).map(i => i.value).join('');
            if (fullCode.length === 4) {
                room = fullCode;
                socket.emit("joinRoom", room);
                localStorage.setItem("room", room);
                if(document.getElementById("status")) 
                    document.getElementById("status").innerText = "Waiting host...";
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
                roomInputs[index - 1].focus();
                roomInputs[index - 1].classList.add('active');
                roomInputs[index].classList.remove('active');
            }
        });
    });
}

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

// --- [เพิ่ม] Logic เช็คบิงโก (ใช้เก็บสถานะในหน้า Bingo) ---
let boardState = Array(5).fill().map(() => Array(5).fill(false));

function checkBingo() {
    // เช็คแถวนอนและตั้ง
    for (let i = 0; i < 5; i++) {
        if (boardState[i].every(c => c)) return true;
        if ([0,1,2,3,4].every(r => boardState[r][i])) return true;
    }
    // เช็คแนวทแยง
    if ([0,1,2,3,4].every(i => boardState[i][i])) return true;
    if ([0,1,2,3,4].every(i => boardState[i][4-i])) return true;
    return false;
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

// [เพิ่ม] รับข้อความ Error จาก server
socket.on("errorMsg", (msg) => {
    const statusP = document.getElementById("status");
    if (statusP) {
        statusP.innerText = msg;
        statusP.style.color = "red";
    }
});

// เมื่อเข้าหน้า bingo.html ให้ขอข้อมูลกระดานทันที
if (window.location.pathname === "/bingo.html") {
    socket.emit("joinRoom", room);
    socket.emit("getBoard", room);
}

// ฟังก์ชันหา Path รูปภาพ (อ้างอิงตามชื่อใน server.js)
function getImageUrl(name) {
    const people = [
        "P' Tangmo", "P' Pink", "P' Nice", "P' Siw", "P' Namo", "P' Benz", "P' You", 
        "P' Paul", "P' Mikey", "P' Pat", "P' Fourth", "P' Pimmy", "P' Dia", 
        "P' Pun", "P' Prima", "P' Ming", "P' Bowky", "P' Nam", "P' Note", 
        "P' Pam", "P' Monao", "P' Boy", "P' Kaowpod", "P' Phil", "P' Wha", "P' Ling"
    ];
    const index = people.indexOf(name);
    return index !== -1 ? `/img/people/${index + 1}.jpeg` : "/img/default.png";
}

socket.on("boardData", (board) => {
    const boardDiv = document.getElementById("board");
    if (!boardDiv) return;
    
    boardDiv.innerHTML = "";
    boardState = Array(5).fill().map(() => Array(5).fill(false)); // รีเซ็ตสถานะ

    board.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const div = document.createElement("div");
            div.className = "cell";

            if (cell === "⭐") {
                div.classList.add("star", "marked"); // ดาวต้อง marked แต่แรก
                div.innerText = "⭐";
                boardState[rIdx][cIdx] = true;
            } else {
                const img = document.createElement("img");
                img.src = getImageUrl(cell);
                img.onerror = () => { img.style.display = 'none'; };
                const span = document.createElement("span");
                span.innerText = cell;
                div.appendChild(img);
                div.appendChild(span);
            }

            // คลิกเพื่อมาร์คช่อง พร้อมเช็คบิงโก
            div.onclick = () => {
                const isMarked = div.classList.toggle("marked");
                boardState[rIdx][cIdx] = isMarked;

                if (checkBingo()) {
                    document.querySelector("h1").innerText = "🎉 BINGO! 🎉";
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // สั่นเบาๆ แทนเสียง
                } else {
                    document.querySelector("h1").innerText = "MD03 Rising Star Bingo";
                }
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