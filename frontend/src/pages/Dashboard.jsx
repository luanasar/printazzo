import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Dashboard() {
  const [dados, setDados] = useState({
    totalPedidos: 0,
    faturamento: 0,
    ticketMedio: 0,
  });

  function carregarDashboard() {
    fetch(`${API_URL}/dashboard`)
      .then((res) => res.json())
      .then((data) => setDados(data));
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#000",
            border: "1px solid black",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            minWidth: "180px",
          }}
        >
          <h3>Total de Pedidos</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {dados.totalPedidos}
          </p>
        </div>

        <div
          style={{
            color: "#000",
            border: "1px solid black",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            minWidth: "180px",
          }}
        >
          <h3>Faturamento</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>R$ {Number(dados.faturamento || 0).toFixed(2)}</p>
        </div>

        <div
          style={{
            color: "#000",
            border: "1px solid black",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            minWidth: "180px",
          }}
        >
          <h3>Ticket Médio</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>R$ {Number(dados.ticketMedio || 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
