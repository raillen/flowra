
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Layout, CreditCard, Hash, User } from 'lucide-react'

export default forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = index => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item.id, label: item.label || item.name || item.title })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    const getIcon = (type) => {
        switch (type) {
            case 'project': return <Layout size={14} className="text-blue-500" />;
            case 'board': return <Hash size={14} className="text-green-500" />;
            case 'card': return <CreditCard size={14} className="text-orange-500" />;
            case 'user': return <User size={14} className="text-purple-500" />;
            default: return <Hash size={14} />;
        }
    }

    const getLabel = (type) => {
        switch (type) {
            case 'project': return 'Projeto';
            case 'board': return 'Quadro';
            case 'card': return 'Cartão';
            case 'user': return 'Usuário';
            default: return 'Item';
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-secondary-200 dark:border-slate-700 overflow-hidden min-w-[200px] flex flex-col z-50">
            <div className="text-xs font-semibold text-secondary-400 bg-secondary-50 dark:bg-slate-900/50 px-3 py-1.5 border-b border-secondary-100 dark:border-slate-700">
                Sugestões
            </div>
            {props.items.length ? (
                <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {props.items.map((item, index) => (
                        <button
                            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-secondary-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-700'
                                }`}
                            key={index}
                            onClick={() => selectItem(index)}
                        >
                            <span className="shrink-0 pt-0.5">{getIcon(item.type)}</span>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate font-medium">{item.label || item.name || item.title}</span>
                                <span className="text-[10px] text-secondary-400 uppercase tracking-wider">{getLabel(item.type)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-3 text-sm text-secondary-400 text-center italic">
                    Nenhum resultado encontrado.
                </div>
            )}
        </div>
    )
})
