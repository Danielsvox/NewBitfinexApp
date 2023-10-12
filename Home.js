import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import { Image } from "expo-image";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Color, Border, FontSize, FontFamily } from "./GlobalStyles";
import { Icon } from "react-native-elements";
import { tradingPairSlicer, TickersContext, checkRateLimit } from './utils';
import NewsComponent from './NewsComponent';
import { LineChart, LineChartProvider } from 'react-native-wagmi-charts';

function capitalizeFLetter(name) {
    if (name) {
        return name[0].toUpperCase() +
            name.slice(1);
    }
    else {
        return 'Bitcoin';
    }
}

const TickerCard = ({ ticker, getLogoFilename, verboseNames }) => {
    const [candleData, setCandleData] = useState([]);
    const [transformedData, setTransformedData] = useState([]);
    const [chartColor, setChartColor] = useState('green'); // default to green

    useEffect(() => {
        const fetchCandleData = async () => {
            try {
                const candleEndpoint = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker[0]}/hist?limit=24`;
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
    console.log(transformedData);

    return (
        <View style={styles.card}>
            <View style={styles.topSection}>
                <Image
                    style={styles.logo}
                    source={{ uri: getLogoFilename(ticker[0]) }}
                />
                <Text style={styles.tokenName}>
                    {capitalizeFLetter(tradingPairSlicer(ticker[0], verboseNames)[2])}
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
                    Daily: ${parseFloat(ticker["7"] * ticker['8']).toFixed(2)} USD
                </Text>
                <Text style={styles.lastTradedPrice}>
                    ${parseFloat(ticker["7"]).toFixed(3)}
                </Text>
            </View>
        </View >
    );
};




const Frame = () => {
    const { tickers, getLogoFilename, verboseNames } = useContext(TickersContext);
    const topTickers = [...tickers].sort((a, b) => b.usdVolume - a.usdVolume).slice(0, 5);

    const [selectedSection, setSelectedSection] = useState('Watchlist');

    const renderContent = () => {
        switch (selectedSection) {
            case 'Favorites':
                return <Text>Content for Favs</Text>;
            case 'News':
                return <NewsComponent />;
            case 'Movers':
                return <Text>Content for Movers</Text>;
            case 'Rewards':
                return <Text>Content for Rewards</Text>;
            default:
                return <Text>Content for Watchlist</Text>;
        }
    };

    return (
        <View style={styles.view}>
            <View style={[styles.header, styles.headerPosition]}>
                <Image
                    name={[styles.icon, styles.iconLayout]}
                    contentFit="cover"
                    source={require("./assets/menuicon.png")}
                />
                <View style={[styles.image, styles.maskPosition]}>
                    <View style={[styles.mask, styles.maskPosition]} />
                </View>
            </View>
            <View style={styles.text}>
                <Text style={styles.totalBalance}>Total Balance</Text>
                <Text style={[styles.text1, styles.textFlexBox]}>$5560.89</Text>
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
                                verboseNames={verboseNames}
                            />
                        ))
                    ) : (
                        <Text>No Tickers Available</Text>
                    )}
                </View>
            </ScrollView>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                pagingEnabled={true}
                style={styles.scrollSections}
            >
                {['Favorites', 'News', 'Movers', 'Rewards'].map((section) => (
                    <TouchableOpacity
                        key={section}
                        style={styles.selections}
                        onPress={() => setSelectedSection(section)}
                    >
                        <Text style={styles.selectionsText}>{section}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* Conditional Rendering of News Component */}
            {/* Content Area */}
            <View style={styles.contentArea}>
                {/* Conditional Rendering of News Component */}
                {selectedSection === 'News' && (
                    <NewsComponent />
                )}
                {/* Other Content Rendering */}
                {selectedSection !== 'News' && renderContent()}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    view: {
        flex: 1, // Ensure this view takes the full available space
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centers children horizontally
        padding: 10,
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
        padding: 10,
        alignItems: 'flex-start', // Aligns children to the start
    },
    text1: {
        fontSize: 30,
        fontWeight: "500",
        textAlign: "left",
        color: Color.colorGray_200,
        fontFamily: FontFamily.sFProText,
        letterSpacing: 1,
    },
    textFlexBox: {
        textAlign: "left",
        left: "0%",
    },
    totalBalance: {
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
        width: 270, // Your preferred width
        height: 208, // Your preferred height
        margin: 8, // Space between cards
        backgroundColor: '#fff',
        borderRadius: 8, // Rounded corners
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20, // To make the logo rounded
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
        padding: 10, // Padding to ensure the graph does not touch the edges of the card
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
    scrollSections: {
        // flex: ,
    },
    selections: {
        width: 100, // Your preferred width
        height: 40, // Your preferred height
        margin: 8, // Space between cards
        backgroundColor: '#fff',
        borderRadius: 8, // Rounded corners
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    selectionsText: {
        fontFamily: FontFamily.Inter,
    },
    contentArea: {
        flex: 1, // Takes up remaining vertical space
    },
});

export default Frame;
