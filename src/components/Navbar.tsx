import React, { useMemo, useState } from 'react';
import {
  Wrench,
  Home,
  Columns3,
  ClipboardList,
  FolderOpen,
  UserCheck,
  Search,
  RefreshCw,
  Sun,
  Moon,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';

export type NavTab = 'dashboard' | 'kanban' | 'ordens' | 'cadastros' | 'estoque' | 'clientes' | 'tecnicos';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRefresh: () => void;
  estoqueBaixoCount: number;
  onOpenLoginPage?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  estoqueBaixoCount,
  onOpenLoginPage,
  isDarkMode = true,
  onToggleTheme
}) => {
  const { isAdmin, openLoginModal, logout } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const navigation = [
    { id: 'dashboard' as NavTab, label: 'Início', icon: Home },
    { id: 'ordens' as NavTab, label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'kanban' as NavTab, label: 'Quadro Kanban', icon: Columns3 },
    { id: 'cadastros' as NavTab, label: 'Central de Cadastros', icon: FolderOpen, badge: estoqueBaixoCount },
    { id: 'tecnicos' as NavTab, label: 'Cadastro de Usuários', icon: UserCheck }
  ];
  const filteredNavigation = useMemo(
    () => navigation.filter(item => item.label.toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR'))),
    [searchTerm, estoqueBaixoCount]
  );

  return (
    <aside className="no-print sticky top-0 z-30 flex h-screen w-[72px] sm:w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0d1424] px-2 py-4 sm:px-4 sm:py-5 shadow-xl">
      <button
        onClick={() => onTabChange('dashboard')}
        className="mb-6 flex items-center justify-center gap-3 rounded-xl px-1 py-1.5 text-left sm:justify-start sm:px-2"
        title="OS Master — Início"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/30">
          <Wrench className="h-5 w-5 -rotate-45" />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block whitespace-nowrap text-xl font-extrabold tracking-tight text-white">OS <span className="text-amber-400">Master</span></span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Gestão de assistência</span>
        </span>
      </button>

      <label className="mb-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-[#454a60] px-2 text-slate-300 sm:justify-start sm:px-3">
        <Search className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          placeholder="Pesquise aqui..."
          aria-label="Pesquisar no menu"
          className="hidden min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400 sm:block"
        />
      </label>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {filteredNavigation.map(({ id, label, icon: Icon, badge }) => {
          const active = activeTab === id || (id === 'cadastros' && ['clientes', 'estoque'].includes(activeTab));
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-10 items-center justify-center gap-3 rounded-lg px-2.5 text-left text-sm transition-colors sm:justify-start sm:px-3 ${
                active ? 'bg-[#4b587f] font-semibold text-white' : 'text-sky-200/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="hidden flex-1 sm:block">{label}</span>
              {!!badge && badge > 0 && <span className="hidden rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 sm:inline">{badge}</span>}
            </button>
          );
        })}

      </nav>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start sm:px-2">
          {isAdmin ? <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-slate-600" />}
          <span className="hidden truncate text-xs font-medium text-slate-400 sm:block">{isAdmin ? 'Administrador ativo' : 'Acesso padrão'}</span>
        </div>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          <button onClick={onRefresh} title="Atualizar dados" className="flex h-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
            <RefreshCw className="h-4 w-4" /><span className="sr-only">Atualizar</span>
          </button>
          {onToggleTheme && <button onClick={onToggleTheme} title="Alternar tema" className="hidden h-9 items-center justify-center rounded-lg text-amber-300 hover:bg-slate-800 sm:flex">{isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>}
          {isAdmin ? (
            <button onClick={async () => { await logout(); onOpenLoginPage?.(); }} title="Sair do modo administrador" className="hidden h-9 items-center justify-center rounded-lg text-rose-300 hover:bg-rose-500/10 sm:flex"><LogOut className="h-4 w-4" /></button>
          ) : (
            <button onClick={() => onOpenLoginPage ? onOpenLoginPage() : openLoginModal('Autentique-se como Administrador')} title="Entrar como administrador" className="hidden h-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white sm:flex"><LogIn className="h-4 w-4" /></button>
          )}
        </div>
      </div>
    </aside>
  );
};
