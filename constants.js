import Constants from 'expo-constants';

/**
 * The only value you ever need to change.
 * Must match PORT in backend/.env
 */
export const BACKEND_PORT = 8000;

/**
 * Auto-detects the machine's local IP from the Expo dev server so you never
 * have to hardcode an IP address.
 *
 * How it works:
 *   Expo injects the dev-server address as Constants.expoConfig.hostUri
 *   (e.g. "192.168.1.42:8081").  We strip the Expo port and replace it
 *   with BACKEND_PORT.
 *
 * Fallback chain:
 *   1. Expo hostUri  → works in Expo Go and dev builds on a real device
 *   2. localhost     → works in iOS simulator / web
 */
function buildBackendUrl() {
    const hostUri =
        Constants.expoConfig?.hostUri ??       // SDK 46+
        Constants.manifest2?.extra?.expoClient?.hostUri ?? // older EAS
        Constants.manifest?.debuggerHost;      // legacy

    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:${BACKEND_PORT}`;
    }

    // Production build or emulator — fall back to localhost
    return `http://localhost:${BACKEND_PORT}`;
}

export const BACKEND_URL = buildBackendUrl();
