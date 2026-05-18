import { use, useEffect, useState } from "react";
import { API_URL } from "../api";

function Pedidos() {
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [modeloId, setModeloId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [status, setStatus] = useState("Na fila");
  const [prazo, setPrazo] = useState("");
  const [valor, setValor] = useState(0);
  const [impressora, setImpressora] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  function carregarClientes() {
    fetch(`${API_URL}/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(data));
  }

  function carregarModelos() {
    fetch(`${API_URL}/modelos`)
      .then((res) => res.json())
      .then((data) => setModelos(data));
  }

  function carregarPedidos() {
    fetch(`${API_URL}/pedidos`)
      .then((res) => res.json())
      .then((data) => setPedidos(data));
  }

  useEffect(() => {
    carregarClientes();
    carregarModelos();
    carregarPedidos();
  }, []);

  useEffect(() => {
    const modeloSelecionado = modelos.find((m) => m.id == modeloId);
    if (modeloSelecionado) {
      setValor((modeloSelecionado.valor || 0) * quantidade);
    }
  }, [modeloId, quantidade, modelos]);

  function criarPedido() {
    fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        cliente_id: clienteId,
        modelo_id: modeloId,
        quantidade,
        status,
        prazo,
        valor,
        impressora,
      }),
    }).then(() => {
      carregarPedidos();
    });
  }
  function excluirPedido(id) {
    fetch(`${API_URL}/pedidos/${id}`, {
      method: "DELETE",
    }).then(() => {
      carregarPedidos();
    });
  }

  function iniciarEdicao(pedido) {
    setEditandoId(pedido.id);
    setClienteId(pedido.cliente_id);
    setModeloId(pedido.modelo_id);
    setQuantidade(pedido.quantidade);
    setStatus(pedido.status);
    setPrazo(pedido.prazo);
    setValor(pedido.valor);
    setImpressora(pedido.impressora);
  }

  function salvarEdicao() {
    fetch(`${API_URL}/pedidos/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        cliente_id: clienteId,
        modelo_id: modeloId,
        quantidade,
        status,
        prazo,
        valor,
        impressora,
      }),
    }).then(() => {
      carregarPedidos();
      setEditandoId(null);
      setClienteId("");
      setModeloId("");
      setQuantidade(1);
      setStatus("Na fila");
      setPrazo("");
      setValor("");
      setImpressora("");
    });
  }

  function getPrioridade(prazo) {
    if (!prazo) return "";
    const hoje = new Date();
    const dataPrazo = new Date(prazo + "T00:00:00");

    const diff = (dataPrazo - hoje) / (1000 * 60 * 60 * 24);

    if (diff <= 2) return "Urgente";
    if (diff <= 5) return "Atenção";

    return "Tranquilo";
  }

  return (
    <div>
      <h2>Novo Pedido</h2>
      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
        <option value="">Selecione o cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nome}
          </option>
        ))}
      </select>
      <select
        value={modeloId}
        onChange={(e) => {
          const id = e.target.value;
          setModeloId(id);

          const modeloSelecionado = modelos.find((m) => m.id == id);

          if (modeloSelecionado) {
            setValor(modeloSelecionado.valor * quantidade);
          }
        }}
      >
        <option value="">Selecione o modelo</option>
        {modelos.map((modelo) => (
          <option key={modelo.id} value={modelo.id}>
            {modelo.nome}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Aguardando orçamento</option>
        <option>Aguardando sinal</option>
        <option>Na fila</option>
        <option>Em impressão</option>
        <option>Em pintura</option>
        <option>Finalizado</option>
      </select>

      <input
        type="date"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
      />

      <input
        type="number"
        placeholder="Valor (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <select
        value={impressora}
        onChange={(e) => setImpressora(e.target.value)}
      >
        <option value="">Selecione a impressora</option>
        <option>Filamento</option>
        <option>Resina</option>
      </select>
      {editandoId ? (
        <button onClick={salvarEdicao}>Salvar edição</button>
      ) : (
        <button onClick={criarPedido}>Criar Pedido</button>
      )}

      <h2>Pedidos</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Modelo</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Valor</th>
            <th>Prioridade</th>
            <th>Impressora</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {pedidos
            .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
            .map((pedido) => (
              <tr
                key={pedido.id}
                style={{
                  color:
                    getPrioridade(pedido.prazo) === "Urgente"
                      ? "#a70000"
                      : getPrioridade(pedido.prazo) === "Atenção"
                        ? "#a8a432"
                        : "#000",
                  backgroundColor:
                    getPrioridade(pedido.prazo) === "Urgente"
                      ? "#ffcccc"
                      : getPrioridade(pedido.prazo) === "Atenção"
                        ? "#fff3cd"
                        : "#ccffcc",
                }}
              >
                <td>{pedido.cliente_nome}</td>
                <td>{pedido.modelo_nome}</td>
                <td>{pedido.quantidade}</td>
                <td>{pedido.status}</td>
                <td>
                  {pedido.prazo
                    ? pedido.prazo.split("-").reverse().join("/")
                    : ""}
                </td>
                <td>R$ {Number(pedido.valor || 0).toFixed(2)}</td>
                <td>{getPrioridade(pedido.prazo)}</td>
                <td>{pedido.impressora}</td>
                <td>
                  <button onClick={() => iniciarEdicao(pedido)}>Editar</button>

                  <button onClick={() => excluirPedido(pedido.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pedidos;
