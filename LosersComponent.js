import { TickersContext, capitalizeFLetter } from './utils';
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from "expo-image";
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const LosersComponent = ({ navigation }) => {
    const { tickers, getLogoFilename } = useContext(TickersContext);
    const Losers = [...tickers].sort((a, b) => a.tickerData.daily_change_relative - b.tickerData.daily_change_relative).slice(0, 10);

    return (
        <ScrollView style={styles.scrollView}>
            {Losers.map((ticker, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => {
                        navigation.navigate("TickerDetail", { ticker: ticker });

                    }}>
                    <View key={index} style={styles.moversCard}>
                        <View style={styles.topSection}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    style={styles.logo}
                                    source={{ uri: getLogoFilename(ticker) }}
                                />
                                <Text style={styles.title}>
                                    {capitalizeFLetter(ticker.verboseName)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.percentageChange,
                                ticker.tickerData.daily_change_relative > 0 ? styles.positiveValue : styles.negativeValue
                            ]}>
                                {`${parseFloat(ticker.tickerData.daily_change_relative * 100).toFixed(2)}% ${ticker.tickerData.daily_change_relative > 0 ? '🔺' : '🔻'}`}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        padding: 5
    },
    moversCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10
    },
    topSection: {
        alignItems: "center",
        flexDirection: 'row',
        padding: height * 0.01,
        justifyContent: "space-between"
    },
    logo: {
        width: width * 0.1, // 10% of screen width
        height: width * 0.1, // keeping it square
        borderRadius: width * 0.05, // half of logo width
    },
    positiveValue: {
        color: 'green',
        fontSize: 18,
        fontWeight: 'bold',
    },
    negativeValue: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LosersComponent;
