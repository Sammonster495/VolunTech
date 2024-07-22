import { db } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { collection, doc, getDoc, onSnapshot, updateDoc, increment, arrayUnion, addDoc, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Modal, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import ProgressBar from "@/components/ProgressBar";
import { CometChat } from "@cometchat-pro/react-native-chat";
import { useTheme } from "@/theme/ThemeContext";

const mapping: {[key: string]: string} = {
    'rescue': 'Rescue',
    'medical': 'Medical',
    'resource': 'Resource Allocation',
    'finance': 'Finance',
    'transport': 'Transport',
    'shelter': 'Shelter Building',
}

export default function Tasks() {
    const [category, setCategory] = useState<boolean>(true);
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [verifiedReports, setVerifiedReports] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedAction, setSelectedAction] = useState<{id: string, action: string, user: {id: string, name: string}} | null>(null);
    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [userloading, setUserLoading] = useState<boolean>(false);
    const [createTask, setCreateTask] = useState<boolean>(false);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [selectIncident, setSelectedIncidents] = useState<any>(null);
    const [taskLocation, setTaskLocation] = useState<any>();
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [tasks, setTasks] = useState<{[key: string]: number|null}>({ medical: null, transport: null, rescue: null, finance: null, shelter: null, resource: null });
    const [userTasks, setUserTasks] = useState<any[]>([]);
    const [ngoTasks, setNgoTasks] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
      const fetchUserData = async () => {
          const userData = await SecureStore.getItemAsync('ngo');
          if (userData) {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
          }
          setUserLoading(false);
      };
      fetchUserData();
  }, []);

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
                const userDocRef = doc(db, 'users', user.id);
                const userDoc = await getDoc(userDocRef);
                snapshot.docs.forEach(doc => {
                    const task = doc.data();
                    if((!(user?.designation === 'head') || !(user.type['name'] === task.createdBy['ngo']['name'])) && !(JSON.stringify(task.requiredPersonnel) === JSON.stringify(task.volunteeredPersonnel)) && !userDoc.data()?.registeredTasks.includes(doc.id) && Object.keys(task.requiredPersonnel).includes(userDoc.data()?.skill) && task.id) {
                        setUserTasks(prevTasks => {
                            if(prevTasks.findIndex(t => t.id === doc.id) === -1) 
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
                            setUserTasks(prevTasks => {
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

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
                snapshot.docs.forEach(doc => {
                    const task = doc.data();
                    if(user?.designation === 'head' && user.type['name'] === task.createdBy['ngo']['name'] && task.id) {
                        setNgoTasks(prevTasks => {
                            if(prevTasks.findIndex(t => t.id === doc.id) === -1) 
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
                            setNgoTasks(prevTasks => {
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
    }, [userloading, user, ngoTasks]);

    useEffect(() => {
      if(!userloading && user) {
        const unsubscribePending = onSnapshot(collection(db, 'reports'), (snapshot) => {
              snapshot.docs.map(doc => {
                  const report = doc.data();
                  if (report.status === 'pending' && !report.verified) {
                      setPendingReports(prevReports => {
                          if (prevReports.findIndex(r => r.id === doc.id) === -1)
                              return [...prevReports, report];
                          return prevReports;
                      });
                  }
              });
        });

        const unsubscribeVerified = onSnapshot(collection(db, 'reports'), async(snapshot) => {
          const userDocRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userDocRef);
          if (!snapshot.empty) {
              snapshot.docs.map(doc => {
                  const report = doc.data();
                  if (report.status === 'verified') {
                    if (!(userDoc.data()?.viewedVerifiedNotifications.includes(doc.id))) {
                      setVerifiedReports(prevReports => {
                          if(prevReports.findIndex(r => r.id === doc.id) === -1) 
                              return [...prevReports, report];
                          return prevReports;
                      });
                    }
                  }
              })
          }
        });

        return () => {
          unsubscribePending();
          unsubscribeVerified();
        };
    }
  }, [userloading, user, pendingReports, verifiedReports]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
        snapshot.docChanges().forEach(change => {
            if(change.type === 'modified') {
                const user = change.doc.data();
                if(user.viewedVerifiedNotifications)
                    setVerifiedReports(prevReports => {
                        const updatedReports = prevReports.filter(report => !user?.viewedVerifiedNotifications.includes(report.id));
                        return updatedReports;
                    })
            }
        })
    })

    return () => unsubscribe();
}, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), snapshot => {
      snapshot.docChanges().forEach(change => {
          if (change.type === 'removed')
              setPendingReports(prevReports => prevReports.filter(report => report.id !== change.doc.id));
      })
    });

    return () => {
      unsubscribe();
    }
  }, [])

  useEffect(() => {
    if(!userloading && user) {
      const unsubscribe = onSnapshot(collection(db, 'reports'), async(snapshot) => {
          snapshot.docs.map(doc => {
              const report = doc.data();
              if (report.status === 'verified' && report.verified && report.proof['ngoName'] === user.type['name']) {
                  setIncidents(prevIncidents => {
                      if (prevIncidents.findIndex(i => i.id === doc.id) === -1)
                          return [...prevIncidents, report];
                      return prevIncidents;
                  })
              }
          })
      })

      return () => unsubscribe();
    }
  }, [userloading, user])

  useEffect(() => {
    if(!userloading && user) {
      const unsubscribe = onSnapshot(collection(db, 'groups'), async(snapshot) => {
          snapshot.docs.map(doc => {
              const group = doc.data();
              if (group.ngo['id'] === user.type['id']) {
                  setGroups(prevGroups => {
                      if (prevGroups.findIndex(i => i.guid === doc.data().guid) === -1)
                          return [...prevGroups, group];
                      return prevGroups;
                  })
              }
          })
      })

      return () => unsubscribe();
    }
  }, [userloading, user])

    const timestampToDate = (timestamp: { seconds: number; nanoseconds: number; }) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    const timestampToTime = (timestamp: { seconds: number; nanoseconds: number; }) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedHours = hours.toString().padStart(2, '0');
        return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }

    const handleAction = (id: string, action: string, user: { id: string, name: string }) => {
      setSelectedAction({id, action, user});
      setModalVisible(true);
    };

    const confirmAction = async () => {
      if (selectedAction?.id) {
        const reportRef = doc(db, 'reports', selectedAction.id);
        await updateDoc(reportRef, {
          status: 'verified',
          proof: { id: user.id, name: user.name, ngoId: user.type['id'], ngoName: user.type['name'], time: new Date() },
          verified: selectedAction.action === 'real' ? true : false
        });
        if (selectedAction?.user?.id) {
          await updateDoc(doc(db, 'users', selectedAction.user.id), {
              reported: { fake: increment(selectedAction.action === 'fake' ? 1 : 0), real: increment(selectedAction.action === 'real' ? 1 : 0) }
          });
        await updateDoc(doc(db, 'users', user.id),{
          proved: increment(1)
        })
        setPendingReports(pendingReports.filter(report => report.id !== selectedAction.id));
      }
      setModalVisible(false);
      }
    };

    const handleSearch = async (data: any, details: any) => {
        if (details) {
            const { lat, lng } = details.geometry.location;
            try {
                const locationData = {
                    address: data.description || 'Unknown location',
                    latitude: lat,
                    longitude: lng
                };
                console.log(locationData);
                setTaskLocation(locationData);
            } catch (error) {
                console.error(error);
            }
            
        }
    };

    const handleCreateTask = async () => {
        if (taskLocation && taskDescription && selectedGroup && Object.values(tasks).some(value => value !== null)) {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.id);
            const requiredPersonnel = Object.fromEntries(Object.entries(tasks).filter(([key, value]) => value !== null))
            const volunteeredPersonnel = Object.fromEntries(Object.entries(requiredPersonnel).map(([key, value]) => [key, 0]))
            const reportDocRef = await addDoc(collection(db, 'tasks'), {
                id: null,
                group: { guid: selectedGroup.guid, name: selectedGroup.name },
                createdBy: { id: user.id, name: user.name, ngo: user.type },
                incident: selectIncident ? { id: selectIncident.id, description: selectIncident.description } : null,
                location: {latitude: taskLocation.latitude, longitude: taskLocation.longitude, address: taskLocation.address},
                description: taskDescription,
                personnel: [],
                requiredPersonnel: requiredPersonnel,
                volunteeredPersonnel: volunteeredPersonnel,
                createdAt: new Date()
            })
            await updateDoc(reportDocRef, {
                id: reportDocRef.id,
            })
            await updateDoc(userDocRef, {
                createdTasks: arrayUnion({id: reportDocRef.id, description: taskDescription })
            });
            setTaskDescription('');
            setTasks({ medical: null, transport: null, rescue: null, finance: null, shelter: null, resource: null });
            setTaskLocation(null);
            setSelectedIncidents(null);
            setCreateTask(false);
            setLoading(false);
        }else
            alert('Please fill all the required fields');
    }

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
                setUserTasks(prevTasks => {
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
            <View style={{justifyContent: 'center',alignContent: 'center',alignItems: 'center',padding: 10,marginBottom: 10,}} key={item.type}>
                <Text style={{color:theme === 'light' ? 'black' : '#ffffff',marginBottom:0}}>{mapping[item.type]}</Text>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <ProgressBar progress={item.signedup / item.required} signed={item.signedup} required={item.required} />
                </View>
            </View>
        );
    }

    return (
      <GestureHandlerRootView>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#1E1E1E' : '#f6ffe2'}} className="mb-[19.4%]">
      <View style={{ flex: 1, width: "100%" }}>
          <View className="flex-row pt-2 ">
              <TouchableOpacity className="w-1/2 flex-col" onPress={() => setCategory(true)}>
                  <Text style={{color: theme === 'light' ? 'black' : 'white'}} className="text-center text-xl">Tasks</Text>
                  {category && <View style={{backgroundColor:'light' ? '#4ade80' : '#74A608'}} className="h-[2px]"></View>}
              </TouchableOpacity>
              <TouchableOpacity className="w-1/2 flex-col" onPress={() => setCategory(false)}>
                  <Text style={{color: theme === 'light' ? 'black' : 'white'}} className="text-center text-xl">Notifications</Text>
                  {!category && <View style={{backgroundColor:'light' ? '#4ade80' : '#74A608'}} className="h-[2px]"></View>}
              </TouchableOpacity>
          </View>
          {!category && (
              <View style={{ flex: 1 }} className="h-auto gap-y-4">
                  {pendingReports.length > 0 && (
                      <FlatList
                          data={pendingReports}
                          keyExtractor={(item, index) => index.toString()}
                          className="py-3"
                          renderItem={({ item }) => (
                            <View className="flex p-5 mb-5 self-center bg-[#83a638] rounded-xl" style={{ width: "90%", backgroundColor:theme === 'light' ? '#83a638' : '#4B6B00'}}>
                                  <Image source={{ uri: item.image }} className="h-56 w-48 mb-5 rounded-xl self-center" />
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md flex-row">
                                      <Text style={{ fontSize: 16 }} className="w-2/5">Reported by : </Text>
                                      <Text className="text-black w-3/5" style={{ fontSize: 16 }}>{item.user['name']}</Text>
                                  </View>
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md">
                                      <Text className="text-black" style={{ fontSize: 16 }}>{item.description}</Text>
                                  </View>
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md">
                                      <Text className="text-black" style={{ fontSize: 16 }}>{item.location['address']}</Text>
                                  </View>
                                  <View className="flex-row justify-between">
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToDate(item.createdAt)}</Text>
                                      </View>
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToTime(item.createdAt)}</Text>
                                      </View>
                                  </View>
                                  <View className="flex-row justify-around">
                                      <TouchableOpacity className="bg-black w-[30%] h-10 flex justify-center items-center rounded-2xl self-center " onPress={() => handleAction(item.id, 'real', {id: item.user['id'], name: item.user['name']})}><Text className="text-white text-xl">REAL</Text></TouchableOpacity>
                                      <TouchableOpacity className="bg-black w-[30%] h-10 flex justify-center items-center rounded-2xl self-center " onPress={() => handleAction(item.id, 'fake', {id: item.user['id'], name: item.user['name']})}><Text className="text-white text-xl">FAKE</Text></TouchableOpacity>
                                  </View>
                              </View>
                          )}
                      />
                  )}
                  {verifiedReports.length > 0 && (
                      <FlatList
                          data={verifiedReports}
                          keyExtractor={(item, index) => index.toString()}
                          className=""
                          renderItem={({ item }) => (
                              <View className="flex p-5 mb-5 self-center bg-[#83a638] rounded-xl" style={{ width: "90%" }}>
                                  <TouchableOpacity style={{ width: "100%", display: 'flex' }} onPress={() => {
                                    const userDocRef = doc(db, 'users', user.id);
                                    updateDoc(userDocRef, {
                                        viewedVerifiedNotifications: arrayUnion(item.id)
                                    });
                                  }}>
                                    <Image source={require('@/assets/images/close.png')} className="self-end" />
                                </TouchableOpacity>
                                  <Image source={{ uri: item.image }} className="h-56 w-48 mb-5 rounded-xl self-center" />
                                  {item.name && <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md flex-row">
                                      <Text style={{ fontSize: 16 }} className="w-2/5">Reported by : </Text>
                                      <Text className="text-black w-3/5" style={{ fontSize: 16 }}>{item.user['name']}</Text>
                                  </View>}
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md">
                                      <Text className="text-black" style={{ fontSize: 16 }}>{item.description}</Text>
                                  </View>
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md">
                                      <Text className="text-black" style={{ fontSize: 16 }}>{item.location['address']}</Text>
                                  </View>
                                  {item.createdAt && <View className="flex-row justify-between">
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToDate(item.createdAt)}</Text>
                                      </View>
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToTime(item.createdAt)}</Text>
                                      </View>
                                  </View>}
                                  <View className="p-2 px-3 mb-3 bg-[#e6ffaf] rounded-md flex-row">
                                      <Text style={{ fontSize: 16 }} className="w-2/5">Verified by : </Text>
                                      <Text className="text-black w-3/5" style={{ fontSize: 16 }}>{item.proof['name']} ({item.proof['ngoName']})</Text>
                                  </View>
                                  <View className="flex-row justify-between">
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToDate(item.proof['time'])}</Text>
                                      </View>
                                      <View className="p-2 px-3 mb-3 w-[48%] bg-[#e6ffaf] rounded-md">
                                          <Text className="text-black" style={{ fontSize: 16 }}>{timestampToTime(item.proof['time'])}</Text>
                                      </View>
                                  </View>
                                  <View className="p-2 px-3 mb-3 bg-black rounded-md">
                                      <Text className="text-white text-center" style={{ fontSize: 24 }}>Verified to be {item.verified ? 'real' : 'fake'}</Text>
                                  </View>
                              </View>
                          )}
                      />
                  )}
                    {!(pendingReports.length > 0) && !(verifiedReports.length > 0) && <View><Text style={{color:theme === 'light' ? '#134006' : '#74A608'}} className="text-center text-4xl my-[60%]">No incidents reported or verified</Text></View>}
              </View>
          )}
          {category && (
              <View style={{ flex: 1, position: 'relative' }}> 
                {user?.designation === 'head' &&
                  <TouchableOpacity style={{backgroundColor:theme === 'light' ? '#83a638' : '#4B6B00'}} className="w-10 h-10 rounded-full absolute bottom-5 right-5 z-40" onPress={() => setCreateTask(true)}><Text style={{color: theme === 'light' ? 'black' : '#c9c9c9'}} className="text-5xl text-center">+</Text></TouchableOpacity>
                }
                {(userTasks.length > 0 || ngoTasks.length > 0) && <FlatList
                    style={{flexGrow: 1}}
                    data={userTasks.length > 0 ? userTasks : ngoTasks}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{display: 'flex', backgroundColor:theme === 'light' ? '#83a638' :'#234006', width: "90%", justifyContent: 'center', borderRadius: 20, marginVertical: 10, paddingBottom: 10}} className="self-center">
                            <View style={{flexDirection: 'row', alignItems: 'center', width: 270, paddingLeft: 25, paddingTop: 10,}}>
                                <Image 
                                    style={{marginRight: 7,}}
                                    source={require('@/assets/images/notifications.png')}
                                />
                                <View>
                                    <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',marginBottom:3, marginRight: 10}}>{item.description}</Text>
                                    <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',marginBottom:3, marginRight: 10}}>({item?.createdBy['ngo']['name']})</Text>
                                </View>
                            </View>
                            <View className="flex-row px-5">
                            <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',padding:5, textAlign: 'center'}} className="self-center">Location :</Text>
                            <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',padding:5, textAlign: 'center'}} className="w-4/5">{item?.location?.address}</Text>
                            </View>
                            <View style={{flexDirection: 'column',alignItems: 'center',justifyContent: 'center',paddingTop: 10,}}>
                                {Object.keys(item?.requiredPersonnel).map(key => (
                                    renderTask({ type: key, signedup: item?.volunteeredPersonnel[key], required: item?.requiredPersonnel[key] })
                                ))}
                                {!(user.designation === 'head') && userTasks.length > 0 && <TouchableOpacity style={{backgroundColor: '#DCE31A',height: 42,width: 149,justifyContent: 'center',alignContent: 'center',alignItems: 'center',borderRadius: 18,marginTop: 30,marginBottom: 20,}} onPress={() => handleRegister(item)}>
                                    {!loading && <Text>Register For Task</Text>}
                                    {loading && <ActivityIndicator size="large" color="#0000ff" />}
                                </TouchableOpacity>}
                            </View>
                        </View>
                    )}
                />}
                {!(userTasks.length > 0) && !(ngoTasks.length > 0) && <View className="flex-1"><Text style={{color:theme === 'light' ? '#134006' : '#74a608'}} className="text-center text-4xl  my-[60%]">No tasks uploaded</Text></View>}
              </View>
          )}
      </View>
      <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, marginBottom: 20 }}>Are you sure you want to mark this as {selectedAction?.action}?</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <TouchableOpacity
                                style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, width: '45%', alignItems: 'center' }}
                                onPress={() => confirmAction()}
                            >
                                {!loading && <Text style={{ color: 'white', fontSize: 16 }}>Confirm</Text>}
                                {loading && <ActivityIndicator color="white" size="small" />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, width: '45%', alignItems: 'center' }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={createTask}
                onRequestClose={() => setCreateTask(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <Text style={{color:theme === 'light' ? '#e6ffaf' : '#74A608'}} className="text-3xl text-center pb-3">Create Task</Text>
                    <View style={{ width: "90%", backgroundColor:theme === 'light' ? '#83a638' : '#234006', padding: 15, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'column', width: '100%' }}>
                            <View style={{backgroundColor:theme === 'light' ? '#e6ffaf' : '#E4FCB1'}} className="flex overflow-hidden self-center items-center justify-center rounded-3xl h-12 w-[95%] mb-1">
                                <Picker
                                    selectedValue={selectIncident}
                                    onValueChange={(itemValue, itemIndex) => setSelectedIncidents(itemValue)}
                                    style={{ backgroundColor:theme === 'light' ? '#e6ffaf' : '#E4FCB1', width: "90%", justifyContent: 'center' }}
                                >
                                    <Picker.Item label="Incident(Optional)" value="" />
                                    {incidents.map(incident => <Picker.Item label={incident.description} value={incident} key={incident.id} />)}
                                </Picker>
                            </View>
                            <View className="flex overflow-hidden self-center items-center justify-center bg-[#e6ffaf] rounded-3xl h-12 w-[95%] mb-1">
                                <Picker
                                    selectedValue={selectedGroup}
                                    onValueChange={(itemValue, itemIndex) => setSelectedGroup(itemValue)}
                                    style={{ backgroundColor: '#e6ffaf', width: "90%", justifyContent: 'center' }}
                                >
                                    <Picker.Item label="Group Chat" value="" />
                                    {groups.map(group => <Picker.Item label={group.name} value={group} key={group.guid} />)}
                                </Picker>
                            </View>
                            <View className="self-center w-[95%] items-center bg-[#e6ffaf] justify-center rounded-3xl mb-1">
                              <GooglePlacesAutocomplete
                                  placeholder='Location...'
                                  fetchDetails={true}
                                  onPress={(data, details = null) => handleSearch(data, details)}
                                  query={{
                                      key: "AIzaSyBqeTB4Vbev342dA6b4PWZf-H3S1QTZyrM",
                                      language: "en",
                                  }}
                                  styles={{
                                      container: { flex: 0, width: "80%", top: 2 },
                                      row: { backgroundColor: "#e6ffaf" },
                                      listView: { borderRadius: 30, marginBottom: 4 },
                                      textInput: { paddingHorizontal: 4, backgroundColor: '#e6ffaf', fontSize: 16 }
                                  }}
                              />
                            </View>
                            <View className="self-center h-12 flex justify-center w-[95%] bg-[#e6ffaf] rounded-3xl px-8 mb-1">
                                  <TextInput placeholder="Description of the task" className="text-[16px]" value={taskDescription} onChangeText={text => setTaskDescription(text)} />
                            </View>
                            <View className="mb-2">
                                {[{ name: 'Medical', value: 'medical' }, { name: 'Transport', value: 'transport' }, { name: 'Rescue', value: 'rescue' }, { name: 'Finance', value: 'finance' }, { name: 'Shelter Building', value: 'shelter' }, { name: 'Resource Allocation', value: 'resource' }].map(task => (
                                  <View className="flex-row h-9 justify-around mt-1">
                                    <Text style={{color:theme === 'light' ? 'black' : 'white'}} className="w-1/2 self-center">{task.name}</Text>
                                    <TextInput placeholder="" keyboardType="phone-pad" value={tasks[task.value]?.toString()} key={task.value} className="w-1/5 bg-[#e6ffaf] rounded-3xl px-3 text-center" onChangeText={text => setTasks(prevTasks => ({ ...prevTasks, [task.value]: parseInt(text, 10) || null}))} />
                                </View>
                                ))}
                            </View>
                            <View className="flex-row w-[90%] justify-around self-center mt-2 h-8">
                                <TouchableOpacity className="bg-black w-20 rounded-full" onPress={() => setCreateTask(false)}><Text className="text-white text-xl text-center">Cancel</Text></TouchableOpacity>
                                <TouchableOpacity className="bg-black w-20 rounded-full" onPress={() => handleCreateTask()}>
                                    {!loading && <Text className="text-white text-xl text-center">Create</Text>}
                                    {loading && <ActivityIndicator color="white" size="large" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
    </SafeAreaView>
      </GestureHandlerRootView>
  );
}
