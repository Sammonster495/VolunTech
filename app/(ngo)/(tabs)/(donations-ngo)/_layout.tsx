import { Stack } from "expo-router";

export default function DonationLayout() {
    return (
        <Stack>
            <Stack.Screen name="donations1-ngo" options={{headerShown: false}} />
            <Stack.Screen name="donations2-ngo" options={{headerShown: false}} />
            <Stack.Screen name="donations3-ngo" options={{headerShown: false}} />
        </Stack>
    )
}