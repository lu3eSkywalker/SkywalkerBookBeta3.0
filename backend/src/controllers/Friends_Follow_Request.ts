import { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



export const sendFriendRequest = async(req: Request, res: Response): Promise<void> => {
    try {
        const {userId, friendId, status} = req.body;

        const addfriend = await prisma.friendRequest.create({
            data: {
                userId: userId,
                tobefriendId: friendId,
                status: status
            }
        });

        res.status(200).json({
            success: true,
            data: addfriend,
            message: "Your Request has been created"
        })

    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

// export const friendRequestAccept = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { tobefriendId, requestId, status, userId } = req.body;

//         if (status === 'Accept') {
//             // Update the friend request status
//             const updateFriend = await prisma.friendRequest.update({
//                 where: {
//                     id: parseInt(requestId)
//                 },
//                 data: {
//                     status: 'Accept'
//                 }
//             });

//             // Add friend relationship for the current user
//             const updateOne = await prisma.user.update({
//                 where: {
//                     id: parseInt(userId)
//                 },
//                 data: {
//                     friends: {
//                         create: {
//                             id: parseInt(tobefriendId)
//                         }
//                     }
//                 }
//             });

//             // Add friend relationship for the to-be-friend user
//             const updateTwo = await prisma.user.update({
//                 where: {
//                     id: parseInt(tobefriendId)
//                 },
//                 data: {
//                     friends: {
//                         create: {
//                             id: parseInt(userId)
//                         }
//                     }
//                 }
//             });

//             res.status(200).json({
//                 success: true,
//                 message: 'Updated Successfully'
//             });
//         } else {
//             // Update the friend request status to Rejected
//             const updateFriendRequest = await prisma.friendRequest.update({
//                 where: {
//                     id: requestId
//                 },
//                 data: {
//                     status: 'Rejected'
//                 }
//             });

//             res.status(400).json({
//                 message: 'Request Rejected'
//             });
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             error: "Internal Server Error"
//         });
//     }
// };

export const friendRequestAccept = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tobefriendId, requestId, status, userId } = req.body;

        if (status === 'Accept') {
            // Update the friend request status
            const updateFriend = await prisma.friendRequest.update({
                where: {
                    id: parseInt(requestId)
                },
                data: {
                    status: 'Accept'
                }
            });

            await prisma.user.update({
                where: { id: userId },
                data: {
                    friends: {
                        push: tobefriendId 
                    }
                }
            });
            
            // Connect tobefriendId to userOne
            await prisma.user.update({
                where: { id: tobefriendId },
                data: {
                    friends: {
                        push: userId
                    }
                }
            });

            res.status(200).json({
                success: true,
                message: 'Updated Successfully'
            });
        } else {
            // Update the friend request status to Rejected
            const updateFriendRequest = await prisma.friendRequest.update({
                where: {
                    id: parseInt(requestId)
                },
                data: {
                    status: 'Rejected'
                }
            });

            res.status(400).json({
                message: 'Request Rejected'
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

//This is for the acceptor
export const getAllPendingFriendRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, tobefriendId } = req.body;

        const pendingRequests = await prisma.friendRequest.findMany({
            where: {
                tobefriendId: tobefriendId,
                status: status
            }
        });

        if (pendingRequests.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No Data Found with the Given Id'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: pendingRequests,
            message: 'Data Fetched Successfully'
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};



//This is for the sender
export const searchFriendRequests = async(req: Request, res: Response): Promise<void> => {
    try {
        const {userId, tobefriendId, status, requestId} = req.body;

        const pendingRequests = await prisma.friendRequest.findFirst({
            where: {
                tobefriendId: parseInt(tobefriendId),
                userId: parseInt(userId)
            },
        })

        if(!pendingRequests) {
            res.status(404).json({
                success: false,
                message: 'No Data Found with the Given Id'
            })
            return;
        }

        res.status(200).json({
            success: true,
            data: pendingRequests,
            message: 'Data Fetched Successfully'
        })
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

export const getPosts = async(req: Request, res: Response): Promise<void> => {
    try {
        const posts = await prisma.posts.findMany();

        res.status(200).json({
            success: true,
            data: posts,
            message: 'All posts have been fetched.'
        })

    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getPostOfUser = async(req: Request, res: Response): Promise<void> => {
    try {
        const userId: any = req.params.id;

        const id = parseInt(userId);

        const posts = await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                post: true
            }
        });

        if(!posts) {
            res.status(404).json({
                success: false,
                message: 'No Posts available'
            })
        }

        res.status(200).json({
            success: true,
            data: posts,
            message: 'Successfully fetched the posts'
        })
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getAllUsers = async(req: Request, res: Response): Promise<void> => {
    try {

        const user = await prisma.user.findMany();

        res.status(200).json({
            success: true,
            data: user,
            message: 'All users have been fetched.'
        })

    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getPostbyId  = async(req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const postId = parseInt(id);

        const post = await prisma.posts.findUnique({
            where: {
                id: postId
            }
        });

        if(!post) {
            res.status(404).json({
                success: false,
                message: 'No Posts available'
            })
        }

        res.status(200).json({
            success: true,
            data: post,
            message: "Data has been fetched"
        })

    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getUserInfo = async(req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const userId = parseInt(id);

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                post: true
            }
            // include: {
            //     friends: true
            // }
        });

        if(!user) {
            res.status(404).json({
                success: false,
                message: "User doesn't exist"
            })
        }

        res.status(200).json({
            success: true,
            data: user,
            message: "Data has been fetched"
        })
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}