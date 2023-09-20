import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TickerDetailScreen from './TickerDetailScreen';  // Adjust the path accordingly
import { fetchCoinGeckoData } from './coinGeckoUtils';
import App from './App';  // Adjust the path if your App.js is in a different directory
import { enableScreens } from 'react-native-screens';
enableScreens();

const Stack = createStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={App} options={{ title: 'Bitfinex App' }} />
            <Stack.Screen name="TickerDetail" component={TickerDetailScreen} options={{ title: 'Ticker Details' }} />
        </Stack.Navigator>
    );
};

export default function Main() {
    return (
        <NavigationContainer>
            <MainNavigator />
        </NavigationContainer>
    );
}
