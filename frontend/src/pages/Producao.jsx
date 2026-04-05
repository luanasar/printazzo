import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Producao() {
  const [dragAtivo, setDragAtivo] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [colunaAtiva, setColunaAtiva] = useState(null);
  const impressoras = ["Filamento", "Resina"];
  const statusList = [
    "Aguardando sinal",
    "Na fila",
    "Em impressão",
    "Em pintura",
    "Finalizado",
  ];
  const cores = {
    fundo: "#565e7eff",
    card: "#615c5cff",
    borda: "#dcdde1",
    texto: "#2f3640",
  };

  function carregarPedidos() {
    fetch(`${API_URL}/pedidos`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Pedidos:", data);
        setPedidos(data);
      })
      .catch((err) => console.error("Erro ao carregar pedidos:", err));
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  //Formatar data sem bug de fuso
  function formatarData(data) {
    if (!data) return "";
    return data.split("-").reverse().join("/");
  }

  function moverPedido(pedido, novaImpressora, novoStatus) {
    fetch(`${API_URL}/pedidos/${pedido.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cliente_id: pedido.cliente_id,
        modelo_id: pedido.modelo_id,
        quantidade: pedido.quantidade,
        status: novoStatus,
        prazo: pedido.prazo,
        valor: pedido.valor,
        impressora: novaImpressora,
      }),
    }).then(() => {
      carregarPedidos();
    });
  }

  function marcarEntregue(pedido) {
    fetch(`${API_URL}/pedidos/${pedido.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...pedido,
        entregue: pedido.entregue === 1 ? 0 : 1,
      }),
    }).then(() => carregarPedidos());
  }

  return (
    <div
      style={{
        backgroundColor: cores.fundo,
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: cores.texto,
        }}
      >
        Fila por Impressora
      </h2>
      <div>
        {impressoras.map((imp) => (
          <div key={imp}>
            <h2 style={{ marginBottom: "10px", color: cores.texto }}>
              🖨️ {imp}
            </h2>
            <div style={{ display: "flex", gap: "15px" }}>
              {statusList.map((status) => {
                const pedidosFiltrados = pedidos
                  .filter(
                    (p) => (p.impressora || "") === imp && p.status === status,
                  )
                  .sort((a, b) => {
                    if (!a.prazo) return 1;
                    if (!b.prazo) return -1;
                    return new Date(a.prazo) - new Date(b.prazo);
                  });

                return (
                  <div
                    key={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setColunaAtiva(`${imp}-${status}`)}
                    onDragLeave={() => setColunaAtiva(null)}
                    onDrop={(e) => {
                      e.preventDefault();

                      const pedidoId = e.dataTransfer.getData("pedidoId");
                      const pedido = pedidos.find((p) => p.id == pedidoId);

                      if (!pedido) return;
                      moverPedido(pedido, imp, status);
                      setColunaAtiva(null);
                    }}
                    style={{
                      color: cores.texto,
                      backgroundColor:
                        colunaAtiva === `${imp}-${status}`
                          ? "#eaf4ff"
                          : cores.card,
                      border:
                        colunaAtiva === `${imp}-${status}`
                          ? `2px dashed #00a8ff`
                          : `1px solid ${cores.borda}`,
                      borderRadius: "10px",
                      padding: "10px",
                      width: "250px",
                      minHeight: "250px",
                      transition: "0.2s",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <h4>{status}</h4>

                    {pedidosFiltrados.length === 0 && (
                      <p style={{ color: "gray" }}>Nenhum</p>
                    )}

                    {pedidosFiltrados.map((pedido) => {
                      const status = pedido.status?.trim().toLowerCase();
                      const corStatus =
                        status === "na fila"
                          ? "#fbc531"
                          : status === "em impressão"
                            ? "#00a8ff"
                            : status === "em pintura"
                              ? "#9c88ff"
                              : status === "aguardando sinal"
                                ? "#e84118"
                                : "#4cd137";
                      return (
                        <div
                          key={pedido.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "pedidoId",
                              String(pedido.id),
                            );
                            setDragAtivo(pedido.id);
                          }}
                          onDragEnd={() => setDragAtivo(null)}
                          style={{
                            backgroundColor: cores.card,
                            borderRadius: "8px",
                            padding: "10px",
                            marginBottom: "8px",
                            boxShadow:
                              dragAtivo === pedido.id
                                ? "0 8px 20px rgba(0,0,0,0.2)"
                                : "0 2px 4px rgba(0,0,0,0.1)",
                            cursor: "grab",
                            transition: "all 0.2s ease",
                            borderLeft: `5px solid ${corStatus}`,
                            transform:
                              dragAtivo === pedido.id
                                ? "scale(1.05)"
                                : "scale(1)",
                            opacity: dragAtivo === pedido.id ? 0.5 : 1,
                          }}
                        >
                          <b>{pedido.modelo_nome || "Modelo"}</b>
                          <p>{pedido.cliente_nome || "Cliente"}</p>
                          <p>Quantidade: {pedido.quantidade || 0}</p>
                          <p>Entrega: {formatarData(pedido.prazo)}</p>
                          <p>Status: {pedido.status || ""}</p>
                          <input
                            type="checkbox"
                            checked={pedido.entregue === 1}
                            onChange={() => marcarEntregue(pedido)}
                          />{" "}
                          Entregue
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Producao;
