console.log("ROOM_ID= ",roomId)
const socket = io(`/`)
let pw = window.prompt("Zadejte heslo").toUpperCase();
let peers = {}


let peer = new Peer(undefined, {
    host:'/',
    port:'3001'
})

peer.on('open', peerId=>{
    socket.emit("join-room", {roomId,pw,peerId})
});

const myVideo = document.createElement("video")
myVideo.muted = true

socket.on("connected",(obj)=>{
    console.log("connected", obj.hostId)

    navigator.mediaDevices.getDisplayMedia({
        video:true,audio:true
    }).then((stream)=>{
        addVideoStream(myVideo,stream)

        let call = peer.call(obj.hostId,stream)
        peers[obj.hostId] = call
    })
})

socket.on("room-full",(msg)=>{
    alert(msg)
})

// socket.on("connected",()=>{
//     navigator.mediaDevices.getDisplayMedia({
//         video:true,audio:true
//     }).then((stream)=>{
//         socket.emit("stream-ready")

//         addVideoStream(myVideo,stream)
        
//         socket.on('user-connected', userId=>{
//             console.log("user connected")
//             let call = peer.call(userId,stream)
//             peers[userId] = call
//         })

//         socket.on("user-disconnected",(userId)=>{
//             console.log("a user just diconnected", userId)
//             if (peers[userId]) peers[userId].close()
//         })
//     })
// })

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata",()=>{
        video.play()
    })
    document.querySelector(".video-container").append(video)
}