import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      onLogin();
      return;
    }

    alert("Invalid admin username or password.");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-icon">🏥</div>

        <span className="admin-label">HOSPITAL MANAGEMENT</span>

        <h1>Admin Login</h1>

        <p>Sign in to manage hospital appointments.</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            LOGIN TO DASHBOARD
          </button>
        </form>

        <div className="demo-login">
          <strong>Demo Login</strong>
          <span>Username: admin</span>
          <span>Password: admin123</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 