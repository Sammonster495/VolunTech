import React, { useEffect, useState } from "react";
import { TextInput, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import { RNFetchBlob } from 'rn-fetch-blob';
import type { File } from "@/types/types";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { db, auth, storage } from "@/firebase/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { STATE_DISTRICTS as places } from "@/data/area";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const navigation = useNavigation();
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "217499561785-hal0hbt8dvoaigj7jlj2st081kladr64.apps.googleusercontent.com",
        androidClientId: "217499561785-cc4outbppcbbdet96405q6jgq7dh13va.apps.googleusercontent.com"
    })

    const [name, setName] = useState<string>();
    const [phone, setPhone] = useState<string>();
    const [phoneError, setPhoneError] = useState<string>();
    const [selectState, setSelectState] = useState<string>();
    const [selectDistrict, setSelectDistrict] = useState<string>();
    const [selectType, setSelectType] = useState<string>();
    const [selectSkill, setSelectSkill] = useState<string>();
    const [register, setRegister] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectNgo, setSelectNgo] = useState<string>()
    const [proof, setProof] = useState<File>();
    const [ngos, setNgos] = useState<string[]>([]);
    
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
                            if(selectType === 'normal') {
                                await setDoc(userDocRef, {
                                    id: userDocRef.id,
                                    name: name,
                                    phone: phone,
                                    state: selectState,
                                    district: selectDistrict,
                                    skill: selectSkill,
                                    type: selectType,
                                    registeredTasks: []
                                });
                                let proofUrl: string;
                                if(proof?.name) {
                                    proofUrl = await uploadFile(proof, `/users/proof/${userDocRef.id}`);
                                    await updateDoc(userDocRef, {
                                        proof: proofUrl
                                    });
                                }
                                await SecureStore.setItemAsync('user', JSON.stringify({
                                    id: userDocRef.id,
                                    image: result.user.photoURL,
                                    name: name,
                                    phone: phone,
                                    state: selectState,
                                    district: selectDistrict,
                                    skill: selectSkill,
                                    type: selectType
                                }));
                                await SecureStore.setItemAsync('expire', expirationTime);
                                navigation.navigate('(user)');
                            }else if(selectType === 'ngo') {
                                const ngoQuery = query(collection(db, 'ngo'), where('name', '==', selectNgo));
                                const ngoDocs = await getDocs(ngoQuery);
                                let ngoDocRef;
                                if(!ngoDocs.empty)
                                    ngoDocRef = ngoDocs.docs[0].ref;
                                const qm = query(collection(db, 'ngo'), where('name', '==', selectNgo), where('members', 'array-contains', result.user.email));
                                const qh = query(collection(db, 'ngo'), where('name', '==', selectNgo), where('heads', 'array-contains', result.user.email));
                                const querySnapshotM = await getDocs(qm);
                                const querySnapshotH = await getDocs(qh);
                                if(querySnapshotM.empty && querySnapshotH.empty) {
                                    alert('You do not appear to belong to the NGO you specified.Please confirm with the respective NGO');
                                    navigation.navigate('register');
                                }else {
                                    await setDoc(userDocRef, {
                                        id: userDocRef.id,
                                        name: name,
                                        phone: phone,
                                        state: selectState,
                                        district: selectDistrict,
                                        skill: selectSkill,
                                        registeredTasks: [],
                                        viewedPendingReports: [],
                                        viewedVerifiedReports: [],
                                        viewedVerifiedNotifications: [],
                                        type: { id: ngoDocRef?.id, name: selectNgo },
                                        designation: querySnapshotH.empty ? 'member' : 'head'
                                    });
                                    let proofUrl: string;
                                    if(proof?.name){
                                        proofUrl = await uploadFile(proof, `/users/proof/${userDocRef.id}`);
                                        await updateDoc(userDocRef, {
                                            proof: proofUrl
                                        });
                                    }
                                    await SecureStore.setItemAsync('ngo', JSON.stringify({
                                        id: userDocRef.id,
                                        image: result.user.photoURL,
                                        name: name,
                                        phone: phone,
                                        state: selectState,
                                        district: selectDistrict,
                                        skill: selectSkill,
                                        type: { id: ngoDocRef?.id, name: selectNgo },
                                        designation: querySnapshotH.empty ? 'member' : 'head'
                                    }));
                                    await SecureStore.setItemAsync('expire', expirationTime);
                                    navigation.navigate('(ngo)');
                                }
                            }
                        }
                    } else {
                        alert('User account already exists. Please login');
                        navigation.navigate('volunteerLogin');
                        setRegister(false);
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

    useEffect(() => {
        const fetchNGO = async () => {
          try {
            const q = query(collection(db, 'ngo'));
            const querySnapshot = await getDocs(q);
    
            const names: string[] = [];
            querySnapshot.forEach(doc => {
              if (doc.exists()) {
                const data = doc.data();
                if (data.name) {
                  names.push(data.name);
                }
              }
            });
            setNgos(names);
          } catch (error) {
            console.error("Error getting documents: ", error);
          }
        };
    
        fetchNGO();
      }, []);

      async function uploadFile(file: File, route: string) {
        try {
            const fileRef = ref(storage, route);
            if (!file.uri) {
                throw new Error("File URI is not defined");
            }
            let blob;
            if (file.uri.startsWith("content://")) {
                // Read the file content as base64
                const fileContent = await RNFetchBlob.fs.readFile(file.uri, 'base64');
                // Create a Blob from the base64 data
                blob = new Blob([RNFetchBlob.base64.decode(fileContent)]);
            } else {
                // Fetch the file and create a Blob
                const res = await fetch(file.uri);
                blob = await res.blob();
            }
            await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    function handleRegister() {
        if (name && phone && !phoneError && selectState && selectDistrict && selectType && selectSkill) {
            setLoading(true);
            setRegister(true);
            promptAsync();
        } else
            alert('Please fill all the fields correctly');
    }

    function validatePhone(text: string) {
        const phoneRegex = /^[0-9]{10}$/;
        if(!phoneRegex.test(text))
            setPhoneError("Please enter a valid 10-digit phone number");
        else
            setPhoneError("");
        setPhone(text);
    }

    async function handleProofPick() {
        try {
            const res = await DocumentPicker.getDocumentAsync({})
            if (!res.canceled) setProof({ name: res.assets[0].name, uri: res.assets[0].uri })
        } catch (error) {
            console.error(error);
            alert('Error picking proof document');
        }
    }

    return (
        <GestureHandlerRootView>
            <LinearGradient
                colors={['#83a638', '#5e7f25', '#234006']}
                style={{ flex: 1 }}
                start={[0, 1]}
                end={[0, 0]}
            >
                <ScrollView className="p-10 flex-1 min-h-screen min-w-screen">
                    <View className="top-[1%] h-16 justify-self-center self-center aspect-square rounded-full bg-white flex items-center"><Image source={require('@/assets/images/logo.png')} className="h-10 m-3 aspect-[22/19] justify-self-center self-center" /></View>
                    <View className="top-[3%] flex-1 min-h-screen">
                        <View className="items-center h-20"><Text className="text-5xl font-semibold text-white">Register</Text></View>
                        <View className="mt-4 flex-1 items-center">
                            <TextInput placeholder="Name" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={name} onChangeText={(text) => setName(text)} />
                            <TextInput placeholder="Phone" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={phone} keyboardType="phone-pad" onChangeText={(text) => validatePhone(text)} />
                            {phoneError ? <Text style={{ color: 'red', marginBottom: 10 }}>{phoneError}</Text> : null}
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
                                selectedValue={selectSkill}
                                style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                onValueChange={(itemValue, itemIndex) => setSelectSkill(itemValue)}
                            >
                                <Picker.Item label="Select your Skill" value="" />
                                {['Medical', 'Transport', 'Rescue', 'Finance', 'Shelter Building', 'Resource Allocation'].map(skill => <Picker.Item key={skill} label={skill} value={skill.split(' ')[0].toLowerCase()} />)}
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
                            {selectType === 'ngo' && (
                                <Picker
                                    selectedValue={selectNgo}
                                    style={{ height: 48, width: '90%', backgroundColor: 'white', marginBottom: 16 }}
                                    onValueChange={(itemValue, itemIndex) => setSelectNgo(itemValue)}
                                >
                                    <Picker.Item label="Select your NGO" value="" />
                                    {ngos.map(n => <Picker.Item label={n} value={n} key={n} />)}
                                </Picker>
                            )}
                            <View className="h-12 w-[90%] px-4 mb-4 bg-white flex-row items-center justify-between">
                                <Text className={`text-lg ${proof ? "" : "text-gray-400"}`}>{!proof ? 'Proof of Identication' : proof.name}</Text>
                                <TouchableOpacity onPress={handleProofPick}><Text className="text-4xl text-gray-400">+</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity className="mt-3 mb-28 h-12 bg-black w-[40%] rounded-3xl flex items-center justify-center" onPress={() => handleRegister()} role="button"><Text className="text-[#83a638] text-lg">{loading ? <ActivityIndicator size="large" color="white" /> : "Register"}</Text></TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </GestureHandlerRootView>
    )
}