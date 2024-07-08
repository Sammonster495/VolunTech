import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

function donations3() {
    const [email, onChangeEmail] = useState('');
    const [phone, onChangePhone] = useState('');
    const [upiId, onChangeUpi] = useState('');
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Choose your Donation amount</Text>
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>50</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>500</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>1000</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Text style={{color:'#FFFFFF'}}>10000</Text>
                    </TouchableOpacity>
                </View>
                <View style={{marginTop:20}}>
                    <View style={{paddingTop:10,paddingBottom:10}}>
                        <Text style={styles.text}>E-mail</Text>
                        <TextInput
                            value={email}
                            onChangeText={onChangeEmail}
                            style={styles.input}
                        />
                    </View>
                    <View style={{paddingTop:10,paddingBottom:10}}>
                        <Text style={styles.text}>Phone Number</Text>
                        <TextInput
                            value={phone}
                            onChangeText={onChangePhone}
                            style={styles.input}
                        />
                    </View>
                    <View style={{paddingTop:10,paddingBottom:10}}>
                        <Text style={styles.text}>UPI Id</Text>
                        <TextInput
                            value={upiId}
                            onChangeText={onChangeUpi}
                            style={styles.input}
                        />
                    </View>
                </View>
                <TouchableOpacity
                style={styles.donate}>
                    <Text>Donate</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    content:{
        backgroundColor:'#1E1E1E',
        padding:25,
        height:800
    },
    header:{
        fontSize:36,
        color:'#74A608',
        textAlign: 'center',
        marginBottom:10
    },
    text:{
        color:'#FFFFFF',
        fontSize: 16
    },
    buttons:{
        alignContent:'space-evenly',
        justifyContent:'center',
        flexDirection:'row',
        paddingTop:20
    },
    box:{
        backgroundColor:'#74A608',
        height:40,
        width:48,
        margin:5,
        justifyContent:'center',
        alignContent: 'center',
        alignItems: 'center',
        borderWidth:2,
        borderRadius:10,
        borderColor:'#EBF21B'
    },
    input: {
        height: 40,
        borderColor: '#797979',
        borderWidth: 1,
        borderRadius: 5,
        paddingTop:5,
        backgroundColor: '#234006',
    },
    donate: {
        width:213,
        height:34,
        marginTop:50,
        marginLeft:50,
        backgroundColor:'#EBF21B',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems:'center',
        borderRadius:5
    }
})

export default donations3;