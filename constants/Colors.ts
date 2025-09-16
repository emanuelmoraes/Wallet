/**
 * Modern financial app color palette inspired by clean and professional design trends.
 * Colors optimized for trust, security, and excellent user experience.
 */

// Primary colors based on modern financial app design
export const primaryGreen = '#00D4AA';
export const primaryGreenDark = '#00B896';
export const secondaryGreen = '#4FFFDF';
export const backgroundGray = '#F8FAFB';
export const cardBackground = '#FFFFFF';
export const darkBackground = '#1A1D23';
export const darkCard = '#252932';

// Semantic colors
export const successColor = '#00D4AA';
export const errorColor = '#FF5A5A';
export const warningColor = '#FFB946';
export const infoColor = '#3B82F6';

export const Colors = {
  light: {
    // Main brand colors
    primary: primaryGreen,
    primaryContainer: primaryGreen + '15',
    secondary: secondaryGreen,
    secondaryContainer: secondaryGreen + '15',
    
    // Background and surfaces
    background: backgroundGray,
    surface: cardBackground,
    surfaceVariant: '#F1F5F9',
    
    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    
    // UI elements
    tint: primaryGreen,
    icon: '#64748B',
    iconActive: primaryGreen,
    border: '#E2E8F0',
    divider: '#F1F5F9',
    
    // Tab navigation
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryGreen,
    tabBackground: cardBackground,
    
    // Semantic colors
    success: successColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    
    // Gradients
    gradientStart: primaryGreen,
    gradientEnd: secondaryGreen,
    
    // Shadows
    shadow: '#000000',
    shadowOpacity: 0.08,
  },
  dark: {
    // Main brand colors
    primary: primaryGreen,
    primaryContainer: primaryGreen + '20',
    secondary: secondaryGreen,
    secondaryContainer: secondaryGreen + '20',
    
    // Background and surfaces
    background: darkBackground,
    surface: darkCard,
    surfaceVariant: '#2A2E37',
    
    // Text colors
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    
    // UI elements
    tint: primaryGreen,
    icon: '#94A3B8',
    iconActive: primaryGreen,
    border: '#374151',
    divider: '#2A2E37',
    
    // Tab navigation
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryGreen,
    tabBackground: darkCard,
    
    // Semantic colors
    success: successColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    
    // Gradients
    gradientStart: primaryGreen,
    gradientEnd: secondaryGreen,
    
    // Shadows
    shadow: '#000000',
    shadowOpacity: 0.25,
  },
};
