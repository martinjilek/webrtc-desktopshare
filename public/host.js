const ROOM_ID = id;
console.log("ROOM_ID= ",ROOM_ID)
const socket = io(`/`)
let peer = new Peer(undefined, {
    host:'/',
    port:'3001'
})

peer.on('open', peerId=>{
    socket.emit("create-room", ROOM_ID, peerId)
});

const myVideo = document.createElement("video")
myVideo.muted = true

socket.on("password",(pw)=>{
    document.querySelector(".pw").value=pw
})

socket.on("test",(msg)=>{console.log(msg)})

peer.on("call",(call)=>{
    console.log("connected")
    call.answer()
    call.on('stream', userVideoStream => {
        addVideoStream(myVideo, userVideoStream)
    })
})

socket.on("user-disconnected",(a)=>{
    document.querySelector(".video-container").innerHTML=""
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
