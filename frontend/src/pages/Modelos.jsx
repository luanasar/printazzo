import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [escala, setEscala] = useState("");
  const [prazo, setPrazo] = useState("");
  const [valor, setValor] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroEscala, setFiltroEscala] = useState("");

  const categorias = [...new Set(modelos.map((m) => m.categoria))];

  function carregarModelos() {
    fetch(`${API_URL}/modelos`)
      .then((res) => res.json())
      .then((data) => setModelos(data));
  }

  useEffect(() => {
    carregarModelos();
  }, []);

  function adicionarModelo() {
    fetch(`${API_URL}/modelos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        categoria,
        subcategoria,
        escala,
        prazo,
        valor,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        carregarModelos();

        setNome("");
        setCategoria("");
        setSubcategoria("");
        setEscala("");
        setPrazo("");
        setValor("");
      });
  }

  function excluirModelo(id) {
    fetch(`${API_URL}/modelos/${id}`, {
      method: "DELETE",
    }).then(() => {
      carregarModelos();
    });
  }

  function iniciarEdicao(modelo) {
    setEditandoId(modelo.id);
    setNome(modelo.nome);
    setCategoria(modelo.categoria);
    setSubcategoria(modelo.subcategoria);
    setEscala(modelo.escala);
    setPrazo(modelo.prazo);
    setValor(modelo.valor);
  }

  function salvarEdicao() {
    fetch(`${API_URL}/modelos/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        nome,
        categoria,
        subcategoria,
        escala,
        prazo,
        valor,
        impressos: 0,
      }),
    }).then(() => {
      carregarModelos();
      setEditandoId(null);

      setNome("");
      setCategoria("");
      setSubcategoria("");
      setEscala("");
      setPrazo("");
      setValor("");
    });
  }

  // RENDERIZAÇÃO
  return (
    <div>
      <h3>Cadastrar novo modelo</h3>
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <input
        placeholder="Subcategoria"
        value={subcategoria}
        onChange={(e) => setSubcategoria(e.target.value)}
      />
      <input
        placeholder="Escala"
        value={escala}
        onChange={(e) => setEscala(e.target.value)}
      />
      <input
        placeholder="Prazo"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
      />
      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      {editandoId ? (
        <button onClick={salvarEdicao}>Salvar edição</button>
      ) : (
        <button onClick={adicionarModelo}>Adicionar</button>
      )}

      <h3>Filtros</h3>
      <select
        value={filtroCategoria}
        onChange={(e) => setFiltroCategoria(e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat} ({modelos.filter((m) => m.categoria === cat).length})
          </option>
        ))}
      </select>
      <button onClick={() => setFiltroCategoria("")}>Limpar Filtro</button>
      {/* <input
        placeholder="Filtrar categoria"
        value={filtroCategoria}
        onChange={(e) => setFiltroCategoria(e.target.value)}
      />

      <input
        placeholder="Filtrar subcategoria"
        value={filtroSubcategoria}
        onChange={(e) => setFiltroSubcategoria(e.target.value)}
      />

      <input
        placeholder="Filtrar escala"
        value={filtroEscala}
        onChange={(e) => setFiltroEscala(e.target.value)}
      /> */}

      <h2>Modelos disponíveis</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Subcategoria</th>
            <th>Escala</th>
            <th>Prazo</th>
            <th>Valor</th>
            <th>Impressos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {modelos
            .filter((modelo) => {
              return (
                modelo.categoria
                  .toLowerCase()
                  .includes(filtroCategoria.toLowerCase()) &&
                modelo.subcategoria
                  ?.toLowerCase()
                  .includes(filtroSubcategoria.toLowerCase()) &&
                modelo.escala.toLowerCase().includes(filtroEscala.toLowerCase())
              );
            })
            .filter((m) =>
              filtroCategoria ? m.categoria === filtroCategoria : true,
            )
            .map((modelo) => (
              <tr key={modelo.id}>
                <td>{modelo.nome}</td>
                <td>{modelo.categoria}</td>
                <td>{modelo.subcategoria}</td>
                <td>{modelo.escala}</td>
                <td>{modelo.prazo}</td>
                <td>{Number(modelo.valor).toFixed(2)}</td>
                <td>{modelo.impressos}</td>

                <td>
                  <button onClick={() => iniciarEdicao(modelo)}>Editar</button>
                  <button onClick={() => excluirModelo(modelo.id)}>
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

export default Modelos;
