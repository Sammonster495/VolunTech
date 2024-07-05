import { Link, Tabs } from "expo-router";
import { useState } from "react";
import { Image, View, Text, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native";
import { BlurView } from 'expo-blur'

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

export default function TabLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tabs screenOptions={() => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          width: "100%",
          position: 'absolute',
          zIndex: 1
        },
        tabBarActiveBackgroundColor: '#d5e2f2',
      })}>
        <Tabs.Screen name="maps" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/maps.png')} />
        }} />
        <Tabs.Screen name="tasks" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/tasks.png')} />
        }} />
        <Tabs.Screen name="(chats)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/chats.png')} />
        }} />
        <Tabs.Screen name="(skills)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/skills.png')} />
        }} />
        <Tabs.Screen name="(donations)" options={{
          headerShown: false,
          tabBarIcon: () => <Image source={require('@/assets/images/donations.png')} />
        }} />
      </Tabs>
    </>
  );
}