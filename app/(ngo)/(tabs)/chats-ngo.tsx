import { useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { CometChat } from "@cometchat-pro/react-native-chat";
import { ActivityIndicator, Button, Image, Modal, SafeAreaView, ScrollView, Text, TextInput, Touchable, TouchableOpacity, View, StyleSheet } from "react-native";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useTheme } from "@/theme/ThemeContext";

const mapping: {[key: string]: string} = {
    'rescue': 'Rescue',
    'medical': 'Medical',
    'resource': 'Resource Allocation',
    'finance': 'Finance',
    'transport': 'Transport',
    'shelter': 'Shelter Building',
}

export default function ChatsHome() {
    const [user, setUser] = useState<any>(null);
    const [userloading, setUserLoading] = useState<boolean>(true);
    const [chatVisible, setChatVisible] = useState<boolean>(false);
    const [createGroup, setCreateGroup] = useState<boolean>(false);
    const [previousMessages, setPreviousMessages] = useState<any[]>([]);
    const [chatGroup, setChatGroup] = useState<any>(null);
    const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);
    const [chatGroupInfo, setChatGroupInfo] = useState<any>(null);
    const [showUserInfo, setShowUserInfo] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [chatGroupMembers, setChatGroupMembers] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [message, setMessage] = useState<string>('');
    const [groupName, setGroupName] = useState<string>('');
    const [groupDescription, setGroupDescription] = useState<string>('');
    const { theme } = useTheme();
    const styles = createStyles(theme);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await SecureStore.getItemAsync('ngo');
            if (user) {
                const userData = JSON.parse(user);
                setUser(userData);
                setUserLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleGroupCreation = async () => {
        if (!userloading && user && user?.designation === 'head' && groupName && groupDescription) {
            setLoading(true)
            let members: CometChat.GroupMember[] = [];
            let memberDetails: any[] = [];
            const q = query(collection(db, 'users'), where('type.name', '==', user.type['name']), where('designation', '==', 'head'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    console.log(doc.data());
                    
                    try {
                        memberDetails.push({ id: doc.id, name: doc.data().name });
                        const member = new CometChat.GroupMember(doc.id, CometChat.GROUP_MEMBER_SCOPE.ADMIN);
                        members.push(member);
                    } catch (error) {
                        console.error('Error adding member:', error);
                        
                    }
                });
                const GUID = "group_" + new Date().getTime();
                const group = new CometChat.Group(GUID, groupName, CometChat.GROUP_TYPE.PUBLIC, '', 'https://firebasestorage.googleapis.com/v0/b/voluntech-18f11.appspot.com/o/users%2Fproof%2Fgroup.png?alt=media&token=4cc5db22-16a2-47ff-a66e-8fa486c3a595', groupDescription, true);
                await CometChat.createGroupWithMembers(group, members, []).then(async (createdGroup: any) => {
                    console.log('Group created successfully:', { createdGroup });
                    await addDoc(collection(db, 'groups'), {
                        guid: GUID,
                        name: groupName,
                        description: groupDescription,
                        members: memberDetails,
                        ngo: user.type
                    });
    
                    // Update conversations list
                    const newConversation = {
                        conversationId: 'group_' + createdGroup.guid,
                        conversationType: CometChat.RECEIVER_TYPE.GROUP,
                        lastMessage: null, // No messages yet
                        conversationWith: {
                            name: createdGroup.name,
                            guid: createdGroup.guid,
                            description: createdGroup.description,
                            avatar: createdGroup.icon, // Use the group's icon as the avatar
                        },
                    };
                    setConversations(prevConversations => [newConversation, ...prevConversations]);
    
                    setGroupName('');
                    setGroupDescription('');
                    setCreateGroup(false);
                    setLoading(false);
                }, error => {
                    console.log('Group creation failed with exception:', { error });
                });
            }
        }else
            alert('Please provide all required information');
    };
    

    useEffect(() => {
        if (!userloading && user) {
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
    
            return () => {
                CometChat.removeMessageListener(listenerID);
            };
        }
    }, [user, userloading, createGroup, chatVisible]);

    const updateConversationList = (newMessage: any) => {
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
    };

    const handleChatOpen = async (type: string, conversation: any) => {
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
    };

    const sendMessage = async () => {
        if (message && chatGroup) {
            const textMessage = new CometChat.TextMessage(chatGroup.guid, message, CometChat.RECEIVER_TYPE.GROUP);
            await CometChat.sendMessage(textMessage).then(sentMessage => {
                console.log('Message sent successfully:', { sentMessage });
                setPreviousMessages(prevMessages => [...prevMessages, sentMessage]);
                setMessage('');
                updateConversationList(sentMessage);
            }, error => {
                console.log('Message sending failed with exception:', { error });
            });
        }
    };

    const handleShowUserInfo = async(id: string) => {
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

    return (
        <SafeAreaView style={{ backgroundColor:theme === 'light'?'#f6ffe2':'#1E1E1E', flex: 1, position: 'relative' }} className="mb-[19.4%]">
            {user?.designation === 'head' && <TouchableOpacity style={{backgroundColor:theme === 'light' ? '#83a638' : '#4B6B00'}} className="w-10 h-10 rounded-full absolute bottom-5 right-5 z-40" onPress={() => setCreateGroup(true)}><Text style={{color:theme === 'light' ? 'black' : '#c9c9c9'}} className="text-5xl text-center">+</Text></TouchableOpacity>}
            <ScrollView style={{ flex: 1 }}>
                {conversations.length > 0 ? conversations.map((conversation: any) => {
                    const lastMessage = conversation.lastMessage;
                    const sentAt = lastMessage ? new Date(lastMessage.sentAt * 1000) : null; // Multiplying by 1000 to convert seconds to milliseconds
                    const currentDate = new Date();

                    // Function to check if two dates are on the same day
                    const isSameDay = (date1: any, date2: any) => {
                        return date1.getDate() === date2.getDate() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getFullYear() === date2.getFullYear();
                    };

                    return (
                        <TouchableOpacity
                            style={{ width: "100%", marginVertical: 5 }}
                            key={conversation.conversationId}
                            onPress={() => handleChatOpen(conversation.conversationType, conversation.conversationWith)}
                        >
                            <View className="flex-row w-full">
                                <TouchableOpacity className="w-1/5">
                                    <Image source={{ uri: conversation.conversationWith.icon }} style={{ height: 50, width: 50, zIndex: 40, borderColor:theme === 'light' ? 'black' : 'white',borderWidth:2, backgroundColor:theme === 'light' ? 'black' : 'white'}} className="self-center bg-black rounded-full " />
                                </TouchableOpacity>
                                <View className="w-3/5">
                                    <Text style={{color: theme === 'light' ? 'black' : 'white'}} className="text-xl">{conversation.conversationWith.name}</Text>
                                    <Text style={{color: theme === 'light' ? 'black' : 'white'}}>
                                        {lastMessage ? (lastMessage.text ? `${lastMessage.sender.uid === user.id.toLowerCase() ? 'You' : lastMessage.sender.name} : ${lastMessage.text}` : lastMessage.message) : ""}
                                    </Text>
                                </View>
                                <View className="w-1/5 flex-col justify-center">
                                    {sentAt && (
                                        isSameDay(sentAt, currentDate) ? (
                                            <Text style={{color: theme === 'light' ? 'black' : 'white'}} className="text-center">{`${sentAt.getHours().toString().padStart(2, '0')}:${sentAt.getMinutes().toString().padStart(2, '0')}`}</Text>
                                        ) : (
                                            <Text style={{color: theme === 'light' ? 'black' : 'white'}} className="text-center">{sentAt.toLocaleDateString()}</Text>
                                        )
                                    )}
                                    {conversation.unreadMessageCount > 0 && (
                                        <Text style={{color: theme === 'light' ? 'black' : 'white', backgroundColor:theme === 'light' ? '#a0e50b' : '#234006'}} className="rounded-full flex-shrink text-center self-center min-w-[20]">{conversation.unreadMessageCount}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }) : <Text style={{color:theme === 'light' ? '#134006' : '#74a608'}} className="self-center my-[60%] text-4xl text-[#134006]">No chats found</Text>}

            </ScrollView>
            <Modal
                animationType="slide"
                visible={chatVisible}
                onRequestClose={() => setChatVisible(false)}
            >
                {chatGroup && <View style={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E'}} className="flex-row pb-2">
                    <TouchableOpacity className="w-1/4" onPress={() => setShowGroupInfo(true)}>
                        {chatGroup.icon && <Image source={{ uri: chatGroup.icon }} style={{ height: 50, width: 50, zIndex: 40,backgroundColor:theme === 'light' ? 'black' : 'white'}} className="self-center rounded-full" />}
                    </TouchableOpacity>
                    <View className="w-3/4">
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-xl">{chatGroup.name}</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} >{chatGroup.membersCount} members</Text>
                    </View>
                </View>}    
                <View style={{ flex: 1, paddingBottom: 62, backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E' }}>
                    <ScrollView style={{ flex: 1, backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E' }}>
                        {previousMessages.length > 0 && previousMessages.map((message: any, index) => {
                            return (
                                <ScrollView key={index}>
                                    {message.action === 'added' && <View className="flex-row justify-center mb-2"><Text style={{backgroundColor:theme === 'light' ? '#4ADE80' : '#2A9D47', color:theme === 'light' ? 'black' : 'white'}} className="text-center flex-shrink self-start p-1 rounded-lg">{message.message}</Text></View>}
                                    {message.action === 'joined' && <View className="flex-row justify-center mb-2"><Text style={{backgroundColor:theme === 'light' ? '#4ADE80' : '#2A9D47', color:theme === 'light' ? 'black' : 'white'}} className="text-center flex-shrink self-start p-1 rounded-lg">{message.actionBy.name} was added to the group</Text></View>}
                                    {message.action === 'kicked' && <View className="flex-row justify-center mb-2"><Text style={{backgroundColor:theme === 'light' ? '#4ADE80' : '#2A9D47', color:theme === 'light' ? 'black' : 'white'}} className="text-center flex-shrink self-start p-1 rounded-lg">{message.actionOn.name} was kicked out of the group</Text></View>}
                                    {message.category === 'message' && message.text && message.sender.uid === user.id.toLowerCase() && (
                                        <View className="flex-row justify-end mr-4 mb-2">
                                            <View style={{backgroundColor:theme === 'light' ? '#a0e50b' : '#6BAF0A'}} className="flex-col max-w-[80%] rounded-lg flex-shrink">
                                                <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="p-1 px-2 rounded-lg flex-row self-end">{message.text}</Text>
                                                <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="p-1 px-2 rounded-lg flex-row self-end">{`${new Date(message.sentAt * 1000).getHours().toString().padStart(2, '0')}:${new Date(message.sentAt * 1000).getMinutes().toString().padStart(2, '0')}`} <Text className={`${message.receiptStatus === 'read' ? 'text-blue-500' : ''}`}>{message.receiptStatus === 'read' ? '√√' : message.receiptStatus === 'delivered' ? '√√' : '√'}</Text></Text>
                                            </View>
                                        </View>
                                    )}
                                    {message.category === 'message' && message.text && message.sender.uid !== user.id.toLowerCase() && (
                                        <View className="flex-row justify-start ml-4 mb-2">
                                            <Image source={{ uri: message.sender.avatar }} style={{ height: 35, width: 35, marginRight: 5, marginTop: 5 }} className="rounded-full" />
                                            <View className="flex-col w-full ">
                                                <Text style={{color:theme === 'light' ? 'black' : 'white'}}>{message.sender.name}</Text>
                                                <View style={{backgroundColor:theme === 'light' ? '#a0e50b' : '#6BAF0A'}} className="flex-col max-w-[80%] flex-shrink rounded-lg self-start">
                                                    <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="p-1 px-2 rounded-lg flex-row self-start">{message.text}</Text>
                                                    <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="p-1 px-2 rounded-lg flex-row self-end">{`${new Date(message.sentAt * 1000).getHours().toString().padStart(2, '0')}:${new Date(message.sentAt * 1000).getMinutes().toString().padStart(2, '0')}`}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            )
                        })}
                    </ScrollView>
                </View>
                <View style={{borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white',backgroundColor:theme === 'light' ? '#f6ffe2' : '#3A3A3A'}} className="bottom-0 absolute flex-row mb-2 rounded-full border h-[50px] w-[85%] self-center px-2 bg-[#f6ffe2]">
                    <TextInput style={{color: theme === 'light' ? 'black' : 'white'}}  placeholderTextColor={theme === 'light' ? 'grey' : '#CCCCCC'} placeholder="Type a message" value={message} onChangeText={text => setMessage(text)} className="w-4/5 px-2" />
                    <TouchableOpacity className="flex justify-center w-1/5 rounded-full"><TouchableOpacity style={{backgroundColor:message ? theme === 'light' ? '#a0e50b' : '#6BAF0A' : 'transparent'}} className={` w-10 h-10 flex-col justify-center rounded-full self-end`} onPress={() => sendMessage()}><Image source={require('@/assets/images/send.png')} style={{tintColor: theme === 'light' ? 'grey' : 'white'}} className="self-center" /></TouchableOpacity></TouchableOpacity>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={createGroup}
                onRequestClose={() => setCreateGroup(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <TextInput className="h-12 w-[80%] bg-white mb-5 rounded-xl px-4" placeholder="Group Name" value={groupName} onChangeText={text => setGroupName(text)} />
                    <TextInput className="h-12 w-[80%] bg-white mb-5 rounded-xl px-4" placeholder="Description" value={groupDescription} onChangeText={text => setGroupDescription(text)} />
                    <TouchableOpacity className="bg-black p-2 rounded-full" onPress={() => handleGroupCreation()}>
                        {!loading && <Text className="text-white text-xl">Create Group</Text>}
                        {loading && <ActivityIndicator size="large" color="#fff" />}
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                visible={showGroupInfo}
                onRequestClose={() => setShowGroupInfo(false)}
            >
                {chatGroupInfo && <ScrollView style ={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E'}} className="flex-1">
                    <View style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="pb-2">
                        {chatGroupInfo.icon && <Image source={{ uri: chatGroupInfo.icon }} style={{backgroundColor:theme === 'light' ? 'black' : 'white'}} className="h-40 w-40 self-center mt-4 rounded-full" />}
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-3xl text-center">{chatGroupInfo.name}</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-xl text-center">{chatGroupInfo.membersCount} members</Text>
                    </View>
                    <View style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="mt-4 px-6 py-1">
                        <Text style={{color:theme === 'light' ? '#e6ffaf' : '#74A608'}} className="text-2xl text-[#e6ffaf] mb-1">Group Description</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-lg">{chatGroupInfo.description}</Text>
                    </View>
                    <Text style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D',color:theme === 'light' ? 'black' : 'white'}} className="mt-4 px-6 min-h-12 text-lg py-1">
                        Created at {new Date(chatGroupInfo.createdAt * 1000).toLocaleString()} by {chatGroupMembers.find((member: any) => member.uid === chatGroupInfo.owner)?.name}
                    </Text>
                    <View  style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="mt-4 px-6 py-1">
                        <Text style={{color:theme === 'light' ? '#e6ffaf' : '#74A608'}} className="text-2xl mb-3">Members</Text>
                        {chatGroupMembers && chatGroupMembers.reverse().map((member: any) => (
                            <View className="flex-row mb-2">
                                <TouchableOpacity onPress={() => handleShowUserInfo(member.uid)}><Image source={{ uri: member.avatar }} className="h-12 w-12 rounded-full self-center" /></TouchableOpacity>
                                <Text style={{color:theme === 'light' ? 'black' : 'white'}} key={member.uid} className="text-lg w-3/5 ml-3 self-center">{member.name}</Text>
                                <Text style={{color:theme === 'light' ? '#e6ffaf' : '#74A608'}} className="text-lg self-center">{member.scope === 'admin' && 'Admin'}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>}
            </Modal>
            <Modal
                animationType="slide"
                visible={showUserInfo}
                onRequestClose={() => setShowUserInfo(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        {userInfo && <View style={styles.profile}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: userInfo?.image }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>Name: {userInfo.name}</Text>
                            <Text style={[styles.skill, { color: '#1E1E1E' }]}>Skill: {mapping[userInfo.skill]}</Text>
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>Status:</Text>
                                <Text>{userInfo.status ? userInfo.status : '-'}</Text>
                            </View>
                        </View>
                    </View>}
                    {userInfo && <View style={styles.additionalInfo}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Contact Number</Text>
                            <Text style={styles.infoText}>{`91+ ${userInfo.phone}`}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Availability</Text>
                            <Text style={styles.infoText}>{userInfo.availability ? userInfo.availability : '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Profession</Text>
                            <Text style={styles.infoText}>{userInfo.profession ? userInfo.profession : '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Experience</Text>
                            <Text style={styles.infoText}>{userInfo.experience ? userInfo.experience : '-'}</Text>
                        </View>
                        {userInfo.type !== 'normal' && <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>NGO</Text>
                                <Text style={styles.infoText}>{user.type.name}</Text>
                        </View>}
                    </View>}
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const createStyles = (theme) => StyleSheet.create({
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor: '#83A638',
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginHorizontal: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        width: "90%"
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 10,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    skill: {
        fontSize: 16,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusText: {
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    picker: {
        height: 40,
        width: 150,
    },
    backButton: {
        alignSelf: 'center',
        marginTop: 20,
        padding: 10,
        backgroundColor: '#83A638',
        borderRadius: 5,
    },
    backButtonText: {
        height:30,
        width:30,
        tintColor: '#fff',
    },
    additionalInfo: {
        padding: 15,
        width: "90%",
        position: 'relative',
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        width: "33%",
        alignSelf: 'center' // Adjust width as needed
    },
    infoText: {
        flex:1,
        flexWrap:'wrap',
        alignSelf: 'center'
    },
    signOutButton: {
        height:35,
        width:70,
        alignSelf: 'center',
        margin:20,
        padding:5,
        backgroundColor:'#83A638',
        borderRadius: 7,
    },
    signOutText: {
        alignSelf: 'center',
        color:'white',
        padding:'auto'
    }
});