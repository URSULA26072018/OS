import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Percent, 
  Briefcase, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle2,
  Lock,
  AlertCircle
} from 'lucide-react';
import type { Tecnico, OrdemServico } from '../types/os.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';

interface TecnicosViewProps {
  tecnicos: Tecnico[];
  ordens: OrdemServico[];
  onSaveTecnico: (dados: Omit<Tecnico, 'id'>, id?: string) => Promise<void>;
  onDeleteTecnico: (id: string) => Promise<void>;
}

export const TecnicosView: React.FC<TecnicosViewProps> = ({
  tecnicos,
  ordens,
  onSaveTecnico,
  onDeleteTecnico
}) => {
  const { isAdmin, openLoginModal } = useAdminAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [deleteTargetTecnico, setDeleteTargetTecnico] = useState<Tecnico | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<'ADMIN' | 'GESTOR' | 'TECNICO' | 'ATENDENTE'>('TECNICO');
  const [loginUsuario, setLoginUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especialidadesInput, setEspecialidadesInput] = useState('');
  const [corIdentificacao, setCorIdentificacao] = useState('#3B82F6');
  const [comissaoPercentual, setComissaoPercentual] = useState(15);
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const hasAdmin = tecnicos.some(t => t.cargo === 'ADMIN' || t.id === 'tec-admin');

  const handleCreateDefaultAdmin = async () => {
    try {
      setSaving(true);
      await onSaveTecnico({
        nome: 'Administrador Master',
        cargo: 'ADMIN',
        loginUsuario: 'admin',
        email: '87informatica@gmail.com',
        telefone: '(11) 99999-0000',
        especialidades: ['Administração Geral', 'Gestão & Homologação', 'Supervisão Técnica', 'Controle Financeiro'],
        corIdentificacao: '#6366F1',
        comissaoPercentual: 0,
        ativo: true
      });
      setFeedbackSuccess('Usuário Administrador Master cadastrado com sucesso!');
      setTimeout(() => setFeedbackSuccess(''), 4000);
    } catch (err: any) {
      setFormError(`Erro ao cadastrar administrador: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setFormError('');
    setEditingTecnico(null);
    setNome('');
    setCargo('TECNICO');
    setLoginUsuario('');
    setEmail('');
    setTelefone('');
    setEspecialidadesInput('Hardware, Manutenção, Placas');
    setCorIdentificacao('#3B82F6');
    setComissaoPercentual(15);
    setAtivo(true);
    setModalOpen(true);
  };

  const openEditModal = (t: Tecnico) => {
    setFormError('');
    setEditingTecnico(t);
    setNome(t.nome);
    setCargo((t.cargo as 'ADMIN' | 'GESTOR' | 'TECNICO' | 'ATENDENTE') ?? (t.id === 'tec-admin' ? 'ADMIN' : 'TECNICO'));
    setLoginUsuario(t.loginUsuario || '');
    setEmail(t.email);
    setTelefone(t.telefone);
    setEspecialidadesInput(t.especialidades.join(', '));
    setCorIdentificacao(t.corIdentificacao);
    setComissaoPercentual(t.comissaoPercentual);
    setAtivo(t.ativo);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!nome.trim() || !telefone.trim()) {
      setFormError('Nome e telefone são obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      const especialidades = especialidadesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await onSaveTecnico(
        {
          nome: nome.trim(),
          cargo,
          loginUsuario: loginUsuario.trim() || undefined,
          email: email.trim(),
          telefone: telefone.trim(),
          especialidades: especialidades.length > 0 ? especialidades : (cargo === 'ADMIN' ? ['Administração'] : cargo === 'ATENDENTE' ? ['Atendimento'] : ['Geral']),
          corIdentificacao,
          comissaoPercentual: cargo === 'GESTOR' ? 100 : (cargo === 'ADMIN' || cargo === 'ATENDENTE') ? 0 : Number(comissaoPercentual),
          ativo
        },
        editingTecnico?.id
      );
      setModalOpen(false);
      setFeedbackSuccess(editingTecnico ? 'Usuário atualizado com sucesso!' : 'Novo usuário cadastrado com sucesso!');
      setTimeout(() => setFeedbackSuccess(''), 4000);
    } catch (err: any) {
      setFormError(`Erro ao salvar usuário: ${err.message || 'Falha na conexão'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetTecnico) return;
    await onDeleteTecnico(deleteTargetTecnico.id);
    const removedName = deleteTargetTecnico.nome;
    setDeleteTargetTecnico(null);
    setFeedbackSuccess(`Usuário ${removedName} removido com sucesso.`);
    setTimeout(() => setFeedbackSuccess(''), 4000);
  };

  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#14B8A6'  // Teal
  ];

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess('')} className="p-1 hover:bg-emerald-600 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Cadastro de Usuários</h1>
            {isAdmin ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Admin Liberado</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal('Autentique-se como Administrador para editar e excluir usuários')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Modo Leitura • Entrar como Admin</span>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Usuários e colaboradores do sistema, com controle de perfil de acesso, funções e atribuição a ordens de serviço.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!hasAdmin && (
            <button
              onClick={handleCreateDefaultAdmin}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              title="Cadastrar usuário Administrador Master no sistema"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Restaurar Admin</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Admin Missing Banner */}
      {!hasAdmin && (
        <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nenhum Usuário Administrador cadastrado</h4>
              <p className="text-xs text-slate-300">
                Cadastre o Administrador Master com acesso total às permissões, configurações e controle do sistema.
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateDefaultAdmin}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Administrador Master</span>
          </button>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tecnicos.length === 0 ? (
          <div className="col-span-full py-12 px-6 rounded-3xl bg-[#0f172a] border border-slate-800 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Nenhum usuário cadastrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Cadastre o Administrador Master, técnicos, gestores e atendentes para operar o sistema.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCreateDefaultAdmin}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cadastrar Administrador Master</span>
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            </div>
          </div>
        ) : (
          [...tecnicos].sort((a, b) => Number(b.cargo === 'ADMIN' || b.id === 'tec-admin') - Number(a.cargo === 'ADMIN' || a.id === 'tec-admin')).map((t) => {
            const tecOrdens = ordens.filter(os => os.tecnicoId === t.id);
            const ativas = tecOrdens.filter(os => !['FINALIZADA', 'ENTREGUE', 'CANCELADA'].includes(os.status)).length;
            const concluidas = tecOrdens.filter(os => ['FINALIZADA', 'ENTREGUE'].includes(os.status)).length;
            const isAdminUser = t.cargo === 'ADMIN' || t.id === 'tec-admin';
            const badge = (() => {
              switch (t.cargo) {
                case 'ADMIN':
                  return { label: 'Administrador Master', bg: 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40' };
                case 'GESTOR':
                  return { label: 'Gestor', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
                case 'ATENDENTE':
                  return { label: 'Atendente', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
                default:
                  return { label: 'Técnico', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
              }
            })();

            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-5 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative group text-white ${
                  isAdminUser
                    ? 'border-indigo-500/50 bg-gradient-to-b from-[#131d38] to-[#0f172a] shadow-indigo-950/60 ring-1 ring-indigo-500/30'
                    : 'bg-[#0f172a] border-slate-800 hover:border-indigo-500/50 hover:bg-[#131d33]'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md"
                        style={{ backgroundColor: t.corIdentificacao }}
                      >
                        {t.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base leading-tight flex items-center gap-1.5">
                            {isAdminUser && <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />}
                            <span>{t.nome}</span>
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.ativo ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          ></span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {t.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          {t.loginUsuario && (
                            <span className="text-[11px] text-slate-400">
                              • Login: <strong className="text-slate-300 font-mono">@{t.loginUsuario}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Editar Usuário"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {isAdminUser ? (
                        <button
                          type="button"
                          disabled
                          className="p-1.5 text-slate-600 rounded-lg cursor-not-allowed"
                          title="O Administrador Master não pode ser excluído por segurança"
                        >
                          <Lock className="w-4 h-4 text-slate-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteTargetTecnico(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.telefone}</span>
                    </div>
                    {t.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{t.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {t.cargo === 'ADMIN' || t.id === 'tec-admin'
                          ? 'Acesso total de Administrador'
                          : t.cargo === 'GESTOR'
                          ? 'Gestor (100% de comissão)'
                          : t.cargo === 'ATENDENTE'
                          ? 'Recepção / Atendimento de OS'
                          : <>Comissão de serviço: <strong className="text-white">{t.comissaoPercentual}%</strong></>}
                      </span>
                    </div>
                  </div>

                  {/* Specialties tags */}
                  {t.especialidades && t.especialidades.length > 0 && (
                    <div className="border-t border-slate-800 pt-3 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Área de Atuação / Especialidades
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.especialidades.map((esp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Workload Stats */}
                <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-amber-950/30 p-2 rounded-xl border border-amber-900/50">
                    <span className="block text-[10px] font-bold text-amber-400 uppercase">OS em Aberto</span>
                    <span className="text-base font-black text-amber-300">{ativas}</span>
                  </div>
                  <div className="bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/50">
                    <span className="block text-[10px] font-bold text-emerald-400 uppercase">Concluídas</span>
                    <span className="text-base font-black text-emerald-300">{concluidas}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for deleting user */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetTecnico)}
        title="Remover Usuário"
        message={`Deseja realmente remover o usuário "${deleteTargetTecnico?.nome}"? Esta alteração será refletida em todo o sistema.`}
        confirmText="Sim, Remover Usuário"
        cancelText="Cancelar"
        danger={true}
        requireAdmin={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetTecnico(null)}
      />

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTecnico ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Cavalcante"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Perfil / Cargo *</label>
                  <select
                    value={cargo}
                    onChange={(e) => {
                      const nextCargo = e.target.value as 'ADMIN' | 'GESTOR' | 'TECNICO' | 'ATENDENTE';
                      setCargo(nextCargo);
                      if (nextCargo === 'GESTOR') setComissaoPercentual(100);
                      if (nextCargo === 'ADMIN' || nextCargo === 'ATENDENTE') setComissaoPercentual(0);
                      if (nextCargo === 'ADMIN') setCorIdentificacao('#6366F1');
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="ADMIN">Administrador (Acesso Geral & Segurança)</option>
                    <option value="GESTOR">Gestor / Gerente</option>
                    <option value="TECNICO">Técnico (Executa OS e Reparos)</option>
                    <option value="ATENDENTE">Atendente / Recepção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usuário / Login (Opcional)</label>
                  <input
                    type="text"
                    value={loginUsuario}
                    onChange={(e) => setLoginUsuario(e.target.value)}
                    placeholder="Ex: admin ou carlos.tec"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {cargo === 'ADMIN' && (
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Perfil de Administrador: Controle irrestrito sobre ordens, clientes, produtos, configurações e permissões.</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@osmaster.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {cargo === 'TECNICO' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comissão (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={comissaoPercentual}
                      onChange={(e) => setComissaoPercentual(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">Percentual de comissão sobre serviços executados.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especialidades</label>
                    <input
                      type="text"
                      value={especialidadesInput}
                      onChange={(e) => setEspecialidadesInput(e.target.value)}
                      placeholder="Notebooks, Placas, Celulares..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">Separadas por vírgula.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Cor de Identificação no Sistema</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCorIdentificacao(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        corIdentificacao === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">Usuário Ativo no Sistema</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:bg-indigo-400"
                >
                  {saving ? 'Salvando...' : (editingTecnico ? 'Salvar Alterações' : 'Cadastrar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
