import { Stack } from "expo-router";

export default function MapsNgo() {
    return (
        <Stack>
            <Stack.Screen name="maps-ngo" options={{ headerShown: false }} />
            <Stack.Screen name="report-ngo" options={{ headerShown: false }} />
        </Stack>
    )
}