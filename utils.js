// utils.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export const TickersContext = createContext();

export function capitalizeFLetter(name) {
    if (name) {
        return name[0].toUpperCase() +
            name.slice(1);
    }
    else {
        return 'Bitcoin';
    }
}


export const getStyles = (theme) => theme;



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

// TickersContext.js
export const TickersProvider = ({ children }) => {
    const [tickers, setTickers] = useState([]);
    const [isLoading, setLoading] = useState(true);


    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const response = await fetch('http://192.168.68.109:5000/get-tickers'); // Replace with your endpoint
                const data = await response.json();

                if (Array.isArray(data)) {
                    const filteredTickers = data.filter(tickerData =>
                        !tickerData.ticker.startsWith('tTEST') &&
                        !tickerData.ticker.startsWith('f')
                    ).map(ticker => ({
                        ...ticker,
                        isFavorite: false,
                        usdVolume: parseFloat(ticker.tickerData.volume * ticker.tickerData.last_price).toFixed(2),
                        absPercMove: parseFloat(Math.abs(ticker.tickerData.daily_change_relative) * 100).toFixed(3)
                    }));
                    setTickers(filteredTickers);
                    setLoading(false);

                }
                else {
                    console.error('Invalid API response:', data);
                }
            } catch (error) {
                console.error('Error fetching tickers:', error);
                setLoading(false);
            }
        };

        fetchTickers();
    }, []);


    const getLogoFilename = (ticker) => {
        const base = ticker.baseCurrency.toLowerCase();
        const verboseName = ticker.verboseName.toLowerCase().replace(/\s+/g, '-');

        return `http://192.168.68.109:5000/backend/logos/${verboseName}-${base}-logo.png`;
    };

    return (
        <TickersContext.Provider value={{ tickers, isLoading, getLogoFilename }}>
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