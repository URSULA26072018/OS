import React, { useState } from 'react';
import { 
  Trophy,
  BarChart2,
  Wrench,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Printer,
  Edit2,
  ExternalLink,
  Flame,
  Terminal,
  Database,
  X,
  Copy,
  Check,
  Sparkles,
  Columns3,
  Plus,
  FileText,
  DollarSign
} from 'lucide-react';
import type { DashboardMetrics, OrdemServico, Cliente, Tecnico } from '../types/os.ts';
import { AgendaHero } from './AgendaHero.tsx';
import { api } from '../services/api.ts';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onRefreshData: () => Promise<void>;
  ordens?: OrdemServico[];
  clientes?: Cliente[];
  tecnicos?: Tecnico[];
  onSelectOS: (os: OrdemServico) => void;
  onNewOS: () => void;
  onNavigateToKanban: () => void;
  onNavigateToEstoque: () => void;
  onNavigateToOrdens: () => void;
  onNavigateToClientes?: () => void;
  onNavigateToTecnicos?: () => void;
  onPrintOS?: (os: OrdemServico) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onRefreshData,
  ordens = [],
  clientes = [],
  tecnicos = [],
  onSelectOS,
  onNewOS,
  onNavigateToKanban,
  onNavigateToEstoque,
  onNavigateToOrdens,
  onNavigateToClientes,
  onNavigateToTecnicos,
  onPrintOS
}) => {
  // Toggle for Produtos Mais Vendidos: 'unidades' | 'receita'
  const [produtoTab, setProdutoTab] = useState<'unidades' | 'receita'>('unidades');

  // Toggle for Extrato do Dia detalhes
  const [showExtrato, setShowExtrato] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Geral');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  const submitExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExpenseError('');
    setSavingExpense(true);
    try {
      await api.createDespesa({ descricao: expenseDescription.trim(), categoria: expenseCategory.trim() || 'Geral', valor: Number(expenseAmount.replace(',', '.')), dataPagamento: expenseDate });
      setExpenseDescription('');
      setExpenseAmount('');
      setShowExpenseForm(false);
      await onRefreshData();
    } catch (error) {
      setExpenseError(error instanceof Error ? error.message : 'Não foi possível registrar a despesa.');
    } finally {
      setSavingExpense(false);
    }
  };

  // Terminal & MySQL modal state
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Helper currency format
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCopyCommand = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Recent orders list
  const displayedOrdens = React.useMemo(() => {
    if (ordens && ordens.length > 0) {
      return ordens.slice(0, 5);
    }
    return [];
  }, [ordens]);

  // Handle open specific OS from today list
  const handleOpenTodayOrder = (num: string) => {
    const found = ordens.find(o => o.numeroOS === num);
    if (found) {
      onSelectOS(found);
    } else {
      onNavigateToOrdens();
    }
  };

  // Terminal commands guide
  const terminalCommands = [
    { title: 'Iniciar Servidor (Express + Vite)', cmd: 'npm run dev' },
    { title: 'Gerar Prisma Client', cmd: 'npx prisma generate' },
    { title: 'Executar Migração do Banco MySQL', cmd: 'npx prisma migrate dev --name init' },
    { title: 'Visualizador Prisma Studio', cmd: 'npx prisma studio' },
    { title: 'Acessar MySQL via CLI', cmd: 'mysql -u root -p -D os_sistema_db' },
    { title: 'Testar API de Ordens de Serviço', cmd: 'curl -s http://localhost:3000/api/ordens-servico' }
  ];

  // Dynamic ranking of services
  const rankingServicos = metrics?.rankingServicos && metrics.rankingServicos.length > 0 
    ? metrics.rankingServicos 
    : [];

  const maxExecucoes = Math.max(...rankingServicos.map(s => s.execucoes), 1);

  // Dynamic ranking of products
  const rankingProdutos = metrics?.rankingProdutos && metrics.rankingProdutos.length > 0 
    ? metrics.rankingProdutos 
    : [];

  const maxProdutoMetric = Math.max(
    ...rankingProdutos.map(p => produtoTab === 'unidades' ? p.unidades : p.receita),
    1
  );

  return (
    <div className="space-y-6">
<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(260px,1fr)] gap-5 items-stretch">
      {/* ============================================================== */}
      {/* 1. RECEBIMENTOS DO DIA (CAIXA DE HOJE)                         */}
      {/* ============================================================== */}
      <div className="lg:order-2 bg-gradient-to-br from-[#062423] to-[#041a19] rounded-3xl p-5 sm:p-6 text-white border border-emerald-900/50 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-[#064e3b]/80 border border-emerald-600/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Recebimentos do Dia (Caixa de Hoje)</span>
          </div>
          <span className="text-xs text-emerald-400/80 font-mono font-medium">
            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}
          </span>
          </div>
          <button type="button" onClick={() => setShowExpenseForm(true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/70">
            <Plus className="h-4 w-4" /> Registrar despesa
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'RECEBIDO HOJE', value: metrics?.caixaHoje?.recebidoHoje ?? metrics?.caixaHoje?.faturamentoHoje ?? 0, color: 'text-emerald-300', hint: 'Pagamentos recebidos de clientes' },
            { label: 'PAGO HOJE', value: metrics?.caixaHoje?.pagoHoje ?? 0, color: 'text-rose-300', hint: 'Despesas pagas pela oficina' },
            { label: 'SALDO DO DIA', value: metrics?.caixaHoje?.saldoDia ?? 0, color: (metrics?.caixaHoje?.saldoDia ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300', hint: 'Recebido menos despesas pagas' },
            { label: 'RECEITAS DO MÊS', value: metrics?.caixaHoje?.receitasMes ?? 0, color: 'text-sky-300', hint: 'Ordens de serviço pagas neste mês' }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="text-[11px] font-bold tracking-wider text-slate-300">{item.label}</div>
              <div className={`mt-2 text-2xl font-black ${item.color}`}>{formatCurrency(item.value)}</div>
              <div className="mt-1 text-[11px] text-slate-400">{item.hint}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>{metrics?.caixaHoje?.ordensHojeCount ?? 0} pagamentos de clientes registrados hoje</span>
          <button type="button" onClick={() => setShowExtrato(!showExtrato)} className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200">
            {showExtrato ? 'Ocultar detalhes' : 'Ver detalhes'} {showExtrato ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showExpenseForm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-8"
            onMouseDown={event => { if (event.target === event.currentTarget && !savingExpense) setShowExpenseForm(false); }}
          >
            <section role="dialog" aria-modal="true" aria-labelledby="expense-modal-title" className="my-auto w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0f172a] p-5 text-white shadow-2xl sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h2 id="expense-modal-title" className="text-xl font-bold sm:text-2xl">Registrar despesa</h2>
                  <p className="mt-1 text-sm text-slate-400">Informe os dados do pagamento realizado pela oficina.</p>
                </div>
                <button type="button" onClick={() => setShowExpenseForm(false)} disabled={savingExpense} aria-label="Fechar" className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={submitExpense} className="space-y-5">
                <label className="block text-sm font-semibold text-slate-300">Descrição
                  <input required value={expenseDescription} onChange={event => setExpenseDescription(event.target.value)} placeholder="Ex.: compra de material" className="mt-2 block h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-300">Categoria
                    <input value={expenseCategory} onChange={event => setExpenseCategory(event.target.value)} placeholder="Geral" className="mt-2 block h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-300">Valor (R$)
                    <input required type="number" min="0.01" step="0.01" value={expenseAmount} onChange={event => setExpenseAmount(event.target.value)} placeholder="0,00" className="mt-2 block h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                  </label>
                </div>
                <label className="block text-sm font-semibold text-slate-300">Data do pagamento
                  <input required type="date" value={expenseDate} onChange={event => setExpenseDate(event.target.value)} className="mt-2 block h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                {expenseError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{expenseError}</p>}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setShowExpenseForm(false)} disabled={savingExpense} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">Cancelar</button>
                  <button disabled={savingExpense} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60">{savingExpense ? 'Salvando…' : 'Salvar despesa'}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* LANÇAMENTOS & PAGAMENTOS REGISTRADOS HOJE */}
        {showExtrato && (
          <div className="mt-6 pt-5 border-t border-emerald-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <DollarSign className="w-4 h-4" />
              <span>LANÇAMENTOS & PAGAMENTOS REGISTRADOS HOJE ({metrics?.caixaHoje?.ordensHojeCount ?? (metrics?.caixaHoje?.ordensFinalizadasHoje?.length ?? 0)})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics?.caixaHoje?.ordensFinalizadasHoje && metrics.caixaHoje.ordensFinalizadasHoje.length > 0 ? (
                metrics.caixaHoje.ordensFinalizadasHoje.map((ordemHoje) => (
                  <div 
                    key={ordemHoje.id}
                    onClick={() => onSelectOS(ordemHoje)}
                    title={`Clique para abrir e editar ${ordemHoje.numeroOS}`}
                    className="bg-black/30 border border-emerald-900/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-950/40 hover:border-emerald-600/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold bg-emerald-900/60 group-hover:bg-emerald-800 text-emerald-300 px-2 py-1 rounded-lg transition-colors">
                        {ordemHoje.horaRegistroHoje || 'Hoje'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                          <span>{ordemHoje.numeroOS}</span>
                          <span className="text-slate-400 font-normal">• {ordemHoje.cliente?.nome || 'Cliente'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ordemHoje.equipamento.tipo} {ordemHoje.equipamento.marca} {ordemHoje.equipamento.modelo}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 block">
                        {formatCurrency(ordemHoje.valorTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Mão de obra: {formatCurrency(ordemHoje.valorServicos)} | Peças: {formatCurrency(ordemHoje.valorPecas)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-400">
                  Nenhum pagamento ou lançamento registrado hoje.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. AGENDA DE SERVIÇOS & ENTREGAS (Substitui Gestão de OS)      */}
      {/* ============================================================== */}
      <div className="lg:order-1">
      <AgendaHero
        ordens={ordens}
        clientes={clientes}
        tecnicos={tecnicos}
        onSelectOS={onSelectOS}
        onNewOS={onNewOS}
        onNavigateToKanban={onNavigateToKanban}
      />
      </div>

      {/* ============================================================== */}
      {/* 3. RECEBIMENTOS DO DIA (CAIXA DE HOJE)                         */}
      {/* ============================================================== */}
      </div>

      {/* ============================================================== */}
      {/* 4. SEÇÃO DE ANÁLISE DE VENDAS (IMAGEM 1)                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* CARD ESQUERDA: SERVIÇO MAIS VENDIDO */}
        <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-full text-white">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Serviço Mais Vendido</h2>
                  <p className="text-xs text-slate-400">Principal demanda de mão de obra da assistência</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Top #1 Serviço</span>
              </div>
            </div>

            {/* Caixa Destaque: Serviço Líder */}
            <div 
              onClick={onNavigateToOrdens}
              title="Clique para visualizar ordens deste serviço"
              className="bg-[#131d33] hover:bg-[#182542] rounded-2xl p-4 sm:p-5 border border-slate-750 mb-5 relative transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                    SERVIÇO LÍDER EM ORDENS
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                    {metrics?.servicoLider?.nome || 'Nenhum serviço registrado'}
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>

              {/* 3 Metric cards inside */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4">
                <div className="bg-[#0f172a] rounded-xl p-3 border border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    EXECUÇÕES
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-black text-white">
                      {metrics?.servicoLider?.execucoes ?? 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">OS</span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-xl p-3 border border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    RECEITA TOTAL
                  </span>
                  <div className="mt-1">
                    <span className="text-lg sm:text-xl font-black text-emerald-400">
                      {formatCurrency(metrics?.servicoLider?.receitaTotal ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-xl p-3 border border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    PREÇO MÉDIO
                  </span>
                  <div className="mt-1">
                    <span className="text-lg sm:text-xl font-black text-indigo-400">
                      {formatCurrency(metrics?.servicoLider?.precoMedio ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking dos Principais Serviços */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>RANKING DOS PRINCIPAIS SERVIÇOS</span>
                <span>PARTICIPAÇÃO</span>
              </div>

              {rankingServicos.length > 0 ? (
                rankingServicos.map((servico) => {
                  const widthPercent = Math.max(15, Math.round((servico.execucoes / maxExecucoes) * 60));
                  return (
                    <div 
                      key={servico.pos} 
                      onClick={onNavigateToOrdens}
                      title={`Filtrar ordens de: ${servico.nome}`}
                      className="space-y-1.5 cursor-pointer hover:bg-slate-800/60 p-1.5 rounded-xl transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                            {servico.pos}
                          </span>
                          <span className="truncate max-w-[280px] sm:max-w-[340px] text-slate-200">{servico.nome}</span>
                        </div>
                        <div className="font-bold text-white shrink-0">
                          {servico.execucoes} OS <span className="text-slate-400 font-normal">({formatCurrency(servico.receita)})</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhum serviço registrado ainda.
                </div>
              )}
            </div>
          </div>

          {/* Footer Card */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Volume acumulado de serviços: {metrics?.volumeAcumuladoServicos ?? 0}
            </span>
            <button
              onClick={onNavigateToOrdens}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver em Ordens</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD DIREITA: GRÁFICO DE PRODUTOS MAIS VENDIDOS */}
        <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-full text-white">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Gráfico de Produtos Mais Vendidos</h2>
                  <p className="text-xs text-slate-400">Peças e componentes com maior saída em bancada</p>
                </div>
              </div>

              {/* Toggle Pills: Unidades / Receita */}
              <div className="flex items-center bg-[#080d19] p-1 rounded-2xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setProdutoTab('unidades')}
                  className={`px-3 py-1 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    produtoTab === 'unidades'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unidades (Qtd)
                </button>
                <button
                  onClick={() => setProdutoTab('receita')}
                  className={`px-3 py-1 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    produtoTab === 'receita'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Receita (R$)
                </button>
              </div>
            </div>

            {/* Destaque Produto Campeão de Saídas */}
            <div 
              onClick={onNavigateToEstoque}
              title="Clique para gerenciar este item no estoque"
              className="bg-emerald-950/30 hover:bg-emerald-950/50 rounded-2xl p-4 border border-emerald-800/50 mb-5 flex items-center justify-between gap-3 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                    PRODUTO CAMPEÃO DE SAÍDAS
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {metrics?.produtoCampeao?.nome || 'Nenhum produto faturado'}
                  </h3>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-emerald-400 block">
                  {metrics?.produtoCampeao?.unidades ?? 0} un vendidas
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Total: {formatCurrency(metrics?.produtoCampeao?.receitaTotal ?? 0)}
                </span>
              </div>
            </div>

            {/* Lista dos Produtos */}
            <div className="space-y-3.5 mb-6">
              {rankingProdutos.length > 0 ? (
                rankingProdutos.map((prod) => {
                  const metricValue = produtoTab === 'unidades' ? prod.unidades : prod.receita;
                  const widthPercent = Math.max(20, Math.round((metricValue / maxProdutoMetric) * 100));

                  return (
                    <div 
                      key={prod.pos}
                      onClick={onNavigateToEstoque}
                      title={`Ver detalhes do item: ${prod.nome}`}
                      className="space-y-1 cursor-pointer hover:bg-slate-800/60 p-1.5 rounded-xl transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-emerald-300 border border-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {prod.pos}
                          </span>
                          <span className="truncate max-w-[280px] sm:max-w-[340px] text-slate-200">{prod.nome}</span>
                        </div>
                        <span className="font-black text-white shrink-0">
                          {produtoTab === 'unidades' ? `${prod.unidades} un` : formatCurrency(prod.receita)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercent}%`, backgroundColor: prod.corBarra }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Preço médio: {formatCurrency(prod.precoMedio)}</span>
                        <span>{prod.participacao}% das peças</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhum produto faturado no momento.
                </div>
              )}
            </div>
          </div>

          {/* Footer Card */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Total de itens faturados: {metrics?.totalItensFaturados ?? 0} peças
            </span>
            <span className="text-emerald-400 font-bold">
              Receita peças: {formatCurrency(metrics?.receitaPecasTotal ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. SEÇÃO DE STATUS E ÚLTIMAS ORDENS (IMAGEM 2)                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CARD ESQUERDA: DISTRIBUIÇÃO POR STATUS (1 coluna) */}
        <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-full text-white">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white tracking-tight">Distribuição por Status</h2>
              <button
                onClick={onNavigateToKanban}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Kanban</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Status Rows */}
            <div className="space-y-4 mb-6">
              {(metrics?.rankingStatus || [
                { status: 'ORCAMENTO', label: 'Orçamento', count: 0, percent: 0, color: '#f59e0b' },
                { status: 'EM_ANDAMENTO', label: 'Em Andamento', count: 0, percent: 0, color: '#3b82f6' },
                { status: 'AGUARDANDO_PECAS', label: 'Aguardando Peça', count: 0, percent: 0, color: '#8b5cf6' },
                { status: 'FINALIZADA', label: 'Concluída', count: 0, percent: 0, color: '#10b981' }
              ]).map((st) => (
                <div 
                  key={st.status} 
                  onClick={onNavigateToKanban}
                  title={`Filtrar status: ${st.label}`}
                  className="space-y-1.5 cursor-pointer hover:bg-slate-800/40 p-1 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                      <span className="font-semibold text-slate-300">{st.label}</span>
                    </div>
                    <span className="font-bold text-white">{st.count} OS ({st.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${st.percent}%`, backgroundColor: st.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 2 metric boxes */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="bg-[#131d33] rounded-2xl p-4 text-center border border-slate-750">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Taxa de Sucesso
              </span>
              <span className="text-xl font-black text-white">
                {metrics?.taxaSucesso ?? 0}%
              </span>
            </div>

            <div className="bg-[#131d33] rounded-2xl p-4 text-center border border-slate-750">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Orçamentos
              </span>
              <span className="text-xl font-black text-amber-400">
                {metrics?.orcamentos ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* CARD DIREITA: ÚLTIMAS ORDENS DE SERVIÇO (2 colunas) */}
        <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-md lg:col-span-2 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Últimas Ordens de Serviço</h2>
              <p className="text-xs text-slate-400">Últimos atendimentos cadastrados no sistema</p>
            </div>
            <button
              onClick={onNavigateToOrdens}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Tabela Completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Orders */}
          <div className="divide-y divide-slate-800">
            {displayedOrdens.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                Nenhuma ordem de serviço cadastrada no momento.
              </div>
            ) : (
              displayedOrdens.map((os) => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'EM_ANDAMENTO':
                      return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Em Andamento' };
                    case 'AGUARDANDO_PECAS':
                      return { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Aguardando Peça' };
                    case 'ORCAMENTO':
                      return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Orçamento' };
                    case 'FINALIZADA':
                    case 'ENTREGUE':
                      return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Concluída' };
                    default:
                      return { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
                  }
                };

                const badge = getStatusBadge(os.status);
                const orderIndexNumber = os.numeroOS.replace('OS-2026-00', '#').replace('OS-2026-0', '#');

                return (
                  <div
                    key={os.id}
                    onClick={() => onSelectOS(os)}
                    className="py-3.5 first:pt-2 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/80 p-2 rounded-2xl transition-colors cursor-pointer group"
                  >
                    {/* Left: Tag + Details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-500/30">
                        {orderIndexNumber}
                      </div>

                      <div className="min-w-0">
                        {/* Meta line */}
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-mono text-xs font-bold text-white">{os.numeroOS}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          {os.tecnico && (
                            <span className="text-xs text-slate-400 font-medium">
                              Técnico: <strong className="text-slate-200">{os.tecnico.nome}</strong>
                            </span>
                          )}
                        </div>

                        {/* Equipment */}
                        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm truncate max-w-[340px] sm:max-w-[420px]">
                          {os.equipamento.tipo} {os.equipamento.marca} {os.equipamento.modelo}
                        </h4>

                        {/* Client and date */}
                        <p className="text-xs text-slate-400 mt-0.5">
                          Cliente: <strong className="text-slate-200">{os.cliente?.nome || 'Cliente'}</strong> • {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Right: Value + Action Buttons */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800"
                    >
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Valor Total
                        </span>
                        <span className="text-sm font-black text-white">
                          {formatCurrency(os.valorTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectOS(os)}
                          title="Editar Ordem de Serviço"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-indigo-400 hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {onPrintOS && (
                          <button
                            onClick={() => onPrintOS(os)}
                            title="Imprimir Comprovante da OS"
                            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. FOOTER INFERIOR (CONFORME O LAYOUT OFICIAL)                  */}
      {/* ============================================================== */}
      <footer className="pt-6 pb-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          OS Master © 2026 - Sistema de Gestão de Ordens de Serviço & Assistência Técnica.
        </div>

        <div className="flex items-center gap-2 flex-wrap text-slate-400">
          <button
            onClick={onNavigateToEstoque}
            title="Ver catálogo de estoque"
            className="hover:text-indigo-400 transition-colors font-medium cursor-pointer"
          >
            Estoque ({metrics?.totalPecas ?? 0} itens)
          </button>
          <span>•</span>
          <button
            onClick={() => setShowTerminalModal(true)}
            title="Abrir guia de comandos de desenvolvimento"
            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Comandos do Terminal & MySQL</span>
          </button>
          <span>•</span>
          <button
            onClick={onNavigateToClientes}
            title="Ver lista de clientes"
            className="hover:text-indigo-400 transition-colors font-medium cursor-pointer"
          >
            Clientes ({clientes.length})
          </button>
          <span>•</span>
          <button
            onClick={onNavigateToTecnicos}
            title="Ver cadastro de usuários"
            className="hover:text-indigo-400 transition-colors font-medium cursor-pointer"
          >
            Usuários ({tecnicos.length})
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 7. MODAL: COMANDOS DO TERMINAL & MYSQL                         */}
      {/* ============================================================== */}
      {showTerminalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Comandos do Terminal & MySQL</h3>
                  <p className="text-xs text-slate-500">Guia de desenvolvimento e banco de dados do OS Master</p>
                </div>
              </div>
              <button
                onClick={() => setShowTerminalModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {terminalCommands.map((item, idx) => (
                <div key={idx} className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-sans font-semibold">
                    <span>{item.title}</span>
                    <button
                      onClick={() => handleCopyCommand(item.cmd, idx)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-emerald-400 select-all">$ {item.cmd}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTerminalModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
