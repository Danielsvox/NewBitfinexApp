import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from "react-native-elements";
import TickerDetailScreen from './TickerDetailScreen';
import App from './App';
import Home from './Home'


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//Stack navigator for home screen

const HomeScreen = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

// Stack Navigator for Markets
const MarketsStack = () => {
    return (
        <Stack.Navigator initialRouteName="Markets">
            <Stack.Screen
                name="Markets"
                component={App}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TickerDetail"
                component={TickerDetailScreen}
                options={{ title: 'Ticker Details' }}
            />
        </Stack.Navigator>
    );
};


const WalletsScreen = () => {
    // TODO: Implement Wallets Screen
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Wallet Screen</Text>
        </View>
    );
};

const AccountScreen = () => {
    // TODO: Implement Account Screen
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Account screen</Text>
        </View>
    );
};

// ... your screen components like HomeScreen, MarketsStack, etc ...

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'Markets') {
                        iconName = focused ? 'chart-line-variant' : 'chart-line-variant';
                    } else if (route.name === 'Wallet') {
                        iconName = focused ? 'wallet' : 'wallet';
                    } else if (route.name === 'Account') {
                        iconName = focused ? 'account' : 'account';
                    }

                    // You can return any component that you like here!
                    return <Icon name={iconName} size={size} color={"grey"} type={'material-community'} />;
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'grey',
                tabBarStyle: { display: 'flex', backgroundColor: '#152330' },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Markets" component={MarketsStack} />
            <Tab.Screen name="Wallet" component={WalletsScreen} />
            <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
    );

};

export default MainNavigator;
