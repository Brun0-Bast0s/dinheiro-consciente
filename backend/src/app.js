const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const transacaoRoutes = require('./routes/transacaoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const metaRoutes = require('./routes/metaRoutes');
const limiteRoutes = require('./routes/limiteRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Rota simples para testar se a API esta no ar
app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok', projeto: 'Dinheiro Consciente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/transacoes', transacaoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/limites', limiteRoutes);

// Rota de API inexistente
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Entrega o front-end pelo proprio servidor: abra http://localhost:3000
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

module.exports = app;
