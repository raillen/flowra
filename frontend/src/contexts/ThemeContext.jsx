import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

/**
 * Simplified ThemeProvider - Light mode only
 * Kept for API compatibility with existing components
 */
export const ThemeProvider = ({ children }) => {
    // Always light mode
    const theme = 'light';

    // No-op functions for compatibility
    const setTheme = () => { };
    const toggleTheme = () => { };
    const isDarkTheme = false;
    const themes = [{ id: 'light', name: 'Claro', isDark: false }];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes, isDarkTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);



