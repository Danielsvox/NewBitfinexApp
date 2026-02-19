import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';

import { getStyles } from './utils';
import ThemeContext from './themes/ThemeContext';

const { width } = Dimensions.get('window');

const NewsComponent = () => {
    const [newsData, setNewsData] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const navigation = useNavigation();
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    const C = theme._colors;

    useEffect(() => {
        axios.get('https://api-pub.bitfinex.com/v2/posts/hist?limit=20&type=1')
            .then(r => { setNewsData(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
                <ActivityIndicator color={C.accent} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.scrollViewNews}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
        >
            {newsData.map((news, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('NewsDetail', { news })}
                >
                    <View style={styles.newsCard}>
                        {/* Category label — replaces the old badge */}
                        <Text style={{
                            color: C.accent, fontSize: 10, fontWeight: '700',
                            fontFamily: 'Inter', letterSpacing: 0.8,
                            textTransform: 'uppercase', marginBottom: 6,
                        }}>
                            Bitfinex News
                        </Text>

                        <Text style={styles.titleNews} numberOfLines={2}>
                            {news[3]}
                        </Text>

                        <RenderHtml
                            contentWidth={width - 60}
                            source={{ html: news[4]?.substring(0, 100) ?? '' }}
                            tagsStyles={styles.snippet}
                        />
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default NewsComponent;
