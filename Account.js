import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, Switch, Appearance, TouchableOpacity, StyleSheet,
    TextInput, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ThemeContext from './themes/ThemeContext';
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';
import { TickersContext } from './utils';

const THEME_KEY = 'user_theme_preference';

const AccountScreen = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { userId, hasKeys, saveKeys, deleteKeys } = useContext(TickersContext);

    const C      = theme._colors;
    const isDark = theme === darkTheme;

    const [apiKey,     setApiKey]     = useState('');
    const [apiSecret,  setApiSecret]  = useState('');
    const [saving,     setSaving]     = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [keyFocus,   setKeyFocus]   = useState(false);
    const [secFocus,   setSecFocus]   = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then(stored => {
            if (stored) toggleTheme(stored === 'dark' ? darkTheme : lightTheme);
            else {
                const scheme = Appearance.getColorScheme();
                toggleTheme(scheme === 'dark' ? darkTheme : lightTheme);
            }
        }).catch(() => {});
    }, []);

    const handleToggleTheme = async (value) => {
        const next = value ? darkTheme : lightTheme;
        toggleTheme(next);
        await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light').catch(() => {});
    };

    const handleConnect = async () => {
        if (!apiKey.trim() || !apiSecret.trim()) {
            Alert.alert('Missing fields', 'Please enter both API key and API secret.');
            return;
        }
        setSaving(true);
        try {
            await saveKeys(apiKey.trim(), apiSecret.trim());
            setApiKey('');
            setApiSecret('');
            Alert.alert('Connected!', 'Your Bitfinex account has been linked successfully.');
        } catch (e) {
            Alert.alert('Connection failed', e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect account',
            'This will remove your API keys. Your Bitfinex funds are not affected.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', style: 'destructive', onPress: () => deleteKeys() },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 48 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Header ── */}
                    <View style={[s.pageHeader, { borderBottomColor: C.separator }]}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Inter' }}>
                            Account
                        </Text>
                    </View>

                    {/* ── Bitfinex API section ── */}
                    <SectionHeader label="Bitfinex API" C={C} />

                    {hasKeys ? (
                        <>
                            {/* Connected state */}
                            <View style={[s.row, { backgroundColor: C.card, borderBottomColor: C.separator, borderTopColor: C.separator }]}>
                                <View style={[s.statusDot, { backgroundColor: C.positive }]} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter' }}>
                                        Account Connected
                                    </Text>
                                    <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Inter', marginTop: 2 }}>
                                        API keys stored securely on local server
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[s.smallBtn, { borderColor: C.negative }]}
                                    onPress={handleDisconnect}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', fontFamily: 'Inter', color: C.negative }}>
                                        Disconnect
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        /* Connect form */
                        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                            <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Inter', lineHeight: 19, marginBottom: 14 }}>
                                Enter a read-only API key pair from your Bitfinex account. Keys are sent to your local backend server only.
                            </Text>

                            <Text style={[s.inputLabel, { color: C.textMuted }]}>API KEY</Text>
                            <TextInput
                                style={[s.input, {
                                    backgroundColor: C.inputBg,
                                    borderColor: keyFocus ? C.accent : C.inputBorder,
                                    color: C.textPrimary,
                                }]}
                                value={apiKey}
                                onChangeText={setApiKey}
                                onFocus={() => setKeyFocus(true)}
                                onBlur={() => setKeyFocus(false)}
                                placeholder="Paste your API key…"
                                placeholderTextColor={C.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <Text style={[s.inputLabel, { color: C.textMuted }]}>API SECRET</Text>
                                <TouchableOpacity onPress={() => setShowSecret(v => !v)} activeOpacity={0.7}>
                                    <Text style={{ color: C.accent, fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>
                                        {showSecret ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[s.input, {
                                    backgroundColor: C.inputBg,
                                    borderColor: secFocus ? C.accent : C.inputBorder,
                                    color: C.textPrimary,
                                }]}
                                value={apiSecret}
                                onChangeText={setApiSecret}
                                onFocus={() => setSecFocus(true)}
                                onBlur={() => setSecFocus(false)}
                                placeholder="Paste your API secret…"
                                placeholderTextColor={C.textMuted}
                                secureTextEntry={!showSecret}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                            />

                            <TouchableOpacity
                                style={[s.connectBtn, {
                                    backgroundColor: C.accent,
                                    opacity: saving ? 0.6 : 1,
                                    marginTop: 16,
                                }]}
                                onPress={handleConnect}
                                disabled={saving}
                                activeOpacity={0.8}
                            >
                                {saving
                                    ? <ActivityIndicator color="#000" />
                                    : <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: '#000', letterSpacing: 0.5 }}>
                                        Connect Account
                                    </Text>
                                }
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Appearance ── */}
                    <SectionHeader label="Appearance" C={C} topSpacing />
                    <View style={[s.row, { backgroundColor: C.card, borderTopColor: C.separator, borderBottomColor: C.separator }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: C.textPrimary, fontFamily: 'Inter' }}>Dark Mode</Text>
                            <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Inter', marginTop: 2 }}>
                                {isDark ? 'Dark theme active' : 'Light theme active'}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={handleToggleTheme}
                            trackColor={{ false: C.separator, true: C.accentBg }}
                            thumbColor={isDark ? C.accent : C.textMuted}
                        />
                    </View>

                    {/* ── About ── */}
                    <SectionHeader label="About" C={C} topSpacing />
                    <View style={[s.row, { backgroundColor: C.card, borderTopColor: C.separator, borderBottomColor: C.separator }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: C.textPrimary, fontFamily: 'Inter' }}>
                                BFX Trader
                            </Text>
                            <Text style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Inter', marginTop: 2 }}>
                                Version 1.0.0 · Bitfinex API v2
                            </Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: C.accentBg }]}>
                            <Text style={{ color: C.accent, fontSize: 11, fontFamily: 'Inter', fontWeight: '700' }}>
                                v2 API
                            </Text>
                        </View>
                    </View>

                    {/* Device ID */}
                    {userId && (
                        <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 28, textAlign: 'center', fontFamily: 'Inter', paddingHorizontal: 16 }}>
                            Device ID: {userId}
                        </Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const SectionHeader = ({ label, C, topSpacing }) => (
    <Text style={{
        fontSize: 11, fontWeight: '600', color: C.textMuted, fontFamily: 'Inter',
        letterSpacing: 1.2, textTransform: 'uppercase',
        paddingHorizontal: 16, marginBottom: 0, marginTop: topSpacing ? 28 : 8,
        paddingVertical: 8,
    }}>
        {label}
    </Text>
);

const s = StyleSheet.create({
    pageHeader: {
        paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        borderTopWidth: 1, borderBottomWidth: 1,
    },
    statusDot: {
        width: 9, height: 9, borderRadius: 5,
    },
    smallBtn: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 6, borderWidth: 1,
    },
    inputLabel: {
        fontSize: 10, fontFamily: 'Inter',
        letterSpacing: 1.2, textTransform: 'uppercase',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1.5, borderRadius: 8,
        paddingHorizontal: 14, paddingVertical: 13,
        fontSize: 14, fontFamily: 'Inter',
    },
    connectBtn: {
        borderRadius: 8, paddingVertical: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
    },
});

export default AccountScreen;
