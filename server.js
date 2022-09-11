const express= require("express");
const app = express();
const server = require("http").Server(app);
const io = require ("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.render('index')
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId: req.params.room})
})

io.on("connection",socket=>{
    socket.on("join-room",(roomId, userId, server)=>{
        console.log("room ", roomId, " joined by ", userId," server? ", server)
        socket.join(roomId)
        socket.on("stream-ready",()=>{
            console.log("stream ready emitted")
            socket.to(roomId).emit("server-connected")
        })

        socket.to(roomId).emit('user-connected', userId, server)
        socket.on('disconnect', () => {
            console.log("A user just disconnected")
            socket.to(roomId).emit('user-disconnected', userId, server)
        })
    }) 
})

server.listen(3500);