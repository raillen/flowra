import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Available themes - simplified to light and dark only
const themes = [
    { id: 'light', name: 'Claro' },
    { id: 'dark', name: 'Escuro' },
];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check local storage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            // Only accept light or dark (reset if old theme was saved)
            if (savedTheme === 'light' || savedTheme === 'dark') {
                return savedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; // Default to light
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Set data-theme attribute for CSS variables
        root.setAttribute('data-theme', theme);

        // Toggle 'dark' class for Tailwind 'dark:' prefix compatibility
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const setThemeValue = (newTheme) => {
        // Only allow light or dark
        if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeValue, toggleTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);


