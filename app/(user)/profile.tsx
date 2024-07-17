import { useNavigation } from "expo-router";
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from 'react';
import { Picker } from "@react-native-picker/picker";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';

export default function Profile() {
    const navigation = useNavigation();
    const [status, setStatus] = useState('Part-time');

    const navigateToTabs = () => {
        navigation.navigate('(tabs)');
    };

    const navigateToSettings = () => {
        navigation.navigate('settings');
    }

    const volunteerInfo = {
        contactNumber: '+1234567890',
        skills: ['Rescue Operations', 'First Aid', 'Communication'],
        availability: 'Weekdays, Afternoons',
        profession: 'Emergency Medical Technician',
        history: {
            experience: '5 years in emergency response',
            pastOperations: [
                'Hurricane Relief, 2023',
                'Earthquake Response, 2022'
            ]
        },
        organizations: [
            'Red Cross',
            'Global Rescue Team'
        ]
    };

    async function handleSignout(){
        await signOut(auth);
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('expire');
        navigation.navigate('register');
    }

    return (
        <SafeAreaView style={{ flex: 1}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={navigateToTabs} style={styles.backButton}>
                    <Image
                     style={styles.backButtonText}
                     source={require('@/assets/images/arrow-left.png')}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Profile</Text>
                <TouchableOpacity onPress={navigateToSettings}>
                    <Image
                     style={styles.backButtonText}
                     source={require('@/assets/images/settings.png')}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.profile}>
                <Image
                    style={styles.profileImage}
                    source={require('@/assets/images/profile.png')}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>Name: {'Joseph Adolf Khan'}</Text>
                    <Text style={[styles.skill, { color: '#1E1E1E' }]}>Skill: {'Rescue Operation'}</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Status:</Text>
                        <Picker
                            selectedValue={status}
                            style={styles.picker}
                            onValueChange={(itemValue) => setStatus(itemValue)}
                        >
                            <Picker.Item label="Part-Time" value="Part-Time"/>
                            <Picker.Item label="Full-Time" value="Full-Time"/>
                        </Picker>
                    </View>
                </View>
            </View>
            <View style={styles.additionalInfo}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Contact Number:</Text>
                    <Text style={styles.infoText}>{volunteerInfo.contactNumber}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Skills:</Text>
                    <Text style={styles.infoText}>{volunteerInfo.skills.join(', ')}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Availability:</Text>
                    <Text style={styles.infoText}>{volunteerInfo.availability}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Profession:</Text>
                    <Text style={styles.infoText}>{volunteerInfo.profession}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Experience:</Text>
                    <Text style={styles.infoText}>{volunteerInfo.history.experience}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Past Rescue Operations:</Text>
                    <View style={{flexDirection:'column'}}>
                        {volunteerInfo.history.pastOperations.map((operation, index) => (
                            <Text key={index} style={styles.infoText}>- {operation}</Text>
                        ))}
                    </View>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>NGO Organizations:</Text>
                    <View style={{flexDirection:'column'}}>
                        {volunteerInfo.organizations.map((organization, index) => (
                            <Text key={index} style={styles.infoText}>- {organization}</Text>
                        ))}
                    </View>
                </View>
            </View>
            <TouchableOpacity
             style={styles.signOutButton}
             onPress={handleSignout}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
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
        width: 90,
        height: 90,
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
        width: 123, // Adjust width as needed
    },
    infoText: {
        flex:1,
        flexWrap:'wrap'
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