import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import {Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function about() {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    return (
        <SafeAreaView style={{ flex: 1,backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6ffaf',}}>
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.header}>Vision</Text>
                    <Text style={styles.content}>Our vision at VolunChat is to create a robust and responsive volunteer network that empowers communities to efficiently manage and respond to disasters. By connecting volunteers and NGOs through innovative technology, we aim to foster safer, more resilient communities worldwide.</Text>
                </View>
                <View style={styles.container}>
                    <Text style={styles.header}>Mission</Text>
                    <Text style={styles.content}>Our mission is to empower communities by providing a platform for efficient disaster response and volunteer coordination. We aim to connect volunteers, NGOs, and local authorities to facilitate rapid, effective, and collaborative efforts during crises.</Text>
                </View>
                <View style={[styles.container,{marginBottom:20}]}>
                    <Text style={styles.header}>Team Members</Text>
                    <View style={{flexDirection:'row', width:"90%", justifyContent: 'space-around' }}>
                        <View  style={{width:'25%', backgroundColor:'#d9d9d9',borderRadius:10}}>
                            <Image source={require('@/assets/images/profile.png')} borderRadius={1}/>
                            <Text style={{textAlign:'center'}}>Ameya Guru Kowshik</Text>
                        </View>
                        <View style={{width:'25%', backgroundColor:'#d9d9d9',borderRadius:10}}>
                            <Image source={require('@/assets/images/profile.png')} borderRadius={1}/>
                            <Text style={{textAlign:'center'}}>Aishik Roy</Text>
                        </View>
                        <View style={{width:'25%', backgroundColor:'#d9d9d9',borderRadius:10}}>
                            <Image source={require('@/assets/images/profile.png')} borderRadius={1}/>
                            <Text style={{textAlign:'center'}}>Ashish Hebbar</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row',width:'90%',justifyContent:'space-around',marginTop:7}}>
                        <View style={{width:'25%',backgroundColor:'#d9d9d9',borderRadius:10}}>
                            <Image source={require('@/assets/images/profile.png')} borderRadius={1}/>
                            <Text style={{textAlign:'center'}}>Rakshith N Poojary</Text>
                        </View>
                        <View style={{width:'25%',backgroundColor:'#d9d9d9',borderRadius:10}}>
                            <Image source={require('@/assets/images/profile.png')} borderRadius={1}/>
                            <Text style={{textAlign:'center'}}>Samarth H Shetty</Text>
                        </View>
                    </View>
                </View>
                <View style={{backgroundColor:theme === 'light' ? 'black' : 'white',height:2,width:'90%',alignSelf:'center'}}></View>
                <View style={{marginTop:20,marginBottom:10,flexDirection:'row',width:'100%',justifyContent:'space-around',alignContent:'center'}}>
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/voluntech_nitte')}>
                        <Image source={theme === 'light' ? require('@/assets/images/insta.png') : require('@/assets/images/insta-dark.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.github.com/Sammonster495/VolunTech')}>
                        <Image source={theme === 'light' ? require('@/assets/images/github.png') : require('@/assets/images/github-dark.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('mailto:samarthshetty495@gmail.com')}>
                        <Image source={theme === 'light' ? require('@/assets/images/google.png') : require('@/assets/images/google-dark.png')}/>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const createStyles = (theme:string) => StyleSheet.create({
    container:{flexDirection:'column',justifyContent:'center',alignItems:'center',marginTop:10},
    header: {
        flexDirection: 'row',
        width: '90%',
        fontSize: 24,
        textAlign: 'center',
        color: theme === 'light' ? 'black' : 'white',
    },
    content: {
        flexDirection: 'row',
        width: '90%',
        fontSize: 18,
        textAlign: 'center',
        color: theme === 'light' ? 'black' : '#c9c9c9',
    }
})