import { Link, Tabs } from "expo-router";
import { useState } from "react";
import { Image, SafeAreaView, Text, Dimensions, StyleSheet, View} from "react-native";
import { TouchableOpacity } from "react-native";

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

export default function TabLayout() {
  const [open, setOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menubar}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: 'black'
  },
  menubar: {
    height: 61, // Adjust based on your design
    width: '100%',
    backgroundColor: 'black',
    justifyContent:'flex-end',
    alignItems: 'flex-end',
  },
  image:{
    height:61,
    width:61,
    borderWidth:1,
    borderColor: 'white',
    borderRadius:30
  }
})