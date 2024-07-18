import express from 'express';
import skywalkerBookRoutes from './routes/Routes';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use('/api/v1', skywalkerBookRoutes)

const prisma = new PrismaClient();

const dbConnect = async() => {
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch(error) {
        console.log('Database connection error: ', error);
        process.exit(1);
    }
};

dbConnect();

app.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
});

process.on('SIGNIN', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
});
