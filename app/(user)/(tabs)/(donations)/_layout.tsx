import { Stack } from "expo-router";

export default function DonationLayout() {
    return (
        <Stack>
            <Stack.Screen name="donations1" options={{headerShown: false}} />
            <Stack.Screen name="donations2" options={{headerShown: false}} />
        </Stack>
    )
}