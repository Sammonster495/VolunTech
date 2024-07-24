import { Stack } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";

export default function User() {
    const {theme} = useTheme();
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="profile" options={{
                headerShown: true, 
                headerTitle: "Profile", 
                headerTintColor: theme === 'dark' ? '#83A638': '#1E1E1E',
                headerTitleStyle: { 
                    fontSize: 30,
                    color: theme === 'dark' ? '#83A638' : 'black',
                }, 
                headerTitleAlign: 'center', 
                headerStyle: { 
                    backgroundColor: theme === 'dark' ? 'black' : '#83A638',
                } 
            }} />
            <Stack.Screen name="about" options={{
                headerShown: true,
                headerTitle: "About Us",
                headerTitleAlign: 'center',
                headerTintColor: theme === 'dark' ? '#83A638': '#1E1E1E',
                headerTitleStyle: { 
                    fontSize: 30,
                    color: theme === 'dark' ? '#83A638' : 'black',
                },
                headerStyle: { 
                    backgroundColor: theme === 'dark' ? 'black' : '#83A638',
                } 
            }} />
        </Stack>
    )
}