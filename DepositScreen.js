import React, { useState, useContext, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ScrollView, ActivityIndicator, Clipboard, Alert, Image as RNImage,
} from 'react-native';
import { Image } from 'expo-image';

import ThemeContext from './themes/ThemeContext';
import { TickersContext } from './utils';
import { BACKEND_URL } from './constants';

// Popular currencies to present in the picker grid
const POPULAR_CURRENCIES = [
    { code: 'BTC',  label: 'Bitcoin',    emoji: '₿' },
    { code: 'ETH',  label: 'Ethereum',   emoji: 'Ξ' },
    { code: 'UST',  label: 'Tether',     emoji: '₮' },
    { code: 'SOL',  label: 'Solana',     emoji: '◎' },
    { code: 'XRP',  label: 'Ripple',     emoji: '✕' },
    { code: 'ADA',  label: 'Cardano',    emoji: '₳' },
    { code: 'LTC',  label: 'Litecoin',   emoji: 'Ł' },
    { code: 'DOGE', label: 'Dogecoin',   emoji: 'Ð' },
    { code: 'DOT',  label: 'Polkadot',   emoji: '●' },
    { code: 'AVAX', label: 'Avalanche',  emoji: '△' },
    { code: 'NEAR', label: 'NEAR',       emoji: 'Ⓝ' },
    { code: 'TRX',  label: 'TRON',       emoji: 'T' },
    { code: 'LINK', label: 'Chainlink',  emoji: '⬡' },
    { code: 'XLM',  label: 'Stellar',    emoji: '*' },
    { code: 'TON',  label: 'TON',        emoji: '💎' },
    { code: 'ARB',  label: 'Arbitrum',   emoji: 'Ⓐ' },
];

const WALLET_TYPES = [
    { key: 'exchange', label: 'Spot / Exchange' },
    { key: 'margin',   label: 'Margin' },
    { key: 'funding',  label: 'Funding' },
];

const PHASE_PICK_CURRENCY = 'pick_currency';
const PHASE_PICK_METHOD   = 'pick_method';
const PHASE_SHOW_ADDRESS  = 'show_address';
const PHASE_LOADING       = 'loading';

const DepositScreen = ({ navigation }) => {
    const { theme }                    = useContext(ThemeContext);
    const { userId, hasKeys }          = useContext(TickersContext);
    const C                            = theme._colors;

    const [phase,          setPhase]          = useState(PHASE_PICK_CURRENCY);
    const [selectedCoin,   setSelectedCoin]   = useState(null);
    const [selectedWallet, setSelectedWallet] = useState('exchange');
    const [methods,        setMethods]        = useState([]);
    const [addressInfo,    setAddressInfo]    = useState(null);
    const [error,          setError]          = useState('');

    // ── Step 1: user picks a currency ────────────────────────────────────────
    const handleCurrencySelect = useCallback(async (coin) => {
        setSelectedCoin(coin);
        setError('');
        setPhase(PHASE_LOADING);
        try {
            const res  = await fetch(`${BACKEND_URL}/deposit/methods?currency=${coin.code}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not load deposit methods');
            if (data.methods.length === 1) {
                // Only one method — skip the picker and go straight to address
                await fetchAddress(coin.code, data.methods[0].method);
            } else {
                setMethods(data.methods);
                setPhase(PHASE_PICK_METHOD);
            }
        } catch (e) {
            setError(e.message);
            setPhase(PHASE_PICK_CURRENCY);
        }
    }, [selectedWallet]);

    // ── Step 2 (optional): user picks a network/method ───────────────────────
    const fetchAddress = useCallback(async (currency, method) => {
        setPhase(PHASE_LOADING);
        setError('');
        try {
            const url = `${BACKEND_URL}/deposit/address?user_id=${userId}&currency=${currency}&method=${method}&wallet=${selectedWallet}`;
            const res  = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not fetch deposit address');
            setAddressInfo(data);
            setPhase(PHASE_SHOW_ADDRESS);
        } catch (e) {
            setError(e.message);
            setPhase(selectedCoin ? PHASE_PICK_METHOD : PHASE_PICK_CURRENCY);
        }
    }, [userId, selectedWallet, selectedCoin]);

    const copyToClipboard = (text, label = 'Address') => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard.`);
    };

    // ── Shared header ─────────────────────────────────────────────────────────
    const renderHeader = () => (
        <View style={[s.header, { borderBottomColor: C.separator }]}>
            <TouchableOpacity style={s.backBtn} onPress={() => {
                if (phase === PHASE_PICK_CURRENCY || phase === PHASE_LOADING)
                    navigation.goBack();
                else if (phase === PHASE_PICK_METHOD)
                    setPhase(PHASE_PICK_CURRENCY);
                else
                    setPhase(PHASE_PICK_METHOD);
            }} activeOpacity={0.7}>
                <Text style={[s.backArrow, { color: C.accent }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[s.headerTitle, { color: C.textPrimary }]}>Deposit Crypto</Text>
        </View>
    );

    // ── Not connected guard ───────────────────────────────────────────────────
    if (!hasKeys) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <View style={s.centered}>
                    <Text style={{ fontSize: 44, marginBottom: 12 }}>🔑</Text>
                    <Text style={[s.bigText, { color: C.textPrimary }]}>Connect your account</Text>
                    <Text style={[s.subText, { color: C.textSecondary }]}>
                        Add your Bitfinex API keys in the Account tab to use deposit addresses.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (phase === PHASE_LOADING) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <View style={s.centered}>
                    <ActivityIndicator size="large" color={C.accent} />
                    <Text style={[s.loadingText, { color: C.textSecondary }]}>
                        {addressInfo ? 'Refreshing address…' : 'Fetching deposit info…'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Phase 1: pick currency ────────────────────────────────────────────────
    if (phase === PHASE_PICK_CURRENCY) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <Text style={[s.sectionLabel, { color: C.textSecondary }]}>SELECT ASSET</Text>

                    {/* Wallet type selector */}
                    <View style={[s.walletRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                        {WALLET_TYPES.map(w => (
                            <TouchableOpacity
                                key={w.key}
                                style={[
                                    s.walletBtn,
                                    { backgroundColor: selectedWallet === w.key ? C.accentBg : 'transparent',
                                      borderColor:      selectedWallet === w.key ? C.accent : 'transparent' },
                                ]}
                                onPress={() => setSelectedWallet(w.key)}
                                activeOpacity={0.75}
                            >
                                <Text style={[s.walletBtnText, { color: selectedWallet === w.key ? C.accent : C.textSecondary }]}>
                                    {w.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {error ? (
                        <View style={[s.errorBox, { backgroundColor: C.negativeBg, borderColor: C.negative }]}>
                            <Text style={[s.errorText, { color: C.negative }]}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Currency grid */}
                    <View style={s.grid}>
                        {POPULAR_CURRENCIES.map(coin => (
                            <TouchableOpacity
                                key={coin.code}
                                style={[s.coinCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}
                                onPress={() => handleCurrencySelect(coin)}
                                activeOpacity={0.75}
                            >
                                <Text style={s.coinEmoji}>{coin.emoji}</Text>
                                <Text style={[s.coinCode,  { color: C.textPrimary }]}>{coin.code}</Text>
                                <Text style={[s.coinLabel, { color: C.textSecondary }]}>{coin.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── Phase 2: pick network/method ──────────────────────────────────────────
    if (phase === PHASE_PICK_METHOD) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <Text style={[s.sectionLabel, { color: C.textSecondary }]}>
                        SELECT NETWORK FOR {selectedCoin?.code}
                    </Text>

                    {error ? (
                        <View style={[s.errorBox, { backgroundColor: C.negativeBg, borderColor: C.negative }]}>
                            <Text style={[s.errorText, { color: C.negative }]}>{error}</Text>
                        </View>
                    ) : null}

                    {methods.map(m => (
                        <TouchableOpacity
                            key={m.method}
                            style={[s.methodRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}
                            onPress={() => fetchAddress(selectedCoin.code, m.method)}
                            activeOpacity={0.75}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[s.methodLabel, { color: C.textPrimary }]}>{m.label}</Text>
                                {m.network ? (
                                    <Text style={[s.methodNetwork, { color: C.accent }]}>{m.network}</Text>
                                ) : null}
                                {m.has_memo ? (
                                    <Text style={[s.methodMemo, { color: C.textMuted }]}>Requires tag / memo</Text>
                                ) : null}
                            </View>
                            <Text style={[s.chevron, { color: C.textMuted }]}>›</Text>
                        </TouchableOpacity>
                    ))}

                    <Text style={[s.networkNote, { color: C.textMuted }]}>
                        ⚠ Always send only the selected asset on the selected network. Sending the wrong asset or using the wrong network will result in a permanent loss of funds.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── Phase 3: show deposit address ─────────────────────────────────────────
    if (phase === PHASE_SHOW_ADDRESS && addressInfo) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(addressInfo.address)}`;

        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    {/* Network badge */}
                    <View style={s.networkBadgeRow}>
                        <View style={[s.networkBadge, { backgroundColor: C.accentBg, borderColor: C.accent }]}>
                            <Text style={[s.networkBadgeText, { color: C.accent }]}>
                                {addressInfo.network || addressInfo.method}
                            </Text>
                        </View>
                        <Text style={[s.networkBadgeSub, { color: C.textSecondary }]}>
                            {addressInfo.label} · {WALLET_TYPES.find(w => w.key === selectedWallet)?.label}
                        </Text>
                    </View>

                    {/* QR code */}
                    <View style={[s.qrContainer, { backgroundColor: '#fff', borderColor: C.accent }]}>
                        <RNImage
                            source={{ uri: qrUrl }}
                            style={s.qrImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Address */}
                    <View style={[s.addrCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                        <Text style={[s.addrLabel, { color: C.textSecondary }]}>DEPOSIT ADDRESS</Text>
                        <Text style={[s.addrText, { color: C.textPrimary }]} selectable>
                            {addressInfo.address}
                        </Text>
                        <TouchableOpacity
                            style={[s.copyBtn, { backgroundColor: C.accent }]}
                            onPress={() => copyToClipboard(addressInfo.address, 'Address')}
                            activeOpacity={0.8}
                        >
                            <Text style={[s.copyBtnText, { color: '#000' }]}>Copy Address</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Memo / Tag (XRP, XLM, EOS, TON…) */}
                    {addressInfo.has_memo && addressInfo.pool_address ? (
                        <View style={[s.addrCard, { backgroundColor: C.card, borderColor: C.negative, marginTop: 12 }]}>
                            <Text style={[s.addrLabel, { color: C.negative }]}>⚠ MEMO / TAG REQUIRED</Text>
                            <Text style={[s.addrText, { color: C.textPrimary }]} selectable>
                                {addressInfo.pool_address}
                            </Text>
                            <Text style={[s.memoWarning, { color: C.textSecondary }]}>
                                You MUST include this memo/tag when sending. Omitting it will result in a permanent loss of funds.
                            </Text>
                            <TouchableOpacity
                                style={[s.copyBtn, { backgroundColor: C.negative }]}
                                onPress={() => copyToClipboard(addressInfo.pool_address, 'Memo / Tag')}
                                activeOpacity={0.8}
                            >
                                <Text style={s.copyBtnText}>Copy Memo / Tag</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* Generate new address */}
                    <TouchableOpacity
                        style={[s.refreshBtn, { borderColor: C.cardBorder }]}
                        onPress={() => fetchAddress(selectedCoin.code, addressInfo.method, true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[s.refreshText, { color: C.textSecondary }]}>Generate New Address</Text>
                    </TouchableOpacity>

                    {/* Disclaimer */}
                    <View style={[s.disclaimer, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                        <Text style={[s.disclaimerText, { color: C.textMuted }]}>
                            Only send <Text style={{ fontWeight: '700', color: C.textSecondary }}>{addressInfo.currency}</Text> on
                            the <Text style={{ fontWeight: '700', color: C.textSecondary }}>{addressInfo.network}</Text> network
                            to this address. Sending any other asset or using a different network will result in a permanent loss. Bitfinex may require network confirmations before crediting your account.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return null;
};

const s = StyleSheet.create({
    root:   { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn:    { padding: 4, marginRight: 8 },
    backArrow:  { fontSize: 32, lineHeight: 32, marginTop: -4 },
    headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Inter' },

    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    bigText:     { fontSize: 20, fontWeight: '700', fontFamily: 'Inter', textAlign: 'center', marginBottom: 8 },
    subText:     { fontSize: 14, fontFamily: 'Inter', textAlign: 'center', lineHeight: 22 },
    loadingText: { marginTop: 16, fontSize: 14, fontFamily: 'Inter' },

    sectionLabel: {
        fontSize: 11,
        fontFamily: 'Inter',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },

    // Wallet type row
    walletRow: {
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 20,
        padding: 3,
        gap: 3,
    },
    walletBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    walletBtnText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter' },

    // Currency grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    coinCard: {
        width: '30%',
        aspectRatio: 0.85,
        borderRadius: 8,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    coinEmoji: { fontSize: 20, marginBottom: 5 },
    coinCode:  { fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },
    coinLabel: { fontSize: 10, fontFamily: 'Inter', marginTop: 2, textAlign: 'center' },

    // Method list — row-based with separator style
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    methodLabel:   { fontSize: 15, fontWeight: '600', fontFamily: 'Inter' },
    methodNetwork: { fontSize: 12, fontFamily: 'Inter', marginTop: 3 },
    methodMemo:    { fontSize: 11, fontFamily: 'Inter', marginTop: 3 },
    chevron:       { fontSize: 22, marginLeft: 8 },
    networkNote: {
        fontSize: 12,
        fontFamily: 'Inter',
        lineHeight: 18,
        marginTop: 16,
        textAlign: 'center',
    },

    // Address phase
    networkBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
        flexWrap: 'wrap',
    },
    networkBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    networkBadgeText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter', letterSpacing: 0.5 },
    networkBadgeSub:  { fontSize: 13, fontFamily: 'Inter' },

    qrContainer: {
        alignSelf: 'center',
        borderRadius: 12,
        borderWidth: 2,
        padding: 14,
        marginBottom: 16,
        backgroundColor: '#ffffff',
    },
    qrImage: { width: 200, height: 200 },

    addrCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 14,
    },
    addrLabel: {
        fontSize: 10,
        fontFamily: 'Inter',
        letterSpacing: 1.2,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    addrText: {
        // Monospace-style via letterSpacing on address
        fontSize: 12,
        fontFamily: 'Inter',
        lineHeight: 20,
        letterSpacing: 0.8,
        marginBottom: 12,
        fontVariant: ['tabular-nums'],
    },
    copyBtn: {
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
    },
    copyBtnText: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'Inter',
        letterSpacing: 0.5,
    },
    memoWarning: {
        fontSize: 12,
        fontFamily: 'Inter',
        lineHeight: 18,
        marginBottom: 10,
    },

    refreshBtn: {
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 13,
        alignItems: 'center',
    },
    refreshText: { fontSize: 13, fontFamily: 'Inter', fontWeight: '600' },

    disclaimer: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        marginTop: 12,
    },
    disclaimerText: { fontSize: 12, fontFamily: 'Inter', lineHeight: 18 },

    errorBox: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        marginBottom: 14,
    },
    errorText: { fontSize: 13, fontFamily: 'Inter', lineHeight: 19 },
});

export default DepositScreen;
