import { Request, Response } from "express";
import {z} from 'zod';
import bcrypt from 'bcrypt';
import dotenv, { parse } from 'dotenv';
dotenv.config();
import jwt, { Secret } from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { redis } from "../middlewares/redis";

const secretjwt: string = process.env.JWT_SECRET || ''

export const likePost = async(req: Request, res: Response): Promise<void> => {
    try {
           const {postId, userId} = req.body

           if(!postId) {
            res.status(404).json({
                success: false,
                message: "Successfully liked the post"
            })
            return;
           }
           
           const likePost = await prisma.like.create({
            data: {
                postId: postId,
                userId: userId
            }
           });

           res.status(200).json({
            success: true,
            message: "Successfully Liked The Post"
           })
    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Entry Creation Failed'
        })
    }
}

const commentSchema = z.object({
    content: z.string().min(5).max(10000)
});

export const createComment = async(req: Request, res: Response): Promise<void> => {
    try {
        const {postId, userId} = req.body;

        const parsedInput = commentSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            }) 
            return;
        }

        const content = parsedInput.data.content;

        const newComment = await prisma.comment.create({
            data: {
                userId: userId,
                postId: postId,
                content: content
            }
        });

        res.status(200).json({
            success: true,
            data: newComment,
            message: 'Entry Created Successfully'
        })

    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Entry Creation Failed'
        })
    }
}



export const getCommentsByPostId = async(req: Request, res: Response): Promise<void> => {
    try {
        const postId: any = req.params.id;

        const id = parseInt(postId);

        const key = `comments: ${id}`;
        let redisPostComment = await redis.get(key);

        if(redisPostComment) {
            console.log('Getting from cache');
            res.status(200).json({
                success: true,
                data: JSON.parse(redisPostComment),
                message: 'Data Fetched from cache'
            });
            return;
        }

        const comments = await prisma.posts.findUnique({
            where: {
                id: id,
            },
            select: {
                comments: true
            }
        });

        if(!comments) {
            res.status(404).json({
                success: false,
                message: "No Data Found"
            })
        }

        await redis.setex(key, 600, JSON.stringify(comments));

        res.status(200).json({
            success: true,
            data: comments,
            message: "Data Fetched Successfully"
        });


    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getLikesbyPostId = async(req: Request, res: Response): Promise<void> => {
    try {

        const postId: any = req.params.id;

        const id = parseInt(postId);

        const key = `userProfile: ${id}`;
        let redisPostLike = await redis.get(key);

        if(redisPostLike) {
            console.log('Getting from cache');
            res.status(200).json({
                success: true,
                data: JSON.parse(redisPostLike),
                message: 'Data Fetched from cache'
            });
            return;
        }

        const likes = await prisma.posts.findUnique({
            where: {
                id: id,
            },
            select: {
                likes: true
            }
        })

        if(!likes) {
            res.status(404).json({
                success: false,
                message: "No Data Found"
            });
            return;
        }

        await redis.setex(key, 600, JSON.stringify(likes));

        res.status(200).json({
            success: true,
            data: likes,
            message: "Data Fetched Successfully"
        });

    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getLikesbyUserId = async(req: Request, res: Response): Promise<void> => {
    try {

        const userId: any = req.params.id;
        const postid: any = req.params.postid;

        const id = parseInt(userId);
        const postId = parseInt(postid);

        const key = `userProfile: ${id}`;
        let redisPostLikeByUserId = await redis.get(key);

        if(redisPostLikeByUserId) {
            console.log("Getting from cache");
            res.status(200).json({
                success: true,
                data: JSON.parse(redisPostLikeByUserId),
                message: 'Data Fetched from cache'
            });
            return;
        }

        const likes = await prisma.like.findFirst({
            where: {
                userId: id,
                postId: postId,
            }
        });

        if(!likes) {
            res.status(404).json({
                success: false,
                message: "No Data Found"
            })
            return;
        }

        await redis.setex(key, 600, JSON.stringify(likes));

        res.status(200).json({
            success: true,
            data: likes,
            message: "Data Fetched Successfully"
        });
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}