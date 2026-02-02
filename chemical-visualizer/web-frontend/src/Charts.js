import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getHistory } from './api';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function Charts() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChart, setActiveChart] = useState('bar');

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

    // Get the most recent dataset for charts
    const latestData = historyData[0] || null;

    // Chart configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'var(--text-primary)',
                    font: { family: 'Inter', size: 12 },
                    padding: 20,
                },
            },
            tooltip: {
                backgroundColor: 'var(--bg-secondary)',
                titleColor: 'var(--text-primary)',
                bodyColor: 'var(--text-secondary)',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                ticks: { color: 'var(--text-secondary)' },
                grid: { color: 'var(--border-color)', drawBorder: false },
            },
            y: {
                ticks: { color: 'var(--text-secondary)' },
                grid: { color: 'var(--border-color)', drawBorder: false },
            },
        },
    };

    // Bar chart data - Type Distribution
    const barData = latestData?.type_distribution ? {
        labels: Object.keys(latestData.type_distribution),
        datasets: [{
            label: 'Equipment Count',
            data: Object.values(latestData.type_distribution),
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(6, 182, 212, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(244, 63, 94, 0.8)',
                'rgba(139, 92, 246, 0.8)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        }],
    } : null;

    // Doughnut chart data
    const doughnutData = latestData?.type_distribution ? {
        labels: Object.keys(latestData.type_distribution),
        datasets: [{
            data: Object.values(latestData.type_distribution),
            backgroundColor: [
                '#6366f1',
                '#06b6d4',
                '#10b981',
                '#f59e0b',
                '#f43f5e',
                '#8b5cf6',
            ],
            borderWidth: 0,
            hoverOffset: 10,
        }],
    } : null;

    // Line chart data - Comparison across datasets
    const lineData = historyData.length > 0 ? {
        labels: historyData.map((_, i) => `Dataset ${historyData.length - i}`).reverse(),
        datasets: [
            {
                label: 'Avg Flowrate',
                data: historyData.map(d => d.avg_flowrate).reverse(),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Avg Pressure',
                data: historyData.map(d => d.avg_pressure).reverse(),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Avg Temperature',
                data: historyData.map(d => d.avg_temperature).reverse(),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    } : null;

    if (loading) {
        return (
            <div className="charts-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <span>Loading chart data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="charts-container">
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
            <div className="charts-container">
                <div className="empty-state">
                    <span className="empty-icon">📊</span>
                    <h3>No Data Available</h3>
                    <p>Upload a CSV file to see visualizations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="charts-container">
            <div className="charts-header">
                <h2>📈 Data Visualization</h2>
                <p>Interactive charts showing your equipment data analysis</p>
            </div>

            {/* Chart Type Selector */}
            <div className="chart-tabs">
                <button
                    className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
                    onClick={() => setActiveChart('bar')}
                >
                    📊 Bar Chart
                </button>
                <button
                    className={`chart-tab ${activeChart === 'doughnut' ? 'active' : ''}`}
                    onClick={() => setActiveChart('doughnut')}
                >
                    🍩 Doughnut
                </button>
                <button
                    className={`chart-tab ${activeChart === 'line' ? 'active' : ''}`}
                    onClick={() => setActiveChart('line')}
                >
                    📈 Trends
                </button>
            </div>

            {/* Charts Display */}
            <div className="chart-wrapper">
                {activeChart === 'bar' && barData && (
                    <div className="chart-card">
                        <h3>Equipment Type Distribution</h3>
                        <div className="chart-area">
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {activeChart === 'doughnut' && doughnutData && (
                    <div className="chart-card">
                        <h3>Equipment Breakdown</h3>
                        <div className="chart-area doughnut">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    ...chartOptions,
                                    scales: undefined,
                                    cutout: '60%',
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeChart === 'line' && lineData && (
                    <div className="chart-card">
                        <h3>Parameter Trends Across Datasets</h3>
                        <div className="chart-area">
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats Summary */}
            {latestData && (
                <div className="chart-summary">
                    <div className="summary-item">
                        <span className="summary-label">Total Equipment</span>
                        <span className="summary-value">{latestData.total_equipment}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Avg Flowrate</span>
                        <span className="summary-value">{latestData.avg_flowrate}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Avg Pressure</span>
                        <span className="summary-value">{latestData.avg_pressure}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Avg Temperature</span>
                        <span className="summary-value">{latestData.avg_temperature}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
