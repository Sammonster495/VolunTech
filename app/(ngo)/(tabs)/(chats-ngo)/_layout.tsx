import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
        <Stack>
            <Stack.Screen name="chats1-ngo" options={{headerShown: false}} />
            <Stack.Screen name="chats2-ngo" options={{headerShown: false}} />
        </Stack>
    )
}