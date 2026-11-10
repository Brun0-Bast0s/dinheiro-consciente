if (obterToken()) window.location.href = 'painel.html';

document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const dados = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
      })
    });
    salvarSessao(dados.token, dados.usuario);
    window.location.href = 'painel.html';
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  }
});
