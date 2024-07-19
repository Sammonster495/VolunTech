import { View, Animated, Easing } from "react-native";
import { Svg, G, Rect, Path, Polygon } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { CometChat } from "@cometchat-pro/react-native-chat";
import { useEffect, useRef } from "react";
import { useNavigation } from "expo-router";

export default function Index() {
  const navigation = useNavigation();
  const AnimatedRect = Animated.createAnimatedComponent(G);

  const svgY = useRef(new Animated.Value(0)).current;
  const svgScale = useRef(new Animated.Value(1)).current;
  const svgOpacity = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const rectScale = useRef(new Animated.Value(0)).current;
  const rectOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(svgOpacity, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rectScale, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rectOpacity, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(svgY, {
          delay: 2000,
          toValue: -80,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(svgScale, {
          delay: 2000,
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(nameOpacity, {
          delay: 3000,
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(async () => {
      const user = await SecureStore.getItemAsync('user');
      const ngo = await SecureStore.getItemAsync('ngo');
      const expire = await SecureStore.getItemAsync('expire');
      if(expire && (new Date(expire).getTime()) > (new Date().getTime())){
        if(user) {
          await CometChat.login(JSON.parse(user).id, '4299e0d831a95ac942e00be380d1a4b18e480d9c').then(user => {
            console.log('Login Successful:', { user });
          }, error => {
            console.log('Login failed with exception:', { error });
          })
          navigation.navigate('(user)');
        }else if (ngo) {
          await CometChat.login(JSON.parse(ngo).id, '4299e0d831a95ac942e00be380d1a4b18e480d9c').then(user => {
            console.log('Login Successful:', { user });
          }, error => {
            console.log('Login failed with exception:', { error });
          })
          navigation.navigate('(ngo)');
        }
      }else
        navigation.navigate('register');
    }, 7000);
  }, []);

  const requestLocationsPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Location permission is required to use this app')
      return;
    }
  }

  useEffect(() => {
    requestLocationsPermission();
  }, []);

  return (
    <View className="flex-1 justify-center items-center relative max-h-screen max-w-screen">
      <Animated.View style={{ transform: [{ translateY: svgY }, { scale: svgScale }], opacity: svgOpacity }}>
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.5 136.45" width={300} height={300}>
          <G id="Layer_2" data-name="Layer 2"><G id="Layer_2-2" data-name="Layer 2">
            <Path fill="#8cc63f" d="M57.53,116.27c.06.2.11.4.17.6l-.53-.83.18-.48C57.42,115.81,57.47,116,57.53,116.27Z"/>
            <Path fill="#8cc63f" d="M63.61,124.27c-.1,0-.93-.08-2.26-.29a21.1,21.1,0,0,1-3.65-7.11A35.43,35.43,0,0,0,63.61,124.27Z"/>
            <Path fill="#8cc63f" d="M83.5,136.45a46.05,46.05,0,0,1-16.22-6.9c-2.22-2.34-3.44-3.79-3.44-3.79l-1.09-.14c-.49-.52-1-1.07-1.4-1.64,1.42.22,2.26.29,2.26.29a35.16,35.16,0,0,1-5.91-7.4c-.06-.2-.11-.4-.17-.6s-.11-.46-.18-.71l11-28.87c2.14,8.91,1.8,15.48,3.21,21.92C73.57,118.07,79.15,131.94,83.5,136.45Z"/>
            <Path fill="#8cc63f" d="M63.61,124.27c-.1,0-.93-.08-2.26-.29a21.1,21.1,0,0,1-3.65-7.11A35.43,35.43,0,0,0,63.61,124.27Z"/>
            <Path fill="#8cc63f" d="M63.84,125.76s1.22,1.45,3.44,3.79a28.89,28.89,0,0,1-4.53-3.93Z"/>
            <Path fill="#8cc63f" d="M68.31,86.69l-11,28.87C53.92,101.38,51,66.06,37.49,52.7c0,0,4.84-.32,12,4.49,3.51,2.36,7.68,4.94,11.95,11.42S66.7,80.47,68,85.24C68.08,85.73,68.2,86.22,68.31,86.69Z"/>
            <Path fill="#8cc63f" d="M61.35,124a55.71,55.71,0,0,1-6.63-1.46L57.17,116l.53.83A21.1,21.1,0,0,0,61.35,124Z"/>
            <Path fill="#8cc63f" d="M46.35,92.84A114.56,114.56,0,0,0,57.17,116l-2.45,6.48c-8.23-2.29-19.81-7.5-24-19C25.08,87.81,17.7,45.32,0,30.92c0,0,5.66-1,14.63,3.87C19,37.16,24.23,39.71,30,46.86s7.52,13.36,9.53,18.84C43.6,76.78,43.85,85,46.35,92.84Z"/>
            <Path fill="#8cc63f" d="M110,116.27c0,.2-.1.4-.17.6.18-.27.35-.55.53-.83l-.18-.48C110.09,115.81,110,116,110,116.27Z"/>
            <Path fill="#8cc63f" d="M103.9,124.27c.09,0,.92-.08,2.25-.29a20.92,20.92,0,0,0,3.65-7.11A35.76,35.76,0,0,1,103.9,124.27Z"/>
            <Path fill="#8cc63f" d="M84,136.45a46.05,46.05,0,0,0,16.22-6.9c2.22-2.34,3.44-3.79,3.44-3.79l1.1-.14c.48-.52.95-1.07,1.39-1.64-1.42.22-2.26.29-2.26.29a35.16,35.16,0,0,0,5.91-7.4c.07-.2.12-.4.17-.6s.12-.46.18-.71l-11-28.87c-2.14,8.91-1.8,15.48-3.2,21.92C93.94,118.07,88.35,131.94,84,136.45Z"/>
            <Path fill="#8cc63f" d="M103.9,124.27c.09,0,.92-.08,2.25-.29a20.92,20.92,0,0,0,3.65-7.11A35.76,35.76,0,0,1,103.9,124.27Z"/>
            <Path fill="#8cc63f" d="M103.66,125.76s-1.22,1.45-3.44,3.79a29,29,0,0,0,4.54-3.93Z"/>
            <Path fill="#8cc63f" d="M99.19,86.69l11,28.87c3.43-14.18,6.36-49.5,19.86-62.86,0,0-4.84-.32-12,4.49-3.52,2.36-7.69,4.94-12,11.42a42.41,42.41,0,0,0-5.85,14c-.23.89-.45,1.77-.67,2.62C99.42,85.73,99.3,86.22,99.19,86.69Z"/>
            <Path fill="#8cc63f" d="M106.15,124a55.8,55.8,0,0,0,6.64-1.46L110.33,116c-.18.28-.35.56-.53.83A20.92,20.92,0,0,1,106.15,124Z"/>
            <Path fill="#8cc63f" d="M121.15,92.84A114.56,114.56,0,0,1,110.33,116l2.46,6.48c8.23-2.29,19.81-7.5,24-19,5.68-15.72,13.07-58.21,30.76-72.61,0,0-5.66-1-14.62,3.87-4.42,2.37-9.6,4.92-15.36,12.07S130,60.22,128,65.7C123.91,76.78,123.65,85,121.15,92.84Z"/>
            <AnimatedRect x={73.41} y={0} style={{ transform: [{ scale: rectScale }], opacity: rectOpacity }}>
              <Rect fill="#8cc63f" width="21" height="65" rx="1.18"/>
              <Rect fill="#8cc63f" x={73.41} y={-73.41} width="21" height="65" rx="1.18" transform="translate(51.41 116.41) rotate(-90)"/>
            </AnimatedRect>
            <Polygon fill="#8cc63f" points="98.64 89.22 109.12 118.83 111.46 109.18 99.55 85.24 98.64 89.22"/>
            <Polygon fill="#8cc63f" points="68.79 88.92 58.41 121 56.41 111 67.88 84.94 68.79 88.92"/>
          </G></G>
        </Svg>
      </Animated.View>
      <Animated.Text className="absolute text-5xl font-bold text-center top-[55%] text-black" style={{ opacity: nameOpacity }}>VolunTech</Animated.Text>
    </View>
  );
}