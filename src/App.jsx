import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nếu gõ đường dẫn /login thì load trang Login */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Nếu gõ đường dẫn mặc định (/) thì load trang Dashboard */}
        {/* <Route path="/" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
