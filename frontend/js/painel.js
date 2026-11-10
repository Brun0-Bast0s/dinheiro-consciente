// ===== Protecao da pagina: sem token, volta para o login =====
const usuarioLogado = obterUsuario();
if (!obterToken() || !usuarioLogado) {
  window.location.href = 'login.html';
}

const $ = (id) => document.getElementById(id);
let categorias = []; // cache das categorias (receita e despesa)

function hoje() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}
function mesAtual() {
  return hoje().slice(0, 7);
}
function tratarErro(erro) {
  mostrarMensagem(erro.message, 'erro');
}

// ===== Cabecalho e abas =====
$('nome-usuario').textContent = usuarioLogado.nome;
$('perfil-usuario').textContent = usuarioLogado.perfil;
$('btn-sair').addEventListener('click', sair);

// Esconder a aba e so conveniencia: quem realmente barra o acesso e a API (autorizar('admin'))
if (usuarioLogado.perfil === 'admin') $('aba-admin-btn').classList.remove('oculto');

$('abas').addEventListener('click', (evento) => {
  const aba = evento.target.dataset.aba;
  if (!aba) return;
  document.querySelectorAll('#abas button').forEach((b) => b.classList.toggle('ativa', b === evento.target));
  document.querySelectorAll('main > section').forEach((s) => s.classList.add('oculto'));
  $('aba-' + aba).classList.remove('oculto');
  carregarAba(aba);
});

function carregarAba(aba) {
  if (aba === 'resumo') carregarResumo();
  if (aba === 'transacoes') carregarTransacoes();
  if (aba === 'metas') carregarMetas();
  if (aba === 'limites') carregarLimites();
  if (aba === 'admin') { carregarCategoriasAdmin(); carregarUsuarios(); }
}

// ===== Categorias (usadas em varios selects) =====
async function carregarCategorias() {
  categorias = await api('/categorias');
  preencherSelectTransacao();
  preencherSelectLimite();
}

function preencherSelect(select, lista, valorSelecionado) {
  select.replaceChildren(...lista.map((c) => criar('option', { value: c.id }, c.nome)));
  if (valorSelecionado) select.value = valorSelecionado;
}
function preencherSelectTransacao(valorSelecionado) {
  preencherSelect($('t-categoria'), categorias.filter((c) => c.tipo === $('t-tipo').value), valorSelecionado);
}
function preencherSelectLimite() {
  preencherSelect($('l-categoria'), categorias.filter((c) => c.tipo === 'despesa'));
}

// ===== RESUMO =====
async function carregarResumo() {
  try {
    const r = await api('/transacoes/resumo?mes=' + $('resumo-mes').value);
    $('ind-receitas').textContent = formatarDinheiro(r.receitas);
    $('ind-despesas').textContent = formatarDinheiro(r.despesas);
    $('ind-saldo').textContent = formatarDinheiro(r.saldo);
    $('ind-saldo').className = r.saldo >= 0 ? 'receita' : 'despesa';

    $('alertas').replaceChildren(
      ...(r.alertas.length
        ? r.alertas.map((a) => criar('div', { class: 'alerta ' + a.nivel }, a.mensagem))
        : [criar('div', { class: 'alerta ok' }, 'Tudo certo por aqui: nenhum alerta neste mês.')])
    );

    $('tabela-resumo').replaceChildren(
      ...(r.porCategoria.length
        ? r.porCategoria.map((c) =>
            criar('tr', {},
              criar('td', {}, c.categoria),
              criar('td', { class: c.limite !== null && c.total > c.limite ? 'despesa' : '' }, formatarDinheiro(c.total)),
              criar('td', {}, c.limite !== null ? formatarDinheiro(c.limite) : '—')))
        : [criar('tr', {}, criar('td', { colspan: 3, class: 'vazio' }, 'Nenhuma despesa neste mês.'))])
    );
  } catch (erro) {
    tratarErro(erro);
  }
}
$('resumo-mes').value = mesAtual();
$('resumo-mes').addEventListener('change', carregarResumo);

// ===== TRANSACOES (CRUD) =====
async function carregarTransacoes() {
  try {
    const params = new URLSearchParams();
    if ($('f-mes').value) params.set('mes', $('f-mes').value);
    if ($('f-tipo').value) params.set('tipo', $('f-tipo').value);
    const lista = await api('/transacoes?' + params.toString());

    $('tabela-transacoes').replaceChildren(
      ...(lista.length
        ? lista.map((t) =>
            criar('tr', {},
              criar('td', {}, formatarData(t.data_transacao)),
              criar('td', { class: t.tipo }, t.tipo),
              criar('td', {}, t.categoria),
              criar('td', {}, t.descricao || ''),
              criar('td', { class: t.tipo }, formatarDinheiro(t.valor)),
              criar('td', {}, criar('div', { class: 'acoes' },
                criar('button', { class: 'btn sec mini', onclick: () => editarTransacao(t) }, 'Editar'),
                criar('button', { class: 'btn perigo mini', onclick: () => excluirTransacao(t.id) }, 'Excluir')))))
        : [criar('tr', {}, criar('td', { colspan: 6, class: 'vazio' }, 'Nenhuma transação encontrada.'))])
    );
  } catch (erro) {
    tratarErro(erro);
  }
}

function limparFormTransacao() {
  $('form-transacao').reset();
  $('t-id').value = '';
  $('t-data').value = hoje();
  $('titulo-form-transacao').textContent = 'Nova transação';
  $('btn-cancelar-transacao').classList.add('oculto');
  preencherSelectTransacao();
}

function editarTransacao(t) {
  $('t-id').value = t.id;
  $('t-tipo').value = t.tipo;
  preencherSelectTransacao(t.categoria_id);
  $('t-valor').value = t.valor;
  $('t-data').value = String(t.data_transacao).slice(0, 10);
  $('t-descricao').value = t.descricao || '';
  $('titulo-form-transacao').textContent = 'Editando transação #' + t.id;
  $('btn-cancelar-transacao').classList.remove('oculto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function excluirTransacao(id) {
  if (!confirm('Excluir esta transação?')) return;
  try {
    await api('/transacoes/' + id, { method: 'DELETE' });
    mostrarMensagem('Transação excluída.');
    carregarTransacoes();
  } catch (erro) {
    tratarErro(erro);
  }
}

$('t-tipo').addEventListener('change', () => preencherSelectTransacao());
$('btn-cancelar-transacao').addEventListener('click', limparFormTransacao);
$('f-mes').addEventListener('change', carregarTransacoes);
$('f-tipo').addEventListener('change', carregarTransacoes);

$('form-transacao').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = $('t-id').value;
  const corpo = {
    tipo: $('t-tipo').value,
    categoria_id: Number($('t-categoria').value),
    valor: $('t-valor').value,
    data_transacao: $('t-data').value,
    descricao: $('t-descricao').value
  };
  try {
    // Com id = edicao (PUT); sem id = cadastro novo (POST)
    await api(id ? '/transacoes/' + id : '/transacoes', { method: id ? 'PUT' : 'POST', body: JSON.stringify(corpo) });
    mostrarMensagem(id ? 'Transação atualizada.' : 'Transação cadastrada.');
    limparFormTransacao();
    carregarTransacoes();
  } catch (erro) {
    tratarErro(erro);
  }
});

// ===== METAS (CRUD) =====
async function carregarMetas() {
  try {
    const metas = await api('/metas');
    $('lista-metas').replaceChildren(
      ...(metas.length
        ? metas.map((m) =>
            criar('div', { class: 'meta' },
              criar('div', { class: 'meta-topo' },
                criar('strong', {}, m.titulo),
                criar('div', { class: 'acoes' },
                  criar('button', { class: 'btn sec mini', onclick: () => editarMeta(m) }, 'Editar'),
                  criar('button', { class: 'btn perigo mini', onclick: () => excluirMeta(m.id) }, 'Excluir'))),
              criar('div', { class: 'barra' }, criar('div', { style: `width:${m.progresso}%` })),
              criar('div', { class: 'pequeno' },
                `${formatarDinheiro(m.valor_atual)} de ${formatarDinheiro(m.valor_meta)} (${m.progresso}%)`,
                m.prazo ? ` · prazo: ${formatarData(m.prazo)}` : '')))
        : [criar('div', { class: 'card vazio' }, 'Você ainda não criou nenhuma meta.')])
    );
  } catch (erro) {
    tratarErro(erro);
  }
}

function limparFormMeta() {
  $('form-meta').reset();
  $('m-id').value = '';
  $('titulo-form-meta').textContent = 'Nova meta';
  $('btn-cancelar-meta').classList.add('oculto');
}

function editarMeta(m) {
  $('m-id').value = m.id;
  $('m-titulo').value = m.titulo;
  $('m-valor-meta').value = m.valor_meta;
  $('m-valor-atual').value = m.valor_atual;
  $('m-prazo').value = m.prazo ? String(m.prazo).slice(0, 10) : '';
  $('titulo-form-meta').textContent = 'Editando meta #' + m.id;
  $('btn-cancelar-meta').classList.remove('oculto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function excluirMeta(id) {
  if (!confirm('Excluir esta meta?')) return;
  try {
    await api('/metas/' + id, { method: 'DELETE' });
    mostrarMensagem('Meta excluída.');
    carregarMetas();
  } catch (erro) {
    tratarErro(erro);
  }
}

$('btn-cancelar-meta').addEventListener('click', limparFormMeta);
$('form-meta').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = $('m-id').value;
  const corpo = {
    titulo: $('m-titulo').value,
    valor_meta: $('m-valor-meta').value,
    valor_atual: $('m-valor-atual').value || 0,
    prazo: $('m-prazo').value || null
  };
  try {
    await api(id ? '/metas/' + id : '/metas', { method: id ? 'PUT' : 'POST', body: JSON.stringify(corpo) });
    mostrarMensagem(id ? 'Meta atualizada.' : 'Meta criada.');
    limparFormMeta();
    carregarMetas();
  } catch (erro) {
    tratarErro(erro);
  }
});

// ===== LIMITES =====
async function carregarLimites() {
  try {
    const limites = await api('/limites');
    $('tabela-limites').replaceChildren(
      ...(limites.length
        ? limites.map((l) =>
            criar('tr', {},
              criar('td', {}, l.categoria),
              criar('td', {}, formatarDinheiro(l.valor_limite)),
              criar('td', {}, criar('button', { class: 'btn perigo mini', onclick: () => excluirLimite(l.categoria_id) }, 'Remover'))))
        : [criar('tr', {}, criar('td', { colspan: 3, class: 'vazio' }, 'Nenhum limite definido.'))])
    );
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluirLimite(categoriaId) {
  try {
    await api('/limites/' + categoriaId, { method: 'DELETE' });
    mostrarMensagem('Limite removido.');
    carregarLimites();
  } catch (erro) {
    tratarErro(erro);
  }
}

$('form-limite').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await api('/limites/' + $('l-categoria').value, { method: 'PUT', body: JSON.stringify({ valor_limite: $('l-valor').value }) });
    mostrarMensagem('Limite salvo.');
    $('l-valor').value = '';
    carregarLimites();
  } catch (erro) {
    tratarErro(erro);
  }
});

// ===== ADMIN: categorias e usuarios =====
async function carregarCategoriasAdmin() {
  try {
    await carregarCategorias();
    $('tabela-categorias').replaceChildren(
      ...categorias.map((c) =>
        criar('tr', {},
          criar('td', {}, c.nome),
          criar('td', { class: c.tipo }, c.tipo),
          criar('td', {}, criar('div', { class: 'acoes' },
            criar('button', { class: 'btn sec mini', onclick: () => editarCategoria(c) }, 'Editar'),
            criar('button', { class: 'btn perigo mini', onclick: () => excluirCategoria(c.id) }, 'Excluir')))))
    );
  } catch (erro) {
    tratarErro(erro);
  }
}

function limparFormCategoria() {
  $('form-categoria').reset();
  $('c-id').value = '';
  $('btn-cancelar-categoria').classList.add('oculto');
}
function editarCategoria(c) {
  $('c-id').value = c.id;
  $('c-nome').value = c.nome;
  $('c-tipo').value = c.tipo;
  $('btn-cancelar-categoria').classList.remove('oculto');
}
async function excluirCategoria(id) {
  if (!confirm('Excluir esta categoria?')) return;
  try {
    await api('/categorias/' + id, { method: 'DELETE' });
    mostrarMensagem('Categoria excluída.');
    carregarCategoriasAdmin();
  } catch (erro) {
    tratarErro(erro);
  }
}
$('btn-cancelar-categoria').addEventListener('click', limparFormCategoria);
$('form-categoria').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = $('c-id').value;
  try {
    await api(id ? '/categorias/' + id : '/categorias', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({ nome: $('c-nome').value, tipo: $('c-tipo').value })
    });
    mostrarMensagem(id ? 'Categoria atualizada.' : 'Categoria criada.');
    limparFormCategoria();
    carregarCategoriasAdmin();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function carregarUsuarios() {
  try {
    const usuarios = await api('/usuarios');
    $('tabela-usuarios').replaceChildren(
      ...usuarios.map((u) => {
        const select = criar('select', {},
          ...['usuario', 'moderador', 'admin'].map((p) => criar('option', { value: p }, p)));
        select.value = u.perfil;
        const eVoce = u.id === usuarioLogado.id;
        select.disabled = eVoce; // a API tambem proibe alterar o proprio perfil
        return criar('tr', {},
          criar('td', {}, u.nome + (eVoce ? ' (você)' : '')),
          criar('td', {}, u.email),
          criar('td', {}, select),
          criar('td', {}, eVoce ? '' : criar('button', { class: 'btn mini', onclick: () => alterarPerfil(u.id, select.value) }, 'Salvar')));
      })
    );
  } catch (erro) {
    tratarErro(erro);
  }
}
async function alterarPerfil(id, perfil) {
  try {
    await api(`/usuarios/${id}/perfil`, { method: 'PUT', body: JSON.stringify({ perfil }) });
    mostrarMensagem('Perfil atualizado.');
  } catch (erro) {
    tratarErro(erro);
  }
}

// ===== Inicio =====
(async function iniciar() {
  try {
    await carregarCategorias();
    limparFormTransacao();
    carregarResumo();
  } catch (erro) {
    tratarErro(erro);
  }
})();
