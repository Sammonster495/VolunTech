import { Stack } from "expo-router"

export default function User() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="profile" options={{headerShown: true, headerTitle: "Profile", headerTitleStyle: { fontSize: 30 }, headerTitleAlign: 'center', headerStyle: { backgroundColor: '#83A638'} }} />
        </Stack>
    )
}