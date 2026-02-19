import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, Modal, StyleSheet, Dimensions,
    TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { CandlestickChart } from 'react-native-wagmi-charts';
import { checkRateLimit, capitalizeFLetter } from './utils';
import ThemeContext from './themes/ThemeContext';

const { width } = Dimensions.get('window');

const TickerModal = ({ visible, tickerData, onClose, navigation }) => {
    const [transformedData, setTransformedData] = useState(null);
    const [loading, setLoading] = useState(false);

    const { theme } = useContext(ThemeContext);
    const C = theme._colors;

    useEffect(() => {
        if (visible && tickerData?.[0]) {
            setLoading(true);
            const endpoint = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${tickerData[0]}/hist?limit=10`;
            fetch(endpoint)
                .then(checkRateLimit)
                .then(r => r.json())
                .then(data => {
                    const transformed = data
                        .map(c => ({ timestamp: c[0], open: c[1], close: c[2], high: c[3], low: c[4] }))
                        .sort((a, b) => a.timestamp - b.timestamp);
                    setTransformedData(transformed);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [visible, tickerData]);

    const tickerSymbol = tickerData?.[0] ?? '';
    const tickerName   = tickerData ? capitalizeFLetter(tickerSymbol.replace('t', '').replace('USD', '')) : '';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={[s.modal, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                    {/* Header */}
                    <View style={[s.modalHeader, { borderBottomColor: C.separator }]}>
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Inter' }}>
                                {tickerSymbol}
                            </Text>
                            <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Inter', marginTop: 2 }}>
                                1h Chart
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={[s.closeX, { backgroundColor: C.surface }]}>
                            <Text style={{ fontSize: 16, color: C.textSecondary, fontFamily: 'Inter' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Chart */}
                    <View style={[s.chartArea, { backgroundColor: C.surface }]}>
                        {loading ? (
                            <View style={s.loader}>
                                <ActivityIndicator color={C.accent} />
                            </View>
                        ) : transformedData && transformedData.length > 0 ? (
                            <CandlestickChart.Provider data={transformedData}>
                                <CandlestickChart width={width - 56} height={160}>
                                    <CandlestickChart.Candles
                                        positiveColor={C.positive}
                                        negativeColor={C.negative}
                                    />
                                    <CandlestickChart.Crosshair>
                                        <CandlestickChart.Tooltip />
                                    </CandlestickChart.Crosshair>
                                </CandlestickChart>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, paddingVertical: 6 }}>
                                    <CandlestickChart.PriceText type="open"  style={{ color: C.textSecondary, fontSize: 11, fontFamily: 'Inter' }} />
                                    <CandlestickChart.PriceText type="high"  style={{ color: C.positive,       fontSize: 11, fontFamily: 'Inter' }} />
                                    <CandlestickChart.PriceText type="low"   style={{ color: C.negative,       fontSize: 11, fontFamily: 'Inter' }} />
                                    <CandlestickChart.PriceText type="close" style={{ color: C.textPrimary,    fontSize: 11, fontFamily: 'Inter', fontWeight: '700' }} />
                                </View>
                            </CandlestickChart.Provider>
                        ) : (
                            <View style={s.loader}>
                                <Text style={{ color: C.textMuted, fontFamily: 'Inter' }}>No chart data</Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={[s.actions, { borderTopColor: C.separator }]}>
                        <TouchableOpacity
                            style={[s.actionBtn, { borderColor: C.cardBorder, flex: 1 }]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '600', color: C.textSecondary, fontFamily: 'Inter' }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.actionBtn, { backgroundColor: C.accent, flex: 1 }]}
                            onPress={() => {
                                navigation.navigate('TickerDetail', { tickerData });
                                onClose();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#000', fontFamily: 'Inter' }}>
                                Full Details
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modal: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    closeX: {
        width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    chartArea: {
        paddingVertical: 8,
    },
    loader: {
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderTopWidth: 1,
    },
    actionBtn: {
        paddingVertical: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TickerModal;
