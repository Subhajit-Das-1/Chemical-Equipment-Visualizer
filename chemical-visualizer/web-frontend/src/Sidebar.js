import { useTheme } from './ThemeContext';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        { id: 'upload', label: 'Dashboard', icon: '📊' },
        { id: 'charts', label: 'Charts', icon: '📈' },
        { id: 'table', label: 'Data Table', icon: '📋' },
    ];

    return (
        <aside className="sidebar">
            {/* User Profile */}
            <div className="sidebar-profile">
                <div className="avatar">
                    <span>👤</span>
                </div>
                <div className="profile-info">
                    <h4>Guest User</h4>
                    <span className="status">
                        <span className="status-dot"></span>
                        Online
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-label">Main Menu</span>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                            {activeTab === item.id && <span className="nav-indicator"></span>}
                        </button>
                    ))}
                </div>

                <div className="nav-section">
                    <span className="nav-label">Settings</span>
                    <button className="nav-item" onClick={toggleTheme}>
                        <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                        <span className="nav-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-text">Preferences</span>
                    </button>
                    <button className="nav-item">
                        <span className="nav-icon">❓</span>
                        <span className="nav-text">Help & Support</span>
                    </button>
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <div className="version-info">
                    <span>v1.0.0</span>
                    <span className="separator">•</span>
                    <span>Chemical Visualizer</span>
                </div>
            </div>
        </aside>
    );
}
