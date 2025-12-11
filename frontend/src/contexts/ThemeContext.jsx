import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Available themes
const themes = [
    { id: 'light', name: 'Claro' },
    { id: 'dark', name: 'Escuro' },
    { id: 'dracula', name: 'Dracula', preview: '#bd93f9' },
    { id: 'nord', name: 'Nord', preview: '#88c0d0' },
    { id: 'gruvbox', name: 'Gruvbox', preview: '#fe8019' },
    { id: 'rose-pine', name: 'Rosé Pine', preview: '#eb6f92' },
];

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
        if (theme === 'dark' || theme === 'gruvbox' || theme === 'nord' || theme === 'rose-pine' || theme === 'dracula') {
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
        <ThemeContext.Provider value={{ theme, setTheme: setThemeValue, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

