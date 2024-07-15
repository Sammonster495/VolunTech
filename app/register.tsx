import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { db, auth } from "@/firebase/firebaseConfig";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function Register() {
    const navigation = useNavigation();
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "217499561785-hal0hbt8dvoaigj7jlj2st081kladr64.apps.googleusercontent.com",
        androidClientId: "217499561785-cc4outbppcbbdet96405q6jgq7dh13va.apps.googleusercontent.com"
    })

    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === 'success') {
                const { id_token } = response.params;
                const credential = GoogleAuthProvider.credential(id_token);
                try {
                    const result = await signInWithCredential(auth, credential);
                    const userDocRef = doc(db, 'users', result.user.uid);
                    const userDoc = await getDoc(userDocRef);
                    const expirationTime = (await result.user.getIdTokenResult()).expirationTime;

                    if (!userDoc.exists()) {
                        alert('User account not found. Please register first');
                        navigation.navigate('register');
                    }else {
                        const userData = userDoc.data();
                        const page = userData.type === 'normal' ? '(user)' : '(ngo)';
                        const role = userData.type === 'normal' ? 'user' : 'ngo';
                        await SecureStore.setItemAsync(role, JSON.stringify({
                            id: userData.id,
                            image: result.user.photoURL,
                            name: userData.name,
                            phone: userData.phone,
                            state: userData.state,
                            district: userData.district,
                            skill: userData.skill,
                            type: userData.type,
                            designation: role === 'ngo' ? userData.designation : null
                        }));
                        await SecureStore.setItemAsync('expire', expirationTime);
                        navigation.navigate(page);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        handleResponse();
    }, [response]);

    return (
        <GestureHandlerRootView>
            <LinearGradient
                colors={['#83a638', '#5e7f25', '#234006']}
                style={{ flex: 1 }}
                start={[0, 1]}
                end={[0, 0]}
            >
                <View className="p-10 flex-1 min-h-screen min-w-screen">
                    <View className="top-[1%] h-16 justify-self-center self-center aspect-square rounded-full bg-white flex items-center"><Image source={require('@/assets/images/logo.png')} className="h-10 m-3 aspect-[22/19] justify-self-center self-center" /></View>
                    <View className="top-[3%] flex-1 min-h-screen">
                        <View className="items-center h-20">
                            <Text className="text-5xl font-semibold text-white">Register</Text>
                            <Text className="text-white text-md">Already registered? <Text className="text-green-300 hover:underline" onPress={() => promptAsync()}>Login</Text> here</Text>
                        </View>
                        <View className="mt-24 flex-1 items-center">
                            <TouchableOpacity className="bg-black w-full h-16 px-8 mb-12 rounded-xl flex justify-center" onPress={() => navigation.navigate('ngoLogin')}><Text className="text-xl text-[#83a638] text-center">Register as NGO</Text></TouchableOpacity>
                            <TouchableOpacity className="bg-black w-full h-16 px-8 mt-12 rounded-xl flex justify-center" onPress={() => navigation.navigate('volunteerLogin')}><Text className="text-xl text-[#83a638] text-center">Register as Volunteer/NGO Member</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </GestureHandlerRootView>
    )
}