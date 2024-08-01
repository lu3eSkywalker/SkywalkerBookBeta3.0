import Redis from "ioredis";
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
dotenv.config();


interface RateLimiterOptions {
    limit?: number;
    timer?: number;
    key: string;
}



export const redis = new Redis({
    host: process.env.HOST || '',
    port: parseInt(process.env.PORT_REDIS || '6379', 10),
    password: process.env.PASSWORD || '',
})

export const rateLimiter = async ({ key, limit = 2, timer = 60 }: RateLimiterOptions, clientIp: string) => {
    const fullkey = `${clientIp}:${key}request_count`;
    const requestCount = await redis.incr(fullkey);

    if (requestCount === 1) {
        await redis.expire(fullkey, timer);
    }

    const timeRemaining = await redis.ttl(fullkey);

    if (requestCount > limit) {
        return {
            rateLimited: true,
            timeRemaining,
        };
    }

    return {
        rateLimited: false,
    };
};


export const rateLimiter2 = ({ limit = 20, timer = 60, key }: RateLimiterOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const fullkey = `${clientIp}:${key}request_count`;
            const requestCount = await redis.incr(fullkey);

            if (requestCount === 1) {
                await redis.expire(fullkey, timer);
            }

            const timeRemaining = await redis.ttl(fullkey);

            if (requestCount > limit) {
                res.status(429).json({
                    success: false,
                    message: 'Too many requests, please try again later.',
                    timeRemaining
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
};
