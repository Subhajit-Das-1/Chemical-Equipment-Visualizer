import { useState, useEffect } from 'react';
import { getHistory } from './api';

export default function RightPanel() {
    const [stats, setStats] = useState({
        totalUploads: 0,
        lastUpload: null,
        avgEquipment: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const history = await getHistory();
            if (history && history.length > 0) {
                setStats({
                    totalUploads: history.length,
                    lastUpload: 'Recently',
                    avgEquipment: Math.round(
                        history.reduce((sum, d) => sum + (d.total_equipment || 0), 0) / history.length
                    )
                });
                setRecentActivity(history.slice(0, 3).map((item, idx) => ({
                    id: idx,
                    action: `Dataset uploaded`,
                    details: `${item.total_equipment || 0} equipment items`,
                    time: 'Recent'
                })));
            }
        } catch (error) {
            console.log('No history available yet');
        }
    };

    return (
        <aside className="right-panel">
            {/* Quick Stats */}
            <div className="panel-card stats-card">
                <h3 className="panel-title">
                    <span className="title-icon">📊</span>
                    Quick Stats
                </h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value">{stats.totalUploads}</span>
                        <span className="stat-label">Total Uploads</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.avgEquipment}</span>
                        <span className="stat-label">Avg Equipment</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="panel-card activity-card">
                <h3 className="panel-title">
                    <span className="title-icon">🕐</span>
                    Recent Activity
                </h3>
                <div className="activity-list">
                    {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-dot"></div>
                                <div className="activity-content">
                                    <span className="activity-action">{activity.action}</span>
                                    <span className="activity-details">{activity.details}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <span>No recent activity</span>
                            <span className="empty-hint">Upload a CSV to get started</span>
                        </div>
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="panel-card status-card">
                <h3 className="panel-title">
                    <span className="title-icon">🔧</span>
                    System Status
                </h3>
                <div className="status-list">
                    <div className="status-item">
                        <span className="status-indicator online"></span>
                        <span>API Server</span>
                        <span className="status-label">Online</span>
                    </div>
                    <div className="status-item">
                        <span className="status-indicator online"></span>
                        <span>Database</span>
                        <span className="status-label">Connected</span>
                    </div>
                    <div className="status-item">
                        <span className="status-indicator online"></span>
                        <span>PDF Generator</span>
                        <span className="status-label">Ready</span>
                    </div>
                </div>
            </div>

            {/* Tips Card */}
            <div className="panel-card tips-card">
                <h3 className="panel-title">
                    <span className="title-icon">💡</span>
                    Pro Tip
                </h3>
                <p className="tip-text">
                    Upload CSV files with columns: Equipment Name, Type, Flowrate, Pressure, and Temperature for best results.
                </p>
            </div>
        </aside>
    );
}
