import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import React from "react";

export const userTaskAddedSubscriptionHandler = (user: any, setUserTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        snapshot.docs.forEach(doc => {
            const task = doc.data();
            if((!(user?.designation === 'head') || !(user.type['name'] === task.createdBy['ngo']['name'])) && !(JSON.stringify(task.requiredPersonnel) === JSON.stringify(task.volunteeredPersonnel)) && !userDoc.data()?.registeredTasks.includes(doc.id) && Object.keys(task.requiredPersonnel).includes(userDoc.data()?.skill) && task.id) {
                setUserTasks(prevTasks => {
                    if(prevTasks.findIndex(t => t.id === doc.id) === -1) 
                        return [...prevTasks, task];
                    return prevTasks;
                });
            }
        });
    });

    return () => unsubscribe();
}

export const userTaskModifiedSubscriptionHandler = (setUserTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        snapshot.docChanges().forEach(change => {
            if(change.type === 'modified') {
                const task = change.doc.data();
                if(task.id) {
                    setUserTasks(prevTasks => {
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

export const ngoTaskAddedSubscriptionHandler = (user: any, setNgoTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        snapshot.docs.forEach(doc => {
            const task = doc.data();
            if(user?.designation === 'head' && user.type['name'] === task.createdBy['ngo']['name'] && task.id) {
                setNgoTasks(prevTasks => {
                    if(prevTasks.findIndex(t => t.id === doc.id) === -1) 
                        return [...prevTasks, task];
                    return prevTasks;
                });
            }
        });
    });
    return () => unsubscribe();
}

export const ngoTaskModifiedSubscriptionHandler = (setNgoTasks: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), async(snapshot) => {
        snapshot.docChanges().forEach(change => {
            if(change.type === 'modified') {
                const task = change.doc.data();
                if(task.id) {
                    setNgoTasks(prevTasks => {
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

export const pendingReportSubscriptionHandler = (setPendingReports: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribePending = onSnapshot(collection(db, 'reports'), (snapshot) => {
        snapshot.docs.map(doc => {
            const report = doc.data();
            if (report.status === 'pending' && !report.verified) {
                setPendingReports(prevReports => {
                    if (prevReports.findIndex(r => r.id === doc.id) === -1)
                        return [...prevReports, report];
                    return prevReports;
                });
            }
        });
    });

    return () => unsubscribePending();
}

export const verifiedReportSubscriptionHandler = (user: any, setVerifiedReports: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribeVerified = onSnapshot(collection(db, 'reports'), async(snapshot) => {
        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        if (!snapshot.empty) {
            snapshot.docs.map(doc => {
                const report = doc.data();
                if (report.status === 'verified') {
                  if (!(userDoc.data()?.viewedVerifiedNotifications.includes(doc.id))) {
                    setVerifiedReports(prevReports => {
                        if(prevReports.findIndex(r => r.id === doc.id) === -1) 
                            return [...prevReports, report];
                        return prevReports;
                    });
                  }
                }
            })
        }
    });

    return () => unsubscribeVerified();
}

export const incidentSubscriptionHandler = (user: any, setIncidents: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), async(snapshot) => {
        snapshot.docs.map(doc => {
            const report = doc.data();
            if (report.status === 'verified' && report.verified && report.proof['ngoName'] === user.type['name']) {
                setIncidents(prevIncidents => {
                    if (prevIncidents.findIndex(i => i.id === doc.id) === -1)
                        return [...prevIncidents, report];
                    return prevIncidents;
                })
            }
        })
    })

    return () => unsubscribe();
}

export const groupSubscriptionHandler = (user: any, setGroups: React.Dispatch<React.SetStateAction<any[]>>) => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), async(snapshot) => {
        snapshot.docs.map(doc => {
            const group = doc.data();
            if (group.ngo['id'] === user.type['id']) {
                setGroups(prevGroups => {
                    if (prevGroups.findIndex(i => i.guid === doc.data().guid) === -1)
                        return [...prevGroups, group];
                    return prevGroups;
                })
            }
        })
    })

    return () => unsubscribe();
}

export const timestampToDate = (timestamp: { seconds: number; nanoseconds: number; }) => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
}

export const timestampToTime = (timestamp: { seconds: number; nanoseconds: number; }) => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours.toString().padStart(2, '0');
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
}