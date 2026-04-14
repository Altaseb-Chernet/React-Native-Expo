/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0f766e';
const tintColorDark = '#7dd3fc';

export const Colors = {
  light: {
    text: '#172033',
    background: '#f5f1ea',
    surface: '#fffaf3',
    surfaceMuted: '#f0e9df',
    border: '#ddd2c4',
    tint: tintColorLight,
    icon: '#64707d',
    tabIconDefault: '#64707d',
    tabIconSelected: tintColorLight,
    success: '#2f855a',
    warning: '#b45309',
    danger: '#c2410c',
    overlay: 'rgba(15, 118, 110, 0.12)',
  },
  dark: {
    text: '#edf2f7',
    background: '#0b1220',
    surface: '#11192a',
    surfaceMuted: '#182334',
    border: '#263246',
    tint: tintColorDark,
    icon: '#a8b3c4',
    tabIconDefault: '#a8b3c4',
    tabIconSelected: tintColorDark,
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#fb923c',
    overlay: 'rgba(125, 211, 252, 0.14)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
