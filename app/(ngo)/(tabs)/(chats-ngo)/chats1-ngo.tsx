import { auth } from "@/firebase/firebaseConfig";
import { useNavigation } from "expo-router";
import { signOut } from "firebase/auth";
import * as SecureStore from 'expo-secure-store';
import { Text, View, StyleSheet, Button } from "react-native";

export default function Chats1() {
    const navigation = useNavigation();

    async function handleSignout() {
        await signOut(auth);
        await SecureStore.deleteItemAsync('ngo');
        await SecureStore.deleteItemAsync('expire');
        navigation.navigate('register');
    }

    return (
        <View style={styles.container}>
            <Text>Chats</Text>
            <Button title="Sign Out" onPress={handleSignout} />
            <Button title="Navigate" onPress={() => navigation.navigate('chats2-ngo')} />
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