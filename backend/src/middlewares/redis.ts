import Redis from "ioredis";

import dotenv from 'dotenv';
dotenv.config();

export const redis = new Redis({
    host: process.env.HOST || '',
    port: parseInt(process.env.PORT_REDIS || '6379', 10),
    password: process.env.PASSWORD || '',
})
