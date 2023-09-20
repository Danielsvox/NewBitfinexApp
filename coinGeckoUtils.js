import AsyncStorage from '@react-native-async-storage/async-storage';

const COINGECKO_DB_KEY = 'CoinGeckoDB';

export const fetchCoinGeckoData = async () => {
    const storedData = await AsyncStorage.getItem(COINGECKO_DB_KEY);

    if (storedData) {
        return JSON.parse(storedData);
    }

    const response = await fetch("https://api.coingecko.com/api/v3/coins/list?include_platform=false");
    if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(COINGECKO_DB_KEY, JSON.stringify(data));
        return data;
    } else {
        console.error("Failed to fetch data from CoinGecko");
        return null;
    }
};

const getTokenIdFromSymbol = async (symbol) => {
    const data = await fetchCoinGeckoData();
    if (data) {
        const token = data.find(token => token.symbol === symbol);
        if (token) {
            return token.id;
        }
    }
    return null;
};
