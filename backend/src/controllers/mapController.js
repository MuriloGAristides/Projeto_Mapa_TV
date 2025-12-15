const pool = require('../config/db');

// --- Função: Buscar Imagem ---
const getImage = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT imagem_descricao FROM oficina_64.aplicacao_img_descri WHERE id_aplic = $1 LIMIT 1',
            [req.params.id]
        );
        if (result.rows.length > 0 && result.rows[0].imagem_descricao) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(result.rows[0].imagem_descricao);
        } else {
            res.status(404).send('Not found');
        }
    } catch (err) { res.status(500).send(err.message); }
};

// --- Função: Buscar Dados do Mapa ---
const getMapData = async (req, res) => {
    try {
        const { companyId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        // 1. GPS
        const gpsQuery = `
            WITH UltimaAEM AS (
                SELECT DISTINCT ON (numero_placa_veiculo)
                    numero_placa_veiculo AS placa,
                    codigo_grupo_estoque 
                FROM tabelas_64.cadvendamovtoanoaems
                WHERE data_emissao >= (NOW() - INTERVAL '15 days')
                ORDER BY numero_placa_veiculo, data_emissao DESC, hora_emissao DESC
            )
            SELECT DISTINCT ON (g.placa)
                g.placa, g.lat, g.lon, (g.data + g.hora) as event_time, ua.codigo_grupo_estoque
            FROM tabelas_64.cadvendamovtoano_entregas_gps g
            INNER JOIN UltimaAEM ua ON g.placa = ua.placa
            WHERE (g.data + g.hora) >= (NOW() - INTERVAL '24 hours')
              AND ua.codigo_grupo_estoque = $1 
            ORDER BY g.placa, g.data DESC, g.hora DESC
        `;
        const gpsRes = await pool.query(gpsQuery, [companyId]);

        // 2. Status Ao Vivo
        const statusQuery = `
            SELECT e.placa, c.nome_cliente, e.status
            FROM tabelas_64.cadvendamovtoano_entregas e
            LEFT JOIN tabelas_64.cadcobraclientes c ON e.codigo_cliente = c.codigo_cliente
            WHERE e.empresa = $1 AND e.status IN (1, 3) 
            AND e.data_cadastro >= (NOW() - INTERVAL '7 days')
        `;
        const statusRes = await pool.query(statusQuery, [companyId]);

        // 3. Última Entrega
        const lastDeliveryQuery = `
            SELECT 
                e.id_entrega, e.caminho_foto, e.placa, e.quantidade,
                c.nome_cliente, p.nome_produto,
                (e.data_fim + e.hora_fim) as event_time,
                CASE WHEN e.empresa = 1 THEN 'UN' ELSE 'TON' END as unit
            FROM tabelas_64.cadvendamovtoano_entregas e
            LEFT JOIN tabelas_64.cadcobraclientes c ON e.codigo_cliente = c.codigo_cliente
            LEFT JOIN tabelas_64.cadestoqprodutos p ON e.codigo_produto = p.codigo_produto
            WHERE e.empresa = $1 
              AND e.status = 2
              AND e.caminho_foto IS NOT NULL 
              AND LENGTH(e.caminho_foto) > 0
              AND e.data_fim >= (NOW() - INTERVAL '48 hours')
            ORDER BY e.data_fim DESC, e.hora_fim DESC
            LIMIT 1
        `;
        const deliveryRes = await pool.query(lastDeliveryQuery, [companyId]);

        // --- Formatação ---
        const formatGps = gpsRes.rows.map(r => ({
            plate: r.placa.trim(),
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            eventTime: r.event_time,
            empresa: r.empresa
        }));

        const formatStatus = statusRes.rows.map(r => ({
            plate: r.placa.trim(),
            client: (r.nome_cliente || 'Diversos').trim(),
            status: r.status
        }));

        let latestDelivery = null;
        if (deliveryRes.rows.length > 0) {
            const row = deliveryRes.rows[0];
            latestDelivery = {
                plate: row.placa.trim(),
                client: (row.nome_cliente || 'Diversos').trim(),
                productName: (row.nome_produto || '').trim(),
                eventTime: row.event_time,
                photoUrl: row.caminho_foto,
                unit: row.unit
            };
        }

        res.json({ gps: formatGps, liveStatus: formatStatus, latestDelivery });

    } catch (error) {
        console.error("Erro API Map Data:", error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};

module.exports = { getMapData, getImage };