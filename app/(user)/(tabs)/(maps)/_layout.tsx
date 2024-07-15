import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="maps" options={{headerShown: false}} />
            <Stack.Screen name="report" options={{headerShown: false}} />
        </Stack>
    )
}