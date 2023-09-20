import React from 'react';
import { View, Text } from 'react-native';

const TickerDetailScreen = ({ route }) => {
    const { tickerData } = route.params;

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>{tickerData[0]}</Text>
            <Text>Volume USD: {tickerData[7] * tickerData[8]}</Text>
            {/* Add more details about the ticker and fetch additional data as required */}
        </View>
    );
};

export default TickerDetailScreen;
