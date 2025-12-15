require('dotenv').config();
const express = require('express');
const cors = require('cors');

const mapRoutes = require('../backend/src/routes/mapRoutes');

const app = express();

// ===========================
//   CONFIGURAÇÃO DO CORS
// ===========================

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : [];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("🚫 CORS bloqueado para:", origin);
            callback(new Error("Acesso não permitido pelo CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ===========================
//         ROTAS
// ===========================

app.use('/api', mapRoutes);

// ===========================
//      INICIAR SERVIDOR
// ===========================
const PORT = process.env.PORT || 3002;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});