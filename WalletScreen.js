import React, { useContext } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ThemeContext from './themes/ThemeContext';
import { TickersContext } from './utils';

const TYPE_LABEL = {
    exchange: 'Spot / Exchange',
    margin:   'Margin',
    funding:  'Funding',
};

const WalletScreen = () => {
    const { theme }                                           = useContext(ThemeContext);
    const { walletData, walletLoading, refreshWallet, hasKeys } = useContext(TickersContext);
    const C          = theme._colors;
    const navigation = useNavigation();

    const grouped = React.useMemo(() => {
        if (!walletData?.wallets) return {};
        return walletData.wallets.reduce((acc, w) => {
            const key = w.wallet_type;
            if (!acc[key]) acc[key] = [];
            acc[key].push(w);
            return acc;
        }, {});
    }, [walletData]);

    const groupOrder = ['exchange', 'margin', 'funding'];

    // ── Not connected ─────────────────────────────────────────────────────────
    if (!hasKeys) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <View style={[s.emptyIcon, { backgroundColor: C.accentBg }]}>
                    <Text style={{ fontSize: 32 }}>🔑</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: C.textPrimary, fontFamily: 'Inter', textAlign: 'center', marginBottom: 8, marginTop: 16 }}>
                    Connect your account
                </Text>
                <Text style={{ fontSize: 13, color: C.textSecondary, fontFamily: 'Inter', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
                    Add your Bitfinex API keys in the Account tab to view your wallet balances.
                </Text>
                <TouchableOpacity
                    style={[s.btn, { backgroundColor: C.accent }]}
                    onPress={() => navigation.navigate('Account')}
                    activeOpacity={0.8}
                >
                    <Text style={[s.btnText, { color: '#000' }]}>Go to Account</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (walletLoading && !walletData) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={C.accent} size="large" />
                <Text style={{ color: C.textSecondary, marginTop: 12, fontFamily: 'Inter', fontSize: 14 }}>
                    Loading balances…
                </Text>
            </SafeAreaView>
        );
    }

    // ── Main ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={walletLoading} onRefresh={refreshWallet} tintColor={C.accent} />
                }
            >
                {/* ── Header ── */}
                <View style={[s.header, { borderBottomColor: C.separator }]}>
                    <View>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Inter' }}>Wallet</Text>
                        <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', marginTop: 2 }}>
                            Pull down to refresh
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[s.depositBtn, { backgroundColor: C.accent }]}
                        onPress={() => navigation.navigate('Deposit')}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '700', fontFamily: 'Inter', letterSpacing: 0.5 }}>
                            + Deposit
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Total portfolio card ── */}
                <View style={[s.totalCard, { backgroundColor: C.card, borderTopColor: C.accent }]}>
                    <Text style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Inter', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                        Total Portfolio Value
                    </Text>
                    <Text style={{ fontSize: 36, fontWeight: '700', color: C.accent, fontFamily: 'Inter', letterSpacing: -1, fontVariant: ['tabular-nums'] }}>
                        ${walletData?.total_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', marginTop: 4 }}>
                        USD equivalent across all wallets
                    </Text>
                </View>

                {/* ── Wallet groups ── */}
                {groupOrder
                    .filter(type => grouped[type]?.length > 0)
                    .map(type => (
                        <View key={type} style={{ marginTop: 20 }}>
                            {/* Group header */}
                            <View style={[s.groupHeader, { backgroundColor: C.background, borderTopColor: C.separator, borderBottomColor: C.separator }]}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, fontFamily: 'Inter', letterSpacing: 1, textTransform: 'uppercase' }}>
                                    {TYPE_LABEL[type] ?? type}
                                </Text>
                                <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter' }}>
                                    {grouped[type].length} {grouped[type].length === 1 ? 'asset' : 'assets'}
                                </Text>
                            </View>

                            {/* Column labels */}
                            <View style={[s.colLabels, { backgroundColor: C.background, borderBottomColor: C.separator }]}>
                                <Text style={[s.colLbl, { color: C.textMuted, flex: 1 }]}>Asset</Text>
                                <Text style={[s.colLbl, { color: C.textMuted, width: 90, textAlign: 'right' }]}>Available</Text>
                                <Text style={[s.colLbl, { color: C.textMuted, width: 80, textAlign: 'right' }]}>USD Value</Text>
                            </View>

                            {/* Rows */}
                            {grouped[type].map((wallet, i) => (
                                <View
                                    key={`${wallet.currency}-${i}`}
                                    style={[s.walletRow, {
                                        backgroundColor: C.card,
                                        borderBottomColor: C.separator,
                                    }]}
                                >
                                    {/* Currency badge */}
                                    <View style={[s.currencyBadge, { backgroundColor: C.accentBg }]}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', fontFamily: 'Inter', color: C.accent }} adjustsFontSizeToFit numberOfLines={1}>
                                            {wallet.currency.slice(0, 5)}
                                        </Text>
                                    </View>

                                    {/* Name */}
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter' }}>
                                            {wallet.currency}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter', marginTop: 1, fontVariant: ['tabular-nums'] }}>
                                            Total: {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        </Text>
                                    </View>

                                    {/* Available */}
                                    <Text style={{ fontSize: 13, color: C.textSecondary, fontFamily: 'Inter', width: 90, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                                        {wallet.available_balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </Text>

                                    {/* USD value */}
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter', width: 80, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                                        {wallet.usd_value != null
                                            ? `$${wallet.usd_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '—'
                                        }
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}

                {/* Empty state */}
                {walletData && walletData.wallets.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
                        <View style={[s.emptyIcon, { backgroundColor: C.accentBg }]}>
                            <Text style={{ fontSize: 28 }}>💼</Text>
                        </View>
                        <Text style={{ color: C.textSecondary, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', marginTop: 16, lineHeight: 22 }}>
                            No balances found.{'\n'}Fund your Bitfinex account to get started.
                        </Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
        borderBottomWidth: 1,
    },
    depositBtn: {
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 6,
    },
    totalCard: {
        marginHorizontal: 16, marginTop: 16,
        borderRadius: 8, borderWidth: 1,
        borderTopWidth: 3,
        padding: 20,
        borderColor: '#2B3139',
    },
    groupHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
        borderTopWidth: 1, borderBottomWidth: 1,
    },
    colLabels: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 7,
        borderBottomWidth: 1,
    },
    colLbl: { fontSize: 10, fontFamily: 'Inter', letterSpacing: 0.4, textTransform: 'uppercase' },
    walletRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 13,
        borderBottomWidth: 1,
    },
    currencyBadge: {
        width: 38, height: 38, borderRadius: 6,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyIcon: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center',
    },
    btn: {
        paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8,
        alignItems: 'center',
    },
    btnText: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});

export default WalletScreen;
