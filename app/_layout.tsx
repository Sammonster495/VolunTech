import { Stack, useNavigation } from "expo-router";
import { useEffect } from "react";
import { Linking } from "react-native";

export default function RootLayout() {
  const navigation = useNavigation();
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.includes('voluntech:///oauthredirect')) {
        navigation.navigate('oauthredirect');
      }
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [navigation]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="volunteerLogin" options={{ headerShown: false }} />
      <Stack.Screen name="ngoLogin" options={{ headerShown: false }} />
      <Stack.Screen name="oauthredirect" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(ngo)" options={{ headerShown: false }} />
    </Stack>
  );
}
