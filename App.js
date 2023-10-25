import * as React from 'react';
import { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions } from 'react-native';
import { TickersContext, capitalizeFLetter } from './utils';

import { Icon } from "react-native-elements";
import TickerDetailScreen from './TickerDetailScreen';



export default function App({ navigation }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState([]);
  const { tickers, getLogoFilename } = useContext(TickersContext);

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
  console.log(`PAGINATED TICKERS: ${paginatedTickers}`);
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
              getLogoFilename(item);
              navigation.navigate("TickerDetail", { ticker: item });
            }}
          >
            <View style={styles.listItem}>
              <Image
                source={{ uri: getLogoFilename(item) }}
                style={{ width: 30, height: 30 }}  // Adjust size as necessary
              />
              <Text style={styles.listItemText}>{item.ticker}</Text>
              <Text style={styles.listItemText}>${parseFloat(item.tickerData.last_price).toFixed(2)}</Text>
              {/* Calculate volume in terms of USD by multiplying base volume with last traded price in USD */}
              <Text style={[
                styles.listItemText,
                item.tickerData.daily_change_relative > 0 ? styles.positiveValue : styles.negativeValue
              ]}>
                {`${parseFloat(item.tickerData.daily_change_relative * 100).toFixed(2)}% ${item[6] > 0 ? '🔺' : '🔻'}`}
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
