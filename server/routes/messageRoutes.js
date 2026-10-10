import express from 'express';
import { getChatMessages, getUserRecentMessages, sendMessage, sseController } from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';

const messageRouter= express.Router();

messageRouter.get('/recent-messages', protect, getUserRecentMessages) 
messageRouter.get('/:userId',sseController)
messageRouter.post('/send',upload.single('image'),protect,sendMessage)
messageRouter.post('/get',protect,getChatMessages)


export default messageRouter