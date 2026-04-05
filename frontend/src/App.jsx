import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Modelos from "./pages/Modelos";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Producao from "./pages/Producao";
import Dashboard from "./pages/Dashboard";
import Calendario from "./pages/Calendario";

function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>Printazzo</h1>
        <nav>
          <Link to="/">Modelos</Link> | <Link to="/clientes">Clientes</Link> |{" "}
          <Link to="/pedidos">Pedidos</Link> |{" "}
          <Link to="/producao">Produção</Link> |{" "}
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/calendario">Calendário</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Modelos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/producao" element={<Producao />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendario" element={<Calendario />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
