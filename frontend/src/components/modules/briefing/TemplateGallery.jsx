/**
 * Template Gallery Component
 * Pre-built templates to start quickly
 * 
 * @module briefing/TemplateGallery
 */

import React, { useState } from 'react';
import {
    X, FileText, Users, Star, MessageSquare,
    Briefcase, Calendar, CheckCircle, Palette,
    ShoppingCart, Heart, Zap, BookOpen
} from 'lucide-react';

// Pre-built template definitions
const TEMPLATE_PRESETS = [
    {
        id: 'briefing_projeto',
        name: 'Briefing de Projeto',
        description: 'Coleta informações essenciais para iniciar um novo projeto',
        icon: Briefcase,
        color: 'indigo',
        fields: [
            { id: '1', type: 'section', label: 'Informações do Cliente', description: 'Dados básicos do solicitante' },
            { id: '2', type: 'text', label: 'Nome do Cliente', required: true, placeholder: 'Nome completo ou empresa' },
            { id: '3', type: 'email', label: 'Email de Contato', required: true },
            { id: '4', type: 'phone', label: 'Telefone' },
            { id: '5', type: 'section', label: 'Sobre o Projeto' },
            { id: '6', type: 'text', label: 'Nome do Projeto', required: true },
            { id: '7', type: 'textarea', label: 'Descrição do Projeto', required: true, rows: 4, helpText: 'Descreva em detalhes o que você precisa' },
            { id: '8', type: 'category', label: 'Tipo de Projeto', options: ['Website', 'App Mobile', 'Sistema', 'Design', 'Marketing', 'Outro'] },
            { id: '9', type: 'date', label: 'Prazo Desejado' },
            { id: '10', type: 'currency', label: 'Orçamento Estimado' },
            { id: '11', type: 'priority', label: 'Prioridade' },
            { id: '12', type: 'section', label: 'Referências' },
            { id: '13', type: 'moodboard', label: 'Referências Visuais', helpText: 'Faça upload de imagens de inspiração' },
            { id: '14', type: 'textarea', label: 'Links de Referência', placeholder: 'Cole URLs de sites ou projetos que você admira' }
        ]
    },
    {
        id: 'onboarding_cliente',
        name: 'Onboarding de Cliente',
        description: 'Cadastro completo de novos clientes',
        icon: Users,
        color: 'green',
        fields: [
            { id: '1', type: 'section', label: 'Dados Pessoais' },
            { id: '2', type: 'text', label: 'Nome Completo', required: true },
            { id: '3', type: 'email', label: 'Email', required: true },
            { id: '4', type: 'phone', label: 'Telefone', required: true },
            { id: '5', type: 'cpf_cnpj', label: 'CPF ou CNPJ' },
            { id: '6', type: 'section', label: 'Empresa' },
            { id: '7', type: 'text', label: 'Nome da Empresa' },
            { id: '8', type: 'text', label: 'Cargo/Função' },
            { id: '9', type: 'url', label: 'Website da Empresa' },
            { id: '10', type: 'section', label: 'Objetivos' },
            { id: '11', type: 'checkbox', label: 'Áreas de Interesse', options: ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Suporte'] },
            { id: '12', type: 'textarea', label: 'Principais Objetivos', helpText: 'O que você espera alcançar?' },
            { id: '13', type: 'terms', label: 'Aceite', text: 'Concordo com os termos de uso e política de privacidade', required: true }
        ]
    },
    {
        id: 'pesquisa_satisfacao',
        name: 'Pesquisa de Satisfação',
        description: 'Avalie a satisfação dos clientes',
        icon: Star,
        color: 'yellow',
        fields: [
            { id: '1', type: 'section', label: 'Avaliação Geral' },
            { id: '2', type: 'rating', label: 'Como você avalia nossa empresa?', required: true, maxStars: 5 },
            { id: '3', type: 'rating', label: 'Qualidade do atendimento', maxStars: 5 },
            { id: '4', type: 'rating', label: 'Qualidade do produto/serviço', maxStars: 5 },
            { id: '5', type: 'range', label: 'NPS - Recomendaria para um amigo?', min: 0, max: 10, step: 1 },
            { id: '6', type: 'section', label: 'Feedback Detalhado' },
            { id: '7', type: 'checkbox', label: 'O que você mais gostou?', options: ['Qualidade', 'Preço', 'Atendimento', 'Prazo', 'Comunicação'] },
            { id: '8', type: 'checkbox', label: 'O que podemos melhorar?', options: ['Qualidade', 'Preço', 'Atendimento', 'Prazo', 'Comunicação'] },
            { id: '9', type: 'textarea', label: 'Comentários adicionais', placeholder: 'Conte-nos mais sobre sua experiência' }
        ]
    },
    {
        id: 'formulario_contato',
        name: 'Formulário de Contato',
        description: 'Receba mensagens de visitantes',
        icon: MessageSquare,
        color: 'blue',
        fields: [
            { id: '1', type: 'text', label: 'Nome', required: true },
            { id: '2', type: 'email', label: 'Email', required: true },
            { id: '3', type: 'phone', label: 'Telefone' },
            { id: '4', type: 'select', label: 'Assunto', options: ['Orçamento', 'Dúvida', 'Suporte', 'Parceria', 'Outro'], required: true },
            { id: '5', type: 'textarea', label: 'Mensagem', required: true, rows: 5 }
        ]
    },
    {
        id: 'solicitacao_orcamento',
        name: 'Solicitação de Orçamento',
        description: 'Colete informações para orçamentos',
        icon: ShoppingCart,
        color: 'purple',
        fields: [
            { id: '1', type: 'section', label: 'Dados do Solicitante' },
            { id: '2', type: 'text', label: 'Nome', required: true },
            { id: '3', type: 'email', label: 'Email', required: true },
            { id: '4', type: 'phone', label: 'Telefone', required: true },
            { id: '5', type: 'text', label: 'Empresa' },
            { id: '6', type: 'section', label: 'Detalhes do Pedido' },
            { id: '7', type: 'select', label: 'Tipo de Serviço', options: ['Serviço A', 'Serviço B', 'Serviço C', 'Pacote Completo'], required: true },
            { id: '8', type: 'number', label: 'Quantidade', min: 1 },
            { id: '9', type: 'date', label: 'Prazo Desejado' },
            { id: '10', type: 'textarea', label: 'Especificações' },
            { id: '11', type: 'moodboard', label: 'Anexos de Referência' }
        ]
    },
    {
        id: 'feedback_evento',
        name: 'Feedback de Evento',
        description: 'Avalie um evento ou workshop',
        icon: Calendar,
        color: 'pink',
        fields: [
            { id: '1', type: 'text', label: 'Nome do Participante' },
            { id: '2', type: 'rating', label: 'Avaliação Geral do Evento', required: true },
            { id: '3', type: 'rating', label: 'Qualidade do Conteúdo' },
            { id: '4', type: 'rating', label: 'Organização' },
            { id: '5', type: 'rating', label: 'Palestrantes' },
            { id: '6', type: 'checkbox', label: 'Pontos Positivos', options: ['Conteúdo relevante', 'Boa organização', 'Networking', 'Material de apoio', 'Local adequado'] },
            { id: '7', type: 'textarea', label: 'Sugestões de Melhoria' },
            { id: '8', type: 'toggle', label: 'Participaria novamente?', labelOn: 'Sim', labelOff: 'Não' }
        ]
    },
    {
        id: 'briefing_design',
        name: 'Briefing de Design',
        description: 'Informações para projetos de design',
        icon: Palette,
        color: 'cyan',
        fields: [
            { id: '1', type: 'section', label: 'Sobre o Projeto' },
            { id: '2', type: 'text', label: 'Nome do Projeto', required: true },
            { id: '3', type: 'select', label: 'Tipo de Design', options: ['Logo', 'Identidade Visual', 'UI/UX', 'Material Gráfico', 'Social Media'], required: true },
            { id: '4', type: 'textarea', label: 'Descrição', required: true },
            { id: '5', type: 'section', label: 'Público-Alvo' },
            { id: '6', type: 'text', label: 'Quem é seu público?' },
            { id: '7', type: 'range', label: 'Faixa Etária Média', min: 18, max: 65 },
            { id: '8', type: 'section', label: 'Preferências Visuais' },
            { id: '9', type: 'checkbox', label: 'Estilo Desejado', options: ['Minimalista', 'Moderno', 'Clássico', 'Corporativo', 'Divertido', 'Luxuoso'] },
            { id: '10', type: 'color', label: 'Cor Principal Preferida' },
            { id: '11', type: 'moodboard', label: 'Referências Visuais', required: true }
        ]
    },
    {
        id: 'inscricao_curso',
        name: 'Inscrição em Curso',
        description: 'Formulário de inscrição para cursos',
        icon: BookOpen,
        color: 'orange',
        fields: [
            { id: '1', type: 'section', label: 'Dados Pessoais' },
            { id: '2', type: 'text', label: 'Nome Completo', required: true },
            { id: '3', type: 'email', label: 'Email', required: true },
            { id: '4', type: 'phone', label: 'Telefone', required: true },
            { id: '5', type: 'date', label: 'Data de Nascimento' },
            { id: '6', type: 'section', label: 'Formação' },
            { id: '7', type: 'select', label: 'Escolaridade', options: ['Ensino Médio', 'Graduação', 'Pós-Graduação', 'Mestrado', 'Doutorado'] },
            { id: '8', type: 'text', label: 'Área de Formação' },
            { id: '9', type: 'section', label: 'Sobre o Curso' },
            { id: '10', type: 'select', label: 'Curso de Interesse', options: ['Curso A', 'Curso B', 'Curso C'], required: true },
            { id: '11', type: 'select', label: 'Turno Preferido', options: ['Manhã', 'Tarde', 'Noite', 'Final de Semana'] },
            { id: '12', type: 'textarea', label: 'Por que deseja fazer este curso?' },
            { id: '13', type: 'terms', label: 'Aceite', text: 'Aceito os termos do regulamento do curso', required: true }
        ]
    }
];

const COLOR_CLASSES = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-50', border: 'border-indigo-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-50', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', hover: 'hover:bg-yellow-50', border: 'border-yellow-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-50', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-50', border: 'border-purple-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', hover: 'hover:bg-pink-50', border: 'border-pink-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', hover: 'hover:bg-cyan-50', border: 'border-cyan-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-50', border: 'border-orange-200' }
};

export default function TemplateGallery({ isOpen, onClose, onSelectTemplate }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    if (!isOpen) return null;

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate.fields);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div>
                        <h2 className="text-xl font-bold text-white">Galeria de Templates</h2>
                        <p className="text-white/80 text-sm">
                            Comece rapidamente com um template pronto
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {TEMPLATE_PRESETS.map(template => {
                            const colors = COLOR_CLASSES[template.color] || COLOR_CLASSES.indigo;
                            const isSelected = selectedTemplate?.id === template.id;

                            return (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                            ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-${template.color}-500`
                                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                                        <template.icon size={24} className={colors.text} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-400">
                                            {template.fields.length} campos
                                        </span>
                                        {isSelected && (
                                            <span className={`text-xs ${colors.text} font-medium`}>
                                                ✓ Selecionado
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancelar
                    </button>
                    <div className="flex items-center gap-3">
                        {selectedTemplate && (
                            <span className="text-sm text-gray-500">
                                {selectedTemplate.name} selecionado
                            </span>
                        )}
                        <button
                            onClick={handleUseTemplate}
                            disabled={!selectedTemplate}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${selectedTemplate
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Usar Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export template presets for use elsewhere
export { TEMPLATE_PRESETS };
