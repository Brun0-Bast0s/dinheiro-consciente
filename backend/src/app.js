const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
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

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use(errorHandler);

module.exports = app;
