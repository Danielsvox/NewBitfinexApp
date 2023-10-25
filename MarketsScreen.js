import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import { Image } from "expo-image";
import { Text, View, ScrollView, TouchableOpacity, Animated } from "react-native";

import { TickersContext, checkRateLimit, capitalizeFLetter, getStyles } from './utils';
import { LineChart } from 'react-native-wagmi-charts';

import TickersComponent from "./TickerComponent";

import { useNavigation } from '@react-navigation/native';
import ThemeContext from './themes/ThemeContext';

const TickerCard = ({ ticker, getLogoFilename, navigation }) => {
    const [candleData, setCandleData] = useState([]);
    const [transformedData, setTransformedData] = useState([]);
    const [chartColor, setChartColor] = useState('green'); // default to green
    const { theme } = React.useContext(ThemeContext);
    const styles = getStyles(theme)

    useEffect(() => {
        const fetchCandleData = async () => {
            try {
                const candleEndpoint = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=24`;
                const response = await fetch(candleEndpoint);
                // Check for rate limiting
                checkRateLimit(response);
                const data = await response.json();
                setCandleData(data);
            } catch (error) {
                console.error("Error fetching candle data:", error);
            }
        };

        fetchCandleData();
    }, [ticker]);

    useEffect(() => {
        const transformed = candleData.map(candle => ({
            timestamp: candle[0],
            value: candle[2],
        })).sort((a, b) => a.timestamp - b.timestamp);

        if (transformed && transformed.length > 0) {
            setTransformedData(transformed);
            const color = transformed[transformed.length - 1].value >= transformed[0].value ? 'green' : 'red';
            setChartColor(color);
        }
    }, [candleData]);

    return (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate("TickerDetail", { ticker: ticker });
            }}
        >
            <View style={styles.card}>
                <View style={styles.topSection}>
                    <Image
                        style={styles.logo}
                        source={{ uri: getLogoFilename(ticker) }}
                    />
                    <Text style={styles.tokenName}>
                        {capitalizeFLetter(ticker.verboseName)}
                    </Text>
                </View>
                <View style={styles.graphPlaceholder}>
                    {transformedData.length > 0 ? (
                        <LineChart.Provider style={styles.lineChart} data={transformedData}>
                            <LineChart width={230} height={110}>
                                <LineChart.Path color={chartColor}>
                                    <LineChart.Gradient />
                                </LineChart.Path>
                            </LineChart>
                        </LineChart.Provider>
                    ) : (
                        <Text>Loading chart...</Text>
                    )}
                </View>

                <View style={styles.bottomSection}>
                    <Text style={styles.dailyVolume}>
                        Last Traded Price: ${parseFloat(ticker.tickerData.last_price).toFixed(2)} USD
                    </Text>
                    <Text style={styles.lastTradedPrice}>
                        Volume: {(ticker.usdVolume)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};




const Frame = () => {
    const { tickers, getLogoFilename } = useContext(TickersContext);
    const navigation = useNavigation();
    const topTickers = [...tickers].sort((a, b) => b.usdVolume - a.usdVolume).slice(0, 10);

    const { theme } = React.useContext(ThemeContext);
    const styles = getStyles(theme)

    const [scrollY, setScrollY] = useState(new Animated.Value(0));

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    return (
        <Animated.ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            <View style={styles.view}>
                <View style={styles.text}>
                    <Text style={[styles.text1, styles.textFlexBox]}>Top Currency</Text>
                </View>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={true}  // set to true if you want "page" scrolling
                    style={styles.scrollView}
                >
                    <View style={styles.section}>
                        {topTickers.length ? (
                            topTickers.map((ticker, index) => (
                                <TickerCard
                                    key={index}
                                    ticker={ticker}
                                    getLogoFilename={getLogoFilename}
                                    navigation={navigation}
                                />
                            ))
                        ) : (
                            <Text>No Tickers Available</Text>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.watchList}>
                    {/* Place your Watch List components here */}
                    <Text style={styles.watchListTitle}>Watch List</Text>
                </View>

                <TickersComponent
                    navigation={navigation}
                />

            </View >
        </Animated.ScrollView>
    );
};

export default Frame;
