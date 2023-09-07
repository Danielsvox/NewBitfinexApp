import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import * as Font from 'expo-font';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from 'expo-notifications';

export default function App() {
  const [tickers, setTickers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTicker, setSelectedTicker] = useState('BTCUSD');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    loadFontAsync(); // Load the font when the component mounts
    fetchTickers();
  }, []);

  const checkRateLimit = async (response) => {
    if (response.status === 429) {
      // You can check response headers here for more information
      // E.g., const limitReset = response.headers.get('X-RateLimit-Reset');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rate Limit Hit",
          body: "You've made too many requests. Please wait and try again later.",
          // You can add more properties as needed
        },
        trigger: null, // Send the notification immediately
      });
    }
  };

  const loadFontAsync = async () => {
    await Font.loadAsync({
      Inter: require('./assets/fonts/Inter-Regular.ttf'), // Update with the actual font file path
    });
    setFontLoaded(true);
  };

  const sliceTradingPairs = (pairString) => {
    if (pairString.length > 6) {
      return pairString.split(':');
    } else {
      const p = 3;
      return Array.from({ length: pairString.length / p }, (_, i) =>
        pairString.slice(i * p, (i + 1) * p)
      );
    }
  };

  const fetchTickers = async () => {
    try {
      const response = await fetch('https://api-pub.bitfinex.com/v2/conf/pub:info:pair');
      await checkRateLimit(response);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Assuming the ticker symbols are in the first sub-array
        const tickerSymbols = data[0].map(pairData => pairData[0]);
        const filteredPairs = [];
        tickerSymbols.forEach(Pair => {
          slicedPair = sliceTradingPairs(Pair)
          if (slicedPair[1] !== 'USD') {
            return;
          }
          else {
            filteredPairs.push(Pair);
          }
        });
        console.log(filteredPairs);
        setTickers(filteredPairs);
      } else {
        console.error('Invalid API response:', data);
      }
    } catch (error) {
      console.error('Error fetching tickers:', error);
    }
  };

  const fetchPrice = async () => {
    try {
      const end = Math.floor(date.getTime());
      const response = await fetch(`https://api-pub.bitfinex.com/v2/trades/t${selectedTicker}/hist?end=${end}&limit=1`, {
        headers: {
          'accept': 'application/json',
        },
      });
      await checkRateLimit(response);
      const data = await response.json();
      const lastTrade = data[data.length - 1];
      const lastPrice = lastTrade[3];
      setPrice(lastPrice);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  if (!fontLoaded) {
    return null; // Return null while the font is loading
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitfinex Testing</Text>
      <Text style={styles.priceText}>
        Selected Date: {date.toLocaleDateString()}
      </Text>
      <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.pickerButton}>
        <Text>{selectedTicker}</Text>
      </TouchableOpacity>

      <Modal isVisible={isPickerVisible} onBackdropPress={() => setPickerVisible(false)}>
        <View style={styles.modalContent}>
          <ScrollView>
            {tickers.map((tradingPair, index) => (
              <TouchableOpacity key={index} onPress={() => {
                setSelectedTicker(tradingPair);
                setPickerVisible(false);
              }}>
                <Text style={styles.modalItem}>{tradingPair}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {showPicker && (
        <DateTimePicker
          mode='date'
          display='spinner'  // You can choose other displays like 'spinner'
          value={date}
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowPicker(false);
            setDate(currentDate);
          }}
        />
      )}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.button}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={fetchPrice} style={styles.button}>
        <Text style={styles.buttonText}>Fetch Price</Text>
      </TouchableOpacity>
      <Text style={styles.priceText}>
        Price on Selected Date: ${price}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#152330',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 30,
    color: 'white',
    marginBottom: 20,
  },
  priceText: {
    fontFamily: 'Inter',
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 10,     // Space between text and top/bottom border
    paddingHorizontal: 20,  // Space between text and left/right border
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 20,
    color: 'white',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    maxHeight: 300,  // Set to whatever portion of the screen you want
    borderRadius: 10,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  pickerButton: {
    fontFamily: 'Inter',
    fontSize: 26,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    marginBottom: 20,
    paddingVertical: 10,     // Space between text and top/bottom border
    paddingHorizontal: 20,
  },
});