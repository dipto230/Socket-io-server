import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"

dotenv.config()

const app = express()
app.use(express.json())

const server = http.createServer(app)
const port = process.env.PORT || 5000

const io = new Server(server, {
    cors: {
        origin:process.env.NEXT_BASE_URL
    }
})

io.on("connection", (socket) => {
    console.log("user connected", socket.id)


    socket.on("identity", async(userId) => {
        console.log(userId)
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId, socketId:socket.id})
    })

    socket.on("update-location", async ({ userId, latitude, longitude }) => {
        const location = {
            type: "Point",
            coordinates:[longitude,latitude]
        }
        // console.log(userId)
        // console.log(latitude)
        // console.log(longitude)
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, { userId, location })
        io.emit("update-deliveryBoy-location",{userId, location})
    })

    socket.on("join-room", (roomId) => {
        socket.join(roomId)
        console.log("join room with", roomId)
    })

    socket.on("send-message", (message) => {
        console.log(message)
    })

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
  
    })
})

//io.emit("update-deliveryBoy-location",{userId, location})



    


app.post("/notify", (req, res) => {
    const { event, data, socketId } = req.body
    if (socketId) {
        io.to(socketId).emit(event, data)
    } else {
        io.emit(event,data)
    }
    return res.status(200).json({"success":true})
})


server.listen(port, () => {
    console.log("Server start at", port)
})