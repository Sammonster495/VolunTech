import { Tabs, useNavigation } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>();

  useState(async() => {
    const userData = await SecureStore.getItemAsync('ngo');
    if(userData) {
      const user = JSON.parse(userData);
      setUser(user);
    }
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menubar} className="flex-row mt-[5.6%]">
        <Image source={require('@/assets/images/logo.png')} className="h-[56] w-[64] self-center" />
        <Text className="text-black text-right self-center  mr-2 w-3/5">{user?.name}</Text>
        <TouchableOpacity className="self-center"
         onPress={() => navigation.navigate('profile-ngo')}
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
          backgroundColor: '#F6FFE2'
        },
        tabBarActiveBackgroundColor: '#83a638',
      })}>
        <Tabs.Screen name="(maps-ngo)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/maps.png')} />
        }} />
        <Tabs.Screen name="tasks-ngo" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/tasks.png')} />
        }} />
        <Tabs.Screen name="chats-ngo" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/chats.png')} />
        }} />
        <Tabs.Screen name="(skills-ngo)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/skills.png')} />
        }} />
        <Tabs.Screen name="(donations-ngo)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/donations.png')} />
        }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#F6FFE2'
  },
  menubar: {
    height: 61, // Adjust based on your design
    width: '100%',
    justifyContent:'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
  },
  image:{
    height:46,
    width:46,
    borderWidth:1,
    borderColor: 'white',
    borderRadius:30,
  }
})