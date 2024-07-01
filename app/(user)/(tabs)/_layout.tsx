import { Tabs } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  return (
    <Tabs>
        <Tabs.Screen name="home" options={{headerShown: false}} />
    </Tabs>
  );
}