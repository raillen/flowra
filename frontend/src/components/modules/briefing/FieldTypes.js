/**
 * Field Types Configuration
 * Defines all available field types for the briefing template builder
 * 
 * @module briefing/FieldTypes
 */

import {
    Type,
    AlignLeft,
    AlignJustify,
    Image,
    List,
    Hash,
    Sliders,
    CircleDot,
    ToggleLeft,
    CheckSquare,
    Tags,
    Search,
    ChevronsUpDown,
    Calendar,
    Clock,
    GalleryHorizontalEnd,
    BarChart3,
    FileCheck,
    AlertCircle,
    Flag,
    Folder,
    User,
    MessageSquare,
    Layers,
    Star,
    Upload,
    Palette,
    MapPin,
    Phone,
    Mail,
    Link,
    CreditCard,
    FileText,
    Minus
} from 'lucide-react';

// ============================================
// FIELD CATEGORIES
// ============================================

export const FIELD_CATEGORIES = {
    layout: {
        id: 'layout',
        label: 'Layout',
        icon: Layers,
        color: 'indigo'
    },
    text: {
        id: 'text',
        label: 'Texto',
        icon: Type,
        color: 'blue'
    },
    number: {
        id: 'number',
        label: 'Números',
        icon: Hash,
        color: 'green'
    },
    selection: {
        id: 'selection',
        label: 'Seleção Única',
        icon: CircleDot,
        color: 'purple'
    },
    multiselect: {
        id: 'multiselect',
        label: 'Seleção Múltipla',
        icon: CheckSquare,
        color: 'pink'
    },
    datetime: {
        id: 'datetime',
        label: 'Data e Hora',
        icon: Calendar,
        color: 'orange'
    },
    media: {
        id: 'media',
        label: 'Mídia e Arquivos',
        icon: Image,
        color: 'cyan'
    },
    workflow: {
        id: 'workflow',
        label: 'Fluxo de Trabalho',
        icon: FileCheck,
        color: 'yellow'
    },
    advanced: {
        id: 'advanced',
        label: 'Avançado',
        icon: Search,
        color: 'slate'
    }
};

// ============================================
// FIELD TYPES
// ============================================

export const FIELD_TYPES = {
    // ----------------------------------------
    // LAYOUT
    // ----------------------------------------
    section: {
        type: 'section',
        label: 'Nova Seção',
        description: 'Agrupa perguntas em uma seção',
        icon: Layers,
        category: 'layout',
        hasOptions: false,
        defaultValue: null,
        config: {
            label: 'Nova Seção',
            description: ''
        }
    },
    divider: {
        type: 'divider',
        label: 'Divisor',
        description: 'Linha horizontal de separação',
        icon: Minus,
        category: 'layout',
        hasOptions: false,
        defaultValue: null,
        config: {}
    },
    description_block: {
        type: 'description_block',
        label: 'Bloco de Texto',
        description: 'Texto explicativo (não é um campo)',
        icon: FileText,
        category: 'layout',
        hasOptions: false,
        defaultValue: null,
        config: {
            content: ''
        }
    },

    // ----------------------------------------
    // TEXT FIELDS
    // ----------------------------------------
    text: {
        type: 'text',
        label: 'Texto Simples',
        description: 'Campo de texto de uma linha',
        icon: AlignLeft,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            placeholder: '',
            minLength: null,
            maxLength: null,
            pattern: null
        }
    },
    textarea: {
        type: 'textarea',
        label: 'Caixa de Texto',
        description: 'Campo de texto multilinha',
        icon: AlignJustify,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            placeholder: '',
            rows: 4,
            minLength: null,
            maxLength: null
        }
    },
    email: {
        type: 'email',
        label: 'Email',
        description: 'Campo com validação de email',
        icon: Mail,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            placeholder: 'exemplo@email.com'
        }
    },
    phone: {
        type: 'phone',
        label: 'Telefone',
        description: 'Campo com máscara de telefone',
        icon: Phone,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            placeholder: '(00) 00000-0000',
            mask: 'phone'
        }
    },
    url: {
        type: 'url',
        label: 'URL / Link',
        description: 'Campo com validação de URL',
        icon: Link,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            placeholder: 'https://'
        }
    },
    cpf_cnpj: {
        type: 'cpf_cnpj',
        label: 'CPF / CNPJ',
        description: 'Campo com máscara e validação',
        icon: CreditCard,
        category: 'text',
        hasOptions: false,
        defaultValue: '',
        config: {
            allowBoth: true
        }
    },

    // ----------------------------------------
    // NUMBER FIELDS
    // ----------------------------------------
    number: {
        type: 'number',
        label: 'Número',
        description: 'Campo numérico',
        icon: Hash,
        category: 'number',
        hasOptions: false,
        defaultValue: null,
        config: {
            min: null,
            max: null,
            step: 1,
            placeholder: '0'
        }
    },
    currency: {
        type: 'currency',
        label: 'Valor Monetário',
        description: 'Campo de valor em R$',
        icon: CreditCard,
        category: 'number',
        hasOptions: false,
        defaultValue: null,
        config: {
            currency: 'BRL',
            min: 0
        }
    },
    range: {
        type: 'range',
        label: 'Range / Slider',
        description: 'Slider com valor numérico',
        icon: Sliders,
        category: 'number',
        hasOptions: false,
        defaultValue: 50,
        config: {
            min: 0,
            max: 100,
            step: 1,
            showValue: true
        }
    },
    rating: {
        type: 'rating',
        label: 'Avaliação',
        description: 'Escala de 1-5 estrelas',
        icon: Star,
        category: 'number',
        hasOptions: false,
        defaultValue: null,
        config: {
            maxStars: 5,
            allowHalf: false
        }
    },

    // ----------------------------------------
    // SINGLE SELECTION
    // ----------------------------------------
    select: {
        type: 'select',
        label: 'Dropdown',
        description: 'Lista suspensa de opções',
        icon: ChevronsUpDown,
        category: 'selection',
        hasOptions: true,
        defaultValue: null,
        config: {
            options: ['Opção 1', 'Opção 2', 'Opção 3'],
            placeholder: 'Selecione...'
        }
    },
    radio: {
        type: 'radio',
        label: 'Radio Buttons',
        description: 'Botões de escolha única',
        icon: CircleDot,
        category: 'selection',
        hasOptions: true,
        defaultValue: null,
        config: {
            options: ['Opção 1', 'Opção 2', 'Opção 3'],
            layout: 'vertical' // vertical | horizontal
        }
    },
    toggle: {
        type: 'toggle',
        label: 'Toggle / Switch',
        description: 'Botão liga/desliga',
        icon: ToggleLeft,
        category: 'selection',
        hasOptions: false,
        defaultValue: false,
        config: {
            labelOn: 'Sim',
            labelOff: 'Não'
        }
    },

    // ----------------------------------------
    // MULTIPLE SELECTION
    // ----------------------------------------
    checkbox: {
        type: 'checkbox',
        label: 'Checkboxes',
        description: 'Lista com múltipla seleção',
        icon: CheckSquare,
        category: 'multiselect',
        hasOptions: true,
        defaultValue: [],
        config: {
            options: ['Opção 1', 'Opção 2', 'Opção 3'],
            layout: 'vertical',
            minSelect: null,
            maxSelect: null
        }
    },
    multiselect: {
        type: 'multiselect',
        label: 'Multi-Select',
        description: 'Dropdown com múltipla seleção',
        icon: List,
        category: 'multiselect',
        hasOptions: true,
        defaultValue: [],
        config: {
            options: ['Opção 1', 'Opção 2', 'Opção 3'],
            placeholder: 'Selecione várias...'
        }
    },
    tags: {
        type: 'tags',
        label: 'Tags / Chips',
        description: 'Entrada de tags com autocomplete',
        icon: Tags,
        category: 'multiselect',
        hasOptions: true,
        defaultValue: [],
        config: {
            options: [], // Predefined suggestions
            allowCustom: true,
            maxTags: null
        }
    },

    // ----------------------------------------
    // DATE & TIME
    // ----------------------------------------
    date: {
        type: 'date',
        label: 'Data',
        description: 'Seletor de data',
        icon: Calendar,
        category: 'datetime',
        hasOptions: false,
        defaultValue: null,
        config: {
            minDate: null,
            maxDate: null,
            format: 'DD/MM/YYYY'
        }
    },
    time: {
        type: 'time',
        label: 'Hora',
        description: 'Seletor de horário',
        icon: Clock,
        category: 'datetime',
        hasOptions: false,
        defaultValue: null,
        config: {
            format: '24h', // 12h | 24h
            step: 15 // minutes
        }
    },
    datetime: {
        type: 'datetime',
        label: 'Data e Hora',
        description: 'Seletor combinado',
        icon: Calendar,
        category: 'datetime',
        hasOptions: false,
        defaultValue: null,
        config: {
            minDate: null,
            maxDate: null
        }
    },

    // ----------------------------------------
    // MEDIA & FILES
    // ----------------------------------------
    moodboard: {
        type: 'moodboard',
        label: 'Moodboard',
        description: 'Upload múltiplo de imagens',
        icon: GalleryHorizontalEnd,
        category: 'media',
        hasOptions: false,
        defaultValue: [],
        config: {
            maxFiles: 10,
            maxSizeMB: 5,
            acceptedTypes: ['image/*']
        }
    },
    file: {
        type: 'file',
        label: 'Upload de Arquivo',
        description: 'Upload de arquivo único',
        icon: Upload,
        category: 'media',
        hasOptions: false,
        defaultValue: null,
        config: {
            maxSizeMB: 10,
            acceptedTypes: ['*/*']
        }
    },
    image_slider: {
        type: 'image_slider',
        label: 'Slider de Imagens',
        description: 'Galeria com navegação',
        icon: GalleryHorizontalEnd,
        category: 'media',
        hasOptions: false,
        defaultValue: [],
        config: {
            maxImages: 5
        }
    },
    color: {
        type: 'color',
        label: 'Cor',
        description: 'Seletor de cor',
        icon: Palette,
        category: 'media',
        hasOptions: false,
        defaultValue: '#6366f1',
        config: {
            presets: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
        }
    },

    // ----------------------------------------
    // WORKFLOW FIELDS
    // ----------------------------------------
    terms: {
        type: 'terms',
        label: 'Aceite de Termos',
        description: 'Checkbox de concordância',
        icon: FileCheck,
        category: 'workflow',
        hasOptions: false,
        defaultValue: false,
        config: {
            text: 'Aceito os termos e condições',
            linkText: 'Ler termos',
            linkUrl: ''
        }
    },
    confirmation: {
        type: 'confirmation',
        label: 'Confirmação',
        description: 'Campo de confirmação com alerta',
        icon: AlertCircle,
        category: 'workflow',
        hasOptions: false,
        defaultValue: false,
        config: {
            message: 'Tem certeza?',
            confirmText: 'Confirmar'
        }
    },
    priority: {
        type: 'priority',
        label: 'Prioridade',
        description: 'Seletor de prioridade',
        icon: Flag,
        category: 'workflow',
        hasOptions: false,
        defaultValue: 'media',
        config: {
            options: [
                { value: 'baixa', label: 'Baixa', color: '#22c55e' },
                { value: 'media', label: 'Média', color: '#eab308' },
                { value: 'alta', label: 'Alta', color: '#ef4444' },
                { value: 'urgente', label: 'Urgente', color: '#dc2626' }
            ]
        }
    },
    category: {
        type: 'category',
        label: 'Categoria',
        description: 'Seletor de categoria com ícones',
        icon: Folder,
        category: 'workflow',
        hasOptions: true,
        defaultValue: null,
        config: {
            options: ['Design', 'Desenvolvimento', 'Marketing', 'Vendas']
        }
    },
    assignee: {
        type: 'assignee',
        label: 'Responsável',
        description: 'Seletor de usuário',
        icon: User,
        category: 'workflow',
        hasOptions: false,
        defaultValue: null,
        config: {
            multiple: false,
            includeGroups: false
        }
    },
    comments: {
        type: 'comments',
        label: 'Comentários',
        description: 'Área de comentários',
        icon: MessageSquare,
        category: 'workflow',
        hasOptions: false,
        defaultValue: [],
        config: {
            maxComments: null,
            allowReplies: true
        }
    },
    progress: {
        type: 'progress',
        label: 'Barra de Progresso',
        description: 'Indicador de progresso',
        icon: BarChart3,
        category: 'workflow',
        hasOptions: false,
        defaultValue: 0,
        config: {
            showPercentage: true,
            color: '#6366f1'
        }
    },

    // ----------------------------------------
    // ADVANCED
    // ----------------------------------------
    autocomplete: {
        type: 'autocomplete',
        label: 'Autocomplete',
        description: 'Campo com sugestões',
        icon: Search,
        category: 'advanced',
        hasOptions: true,
        defaultValue: '',
        config: {
            options: [],
            allowCustom: true,
            minChars: 2
        }
    },
    combobox: {
        type: 'combobox',
        label: 'Combobox',
        description: 'Dropdown com busca',
        icon: ChevronsUpDown,
        category: 'advanced',
        hasOptions: true,
        defaultValue: null,
        config: {
            options: [],
            searchable: true
        }
    },
    location: {
        type: 'location',
        label: 'Localização',
        description: 'Campo de endereço/mapa',
        icon: MapPin,
        category: 'advanced',
        hasOptions: false,
        defaultValue: null,
        config: {
            showMap: true,
            useCep: true
        }
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get fields grouped by category
 */
export const getFieldsByCategory = () => {
    const grouped = {};

    Object.values(FIELD_CATEGORIES).forEach(cat => {
        grouped[cat.id] = {
            ...cat,
            fields: Object.values(FIELD_TYPES).filter(f => f.category === cat.id)
        };
    });

    return grouped;
};

/**
 * Create a new field instance
 */
export const createField = (type) => {
    const fieldType = FIELD_TYPES[type];
    if (!fieldType) return null;

    return {
        id: crypto.randomUUID(),
        type,
        label: fieldType.label,
        required: false,
        visible: true,
        visibleIf: null, // Conditional logic
        ...fieldType.config
    };
};

/**
 * Get field type config
 */
export const getFieldType = (type) => {
    return FIELD_TYPES[type] || null;
};

/**
 * Validate field value
 */
export const validateField = (field, value) => {
    const errors = [];

    // Required check
    if (field.required) {
        if (value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0)) {
            errors.push('Este campo é obrigatório');
        }
    }

    // Type-specific validation
    const fieldType = FIELD_TYPES[field.type];
    if (fieldType && value) {
        switch (field.type) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push('Email inválido');
                }
                break;
            case 'url':
                try {
                    new URL(value);
                } catch {
                    errors.push('URL inválida');
                }
                break;
            case 'phone':
                if (!/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(value.replace(/\s/g, ''))) {
                    errors.push('Telefone inválido');
                }
                break;
            case 'cpf_cnpj':
                // Basic length check
                const cleaned = value.replace(/\D/g, '');
                if (cleaned.length !== 11 && cleaned.length !== 14) {
                    errors.push('CPF/CNPJ inválido');
                }
                break;
            case 'number':
            case 'currency':
                if (field.min !== null && value < field.min) {
                    errors.push(`Valor mínimo: ${field.min}`);
                }
                if (field.max !== null && value > field.max) {
                    errors.push(`Valor máximo: ${field.max}`);
                }
                break;
            case 'text':
            case 'textarea':
                if (field.minLength && value.length < field.minLength) {
                    errors.push(`Mínimo ${field.minLength} caracteres`);
                }
                if (field.maxLength && value.length > field.maxLength) {
                    errors.push(`Máximo ${field.maxLength} caracteres`);
                }
                break;
        }
    }

    return errors;
};

export default FIELD_TYPES;
