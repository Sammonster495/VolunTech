import React, { useEffect, useState } from "react";
import { TextInput, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential } from "firebase/auth";
import { db, auth } from "@/firebase/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { STATE_DISTRICTS as places } from "@/data/area";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const navigation = useNavigation();
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "217499561785-hal0hbt8dvoaigj7jlj2st081kladr64.apps.googleusercontent.com",
        androidClientId: "217499561785-cc4outbppcbbdet96405q6jgq7dh13va.apps.googleusercontent.com"
    })

    const [name, setName] = useState();
    const [phone, setPhone] = useState();
    const [selectState, setSelectState] = useState();
    const [selectDistrict, setSelectDistrict] = useState();
    const [selectType, setSelectType] = useState();
    const [selectSkill, setSelectSkill] = useState();
    const [register, setRegister] = useState(false);
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === 'success') {
                setLoading(true);
                const { id_token } = response.params;
                const credential = GoogleAuthProvider.credential(id_token);
                try {
                    const result = await signInWithCredential(auth, credential);
                    const userDocRef = doc(db, 'users', result.user.uid);
                    const userDoc = await getDoc(userDocRef);
                    const expirationTime = (await result.user.getIdTokenResult()).expirationTime;

                    if (!userDoc.exists()) {
                        if (register) {
                            await setDoc(userDocRef, {
                                name: name,
                                phone: phone,
                                state: selectState,
                                district: selectDistrict,
                                skill: selectSkill
                            });
                            await SecureStore.setItemAsync('user', JSON.stringify({
                                name,
                                phone,
                                state: selectState,
                                district: selectDistrict,
                                skill: selectSkill
                            }));
                            await SecureStore.setItemAsync('expire', expirationTime);
                            navigation.navigate('(user)');
                        }else if (login) {
                            alert('User account not found. Please register first');
                            navigation.navigate('login');
                            setLogin(false);
                        }
                    } else {
                        const userData = userDoc.data();
                        if (register) {
                            alert('User account already exists. Please login');
                            navigation.navigate('login');
                            setRegister(false);
                        } else if (login) {
                            await SecureStore.setItemAsync('user', JSON.stringify(userData));
                            await SecureStore.setItemAsync('expire', expirationTime);
                            navigation.navigate('(user)');
                        }
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        handleResponse();
    }, [response]);

    function handleRegister() {
        if (name && phone && selectState && selectDistrict && selectType && selectSkill) {
            setLoading(true);
            setRegister(true);
            promptAsync();
        } else
            alert('Please fill all the fields');
    }

    function handleLogin() {
        setLoading(true);
        setLogin(true);
        promptAsync();
    }

    return (
        <GestureHandlerRootView>
            <LinearGradient
                colors={['#83a638', '#5e7f25', '#234006']}
                style={{ flex: 1 }}
                start={[0, 1]}
                end={[0, 0]}
            >
                <ScrollView  className="p-10 flex-1 min-h-screen min-w-screen">
                    <View className="top-[1%] h-16 justify-self-center self-center aspect-square rounded-full bg-white flex items-center"><Image source={require('@/assets/images/logo.png')} className="h-10 m-3 aspect-[22/19] justify-self-center self-center" /></View>
                    <View className="top-[3%] flex-1 min-h-screen">
                        <View className="items-center h-20">
                            <Text className="text-5xl font-semibold text-white">Register</Text>
                            <Text className="text-white text-md">Already registered? <Text className="text-green-300 hover:underline" onPress={handleLogin}>Login</Text> here</Text>
                        </View>
                        <View className="mt-4 flex-1 items-center">
                            <TextInput placeholder="Name" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={name} onChangeText={(text) => setName(text)} />
                            <TextInput placeholder="Phone" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={phone} onChangeText={(text) => setPhone(text)} />
                            <Picker
                                selectedValue={selectState}
                                style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                onValueChange={(itemValue, itemIndex) => setSelectState(itemValue)}
                            >
                                <Picker.Item label="Select your State" value="" />
                                {places.map(place => <Picker.Item key={place.state} label={place.state} value={place.state} />)}
                            </Picker>
                            <Picker
                                selectedValue={selectDistrict}
                                style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                onValueChange={(itemValue, itemIndex) => setSelectDistrict(itemValue)}
                            >
                                <Picker.Item label="Select your District" value="" />
                                {selectState && places.find(place => place.state === selectState)?.districts.map(district => <Picker.Item key={district} label={district} value={district} />)}
                            </Picker>
                            <Picker
                                selectedValue={selectType}
                                style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                onValueChange={(itemValue, itemIndex) => setSelectType(itemValue)}
                            >
                                <Picker.Item label="Select your Category" value="" />
                                <Picker.Item label="Volunteer" value="normal" />
                                <Picker.Item label="NGO Member" value="ngo" />
                            </Picker>
                            <Picker
                                selectedValue={selectSkill}
                                style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                onValueChange={(itemValue, itemIndex) => setSelectSkill(itemValue)}
                            >
                                <Picker.Item label="Select your Skill" value="" />
                                {['Medical', 'Transport', 'Rescue', 'Finance', 'Shelter Building', 'Others'].map(skill => <Picker.Item key={skill} label={skill} value={skill} />)}
                            </Picker>
                            {selectType === 'normal' && (<TouchableOpacity className="mt-3 h-12 bg-black w-[40%] rounded-3xl flex items-center justify-center" onPress={() => handleRegister()} role="button"><Text className="text-[#83a638] text-lg">{loading ? <ActivityIndicator size="large" color="white" /> : "Register"}</Text></TouchableOpacity>)}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </GestureHandlerRootView>
    )
}