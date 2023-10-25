import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const { width, height } = Dimensions.get('window');
const NewsDetailScreen = ({ route }) => {
    const { news } = route.params;
    console.log(news[4]);

    return (
        <ScrollView>
            <View style={{
                flex: 1, alignItems: 'center', justifyContent: 'center',
                marginBottom: 5,
            }}>
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    padding: 10
                }}
                >{news[3]}</Text>
                {/* Add more details about the ticker and fetch additional data as required */}
            </View>
            <View style={{ fontSize: 14, padding: 10, textAlign: 'justify' }}>
                <RenderHtml contentWidth={width - 16} source={{ html: news[4] }} />
            </View>
        </ScrollView >

    );
};

export default NewsDetailScreen;
