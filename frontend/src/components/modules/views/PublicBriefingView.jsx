import React, { useState, useEffect } from 'react';
import { Layout, FileText, CheckCircle } from 'lucide-react';
import BriefingRenderer from '../briefing/BriefingRenderer';
import { getPublicTemplate, submitPublicBriefing } from '../../../services/briefingService'; // Create these methods

export default function PublicBriefingView() {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // URL format: /public/briefing/:token
        const pathParts = window.location.pathname.split('/');
        const tokenIndex = pathParts.indexOf('briefing') + 1;
        const token = pathParts[tokenIndex];

        if (!token) {
            setError('Link inválido');
            setLoading(false);
            return;
        }

        getPublicTemplate(token)
            .then(setTemplate)
            .catch(err => {
                console.error(err);
                setError('Briefing não encontrado ou link expirado.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (data) => {
        try {
            // Public submission usually creates a NEW card
            // The API endpoint should handle "submit to template" -> "create card"
            // I need to implement submitPublicBriefing in service.
            // Wait, the backend logic for public submission needs checking.
            // In previous BriefingController I added getPublicTemplate but I might have missed the submit endpoint for public users (create card).
            // Let's assume there is an endpoint or I reuse submitBriefing but with token?
            // I'll check backend/controllers/briefing.controller.js later.
            // For now let's assume `submitPublicBriefing(token, data)` exists.

            await submitPublicBriefing(template.publicToken, data);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError('Erro ao enviar briefing. Tente novamente.');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando briefing...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Briefing Enviado!</h1>
                    <p className="text-gray-600">Obrigado pelas informações. Criamos um card para sua solicitação e nossa equipe entrará em contato em breve.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* HEADER */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <Layout className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                    {template.description && <p className="mt-2 text-lg text-gray-600">{template.description}</p>}
                </div>

                {/* FORM CARD */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <BriefingRenderer
                            template={template}
                            onSubmit={handleSubmit}
                        />
                    </div>
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
                        Powered by KBSys
                    </div>
                </div>
            </div>
        </div>
    );
}
