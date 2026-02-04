import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import TicketDetails from "./components/TicketDetails"; // We will create this in Step 3

function App() {
  return (
    <Router>
      {/* Navbar is OUTSIDE Routes so it stays visible on every page */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
      </Routes>
    </Router>
  );
}

export default App;