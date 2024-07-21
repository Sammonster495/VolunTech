import { useNavigation } from "expo-router";
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from "react-native";
import React, { useCallback, useEffect, useState } from 'react';
import { Picker } from "@react-native-picker/picker";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { CometChat } from "@cometchat-pro/react-native-chat";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import { useTheme } from "@/theme/ThemeContext";

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
    const { theme, toggleTheme } = useTheme();

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
        // const themeMode = await SecureStore.getItemAsync('mode');
        // console.log(themeMode);
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

    const styles = createStyles(theme);

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#161616' : '#f0f0f0',}}>
            {user && <View style={styles.profile}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: user?.image }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>Name: {user.name}</Text>
                        <Text style={[styles.skill]}>Skill: {mapping[user.skill]}</Text>
                        <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>Status:</Text>
                            <Picker
                                selectedValue={status}
                                style={styles.picker}
                                onValueChange={(itemValue) => editStatus(itemValue)}
                            >
                                <Picker.Item style={{color: theme === 'dark' ? '#74A608':'#1E1E1E'}} label="Part-Time" value="Part-Time"/>
                                <Picker.Item style={{color: theme === 'dark' ? '#74A608':'#1E1E1E'}} label="Full-Time" value="Full-Time"/>
                            </Picker>
                        </View>
                    </View>
            </View>}
            {user && <View style={styles.additionalInfo}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <TouchableOpacity style={{ position: 'absolute', right: 15, top: 20 }} onPress={() => setIsEditing(true)}><Image style={{tintColor: theme === 'dark' ? 'white' : 'black'}} source={require('@/assets/images/edit.png')} /></TouchableOpacity>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Contact Number</Text>
                    {isEditing ? (
                        <TextInput style={{ flex:1, flexWrap:'wrap', alignSelf: 'center' }} className="border border-black px-2" value={phone} onChangeText={text => setPhone(text)} />
                    ) : (
                        <Text style={styles.infoText}>{`+91 ${phone}`}</Text>
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
            <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Dark Mode</Text>
                    <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
            </View>
            <TouchableOpacity
             style={styles.signOutButton}
             onPress={handleSignout}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const createStyles = (theme: string) => StyleSheet.create({
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f0f0f0',
        borderRadius: 10,
        marginHorizontal: 10,
        marginTop: 10,
        shadowColor: theme === 'dark'?'#fff':'#000',
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
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
    },
    skill: {
        fontSize: 16,
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusText: {
        fontSize: 16,
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
        marginRight: 10,
    },
    picker: {
        height: 40,
        width: 150,
    },
    additionalInfo: {
        padding: 15,
        position: 'relative',
        marginTop: 10,
        backgroundColor: theme === 'dark' ? '#2D2D2D' : '#f0f0f0',
        borderRadius: 10,
        marginHorizontal: 10,
        shadowColor: theme === 'dark'?'#fff':'#000',
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
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        width: "33%",
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
        alignSelf: 'center' // Adjust width as needed
    },
    infoText: {
        flex:1,
        flexWrap:'wrap',
        alignSelf: 'center',
        color: theme === 'dark' ? '#74A608' :'#1E1E1E',
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
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal:10,
        paddingVertical:4,
        backgroundColor: theme === 'dark' ? '#161616' : '#f0f0f0',
    },
    switchLabel: {
        fontSize: 16,
        marginRight: 10,
        color: theme === 'dark' ? 'white' : 'black',
    },
});