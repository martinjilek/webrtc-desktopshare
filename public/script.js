const socket = io(`/`)

let url = new URL(window.location.href)

let peer = new Peer(undefined, {
    host:'/',
    port:'3001'
})

let peers = {}

const server = url.searchParams.get("server")=='true'

peer.on('open', id=>{
    socket.emit("join-room", ROOM_ID, id, server)
})

const myVideo = document.createElement("video")
myVideo.muted = true
let conns = [];
if(url.searchParams.get("server")=='true'){
    navigator.mediaDevices.getDisplayMedia({
        video:true,audio:true
    }).then((stream)=>{
        socket.emit("stream-ready")

        addVideoStream(myVideo,stream)
        
        socket.on('user-connected', userId=>{
            console.log("user connected")
            let call = peer.call(userId,stream)
            peers[userId] = call
        })

        socket.on("user-disconnected",(userId)=>{
            console.log("a user just diconnected", userId)
            if (peers[userId]) peers[userId].close()
        })
    })
}else{
    socket.on('server-connected', ()=>{ 
        location.reload();
    })
    peer.on("call",(call)=>{
        console.log("connected")
        call.answer()
        call.on('stream', userVideoStream => {
            addVideoStream(myVideo, userVideoStream)
        })
        socket.on("user-disconnected",(userId,server)=>{
            console.log("a user just diconnected", userId, server)
        })
    })
}


function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata",()=>{
        video.play()
    })
    document.querySelector(".video-container").append(video)
}
