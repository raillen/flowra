import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check local storage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
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
        // Remove class based dark mode if present to rely on data-theme
        root.classList.remove('dark');

        // Set data-theme attribute for CSS variables
        root.setAttribute('data-theme', theme);

        // Also toggle 'dark' class for Tailwind 'dark:' prefix compatibility if needed (optional with this new system but good for legacy)
        if (theme === 'dark' || theme === 'gruvbox' || theme === 'nord' || theme === 'rose-pine') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const setThemeValue = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeValue }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
