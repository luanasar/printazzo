import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { API_URL } from "../api";

function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const cargaPorDia = {};
  const [pedidos, setPedidos] = useState([]);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  pedidos.forEach((p) => {
    if (!cargaPorDia[p.prazo]) {
      cargaPorDia[p.prazo] = 0;
    }

    cargaPorDia[p.prazo] += p.quantidade;
  });

  function carregarPedidos() {
    fetch(`${API_URL}/pedidos`)
      .then((res) => res.json())
      .then((data) => {
        setPedidos(data);
        const eventosFormatados = data.map((p) => ({
          id: p.id,

          title: `${p.modelo_nome} - ${p.cliente_nome} - R$ ${p.valor}`,
          date: p.prazo,

          extendedProps: {
            cliente: p.cliente_nome,
            status: p.status,
            quantidade: p.quantidade,
            valor: p.valor,
          },

          color:
            p.status === "Na fila"
              ? "orange"
              : p.status === "Em impressão"
                ? "blue"
                : p.status === "Em pintura"
                  ? "purple"
                  : "green",
        }));

        setEventos(eventosFormatados);
      });
  }

  function atualizarStatus(id, novoStatus) {
    fetch(`${API_URL}/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    }).then(() => {
      carregarPedidos();
    });
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  return (
    <div>
      <h2>Calendário de Entregas</h2>
      <FullCalendar
        height="auto"
        eventDisplay="block"
        dayMaxEvents={true}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={eventos}
        eventClick={(info) => {
          setEventoSelecionado(info.event);
        }}
        eventMouseEnter={(info) => {
          setTooltip({
            visible: true,
            x: info.jsEvent.clientX,
            y: info.jsEvent.clientY,
            data: info.event.extendedProps,
          });
        }}
        eventMouseLeave={() => {
          setTooltip({ visible: false, x: 0, y: 0, data: null });
        }}
        eventMouseMove={(info) => {
          setTooltip((prev) => ({
            ...prev,
            x: info.jsEvent.clientX,
            y: info.jsEvent.clientY,
          }));
        }}
      />
      {tooltip.visible && tooltip.data && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            backgroundColor: "#2f3640",
            color: "#f5f6fa",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            borderLeft: `4px solid ${
              tooltip.data.status === "Na fila"
                ? "#fbc431"
                : tooltip.data.status === "Em impressão"
                  ? "#00a8ff"
                  : tooltip.data.status === "Em pintura"
                    ? "#9c88ff"
                    : "#4cd137"
            }`,
          }}
        >
          <b>{tooltip.data.cliente}</b>
          <p>Qtd: {tooltip.data.quantidade}</p>
          <p>Valor: R$ {tooltip.data.valor}</p>
          <p>Status: {tooltip.data.status}</p>
          <p>Entrega: {tooltip.data.entrega}</p>
        </div>
      )}
      {eventoSelecionado && (
        <div
          style={{
            // backgroundColor: info.event.backgroundColor,
            border: "1px solid black",
            borderRadius: "6px",
            fontSize: "12px",
            padding: "4px",
            marginTop: "10px",
          }}
        >
          <h3>Editar Pedido</h3>
          <p>{eventoSelecionado.title}</p>

          <select
            onChange={(e) => {
              atualizarStatus(eventoSelecionado.id, e.target.value);
            }}
          >
            <option>Na fila</option>
            <option>Em impressão</option>
            <option>Em pintura</option>
            <option>Finalizado</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default Calendario;
