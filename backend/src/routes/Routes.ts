import express from 'express';
import upload from '../middlewares/multer';
import { login, signupUser } from '../controllers/Signup_Login';
import { profilePicture, UploadLogic } from '../controllers/UploadLogic';
import { createComment, getCommentsByPostId, getLikesbyPostId, getLikesbyUserId, likePost } from '../controllers/Like_Comment';
import { friendRequestAccept, getAllPendingFriendRequests, getAllUsers, getPostbyId, getUserInfo, getPostOfUser, searchFriendRequests, sendFriendRequest } from '../controllers/Friends_Follow_Request';
import { fetchChatIdByUserIds, fetchChats, fetchmessageByChatId } from '../controllers/Messaging_API';
import { rateLimiter2 } from '../middlewares/redis';

import client from 'prom-client';
import { requestCountMiddleware, requestDurationMiddleware } from '../middlewares/prometheus';

const router: express.Router = express.Router();

const app = express();

router.post('/signup', requestCountMiddleware, requestDurationMiddleware('/signup'), signupUser)
router.post('/upload', upload.single('image'), rateLimiter2({ limit: 5, timer: 300, key: "image"}), requestCountMiddleware, requestDurationMiddleware('/upload'), UploadLogic);
router.post('/uploadprofilepic', upload.single('image'), profilePicture)
router.post('/login', requestCountMiddleware, requestDurationMiddleware('login'), login)

router.post('/like', requestCountMiddleware, requestDurationMiddleware('/like'), likePost)
router.post('/comment', requestCountMiddleware, requestDurationMiddleware('/comment'), createComment)

router.get('/getuserpost/:id', requestCountMiddleware, requestDurationMiddleware('/getuserpost/:id'), getPostOfUser)
router.get('/getpost/:id', requestCountMiddleware, requestCountMiddleware, requestDurationMiddleware('/getpost/:id'),  getPostbyId)
router.get('/getuserinfo/:id', getUserInfo)

router.get("/getcommentbypostid/:id", getCommentsByPostId)
router.get("/getlikesbypostid/:id", getLikesbyPostId)
router.get("/getlikesbyuserid/:id/:postid", getLikesbyUserId);

router.get("/getmessagebychatid/:chatId", fetchmessageByChatId);
router.get("/fetchchatidbyuserids/:userId1/:userId2", fetchChatIdByUserIds);

router.get('/getallusers', requestDurationMiddleware('getAllUsers'), getAllUsers)

router.post('/friendrequest', rateLimiter2({ limit: 20, timer: 600, key: 'friendrequest'}), requestCountMiddleware, sendFriendRequest)
router.post('/friendrequestaccept', friendRequestAccept)
router.post('/searchfriendrequest', searchFriendRequests)
router.post('/getallpendingrequest', getAllPendingFriendRequests)

router.post("/fetchchats", fetchChats);

export default router;