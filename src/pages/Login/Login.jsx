import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import "./Login.scss";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authService.login(formData);
      if (res.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        navigate("/");
      }
    } catch (err) {
      setError(err.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-section">
          <div className="icon-box">
            <ShieldCheck size={32} />
          </div>
          <h2>
            HR <span>System</span>
          </h2>
          <p>Hệ thống quản lý nhân sự HRFlow</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Tài khoản</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Username..."
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <User className="prefix-icon" size={20} />
            </div>
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password..."
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />{" "}
              <Lock className="prefix-icon" size={20} />
            </div>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" size={24} />
            ) : (
              "ĐĂNG NHẬP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
