import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { getStyles } from './utils';
import ThemeContext from './themes/ThemeContext';
const { width, height } = Dimensions.get('window');

const NewsComponent = () => {
    const [newsData, setNewsData] = useState([]);
    const navigation = useNavigation();
    const { theme } = React.useContext(ThemeContext);
    const styles = getStyles(theme)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('https://api-pub.bitfinex.com/v2/posts/hist?limit=20&type=1');
                setNewsData(response.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchNews();
    }, []);

    return (
        <ScrollView style={styles.scrollViewNews}>
            {newsData.map((news, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => {
                        navigation.navigate("NewsDetail", { news: news });
                    }}>

                    <View key={index} style={styles.newsCard}>
                        <Text style={styles.titleNews}>{news[3]}</Text>
                        <RenderHtml contentWidth={width} source={{ html: news[4].substring(0, 100) }} tagsStyles={styles.snippet} />

                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default NewsComponent;
