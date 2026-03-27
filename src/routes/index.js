import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import MainLayout from "../layouts/MainLayout";

const routes = [
  // Public routes (Không dùng layout hoặc dùng layout riêng)
  {
    path: "/login",
    component: Login,
    layout: null, // Không bọc gì cả
  },
  // Private routes (Dùng MainLayout)
  {
    path: "/",
    component: Home,
    layout: MainLayout,
  },
  // Sau này thêm trang mới chỉ cần thêm ở đây:
  // { path: "/employees", component: EmployeePage, layout: MainLayout },
];

export default routes;
