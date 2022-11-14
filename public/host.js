const ROOM_ID = id;
console.log("ROOM_ID= ",ROOM_ID)
const socket = io(`/`)
let peer = new Peer(undefined, {
    host:'/',
    port:'3001'
})
//TODO https://stackoverflow.com/questions/35252249/move-drag-pan-and-zoom-object-image-or-div-in-pure-js

peer.on('open', peerId=>{
    socket.emit("create-room", ROOM_ID, peerId)
});

const myVideo = document.createElement("video")
myVideo.muted = true

socket.on("password",(pw)=>{
    document.querySelector(".pw").innerHTML=pw
})

socket.on("test",(msg)=>{console.log(msg)})

peer.on("call",(call)=>{
    console.log("connected")
    call.answer()
    call.on('stream', userVideoStream => {
        document.querySelector(".message").style.display = "none"
        addVideoStream(myVideo, userVideoStream)
    })
})

socket.on("user-disconnected",(a)=>{
    document.querySelector(".video-container").innerHTML=""
    document.querySelector(".message").style.display = "block"
})

socket.on("stopped sharing",(a)=>{
    document.querySelector("video").remove()
})


document.querySelector("#regeneratePw").addEventListener("click",()=>{
    console.log("regenPW")
    socket.emit("regeneratePw")
})

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata",()=>{
        video.play()
    })
    document.querySelector(".video-container").append(video)
}
