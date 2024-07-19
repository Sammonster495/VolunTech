import { Text, View, StyleSheet, SafeAreaView, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import * as SecureStore from 'expo-secure-store';
import ProgressBar from "@/components/ProgressBar";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, onSnapshot, query, queryEqual, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { CometChat } from "@cometchat-pro/react-native-chat";

const mapping: {[key: string]: string} = {
    'rescue': 'Rescue',
    'medical': 'Medical',
    'resource': 'Resource Allocation',
    'finance': 'Finance',
    'transport': 'Transport',
    'shelter': 'Shelter Building',
}

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userloading, setUserLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await SecureStore.getItemAsync('user');
            if(user){
                const userData = JSON.parse(user);
                setUser(userData);
                setUserLoading(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
                const userDocRef = doc(db, 'users', user.id);
                const userDoc = await getDoc(userDocRef);
                snapshot.docs.forEach(doc => {
                    const task = doc.data();
                    if(!(JSON.stringify(task.requiredPersonnel) === JSON.stringify(task.volunteeredPersonnel)) && !userDoc.data()?.registeredTasks.includes(doc.id) && Object.keys(task.requiredPersonnel).includes(userDoc.data()?.skill) && task.id) {
                        setTasks(prevTasks => {
                            if(prevTasks.findIndex(t => !t.id || t.id === doc.id) === -1) 
                                return [...prevTasks, task];
                            return prevTasks;
                        });
                    }
                });
            });
            return () => unsubscribe();
        }
    },[userloading, user]);

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
                snapshot.docChanges().forEach(change => {
                    if(change.type === 'modified') {
                        const task = change.doc.data();
                        if(task.id) {
                            setTasks(prevTasks => {
                                const index = prevTasks.findIndex(t => t.id === change.doc.id);
                                if(index !== -1) {
                                    prevTasks[index] = task;
                                    return [...prevTasks];
                                }
                                return prevTasks;
                            });
                        }
                    }
                });
            });
            return () => unsubscribe();
        }
    }, [userloading, user]);

    const handleRegister = async (task: any) => {
        try {
            const userDocRef = doc(db, 'users', user.id);
            const userDocSnap = await getDoc(userDocRef);
            const userDoc = userDocSnap.data();
    
            const taskDocRef = doc(db, 'tasks', task.id);
            const taskDocSnap = await getDoc(taskDocRef);
            const taskDoc = taskDocSnap.data();
    
            if (!taskDoc || !userDoc) {
                throw new Error('Document data not found.');
            }
    
            const { personnel = [], volunteeredPersonnel = {} } = taskDoc;
            const { registeredTasks = [], skill } = userDoc;
    
            if ((personnel.length === 0 || !personnel.some(p => p.id === user.id)) &&
                volunteeredPersonnel[skill] !== taskDoc.requiredPersonnel[skill]) {
                setLoading(true);
    
                const updatedPersonnel = [...personnel, { id: user.id, name: user.name }];
                const updatedVolunteeredPersonnel = {
                    ...volunteeredPersonnel,
                    [skill]: (volunteeredPersonnel[skill] || 0) + 1
                };
    
                await updateDoc(taskDocRef, {
                    personnel: updatedPersonnel,
                    volunteeredPersonnel: updatedVolunteeredPersonnel
                });
    
                await updateDoc(userDocRef, {
                    registeredTasks: [...registeredTasks, task.id]
                });
                setTasks(prevTasks => {
                    const index = prevTasks.findIndex(t => t.id === task.id);
                    if(index !== -1) {
                        prevTasks.splice(index, 1);
                        return [...prevTasks];
                    }
                    return prevTasks;
                })
                CometChat.joinGroup(task.group.guid).then(async() => {
                    const member = new CometChat.GroupMember(user.id, CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT);
                    const q = query(collection(db, 'groups'), where('guid', '==', task.group.guid));
                    const querySnapshot = await getDocs(q);
                    if(!querySnapshot.empty){
                        updateDoc(doc(db, 'groups', querySnapshot.docs[0].id), {
                            members: [...querySnapshot.docs[0].data().members, {id: user.id, name: user.name}]
                        })
                    }
                })
                setLoading(false);
            }
        } catch (error) {
            console.error("Error registering for task:", error);
        }
    }
    

    const renderTask = (item:{type:string;signedup:number;required:number}) => {
        return (
            <View style={styles.taskInfo} key={item.type}>
                <Text style={{color:'#ffffff',marginBottom:0}}>{mapping[item.type]}</Text>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <ProgressBar progress={item.signedup / item.required} signed={item.signedup} required={item.required} />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} className="mb-[19.4%]">
            <View style={styles.content}>
                <Text style={styles.header}>Tasks Allocation</Text>
            </View>
            {tasks.length > 0 ? <FlatList
                style={styles.list}
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.task} className="self-center">
                        <View style={styles.taskId}>
                            <Image 
                                style={styles.image}
                                source={require('@/assets/images/profile.png')}
                            />
                            <View>
                                <Text style={{fontSize:16,color:'#ffffff',marginBottom:3, marginRight: 10}}>{item.description}</Text>
                                <Text style={{fontSize:16,color:'#ffffff',marginBottom:3, marginRight: 10}}>({item?.createdBy['ngo']['name']})</Text>
                            </View>
                        </View>
                        <View className="flex-row px-5">
                            <Text style={{fontSize:16,color:'#ffffff',padding:5, textAlign: 'center'}} className="self-center">Location :</Text>
                            <Text style={{fontSize:16,color:'#ffffff',padding:5, textAlign: 'center'}} className="w-4/5">{item.location['address']}</Text>
                        </View>
                        <View style={styles.taskDes}>
                            {Object.keys(item.requiredPersonnel).map(key => (
                                renderTask({ type: key, signedup: item.volunteeredPersonnel[key], required: item.requiredPersonnel[key] })
                            ))}
                            <TouchableOpacity style={styles.register} onPress={() => handleRegister(item)}>
                                {!loading && <Text>Register For Task</Text>}
                                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            /> : <View className="flex-1"><Text className="text-center text-4xl text-[#134006] my-[60%]">No tasks uploaded</Text></View>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6ffe2',
    },
    content: {
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    header: {
        fontSize: 36,
        color: '#74A608',
        justifyContent: 'center',
        marginBottom: 10,
    },
    task: {
        display: 'flex',
        backgroundColor: '#234006',
        width: "90%",
        justifyContent: 'center',
        borderRadius: 20,
        marginVertical: 10,
    },
    taskId: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        width: 270,
        paddingLeft: 25,
        paddingTop: 10,
    },
    taskDes: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    image: {
        height: 54,
        width: 54,
        marginRight: 7,
    },
    taskInfo: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
    },
    register: {
        backgroundColor: '#DCE31A',
        height: 42,
        width: 149,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        marginTop: 30,
        marginBottom: 20,
    },
    list: {
        flexGrow: 1,
    },
});
