export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  cpfCnpj: string;
  tipoPessoa: 'PF' | 'PJ';
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes?: string;
  createdAt: string;
}

export interface Tecnico {
  id: string;
  nome: string;
  cargo?: 'ADMIN' | 'GESTOR' | 'TECNICO' | 'ATENDENTE';
  email: string;
  telefone: string;
  especialidades: string[];
  ativo: boolean;
  corIdentificacao: string;
  comissaoPercentual: number;
  loginUsuario?: string;
}

export type Usuario = Tecnico;

export interface PecaEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda: number;
  unidade: string;
}

export interface ItemOS {
  id: string;
  tipo: 'SERVICO' | 'PECA';
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  pecaId?: string;
}

export type StatusOS =
  | 'ORCAMENTO'
  | 'APROVADA'
  | 'EM_ANALISE'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_PECAS'
  | 'FINALIZADA'
  | 'ENTREGUE'
  | 'CANCELADA';

export type PrioridadeOS = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Equipamento {
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  acessorios?: string;
  estadoConservacao?: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteId: string;
  tecnicoId?: string;
  status: StatusOS;
  prioridade: PrioridadeOS;
  equipamento: Equipamento;
  defeitoRelatado: string;
  diagnosticoTecnico?: string;
  solucaoAplicada?: string;
  itens: ItemOS[];
  valorServicos: number;
  valorPecas: number;
  desconto: number;
  valorTotal: number;
  formaPagamento?: 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'BOLETO' | 'TRANSFERENCIA';
  statusPagamento: 'PENDENTE' | 'PAGO' | 'PARCIAL';
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  garantiaDias: number;
  termoGarantia?: string;
  historico?: {
    data: string;
    usuario: string;
    acao: string;
    observacao?: string;
  }[];
  cliente?: Cliente;
  tecnico?: Tecnico | null;
  horaRegistroHoje?: string;
}

export interface DashboardMetrics {
  totalOS: number;
  abertas: number;
  emAndamento: number;
  orcamentos: number;
  executando: number;
  aguardandoPecas: number;
  concluidas: number;
  faturamentoTotal: number;
  faturamentoPendente: number;
  faturamentoPrevisto?: number;
  ticketMedio: number;
  taxaSucesso: number;
  estoqueBaixo: number;
  totalPecas: number;
  valorTotalEstoque: number;
  // Métricas de Caixa de Hoje
  caixaHoje: {
    faturamentoHoje: number;
    ordensHojeCount: number;
    maoDeObraHoje: number;
    pecasHoje: number;
    ticketMedioHoje: number;
    variacaoOntemPercent: number;
    ordensFinalizadasHoje: OrdemServico[];
  };
  rankingStatus: {
    status: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
  servicoLider: {
    nome: string;
    execucoes: number;
    receitaTotal: number;
    precoMedio: number;
  };
  rankingServicos: {
    pos: number;
    nome: string;
    execucoes: number;
    receita: number;
  }[];
  volumeAcumuladoServicos: number;
  produtoCampeao: {
    nome: string;
    unidades: number;
    receitaTotal: number;
  };
  rankingProdutos: {
    pos: number;
    nome: string;
    unidades: number;
    precoMedio: number;
    participacao: number;
    receita: number;
    corBarra: string;
  }[];
  totalItensFaturados: number;
  receitaPecasTotal: number;
}

class InMemoryStore {
  private clientes: Cliente[] = [];
  private tecnicos: Tecnico[] = [
    {
      id: 'tec-admin',
      nome: 'Administrador Master',
      cargo: 'ADMIN',
      loginUsuario: 'admin',
      email: '87informatica@gmail.com',
      telefone: '(11) 99999-0000',
      especialidades: ['Administração Geral', 'Gestão & Homologação', 'Supervisão Técnica', 'Controle Financeiro'],
      ativo: true,
      corIdentificacao: '#6366F1',
      comissaoPercentual: 0
    }
  ];
  private estoque: PecaEstoque[] = [];
  private ordens: OrdemServico[] = [];

  // Métodos Clientes
  getClientes(search?: string): Cliente[] {
    if (!search) return [...this.clientes];
    const q = search.toLowerCase();
    return this.clientes.filter(
      c => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.telefone.includes(q) || c.cpfCnpj.includes(q)
    );
  }

  getClienteById(id: string): Cliente | undefined {
    return this.clientes.find(c => c.id === id);
  }

  createCliente(data: Omit<Cliente, 'id' | 'createdAt'>): Cliente {
    const novo: Cliente = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.clientes.unshift(novo);
    return novo;
  }

  updateCliente(id: string, data: Partial<Cliente>): Cliente | null {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.clientes[idx] = { ...this.clientes[idx], ...data };
    return this.clientes[idx];
  }

  deleteCliente(id: string): boolean {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.clientes.splice(idx, 1);
    return true;
  }

  // Métodos Técnicos / Usuários
  getTecnicos(): Tecnico[] {
    // Garante que o cadastro de usuários possua sempre o Administrador do sistema
    if (!this.tecnicos.some(t => t.cargo === 'ADMIN' || t.id === 'tec-admin')) {
      const adminMaster: Tecnico = {
        id: 'tec-admin',
        nome: 'Administrador Master',
        cargo: 'ADMIN',
        loginUsuario: 'admin',
        email: '87informatica@gmail.com',
        telefone: '(11) 99999-0000',
        especialidades: ['Administração Geral', 'Gestão & Homologação', 'Supervisão Técnica', 'Controle Financeiro'],
        ativo: true,
        corIdentificacao: '#6366F1',
        comissaoPercentual: 0
      };
      this.tecnicos.unshift(adminMaster);
    }
    return [...this.tecnicos];
  }

  getTecnicoById(id: string): Tecnico | undefined {
    return this.getTecnicos().find(t => t.id === id);
  }

  createTecnico(data: Omit<Tecnico, 'id'>): Tecnico {
    const novo: Tecnico = {
      ...data,
      id: `tec-${Date.now()}`
    };
    this.tecnicos.push(novo);
    return novo;
  }

  updateTecnico(id: string, data: Partial<Tecnico>): Tecnico | null {
    const idx = this.tecnicos.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tecnicos[idx] = { ...this.tecnicos[idx], ...data };
    return this.tecnicos[idx];
  }

  deleteTecnico(id: string): boolean {
    const idx = this.tecnicos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const target = this.tecnicos[idx];
    const adminCount = this.tecnicos.filter(t => t.cargo === 'ADMIN' || t.id === 'tec-admin').length;
    if ((target.cargo === 'ADMIN' || target.id === 'tec-admin') && adminCount <= 1) {
      return false;
    }
    this.tecnicos.splice(idx, 1);
    return true;
  }

  // Métodos Estoque
  getEstoque(filters?: { search?: string; categoria?: string } | string): PecaEstoque[] {
    let list = [...this.estoque];
    if (typeof filters === 'string') {
      const q = filters.toLowerCase();
      return list.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    if (filters?.categoria && filters.categoria !== 'TODAS') {
      list = list.filter(p => p.categoria === filters.categoria);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    return list;
  }

  getPecaById(id: string): PecaEstoque | undefined {
    return this.estoque.find(p => p.id === id);
  }

  createPeca(data: Omit<PecaEstoque, 'id'>): PecaEstoque {
    const nova: PecaEstoque = {
      ...data,
      id: `pec-${Date.now()}`
    };
    this.estoque.push(nova);
    return nova;
  }

  updatePeca(id: string, data: Partial<PecaEstoque>): PecaEstoque | null {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.estoque[idx] = { ...this.estoque[idx], ...data };
    return this.estoque[idx];
  }

  ajustarEstoque(id: string, diff: number): PecaEstoque | null {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.estoque[idx].quantidade = Math.max(0, this.estoque[idx].quantidade + diff);
    return this.estoque[idx];
  }

  deletePeca(id: string): boolean {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.estoque.splice(idx, 1);
    return true;
  }

  // Métodos Ordens de Serviço
  getOrdens(filters?: {
    status?: string;
    prioridade?: string;
    tecnicoId?: string;
    clienteId?: string;
    search?: string;
  }): OrdemServico[] {
    let list = [...this.ordens];

    if (filters?.status) {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters?.prioridade) {
      list = list.filter(o => o.prioridade === filters.prioridade);
    }
    if (filters?.tecnicoId) {
      list = list.filter(o => o.tecnicoId === filters.tecnicoId);
    }
    if (filters?.clienteId) {
      list = list.filter(o => o.clienteId === filters.clienteId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o => {
        const num = o.numeroOS.toLowerCase();
        const def = o.defeitoRelatado.toLowerCase();
        const equip = `${o.equipamento.tipo} ${o.equipamento.marca} ${o.equipamento.modelo}`.toLowerCase();
        return num.includes(q) || def.includes(q) || equip.includes(q);
      });
    }

    return list;
  }

  getOrdemById(id: string): OrdemServico | undefined {
    return this.ordens.find(o => o.id === id);
  }

  createOrdem(data: Partial<OrdemServico>): OrdemServico {
    const count = this.ordens.length + 1;
    const padCount = String(count).padStart(3, '0');
    const numeroOS = `OS-2026-${padCount}`;

    const nova: OrdemServico = {
      id: `os-${Date.now()}`,
      numeroOS,
      clienteId: data.clienteId || this.clientes[0].id,
      tecnicoId: data.tecnicoId,
      status: data.status || 'ORCAMENTO',
      prioridade: data.prioridade || 'MEDIA',
      equipamento: data.equipamento || { tipo: 'Equipamento', marca: '', modelo: '' },
      defeitoRelatado: data.defeitoRelatado || '',
      diagnosticoTecnico: data.diagnosticoTecnico,
      solucaoAplicada: data.solucaoAplicada,
      itens: data.itens || [],
      valorServicos: data.valorServicos || 0,
      valorPecas: data.valorPecas || 0,
      desconto: data.desconto || 0,
      valorTotal: data.valorTotal || 0,
      formaPagamento: data.formaPagamento,
      statusPagamento: data.statusPagamento || 'PENDENTE',
      dataAbertura: data.dataAbertura || new Date().toISOString(),
      dataPrevisao: data.dataPrevisao,
      garantiaDias: data.garantiaDias ?? 90,
      termoGarantia: data.termoGarantia,
      historico: [
        {
          data: new Date().toISOString(),
          usuario: 'Sistema',
          acao: 'Abertura de Ordem de Serviço'
        }
      ]
    };

    this.ordens.unshift(nova);
    return nova;
  }

  updateOrdem(id: string, data: Partial<OrdemServico>): OrdemServico | null {
    const idx = this.ordens.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.ordens[idx] = {
      ...this.ordens[idx],
      ...data
    };
    return this.ordens[idx];
  }

  deleteOrdem(id: string): boolean {
    const idx = this.ordens.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.ordens.splice(idx, 1);
    return true;
  }

  // Métricas do Dashboard
  getDashboardMetrics(): DashboardMetrics {
    const totalOS = this.ordens.length;
    const orcamentos = this.ordens.filter(o => o.status === 'ORCAMENTO').length;
    const emAndamento = this.ordens.filter(o => o.status === 'EM_ANDAMENTO').length;
    const aguardandoPecas = this.ordens.filter(o => o.status === 'AGUARDANDO_PECAS').length;
    const concluidas = this.ordens.filter(o => o.status === 'FINALIZADA' || o.status === 'ENTREGUE').length;
    const abertas = orcamentos + emAndamento + aguardandoPecas;

    const faturamentoTotal = this.ordens
      .filter(o => o.status === 'FINALIZADA' || o.status === 'ENTREGUE')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const faturamentoPendente = this.ordens
      .filter(o => o.statusPagamento === 'PENDENTE')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const faturamentoPrevisto = this.ordens
      .filter(o => o.status !== 'FINALIZADA' && o.status !== 'ENTREGUE' && o.status !== 'CANCELADA')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);

    const ticketMedio = concluidas > 0 ? faturamentoTotal / concluidas : 0;
    const taxaSucesso = totalOS > 0 ? Number(((concluidas / totalOS) * 100).toFixed(1)) : 0;

    const estoqueBaixo = this.estoque.filter(p => p.quantidade <= p.quantidadeMinima).length;
    const totalPecas = this.estoque.reduce((acc, p) => acc + p.quantidade, 0);
    const valorTotalEstoque = this.estoque.reduce((acc, p) => acc + (p.quantidade * p.precoVenda), 0);

    // Ordens finalizadas hoje
    const ordensFinalizadasHoje = this.ordens.filter(o => o.horaRegistroHoje && (o.status === 'FINALIZADA' || o.status === 'ENTREGUE'));
    const faturamentoHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const maoDeObraHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorServicos || 0), 0);
    const pecasHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorPecas || 0), 0);
    const ticketMedioHojeCalc = ordensFinalizadasHoje.length > 0 ? faturamentoHojeCalc / ordensFinalizadasHoje.length : 0;

    // Agregação de Serviços
    const servicosMap = new Map<string, { nome: string; execucoes: number; receita: number }>();
    for (const os of this.ordens) {
      for (const item of os.itens) {
        if (item.tipo === 'SERVICO') {
          const prev = servicosMap.get(item.descricao) || { nome: item.descricao, execucoes: 0, receita: 0 };
          prev.execucoes += item.quantidade;
          prev.receita += item.subtotal;
          servicosMap.set(item.descricao, prev);
        }
      }
    }
    const sortedServicos = Array.from(servicosMap.values()).sort((a, b) => b.execucoes - a.execucoes || b.receita - a.receita);
    const servicoLider = sortedServicos[0] ? {
      nome: sortedServicos[0].nome,
      execucoes: sortedServicos[0].execucoes,
      receitaTotal: sortedServicos[0].receita,
      precoMedio: Math.round(sortedServicos[0].receita / (sortedServicos[0].execucoes || 1))
    } : {
      nome: 'Nenhum serviço registrado',
      execucoes: 0,
      receitaTotal: 0,
      precoMedio: 0
    };
    const rankingServicos = sortedServicos.slice(0, 4).map((s, idx) => ({
      pos: idx + 1,
      nome: s.nome,
      execucoes: s.execucoes,
      receita: s.receita
    }));

    // Agregação de Peças e Produtos
    const pecasMap = new Map<string, { nome: string; unidades: number; receita: number }>();
    let totalItensFaturados = 0;
    let receitaPecasTotal = 0;
    for (const os of this.ordens) {
      for (const item of os.itens) {
        if (item.tipo === 'PECA') {
          const prev = pecasMap.get(item.descricao) || { nome: item.descricao, unidades: 0, receita: 0 };
          prev.unidades += item.quantidade;
          prev.receita += item.subtotal;
          pecasMap.set(item.descricao, prev);
          totalItensFaturados += item.quantidade;
          receitaPecasTotal += item.subtotal;
        }
      }
    }
    const sortedPecas = Array.from(pecasMap.values()).sort((a, b) => b.unidades - a.unidades || b.receita - a.receita);
    const produtoCampeao = sortedPecas[0] ? {
      nome: sortedPecas[0].nome,
      unidades: sortedPecas[0].unidades,
      receitaTotal: sortedPecas[0].receita
    } : {
      nome: 'Nenhum produto faturado',
      unidades: 0,
      receitaTotal: 0
    };
    const cores = ['#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#D946EF'];
    const rankingProdutos = sortedPecas.slice(0, 5).map((p, idx) => ({
      pos: idx + 1,
      nome: p.nome,
      unidades: p.unidades,
      precoMedio: p.unidades > 0 ? Math.round(p.receita / p.unidades) : 0,
      participacao: totalItensFaturados > 0 ? Number(((p.unidades / totalItensFaturados) * 100).toFixed(1)) : 0,
      receita: p.receita,
      corBarra: cores[idx % cores.length]
    }));

    const percentOr = totalOS > 0 ? Math.round((orcamentos / totalOS) * 100) : 0;
    const percentEm = totalOS > 0 ? Math.round((emAndamento / totalOS) * 100) : 0;
    const percentAg = totalOS > 0 ? Math.round((aguardandoPecas / totalOS) * 100) : 0;
    const percentCo = totalOS > 0 ? Math.round((concluidas / totalOS) * 100) : 0;

    return {
      totalOS,
      abertas,
      emAndamento,
      orcamentos,
      executando: emAndamento,
      aguardandoPecas,
      concluidas,
      faturamentoTotal,
      faturamentoPendente,
      faturamentoPrevisto,
      ticketMedio,
      taxaSucesso,
      estoqueBaixo,
      totalPecas,
      valorTotalEstoque,
      caixaHoje: {
        faturamentoHoje: faturamentoHojeCalc,
        ordensHojeCount: ordensFinalizadasHoje.length,
        maoDeObraHoje: maoDeObraHojeCalc,
        pecasHoje: pecasHojeCalc,
        ticketMedioHoje: ticketMedioHojeCalc,
        variacaoOntemPercent: 0,
        ordensFinalizadasHoje
      },
      rankingStatus: [
        { status: 'ORCAMENTO', label: 'Orçamento', count: orcamentos, percent: percentOr, color: '#f59e0b' },
        { status: 'EM_ANDAMENTO', label: 'Em Andamento', count: emAndamento, percent: percentEm, color: '#3b82f6' },
        { status: 'AGUARDANDO_PECAS', label: 'Aguardando Peça', count: aguardandoPecas, percent: percentAg, color: '#8b5cf6' },
        { status: 'FINALIZADA', label: 'Concluída', count: concluidas, percent: percentCo, color: '#10b981' }
      ],
      servicoLider,
      rankingServicos,
      volumeAcumuladoServicos: sortedServicos.reduce((acc, s) => acc + s.execucoes, 0),
      produtoCampeao,
      rankingProdutos,
      totalItensFaturados,
      receitaPecasTotal
    };
  }
}

export const dbStore = new InMemoryStore();
