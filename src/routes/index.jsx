import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import MainLayout from "../layouts/MainLayout";
import Employees from "../pages/Employee/Employees";
import EmployeeForm from "../pages/Employee/EmployeeForm";
import UserManagement from "../pages/UserManagement/UserManagement";
import ContractManagement from "../pages/Contract/ContractManagement";
import MyProfile from "../pages/Profile/MyProfile";
import Attendance from "../pages/Attendance/Attendance";
import PayrollManagement from "../pages/Payroll/PayrollManagement";
import ApprovalCenter from "../pages/Director/ApprovalCenter";
import MyPayslip from "../pages/Payroll/MyPayslip";

const routes = [
  {
    path: "/login",
    component: Login,
    layout: null,
  },
  {
    path: "/",
    component: Home,
    layout: MainLayout,
  },
  {
    path: "/employee-management",
    component: Employees,
    layout: MainLayout,
  },
  // --- ĐĂNG KÝ ROUTE CHO EMPLOYEE FORM ---
  {
    path: "/employee-management/add",
    component: () => <EmployeeForm mode="add" />, // Truyền props trực tiếp ở đây
    layout: MainLayout,
  },
  {
    path: "/employee-management/edit/:id",
    component: () => <EmployeeForm mode="edit" />,
    layout: MainLayout,
  },
  {
    path: "/employee-management/view/:id",
    component: () => <EmployeeForm mode="view" />,
    layout: MainLayout,
  },
  {
    path: "/contract-management",
    component: ContractManagement,
    layout: MainLayout,
  },
  {
    path: "/user-management",
    component: UserManagement,
    layout: MainLayout,
  },
  {
    path: "/profile",
    component: MyProfile,
    layout: MainLayout,
  },
  {
    path: "/attendance",
    component: Attendance,
    layout: MainLayout,
  },
  {
    path: "/payroll",
    component: PayrollManagement,
    layout: MainLayout,
  },
  {
    path: "/approvals",
    component: ApprovalCenter,
    layout: MainLayout,
  },
  { path: "/my-payslip", component: MyPayslip, layout: MainLayout },
];

export default routes;
