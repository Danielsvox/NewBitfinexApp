import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import { Image } from "expo-image";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";

import { TickersContext, checkRateLimit, capitalizeFLetter, getStyles } from './utils';
import NewsComponent from './NewsComponent';
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
    const [selectedSection, setSelectedSection] = useState('News');
    const topTickers = [...tickers].sort((a, b) => b.usdVolume - a.usdVolume).slice(0, 5);
    const { theme } = React.useContext(ThemeContext);
    const styles = getStyles(theme)

    const renderContent = () => {
        switch (selectedSection) {
            case 'Winners':
                return <TickersComponent navigation={navigation} displayType="Winners" />;
            case 'News':
                return <NewsComponent navigation={navigation} />;
            case 'Movers':
                return <TickersComponent navigation={navigation} displayType="Movers" />;
            case 'Losers':
                return <TickersComponent navigation={navigation} displayType="Losers" />;
            default:
                return <NewsComponent navigation={navigation} />;
        }
    };


    return (
        <View style={styles.view}>
            <View style={styles.text}>
                <Text style={styles.totalBalance}>Total Balance</Text>
                <Text style={[styles.text1, styles.textFlexBox]}>$10000</Text>
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

            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                style={styles.scrollSelections}
            >
                {['Winners', 'Losers', 'Movers', 'News'].map((section) => (
                    <TouchableOpacity
                        key={section}
                        style={[
                            styles.selections,
                            section === selectedSection && styles.selectedSelection
                        ]}
                        onPress={() => setSelectedSection(section)}
                    >
                        <Text
                            style={[
                                styles.selectionsText,
                                section === selectedSection && styles.selectedSelectionText // Apply the 'selectedSelectionText' style if this section is selected
                            ]}
                        >
                            {section}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>



            <View style={styles.contentArea}>

                {selectedSection === 'News' && (
                    <NewsComponent />
                )}

                {selectedSection !== 'News' && renderContent()}
            </View>


        </View >
    );
};

{/*
const styles = StyleSheet.create({
    view: {
        flex: 1,
        //backgroundColor: '#152330'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: height * 0.01, // 1% of screen height
    },

    icon: {
        width: 30, // Or appropriate size
        height: 30, // Or appropriate size
    },
    home: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: FontFamily.Inter,
        letterSpacing: 1,
        color: Color.colorGray_200,
    },
    balanceText: {
        padding: 5,
        alignItems: 'flex-start', // Aligns children to the start
    },
    text1: {
        padding: 5,
        fontSize: 30,
        fontWeight: "500",
        textAlign: "left",

        color: Color.colorGray_200,
        fontFamily: FontFamily.sFProText,
        letterSpacing: 1,
    },
    textFlexBox: {
        textAlign: "left",
        left: "1%",
    },
    totalBalance: {
        padding: 5,
        left: '1%',
        color: Color.colorGray_100,
        fontSize: FontSize.size_xs,
        textAlign: "left",
        fontWeight: "500",
        fontFamily: FontFamily.sFProText,
        letterSpacing: 1,
    },
    scrollView: {
        flex: 1, // Take the remaining available space
    },
    section: {
        flexDirection: 'row', // To layout cards horizontally
        overflow: 'scroll', // To allow scrolling
    },
    card: {
        width: width * 0.7, // 60% of screen width
        height: height * 0.32, // 25% of screen height
        margin: width * 0.02, // 2% of screen width
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: height * 0.005 }, // 0.5% of screen height
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: height * 0.01,
    },
    logo: {
        width: width * 0.1, // 10% of screen width
        height: width * 0.1, // keeping it square
        borderRadius: width * 0.05, // half of logo width
    },
    tokenName: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    graphPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Padding to ensure the graph does not touch the edges of the card
    },
    bottomSection: {
        padding: 10,
    },
    dailyVolume: {
        fontSize: 14,
        color: 'green',
    },
    lastTradedPrice: {
        fontSize: 14,
    },
    scrollSelections: {
        flex: 1,
        height: height * 0.2,

    },
    selections: {
        width: width * 0.2, // 20% of screen width
        height: height * 0.05, // 5% of screen height
        margin: width * 0.02,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: height * 0.005 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    selectionsText: {
        fontFamily: FontFamily.Inter,
    },
    selectedSelection: {
        backgroundColor: '#2C66CB', // Replace 'yourSelectedColor' with the desired color for the selected section
    },
    selectedSelectionText: {
        color: 'white',
    },
    contentArea: {
        flex: 1, // Takes up remaining vertical space
        marginTop: -200, // or an appropriate value
    },
});
*/}

export default Frame;
