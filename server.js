const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

app.get("/healthz",(req,res)=>{
res.send("ok")
})

const rooms = {}

const people = [
"Anan","Ben","Chai","Dom","Ek","Film","Guy","Hong","Ice","Jame",
"Ken","Leo","Max","Nat","Oak","Pete","Q","Rin","Som","Ton",
"Uan","Vee","Win","X","Yut"
]

const fruits = [
"Apple","Banana","Mango","Orange","Pineapple",
"Watermelon","Papaya","Strawberry","Grape","Coconut"
]

const items = [...people,...fruits]

const images = {
Anan:"/img/anan.png",
Ben:"/img/ben.png",
Chai:"/img/default.png",
Dom:"/img/default.png",
Ek:"/img/default.png",
Film:"/img/default.png",
Guy:"/img/default.png",
Hong:"/img/default.png",
Ice:"/img/default.png",
Jame:"/img/default.png",
Ken:"/img/default.png",
Leo:"/img/default.png",
Max:"/img/default.png",
Nat:"/img/default.png",
Oak:"/img/default.png",
Pete:"/img/default.png",
Q:"/img/default.png",
Rin:"/img/default.png",
Som:"/img/default.png",
Ton:"/img/default.png",
Uan:"/img/default.png",
Vee:"/img/default.png",
Win:"/img/default.png",
X:"/img/default.png",
Yut:"/img/default.png"
}

function shuffle(arr){
return arr.sort(()=>Math.random()-0.5)
}

function generateBoard(){

const pool = shuffle([...items]).slice(0,24)

let i=0
const board=[]

for(let r=0;r<5;r++){

const row=[]

for(let c=0;c<5;c++){

if(r===2 && c===2){
row.push("⭐")
}else{
row.push(pool[i])
i++
}

}

board.push(row)

}

return board

}

function createRoomId(){
return Math.floor(1000+Math.random()*9000).toString()
}

io.on("connection",(socket)=>{

socket.on("createRoom",()=>{

const id=createRoomId()

rooms[id]={started:false}

socket.join(id)

socket.emit("roomCreated",id)

})

socket.on("joinRoom",(room)=>{

if(!rooms[room]){
socket.emit("errorMsg","Room not found")
return
}

socket.join(room)

const count=io.sockets.adapter.rooms.get(room)?.size || 0

io.to(room).emit("playerCount",count)

})

socket.on("startGame",(room)=>{

if(!rooms[room]) return

rooms[room].started=true

io.to(room).emit("gameStarted")

})

socket.on("getBoard",(room)=>{

const board=generateBoard()

socket.emit("boardData",{board,images})

})

})

const PORT=process.env.PORT||3000

server.listen(PORT,()=>{
console.log("Server running",PORT)
})