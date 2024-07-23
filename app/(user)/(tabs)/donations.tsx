import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { donationsData } from '@/data/donations';

export default function Donations2() {
    const { theme } = useTheme();
    const styles = createStyles(theme)

    const openURL = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Donate Now</Text>
                <Text style={styles.text}>Available VolunTech NGOs: {donationsData.length}</Text>
            </View>
            <View>
                <FlatList
                    data={donationsData}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.element}
                            onPress={() => openURL(item.url)}
                        >
                            <Text style={styles.showText}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={{ width: "90%", alignSelf: 'center' }}
                />
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: string) => StyleSheet.create({
    container: { flex: 1 },
    content: { justifyContent: 'center', backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E', padding: 25 },
    header: { fontSize: 36, color: '#627F00', justifyContent: 'center', marginBottom: 10 },
    text: { color: '#809B6B', fontSize: 16 },
    list: { height: 460, width: "100%", backgroundColor:theme === 'light' ? '#f6ffe2' : '#1E1E1E' },
    element: { height: 75, backgroundColor: '#627F00', borderRadius: 10, justifyContent: 'center', margin: 3 },
    showText: { fontSize: 40, color:theme === 'light' ? 'white' : 'black', paddingLeft: 15 }
});