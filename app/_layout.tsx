import { Stack, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, AppState } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { CometChat } from "@cometchat-pro/react-native-chat";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion('in').build();

    CometChat.init('261020ccf755a422', appSetting).then(() => {
      console.log('CometChat initialized successfully');
    }, error => {
      console.log('CometChat initialization failed with error:', error);
    })
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const normalUser = await SecureStore.getItemAsync('user');
      const ngoUser = await SecureStore.getItemAsync('ngo');
      const userData = normalUser ? JSON.parse(normalUser) : ngoUser ? JSON.parse(ngoUser) : null;
      setUser(userData);
      setUserLoading(false);
    }

    const intervalId = setInterval(fetchUser, 1000);
  
    return () => clearInterval(intervalId);
  },[])

  useEffect(() => {
    if (!userLoading && user) {
      const handleAppStateChange = async (nextAppState: string) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') 
          await CometChat.logout().then(() => {
            console.log('Logout completed successfully');
          }, error => {
            console.log('Logout failed with exception:', { error });
          })
        else if (nextAppState === 'active' || nextAppState === 'foreground')
          await CometChat.login(user.id, '4299e0d831a95ac942e00be380d1a4b18e480d9c').then(user => {
            console.log('Login Successful:', { user });
          }, error => {
            console.log('Login failed with exception:', { error });
          })
      }

      const appStateListener = AppState.addEventListener('change', handleAppStateChange);

      return () => appStateListener.remove();
    }
  }, [user, userLoading])

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
