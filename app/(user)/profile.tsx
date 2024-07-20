import { useNavigation } from "expo-router";
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from 'react';
import { Picker } from "@react-native-picker/picker";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { CometChat } from "@cometchat-pro/react-native-chat";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";

const mapping: {[key: string]: string} = {
    'rescue': 'Rescue',
    'medical': 'Medical',
    'resource': 'Resource Allocation',
    'finance': 'Finance',
    'transport': 'Transport',
    'shelter': 'Shelter Building',
}

export default function Profile() {
    const navigation = useNavigation();
    const [status, setStatus] = useState('');
    const [user, setUser] = useState<any>();
    const [phone, setPhone] = useState('');
    const [availability, setAvailability] = useState('');
    const [profession, setProfession] = useState('');
    const [experience, setExperience] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSignout(){
        await signOut(auth);
        await CometChat.logout().then(() => {
            console.log('Logout completed successfully');
        }, error => {
            console.log('Logout failed with exception:', { error });
        })
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('expire');
        navigation.navigate('register');
    }

    const fetchUserData = useCallback(async () => {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUser(user);
        }
    }, []);

    const fetchUserDoc = useCallback(async () => {
        if (user) {
            const userDocRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setPhone(userData.phone || '');
                setAvailability(userData.availability || '');
                setProfession(userData.profession || '');
                setExperience(userData.experience || '');
                setStatus(userData.status || 'Part-Time');
            }
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchUserDoc();
    }, [user, fetchUserDoc]);

    const editInfo = async() => {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
            phone: phone,
            availability: availability,
            profession: profession,
            experience: experience
        })
        setLoading(false);
        setIsEditing(false);
    }

    const editStatus = async(userStatus: string) => {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
            status: userStatus
        })
        setStatus(userStatus);
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={{ flex: 1}}>
            {user && <View style={styles.profile}>
                <Image
                    style={styles.profileImage}
                    source={{ uri: user?.image }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>Name: {user.name}</Text>
                    <Text style={[styles.skill, { color: '#1E1E1E' }]}>Skill: {mapping[user.skill]}</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Status:</Text>
                        <Picker
                            selectedValue={status}
                            style={styles.picker}
                            onValueChange={(itemValue) => editStatus(itemValue)}
                        >
                            <Picker.Item label="Part-Time" value="Part-Time"/>
                            <Picker.Item label="Full-Time" value="Full-Time"/>
                        </Picker>
                    </View>
                </View>
            </View>}
            {user && <View style={styles.additionalInfo}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <TouchableOpacity style={{ position: 'absolute', right: 15, top: 20 }} onPress={() => setIsEditing(true)}><Image source={require('@/assets/images/edit.png')} /></TouchableOpacity>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Contact Number</Text>
                    {isEditing ? (
                        <TextInput style={{ flex:1, flexWrap:'wrap', alignSelf: 'center' }} className="border border-black px-2" value={phone} onChangeText={text => setPhone(text)} />
                    ) : (
                        <Text style={styles.infoText}>{`91+ ${phone}`}</Text>
                    )}
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Availability</Text>
                    {isEditing ? (
                        <TextInput style={styles.infoText} className="border border-black px-2" value={availability} onChangeText={text => setAvailability(text)} />
                    ) : (
                        <Text style={styles.infoText}>{availability ? availability : '-'}</Text>
                    )}
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Profession</Text>
                    {isEditing ? (
                        <TextInput style={styles.infoText} className="border border-black px-2" value={profession} onChangeText={text => setProfession(text)} />
                    ) : (
                        <Text style={styles.infoText}>{profession ? profession : '-'}</Text>
                    )}
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Experience</Text>
                    {isEditing ? (
                        <TextInput style={styles.infoText} className="border border-black px-2" value={experience} onChangeText={text => setExperience(text)} />
                    ) : (
                        <Text style={styles.infoText}>{experience ? experience : '-'}</Text>
                    )}
                </View>
                {user.type !== 'normal' && <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>NGO</Text>
                        <Text style={styles.infoText}>{user.type.name}</Text>
                </View>}
                {isEditing && (
                    <TouchableOpacity className="bg-black p-2 rounded-lg" onPress={() => editInfo()}>
                        {!loading && <Text className="text-white text-xl text-center">Edit</Text>}
                        {loading && <ActivityIndicator size="large" color="white" />}
                    </TouchableOpacity>
                )}
            </View>}
            <TouchableOpacity
             style={styles.signOutButton}
             onPress={handleSignout}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
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
        position: 'relative',
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
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