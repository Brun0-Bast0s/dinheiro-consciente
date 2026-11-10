document.getElementById('form-cadastro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await api('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
      })
    });
    mostrarMensagem('Cadastro realizado! Redirecionando para o login...');
    setTimeout(() => (window.location.href = 'login.html'), 1200);
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  }
});
