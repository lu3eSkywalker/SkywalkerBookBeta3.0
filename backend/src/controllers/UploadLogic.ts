import { Request, Response } from "express";
import {z} from 'zod';
import dotenv from 'dotenv';
dotenv.config();

import jwt, { Secret } from 'jsonwebtoken';

import { cloudinary } from "../utils/cloudinary";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const uploadSchema = z.object({
    caption: z.string().min(5).max(5000)
})

export const UploadLogic = async(req: Request, res: Response): Promise<void> => {
    try {

        let result
        if(req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
        } else {
            result = await cloudinary.uploader.upload(req.body.filePath);
        }

        const {userId} = req.body;

        const id = parseInt(userId);

        const parsedInput = uploadSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            })
            return;
        }

        const caption = parsedInput.data.caption;

        const newPost = await prisma.posts.create({
            data: {
                uploadedbyId: id,
                caption: caption,
                cloudinaryUrl: result.secure_url
            }
        });

        res.status(200).json({
            success: true,
            data: newPost,
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

export const profilePicture = async(req: Request, res: Response): Promise<void> => {
    try {
        let result
        if(req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
        } else {
            result = await cloudinary.uploader.upload(req.body.filePath);
        }

        const {userId} = req.body

        const id = parseInt(userId);

        const updateProfilePicture = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                profilePicture: result.secure_url
            }
        });

        res.status(200).json({
            success: true,
            data: updateProfilePicture,
            message: 'Successfully Updated the Profile Picture'
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