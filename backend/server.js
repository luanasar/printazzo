const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//Banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Criar tabelas automaticamente

db.serialize(() => {
  console.log("Executando UPDATE");

  db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        instagram TEXT,
        observacoes TEXT)`);

  db.run(`
        CREATE TABLE IF NOT EXISTS modelos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT,
        subcategoria TEXT,
        escala TEXT,
        prazo INTEGER,
        impressos INTEGER DEFAULT 0)`);

  db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        modelo_id INTEGER,
        quantidade INTEGER,
        status TEXT,
        prazo INTEGER,
        valor REAL,
        impressora TEXT,
        entregue INTEGER DEFAULT 0)`);

  // db.run(
  //   "INSERT INTO modelos (nome, categoria, subcategoria, escala, prazo, valor) VALUE (?, ?, ?, ?, ?, ?)",
  //   [nome, categoria, subcategoria, escala, prazo, valor],
  // );
});

// Rota teste
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// CRIAR CLIENTE
app.post("/clientes", (req, res) => {
  const { nome, telefone, instagram, observacoes } = req.body;

  db.run(
    `INSERT INTO clientes (nome, telefone, instagram, observacoes) VALUES (?,?,?,?)`,
    [nome, telefone, instagram, observacoes],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ id: this.lastID });
      }
    },
  );
});

// LISTAR CLIENTES
app.get("/clientes", (req, res) => {
  db.all("SELECT * FROM clientes", (err, rows) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(rows);
    }
  });
});

// EDITAR CLIENTE
app.put("/clientes/:id", (req, res) => {
  const { nome, telefone, instagram, observacoes } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE clientes
    SET nome=?, telefone=?, instagram=?, observacoes=?
    WHERE id=?`,
    [nome, telefone, instagram, observacoes, id],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ update: this.changes });
      }
    },
  );
});

//DELETAR CLIENTE
app.delete("/clientes/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM clientes WHERE id=?`, [id], function (err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

//DASHBOARD
app.get("/dashboard", (req, res) => {
  db.all(
    `
    SELECT
      COUNT(*) as total_pedidos,
      COALESCE(SUM(valor), 0) as faturamento
    FROM pedidos
    WHERE strftime('%Y-%m', prazo) = strftime('%Y-%m', 'now')`,
    (err, rows) => {
      if (err) {
        res.status(500).json(err);
      } else {
        const totalPedidos = rows[0].total_pedidos || 0;
        const faturamento = rows[0].faturamento || 0;

        const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;

        res.json({
          totalPedidos,
          faturamento,
          ticketMedio,
        });
      }
    },
  );
});

//CRIAR MODELO
app.post("/modelos", (req, res) => {
  const { nome, categoria, subcategoria, escala, prazo, valor } = req.body;

  db.run(
    `INSERT INTO modelos (nome, categoria, subcategoria, escala, prazo, valor) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, categoria, subcategoria, escala, prazo, valor],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ id: this.lastID });
      }
    },
  );
});

//LISTAR MODELOS
app.get("/modelos", (req, res) => {
  db.all("SELECT * FROM modelos", (err, rows) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(rows);
    }
  });
});

//CRIAR PEDIDO
app.post("/pedidos", async (req, res) => {
  const {
    cliente_id,
    modelo_id,
    quantidade,
    status,
    prazo,
    valor,
    impressora,
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO pedidos
      (cliente_d, modelo_id, quantidade, status, prazo, valor, impressora)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [cliente_id, modelo_id, quantidade, status, prazo, valor, impressora],
    );

    res.json({ message: "Pedido criado com sucesso" });
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({ erro: "Erro ao criar pedido" });
  }
});

//LISTA PEDIDOS
app.get("/pedidos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
      c.nome AS cliente_nome,
      M.nome AS modelo_nome
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN modelos  ON p.modelo_id = m.id
      `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

//EDITAR PEDIDO
app.put("/pedidos/:id", async (req, res) => {
  const {
    cliente_id,
    modelo_id,
    quantidade,
    status,
    prazo,
    valor,
    impressora,
    entregue,
  } = req.body;
  try {
    await pool.query(
      `UPDATE pedidos SET
      cliente_id = $1,
      modelo_id = $2,
      quantidade = $3,
      status = $4,
      prazo = $5,
      valor = $6,
      impressora = $7
      WHERE id = $8`,
      [cliente_id, modelo_id, quantidade, status, prazo, valor, impressora, id],
    );
    res.json({ message: "Pedido atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar pedido:", err);
    res.status(500).json({ erro: "Erro ao atualizar pedido" });
  }

  // Buscar pedido atual
  db.get(
    "SELECT status FROM pedidos WHERE id = ?",
    [pedidoId],
    (err, pedidoAtual) => {
      if (err) return res.status(500).json(err);

      const statusAntigo = pedidoAtual?.status;

      //Se mudou para Finalizado
      if (status === "Finalizado" && statusAntigo !== "Finalizado") {
        //Atualizar impresos no modelo
        db.run(
          `UPDATE modelos
        SET impressos = COALESCE(impressos, 0) + ?
        WHERE id = ?`,
          [quantidade, modelo_id],
        );
      }
    },
  );

  db.run(
    `UPDATE pedidos
    SET
      cliente_id = COALESCE(?, cliente_id),
      modelo_id = COALESCE(?, modelo_id),
      quantidade = COALESCE(?, quantidade),
      status = COALESCE(?, status),
      prazo = COALESCE(?, prazo),
      valor = COALESCE(?, valor),
      impressora = COALESCE(?, impressora),
      entregue = COALESCE(?, entregue)
    WHERE id=?`,
    [
      cliente_id,
      modelo_id,
      quantidade,
      status,
      prazo,
      valor,
      impressora,
      entregue || 0,
      id,
    ],
    function (err) {
      if (err) {
        console.log("ERRO:", err.message);
        res.status(500).json(err);
      } else {
        res.json({ message: "Pedido atualizado" });
      }
    },
  );
});

//DELETAR PEDIDO
app.delete("/pedidos/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM pedidos WHERE id=?`, [id], function (err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

app.put("/pedidos/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.run(
    `UPDATE pedidos SET status=? WHERE id=?`,
    [status, id],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ update: this.changes });
      }
    },
  );
});

app.put("/modelos/:id", (req, res) => {
  const { nome, categoria, subcategoria, escala, prazo, valor, impressos } =
    req.body;
  const { id } = req.params;

  db.run(
    `UPDATE modelos
        SET nome=?, categoria=?, subcategoria=?, escala=?, prazo=?, valor=?, impressos=?
        WHERE id=?`,
    [nome, categoria, subcategoria, escala, prazo, valor, impressos, id],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ update: this.changes });
      }
    },
  );
});

app.delete("/modelos/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM modelos WHERE id=?`, [id], function (err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

app.get("/dashboard", (req, res) => {
  const dashboard = {};

  db.get(`SELECT COUNT(*) as total FROM clientes`, (err, row) => {
    dashboard.clientes = row.total;

    db.get(`SELECT COUNT(*) as total FROM pedidos`, (err, row) => {
      dashboard.pedidos = row.total;
      db.get(
        "SELECT COUNT(*) as total FROM pedidos WHERE status='Na fila'",
        (err, row) => {
          dashboard.fila = row.total;

          db.get(
            "SELECT COUNT(*) as total FROM pedidos WHERE status='Em impressão'",
            (err, row) => {
              dashboard.impressao = row.total;

              db.get(
                "SELECT COUNT(*) as total FROM pedidos WHERE status='Em pintura'",
                (err, row) => {
                  dashboard.pintura = row.total;

                  db.get(
                    "SELECT COUNT(*) as total FROM pedidos WHERE status='Finalizado'",
                    (err, row) => {
                      dashboard.finalizados = row.total;

                      db.get(
                        "SELECT COUNT(*) as total FROM pedidos WHERE status='Aguardando sinal'",
                        (err, row) => {
                          dashboard.aguardando = row.total;

                          res.json(dashboard);
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    });
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
