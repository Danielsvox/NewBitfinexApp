// Design tokens — single source of truth for the whole app

export const FontFamily = {
    Inter: 'Inter',
};

export const FontSize = {
    size_xs: 11,
    size_sm: 12,
    size_base: 14,
    size_md: 16,
    size_lg: 18,
    size_xl: 22,
    size_xxl: 30,
    size_xxxl: 36,
    // Legacy aliases kept for backward-compat
    size_xl_legacy: 20,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
};

export const Radius = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 999,
};

// Binance-inspired palette
export const Palette = {
    dark: {
        background:    '#0B0E11',
        surface:       '#161A1E',
        card:          '#1E2026',
        cardBorder:    '#2B3139',
        accent:        '#F0B90B',
        accentBg:      'rgba(240,185,11,0.12)',
        positive:      '#03A66D',
        positiveBg:    'rgba(3,166,109,0.12)',
        negative:      '#CF304A',
        negativeBg:    'rgba(207,48,74,0.12)',
        textPrimary:   '#EAECEF',
        textSecondary: '#848E9C',
        textMuted:     '#474D57',
        separator:     '#2B3139',
        tabBar:        '#0B0E11',
        buy:           '#03A66D',
        sell:          '#CF304A',
        // Extra tokens
        overlay:       'rgba(0,0,0,0.6)',
        inputBg:       '#161A1E',
        inputBorder:   '#2B3139',
    },
    light: {
        background:    '#F0F2F5',
        surface:       '#FFFFFF',
        card:          '#FFFFFF',
        cardBorder:    '#E8EAED',
        accent:        '#C99400',
        accentBg:      'rgba(201,148,0,0.10)',
        positive:      '#02924E',
        positiveBg:    'rgba(2,146,78,0.10)',
        negative:      '#B3283F',
        negativeBg:    'rgba(179,40,63,0.10)',
        textPrimary:   '#1E2026',
        textSecondary: '#5A6478',
        textMuted:     '#9CA3AF',
        separator:     '#E8EAED',
        tabBar:        '#FFFFFF',
        buy:           '#02924E',
        sell:          '#B3283F',
        // Extra tokens
        overlay:       'rgba(0,0,0,0.4)',
        inputBg:       '#F7F8FA',
        inputBorder:   '#E0E3E8',
    },
};

// Subtle shadow — less prominent in dark UI
export const shadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
};

// Accent glow for highlighted elements
export const accentGlow = {
    shadowColor: '#F0B90B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
};

// Legacy Color / Border exports so old imports don't break
export const Color = {
    colorGray_100: '#848E9C',
    colorGray_200: '#2B3139',
    colorCrimson:  '#CF304A',
    colorGainsboro: '#E8EAED',
    colorWhite:    '#fff',
    colorRoyalblue: '#1890FF',
    colorForestgreen: '#03A66D',
};

export const Border = {
    br_5xl: 16,
    br_3xs: 8,
    br_2xl_5: 12,
};
