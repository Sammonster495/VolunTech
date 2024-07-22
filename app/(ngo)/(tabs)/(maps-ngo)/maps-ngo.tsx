import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "expo-router";
import MapContainer from "@/components/MapContainer";
import { useTheme } from "@/theme/ThemeContext";

export default function Home() {
    const navigation = useNavigation();
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <MapContainer />
            <TouchableOpacity style={{backgroundColor:theme === 'light' ? '#74a608' : '#1E1E1E',borderWidth:1,borderColor:theme === 'light' ? 'transparent' : '#ebf21b'}} className="bottom-32 absolute w-[30%] h-10 flex justify-center items-center rounded-2xl" onPress={() => navigation.navigate('report-ngo')}><Text style={{color:theme === 'light' ? 'white' : '#ebf21b'}} className="text-white text-xl">Report</Text></TouchableOpacity>
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