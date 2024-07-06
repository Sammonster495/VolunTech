import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

interface ProgressBarProps {
    progress: number;
    signed:number;
    required:number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, signed, required }) => {
    return (
        <View style={styles.progressBarContainer}>
            <Text style={styles.progressText}>{`${signed}/${required}`}</Text>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    progressBarContainer: {
        height: 20, // Adjust height as needed
        width: '100%', // Takes full width
        backgroundColor: '#D3D3D3',
        borderRadius: 20,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#74A608',
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

export default ProgressBar;