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