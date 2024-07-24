import { db } from "@/firebase/firebaseConfig"
import { Stack } from "expo-router"
import { arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store';
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export default function User() {
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [verifiedReports, setVerifiedReports] = useState<any[]>([]);
    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await SecureStore.getItemAsync('ngo');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (!loading && user) {
            const unsubscribePending = onSnapshot(collection(db, 'reports'), async (snapshot) => {
                const userDocRef = doc(db, 'users', user.id);
                const userDoc = await getDoc(userDocRef);
                snapshot.docs.forEach(doc => {
                    const report = doc.data();
                    if (report.status === 'pending' && !report.verified) {
                        if (!(userDoc.data()?.viewedPendingReports.includes(doc.id))) {
                            setPendingReports(prevReports => {
                                if(prevReports.findIndex(r => r.id === doc.id) === -1) {
                                    return [...prevReports, report];
                                }return prevReports;
                            });
                        }
                    }
                });
            });

            const unsubscribeVerified = onSnapshot(collection(db, 'reports'), async (snapshot) => {
                const userDocRef = doc(db, 'users', user.id);
                const userDoc = await getDoc(userDocRef);
                snapshot.docs.forEach(doc => {
                    const report = doc.data();
                    if (report.status === 'verified') {
                        if (!(userDoc.data()?.viewedVerifiedReports.includes(doc.id))) {
                            setVerifiedReports(prevReports => {
                                if(prevReports.findIndex(r => r.id === doc.id) === -1) {
                                    return [...prevReports, report];
                                }return prevReports;
                            });
                        }
                    }
                });
            });

            return () => {
                unsubscribePending();
                unsubscribeVerified();
            };
        }
    }, [loading, user]);

    return (
        <>
            <View style={{ flex: 1, flexDirection: 'column', marginTop: 9, width: "100%", position: 'absolute', zIndex: 30 }}>
                {pendingReports.length > 0 && (
                    <FlatList
                        data={pendingReports}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View className="h-auto z-30 p-5 mt-5 self-center bg-yellow-300 rounded-xl" style={{ width: "90%" }}>
                                <TouchableOpacity style={{ width: "100%", display: 'flex' }} onPress={() => {
                                    setPendingReports(pendingReports.filter(report => report.id !== item.id));
                                    const userDocRef = doc(db, 'users', user.id);
                                    updateDoc(userDocRef, {
                                        viewedPendingReports: arrayUnion(item.id)
                                    });
                                }}>
                                    <Image source={require('@/assets/images/close.png')} className="self-end" />
                                </TouchableOpacity>
                                <Text className="text-black text-2xl">{item.description}</Text>
                            </View>
                        )}
                    />
                )}
                {verifiedReports.length > 0 && (
                    <FlatList
                        data={verifiedReports}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View className="h-auto z-30 p-5 mt-5 self-center bg-red-500 rounded-xl" style={{ width: "90%" }}>
                                <TouchableOpacity style={{ width: "100%", display: 'flex' }} onPress={() => {
                                    setVerifiedReports(verifiedReports.filter(report => report.id !== item.id));
                                    const userDocRef = doc(db, 'users', user.id);
                                    updateDoc(userDocRef, {
                                        viewedVerifiedReports: arrayUnion(item.id)
                                    });
                                }}>
                                    <Image source={require('@/assets/images/close.png')} className="self-end" />
                                </TouchableOpacity>
                                <Text className="text-black text-2xl">Incident verified to be {item.verified ? 'real' : 'fake'}</Text>
                            </View>
                        )}
                    />
                )}
            </View>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}} />
                <Stack.Screen name="profile-ngo" options={{
                    headerShown: true, 
                    headerTitle: "Profile", 
                    headerTintColor: theme === 'dark' ? '#83A638': '#1E1E1E',
                    headerTitleStyle: { 
                        fontSize: 30,
                        color: theme === 'dark' ? '#83A638' : 'black',
                    }, 
                    headerTitleAlign: 'center', 
                    headerStyle: { 
                        backgroundColor: theme === 'dark' ? 'black' : '#83A638',
                    }
                }} />
                <Stack.Screen name="about" options={{
                headerShown: true,
                headerTitle: "About Us",
                headerTitleAlign: 'center',
                headerTintColor: theme === 'dark' ? '#83A638': '#1E1E1E',
                headerTitleStyle: { 
                    fontSize: 30,
                    color: theme === 'dark' ? '#83A638' : 'black',
                },
                headerStyle: { 
                    backgroundColor: theme === 'dark' ? 'black' : '#83A638',
                } 
            }} />
            </Stack>
        </>
    )
}