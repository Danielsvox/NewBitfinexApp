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
    const [theme, setTheme] = useState(darkTheme);  // default to dark theme

    // Toggle theme — can be called with no arg (flip) or a specific theme
    const toggleTheme = (specificTheme) => {
        if (specificTheme && (specificTheme === lightTheme || specificTheme === darkTheme)) {
            setTheme(specificTheme);
        } else {
            setTheme(prev => prev === lightTheme ? darkTheme : lightTheme);
        }
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
