import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import NewsDetailScreen from './NewsDetailScreen';
import TickerDetailScreen from './TickerDetailScreen';
import TradeScreen from './TradeScreen';
import DepositScreen from './DepositScreen';
import Home from './Home';
import Markets from './MarketsScreen';
import AccountScreen from './Account';
import WalletScreen from './WalletScreen';
import ThemeContext from './themes/ThemeContext';
import darkTheme from './themes/darkTheme';
import { Palette } from './GlobalStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeScreen = () => (
    <Stack.Navigator initialRouteName="HomeInner">
        <Stack.Screen name="HomeInner" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="TickerDetail" component={TickerDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Trade" component={TradeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const MarketsStack = () => (
    <Stack.Navigator initialRouteName="MarketsInner">
        <Stack.Screen name="MarketsInner" component={Markets} options={{ headerShown: false }} />
        <Stack.Screen name="TickerDetail" component={TickerDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Trade" component={TradeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const WalletsStack = () => (
    <Stack.Navigator initialRouteName="WalletInner">
        <Stack.Screen name="WalletInner" component={WalletScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Deposit" component={DepositScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const AccountStack = () => (
    <Stack.Navigator initialRouteName="AccountInner">
        <Stack.Screen name="AccountInner" component={AccountScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const TAB_ICONS = {
    Home:    { name: 'home',                type: 'material-community' },
    Markets: { name: 'chart-bar',           type: 'material-community' },
    Wallet:  { name: 'wallet-outline',      type: 'material-community' },
    Account: { name: 'account-circle-outline', type: 'material-community' },
};

const MainNavigator = () => {
    const { theme } = React.useContext(ThemeContext);
    const isDark = theme === darkTheme;
    const C = isDark ? Palette.dark : Palette.light;

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, size }) => (
                    <Icon
                        name={TAB_ICONS[route.name].name}
                        size={22}
                        color={focused ? C.accent : C.textMuted}
                        type={TAB_ICONS[route.name].type}
                    />
                ),
                tabBarActiveTintColor: C.accent,
                tabBarInactiveTintColor: C.textMuted,
                tabBarStyle: {
                    backgroundColor: C.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: C.separator,
                    paddingTop: 6,
                    paddingBottom: 8,
                    height: 58,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    marginTop: 2,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Markets" component={MarketsStack} />
            <Tab.Screen name="Wallet" component={WalletsStack} />
            <Tab.Screen name="Account" component={AccountStack} />
        </Tab.Navigator>
    );
};

export default MainNavigator;
