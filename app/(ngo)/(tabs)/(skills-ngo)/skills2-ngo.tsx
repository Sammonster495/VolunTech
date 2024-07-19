import { useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import YouTube from 'react-native-youtube-iframe';


const skillDetails: { [key: number]: { skill: string, video: string, ddlink: string, ttlink: string, wikihow: string } } = {
    1:{
        skill:'Medical',
        video:'Fd5dEN7zfok',
        ddlink:'https://www.webmd.com/first-aid/ss/slideshow-first-aid-tips',
        ttlink:'https://unchartedsupplyco.com/blogs/the-four-pillars/basic-first-aid',
        wikihow:'https://www.wikihow.com/wikiHowTo?search=First+Aid+&Search='
    },
    2:{
        skill:'Transport',
        video:'ApzANyz15KI',
        ddlink:'https://www.youtube.com/watch?v=L1A_qddegU4',
        ttlink:'https://www.edmunds.com/driving-tips/how-to-survive-the-top-10-driving-emergencies.html',
        wikihow:'https://www.wikihow.com/Drive-Tactically-(Technical-Driving)'
    },
    3:{
        skill:'Rescue',
        video:'EGZOFZ3PQTI',
        ddlink:'https://nidm.gov.in/PDF/IEC/Dosnewnidm.pdf',
        ttlink:'https://nidm.gov.in/PDF/IEC/Dosnewnidm.pdf',
        wikihow:'https://www.wikihow.com/Category:Animal-Rescue'
    },
    4:{
        skill:'Finance',
        video:'UzhpPN1SXUk',
        ddlink:'https://www.getzype.com/blog/finance/the-dos-and-donts-of-personal-finance-planning/',
        ttlink:'https://www.investopedia.com/articles/younginvestors/08/eight-tips.asp',
        wikihow:'https://www.wikihow.com/Manage-Family-Finances'
    },
    5:{
        skill:'Shelter Building',
        video:'iAkGyPVOpx0',
        ddlink:"https://survivaldispatch.com/survival-shelter-building-101/#:~:text=Even%20if%20there%20isn't,to%20be%20anywhere%20near%20it",
        ttlink:'https://shedknives.com/blogs/theskblog/blog-68',
        wikihow:'https://www.wikihow.com/wikiHowTo?search=Shelter+Building&Search='
    },
    6:{
        skill:'Other',
        video:'',
        ddlink:'',
        ttlink:'',
        wikihow:''
    }
}

export default function skills2() {
    const route = useRoute();
    const {skillId} = route.params as {skillId: number};
    const skillDetail = skillDetails[skillId];

    const openURL = async (url: string) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            Linking.openURL(url);
        }else{
            Alert.alert("error", "Could not open URL");
        }
    }

    return (
        <SafeAreaView style={{ backgroundColor: '#f6ffe2', flex: 1}}>
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

const styles = StyleSheet.create({
    headerContainer:{
        backgroundColor:'#f6ffe2',
        height:150,
        padding:20,
        margin:7,
        borderRadius:10,
    },
    header:{
        color:'#627F00',
        fontSize:32,
        alignSelf: 'center',
    },
    text:{
        color:'#809B6B',
        fontSize:20,
        alignSelf: 'center',
        padding:10,
    },
    contentContainer:{
        backgroundColor: '#f6ffe2',
        height:'auto',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:25,
        paddingVertical:3
    },
    LongComponent1: {
        backgroundColor:'#f6ffe2',
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
        backgroundColor:'#627F00',
        padding:3,
        margin:2,
        height:100,
        width:"100%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:7
    },
    ShortComponent: {
        backgroundColor:'#627F00',
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