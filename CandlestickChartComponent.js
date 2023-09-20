import React from 'react';
import { Dimensions } from 'react-native';
import { CandleStickChart } from 'react-native-chart-kit';

const ChartComponent = ({ candleData }) => {
    console.log(candleData)
    const transformData = () => {
        return candleData.map(candle => ({
            date: new Date(candle[0]).toISOString().slice(0, 10),
            shadowH: candle[3],
            shadowL: candle[4],
            open: candle[1],
            close: candle[2],
        }));
    };

    return (
        <CandleStickChart
            data={{
                labels: [],  // No labels for x-axis
                datasets: [{
                    data: transformData(),
                }],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            yAxisLabel="$"
            chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,  // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
        />
    );
};

export default ChartComponent;
