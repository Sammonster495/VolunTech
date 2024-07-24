import { Text, View, StyleSheet, SafeAreaView, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import * as SecureStore from 'expo-secure-store';
import ProgressBar from "@/components/ProgressBar";
import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeContext";
import { mapping } from "@/data/tasks";
import { taskRegisterHandler, taskAddedSubscriptionHandler, taskModifiedSubscriptionHandler } from "@/firebase/user/tasks";

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userloading, setUserLoading] = useState<boolean>(true);
    const { theme } = useTheme();
    const styles = createStyles(theme);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await SecureStore.getItemAsync('user');
            if(user){
                const userData = JSON.parse(user);
                setUser(userData);
                setUserLoading(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = taskAddedSubscriptionHandler(user, setTasks);

            return () => unsubscribe();
        }
    },[userloading, user]);

    useEffect(() => {
        if(!userloading && user) {
            const unsubscribe = taskModifiedSubscriptionHandler(setTasks);

            return () => unsubscribe();
        }
    }, [userloading, user]);

    const handleRegister = (task: any) => taskRegisterHandler(user, task, setLoading, setTasks);

    const renderTask = (item:{type:string;signedup:number;required:number}) => {
        return (
            <View style={styles.taskInfo} key={item.type}>
                <Text style={{color:theme === 'light' ? 'black' : '#ffffff',marginBottom:0}}>{mapping[item.type]}</Text>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <ProgressBar progress={item.signedup / item.required} signed={item.signedup} required={item.required} />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Tasks Allocation</Text>
            </View>
            {tasks.length > 0 ? <FlatList
                style={styles.list}
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View key={item.id} style={styles.task} className="self-center">
                        <View style={styles.taskId}>
                            <Image style={{ marginRight: 7 }} source={require('@/assets/images/notifications.png')}/>
                            <View>
                                <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',marginBottom:3, marginRight: 10}}>{item.description}</Text>
                                <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',marginBottom:3, marginRight: 10}}>({item?.createdBy['ngo']['name']})</Text>
                            </View>
                        </View>
                        <View className="flex-row px-5">
                            <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',padding:5, textAlign: 'center'}} className="self-center">Location :</Text>
                            <Text style={{fontSize:16,color:theme === 'light' ? 'black' : '#ffffff',padding:5, textAlign: 'center'}} className="w-4/5">{item.location['address']}</Text>
                        </View>
                        <View style={styles.taskDes}>
                            {Object.keys(item.requiredPersonnel).map(key => (
                                renderTask({ type: key, signedup: item.volunteeredPersonnel[key], required: item.requiredPersonnel[key] })
                            ))}
                            <TouchableOpacity style={styles.register} onPress={() => handleRegister(item)}>
                                {!loading && <Text key={item.id}>Register For Task</Text>}
                                {loading && <ActivityIndicator key={item.id} size="large" color="#0000ff" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            /> : <View className="flex-1"><Text style={{color:theme === 'light' ? '#134006' : '#74a608'}} className="text-center text-4xl my-[60%]">No tasks uploaded</Text></View>}
        </SafeAreaView>
    );
}

const createStyles = (theme: string) => StyleSheet.create({
    container: { flex: 1, backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E', paddingBottom: "18%" },
    content: { justifyContent: 'center', paddingHorizontal: 25 },
    header: { fontSize: 36, color: '#74A608', justifyContent: 'center', marginBottom: 10 },
    task: { display: 'flex', backgroundColor:theme === 'light' ? '#83a638' :'#234006', width: "90%", justifyContent: 'center', borderRadius: 20, marginVertical: 10 },
    taskId: { flexDirection: 'row', alignItems: 'center', height: 60, width: 270, paddingLeft: 25, paddingTop: 10 },
    taskDes: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 10 },
    taskInfo: { justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 10, marginBottom: 10 },
    register: { backgroundColor: '#DCE31A', height: 42, width: 149, justifyContent: 'center', alignContent: 'center', alignItems: 'center', borderRadius: 18, marginTop: 30, marginBottom: 20 },
    list: { flexGrow: 1, paddingBottom: "18%" }
});