import { Button, Text, View } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from "expo-router";

export default function Home() {
    const navigation = useNavigation();

    async function handleSignout() {
        await signOut(auth);
        await SecureStore.deleteItemAsync('ngo');
        await SecureStore.deleteItemAsync('expire');
        navigation.navigate('register');
    }

    return (
        <View>
            <Text>Home</Text>
            <Button title="Sign Out" onPress={handleSignout} />
        </View>
    )
}