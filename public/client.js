const socket = io()

let room = localStorage.getItem("room")

function createRoom(){

 socket.emit("createRoom")

}

socket.on("roomCreated",(id)=>{

 room=id

 localStorage.setItem("room",room)

 document.getElementById("roomCode").innerText =
 "Room Code: "+room

})

function joinRoom(){

 room = document.getElementById("room").value

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

socket.on("boardData",(board)=>{

 const boardDiv=document.getElementById("board")

 boardDiv.innerHTML=""

 board.forEach(row=>{

  row.forEach(cell=>{

   const div=document.createElement("div")

   div.className="cell"
   div.innerText=cell

   if(cell==="⭐"){
    div.classList.add("star")
   }

   div.onclick=()=>{
    div.classList.toggle("marked")
   }

   boardDiv.appendChild(div)

  })

 })

})