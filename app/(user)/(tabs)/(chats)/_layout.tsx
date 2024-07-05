import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
        <Stack>
            <Stack.Screen name="chats1" options={{headerShown: false}} />
        </Stack>
    )
}