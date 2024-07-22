import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { addDoc, collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigation } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";

export default function Report() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [image, setImage] = useState<{uri: string}>({ uri: "" });
    const [description, setDescription] = useState<string>();
    const [location, setLocation] = useState<{ address: string, latitude: number, longitude: number } | null>(null);
    const [reporting, setReporting] = useState<boolean>(false);

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [6, 7],
            quality: 1,
        });
    
        if(!result.canceled) setImage({ uri: result.assets[0].uri })
    }

    async function getLocation() {
        let { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyBqeTB4Vbev342dA6b4PWZf-H3S1QTZyrM`);
            const data = await response.json();
            const locationData = {
                address: data.results[0]?.formatted_address || 'Unknown location',
                latitude: coords.latitude,
                longitude: coords.longitude
            };
            setLocation(locationData);
            return locationData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function handleSubmit() {
        setReporting(true);
        const currentLoc = await getLocation();
        
        if(!image.uri || !description || !currentLoc) {
            alert("Please provide all required information.");
            setReporting(false);
            return;
        }
        
        const userData = await SecureStore.getItemAsync('user');
        if (!userData) {
            alert("User data not found.");
            setReporting(false);
            return;
        }

        const user = JSON.parse(userData);
        const querySnapshot = await getDocs(query(collection(db, 'users'), where('phone', '==', user.phone), where('type', '==', 'normal')));
        if (querySnapshot.empty) {
            alert('An error occurred. Please try again');
            setReporting(false);
            return;
        }
        const userDoc = querySnapshot.docs[0];

        try {
            const docRef = await addDoc(collection(db, 'reports'), {
                user: {id: userDoc.id, name: userDoc.data().name},
                description: description,
                location: currentLoc
            });
            const response = await fetch(image.uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `reports/${docRef.id}`);
            await uploadBytes(storageRef, blob);    
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(docRef, {
                id: docRef.id,
                image: downloadURL,
                createdAt: new Date(),
                status: 'pending',
                verified: false
            });
            alert('Incident reported successfully and waiting for verification');
            navigation.navigate('maps');
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again');
            navigation.navigate('maps');
        } finally {
            setReporting(false);
        }
    }

    return (
        <GestureHandlerRootView>
            <ScrollView style={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1e1e1e'}} className=" min-h-screen">
                <View style={{backgroundColor:theme === 'light' ? 'white' : 'black',borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white' }} className="h-56 w-48 border self-center mt-8 flex justify-center items-center">
                    {!image?.uri && <TouchableOpacity className="w-8 h-8 flex-0 rounded-full" onPress={() => pickImage()}><Image source={theme === 'light' ? require('@/assets/images/image.png') : require('@/assets/images/image-dark.png')} /></TouchableOpacity>}
                    {image?.uri && <Image source={{ uri: image.uri }} style={{ height: 224, width: 192 }} />}
                </View>
                <TextInput style={{backgroundColor:theme === 'light' ? 'white' : 'black',borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white' }} placeholderTextColor={theme === 'light' ? 'grey' : '#d9d9d9'} placeholder="Add a description..." className="w-[80%] h-32 border text-lg self-center mt-8 px-2" value={description} onChangeText={(text) => setDescription(text)} />
                <TouchableOpacity style={{backgroundColor:theme === 'light' ? '#74a608' : '#1E1E1E',borderWidth:1,borderColor:theme === 'light' ? '' : '#ebf21b'}} className=" w-[30%] h-10 flex justify-center items-center rounded-2xl self-center mt-10" onPress={() => handleSubmit()}><Text style={{color:theme === 'light' ? 'white' : '#ebf21b'}} className=" text-xl">{reporting ? 'Reporting...' : 'Report'}</Text></TouchableOpacity>
            </ScrollView>
        </GestureHandlerRootView>
    )
}
