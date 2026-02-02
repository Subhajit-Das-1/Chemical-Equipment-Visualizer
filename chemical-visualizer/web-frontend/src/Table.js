import { useState, useEffect } from 'react';
import { getHistory, downloadReport } from './api';

export default function Table() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getHistory();
            setHistoryData(data || []);
        } catch (err) {
            setError('Failed to load data. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (datasetIndex) => {
        // In the current backend, dataset IDs are auto-incremented
        // We need to calculate the ID based on history position
        // The most recent upload has the highest ID
        const datasetId = historyData.length - datasetIndex;

        setDownloading(datasetIndex);
        try {
            await downloadReport(datasetId);
        } catch (err) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="table-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <span>Loading data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="table-container">
                <div className="error-state">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={loadData} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    if (historyData.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>No Data Available</h3>
                    <p>Upload a CSV file to see data in table format</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-header">
                <div className="table-title">
                    <h2>📋 Dataset History</h2>
                    <p>Last {historyData.length} uploaded datasets with summary statistics</p>
                </div>
                <button onClick={loadData} className="refresh-btn">
                    🔄 Refresh
                </button>
            </div>

            {/* Summary Cards for Latest Dataset */}
            {historyData[0] && (
                <div className="latest-summary">
                    <h3>Latest Dataset Summary</h3>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <span className="card-icon">🔧</span>
                            <div className="card-content">
                                <span className="card-value">{historyData[0].total_equipment}</span>
                                <span className="card-label">Total Equipment</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <span className="card-icon">💨</span>
                            <div className="card-content">
                                <span className="card-value">{historyData[0].avg_flowrate}</span>
                                <span className="card-label">Avg Flowrate</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <span className="card-icon">🎚️</span>
                            <div className="card-content">
                                <span className="card-value">{historyData[0].avg_pressure}</span>
                                <span className="card-label">Avg Pressure</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <span className="card-icon">🌡️</span>
                            <div className="card-content">
                                <span className="card-value">{historyData[0].avg_temperature}</span>
                                <span className="card-label">Avg Temperature</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Total Equipment</th>
                            <th>Avg Flowrate</th>
                            <th>Avg Pressure</th>
                            <th>Avg Temperature</th>
                            <th>Equipment Types</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyData.map((dataset, index) => (
                            <tr key={index}>
                                <td>
                                    <span className="row-number">{index + 1}</span>
                                </td>
                                <td>
                                    <span className="cell-value">{dataset.total_equipment}</span>
                                </td>
                                <td>
                                    <span className="cell-value">{dataset.avg_flowrate}</span>
                                </td>
                                <td>
                                    <span className="cell-value">{dataset.avg_pressure}</span>
                                </td>
                                <td>
                                    <span className="cell-value">{dataset.avg_temperature}</span>
                                </td>
                                <td>
                                    <div className="type-badges">
                                        {dataset.type_distribution &&
                                            Object.entries(dataset.type_distribution).map(([type, count]) => (
                                                <span key={type} className="type-badge">
                                                    {type}: {count}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="download-btn"
                                        onClick={() => handleDownloadPDF(index)}
                                        disabled={downloading === index}
                                    >
                                        {downloading === index ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            <>📥 Download PDF</>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="table-footer">
                <span className="record-count">
                    Showing {historyData.length} of {historyData.length} records
                </span>
                <span className="table-hint">
                    💡 Click "Download PDF" to generate a detailed equipment report
                </span>
            </div>
        </div>
    );
}
