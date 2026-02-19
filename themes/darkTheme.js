import { Dimensions } from 'react-native';
import { FontFamily, Palette, shadow } from '../GlobalStyles';

const { width, height } = Dimensions.get('window');
const C = Palette.dark;

const darkTheme = {
    _colors: C,

    // ─── Screens ──────────────────────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    view: {
        flex: 1,
        backgroundColor: C.background,
    },

    // ─── Balance header ───────────────────────────────────────────────────────
    text: {
        paddingHorizontal: 20,
        paddingTop: height * 0.06,
        paddingBottom: 4,
    },
    totalBalance: {
        color: C.textMuted,
        fontSize: 11,
        fontFamily: FontFamily.Inter,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    text1: {
        color: C.textPrimary,
        fontSize: 32,
        fontWeight: '700',
        fontFamily: FontFamily.Inter,
        letterSpacing: -0.5,
        fontVariant: ['tabular-nums'],
    },
    textFlexBox: {
        textAlign: 'left',
    },

    // ─── Horizontal ticker cards ──────────────────────────────────────────────
    scrollView: {
        flexGrow: 0,
    },
    section: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    card: {
        width: width * 0.52,
        height: height * 0.22,
        marginRight: 10,
        backgroundColor: C.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.cardBorder,
        overflow: 'hidden',
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 4,
    },
    logo: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.surface,
    },
    tokenName: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '600',
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        flex: 1,
    },
    graphPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    lineChart: {
        flex: 1,
    },
    bottomSection: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    dailyVolume: {
        fontSize: 15,
        fontWeight: '700',
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        fontVariant: ['tabular-nums'],
    },
    lastTradedPrice: {
        fontSize: 11,
        color: C.textSecondary,
        marginTop: 2,
        fontFamily: FontFamily.Inter,
    },

    // ─── Section pill tabs (Binance underline style) ──────────────────────────
    scrollSelections: {
        flexGrow: 0,
        paddingHorizontal: 16,
        paddingVertical: 0,
        borderBottomWidth: 1,
        borderBottomColor: C.separator,
    },
    selections: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 4,
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionsText: {
        color: C.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        fontFamily: FontFamily.Inter,
    },
    selectedSelection: {
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomColor: C.accent,
    },
    selectedSelectionText: {
        color: C.accent,
        fontWeight: '600',
    },
    contentArea: {
        flex: 1,
    },

    // ─── Ticker list (TickerComponent) ────────────────────────────────────────
    scrollViewTickers: {
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    moversCard: {
        backgroundColor: C.card,
        borderRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: C.separator,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        marginLeft: 10,
    },
    topSectionTickers: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    percentageChange: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: FontFamily.Inter,
        fontVariant: ['tabular-nums'],
    },
    positiveValue: {
        color: C.positive,
        fontSize: 13,
        fontWeight: '600',
    },
    negativeValue: {
        color: C.negative,
        fontSize: 13,
        fontWeight: '600',
    },

    // ─── News ─────────────────────────────────────────────────────────────────
    scrollViewNews: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    newsCard: {
        backgroundColor: C.card,
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: C.cardBorder,
        borderLeftWidth: 3,
        borderLeftColor: C.accent,
    },
    titleNews: {
        fontSize: 14,
        fontWeight: '600',
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        marginBottom: 6,
        lineHeight: 20,
    },
    snippet: {
        p:    { color: C.textSecondary, fontSize: 13, lineHeight: 20, margin: 0 },
        a:    { color: C.accent },
        body: { margin: 0, padding: 0 },
    },

    // ─── Account screen ───────────────────────────────────────────────────────
    accountContainer: {
        flex: 1,
        backgroundColor: C.background,
        paddingHorizontal: 0,
        paddingTop: height * 0.06,
    },
    accountTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 0,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: C.separator,
        marginBottom: 0,
    },
    settingsLabel: {
        fontSize: 14,
        color: C.textPrimary,
        fontFamily: FontFamily.Inter,
        fontWeight: '500',
    },
    settingsSub: {
        fontSize: 12,
        color: C.textSecondary,
        marginTop: 2,
        fontFamily: FontFamily.Inter,
    },

    // ─── Shared utils ─────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: C.background,
        borderBottomWidth: 1,
        borderBottomColor: C.separator,
    },
    icon: { width: 30, height: 30 },
    home: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: FontFamily.Inter,
        color: C.textPrimary,
    },
};

export default darkTheme;
