import { useNavigation } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, Pressable} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function skills1() {

    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const navigateToSkills = (skillId: number) => {
        navigation.navigate('skills2-ngo',{skillId: skillId});
    }

    return (
        <SafeAreaView style={{flex:1, backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2'}}>
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

const createStyles = (theme: string) => StyleSheet.create({
    headerContainer:{
        backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        height:150,
        padding:20,
        margin:7,
        borderRadius:10,
    },
    header:{
        color:theme === 'light' ? '#627F00' : '#83A638',
        fontSize:32,
        alignSelf: 'center',
    },
    text:{
        color:theme === 'light' ? '#809B6B' : '#FFFFFF',
        fontSize:15,
        padding:10,
    },
    listContainer: {
        backgroundColor:theme === 'dark' ? '#1E1E1E' : '#f6ffe2',
        height:'auto',
        
    },
    listRow: {
        flexDirection: 'row',
        alignContent:'space-between',
        justifyContent: 'space-around',
        marginHorizontal: 10,
        paddingVertical:5
    },
    listComponent: {
        backgroundColor:theme === 'light' ? '#627F00' : '#74A608',
        padding:3,
        margin:5,
        height:120,
        width:140,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:7
    },
    listText:{
        color:theme === 'light' ? '#FFFFFF' : '#262626',
        fontSize:15,
        fontWeight:'700'
    }
})