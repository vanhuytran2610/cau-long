import { Provider } from "react-redux";
import "./App.css";
import { Outlet } from "react-router-dom";
import { store } from "./redux/store";

function App() {
  return (
    <Provider store={store}>
      <div className="bg-red-50 min-h-screen flex flex-col">
        <Outlet />
      </div>
    </Provider>
  );
}

export default App;
