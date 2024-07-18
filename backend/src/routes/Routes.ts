import express from 'express';
import upload from '../middlewares/multer';
import { login, signupUser } from '../controllers/Signup_Login';
import { profilePicture, UploadLogic } from '../controllers/UploadLogic';
import { createComment, getCommentsByPostId, getLikesbyPostId, getLikesbyUserId, likePost } from '../controllers/Like_Comment';
import { friendRequestAccept, getAllPendingFriendRequests, getAllUsers, getPostbyId, getUserInfo, getPostOfUser, searchFriendRequests, sendFriendRequest } from '../controllers/Friends_Follow_Request';

const router: express.Router = express.Router();

router.post('/signup', signupUser)
router.post('/upload', upload.single('image'), UploadLogic)
router.post('/uploadprofilepic', upload.single('image'), profilePicture)
router.post('/login', login)
router.post('/like', likePost)
router.post('/comment', createComment)

router.get('/getuserpost/:id', getPostOfUser)
router.get('/getpost/:id', getPostbyId)
router.get('/getuserinfo/:id', getUserInfo)

router.get("/getcommentbypostid/:id", getCommentsByPostId)
router.get("/getlikesbypostid/:id", getLikesbyPostId)
router.get("/getlikesbyuserid/:id/:postid", getLikesbyUserId);

router.get('/getallusers', getAllUsers)

router.post('/friendrequest', sendFriendRequest)
router.post('/friendrequestaccept', friendRequestAccept)
router.post('/searchfriendrequest', searchFriendRequests)
router.post('/getallpendingrequest', getAllPendingFriendRequests)

export default router;