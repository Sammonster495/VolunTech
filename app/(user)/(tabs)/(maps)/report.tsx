import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";
import { imagePickHandler, locationFetchHandler, reportSubmitHandler } from "@/firebase/user/maps";

export default function Report() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [image, setImage] = useState<{uri: string}>({ uri: "" });
    const [description, setDescription] = useState<string>();
    const [location, setLocation] = useState<{ address: string, latitude: number, longitude: number } | null>(null);
    const [reporting, setReporting] = useState<boolean>(false);

    const pickImage = () => imagePickHandler(setImage);

    const getLocation = () => locationFetchHandler(setLocation);

    const handleSubmit = () => reportSubmitHandler(image, description, navigation, getLocation, setReporting);

    return (
        <GestureHandlerRootView>
            <ScrollView style={{backgroundColor:theme === 'light' ? '#f6ffe2' : '#1e1e1e'}} className=" min-h-screen">
                <View style={{backgroundColor:theme === 'light' ? 'white' : 'black',borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white' }} className="h-56 w-48 border self-center mt-8 flex justify-center items-center">
                    {!image?.uri && <TouchableOpacity className="w-8 h-8 flex-0 rounded-full" onPress={() => pickImage()}><Image source={theme === 'light' ? require('@/assets/images/image.png') : require('@/assets/images/image-dark.png')} /></TouchableOpacity>}
                    {image?.uri && <Image source={{ uri: image.uri }} style={{ height: 224, width: 192 }} />}
                </View>
                <TextInput style={{backgroundColor:theme === 'light' ? 'white' : 'black',borderWidth:1,borderColor:theme === 'light' ? 'black' : 'white', color:theme === 'light' ? 'black' : 'white' }} placeholderTextColor={theme === 'light' ? 'grey' : '#d9d9d9'} placeholder="Add a description..." className="w-[80%] h-32 border text-lg self-center mt-8 px-2" value={description} onChangeText={(text) => setDescription(text)} />
                <TouchableOpacity style={{backgroundColor:theme === 'light' ? '#74a608' : '#1E1E1E',borderWidth:1,borderColor:theme === 'light' ? '' : '#ebf21b'}} className=" w-[30%] h-10 flex justify-center items-center rounded-2xl self-center mt-10" onPress={() => handleSubmit()}><Text style={{color:theme === 'light' ? 'white' : '#ebf21b'}} className=" text-xl">{reporting ? 'Reporting...' : 'Report'}</Text></TouchableOpacity>
            </ScrollView>
        </GestureHandlerRootView>
    )
}
