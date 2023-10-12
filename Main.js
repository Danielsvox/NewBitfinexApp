import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TickersProvider } from './utils'; // Replace with your actual path
import MainNavigator from './navigator'; // Consider moving your MainNavigator to a separate file
import * as Font from 'expo-font';
export default function Main() {
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        const loadFontAsync = async () => {
            await Font.loadAsync({
                Inter: require('./assets/fonts/Inter-Regular.ttf'),
            });
            setFontLoaded(true);
        };

        loadFontAsync();
    }, []);

    if (!fontLoaded) {
        return null;  // You might want to provide some loading UI here
    }
    return (
        <TickersProvider>
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        </TickersProvider>
    );
}
