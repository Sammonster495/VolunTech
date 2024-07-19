import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "expo-router";
import MapContainer from "@/components/MapContainer";

export default function Home() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <MapContainer />
            <TouchableOpacity className="bottom-32 bg-[#74a608] absolute w-[30%] h-10 flex justify-center items-center rounded-2xl" onPress={() => navigation.navigate('report-ngo')}><Text className="text-white text-xl">Report</Text></TouchableOpacity>
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