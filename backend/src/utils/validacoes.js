// Funcoes de validacao reutilizadas pelos controllers

// Confere se o texto e uma data real no formato AAAA-MM-DD (rejeita 2026-02-31)
function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

// Confere se o valor e um numero positivo (ou >= 0 quando permitirZero)
function numeroValido(valor, { permitirZero = false } = {}) {
  if (valor === undefined || valor === null || valor === '') return false;
  const n = Number(valor);
  if (!Number.isFinite(n) || n > 99999999.99) return false;
  return permitirZero ? n >= 0 : n > 0;
}

// Converte o :id da URL em inteiro positivo (ou null se for invalido)
function idValido(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Devolve o primeiro e o ultimo dia (exclusivo) de um mes 'AAAA-MM'
function intervaloDoMes(mes) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes || '')) return null;
  const [ano, m] = mes.split('-').map(Number);
  const proximo = m === 12 ? `${ano + 1}-01-01` : `${ano}-${String(m + 1).padStart(2, '0')}-01`;
  return { inicio: `${mes}-01`, fim: proximo };
}

function mesAtual() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = { dataValida, numeroValido, idValido, intervaloDoMes, mesAtual };
