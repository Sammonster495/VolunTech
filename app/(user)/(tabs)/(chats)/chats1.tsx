import { Text, View, StyleSheet } from "react-native";

export default function Chats1() {
    return (
        <View style={styles.container}>
            <Text>Chats</Text>
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