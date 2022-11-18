console.log("ROOM_ID= ",roomId)
const socket = io(`/`)
let peers = {}, mediaStream, peerId

let peer = new Peer(undefined, {
    host:'/',
    port:'3001'
})

peer.on('open', id=>{
    peerId = id;
});

// handle password
document.querySelector("form").addEventListener("submit",(e)=>{
    e.preventDefault();
    let pw = document.querySelector("#pw").value;
    socket.emit("join-room", {roomId,pw,peerId})
})

socket.on("join-error",(obj)=>{
    handleAlert(obj)
})


const myVideo = document.createElement("video")
myVideo.muted = true

socket.on("connected",(obj)=>{
    console.log("connected")
    document.querySelector('.login-container').style.display='none';
    document.querySelector('.video-container').style.display='block';
    
    beginStream(myVideo,obj,navigator,socket,peers)
})

socket.on("room-full",(msg)=>{
    alert(msg)
})

socket.on("force-disconnect",(msg)=>{
    document.querySelector(".video-container").innerHTML=""
    console.log("above")
    console.log(mediaStream)
    mediaStream.getTracks().forEach(function(track) {
        track.stop();
    });
})

function beginStream(myVideo,obj,navigator,socket,peers){
    navigator.mediaDevices.getDisplayMedia({
        video:true,audio:true
    }).then((stream)=>{
        mediaStream = stream
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

function handleAlert(text){
    let alert = document.querySelector('.alert')
    
    alert.innerHTML = text
    alert.style.display="block"
    setTimeout(()=>{
        alert.style.opacity = 1
        setTimeout(()=>{
            alert.style.opacity = 0;
            setTimeout(()=>{
                alert.style.display = "none";
            },250)
    },3500)
    },50) 
}