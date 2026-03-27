import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Fragment } from "react"; // Dùng Fragment để bọc nếu không có layout
import routes from "./routes"; // Import mảng cấu hình bên trên
import "./App.css"; // Import CSS chung nếu cần

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => {
          // 1. Xác định Layout (Nếu route.layout là null thì dùng Fragment)
          const Layout = route.layout === null ? Fragment : route.layout;

          // 2. Lấy Component
          const Page = route.component;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
