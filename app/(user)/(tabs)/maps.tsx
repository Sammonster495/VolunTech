import { Button, Text, View, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from "expo-router";
import MapContainer from "@/components/MapContainer";

export default function Home() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <MapContainer />
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