import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="bg-red-50 min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}

export default App;
