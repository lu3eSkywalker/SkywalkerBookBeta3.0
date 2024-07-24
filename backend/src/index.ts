import express from 'express';
import skywalkerBookRoutes from './routes/Routes';
import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';
import { createServer } from "http";
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
}));

const server = createServer(app);
app.use('/api/v1', skywalkerBookRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const prisma = new PrismaClient();

const dbConnect = async () => { 
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch(error) {
        console.log('Database connection error: ', error);
        process.exit(1);
    }
};

dbConnect();

app.post('/messages', async (req, res) => {
    const { content, chatId, senderId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const message = await prisma.twoPersonChat.create({
            data: {
                chatId,
                content,
                senderId,
            },
        });

        const messageData = { id: message.id, chatId, senderId, content, timestamp: message.timestamp };

        io.emit("message", messageData);

        res.json({
            message: "Message sent successfully", data: messageData,
        });
    } catch (error) {
        console.error("Error saving message: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
    });

    socket.on("message", async (data) => {
        console.log("Received data:", data);

        const { content, senderId, chatId } = data;

        if (!content) {
            console.error("Content is missing from the message data");
            return;
        }

        try {
            const message = await prisma.twoPersonChat.create({
                data: {
                    chatId: chatId,
                    senderId: senderId,
                    content: content,
                },
            });

            const messageData = { id: message.id, chatId, senderId: senderId, content: content, timestamp: message.timestamp };
            console.log("Message saved to database:", messageData);

            io.emit("message", messageData);
        } catch (error) {
            console.error("Error saving message to database", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
});
