import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from "react-native-elements";
import NewsDetailScreen from './NewsDetailScreen';

import TickerDetailScreen from './TickerDetailScreen';
import Home from './Home'
import Markets from './MarketsScreen'
import AccountScreen from './Account';
import ThemeContext from './themes/ThemeContext';
import darkTheme from './themes/darkTheme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//Stack navigator for home screen

const HomeScreen = () => {
    return (
        <Stack.Navigator initialRouteName="HomeInner">
            <Stack.Screen
                name="HomeInner"
                component={Home}
                options={{ headerShown: false, headerTitle: '' }}
            />
            <Stack.Screen
                name="TickerDetail"
                component={TickerDetailScreen}
                options={{ headerShown: false, headerTitle: '' }}
            />
            <Stack.Screen
                name="NewsDetail"
                component={NewsDetailScreen}
                options={{ headerShown: false, headerTitle: '' }}
            />
        </Stack.Navigator>
    );
};

// Stack Navigator for Markets
const MarketsStack = () => {
    return (
        <Stack.Navigator initialRouteName="MarketsInner">
            <Stack.Screen
                name="MarketsInner"
                component={Markets}
                options={{ headerShown: false, headerTitle: '' }}
            />
            <Stack.Screen
                name="TickerDetail"
                component={TickerDetailScreen}
                options={{ headerShown: false, headerTitle: '' }}
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

const AccountStack = () => {
    // TODO: Implement Account Screen
    return (
        <Stack.Navigator initialRouteName="AccountInner">
            <Stack.Screen
                name="AccountInner"
                component={AccountScreen}
                options={{ headerShown: false, headerTitle: '' }}

            />
        </Stack.Navigator>
    );
};

// ... your screen components like HomeScreen, MarketsStack, etc ...

const MainNavigator = () => {
    const { theme } = React.useContext(ThemeContext);

    const isDark = theme === darkTheme;

    return (
        <Tab.Navigator
            initialRouteName="Account"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, size }) => {
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
                    return <Icon name={iconName} size={size} color={isDark ? "white" : "black"} type={'material-community'} />;
                },
                tabBarActiveTintColor: isDark ? 'white' : 'black',
                tabBarInactiveTintColor: isDark ? 'lightgrey' : 'grey',
                tabBarStyle: {
                    display: 'flex',
                    backgroundColor: isDark ? '#1c1c1e' : 'white' // dark background for dark mode
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Markets" component={MarketsStack} />
            <Tab.Screen name="Wallet" component={WalletsScreen} />
            <Tab.Screen name="Account" component={AccountStack} />
        </Tab.Navigator>
    );

};

export default MainNavigator;
