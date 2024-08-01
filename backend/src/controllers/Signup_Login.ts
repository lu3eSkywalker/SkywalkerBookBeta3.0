import { Request, Response } from "express";
import {z} from 'zod';
import bcrypt from 'bcrypt';
import dotenv, { parse } from 'dotenv';
dotenv.config();
import jwt, { Secret } from 'jsonwebtoken';
import { rateLimiter } from '../middlewares/redis';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const secretjwt: string = process.env.JWT_SECRET || ''

const SigupUserSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.string().email(),
    password: z.string().min(5)
})

export const signupUser = async(req: Request, res: Response): Promise<void> => {
    try {
        const parsedInput = SigupUserSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            })
            return;
        }

        const name = parsedInput.data.name
        const email = parsedInput.data.email
        const password = parsedInput.data.password

        let hashedPassword: string;
            hashedPassword = await bcrypt.hash(password, 10);

            const response = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });

            res.status(200).json({
                success: true,
                data: response,
                message: 'Signed up Successfully'
            })

    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Entry Creation Failed',
        })
    }
}

const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
})
export const login = async(req: Request<{ email: string, password: string}>, res: Response): Promise<void> => {
    try {
        const parsedInput = UserLoginSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            })
            return;
        }

        const email = parsedInput.data.email;
        const password = parsedInput.data.password;

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if(!user) {
            res.status(404).json({
                success: false,
                messages: 'User not registered',
            });
            return
        }

        const payload = {
            email: user.email,
            name: user.name,
            id: user.id,
        }

        const compare = await bcrypt.compare(password, user.password);

        if(compare) {
            const token = jwt.sign({payload}, secretjwt, { expiresIn: "24hr"} )

            res.status(200).json({
                success: true,
                data: user,
                token: token,
                message: 'Logged in successfully'
            });
        } else {
            const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
            const { rateLimited, timeRemaining } = await rateLimiter({ key: 'login', limit: 5, timer: 60 }, clientIp);

            if(rateLimited) {
                res.status(429).json({
                    success: false,
                    message: `Too many incorrect login requests, Please try again later after ${timeRemaining} seconds`
                })
            } else {
                res.status(401).json({
                    success: false,
                    message: "Password Incorrect"
                });
            }
        }
    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        })
    }
}