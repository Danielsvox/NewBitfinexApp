import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, Dimensions, ScrollView,
    TouchableOpacity, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { CandlestickChart } from 'react-native-wagmi-charts';

import { checkRateLimit, capitalizeFLetter, TickersContext } from './utils';
import ThemeContext from './themes/ThemeContext';

const { width } = Dimensions.get('window');

const INTERVALS = [
    { label: '1h',  tf: '1h',  limit: 48 },
    { label: '6h',  tf: '6h',  limit: 48 },
    { label: '1D',  tf: '1D',  limit: 30 },
    { label: '1W',  tf: '1W',  limit: 26 },
];

const TickerDetailScreen = ({ route, navigation }) => {
    const { ticker } = route.params;
    const [candleData, setCandleData]           = useState([]);
    const [selectedInterval, setSelectedInterval] = useState(INTERVALS[0]);
    const [loading, setLoading]                 = useState(true);
    const { theme }  = useContext(ThemeContext);
    const { hasKeys, getLogoFilename } = useContext(TickersContext);
    const C = theme._colors;

    useEffect(() => {
        if (!ticker?.ticker) return;
        setLoading(true);
        const url = `https://api-pub.bitfinex.com/v2/candles/trade:${selectedInterval.tf}:${ticker.ticker}/hist?limit=${selectedInterval.limit}`;
        fetch(url)
            .then(checkRateLimit).then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const transformed = data
                        .map(c => ({ timestamp: c[0], open: c[1], close: c[2], high: c[3], low: c[4] }))
                        .sort((a, b) => a.timestamp - b.timestamp);
                    setCandleData(transformed);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [ticker, selectedInterval]);

    const isPositive = ticker.tickerData.daily_change_relative >= 0;
    const pct        = (ticker.tickerData.daily_change_relative * 100).toFixed(2);
    const price      = parseFloat(ticker.tickerData.last_price).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 6,
    });
    const highPrice  = parseFloat(ticker.tickerData.high).toLocaleString(undefined, { maximumFractionDigits: 6 });
    const lowPrice   = parseFloat(ticker.tickerData.low).toLocaleString(undefined, { maximumFractionDigits: 6 });
    const volume     = parseFloat(ticker.usdVolume).toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 2 });

    const STATS = [
        { label: '24h Volume', value: volume + ' USD' },
        { label: '24h High',   value: '$' + highPrice },
        { label: '24h Low',    value: '$' + lowPrice },
        { label: 'Last Price', value: '$' + parseFloat(ticker.tickerData.last_price).toFixed(4) },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

                {/* ── Header ──────────────────────────────────────────── */}
                <View style={[s.header, { borderBottomColor: C.separator }]}>
                    <TouchableOpacity
                        style={s.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={[s.backText, { color: C.accent }]}>‹</Text>
                    </TouchableOpacity>
                    <Image
                        style={s.logo}
                        source={{ uri: getLogoFilename(ticker) }}
                        contentFit="contain"
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: '700', fontFamily: 'Inter', color: C.textPrimary }}>
                            {ticker.baseCurrency}/USD
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter', color: C.textSecondary, marginTop: 1 }}>
                            {capitalizeFLetter(ticker.verboseName)}
                        </Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
                        backgroundColor: isPositive ? C.positiveBg : C.negativeBg,
                    }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', fontFamily: 'Inter', color: isPositive ? C.positive : C.negative }}>
                            {isPositive ? '+' : ''}{pct}%
                        </Text>
                    </View>
                </View>

                {/* ── Price ───────────────────────────────────────────── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
                    <Text style={{
                        fontSize: 38, fontWeight: '700', fontFamily: 'Inter',
                        color: C.textPrimary, letterSpacing: -1, fontVariant: ['tabular-nums'],
                    }}>
                        ${price}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter', color: C.textMuted }}>
                            H: <Text style={{ color: C.positive, fontWeight: '600' }}>${highPrice}</Text>
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter', color: C.textMuted }}>
                            L: <Text style={{ color: C.negative, fontWeight: '600' }}>${lowPrice}</Text>
                        </Text>
                    </View>
                </View>

                {/* ── Stats 4-col grid ─────────────────────────────────── */}
                <View style={{
                    flexDirection: 'row', marginHorizontal: 16, marginBottom: 16,
                    backgroundColor: C.card, borderRadius: 8,
                    borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden',
                }}>
                    {STATS.map((stat, i) => (
                        <View key={i} style={[
                            { flex: 1, alignItems: 'center', paddingVertical: 12 },
                            i < STATS.length - 1 && { borderRightWidth: 1, borderRightColor: C.cardBorder },
                        ]}>
                            <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                {stat.label}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter', fontVariant: ['tabular-nums'] }} numberOfLines={1} adjustsFontSizeToFit>
                                {stat.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Interval selector (Binance underline style) ──────── */}
                <View style={{
                    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.separator,
                    paddingHorizontal: 16, marginBottom: 0, backgroundColor: C.card,
                }}>
                    {INTERVALS.map(iv => {
                        const active = iv.tf === selectedInterval.tf;
                        return (
                            <TouchableOpacity
                                key={iv.tf}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 12,
                                    borderBottomWidth: active ? 2 : 0,
                                    borderBottomColor: C.accent,
                                }}
                                onPress={() => setSelectedInterval(iv)}
                                activeOpacity={0.7}
                            >
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: active ? '600' : '400',
                                    fontFamily: 'Inter',
                                    color: active ? C.accent : C.textSecondary,
                                }}>
                                    {iv.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── Candlestick chart ────────────────────────────────── */}
                <View style={{ backgroundColor: C.card, marginBottom: 8 }}>
                    {loading ? (
                        <View style={{ height: 280, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator color={C.accent} />
                        </View>
                    ) : candleData.length > 0 ? (
                        <CandlestickChart.Provider data={candleData}>
                            <CandlestickChart width={width} height={280}>
                                <CandlestickChart.Candles
                                    positiveColor={C.positive}
                                    negativeColor={C.negative}
                                />
                                <CandlestickChart.Crosshair>
                                    <CandlestickChart.Tooltip />
                                </CandlestickChart.Crosshair>
                            </CandlestickChart>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 8 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter' }}>O</Text>
                                    <CandlestickChart.PriceText type="open"  style={{ color: C.textSecondary, fontSize: 12, fontFamily: 'Inter' }} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter' }}>H</Text>
                                    <CandlestickChart.PriceText type="high"  style={{ color: C.positive, fontSize: 12, fontFamily: 'Inter' }} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter' }}>L</Text>
                                    <CandlestickChart.PriceText type="low"   style={{ color: C.negative, fontSize: 12, fontFamily: 'Inter' }} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter' }}>C</Text>
                                    <CandlestickChart.PriceText type="close" style={{ color: C.textPrimary, fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }} />
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                                <CandlestickChart.DatetimeText style={{ color: C.textMuted, fontSize: 11, fontFamily: 'Inter' }} />
                            </View>
                        </CandlestickChart.Provider>
                    ) : (
                        <View style={{ height: 280, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: C.textMuted, fontFamily: 'Inter' }}>No chart data available</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ── Full-width split BUY / SELL ─────────────────────────── */}
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.separator }}>
                <TouchableOpacity
                    style={{
                        flex: 1, paddingVertical: 18, alignItems: 'center',
                        backgroundColor: C.sell,
                    }}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Trade', { ticker, side: 'sell' })}
                >
                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: '#FFFFFF', letterSpacing: 1.5 }}>
                        SELL
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1, paddingVertical: 18, alignItems: 'center',
                        backgroundColor: C.buy,
                    }}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Trade', { ticker, side: 'buy' })}
                >
                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: '#FFFFFF', letterSpacing: 1.5 }}>
                        BUY
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn:  { paddingRight: 12, paddingVertical: 4 },
    backText: { fontSize: 32, lineHeight: 32, marginTop: -4 },
    logo:     { width: 40, height: 40, borderRadius: 20 },
});

export default TickerDetailScreen;
