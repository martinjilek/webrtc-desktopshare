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

    beginStream(myVideo,obj,navigator,socket,peers)
})

socket.on("room-full",(msg)=>{
    alert(msg)
})

function beginStream(myVideo,obj,navigator,socket,peers){
    navigator.mediaDevices.getDisplayMedia({
        video:true,audio:true
    }).then((stream)=>{
        addVideoStream(myVideo,stream)

        let call = peer.call(obj.hostId,stream)
        peers[obj.hostId] = call

        // kliknutí na tlačítko "Stop sharing"
        stream.getVideoTracks()[0].onended = function () {
            socket.emit('Stopped sharing')
        };
    })
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata",()=>{
        video.play()
    })
    document.querySelector(".video-container").append(video)
}