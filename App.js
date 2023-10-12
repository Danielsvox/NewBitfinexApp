import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions } from 'react-native';
import { checkRateLimit, tradingPairSlicer } from './utils';
import TickerModal from './TickerModal'; // Adjust path if needed
import { Icon } from "react-native-elements";
import { useTickers } from './utils';


export default function App({ navigation }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState([]);
  const [verboseNames, setVerboseNames] = useState([]);
  const { tickers, isLoading } = useTickers();
  console.log(tickers);

  useEffect(() => {
    const fetchVerboseMap = async () => {
      try {
        const response = await fetch('https://api-pub.bitfinex.com/v2/conf/pub:map:currency:label');
        await checkRateLimit(response);
        const data = await response.json();
        if (Array.isArray(data)) {
          const verboseData = data[0];
          setVerboseNames(verboseData);
        } else {
          console.error('Invalid API response:', data);
        }
      } catch (error) {
        console.error('Error fetching tickers:', error);
      }
    };

    fetchVerboseMap();
  }, []);



  const getLogoFilename = (ticker) => {
    const base = tradingPairSlicer(ticker, verboseNames)[0];
    const name = base.toLowerCase(); // Convert to lowercase for filename matching
    // Find verbose name using base
    const verboseEntry = verboseNames.find(entry => entry[0] === base);
    const verboseName = verboseEntry ? verboseEntry[1].toLowerCase().replace(/\s+/g, '-') : name; // Fallback to `name` if verboseName not found

    // Assuming logo names follow a pattern like: bitcoin-btc-logo.svg
    return `http://192.168.68.109:5000/backend/logos/${verboseName.toLowerCase()}-${base.toLowerCase()}-logo.png`;
  };

  const handleModalClose = async () => {
    setIsModalVisible(false);

    // Make API call to delete temporary images
    try {
      const response = await fetch('http://192.168.68.109:5000/delete-temp-images', {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // "Temporary images deleted successfully."
      } else {
        console.error("Error deleting temporary images.");
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  const paginatedTickers = tickers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const maxPages = Math.ceil(tickers.length / itemsPerPage);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Tokens</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={styles.headerText}>Last Price </Text>
        <Text style={styles.headerText}>24h</Text>
      </View>

      <FlatList
        data={paginatedTickers}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTicker(item);
              getLogoFilename(item[0]);
              setIsModalVisible(true);
            }}
          >
            <View style={styles.listItem}>
              <Image
                source={{ uri: getLogoFilename(item[0]) }}
                style={{ width: 30, height: 30 }}  // Adjust size as necessary
              />
              <Text style={styles.listItemText}>{tradingPairSlicer(item[0])[0]}</Text>
              <Text style={styles.listItemText}>${parseFloat(item[7]).toFixed(2)}</Text>
              {/* Calculate volume in terms of USD by multiplying base volume with last traded price in USD */}
              <Text style={[
                styles.listItemText,
                item[6] > 0 ? styles.positiveValue : styles.negativeValue
              ]}>
                {`${parseFloat(item[6] * 100).toFixed(2)}% ${item[6] > 0 ? '🔺' : '🔻'}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <View style={styles.paginationContainer}>
        {page > 1 ? (
          <TouchableOpacity
            onPress={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
            style={styles.pageButton}>
            <Icon name="arrow-back-ios" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.pageButtonPlaceholder} />
        )}


        <Text style={styles.pageNumber}>Page {page}</Text>
        {page < maxPages ? (
          <TouchableOpacity
            onPress={() => setPage(prevPage => Math.min(prevPage + 1, maxPages))}
            style={styles.pageButton}>
            <Icon name="arrow-forward-ios" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.pageButtonPlaceholder} />
        )}
      </View>

      <TickerModal
        navigation={navigation}
        visible={isModalVisible}
        tickerData={selectedTicker}
        verboseData={verboseNames}
        onClose={handleModalClose}
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
    width: Dimensions.get("window").width - 280, // or whatever fixed width you think looks best for each column
    textAlign: 'left',
    marginLeft: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    height: 90,
  },
  pageButton: {
    width: 50,  // Example width
    height: 50, // Example height
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: '#e5e5e5'
  },
  swipeBackView: {
    alignItems: 'flex-end',
    backgroundColor: '#FFA500',  // Use any desired color
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15
  },
  favoriteButton: {
    backgroundColor: '#FF4500',  // Use any desired color
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  favoriteButtonText: {
    color: 'white',
    fontFamily: 'Inter'
  },
  positiveValue: {
    color: 'green',
  },
  negativeValue: {
    color: 'red',
  },
  pageButtonPlaceholder: {
    width: 50,  // Should be the same as pageButton width
    height: 50, // Should be the same as pageButton height
    // ... other necessary styles to mimic the button's space
  },

});
