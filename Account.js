import React, { useEffect } from 'react';
import { View, Text, Switch, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeContext from './themes/ThemeContext';
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';  // Assuming you have a lightTheme
import { getStyles } from './utils'

const THEME_STORAGE_KEY = 'user_theme_preference';

const AccountScreen = () => {
    const { theme, toggleTheme } = React.useContext(ThemeContext);  // Assuming you have a setTheme function in your context

    useEffect(() => {
        // Retrieve the user's theme preference from AsyncStorage
        const loadThemeFromStorage = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme) {
                    console.log(`Loaded from storage: ${storedTheme}`);

                    toggleTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
                } else {
                    console.log("Loaded from appareance");
                    // If there's no theme in storage, use the user's system preference
                    const colorScheme = Appearance.getColorScheme();
                    toggleTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
                }
            } catch (error) {
                console.error("Error loading theme preference:", error);
            }
        };

        loadThemeFromStorage();
    }, []);

    const handleToggleTheme = async (value) => {
        const newTheme = value ? darkTheme : lightTheme;
        toggleTheme(newTheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, value ? 'dark' : 'light');
            console.log(`Preference set to: ${value}`);

        } catch (error) {
            console.error("Error saving theme preference:", error);
        }
    };

    const styles = getStyles(theme);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Account screen</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <Text style={styles.text}>Dark Mode: </Text>
                <Switch
                    value={theme === darkTheme}
                    onValueChange={handleToggleTheme}
                />
            </View>
        </View>
    );
};

export default AccountScreen;
