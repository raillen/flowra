import React, { createContext, useContext, useState } from 'react';

const CommandPaletteContext = createContext();

/**
 * CommandPaletteProvider component
 * Provides global access to command palette open state
 */
export const CommandPaletteProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openCommandPalette = () => setIsOpen(true);
    const closeCommandPalette = () => setIsOpen(false);
    const toggleCommandPalette = () => setIsOpen(prev => !prev);

    return (
        <CommandPaletteContext.Provider value={{ isOpen, openCommandPalette, closeCommandPalette, toggleCommandPalette, setIsOpen }}>
            {children}
        </CommandPaletteContext.Provider>
    );
};

export const useCommandPalette = () => {
    const context = useContext(CommandPaletteContext);
    if (!context) {
        throw new Error('useCommandPalette must be used within CommandPaletteProvider');
    }
    return context;
};
