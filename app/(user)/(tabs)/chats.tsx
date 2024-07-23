import * as SecureStore from 'expo-secure-store';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Modal, TextInput, ScrollView, Image } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeContext";
import { mapping } from "@/data/tasks";
import { chatOpenHandler, sendMessageHandler, showUserInfoHandler, groupJoinSubscriptionHandler, conversationFetchHandler, conversationListUpdateHandler } from "@/firebase/user/chats";

export default function Chats1() {
    const [user, setUser] = useState<any>(null);
    const [userloading, setUserLoading] = useState<boolean>(true);
    const [chatVisible, setChatVisible] = useState<boolean>(false);
    const [previousMessages, setPreviousMessages] = useState<any[]>([]);
    const [chatGroup, setChatGroup] = useState<any>(null);
    const [showUserInfo, setShowUserInfo] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);
    const [chatGroupInfo, setChatGroupInfo] = useState<any>(null);
    const [chatGroupMembers, setChatGroupMembers] = useState<any[]>([]);
    const [joinGroup, setJoinGroup] = useState<boolean>(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [message, setMessage] = useState<string>('');
    const { theme } = useTheme();
    const styles = createStyles(theme);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await SecureStore.getItemAsync('user');
            if (user) {
                const userData = JSON.parse(user);
                setUser(userData);
                setUserLoading(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userloading && user) {
            const unsubscribe = groupJoinSubscriptionHandler(setJoinGroup);

            return () => unsubscribe();
        }
    })

    useEffect(() => {
        if (!userloading && user) {
            conversationFetchHandler(user, chatGroup, updateConversationList, setConversations, setPreviousMessages);
        }
    }, [user, userloading, chatVisible, joinGroup]);

    const updateConversationList = (newMessage: any) => conversationListUpdateHandler(newMessage, setConversations);

    const handleChatOpen = (type: string, conversation: any) => chatOpenHandler(type, user, conversation, setChatGroup, setChatVisible, setChatGroupInfo, setPreviousMessages, setChatGroupMembers);

    const sendMessage = () => sendMessageHandler(message, chatGroup, setMessage, setPreviousMessages, updateConversationList);

    const handleShowUserInfo = (id: string) => showUserInfoHandler(id, setUserInfo, setShowUserInfo);

    return (
        <SafeAreaView style={{ backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E', flex: 1 }}>
            <ScrollView>
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
                                    <Image source={{ uri: conversation.conversationWith.icon }} style={{ height: 50, width: 50, zIndex: 40, borderColor:theme === 'light' ? 'black' : 'white',borderWidth:2, backgroundColor:theme === 'light' ? 'black' : 'white'}} className="self-center rounded-full " />
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
                                        <Text style={{color: theme === 'light' ? 'black' : 'white',backgroundColor:theme === 'light' ? '#a0e50b' : '#234006'}} className="rounded-full bg-[#a0e50b] flex-shrink text-center self-center min-w-[20]">{conversation.unreadMessageCount}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }) : <Text className="self-center my-[60%] text-4xl text-[#134006]">No chats found</Text>}
            </ScrollView>
            <Modal
                animationType="slide"
                visible={chatVisible}
                onRequestClose={() => setChatVisible(false)}
            >
                {chatGroup && <View style={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E'}} className="flex-row bg-[#f6ffe2] pb-2">
                    <TouchableOpacity className="w-1/4" onPress={() => setShowGroupInfo(true)}>
                        <Image source={{ uri: chatGroup.icon }} style={{ height: 50, width: 50, zIndex: 40, backgroundColor:theme === 'light' ? 'black' : 'white'}} className="self-center bg-black rounded-full" />
                    </TouchableOpacity>
                    <View className="w-3/4">
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-xl">{chatGroup.name}</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}}>{chatGroup.membersCount} members</Text>
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
                <View style={{borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white',backgroundColor:theme === 'light' ? '#f6ffe2' : '#3A3A3A'}} className="bottom-0 absolute flex-row mb-2 rounded-full border h-[50px] w-[85%] self-center px-2">
                    <TextInput style={{color: theme === 'light' ? 'black' : 'white'}} placeholderTextColor={theme === 'light' ? 'grey' : '#CCCCCC'} placeholder="Type a message" value={message} onChangeText={text => setMessage(text)} className="w-4/5 px-2" />
                    <TouchableOpacity className="flex justify-center w-1/5 rounded-full"><TouchableOpacity  style={{backgroundColor:message ? theme === 'light' ? '#a0e50b' : '#6BAF0A' : 'transparent'}} className={` w-10 h-10 flex-col justify-center rounded-full self-end`} onPress={() => sendMessage()}><Image source={require('@/assets/images/send.png')} style={{tintColor: theme === 'light' ? 'grey' : 'white'}} className="self-center" /></TouchableOpacity></TouchableOpacity>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                visible={showGroupInfo}
                onRequestClose={() => setShowGroupInfo(false)}
            >
                {chatGroupInfo && <ScrollView style ={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E'}} className="flex-1">
                    <View style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="pb-2">
                        {chatGroupInfo.icon && <Image style={{backgroundColor:theme === 'light' ? 'black' : 'white'}} source={{ uri: chatGroupInfo.icon }} className="h-40 w-40 self-center mt-4 bg-black rounded-full" />}
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-3xl text-center">{chatGroupInfo.name}</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-xl text-center">{chatGroupInfo.membersCount} members</Text>
                    </View>
                    <View style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="mt-4 px-6 py-1">
                        <Text style={{color:theme === 'light' ? '#e6ffaf' : '#74A608'}} className="text-2xl mb-1">Group Description</Text>
                        <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="text-lg">{chatGroupInfo.description}</Text>
                    </View>
                    <Text style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D',color:theme === 'light' ? 'black' : 'white'}} className="mt-4 px-6 min-h-12 text-lg py-1">
                        Created at {new Date(chatGroupInfo.createdAt * 1000).toLocaleString()} by {chatGroupMembers.find((member: any) => member.uid === chatGroupInfo.owner)?.name}
                    </Text>
                    <View style={{backgroundColor:theme === 'light' ? '#83a638' : '#2D2D2D'}} className="mt-4 px-6 py-1">
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
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(46, 46, 46, 0.8)' }}>
                        {userInfo && <View style={styles.profile}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: userInfo?.image }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>Name: {userInfo.name}</Text>
                            <Text style={[styles.skill,]}>Skill: {mapping[userInfo.skill]}</Text>
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>Status:</Text>
                                <Text style={styles.statusText}>{userInfo.status ? userInfo.status : '-'}</Text>
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
                                <Text style={styles.infoText}>{userInfo.type.name}</Text>
                        </View>}
                    </View>}
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const createStyles =(theme : string) =>StyleSheet.create({
    profile: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f0f0f0', borderRadius: 10, marginHorizontal: 10, marginTop: 10, shadowColor: theme === 'dark'?'#fff':'#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5, width: "90%" },
    profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
    name: { fontSize: 17, fontWeight: 'bold', marginBottom: 5, color: theme === 'dark' ? '#74A608' :'#1E1E1E' },
    skill: { fontSize: 16, color: theme === 'dark' ? '#74A608' :'#1E1E1E' },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    statusText: { fontSize: 16, marginRight: 10, color: theme === 'dark' ? '#74A608' :'#1E1E1E' },
    picker: { height: 40, width: 150 },
    backButton: { alignSelf: 'center', marginTop: 20, padding: 10, backgroundColor: '#83A638', borderRadius: 5 },
    backButtonText: { height:30, width:30, tintColor: '#fff' },
    additionalInfo: { padding: 15, width: "90%", position: 'relative', marginTop: 10, backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f0f0f0', borderRadius: 10, shadowColor: theme === 'dark'?'#fff':'#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: theme === 'dark' ? '#74A608' :'#1E1E1E' },
    infoItem: { flexDirection: 'row', marginBottom: 8 },
    infoLabel: { fontWeight: 'bold', marginRight: 5, width: "33%", alignSelf: 'center', color: theme === 'dark' ? '#74A608' :'#1E1E1E' },
    infoText: { flex:1, flexWrap:'wrap', alignSelf: 'center', color: theme === 'dark' ? '#74A608' :'#1E1E1E' }
});