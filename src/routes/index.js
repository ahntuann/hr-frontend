import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import MainLayout from "../layouts/MainLayout";

const routes = [
  {
    path: "/login",
    component: Login,
    layout: null, // Trang login không dùng layout chung
  },
  {
    path: "/",
    component: Home,
    layout: MainLayout, // Trang Home dùng MainLayout
  },
];

export default routes;
