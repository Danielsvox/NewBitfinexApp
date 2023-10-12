// utils.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export const TickersContext = createContext();

export const checkRateLimit = async (response) => {
    if (response.status === 429) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rate Limit Hit",
                body: "You've made too many requests. Please wait and try again later.",
            },
            trigger: null,
        });
        throw new Error('Rate Limit Hit');
    }
    return response;
};

export function tradingPairSlicer(tickerString = '', verboseNames = []) {
    // Remove the 't' from the beginning

    const string = tickerString.slice(1);
    // Returns trading pair sliced as an array = ['BASE','QUOTE']
    if (string.length > 6) {
        const tradingPair = string.split(':');
        const verboseEntry = verboseNames.find(entry => entry[0] === tradingPair[0]);
        const verboseName = verboseEntry ? verboseEntry[1].toLowerCase().replace(/\s+/g, '-') : tradingPair[0]; // Fallback to `name` if verboseName not found
        tradingPair.push(verboseName);
        return tradingPair;
    } else {
        const tradingPair = [string.slice(0, 3), string.slice(3, 6)];
        const verboseEntry = verboseNames.find(entry => entry[0] === tradingPair[0]);
        const verboseName = verboseEntry ? verboseEntry[1].toLowerCase().replace(/\s+/g, '-') : tradingPair[0]; // Fallback to `name` if verboseName not found
        tradingPair.push(verboseName);
        return tradingPair;
    }
};

// TickersContext.js
export const TickersProvider = ({ children }) => {
    const [tickers, setTickers] = useState([]);
    const [verboseNames, setVerboseNames] = useState([]);
    const [isLoading, setLoading] = useState(true);

    // Move the fetching logic to the context
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const response = await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=ALL');
                await checkRateLimit(response);
                const data = await response.json();
                if (Array.isArray(data)) {
                    const usdTickers = data.filter(tickerData =>
                        tickerData[0].endsWith('USD') && !tickerData[0].startsWith('tTEST') && !tickerData[0].startsWith('f')
                    ).map(ticker => ({
                        ...ticker,
                        isFavorite: false,
                        usdVolume: parseFloat(ticker[7] * ticker[8]).toFixed(2)
                    }));
                    setTickers(usdTickers);
                    setLoading(false);
                } else {
                    console.error('Invalid API response:', data);
                }
            } catch (error) {
                console.error('Error fetching tickers:', error);
                setLoading(false);
            }
        };

        const fetchVerboseMap = async () => {
            try {
                const response = await fetch('https://api-pub.bitfinex.com/v2/conf/pub:map:currency:label');
                await checkRateLimit(response);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setVerboseNames(data[0]);
                } else {
                    console.error('Invalid API response:', data);
                }
            } catch (error) {
                console.error('Error fetching verbose map:', error);
            }
        };

        fetchTickers();
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


    return (
        <TickersContext.Provider value={{ tickers, isLoading, verboseNames, getLogoFilename }}>
            {children}
        </TickersContext.Provider>
    );
};

export const useTickers = () => {
    const context = useContext(TickersContext);
    if (context === undefined) {
        throw new Error('useTickers must be used within a TickersProvider');
    }
    return context;
};