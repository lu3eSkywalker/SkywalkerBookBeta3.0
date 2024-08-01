import { Request, Response } from "express";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { redis } from "../middlewares/redis";

export const fetchChats = async(req: Request, res: Response): Promise<void> => {
    try {
        const {chatId} = req.body;

        const userChat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include: {
            }
        });

        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}

export const fetchmessageByChatId = async(req: Request, res: Response): Promise<void> => {
    try {
        const chatId: any = req.params.chatId;

        const id = parseInt(chatId);

        const key = `messages: ${id}`;
        let redisMessageByChatId = await redis.get(key);

        if(redisMessageByChatId) {
            console.log("Getting from cache");
            res.status(200).json({
                success: true,
                data: JSON.parse(redisMessageByChatId),
                message: 'Data Fetched from cache'
            });
            return;
        }

        const userChat = await prisma.twoPersonChat.findMany({
            where: {
                chatId: id
            }
        })

        if(!userChat) {
            res.status(404).json({
                success: false,
                message: "No Data Found"
            });
            return;
        }

        await redis.setex(key, 600, JSON.stringify(userChat));

        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}

export const fetchChatIdByUserIds = async(req: Request, res: Response): Promise<void> => {
    try {
        const userId1 = req.params.userId1;
        const userId2 = req.params.userId2;

        const id1 = parseInt(userId1);
        const id2 = parseInt(userId2);

        const userChat = await prisma.chat.findFirst({
            where: {
                OR: [
                    {
                        user1Id: id1,
                        user2Id: id2
                    },
                    {
                        user1Id: id2,
                        user2Id: id1
                    }
                ]
            },

        })

        if(!userChat) {
            res.status(404).json({
                success: false,
                message: "Chat not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}

