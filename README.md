# NewBitfinexApp

A mobile application that provides an interface for users to interact with Bitfinex trading data, including viewing tickers, news, and more. The application presents a concise dashboard offering an overview of various crypto tickers and related news. It also features a dynamic selection area allowing users to switch between different sections such as Favorites, News, Movers, and Rewards.

## Features

- **Ticker Overview**: Displays the top tickers based on USD volume, sorted in descending order.
- **Dynamic Section Selection**: Scrollable horizontal tab-like sections for quick content navigation.
- **News Integration**: Features a `NewsComponent` that displays relevant news articles related to the Bitfinex trading platform.
- **Responsive Layout**: Uses flexbox for a responsive design that should look good on various device sizes.

## Setup and Running the App

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [Expo CLI](https://expo.dev/tools) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app using Expo:
   ```bash
   expo start
   ```

   This will open a new window in your default web browser displaying a QR code. Scan this QR code with the Expo Go app on your Android or iOS device to see the live app in action.

## Notes & Observations

- **News Component Spacing**: The space between the section selection tabs and the news content seemed a bit excessive during reviews. Possible reasons and solutions were explored, including checking internal component styling and redundant rendering.
  
- **Styles and Layout**: The app heavily relies on the React Native StyleSheet for layout and design. Common practices like flexbox were used for responsive and adaptive UI. Considerations were made for both Android and iOS platforms, ensuring a consistent look and feel.

- **Component Breakdown**: The main component, `Frame`, serves as the central rendering point for the app. It uses conditional rendering based on the selected section to display content. The `TickerCard` component is utilized to display individual ticker information.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

