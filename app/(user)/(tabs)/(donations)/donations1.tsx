import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';

const Data = [
    {
        id: 1,
        title: 'NGO 1'
    },
    {
        id: 2,
        title: 'NGO 2'
    },
    {
        id: 3,
        title: 'NGO 3'
    },
    {
        id: 4,
        title: 'NGO 4'
    },
    {
        id: 5,
        title: 'NGO 5'
    },
    {
        id: 6,
        title: 'NGO 6'
    },
    {
        id: 7,
        title: 'NGO 7'
    },
    {
        id: 8,
        title: 'NGO 8'
    }
]

function donations2() {
    const navigation = useNavigation();
    return (
        <SafeAreaView>
            <View style={styles.content}>
                <Text style={styles.header}>Donate Now</Text>
                <Text style={styles.text}>State : {'Kerala'}</Text>
                <Text style={styles.text}>Avalilable VolunTech NGO's : {5}</Text>
            </View>
            <View>
                <FlatList
                data={Data}
                renderItem={({item}) => <TouchableOpacity
                                            style={styles.element}
                                            onPress={() => navigation.navigate('donations2')}>
                                                <Text style={styles.showText}>{item.title}</Text>
                                        </TouchableOpacity>}
                style={styles.list}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    content:{
        justifyContent:'center',
        backgroundColor:'#f6ffe2',
        padding:25
    },
    header:{
        fontSize:36,
        color:'#627F00',
        justifyContent:'center',
        marginBottom:10
    },
    text:{
        color:'#809B6B',
        fontSize: 16
    },
    list:{
        width:428,
        height:460,
        backgroundColor:'#f6ffe2',
    },
    element:{
        width:350,
        height:75,
        backgroundColor:'#627F00',
        borderRadius:10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        alignContent: 'center',
        margin:3
    },
    showText:{
        fontSize:40,
        color:'#FFFFFF',
        paddingLeft:15
    }
})

export default donations2;