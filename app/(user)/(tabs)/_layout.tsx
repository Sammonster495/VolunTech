import { Link, Tabs, useNavigation } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>();

  useState(async() => {
    const userData = await SecureStore.getItemAsync('user');
    if(userData) {
      const user = JSON.parse(userData);
      setUser(user);
    }
  })

  const navigation = useNavigation();

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menubar} className="flex-row mt-[5.8%]">
        <TouchableOpacity
         onPress={() => navigation.navigate('about')}
        >
          <Image source={require('@/assets/images/logo-small.png')} className="h-[49] w-[56] my-1" />
        </TouchableOpacity>
        <Text style={{color: theme === 'dark' ? 'white' : 'black'}} className="text-right self-center mr-2 w-3/5">{user?.name}</Text>
        <TouchableOpacity className="self-center"
         onPress={() => navigation.navigate('profile')}
        >
          {user && <Image 
          style={styles.image}
          source={{ uri: user?.image}}
          resizeMode="contain"/>}
        </TouchableOpacity>
      </View>
      <Tabs screenOptions={() => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          width: "100%",
          position: 'absolute',
          zIndex: 1,
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        },
        tabBarActiveBackgroundColor:theme === 'light' ? '#83a638' : '#234006',
      })}>
        <Tabs.Screen name="(maps)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={theme === 'light' ? require('@/assets/images/maps.png') : require('@/assets/images/maps-dark.png')}/>
        }} />
        <Tabs.Screen name="tasks" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={theme === 'light' ? require('@/assets/images/tasks.png') : require('@/assets/images/tasks-dark.png')} />
        }} />
        <Tabs.Screen name="chats" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={theme === 'light' ? require('@/assets/images/chats.png') : require('@/assets/images/chats-dark.png')} />
        }} />
        <Tabs.Screen name="(skills)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={theme === 'light' ? require('@/assets/images/skills.png') : require('@/assets/images/skills-dark.png')} />
        }} />
        <Tabs.Screen name="donations" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={theme === 'light' ? require('@/assets/images/donations.png') : require('@/assets/images/donations-dark.png')} />
        }} />
      </Tabs>
    </SafeAreaView>
  );
}

const createStyles = (theme: string) => StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
  },
  menubar: {
    height: 60, // Adjust based on your design
    width: '100%',
    flexDirection: 'row',
    justifyContent:'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
  },
  image:{
    height:46,
    width:46,
    borderWidth:1,
    borderColor: theme === 'light' ? 'black' : 'white',
    borderRadius:30
  }
})