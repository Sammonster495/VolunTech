import { CometChat } from "@cometchat-pro/react-native-chat";
import { collection, onSnapshot } from "firebase/firestore";
import React from "react";
import { db } from "../firebaseConfig";

export const chatOpenHandler = async (type: string, user: any, conversation: any, setChatGroup: React.Dispatch<React.SetStateAction<any>>, setChatVisible: React.Dispatch<React.SetStateAction<boolean>>, setChatGroupInfo: React.Dispatch<React.SetStateAction<any>>, setPreviousMessages: React.Dispatch<React.SetStateAction<any[]>>, setChatGroupMembers: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (type === "group") {
        const GUID = conversation.guid;
        setChatGroup(conversation);

        const limit = 30;
        const messagesRequest = new CometChat.MessagesRequestBuilder().setGUID(GUID).setLimit(limit).build();

        const group = await CometChat.getGroup(GUID);
        console.log(group);
        setChatGroupInfo(group);

        const membersRequest = new CometChat.GroupMembersRequestBuilder(GUID).setLimit(100).build();
        const members = await membersRequest.fetchNext();
        console.log('Members:', members);
        setChatGroupMembers(members);

        // Fetch the messages and filter based on join date
        const messages = await messagesRequest.fetchPrevious();
        messages.filter((message: any) => {
            if (message.sender.uid !== user.id.toLowerCase())
                CometChat.markAsRead(message.id, message.receiverId, message.receiverType, message.sender.uid);
        })
        
        setChatVisible(true);
        const member: any = members.find((member: any) => member.uid === user.id.toLowerCase());
        const userJoinDate = member?.joinedAt;
        if (userJoinDate) {
            const filteredUserMessages = messages.filter((message: any) => message.sentAt >= userJoinDate);
            filteredUserMessages.map(async(message: any) => {
                if(message.category === 'message' && message.sender.uid === user.id.toLowerCase()){
                    const receiptRequest: any = await CometChat.getMessageReceipts(message.id);
                    console.log(message.text);
                    console.log(receiptRequest);
                    const readReceipts = receiptRequest.filter((receipt: any) => receipt.receiptType === 'read');
                    message.receiptStatus = readReceipts.length === receiptRequest.length ? 'read' : 'delivered';
                }
            })
            setPreviousMessages(filteredUserMessages);
        } else {
            setPreviousMessages(messages);
        }
    }
}

export const conversationListUpdateHandler = (newMessage: any, setConversations: React.Dispatch<React.SetStateAction<any[]>>) => {
    setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
            if (conversation.conversationId === newMessage.conversationId) {
                conversation.lastMessage = newMessage;
                conversation.conversationWith.lastMessage = newMessage;
            }
            return conversation;
        });

        const existingConversation = updatedConversations.find(conversation => conversation.conversationId === newMessage.conversationId);
        if (!existingConversation) {
            const newConversation = {
                conversationId: newMessage.conversationId,
                conversationType: newMessage.receiverType,
                lastMessage: newMessage,
                conversationWith: newMessage.receiverType === CometChat.RECEIVER_TYPE.GROUP ? newMessage.getReceiver() : newMessage.getSender(),
            };
            updatedConversations.unshift(newConversation);
        }

        updatedConversations.sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
        return updatedConversations;
    });
}

export const sendMessageHandler = async (message: string, chatGroup: any, setMessage: React.Dispatch<React.SetStateAction<string>>, setPreviousMessages: React.Dispatch<React.SetStateAction<any[]>>, updateConversationList: (newMessage: any) => void) => {
    if (message && chatGroup) {
        const textMessage = new CometChat.TextMessage(chatGroup.guid, message, CometChat.RECEIVER_TYPE.GROUP);
        await CometChat.sendMessage(textMessage).then((sentMessage: any) => {
            console.log('Message sent successfully:', { sentMessage });
            setPreviousMessages((prevMessages: any) => [...prevMessages, sentMessage]);
            setMessage('');
            updateConversationList(sentMessage);
        }, error => {
            console.log('Message sending failed with exception:', { error });
        });
    }
}

export const showUserInfoHandler = (id: string, setUserInfo: React.Dispatch<React.SetStateAction<any>>, setShowUserInfo: React.Dispatch<React.SetStateAction<boolean>>) => {
    onSnapshot(collection(db, 'users'), snapshot => {
        snapshot.docs.forEach(doc => {
            const docId = doc.id.toLowerCase();
            if(docId === id) {
                setUserInfo(doc.data());
                setShowUserInfo(true);
            }
        })
    })
}

export const groupJoinSubscriptionHandler = (setJoinGroup: React.Dispatch<React.SetStateAction<boolean>>) => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                setJoinGroup(true);
                setJoinGroup(false);
            }
        })
    })
    return () => unsubscribe();
}

export const conversationFetchHandler = (user: any, chatGroup: any, updateConversationList: (newMessage: any) => void, setConversations: React.Dispatch<React.SetStateAction<any[]>>, setPreviousMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    const fetchConversations = async () => {
        try {
            const limit = 50; // Set the limit for the number of conversations to fetch
            const conversationRequest = new CometChat.ConversationsRequestBuilder()
                .setLimit(limit)
                .build();

            const fetchedConversations = await conversationRequest.fetchNext();
            console.log('Fetched conversations:', fetchedConversations);
            setConversations(fetchedConversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    fetchConversations();

    // Set up event listener for real-time updates
    const listenerID = user.id;
    CometChat.addMessageListener(
        listenerID,
        new CometChat.MessageListener({
            onTextMessageReceived: (message: any) => {
                console.log('Text message received successfully:', message);
                updateConversationList(message);
                if(chatGroup.guid === message.receiverId){
                    setPreviousMessages((prevMessages: any[]) => [...prevMessages, message]);
                    CometChat.markAsRead(message.id, message.receiverId, message.receiverType, message.sender.uid);
                }
            },
            onMediaMessageReceived: (message: any) => {
                console.log('Media message received successfully:', message);
                updateConversationList(message);
            },
            onCustomMessageReceived: (message: any) => {
                console.log('Custom message received successfully:', message);
                updateConversationList(message);
            },
        })
    );

    return () => CometChat.removeMessageListener(listenerID);
}