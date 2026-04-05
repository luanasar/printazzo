import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [observacao, setObservacao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");

  function carregarClientes() {
    fetch(`${API_URL}/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(data));
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  function adicionarCliente() {
    fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        nome,
        telefone,
        instagram,
        observacoes: observacao,
      }),
    }).then(() => {
      carregarClientes();

      setNome("");
      setTelefone("");
      setInstagram("");
      setObservacao("");
    });
  }

  function excluirCliente(id) {
    fetch(`${API_URL}/clientes/${id}`, {
      method: "DELETE",
    }).then(() => {
      carregarClientes();
    });
  }

  function iniciarEdicao(cliente) {
    setEditandoId(cliente.id);
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setInstagram(cliente.instagram);
    setObservacao(cliente.observacoes);
  }

  function salvarEdicao() {
    fetch(`${API_URL}/clientes/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        nome,
        telefone,
        instagram,
        observacoes: observacao,
      }),
    }).then(() => {
      carregarClientes();
      setEditandoId(null);

      setNome("");
      setTelefone("");
      setInstagram("");
      setObservacao("");
    });
  }

  return (
    <div>
      <h2>Clientes</h2>
      <input
        type="text"
        placeholder="Buscar cliente"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <h3>Novo Cliente</h3>
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />
      <input
        placeholder="Instagram"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
      />
      <input
        placeholder="Observações"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />
      {editandoId ? (
        <button onClick={salvarEdicao}>Salvar edição</button>
      ) : (
        <button onClick={adicionarCliente}>Adicionar Cliente</button>
      )}

      <h3>Lista de Clientes</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Instagram</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clientes
            .filter((cliente) =>
              (cliente.nome || "").toLowerCase().includes(busca.toLowerCase()),
            )
            .map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.instagram}</td>
                <td>{cliente.observacoes}</td>
                <td>
                  <button onClick={() => iniciarEdicao(cliente)}>Editar</button>

                  <button onClick={() => excluirCliente(cliente.id)}>
                    Exlcuir
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
