import React, { createContext, useContext, useState, useEffect } from 'react';

const AccentColorContext = createContext();

/**
 * Provider for accent color based on selected company
 * Applies CSS variable to document root for global styling
 */
export const AccentColorProvider = ({ children }) => {
    const [accentColor, setAccentColor] = useState('#6366f1');

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--accent-color', accentColor);

        // Convert hex to RGB for use with opacity
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        root.style.setProperty('--accent-color-rgb', `${r} ${g} ${b}`);
    }, [accentColor]);

    return (
        <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
            {children}
        </AccentColorContext.Provider>
    );
};

export const useAccentColor = () => {
    const context = useContext(AccentColorContext);
    if (!context) {
        return { accentColor: '#6366f1', setAccentColor: () => { } };
    }
    return context;
};
