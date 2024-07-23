import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CometChat } from "@cometchat-pro/react-native-chat";
import React from "react";

export const taskRegisterHandler = async (user: any, task: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        const userDoc = userDocSnap.data();

        const taskDocRef = doc(db, 'tasks', task.id);
        const taskDocSnap = await getDoc(taskDocRef);
        const taskDoc = taskDocSnap.data();

        if (!taskDoc || !userDoc) {
            throw new Error('Document data not found.');
        }

        const { personnel = [], volunteeredPersonnel = {} } = taskDoc;
        const { registeredTasks = [], skill } = userDoc;

        if ((personnel.length === 0 || !personnel.some(p => p.id === user.id)) &&
            volunteeredPersonnel[skill] !== taskDoc.requiredPersonnel[skill]) {
            setLoading(true);

            const updatedPersonnel = [...personnel, { id: user.id, name: user.name }];
            const updatedVolunteeredPersonnel = {
                ...volunteeredPersonnel,
                [skill]: (volunteeredPersonnel[skill] || 0) + 1
            };

            await updateDoc(taskDocRef, {
                personnel: updatedPersonnel,
                volunteeredPersonnel: updatedVolunteeredPersonnel
            });

            await updateDoc(userDocRef, {
                registeredTasks: [...registeredTasks, task.id]
            });
            setTasks(prevTasks => {
                const index = prevTasks.findIndex(t => t.id === task.id);
                if(index !== -1) {
                    prevTasks.splice(index, 1);
                    return [...prevTasks];
                }
                return prevTasks;
            })
            CometChat.joinGroup(task.group.guid).then(async() => {
                const member = new CometChat.GroupMember(user.id, CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT);
                const q = query(collection(db, 'groups'), where('guid', '==', task.group.guid));
                const querySnapshot = await getDocs(q);
                if(!querySnapshot.empty){
                    updateDoc(doc(db, 'groups', querySnapshot.docs[0].id), {
                        members: [...querySnapshot.docs[0].data().members, {id: user.id, name: user.name}]
                    })
                }
            })
            setLoading(false);
        }
    } catch (error) {
        console.error("Error registering for task:", error);
    }
}

export const taskModifiedSubscriptionHandler = (setTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        snapshot.docChanges().forEach(change => {
            if(change.type === 'modified') {
                const task = change.doc.data();
                if(task.id) {
                    setTasks(prevTasks => {
                        const index = prevTasks.findIndex(t => t.id === change.doc.id);
                        if(index !== -1) {
                            prevTasks[index] = task;
                            return [...prevTasks];
                        }
                        return prevTasks;
                    });
                }
            }
        });
    });

    return () => unsubscribe();
}

export const taskAddedSubscriptionHandler = (user: any, setTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        snapshot.docs.forEach(doc => {
            const task = doc.data();
            if(!(JSON.stringify(task.requiredPersonnel) === JSON.stringify(task.volunteeredPersonnel)) && !userDoc.data()?.registeredTasks.includes(doc.id) && Object.keys(task.requiredPersonnel).includes(userDoc.data()?.skill) && task.id) {
                setTasks(prevTasks => {
                    if(prevTasks.findIndex(t => !t.id || t.id === doc.id) === -1) 
                        return [...prevTasks, task];
                    return prevTasks;
                });
            }
        });
    });

    return () => unsubscribe();
}