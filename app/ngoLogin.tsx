import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { File } from "@/types/types";
import * as DocumentPicker from 'expo-document-picker';
import * as Google from 'expo-auth-session/providers/google';
import { RNFetchBlob } from 'rn-fetch-blob';
import { collection, query, addDoc, getDocs, updateDoc, where } from "firebase/firestore";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, auth, storage } from "@/firebase/firebaseConfig";
import { useNavigation } from "expo-router";

export default function Login() {
    const navigation = useNavigation();
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "217499561785-hal0hbt8dvoaigj7jlj2st081kladr64.apps.googleusercontent.com",
        androidClientId: "217499561785-cc4outbppcbbdet96405q6jgq7dh13va.apps.googleusercontent.com"
    })

    const [name, setName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [proof, setProof] = useState<File>();
    const [members, setMembers] = useState<File>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === 'success') {
                setLoading(true);
                const { id_token } = response.params;
                const credential = GoogleAuthProvider.credential(id_token);
                try {
                    await signInWithCredential(auth, credential);
                    const q = query(collection(db, 'ngo'), where('name', '==', name));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        const docRef = await addDoc(collection(db, 'ngo'), { name: name, phone: phone });
                        if (proof?.name && members?.name) {
                            const proofUrl = await uploadFile(proof, docRef.id, 'proof');
                            const membersUrl = await uploadFile(members, docRef.id, 'members');
                            await updateDoc(docRef, {
                                proof: proofUrl
                            });
                            alert('NGO registered successfully');
                            navigation.navigate('register');
                        }
                    } else {
                        alert('NGO is already registered');
                        navigation.navigate('register');
                    }
                } catch (error) {
                    console.error(error);
                    alert('Error registering NGO');
                } finally {
                    setLoading(false);
                }
            }
        };

        handleResponse();
    }, [response]);

    async function uploadFile(file: File, docId: string, type: string) {
        try {
            const fileRef = ref(storage, `ngo/${docId}/${type}/${file.name}`);
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
    

    function validatePhone(text: string) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(text)) {
            setPhoneError("Please enter a valid 10-digit phone number");
        } else {
            setPhoneError("");
        }
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

    async function handleMembersPick() {
        try {
            const res = await DocumentPicker.getDocumentAsync({})
            if (!res.canceled) setMembers({ name: res.assets[0].name, uri: res.assets[0].uri })
        } catch (error) {
            console.error(error);
            alert('Error picking members document');
        }
    }

    function handleRegister() {
        if (name && phone && !phoneError && proof && members) {
            setLoading(true);
            promptAsync();
        } else {
            alert("Please fill all the fields correctly");
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
                    <View className="top-[1%] h-16 justify-self-center self-center aspect-square rounded-full bg-white flex items-center">
                        <Image source={require('@/assets/images/logo.png')} className="h-10 m-3 aspect-[22/19] justify-self-center self-center" />
                    </View>
                    <View className="top-[3%] flex-1 min-h-screen">
                        <View className="items-center h-20">
                            <Text className="text-5xl font-semibold text-white">Register</Text>
                        </View>
                        <View className="mt-4 flex-1 items-center">
                            <TextInput placeholder="Name" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={name} onChangeText={(text) => setName(text)} />
                            <TextInput placeholder="Phone" className="h-12 w-[90%] px-4 text-lg mb-4 bg-white" value={phone} keyboardType="phone-pad" onChangeText={(text) => validatePhone(text)} />
                            {phoneError ? <Text style={{ color: 'red', marginBottom: 10 }}>{phoneError}</Text> : null}
                            <View className="h-12 w-[90%] px-4 mb-4 bg-white flex-row items-center justify-between">
                                <Text className={`text-lg ${proof ? "text-black" : "text-gray-400"}`}>{!proof ? 'Document of Proof (pdf)' : proof.name}</Text>
                                <TouchableOpacity onPress={handleProofPick}><Text className="text-4xl text-gray-400">+</Text></TouchableOpacity>
                            </View>
                            <View className="h-12 w-[90%] px-4 mb-4 bg-white flex-row items-center justify-between">
                                <Text className={`text-lg ${members ? "" : "text-gray-400"}`}>{!members ? 'Members List (pdf, xlsx)' : members.name}</Text>
                                <TouchableOpacity onPress={handleMembersPick}><Text className="text-4xl text-gray-400">+</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity className="mt-3 mb-28 h-12 bg-black w-[40%] rounded-3xl flex items-center justify-center" onPress={handleRegister} role="button">
                                <Text className="text-[#83a638] text-lg">{loading ? <ActivityIndicator size="large" color="white" /> : "Register"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </GestureHandlerRootView>
    )
}
