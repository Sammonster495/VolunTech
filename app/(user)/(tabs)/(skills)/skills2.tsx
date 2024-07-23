import { useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import YouTube from 'react-native-youtube-iframe';
import { useTheme } from '@/theme/ThemeContext';
import { skillDetails } from '@/data/skills';

export default function skills2() {
    const route = useRoute();
    const {skillId} = route.params as {skillId: number};
    const skillDetail = skillDetails[skillId];
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const openURL = async (url: string) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            Linking.openURL(url);
        }else{
            Alert.alert("error", "Could not open URL");
        }
    }

    return (
        <SafeAreaView style={{ backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2', flex: 1 }}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Train Your Skills</Text>
                <Text style={styles.text}>Skill:{skillDetail.skill}</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.LongComponent1}>
                    <YouTube
                        videoId={skillDetail.video}
                        height={177}
                        width={310}
                        play={false}
                        onError={e => console.log(e)}
                    />
                </View>
                <View style={styles.row}>
                    <Pressable style={styles.ShortComponent} onPress={() => openURL(skillDetail.ddlink)}>
                        <Text style={styles.componentText}>do's and dont's</Text>
                    </Pressable>
                    <Pressable style={styles.ShortComponent} onPress={() => openURL(skillDetail.ttlink)}>
                        <Text style={styles.componentText}>Tips and tricks</Text>
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable style={styles.LongComponent2} onPress={() => openURL(skillDetail.wikihow)}><Text style={styles.componentText}>WikiHow</Text></Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: string) =>StyleSheet.create({
    headerContainer:{
        backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        height:150,
        padding:20,
        margin:7,
        borderRadius:10,
    },
    header:{
        color:theme === 'light' ? '#627F00' : '#74A608',
        fontSize:32,
        alignSelf: 'center',
    },
    text:{
        color:theme === 'light' ? '#809B6B' : '#ffffff',
        fontSize:20,
        alignSelf: 'center',
        padding:10,
    },
    contentContainer:{
        backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        height:'auto',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:25,
        paddingVertical:3
    },
    LongComponent1: {
        backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        padding:3,
        margin:2,
        height:177,
        width:"100%",
        alignContent:'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:7
    },
    LongComponent2: {
        backgroundColor:theme === 'light' ? '#627F00' : '#234006',
        padding:3,
        margin:2,
        height:100,
        width:"100%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:7
    },
    ShortComponent: {
        backgroundColor:theme === 'light' ? '#627F00' : '#234006',
        margin: 2,
        height:100,
        width:"49%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:7
    },
    componentText:{
        color:'#FFFFFF',
        fontSize:15,
        fontWeight:'700'
    }
})