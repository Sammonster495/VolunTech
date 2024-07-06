import { Button, Text, View, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from "expo-router";

export default function Home() {
    const navigation = useNavigation();

    async function handleSignout() {
        await signOut(auth);
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('expire');
        navigation.navigate('register');
    }

    return (
        <View style={styles.container}>
            <Text>Maps View</Text>
            <Button title="Sign Out" onPress={handleSignout} />
        </View>
    )
}

const styles = StyleSheet.create({ 
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
     }
    }
)