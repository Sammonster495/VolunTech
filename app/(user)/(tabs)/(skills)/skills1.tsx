import { useNavigation } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, Pressable} from 'react-native';

export default function skills1() {

    const navigation = useNavigation();

    const navigateToSkills = (skillId: number) => {
        navigation.navigate('skills2',{skillId: skillId});
    }

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Train Your Skills</Text>
                <Text style={styles.text}>Select a skill of your interest and expertise and train to sharpen them further.</Text>
            </View>
            <View style={styles.listContainer}>
                <View style={styles.listRow}>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(1)}><Text style={styles.listText}>Medical</Text></Pressable>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(2)}><Text style={styles.listText}>Transport</Text></Pressable>
                </View>
                <View style={styles.listRow}>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(3)}><Text style={styles.listText}>Rescue</Text></Pressable>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(4)}><Text style={styles.listText}>Finance</Text></Pressable>
                </View>
                <View style={styles.listRow}>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(5)}><Text style={styles.listText}>Shelter Building</Text></Pressable>
                    <Pressable style={styles.listComponent} onPress={() => navigateToSkills(6)}><Text style={styles.listText}>Others</Text></Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer:{
        backgroundColor:'#E8E8E8',
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
        fontSize:15,
        padding:10,
    },
    listContainer: {
        backgroundColor: '#E8E8E8',
        height:'auto',
    },
    listRow: {
        flexDirection: 'row',
        alignContent:'space-between',
        paddingHorizontal:25,
        paddingVertical:5
    },
    listComponent: {
        backgroundColor:'#627F00',
        padding:3,
        margin:5,
        height:120,
        width:140,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:7
    },
    listText:{
        color:'#FFFFFF',
        fontSize:15,
        fontWeight:'700'
    }
})