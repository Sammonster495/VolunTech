import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { addDoc, collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/firebase/firebaseConfig';
import React from 'react';

export const imagePickHandler = async (setImage: React.Dispatch<React.SetStateAction<{uri: string}>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [6, 7],
        quality: 1,
    });

    if(!result.canceled) setImage({ uri: result.assets[0].uri })
}

export const locationFetchHandler = async(setLocation: React.Dispatch<React.SetStateAction<{ address: string, latitude: number, longitude: number } | null>>) => {
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

export const reportSubmitHandler = async(image: {uri: string}, description: string | undefined, navigation: any, getLocation: () => Promise<{ address: string, latitude: number, longitude: number } | null>, setReporting: React.Dispatch<React.SetStateAction<boolean>>) => {
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