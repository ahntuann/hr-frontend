export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          color: "#0284c7",
          marginBottom: "16px",
          fontWeight: "bold",
        }}
      >
        Chào mừng đến với HR Flow System
      </h1>
      <p
        style={{
          color: "#4b5563",
          fontSize: "16px",
          lineHeight: "1.6",
          maxWidth: "800px",
        }}
      >
        Hệ thống quản lý nhân sự HR Flow đã sẵn sàng. Giao diện nền base cho tất
        cả các role đã được thiết lập. Hãy sử dụng bộ chọn role ở thanh điều
        hướng trên cùng (Header) để test khả năng phân quyền của menu bên trái.
        Bạn có thể chọn cùng lúc nhiều vai trò để kiểm tra sự kết hợp quyền lợi.
      </p>
      <button
        style={{
          marginTop: "24px",
          padding: "12px 24px",
          backgroundColor: "#0284c7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background-color 0.2s",
        }}
      >
        Bắt đầu khám phá
      </button>
    </div>
  );
}
