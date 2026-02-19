import * as React from 'react';
import { useContext, useEffect, useState, useMemo } from 'react';
import { Image } from 'expo-image';
import {
    Text, View, ScrollView, TouchableOpacity,
    ActivityIndicator, SafeAreaView,
} from 'react-native';

import { TickersContext, checkRateLimit, capitalizeFLetter, getStyles } from './utils';
import { LineChart } from 'react-native-wagmi-charts';
import { useNavigation } from '@react-navigation/native';
import ThemeContext from './themes/ThemeContext';

// ── Compact horizontal card ───────────────────────────────────────────────────

const TickerCard = ({ ticker, getLogoFilename, navigation, C, styles }) => {
    const [chartData,  setChartData]  = useState([]);
    const [chartColor, setChartColor] = useState(null);

    useEffect(() => {
        fetch(`https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=24`)
            .then(checkRateLimit).then(r => r.json())
            .then(data => {
                const pts = data.map(c => ({ timestamp: c[0], value: c[2] }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                if (pts.length) {
                    setChartData(pts);
                    setChartColor(pts[pts.length - 1].value >= pts[0].value ? C.positive : C.negative);
                }
            }).catch(() => {});
    }, [ticker]);

    const isPositive = ticker.tickerData.daily_change_relative >= 0;
    const pct        = (ticker.tickerData.daily_change_relative * 100).toFixed(2);

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('TickerDetail', { ticker })}>
            <View style={styles.card}>
                <View style={styles.topSection}>
                    <Image style={styles.logo} source={{ uri: getLogoFilename(ticker) }} contentFit="contain" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.tokenName} numberOfLines={1}>{ticker.baseCurrency}</Text>
                        <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter' }}>
                            {ticker.baseCurrency}/{ticker.quoteCurrency}
                        </Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3,
                        backgroundColor: isPositive ? C.positiveBg : C.negativeBg,
                    }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', fontFamily: 'Inter', color: isPositive ? C.positive : C.negative }}>
                            {isPositive ? '+' : ''}{pct}%
                        </Text>
                    </View>
                </View>
                <View style={styles.graphPlaceholder}>
                    {chartData.length > 0 ? (
                        <LineChart.Provider data={chartData}>
                            <LineChart width={styles.card.width - 24} height={56}>
                                <LineChart.Path color={chartColor || C.accent}><LineChart.Gradient /></LineChart.Path>
                            </LineChart>
                        </LineChart.Provider>
                    ) : (
                        <ActivityIndicator size="small" color={C.textMuted} />
                    )}
                </View>
                <View style={styles.bottomSection}>
                    <Text style={styles.dailyVolume}>
                        ${parseFloat(ticker.tickerData.last_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.lastTradedPrice}>
                        Vol {parseFloat(ticker.usdVolume).toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ── Table row ─────────────────────────────────────────────────────────────────

const TableRow = ({ ticker, rank, navigation, C, getLogoFilename }) => {
    const isPositive = ticker.tickerData.daily_change_relative >= 0;
    const pct        = (ticker.tickerData.daily_change_relative * 100).toFixed(2);
    const price      = parseFloat(ticker.tickerData.last_price).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 6,
    });

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('TickerDetail', { ticker })}>
            <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, paddingVertical: 13,
                borderBottomWidth: 1, borderBottomColor: C.separator,
                backgroundColor: C.card,
            }}>
                {/* Rank */}
                <Text style={{ width: 24, fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>{rank}</Text>

                {/* Logo + name */}
                <Image
                    style={{ width: 28, height: 28, borderRadius: 14, marginRight: 10 }}
                    source={{ uri: getLogoFilename(ticker) }}
                    contentFit="contain"
                />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter' }} numberOfLines={1}>
                        {ticker.baseCurrency}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>
                        {capitalizeFLetter(ticker.verboseName)}
                    </Text>
                </View>

                {/* Price */}
                <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
                    <Text style={{
                        fontSize: 14, fontWeight: '600', color: C.textPrimary,
                        fontFamily: 'Inter', fontVariant: ['tabular-nums'],
                    }}>
                        ${price}
                    </Text>
                    <View style={{
                        marginTop: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3,
                        backgroundColor: isPositive ? C.positiveBg : C.negativeBg,
                        alignSelf: 'flex-end',
                    }}>
                        <Text style={{
                            fontSize: 12, fontWeight: '700', fontFamily: 'Inter',
                            fontVariant: ['tabular-nums'],
                            color: isPositive ? C.positive : C.negative,
                        }}>
                            {isPositive ? '+' : ''}{pct}%
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ── Markets screen ────────────────────────────────────────────────────────────

const TABS = ['All', 'Gainers', 'Losers', 'Volume'];

const Frame = () => {
    const { tickers, getLogoFilename } = useContext(TickersContext);
    const navigation = useNavigation();
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    const C = theme._colors;

    const [activeTab, setActiveTab] = useState('All');

    const topTickers = useMemo(() =>
        [...tickers].sort((a, b) => b.usdVolume - a.usdVolume).slice(0, 8),
        [tickers]
    );

    const tableTickers = useMemo(() => {
        let list = [...tickers];
        if (activeTab === 'Gainers')
            list = list.sort((a, b) => b.tickerData.daily_change_relative - a.tickerData.daily_change_relative);
        else if (activeTab === 'Losers')
            list = list.sort((a, b) => a.tickerData.daily_change_relative - b.tickerData.daily_change_relative);
        else if (activeTab === 'Volume')
            list = list.sort((a, b) => b.usdVolume - a.usdVolume);
        else
            list = list.sort((a, b) => b.usdVolume - a.usdVolume);
        return list.slice(0, 50);
    }, [tickers, activeTab]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                {/* ── Header ──────────────────────────────────────────────── */}
                <View style={{
                    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
                    borderBottomWidth: 1, borderBottomColor: C.separator,
                }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Inter' }}>
                        Markets
                    </Text>
                    <Text style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Inter', marginTop: 2 }}>
                        {tickers.length} pairs
                    </Text>
                </View>

                {/* ── Top movers horizontal strip ──────────────────────── */}
                <View style={{ paddingTop: 12 }}>
                    <Text style={{
                        paddingHorizontal: 16, marginBottom: 8,
                        fontSize: 12, fontWeight: '600', color: C.textMuted,
                        fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 0.8,
                    }}>
                        Top by Volume
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.section, { paddingVertical: 4 }]}>
                        {topTickers.map((ticker, i) => (
                            <TickerCard key={i} ticker={ticker} getLogoFilename={getLogoFilename} navigation={navigation} C={C} styles={styles} />
                        ))}
                    </ScrollView>
                </View>

                {/* ── Tab filter bar ───────────────────────────────────── */}
                <View style={{
                    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.separator,
                    backgroundColor: C.card, marginTop: 12,
                }}>
                    {TABS.map(tab => {
                        const active = tab === activeTab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                style={{
                                    flex: 1, paddingVertical: 12, alignItems: 'center',
                                    borderBottomWidth: active ? 2 : 0,
                                    borderBottomColor: C.accent,
                                }}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.7}
                            >
                                <Text style={{
                                    fontSize: 13, fontFamily: 'Inter',
                                    fontWeight: active ? '600' : '400',
                                    color: active ? C.accent : C.textSecondary,
                                }}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── Column headers ───────────────────────────────────── */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 16, paddingVertical: 8,
                    backgroundColor: C.background,
                    borderBottomWidth: 1, borderBottomColor: C.separator,
                }}>
                    <Text style={{ width: 24, fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>#</Text>
                    <Text style={{ flex: 1, fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>Name</Text>
                    <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', textAlign: 'right' }}>Price / 24h%</Text>
                </View>

                {/* ── Table rows ───────────────────────────────────────── */}
                {tableTickers.length > 0 ? (
                    tableTickers.map((ticker, i) => (
                        <TableRow
                            key={`${ticker.ticker}-${i}`}
                            ticker={ticker}
                            rank={i + 1}
                            navigation={navigation}
                            C={C}
                            getLogoFilename={getLogoFilename}
                        />
                    ))
                ) : (
                    <View style={{ paddingTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={C.accent} />
                        <Text style={{ color: C.textMuted, fontFamily: 'Inter', marginTop: 8, fontSize: 13 }}>
                            Loading markets…
                        </Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default Frame;
