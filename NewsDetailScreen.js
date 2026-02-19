import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import RenderHtml from 'react-native-render-html';
import ThemeContext from './themes/ThemeContext';

const { width } = Dimensions.get('window');

const NewsDetailScreen = ({ route, navigation }) => {
    const { news } = route.params;
    const { theme } = useContext(ThemeContext);
    const C = theme._colors;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
            {/* Back button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.separator }}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ marginRight: 12, padding: 4 }}>
                    <Text style={{ fontSize: 32, lineHeight: 32, marginTop: -4, color: C.accent }}>‹</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.textPrimary, fontFamily: 'Inter' }}>
                    News
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Category label */}
                <Text style={{
                    color: C.accent, fontSize: 10, fontWeight: '700',
                    fontFamily: 'Inter', letterSpacing: 1,
                    textTransform: 'uppercase', marginBottom: 10,
                }}>
                    Bitfinex News
                </Text>

                {/* Title */}
                <Text style={{
                    fontSize: 22, fontWeight: '700', color: C.textPrimary,
                    fontFamily: 'Inter', lineHeight: 30, marginBottom: 16,
                }}>
                    {news[3]}
                </Text>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: C.accent, width: 40, marginBottom: 20 }} />

                {/* Body */}
                <RenderHtml
                    contentWidth={width - 40}
                    source={{ html: news[4] ?? '' }}
                    tagsStyles={{
                        p:    { color: C.textSecondary, fontSize: 15, lineHeight: 25, marginBottom: 12 },
                        a:    { color: C.accent },
                        h1:   { color: C.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 8 },
                        h2:   { color: C.textPrimary, fontSize: 17, fontWeight: '600', marginBottom: 8 },
                        h3:   { color: C.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 6 },
                        li:   { color: C.textSecondary, fontSize: 15, lineHeight: 24 },
                        body: { backgroundColor: C.background },
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewsDetailScreen;
