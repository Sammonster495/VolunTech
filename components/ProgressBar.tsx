import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface ProgressBarProps {
    progress: number;
    signed:number;
    required:number;
}

export default function ProgressBar(props: ProgressBarProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.progressBarContainer}>
            <Text style={styles.progressText}>{`${props.signed}/${props.required}`}</Text>
            <View style={[styles.progressBar, { width: `${props.progress * 100}%` }]}></View>
        </View>
    );
}

const createStyles = (theme: string) =>StyleSheet.create({
    progressBarContainer: {
        height: 20, // Adjust height as needed
        width: '50%', // Takes full width
        backgroundColor: '#D3D3D3',
        overflow: 'hidden',
        position: 'absolute'
    },
    progressBar: {
        height: '100%',
        backgroundColor:theme === 'light' ? '#DCE31A':'#74a608',
        position: 'relative',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: [{ translateY: -9 }], // Adjust based on text size and container height
        zIndex: 1, // Ensures text is above progress bar visually
    },
});