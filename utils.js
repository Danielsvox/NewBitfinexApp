// utils.js

import * as Notifications from 'expo-notifications';

export const checkRateLimit = async (response) => {
    if (response.status === 429) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rate Limit Hit",
                body: "You've made too many requests. Please wait and try again later.",
            },
            trigger: null,
        });
        throw new Error('Rate Limit Hit');
    }
    return response;
};

export function tradingPairSlicer(tickerString) {
    // Remove the 't' from the beginning
    const string = tickerString.slice(1);

    // Returns trading pair sliced as an array = ['BASE','QUOTE']
    if (string.length > 6) {
        return string.split(':');
    } else {
        return [string.slice(0, 3), string.slice(3)];
    }
};