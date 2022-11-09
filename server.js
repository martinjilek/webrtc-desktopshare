const express= require("express");
const randomstring = require("randomstring")
const app = express();
const fs = require("fs")
const path = require('path')
//const server = require("http").Server(app)
const server = require("https").createServer({
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
},app)
const io = require ("socket.io")(server)
let rooms = []

app.set("view engine", "ejs")

app.use('/static', express.static(path.join(__dirname, 'public')))


app.get("/", (req, res)=>{
    res.render('index')
})

app.get("/host", (req, res)=>{
    res.redirect(`/host/${randomstring.generate(12)}`)    
})

app.get("/host/:id",(req,res)=>{
    if(rooms.filter(e => e.id === req.params.id).length > 0){
        res.send("This room already exists")
        return
    }
    res.render("host",{id:req.params.id,domain: req.get('host')});   
})

// tabulka s místonosti pro připojení
app.get("/join/",(req,res)=>{
    let availableRooms = []
    rooms.forEach(r =>{
        availableRooms.push(r.id)
    })
    res.render("table",{rooms:availableRooms});   
})

app.get("/join/:roomId",(req,res)=>{
    
    res.render("join",{roomId:req.params.roomId});   
})

io.on("connection",socket=>{
    // Přijímá
    socket.on("create-room",(roomId, userId)=>{
        let room =  new Room(roomId,userId,socket,null)
        rooms.push(room)
        socket.join(roomId)
        room.setServerSocket(socket)
        socket.emit("password",room.pw)

        socket.on('disconnect', function () {
            console.log("user disconnected")
            let index = rooms.findIndex(item => {
                return item.id === room.id;
            });
            rooms.splice(index,1)
        });

        socket.on("regeneratePw",()=>{
            socket.emit("password",room.regeneratePw())
        })
    })
    // vysílá
    socket.on("join-room",(params)=>{
        let room 
        rooms.forEach(e=>{
            if(e.pw==params.pw && e.id==params.roomId){
                room=e
                return
            }
        })

        if(room==undefined){
            console.log("místnost nenalezena")
            //TODO handle response 
            return
        }
        if(room.client != undefined){
            room.clientSocket.disconnect()
            //socket.emit("room-full","V této místnosti již někdo vysílá.")
            return
        }
        room.client = params.peerId
        room.setClientSocket(socket) 
        socket.join(params.roomId)
        socket.emit("connected",{hostId:room.server})

        socket.on("Stopped sharing",(e)=>{
            console.log(room.serverSocket.id)
            io.to(room.serverSocket.id).emit('stopped sharing')
        })
        
        socket.on("disconnect",(e)=>{
            io.in(room.id).emit('user-disconnected',"user has disconnected")
            room.client = undefined
            room.setClientSocket = undefined
        })
    })

})

server.listen(3500,()=>{
    console.log("server running on port 3500")
});



class Room{
    
    constructor(id,server,serverSocket, client, pw=randomstring.generate(4).toUpperCase()){
        this.id = id;
        // peerIds
        this.server = server;
        this.client= client;
        //socketIds
        this.serverSocket
        this.clientSocket = null;
        this.pw = pw;
        this.serverSocket = serverSocket;
    }

    setClientSocket(clientSocket){
        this.clientSocket = clientSocket
    }

    setServerSocket(serverSocket){
        this.serverSocket = serverSocket
    }

    regeneratePw(){
        this.pw = randomstring.generate(4).toUpperCase()
        return this.pw
    }
}