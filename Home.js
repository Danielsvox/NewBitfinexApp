import * as React from 'react';
import { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import { LineChart } from 'react-native-wagmi-charts';

import { TickersContext, checkRateLimit, capitalizeFLetter, getStyles } from './utils';
import { useNavigation } from '@react-navigation/native';
import ThemeContext from './themes/ThemeContext';

const { width } = Dimensions.get('window');
const SECTIONS   = ['News', 'Winners', 'Losers', 'Movers'];
const TAB_HEIGHT = 44;

// ── Horizontal ticker card ────────────────────────────────────────────────────

const TickerCard = ({ ticker, getLogoFilename, navigation }) => {
    const [chartData,  setChartData]  = useState([]);
    const [chartColor, setChartColor] = useState(null);
    const { theme } = useContext(ThemeContext);
    const styles    = getStyles(theme);
    const C         = theme._colors;

    useEffect(() => {
        fetch(`https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=24`)
            .then(checkRateLimit).then(r => r.json())
            .then(data => {
                const pts = data
                    .map(c => ({ timestamp: c[0], value: c[2] }))
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
                            <LineChart width={styles.card.width - 24} height={60}>
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

// ── Inline news card ──────────────────────────────────────────────────────────

const NewsCard = ({ news, navigation, styles, C }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('NewsDetail', { news })}>
        <View style={styles.newsCard}>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: '700', fontFamily: 'Inter', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>
                Bitfinex News
            </Text>
            <Text style={styles.titleNews} numberOfLines={2}>{news[3]}</Text>
            <RenderHtml contentWidth={width - 64} source={{ html: news[4]?.substring(0, 100) ?? '' }} tagsStyles={styles.snippet} />
        </View>
    </TouchableOpacity>
);

// ── Inline ticker row ─────────────────────────────────────────────────────────

const TickerRow = ({ ticker, rank, navigation, styles, C }) => {
    const { getLogoFilename } = useContext(TickersContext);
    const isPositive = ticker.tickerData.daily_change_relative >= 0;
    const pct        = (ticker.tickerData.daily_change_relative * 100).toFixed(2);
    const price      = parseFloat(ticker.tickerData.last_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('TickerDetail', { ticker })}>
            <View style={[styles.moversCard, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={{ width: 22, fontSize: 11, color: C.textMuted, fontFamily: 'Inter', fontVariant: ['tabular-nums'] }}>
                    {rank}
                </Text>
                <Image style={{ width: 28, height: 28, borderRadius: 14, marginRight: 10 }} source={{ uri: getLogoFilename(ticker) }} contentFit="contain" />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter' }} numberOfLines={1}>
                        {capitalizeFLetter(ticker.verboseName)}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>
                        {ticker.baseCurrency}/{ticker.quoteCurrency}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter', fontVariant: ['tabular-nums'] }}>
                        ${price}
                    </Text>
                    <View style={{
                        marginTop: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3,
                        backgroundColor: isPositive ? C.positiveBg : C.negativeBg,
                    }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', fontFamily: 'Inter', fontVariant: ['tabular-nums'], color: isPositive ? C.positive : C.negative }}>
                            {isPositive ? '+' : ''}{pct}%
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ── Main frame ────────────────────────────────────────────────────────────────

const SORT_FNS = {
    Winners: (a, b) => b.tickerData.daily_change_relative - a.tickerData.daily_change_relative,
    Losers:  (a, b) => a.tickerData.daily_change_relative - b.tickerData.daily_change_relative,
    Movers:  (a, b) => b.absPercMove - a.absPercMove,
};

const Frame = () => {
    const { tickers, getLogoFilename, walletData } = useContext(TickersContext);
    const navigation = useNavigation();
    const [selectedSection, setSelectedSection] = useState('News');
    const { theme } = useContext(ThemeContext);
    const styles    = getStyles(theme);
    const C         = theme._colors;

    const scrollY = useRef(new Animated.Value(0)).current;
    const [headerHeight, setHeaderHeight] = useState(300);

    const tabTranslateY = scrollY.interpolate({
        inputRange:  [0, Math.max(headerHeight, 1)],
        outputRange: [headerHeight, 0],
        extrapolate: 'clamp',
    });

    // ── News data ─────────────────────────────────────────────────────────────
    const [newsData,    setNewsData]    = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    useEffect(() => {
        axios.get('https://api-pub.bitfinex.com/v2/posts/hist?limit=20&type=1')
            .then(r => { setNewsData(r.data); setNewsLoading(false); })
            .catch(() => setNewsLoading(false));
    }, []);

    // ── Top-5 horizontal cards ────────────────────────────────────────────────
    const topTickers = useMemo(() =>
        [...tickers].sort((a, b) => b.usdVolume - a.usdVolume).slice(0, 5),
        [tickers]
    );

    // ── Section tickers ───────────────────────────────────────────────────────
    const sectionTickers = useMemo(() => {
        const fn = SORT_FNS[selectedSection];
        if (!fn) return [];
        return [...tickers].sort(fn).slice(0, 20);
    }, [selectedSection, tickers]);

    // ── Content items ─────────────────────────────────────────────────────────
    const contentItems = useMemo(() => {
        if (selectedSection === 'News') {
            if (newsLoading) return [(
                <View key="loader" style={{ paddingTop: 40, alignItems: 'center' }}>
                    <ActivityIndicator color={C.accent} />
                </View>
            )];
            return newsData.map((news, i) => (
                <NewsCard key={`news-${i}`} news={news} navigation={navigation} styles={styles} C={C} />
            ));
        }
        return sectionTickers.map((ticker, i) => (
            <TickerRow key={`${selectedSection}-${ticker.ticker}-${i}`} ticker={ticker} rank={i + 1} navigation={navigation} styles={styles} C={C} />
        ));
    }, [selectedSection, newsData, newsLoading, sectionTickers, styles, C]);

    // Portfolio 24h change — rough estimate from top tickers volume-weighted average
    const portfolioChangeDisplay = walletData ? null : null;

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>

            {/* ── Scrollable content ────────────────────────────────────────── */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 80 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                {/* ── Collapsing header ─────────────────────────────────────── */}
                <View onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}>

                    {/* Balance block */}
                    <View style={{
                        paddingHorizontal: 20,
                        paddingTop: 60,
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: C.separator,
                    }}>
                        <Text style={{
                            color: C.textMuted, fontSize: 11, fontFamily: 'Inter',
                            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6,
                        }}>
                            Total Balance
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                            <Text style={{
                                color: walletData ? C.accent : C.textPrimary,
                                fontSize: 34, fontWeight: '700', fontFamily: 'Inter',
                                letterSpacing: -0.5, fontVariant: ['tabular-nums'],
                            }}>
                                {walletData
                                    ? `$${walletData.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : '——'
                                }
                            </Text>
                        </View>
                        {!walletData && (
                            <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: 'Inter', marginTop: 4 }}>
                                Connect API keys to see balance
                            </Text>
                        )}
                    </View>

                    {/* Horizontal ticker cards */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.scrollView}
                        contentContainerStyle={[styles.section, { paddingVertical: 12 }]}
                    >
                        {topTickers.map((t, i) => (
                            <TickerCard key={i} ticker={t} getLogoFilename={getLogoFilename} navigation={navigation} />
                        ))}
                    </ScrollView>

                </View>

                {/* Spacer for floating tab bar */}
                <View style={{ height: TAB_HEIGHT }} />

                {/* Content list — no horizontal padding; rows are full-width */}
                <View style={selectedSection === 'News' ? { paddingHorizontal: 14, paddingTop: 10 } : {}}>
                    {contentItems}
                </View>

            </Animated.ScrollView>

            {/* ── Floating tab bar ──────────────────────────────────────────── */}
            <Animated.View
                style={{
                    position:          'absolute',
                    top:               0,
                    left:              0,
                    right:             0,
                    height:            TAB_HEIGHT,
                    flexDirection:     'row',
                    alignItems:        'stretch',
                    backgroundColor:   C.card,
                    borderBottomWidth: 1,
                    borderBottomColor: C.separator,
                    zIndex:            100,
                    elevation:         100,
                    transform:         [{ translateY: tabTranslateY }],
                }}
            >
                {SECTIONS.map(section => {
                    const active = section === selectedSection;
                    return (
                        <TouchableOpacity
                            key={section}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottomWidth: active ? 2 : 0,
                                borderBottomColor: C.accent,
                            }}
                            onPress={() => setSelectedSection(section)}
                            activeOpacity={0.7}
                        >
                            <Text style={{
                                fontSize: 13,
                                fontWeight: active ? '600' : '400',
                                fontFamily: 'Inter',
                                color: active ? C.accent : C.textSecondary,
                            }}>
                                {section}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>

        </View>
    );
};

export default Frame;
