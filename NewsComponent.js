import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const NewsComponent = () => {
    const [newsData, setNewsData] = useState([]);

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
        <ScrollView style={styles.scrollView}>
            {newsData.map((news, index) => (
                <View key={index} style={styles.newsCard}>
                    <Text style={styles.title}>{news[3]}</Text>
                    <Text style={styles.snippet}>{news[4].substring(0, 100)}...</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        padding: 5
    },
    newsCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    snippet: {
        fontSize: 14,
    }
});

export default NewsComponent;
