import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAccentColor } from '../../../../contexts/AccentColorContext';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';

const AppearanceTab = ({ accentColor }) => {
    const { theme, setTheme, themes } = useTheme();
    const { setAccentColor } = useAccentColor();

    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center gap-4 mb-8">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                    style={{ backgroundColor: accentColor + '20', color: accentColor }}
                >
                    <Palette size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Aparência</h2>
                    <p className="text-gray-500 dark:text-gray-400">Personalize a experiência visual do KBSys</p>
                </div>
            </div>

            {/* Theme Selection */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Tema do Sistema</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
                ${theme === t.id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
              `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${theme === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}
                  `}>
                                    {t.id === 'light' && <Sun size={20} />}
                                    {t.id === 'dark' && <Moon size={20} />}
                                    {t.id === 'system' && <Monitor size={20} />}
                                    {!['light', 'dark', 'system'].includes(t.id) && (
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.preview || accentColor }} />
                                    )}
                                </div>
                                {theme === t.id && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <p className={`font-bold ${theme === t.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-200'}`}>
                                {t.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t.id === 'light' ? 'Visual claro e limpo' : t.id === 'dark' ? 'Conforto para baixa luz' : 'Segue as configurações do sistema'}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Accent Color Selection */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Cor de Destaque</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Escolha a cor principal que será usada em botões, links e destaques.
                        </p>
                    </div>
                    <div
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-300"
                        style={{ backgroundColor: accentColor }}
                    >
                        Preview do Botão
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`
                  w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center
                  hover:scale-110 focus:outline-none
                  ${accentColor === color ? 'ring-4 ring-offset-2 ring-gray-200 dark:ring-gray-700 shadow-lg scale-110' : ''}
                `}
                            style={{ backgroundColor: color }}
                        >
                            {accentColor === color && <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />}
                        </button>
                    ))}

                    <div className="relative group">
                        <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden opacity-0 absolute inset-0"
                        />
                        <div
                            className={`
                  w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 
                  flex items-center justify-center text-gray-400 transition-all hover:border-gray-400
                  ${!colors.includes(accentColor) ? 'bg-gray-100 dark:bg-gray-700' : ''}
                `}
                            style={!colors.includes(accentColor) ? { backgroundColor: accentColor } : {}}
                        >
                            {!colors.includes(accentColor) && <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />}
                            {colors.includes(accentColor) && <span className="text-xs font-bold">Custom</span>}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AppearanceTab;
