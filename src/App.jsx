import Home from "./components/Home";
import Notes from "./components/Notes";
import { Outlet } from "react-router-dom";
function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default App;
