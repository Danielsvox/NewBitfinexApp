import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { checkRateLimit } from './utils';
import TickerModal from './TickerModal'; // Adjust path if needed
import { fetchCoinGeckoData } from './coinGeckoUtils';

export default function App({ navigation }) {
  const [tickers, setTickers] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCoinGeckoData();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
        setLoading(false);  // You can also set an error state here if you wish to display an error message.
      }
    };

    fetchData();
  }, []);  // The empty dependency array ensures this effect runs once when the component mounts.


  useEffect(() => {
    loadFontAsync();
    fetchTickers();
  }, []);

  const loadFontAsync = async () => {
    await Font.loadAsync({
      Inter: require('./assets/fonts/Inter-Regular.ttf'),
    });
    setFontLoaded(true);
  };

  const fetchTickers = async () => {
    try {
      const response = await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=ALL');
      await checkRateLimit(response);
      const data = await response.json();
      if (Array.isArray(data)) {
        const usdTickers = data.filter(tickerData => tickerData[0].endsWith('USD'));
        setTickers(usdTickers);
      } else {
        console.error('Invalid API response:', data);
      }
    } catch (error) {
      console.error('Error fetching tickers:', error);
    }
  };

  const paginatedTickers = tickers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!fontLoaded) {
    return null;
  }
  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;  // Adjust this loading indicator as needed.
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tickers List</Text>
      <View></View>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Ticker </Text>
        <Text style={styles.headerText}>Last Price </Text>
        <Text style={styles.headerText}>24h Volume </Text>
      </View>

      <FlatList
        data={paginatedTickers}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTicker(item);
              setIsModalVisible(true);
            }}
          >
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item[0]}</Text>
              <Text style={styles.listItemText}>${parseFloat(item[7]).toFixed(2)}</Text>
              {/* Calculate volume in terms of USD by multiplying base volume with last traded price in USD */}
              <Text style={styles.listItemText}>${parseFloat(item[8] * item[7]).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />



      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={() => setPage(prevPage => Math.max(prevPage - 1, 1))} style={styles.pageButton}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumber}>{page}</Text>
        <TouchableOpacity onPress={() => setPage(prevPage => prevPage + 1)} style={styles.pageButton}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <TickerModal
        navigation={navigation}
        visible={isModalVisible}
        tickerData={selectedTicker}
        onClose={() => setIsModalVisible(false)}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  headerText: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: 'white',
    width: 120, // or whatever fixed width you think looks best for each column
    textAlign: 'center',
  },
  title: {
    marginTop: 100,
    fontFamily: 'Inter',
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  listItemText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: 'white',
    width: 120, // or whatever fixed width you think looks best for each column
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    height: 90,
  },
  pageButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: 'white',
  },
  pageNumber: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 5,
    marginHorizontal: 10,
    borderWidth: 0.5,
    borderColor: '#e5e5e5'
  },
});
