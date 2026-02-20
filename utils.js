import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { BACKEND_URL } from './constants';

/** RFC-4122 v4 UUID — no external package needed */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

// ── User identity ─────────────────────────────────────────────────────────────

const USER_ID_KEY = 'bfx_user_id';

/**
 * Returns the persistent user UUID, creating and storing it on first call.
 * This UUID is the user's identity for the backend — API keys are stored there.
 */
export async function getUserId() {
    try {
        const stored = await AsyncStorage.getItem(USER_ID_KEY);
        if (stored) return stored;
        const id = generateUUID();
        await AsyncStorage.setItem(USER_ID_KEY, id);
        return id;
    } catch (e) {
        console.error('getUserId error:', e);
        return null;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function capitalizeFLetter(name) {
    if (name) return name[0].toUpperCase() + name.slice(1);
    return 'Bitcoin';
}

export const getStyles = (theme) => theme;

export const checkRateLimit = async (response) => {
    if (response.status === 429) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Rate Limit Hit',
                    body: "You've made too many requests. Please wait and try again.",
                },
                trigger: null,
            });
        } catch (e) {
            console.warn('Rate limit hit — notification unavailable in Expo Go:', e.message);
        }
        throw new Error('Rate Limit Hit');
    }
    return response;
};

// ── Context ───────────────────────────────────────────────────────────────────

export const TickersContext = createContext({
    tickers:      [],
    isLoading:    true,
    getLogoFilename: () => '',
    // auth / wallet
    userId:        null, 
    hasKeys:       false,
    walletData:    null,
    walletLoading: false,
    saveKeys:      async () => {},
    deleteKeys:    async () => {},
    refreshWallet: async () => {},
    placeOrder:    async () => {},
});

export const TickersProvider = ({ children }) => {
    const [tickers,   setTickers]   = useState([]);
    const [isLoading, setLoading]   = useState(true);

    // auth
    const [userId,   setUserId]   = useState(null);
    const [hasKeys,  setHasKeys]  = useState(false);

    // wallet
    const [walletData,    setWalletData]    = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);

    // ── Boot: load userId + check key status ────────────────────────────────
    useEffect(() => {
        const boot = async () => {
            const id = await getUserId();
            setUserId(id);
            if (id) {
                try {
                    const res  = await fetch(`${BACKEND_URL}/auth/status?user_id=${id}`);
                    const data = await res.json();
                    setHasKeys(!!data.connected);
                } catch (e) {
                    console.warn('Could not reach backend to check auth status:', e.message);
                }
            }
        };
        boot();
    }, []);

    // ── Tickers ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/get-tickers`);
                const data     = await response.json();

                if (Array.isArray(data)) {
                    const filtered = data
                        .filter(t => !t.ticker.startsWith('tTEST') && !t.ticker.startsWith('f'))
                        .map(t => ({
                            ...t,
                            isFavorite: false,
                            usdVolume:  parseFloat(t.tickerData.volume * t.tickerData.last_price).toFixed(2),
                            absPercMove: parseFloat(Math.abs(t.tickerData.daily_change_relative) * 100).toFixed(3),
                        }));
                    setTickers(filtered);
                } else {
                    console.error('Invalid API response:', data);
                }
            } catch (e) {
                console.error('Error fetching tickers:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchTickers();
    }, []);

    // ── Logo URL ─────────────────────────────────────────────────────────────
    const getLogoFilename = useCallback((ticker) => {
        const base        = ticker.baseCurrency.toLowerCase();
        const verboseName = ticker.verboseName.toLowerCase().replace(/\s+/g, '-');
        return `${BACKEND_URL}/backend/logos/${verboseName}-${base}-logo.png`;
    }, []);

    // ── Save API keys ────────────────────────────────────────────────────────
    const saveKeys = useCallback(async (apiKey, apiSecret) => {
        if (!userId) throw new Error('User ID not ready');
        const res = await fetch(`${BACKEND_URL}/auth/keys`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: userId, api_key: apiKey, api_secret: apiSecret }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save keys');
        setHasKeys(true);
        return data;
    }, [userId]);

    // ── Delete API keys ──────────────────────────────────────────────────────
    const deleteKeys = useCallback(async () => {
        if (!userId) return;
        const res = await fetch(`${BACKEND_URL}/auth/keys`, {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: userId }),
        });
        if (res.ok) {
            setHasKeys(false);
            setWalletData(null);
        }
    }, [userId]);

    // ── Fetch wallet balances ────────────────────────────────────────────────
    const refreshWallet = useCallback(async () => {
        if (!userId || !hasKeys) return;
        setWalletLoading(true);
        try {
            const res  = await fetch(`${BACKEND_URL}/wallet/balances?user_id=${userId}`);
            const data = await res.json();
            if (res.ok) setWalletData(data);
            else        console.error('Wallet fetch error:', data.error);
        } catch (e) {
            console.error('refreshWallet error:', e);
        } finally {
            setWalletLoading(false);
        }
    }, [userId, hasKeys]);

    // ── Place a market order ──────────────────────────────────────────────────
    const placeOrder = useCallback(async (symbol, side, amountUSD) => {
        if (!userId) throw new Error('User ID not ready');
        const res = await fetch(`${BACKEND_URL}/trade/order`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                user_id:    userId,
                symbol,
                side,
                amount_usd: amountUSD,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order failed');
        return data;
    }, [userId]);

    // Auto-load wallet once we know keys exist
    useEffect(() => {
        if (hasKeys) refreshWallet();
    }, [hasKeys]);

    return (
        <TickersContext.Provider value={{
            tickers, isLoading, getLogoFilename,
            userId, hasKeys,
            walletData, walletLoading,
            saveKeys, deleteKeys, refreshWallet,
            placeOrder,
        }}>
            {children}
        </TickersContext.Provider>
    );
};

export const useTickers = () => {
    const ctx = useContext(TickersContext);
    if (!ctx) throw new Error('useTickers must be used within a TickersProvider');
    return ctx;
};
