import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

import { TickersContext, capitalizeFLetter, getStyles } from './utils';
import ThemeContext from './themes/ThemeContext';

const MoversComponent = ({ navigation }) => {
    const { tickers, getLogoFilename } = useContext(TickersContext);
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    const C = theme._colors;

    const sorted = [...tickers]
        .sort((a, b) => b.absPercMove - a.absPercMove)
        .slice(0, 10);

    return (
        <ScrollView style={styles.scrollViewTickers} showsVerticalScrollIndicator={false}>
            {sorted.map((ticker, index) => {
                const isPositive = ticker.tickerData.daily_change_relative >= 0;
                const pct        = (ticker.tickerData.daily_change_relative * 100).toFixed(2);
                const price      = parseFloat(ticker.tickerData.last_price).toLocaleString(undefined, {
                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                });

                return (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('TickerDetail', { ticker })}
                    >
                        <View style={[styles.moversCard, { flexDirection: 'row', alignItems: 'center' }]}>
                            <Text style={{ width: 22, fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>
                                {index + 1}
                            </Text>
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
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter', fontVariant: ['tabular-nums'] }}>
                                    ${price}
                                </Text>
                                <View style={{ marginTop: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3, backgroundColor: isPositive ? C.positiveBg : C.negativeBg }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', fontFamily: 'Inter', fontVariant: ['tabular-nums'], color: isPositive ? C.positive : C.negative }}>
                                        {isPositive ? '+' : ''}{pct}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default MoversComponent;
