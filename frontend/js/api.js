// Funcoes compartilhadas por todas as paginas: sessao + chamadas a API com Fetch

// Se abrir pelo servidor (porta 3000) usa caminho relativo; se abrir de outro lugar (ex.: Live Server), aponta para o backend
const API_URL = location.port === '3000' ? '/api' : 'http://localhost:3000/api';

function obterToken() {
  return localStorage.getItem('token');
}

function obterUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch (e) {
    return null;
  }
}

function salvarSessao(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// Chama a API enviando o token JWT. Lanca Error com a mensagem vinda do back-end.
async function api(caminho, opcoes = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const resposta = await fetch(API_URL + caminho, { ...opcoes, headers });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch (e) {
    // resposta sem corpo JSON
  }

  // Token expirado ou invalido: volta para o login
  if (resposta.status === 401 && token) {
    sair();
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!resposta.ok) {
    throw new Error((dados && dados.erro) || 'Erro ao comunicar com o servidor.');
  }
  return dados;
}

// Cria elementos do DOM sem usar innerHTML (evita injecao de HTML/XSS com dados do usuario)
function criar(tag, propriedades = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [chave, valor] of Object.entries(propriedades)) {
    if (chave === 'class') el.className = valor;
    else if (chave.startsWith('on')) el.addEventListener(chave.slice(2), valor);
    else el.setAttribute(chave, valor);
  }
  for (const filho of filhos.flat()) {
    if (filho === null || filho === undefined) continue;
    el.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return el;
}

function formatarDinheiro(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(texto) {
  if (!texto) return '';
  const [ano, mes, dia] = String(texto).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// Mostra uma mensagem rapida no canto da tela
function mostrarMensagem(texto, tipo = 'ok') {
  let area = document.getElementById('mensagem');
  if (!area) {
    area = criar('div', { id: 'mensagem' });
    document.body.append(area);
  }
  const aviso = criar('div', { class: 'alerta ' + (tipo === 'erro' ? 'perigo' : 'ok') }, texto);
  area.append(aviso);
  setTimeout(() => aviso.remove(), 4000);
}
