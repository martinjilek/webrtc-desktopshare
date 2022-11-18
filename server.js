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
        let room, msg
        for(const r of rooms){
            if(r.id==params.roomId){
                if(r.pw!=params.pw){
                    msg = "Wrong password"
                    break
                }
                room=r
                break
            }
        }
        
        if(msg!=undefined){
            io.to(socket.id).emit("join-error",msg)
            return
        }else if(room==undefined){
            io.to(socket.id).emit("join-error",'Room not found')
            return
        }

        socket.on("Stopped sharing",(e)=>{
            io.to(room.serverSocket.id).emit('stopped sharing')
        })
        
        socket.on("disconnect",(e)=>{
            io.in(room.id).emit('user-disconnected',"user has disconnected")
            room.client = undefined
            room.setClientSocket(undefined)
        })

        if(room.client != undefined){
            // kick old client on connect
            io.to(room.clientSocket.id).emit("force-disconnect")
            room.clientSocket.disconnect()
            room.setClientSocket(socket)
            room.client = params.peerId
            socket.join(params.roomId)
            socket.emit("connected",{hostId:room.server})
            //socket.emit("room-full","V této místnosti již někdo vysílá.")
            return
        }

        room.client = params.peerId
        room.setClientSocket(socket) 
        socket.join(params.roomId)
        socket.emit("connected",{hostId:room.server})

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