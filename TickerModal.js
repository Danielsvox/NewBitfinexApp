import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { checkRateLimit } from './utils';
import { LineChart } from 'react-native-chart-kit';
import * as Font from 'expo-font';


const TickerModal = ({ visible, tickerData, onClose, navigation }) => {
    const [candleData, setCandleData] = useState([]);
    const [transformedData, setTransformedData] = useState(null);
    const [fontLoaded, setFontLoaded] = useState(false);
    const [candlestickImage, setCandlestickImage] = useState(null);


    console.log("TickerModal rendered with visible:", visible, "and tickerData:", tickerData);

    useEffect(() => {
        loadFontAsync();
    }, []);

    const loadFontAsync = async () => {
        await Font.loadAsync({
            Inter: require('./assets/fonts/Inter-Regular.ttf'),
        });
        setFontLoaded(true);
    };
    useEffect(() => {
        console.log('Modal visibility:', visible);
        if (visible && tickerData[0]) {
            const candleEndpoint = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${tickerData[0]}/hist?limit=100`;
            fetch(candleEndpoint)
                .then(checkRateLimit)
                .then(response => response.json())
                .then(data => {
                    console.log("Candle Data:", data);
                    setCandleData(data);
                    // Sending the data to your backend to generate the image:
                    fetch('http://192.168.68.109:5000/generate-candlestick', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            data: data,
                            ticker: tickerData[0]
                        })
                    })
                        .then(response => response.json())
                        .then(json => {
                            const imageUrl = `http://192.168.68.109:5000${json.image_url}`;
                            console.log(imageUrl)
                            setCandlestickImage(imageUrl);
                        })
                        .catch(error => console.error("Error fetching image:", error));
                })

                .catch(error => console.error("Error fetching candle data:", error));
        }
    }, [visible, tickerData]);

    const transformDataForLineChart = (candleData) => {
        if (!candleData || candleData.length === 0) return null;
        const timestamps = candleData.map(candle => new Date(candle[0]).toISOString().slice(0, 10));
        const closingPrices = candleData.map(candle => candle[2]);
        return {
            labels: timestamps,
            datasets: [{
                data: closingPrices
            }]
        };
    };

    useEffect(() => {
        // Call the transform function only when candleData changes.
        const transformedData = transformDataForLineChart(candleData);
        if (transformedData) {
            setTransformedData(transformedData);
        }
    }, [candleData]);
    if (!fontLoaded) {
        return null;
    }


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Ticker Details</Text>
                    {/* Display ticker details here. Adjust according to your data structure. */}
                    <Text style={styles.modalTitle}>Ticker: {tickerData[0]}</Text>
                    {
                        candlestickImage ?
                            <Image source={{ uri: candlestickImage }
                            } style={{ width: Dimensions.get("window").width - 10, height: 250 }} />
                            :
                            <Text>Loading Candlestick Chart...</Text>
                    }
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            navigation.navigate("TickerDetail", { tickerData: tickerData });
                            onClose();  // close the modal after navigating, if needed
                        }}
                    >
                        <Text style={styles.buttonText}>More details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        fontFamily: 'Inter',
        color: 'white',
        backgroundColor: '#3E92CC',
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontFamily: 'Inter',
        color: 'white',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },

    CloseButton: {

    },
    buttonText: {
        marginTop: 20,
        color: 'white',
        textAlign: 'center',
        padding: 10,
        borderWidth: 0.5,
        borderRadius: 10,
        backgroundColor: '#4CAF50'
    }
});

export default TickerModal;
