import { Text, View, StyleSheet, SafeAreaView, Image, FlatList, Pressable, TouchableOpacity } from "react-native";
import { Header } from "react-native/Libraries/NewAppScreen";

import ProgressBar from "@/components/ProgressBar";

const tasks = [
    {
        id:1,
        type:"Rescue",
        signedup:9,
        required:20
    },
    {
        id:2,
        type:"Medical",
        signedup:2,
        required:10
    },
    {
        id:3,
        type:"Resource Allocation",
        signedup:4,
        required:5
    }
]

export default function Tasks() {
    const renderTask = ({item}:{item:{id:number;type:string;signedup:number;required:number;}}) => {
        return (
            <View style={styles.taskInfo}>
                <Text style={{color:'#FFFFFF',paddingBottom:0}} >{item.type}</Text>
                <ProgressBar progress={item.signedup/item.required} signed={item.signedup} required={item.required}/>
            </View>)
        }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.Content}>
                <Text style={styles.header}>Tasks Allocation</Text>
                <Text style={styles.text}>Register for Task</Text>
                <Text style={styles.text}>You will be added to the respective task’s group chat for further communication</Text>
            </View>
            <View style={styles.task}>
                <View style={styles.taskId}>
                    <Image 
                    style={styles.image}
                    source={require('@/assets/images/profile.png')}/>
                    <View>
                        <Text style={{fontSize:16,color:'#FFFFFF',marginBottom:3}}>Task {1}</Text>
                        <Text style={{fontSize:16,color:'#FFFFFF'}}>{'Earthquake'}:{'Rescue'}</Text>
                    </View>
                </View>
                <Text style={{fontSize:16,color:'#FFFFFF',padding:5,marginLeft:27}}>Location:{'Manipur main market area'}</Text>
                <View style={styles.taskDes}>
                    <FlatList
                    data={tasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id.toString()}
                    />
                    <TouchableOpacity style={styles.register}>
                        <Text>Register For Task</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
        container:{
            flexDirection: 'column'
        },
        Content:{
            justifyContent:'center',
            paddingHorizontal:25,
            paddingBottom: 25
        },
        header:{
            fontSize:36,
            color:'#74A608',
            justifyContent:'center',
            marginBottom:10
        },
        text:{
            fontSize: 16
        },
        task:{
            display:'flex',
            height:760,
            backgroundColor:'#234006',
        },
        taskId:{
            flexDirection:'row',
            alignItems: 'center',
            height:60,
            width:270,
            paddingLeft:25,
            paddingTop:10,
        },
        taskDes:{
            flexDirection:'column',
            alignItems:'center',
            justifyContent:'center',
            paddingTop:10,
        },
        image:{
            height:54,
            width:54,
            marginRight:7,
        },
        taskInfo: {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            flex: 1,
            padding:10
        },
        taskList: {
            height:40,
            width:109
        },
        register:{
            backgroundColor: '#DCE31A',
            height:42,
            width:149,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems:'center',
            borderRadius:18,
            marginTop:10
        }
    }
)