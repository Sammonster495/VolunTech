import { Link, Tabs, useNavigation } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";

export default function TabLayout() {
  const [name, setName] = useState<string>('');

  useState(async() => {
    const userData = await SecureStore.getItemAsync('user');
    if(userData) {
      const user = JSON.parse(userData);
      setName(user.name);
    }
  })

  const navigation = useNavigation();

  const navigateToProfile = () =>{
    navigation.navigate('profile');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menubar}>
        <Text className="text-black text-center self-center">{name}</Text>
        <TouchableOpacity
         onPress={navigateToProfile}
        >
          <Image 
            style={styles.image}
            source={require('@/assets/images/profile.png')}
            resizeMode="contain"/>
        </TouchableOpacity>
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
    backgroundColor: 'white'
  },
  menubar: {
    height: 60, // Adjust based on your design
    width: '100%',
    flexDirection: 'row',
    justifyContent:'flex-end',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingHorizontal: 15,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset of the shadow
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Radius of the shadow
    elevation: 5
  },
  image:{
    height:61,
    width:61,
    borderWidth:1,
    borderColor: 'white',
    borderRadius:30
  }
})