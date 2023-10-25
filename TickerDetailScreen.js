import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, Button } from 'react-native';
import { checkRateLimit } from './utils';
import { CandlestickChart } from 'react-native-wagmi-charts';
const { width, height } = Dimensions.get('window');



const TickerDetailScreen = ({ route }) => {
    const { ticker } = route.params;
    const [candleData, setCandleData] = useState([]);
    const [transformedData, setTransformedData] = useState(null);
    console.log(ticker);
    useEffect(() => {
        if (ticker.ticker) {
            const candleEndpoint = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=30`;
            fetch(candleEndpoint)
                .then(checkRateLimit)
                .then(response => response.json())
                .then(data => {
                    setCandleData(data);
                })
                .catch(error => console.error("Error fetching candle data:", error));
        }
    }, [ticker]);

    const transformDataForLineChart = (candlesData) => {
        return (candlesData && Array.isArray(candlesData))
            ? candlesData.map(candle => ({
                timestamp: candle[0],
                open: candle[1],
                close: candle[2],
                high: candle[3],
                low: candle[4],
            }))
                .sort((a, b) => a.timestamp - b.timestamp)
            : []; // Return an empty array if candlesData is null or not an array
    }


    useEffect(() => {
        // Call the transform function only when candleData changes.
        const transformedData = transformDataForLineChart(candleData);
        if (transformedData) {
            setTransformedData(transformedData);
        }
    }, [candleData]);

    function capitalizeFLetter(name) {
        if (name) {
            return name[0].toUpperCase() +
                name.slice(1);
        }
        else {
            return 'Bitcoin';
        }
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Text style={styles.tokenName}>{capitalizeFLetter(ticker.verboseName)}</Text>

            {/* Price & Percentage Change Section */}
            <View style={styles.priceSection}>
                <Text style={styles.price}>{parseFloat(ticker.tickerData.last_price).toFixed(2)}</Text>
                <Text style={[
                    styles.percentageChange,
                    ticker.tickerData.daily_change_relative > 0 ? styles.positiveValue : styles.negativeValue
                ]}>
                    {`${parseFloat(ticker.tickerData.daily_change_relative * 100).toFixed(2)}% ${ticker.tickerData.daily_change_relative > 0 ? '🔺' : '🔻'}`}
                </Text>
            </View>

            {/* Time Interval Buttons (Placeholder) */}
            <View style={styles.intervalButtons}>
                <Button title="1h" onPress={() => { }} />
                <Button title="24h" onPress={() => { }} />
                <Button title="1w" onPress={() => { }} />
            </View>

            {/* Chart Section */}
            {
                transformedData && transformedData.length > 0 ? (
                    <ScrollView horizontal={true}>
                        <View style={styles.chartContainer}>
                            <CandlestickChart.Provider data={transformedData}>
                                <CandlestickChart styles={styles.candleStickStyle}
                                    width={width - 16}
                                    height={300}>
                                    <CandlestickChart.Candles positiveColor='green' negativeColor='red' />
                                    <CandlestickChart.Crosshair>
                                        <CandlestickChart.Tooltip />
                                    </CandlestickChart.Crosshair>
                                    <CandlestickChart.PriceText type="open" />
                                    <CandlestickChart.PriceText type="close" />
                                    <CandlestickChart.PriceText type="high" />
                                    <CandlestickChart.PriceText type="low" />
                                    <CandlestickChart.DatetimeText />
                                </CandlestickChart>
                            </CandlestickChart.Provider>
                        </View>
                    </ScrollView >
                ) : (
                    <Text>Loading data...</Text>
                )
            }

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Button title="SELL" onPress={() => { }} color="lightgrey" />
                <Button title="BUY" onPress={() => { }} color="#4CAF50" />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white'
    },
    tokenName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold'
    },
    intervalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    tradingInfo: {
        marginTop: 20
    },
    title: {
        fontFamily: 'Inter',
        color: 'black',
        fontSize: 20,
        marginLeft: 8,
    },
    volumeText: {
        fontFamily: 'Inter',
        color: 'black',
        fontSize: 16,
    },
    chartContainer: {
        flex: 1,
        marginTop: 10
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    candleStickStyle: {
        backgroundColor: '#152330'
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
    infoText: {
        fontSize: 16,
        marginBottom: 5
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
});

export default TickerDetailScreen;