const TRADE_ENDPOINT = 'https://api.bitfinex.com/v2/trades/tBTCUSD/hist';
const CANDLE_ENDPOINT = 'https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testEndpoint(endpoint) {
    let count = 0;
    let banned = false;
    let banStart = 0;
    let endTime = Date.now();

    while (true) {
        const params = new URLSearchParams({
            end: endTime,
            limit: '1'
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);
        count++;

        if (response.status === 429 && !banned) {
            console.log(`Rate limit hit on ${endpoint} after ${count} requests.`);
            banned = true;
            banStart = Date.now();
        }

        if (response.status !== 429 && banned) {
            banned = false;
            const banDuration = (Date.now() - banStart) / 1000; // convert to seconds
            console.log(`Rate limit lifted on ${endpoint} after ${banDuration.toFixed(2)} seconds.`);
            return;
        }

        endTime -= 60 * 1000; // Go back in time by 60 seconds
        await sleep(100); // sleep for 0.1 seconds
    }
}

async function main() {
    await Promise.all([testEndpoint(TRADE_ENDPOINT), testEndpoint(CANDLE_ENDPOINT)]);
}

main();
