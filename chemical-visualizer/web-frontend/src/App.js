import { useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import Footer from "./Footer";
import Upload from "./Upload";
import Charts from "./Charts";
import Table from "./Table";
import Auth from "./Auth";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState("upload");
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return token ? { token, username } : null;
  });
  const { theme, toggleTheme } = useTheme();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const renderMain = () => {
    switch (activeTab) {
      case "upload":
        return <Upload />;
      case "charts":
        return <Charts />;
      case "table":
        return <Table />;
      default:
        return <Upload />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "upload":
        return "Dashboard";
      case "charts":
        return "Visualization";
      case "table":
        return "Data Table";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">🧪</span>
            <span className="logo-text">Chemical Visualizer</span>
          </div>
        </div>

        <div className="header-center">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>

        <div className="header-right">
          <button className="header-btn theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="header-btn notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
          <div className="user-menu">
            <div className="user-avatar">👤</div>
            <span className="user-name">{user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="app-layout">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            {renderMain()}
          </div>
        </main>

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;