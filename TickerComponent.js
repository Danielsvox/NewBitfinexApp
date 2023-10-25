import { TickersContext, capitalizeFLetter, getStyles } from './utils';
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from "expo-image";
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import ThemeContext from './themes/ThemeContext';

const TickersComponent = ({ navigation, displayType }) => {
    const { tickers, getLogoFilename } = useContext(TickersContext);
    const { theme } = React.useContext(ThemeContext);
    const styles = getStyles(theme)

    let sortedTickers = [...tickers];
    switch (displayType) {
        case "Losers":
            sortedTickers.sort((a, b) => a.tickerData.daily_change_relative - b.tickerData.daily_change_relative);
            sortedTickers = sortedTickers.slice(0, 10);
            break;
        case "Winners":
            sortedTickers.sort((a, b) => b.tickerData.daily_change_relative - a.tickerData.daily_change_relative);
            sortedTickers = sortedTickers.slice(0, 10);
            break;
        case "Movers":
            sortedTickers.sort((a, b) => b.absPercMove - a.absPercMove); // Assuming 'volume' is the right property for trading volume
            sortedTickers = sortedTickers.slice(0, 10);
            break;
        default:
            sortedTickers.sort((a, b) => b.usdVolume - a.usdVolume);
            break;
    }


    return (
        <ScrollView style={styles.scrollViewTickers}>
            {sortedTickers.map((ticker, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => {
                        navigation.navigate("TickerDetail", { ticker: ticker });

                    }}>
                    <View key={index} style={styles.moversCard}>
                        <View style={styles.topSectionTickers}>
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

export default TickersComponent;
