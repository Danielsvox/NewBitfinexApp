import { Dimensions } from 'react-native';
import { Color, FontSize, FontFamily } from "../GlobalStyles";
const { width, height } = Dimensions.get('window');


const darkTheme = {
    // Body styling
    container: {
        backgroundColor: '#121212',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Text elements styling
    text: {
        color: '#E0E0E0',
    },
    view: {
        flex: 1,
        backgroundColor: '#121212',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: height * 0.01, // 1% of screen height
    },

    icon: {
        width: 30, // Or appropriate size
        height: 30, // Or appropriate size
    },
    home: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: FontFamily.Inter,
        letterSpacing: 1,
        color: "#E0E0E0",
    },
    balanceText: {
        padding: 5,
        alignItems: 'flex-start', // Aligns children to the start
    },
    text1: {
        padding: 5,
        fontSize: 30,
        fontWeight: "500",
        textAlign: "left",

        color: "#E0E0E0",
        fontFamily: FontFamily.sFProText,
        letterSpacing: 1,
    },
    textFlexBox: {
        textAlign: "left",
        left: "1%",
    },
    totalBalance: {
        padding: 5,
        left: '1%',
        color: "#E0E0E0",
        fontSize: FontSize.size_xs,
        textAlign: "left",
        fontWeight: "500",
        fontFamily: FontFamily.sFProText,
        letterSpacing: 1,
    },
    scrollView: {
        flex: 1, // Take the remaining available space
    },
    section: {
        flexDirection: 'row', // To layout cards horizontally
        overflow: 'scroll', // To allow scrolling
    },
    card: {
        width: width * 0.7, // 60% of screen width
        height: height * 0.32, // 25% of screen height
        margin: width * 0.02, // 2% of screen width
        backgroundColor: '#1F1F1F',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: height * 0.005 }, // 0.5% of screen height
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: height * 0.01,
        color: "#E0E0E0",
    },
    logo: {
        width: width * 0.1, // 10% of screen width
        height: width * 0.1, // keeping it square
        borderRadius: width * 0.05, // half of logo width
    },
    tokenName: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: "#E0E0E0",
    },
    graphPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Padding to ensure the graph does not touch the edges of the card
    },
    bottomSection: {
        padding: 10,
        color: "#E0E0E0",
    },
    dailyVolume: {
        fontSize: 14,
        color: 'green',
    },
    lastTradedPrice: {
        fontSize: 14,
        color: "#E0E0E0",
    },
    scrollSelections: {
        flex: 1,
        height: height * 0.2,

    },
    selections: {
        width: width * 0.2, // 20% of screen width
        height: height * 0.05, // 5% of screen height
        margin: width * 0.02,
        backgroundColor: '#1F1F1F',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: height * 0.005 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    selectionsText: {
        color: "#E0E0E0",
        fontFamily: FontFamily.Inter,
    },
    selectedSelection: {
        backgroundColor: '#2C66CB', // Replace 'yourSelectedColor' with the desired color for the selected section
    },
    selectedSelectionText: {
        color: 'white',
    },
    contentArea: {
        flex: 1, // Takes up remaining vertical space
        marginTop: -200, // or an appropriate value
    },

    scrollViewTickers: {
        padding: 5
    },
    moversCard: {
        backgroundColor: '#1F1F1F',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10,
        color: "#E0E0E0",
    },
    topSectionTickers: {
        alignItems: "center",
        flexDirection: 'row',
        padding: height * 0.01,
        justifyContent: "space-between",
        color: "#E0E0E0",
    },
    positiveValue: {
        color: 'green',
        fontSize: 18,
        fontWeight: 'bold',
    },
    negativeValue: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },


    scrollViewNews: {
        padding: 5
    },
    newsCard: {
        backgroundColor: '#1F1F1F',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titleNews: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: "#E0E0E0",
    },
    snippet: {
        p: { color: '#E0E0E0' },
    }

};

export default darkTheme;
