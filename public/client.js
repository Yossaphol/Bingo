const socket=io()

let room=localStorage.getItem("room")

function createRoom(){

socket.emit("createRoom")

}

socket.on("roomCreated",(id)=>{

room=id

localStorage.setItem("room",room)

document.getElementById("roomCode").innerText="Room: "+room

})

function joinRoom(){

room=document.getElementById("room").value

socket.emit("joinRoom",room)

localStorage.setItem("room",room)

document.getElementById("status").innerText="Waiting host..."

}

function startGame(){

socket.emit("startGame",room)

}

socket.on("gameStarted",()=>{

window.location.href="/bingo.html"

})

if(window.location.pathname==="/bingo.html"){

socket.emit("getBoard",room)

}

socket.on("boardData",(data)=>{

const board=data.board
const images=data.images

const boardDiv=document.getElementById("board")

boardDiv.innerHTML=""

board.forEach(row=>{

row.forEach(cell=>{

const div=document.createElement("div")

div.className="cell"

if(cell==="⭐"){

div.classList.add("star")

div.innerText="⭐"

}else{

const img=document.createElement("img")

img.src=images[cell]||"/img/default.png"

const name=document.createElement("span")

name.innerText=cell

div.appendChild(img)

div.appendChild(name)

}

div.onclick=()=>{

div.classList.toggle("marked")

checkBingo()

}

boardDiv.appendChild(div)

})

})

})

function checkBingo(){

const cells=[...document.querySelectorAll(".cell")]

const grid=[]

for(let i=0;i<5;i++){

grid.push(cells.slice(i*5,(i+1)*5))

}

const marked=c=>c.classList.contains("marked")||c.classList.contains("star")

for(let r=0;r<5;r++){

if(grid[r].every(marked)) return bingo()

}

for(let c=0;c<5;c++){

if(grid.every(row=>marked(row[c]))) return bingo()

}

if(grid.every((row,i)=>marked(row[i]))) return bingo()

if(grid.every((row,i)=>marked(row[4-i]))) return bingo()

}

function bingo(){

alert("🎉 BINGO!")

}

socket.on("playerCount",(count)=>{

const el=document.getElementById("players")

if(el) el.innerText=count

})