import { Tabs } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function TabLayout() {
  const [name, setName] = useState<string>('');

  useState(async() => {
    const userData = await SecureStore.getItemAsync('ngo');
    if(userData) {
      const user = JSON.parse(userData);
      setName(user.name);
    }
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menubar} className="flex-row ">
        <Text className="text-black text-center self-center">{name}</Text>
        <Image 
          style={styles.image}
          source={require('@/assets/images/profile.png')}
          resizeMode="contain"/>
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
        <Tabs.Screen name="(chats-ngo)" options={{
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
    marginTop: 20,
    paddingHorizontal: 15,
  },
  image:{
    height:61,
    width:61,
    borderWidth:1,
    borderColor: 'white',
    borderRadius:30
  }
})