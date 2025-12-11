import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Package,
  Folder,
  Layout,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  Copy,
  Shuffle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../config/api';
import { Modal, Button } from '../ui';

/**
 * TransferManager Module
 * Central hub for transferring projects, boards, and cards
 * 
 * @module components/modules/TransferManager
 */
const TransferManager = () => {
  const [transferType, setTransferType] = useState('card_move');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [targets, setTargets] = useState({});
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [result, setResult] = useState(null);
  const { projects, boards, cards, refreshData } = useApp();

  // Transfer types configuration
  const transferTypes = [
    { id: 'ownership_transfer', label: 'Transferir Propriedade', icon: User, entity: 'project', color: 'text-purple-600 bg-purple-50' },
    { id: 'board_move', label: 'Mover Board', icon: Layout, entity: 'board', color: 'text-blue-600 bg-blue-50' },
    { id: 'card_move', label: 'Mover Card', icon: Shuffle, entity: 'card', color: 'text-green-600 bg-green-50' },
    { id: 'card_clone', label: 'Clonar Card', icon: Copy, entity: 'card', color: 'text-orange-600 bg-orange-50' },
  ];

  const currentType = transferTypes.find(t => t.id === transferType);

  // Fetch transfer history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/transfers/history');
        setHistory(response.data.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, []);

  // Fetch targets when type changes
  useEffect(() => {
    const entityType = transferTypes.find(t => t.id === transferType)?.entity;
    if (!entityType) return;

    const fetchTargets = async () => {
      try {
        const response = await api.get(`/transfers/targets?entityType=${entityType}`);
        setTargets(response.data.data);
      } catch (error) {
        console.error('Error fetching targets:', error);
      }
    };
    fetchTargets();
    setSelectedSource(null);
    setSelectedTarget(null);
  }, [transferType]);

  // Get source items based on type
  const getSourceItems = () => {
    if (transferType === 'ownership_transfer') {
      return (projects || []).filter(p => p.isOwner !== false);
    }
    if (transferType === 'board_move') {
      return boards || [];
    }
    return cards || [];
  };

  // Get target items based on type
  const getTargetItems = () => {
    if (transferType === 'ownership_transfer') {
      return targets.users || [];
    }
    if (transferType === 'board_move') {
      return targets.projects?.filter(p => p.id !== selectedSource?.projectId) || [];
    }
    return targets.boards?.filter(b => b.id !== selectedSource?.boardId) || [];
  };

  // Execute transfer
  const executeTransfer = async () => {
    if (!selectedSource || !selectedTarget) return;

    setLoading(true);
    setResult(null);

    try {
      let response;

      if (transferType === 'ownership_transfer') {
        response = await api.put(`/transfers/projects/${selectedSource.id}/ownership`, {
          newOwnerId: selectedTarget.id,
        });
      } else if (transferType === 'board_move') {
        response = await api.put(`/transfers/boards/${selectedSource.id}/move`, {
          targetProjectId: selectedTarget.id,
        });
      } else if (transferType === 'card_move') {
        response = await api.put(`/transfers/cards/${selectedSource.id}/move`, {
          targetBoardId: selectedTarget.id,
          targetColumnId: selectedTarget.columns?.[0]?.id,
        });
      } else if (transferType === 'card_clone') {
        response = await api.post(`/transfers/cards/${selectedSource.id}/clone`, {
          targetBoardId: selectedTarget.id,
          targetColumnId: selectedTarget.columns?.[0]?.id,
        });
      }

      setResult({ success: true, message: response.data.message });
      setSelectedSource(null);
      setSelectedTarget(null);

      // Refresh history
      const historyResponse = await api.get('/transfers/history');
      setHistory(historyResponse.data.data);

      // Refresh app data
      if (refreshData) refreshData();

    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erro ao executar transferência'
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary-50/50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          Central de Transferências
        </h1>
        <p className="text-secondary-500 mt-1">
          Transfira projetos, boards e cards entre usuários e locais
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Transfer Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-secondary-200 p-6 flex flex-col">
          {/* Transfer type selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Tipo de Transferência
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {transferTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setTransferType(type.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${transferType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${type.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-secondary-800 block">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source and Target selection */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Source */}
            <div className="bg-secondary-50 rounded-xl p-4">
              <h3 className="font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                <Folder size={16} />
                Origem
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {getSourceItems().map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSource(item)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedSource?.id === item.id
                      ? 'bg-primary-100 border-primary-300 border'
                      : 'bg-white hover:bg-secondary-100 border border-transparent'
                      }`}
                  >
                    <span className="font-medium text-secondary-800 block truncate">
                      {item.name || item.title}
                    </span>
                    {item.project && (
                      <span className="text-xs text-secondary-500">
                        {item.project.name}
                      </span>
                    )}
                    {item.board && (
                      <span className="text-xs text-secondary-500">
                        {item.board.name}
                      </span>
                    )}
                  </button>
                ))}
                {getSourceItems().length === 0 && (
                  <p className="text-sm text-secondary-500 text-center py-4">
                    Nenhum item disponível
                  </p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <ArrowRight size={20} className="text-primary-600" />
              </div>
            </div>

            {/* Target */}
            <div className="bg-secondary-50 rounded-xl p-4">
              <h3 className="font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                {transferType === 'ownership_transfer' ? <User size={16} /> : <Layout size={16} />}
                Destino
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {getTargetItems().map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTarget(item)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTarget?.id === item.id
                      ? 'bg-primary-100 border-primary-300 border'
                      : 'bg-white hover:bg-secondary-100 border border-transparent'
                      }`}
                  >
                    <span className="font-medium text-secondary-800 block truncate">
                      {item.name || item.email}
                    </span>
                    {item.project && (
                      <span className="text-xs text-secondary-500">
                        {item.project.name}
                      </span>
                    )}
                    {item.email && (
                      <span className="text-xs text-secondary-500 block">
                        {item.email}
                      </span>
                    )}
                  </button>
                ))}
                {getTargetItems().length === 0 && (
                  <p className="text-sm text-secondary-500 text-center py-4">
                    {selectedSource ? 'Nenhum destino disponível' : 'Selecione uma origem'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Result message */}
          {result && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
              {result.success ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <span>{result.message}</span>
            </div>
          )}

          {/* Action button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedSource || !selectedTarget}
              icon={currentType?.icon}
            >
              {currentType?.label}
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-secondary-200 p-6 flex flex-col min-h-0">
          <h3 className="font-semibold text-secondary-800 mb-4 flex items-center gap-2">
            <Clock size={18} />
            Histórico de Transferências
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-secondary-500 text-center py-8">
                Nenhuma transferência realizada
              </p>
            ) : (
              history.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-secondary-50 rounded-lg border border-secondary-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {log.type === 'ownership_transfer' && <User size={14} className="text-purple-500" />}
                    {log.type === 'board_move' && <Layout size={14} className="text-blue-500" />}
                    {log.type === 'card_move' && <Shuffle size={14} className="text-green-500" />}
                    {log.type === 'card_clone' && <Copy size={14} className="text-orange-500" />}
                    <span className="text-xs font-medium text-secondary-600 uppercase">
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-secondary-800 truncate">
                    {log.entityTitle}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">
                    {log.fromTitle} → {log.toTitle}
                  </p>
                  <p className="text-xs text-secondary-400 mt-1">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Transferência"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-amber-800">Atenção!</p>
                <p className="text-sm text-amber-700 mt-1">
                  {transferType === 'ownership_transfer' && 'Você perderá a propriedade deste projeto.'}
                  {transferType === 'board_move' && 'Todos os cards do board serão movidos junto.'}
                  {transferType === 'card_move' && 'O card será movido para o novo board.'}
                  {transferType === 'card_clone' && 'Uma cópia do card será criada no destino.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-secondary-500 mb-1">De</p>
                <p className="font-medium text-secondary-800">
                  {selectedSource?.name || selectedSource?.title}
                </p>
              </div>
              <ArrowRight className="text-secondary-400" size={20} />
              <div className="flex-1 text-center">
                <p className="text-xs text-secondary-500 mb-1">Para</p>
                <p className="font-medium text-secondary-800">
                  {selectedTarget?.name || selectedTarget?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button onClick={executeTransfer} loading={loading} icon={RefreshCw}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransferManager;
