import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TickersProvider } from './utils'; // Replace with your actual path
import MainNavigator from './navigator'; // Consider moving your MainNavigator to a separate file
import * as Font from 'expo-font';
import ThemeContext from './themes/ThemeContext'; // Make sure you have a ThemeProvider export
import lightTheme from './themes/lightTheme';
import darkTheme from './themes/darkTheme';

export default function Main() {
    const [fontLoaded, setFontLoaded] = useState(false);
    const [theme, setTheme] = useState(lightTheme);  // default to light theme

    // Toggle theme function
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === lightTheme ? darkTheme : lightTheme);
    };

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
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <TickersProvider>
                <NavigationContainer>
                    <MainNavigator />
                </NavigationContainer>
            </TickersProvider>
        </ThemeContext.Provider>
    );

}
