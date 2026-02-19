import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView,
    Platform, Animated,
} from 'react-native';
import { Image } from 'expo-image';

import ThemeContext from './themes/ThemeContext';
import { TickersContext, capitalizeFLetter } from './utils';

const fmt = (n, dec = 2) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtCoin = (n) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const PHASE_INPUT   = 'input';
const PHASE_LOADING = 'loading';
const PHASE_SUCCESS = 'success';
const PHASE_ERROR   = 'error';

const TradeScreen = ({ route, navigation }) => {
    const { ticker, side } = route.params;
    const { theme }        = useContext(ThemeContext);
    const { userId, hasKeys, getLogoFilename } = useContext(TickersContext);
    const C = theme._colors;

    const isBuy       = side === 'buy';
    const accentColor = isBuy ? C.positive : C.negative;
    const accentBg    = isBuy ? C.positiveBg : C.negativeBg;

    const base            = ticker.baseCurrency;
    const availableQuotes = ticker.availableQuotes ?? ['USD'];

    const [quoteCurrency, setQuoteCurrency] = useState(
        availableQuotes.includes('USD') ? 'USD' : 'USDT'
    );
    const [displayPrice, setDisplayPrice] = useState(parseFloat(ticker.tickerData.last_price));
    const pair = `${base}/${quoteCurrency}`;

    const [amountUSD, setAmountUSD]   = useState('');
    const [phase, setPhase]           = useState(PHASE_INPUT);
    const [orderResult, setResult]    = useState(null);
    const [errorMsg, setErrorMsg]     = useState('');
    const [inputFocused, setFocused]  = useState(false);

    useEffect(() => {
        const { BACKEND_URL } = require('./constants');
        fetch(`${BACKEND_URL}/trade/price?symbol=${base}&quote_currency=${quoteCurrency}`)
            .then(r => r.json())
            .then(d => { if (d.price) setDisplayPrice(d.price); })
            .catch(() => {});
    }, [quoteCurrency]);

    const price      = displayPrice;
    const parsedUSD  = parseFloat(amountUSD) || 0;
    const coinAmount = parsedUSD > 0 && price > 0 ? parsedUSD / price : 0;

    const successOpacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (phase === PHASE_SUCCESS) {
            Animated.timing(successOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
        }
    }, [phase]);

    const handleSubmit = async () => {
        if (!hasKeys) {
            setErrorMsg('Connect your Bitfinex account first (Account tab).');
            setPhase(PHASE_ERROR);
            return;
        }
        if (parsedUSD <= 0) return;
        setPhase(PHASE_LOADING);
        try {
            const { BACKEND_URL } = require('./constants');
            const res  = await fetch(`${BACKEND_URL}/trade/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId, symbol: base, side,
                    amount_usd: parsedUSD, quote_currency: quoteCurrency,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || 'Order submission failed.');
                setPhase(PHASE_ERROR);
            } else {
                setResult(data);
                setPhase(PHASE_SUCCESS);
            }
        } catch {
            setErrorMsg('Network error — could not reach the server.');
            setPhase(PHASE_ERROR);
        }
    };

    const renderHeader = () => (
        <View style={[s.header, { borderBottomColor: C.separator, backgroundColor: C.card }]}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={[s.backArrow, { color: C.accent }]}>‹</Text>
            </TouchableOpacity>
            <Image style={s.logo} source={{ uri: getLogoFilename(ticker) }} contentFit="contain" />
            <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: C.textPrimary }}>
                    {ticker.baseCurrency}/USD
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter', color: C.textSecondary }}>
                    {capitalizeFLetter(ticker.verboseName)}
                </Text>
            </View>
            <View style={[s.sideBadge, { backgroundColor: accentBg }]}>
                <Text style={[s.sideText, { color: accentColor }]}>{side.toUpperCase()}</Text>
            </View>
        </View>
    );

    // ── INPUT PHASE ───────────────────────────────────────────────────────────
    if (phase === PHASE_INPUT) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        {renderHeader()}

                        {/* Market price strip */}
                        <View style={[s.priceStrip, { backgroundColor: C.surface, borderBottomColor: C.separator }]}>
                            <View>
                                <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                                    Market Price
                                </Text>
                                <Text style={{ fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: C.textPrimary, fontVariant: ['tabular-nums'], marginTop: 2 }}>
                                    ${fmt(price, 4)}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                                    Order Type
                                </Text>
                                <View style={[s.orderTypeBadge, { backgroundColor: C.accentBg }]}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', fontFamily: 'Inter', color: C.accent }}>
                                        MARKET
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Quote currency selector */}
                        {availableQuotes.length > 1 && (
                            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                                <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
                                    Quote Currency
                                </Text>
                                <View style={s.quoteBtns}>
                                    {availableQuotes.map(q => {
                                        const active = q === quoteCurrency;
                                        return (
                                            <TouchableOpacity
                                                key={q}
                                                style={[s.quoteBtn, {
                                                    backgroundColor: active ? accentColor : C.card,
                                                    borderColor: active ? accentColor : C.cardBorder,
                                                }]}
                                                onPress={() => setQuoteCurrency(q)}
                                                activeOpacity={0.75}
                                            >
                                                <Text style={[s.quoteBtnText, { color: active ? '#fff' : C.textSecondary }]}>
                                                    {q}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Amount input — terminal style */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                            <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
                                {isBuy ? `Amount to Spend (${quoteCurrency})` : `Amount to Sell in ${quoteCurrency}`}
                            </Text>
                            <View style={[s.inputBox, {
                                backgroundColor: C.inputBg,
                                borderColor: inputFocused ? C.accent : C.inputBorder,
                            }]}>
                                <Text style={{ fontSize: 22, color: C.textMuted, fontFamily: 'Inter', marginRight: 4 }}>$</Text>
                                <TextInput
                                    style={[s.input, { color: C.textPrimary }]}
                                    placeholder="0.00"
                                    placeholderTextColor={C.textMuted}
                                    keyboardType="decimal-pad"
                                    value={amountUSD}
                                    onChangeText={setAmountUSD}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    returnKeyType="done"
                                    autoFocus
                                />
                                <Text style={{ fontSize: 14, color: C.textSecondary, fontFamily: 'Inter' }}>{quoteCurrency}</Text>
                            </View>
                            {parsedUSD > 0 && (
                                <View style={[s.calcRow, { backgroundColor: isBuy ? C.positiveBg : C.negativeBg }]}>
                                    <Text style={{ fontSize: 13, color: C.textSecondary, fontFamily: 'Inter' }}>
                                        {isBuy ? 'You receive ≈' : 'You sell ≈'}
                                    </Text>
                                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: accentColor, fontVariant: ['tabular-nums'] }}>
                                        {fmtCoin(coinAmount)} {base}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Quick amounts */}
                        <View style={[s.quickRow, { paddingHorizontal: 16, marginTop: 12 }]}>
                            {[25, 50, 100, 500].map(v => {
                                const isActive = String(v) === amountUSD;
                                return (
                                    <TouchableOpacity
                                        key={v}
                                        style={[s.quickBtn, {
                                            backgroundColor: isActive ? C.accentBg : C.card,
                                            borderColor: isActive ? C.accent : C.cardBorder,
                                        }]}
                                        onPress={() => setAmountUSD(String(v))}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[s.quickText, { color: isActive ? C.accent : C.textSecondary }]}>
                                            ${v}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Disclaimer */}
                        <View style={[s.disclaimer, { marginHorizontal: 16, borderColor: C.separator, backgroundColor: C.surface }]}>
                            <Text style={{ fontSize: 11, fontWeight: '700', fontFamily: 'Inter', color: C.textMuted, letterSpacing: 0.5, marginBottom: 6 }}>
                                MARKET ORDER — INSTANT EXECUTION
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter', color: C.textMuted, lineHeight: 18 }}>
                                Executes immediately at best available price. Final price may differ due to slippage. You are solely responsible for all trades.
                            </Text>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[s.submitBtn, {
                                marginHorizontal: 16,
                                backgroundColor: parsedUSD > 0 ? accentColor : C.card,
                            }]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                            disabled={parsedUSD <= 0}
                        >
                            <Text style={[s.submitText, { color: parsedUSD > 0 ? '#fff' : C.textMuted }]}>
                                {isBuy
                                    ? `BUY ${base}  ·  $${fmt(parsedUSD)}`
                                    : `SELL ${base}  ·  $${fmt(parsedUSD)}`
                                }
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 32 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ── LOADING ────────────────────────────────────────────────────────────────
    if (phase === PHASE_LOADING) {
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <View style={s.centeredFill}>
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text style={{ marginTop: 20, fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: C.textPrimary }}>
                        Submitting order…
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 13, fontFamily: 'Inter', color: C.textSecondary, textAlign: 'center' }}>
                        Placing market {side} order on Bitfinex
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── SUCCESS ────────────────────────────────────────────────────────────────
    if (phase === PHASE_SUCCESS && orderResult) {
        const r = orderResult;
        return (
            <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
                {renderHeader()}
                <Animated.ScrollView
                    style={{ opacity: successOpacity }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Success header */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <View style={[s.successCircle, { backgroundColor: C.positiveBg }]}>
                            <Text style={{ fontSize: 36, color: C.positive }}>✓</Text>
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: C.positive, marginTop: 12 }}>
                            Order Submitted
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter', color: C.textSecondary, marginTop: 4 }}>
                            Market {side} sent to Bitfinex
                        </Text>
                    </View>

                    {/* Receipt card with yellow top accent */}
                    <View style={[s.receiptCard, {
                        backgroundColor: C.card, borderColor: C.cardBorder,
                        borderTopColor: C.accent,
                    }]}>
                        {[
                            ['Order ID',    r.order_id ?? '—'],
                            ['Status',      r.status ?? 'EXECUTING'],
                            ['Pair',        pair],
                            ['Side',        side.toUpperCase()],
                            ['Spent / Rcvd', `$${fmt(r.amount_usd)} USD`],
                            ['Coin Amount', `${fmtCoin(r.base_amount)} ${base}`],
                            ['Price Used',  `$${fmt(r.price_at_order, 6)}`],
                        ].map(([label, value], i, arr) => (
                            <View key={label} style={[
                                s.receiptRow,
                                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.separator },
                            ]}>
                                <Text style={{ fontSize: 13, fontFamily: 'Inter', color: C.textSecondary }}>{label}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: C.textPrimary, fontVariant: ['tabular-nums'] }}>
                                    {String(value)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[s.submitBtn, { backgroundColor: C.positive, marginHorizontal: 0, marginTop: 16 }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text style={[s.submitText, { color: '#fff' }]}>Done</Text>
                    </TouchableOpacity>
                </Animated.ScrollView>
            </SafeAreaView>
        );
    }

    // ── ERROR ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[s.root, { backgroundColor: C.background }]}>
            {renderHeader()}
            <View style={s.centeredFill}>
                <View style={[s.successCircle, { backgroundColor: C.negativeBg }]}>
                    <Text style={{ fontSize: 36, color: C.negative }}>✕</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: C.negative, marginTop: 12 }}>
                    Order Failed
                </Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter', color: C.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                    {errorMsg}
                </Text>
                <TouchableOpacity
                    style={[s.submitBtn, { backgroundColor: C.negative, marginHorizontal: 0, marginTop: 28, width: '100%' }]}
                    onPress={() => { setPhase(PHASE_INPUT); setErrorMsg(''); }}
                    activeOpacity={0.85}
                >
                    <Text style={[s.submitText, { color: '#fff' }]}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.ghostBtn, { borderColor: C.cardBorder, marginTop: 10, width: '100%' }]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 15, fontWeight: '600', fontFamily: 'Inter', color: C.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn:  { marginRight: 8, padding: 4 },
    backArrow: { fontSize: 32, lineHeight: 32, marginTop: -4 },
    logo:     { width: 34, height: 34, borderRadius: 17 },
    sideBadge: {
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4,
    },
    sideText: { fontSize: 13, fontWeight: '800', fontFamily: 'Inter', letterSpacing: 1.5 },

    priceStrip: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
    },
    orderTypeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 4,
    },

    quoteBtns: { flexDirection: 'row', gap: 8 },
    quoteBtn: {
        flex: 1, paddingVertical: 10, borderRadius: 6,
        borderWidth: 1, alignItems: 'center',
    },
    quoteBtnText: { fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },

    inputBox: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderRadius: 8,
        paddingHorizontal: 16, paddingVertical: 14,
    },
    input: {
        flex: 1, fontSize: 28, fontWeight: '700', fontFamily: 'Inter',
        padding: 0, fontVariant: ['tabular-nums'],
    },
    calcRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6,
    },

    quickRow:  { flexDirection: 'row', gap: 8 },
    quickBtn:  { flex: 1, paddingVertical: 9, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
    quickText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },

    disclaimer: {
        marginTop: 16, borderRadius: 6, borderWidth: 1,
        paddingHorizontal: 14, paddingVertical: 12,
    },

    submitBtn: {
        marginTop: 20, borderRadius: 8, paddingVertical: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    submitText: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter', letterSpacing: 1 },

    centeredFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

    successCircle: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },

    receiptCard: {
        borderRadius: 8, borderWidth: 1, borderTopWidth: 3,
        overflow: 'hidden',
    },
    receiptRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 13,
    },

    ghostBtn: {
        paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8,
        borderWidth: 1, alignItems: 'center',
    },
});

export default TradeScreen;
