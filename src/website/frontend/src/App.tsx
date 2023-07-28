import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModQueue } from "./routes/ModQueue";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path="*" element={<ModQueue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
