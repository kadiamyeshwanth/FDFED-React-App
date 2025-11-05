const ChatRoom = require('../models/chatModel');
const mongoose = require('mongoose');
const { ArchitectHiring, DesignRequest, Customer, Worker, Company, CompanytoWorker, WorkerToCompany } = require('../models');

// Helper function to capitalize the first letter
const capitalize = (s) => {
    if (typeof s !== 'string' || s.length === 0) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

// ====================================================================
// authorizeChatAccess remains UNCHANGED
// ====================================================================
const authorizeChatAccess = async (roomId, userId, userRole) => {
    const chatRoom = await ChatRoom.findOne({ roomId }).lean();

    if (!chatRoom) {
        return { authorized: false, message: 'Chat room not found.' };
    }

    const isCustomer = chatRoom.customerId && chatRoom.customerId.toString() === userId.toString() && userRole === 'customer';
    const isWorker = chatRoom.workerId && chatRoom.workerId.toString() === userId.toString() && userRole === 'worker';
    const isCompany = chatRoom.companyId && chatRoom.companyId.toString() === userId.toString() && userRole === 'company';


    if (isCustomer || isWorker || isCompany) {
        let otherUserId, otherUserModel;
        if(isCustomer){
            otherUserId = chatRoom.workerId;
            otherUserModel = 'Worker';
        } else if (isWorker) {
            otherUserId = chatRoom.customerId || chatRoom.companyId;
            otherUserModel = chatRoom.customerId ? 'Customer' : 'Company';
        } else { // isCompany
            otherUserId = chatRoom.workerId;
            otherUserModel = 'Worker';
        }

        return {
            authorized: true,
            chatRoom,
            otherUserId,
            otherUserModel
        };
    }

    return { authorized: false, message: 'Unauthorized access to this chat room.' };
};

// ====================================================================
// getChatPage handles user data safely
// ====================================================================
const getChatPage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.user_id; // Using optional chaining for safety
        const userRole = req.user?.role; 

        if (!userId || !userRole) {
            return res.status(401).send('Unauthorized');
        }

        const { authorized, message, chatRoom, otherUserId, otherUserModel } = await authorizeChatAccess(roomId, userId, userRole);

        if (!authorized) {
            return res.status(403).send(message);
        }

        const OtherUser = mongoose.model(otherUserModel);
        const otherUser = await OtherUser.findById(otherUserId).select('name companyName').lean();
        
        if (!otherUser) {
            console.error(`Other user (${otherUserModel}) not found for ID: ${otherUserId}`);
        }

        const CurrentUser = mongoose.model(capitalize(userRole));
        const currentUser = await CurrentUser.findById(userId).select('name companyName').lean();

        if (!currentUser) {
            console.error(`Current user (${userRole}) not found for ID: ${userId}`);
            return res.status(404).send('Current user profile not found.');
        }


        const chatData = {
            roomId: chatRoom.roomId,
            userId: userId.toString(),
            userName: currentUser.name || currentUser.companyName || 'You', 
            userRole: userRole,
            otherUserName: otherUser?.name || otherUser?.companyName || 'Other User',
            messages: chatRoom.messages, 
            activePage: 'chat'
        };

        res.render('chat', chatData);

    } catch (error) {
        console.error('Error fetching chat page:', error); 
        res.status(500).send('Server Error');
    }
};

// ====================================================================
// findOrCreateChatRoom remains UNCHANGED
// ====================================================================
const findOrCreateChatRoom = async (projectId, projectType) => {
    try {
        const roomId = `room-${projectId}-${projectType}`;
        
        let project, customerId, workerId, companyId;

        if (projectType === 'architect') {
            project = await ArchitectHiring.findById(projectId).lean();
            if (!project || (project.status.toLowerCase() !== 'accepted')) return null;
            customerId = project.customer;
            workerId = project.worker;
        } else if (projectType === 'interior') {
            project = await DesignRequest.findById(projectId).lean();
            if (!project || (project.status.toLowerCase() !== 'accepted')) return null;
            customerId = project.customerId;
            workerId = project.workerId;
        } else if (projectType === 'hiring') {
            project = await CompanytoWorker.findById(projectId).lean() || await WorkerToCompany.findById(projectId).lean();
            if(!project || (project.status.toLowerCase() !== 'accepted')) return null;
            companyId = project.company || project.companyId;
            workerId = project.worker || project.workerId;
        }

        if (!project) return null;

        let chatRoom = await ChatRoom.findOne({ roomId });
        
        if (!chatRoom) {
            chatRoom = new ChatRoom({
                roomId,
                customerId,
                workerId,
                companyId,
                projectId,
                projectType,
                messages: []
            });
            await chatRoom.save();
        }

        return chatRoom;

    } catch (error) {
        console.error('Error in findOrCreateChatRoom:', error);
        return null; 
    }
};

module.exports = {
    getChatPage,
    findOrCreateChatRoom,
    authorizeChatAccess
};