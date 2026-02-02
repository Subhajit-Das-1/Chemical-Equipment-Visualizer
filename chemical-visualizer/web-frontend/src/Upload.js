import { useState, useRef } from 'react';
import { uploadCSV } from './api';

export default function Upload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    const validTypes = ['.csv', '.xls', '.xlsx'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(extension)) {
      setError('Please upload a CSV or Excel file (.csv, .xls, .xlsx)');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadCSV(file);
      setUploadResult(result);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file. Please ensure the backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>📁 Upload Equipment Data</h2>
        <p>Upload your CSV or Excel file containing chemical equipment parameters</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv,.xls,.xlsx"
          hidden
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <span>Uploading and analyzing...</span>
          </div>
        ) : (
          <>
            <div className="drop-icon">📄</div>
            <h3>Drag & Drop your file here</h3>
            <p>or click to browse</p>
            <span className="file-types">Supports CSV, XLS, XLSX</span>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="upload-result">
          <div className="result-header">
            <span className="success-icon">✅</span>
            <h3>Analysis Complete!</h3>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">🔧</span>
              <div className="stat-info">
                <span className="stat-value">{uploadResult.total_equipment}</span>
                <span className="stat-label">Total Equipment</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">💨</span>
              <div className="stat-info">
                <span className="stat-value">{uploadResult.avg_flowrate}</span>
                <span className="stat-label">Avg Flowrate</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">🎚️</span>
              <div className="stat-info">
                <span className="stat-value">{uploadResult.avg_pressure}</span>
                <span className="stat-label">Avg Pressure</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">🌡️</span>
              <div className="stat-info">
                <span className="stat-value">{uploadResult.avg_temperature}</span>
                <span className="stat-label">Avg Temperature</span>
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          {uploadResult.type_distribution && (
            <div className="type-distribution">
              <h4>Equipment Type Distribution</h4>
              <div className="type-bars">
                {Object.entries(uploadResult.type_distribution).map(([type, count]) => (
                  <div key={type} className="type-bar-item">
                    <div className="type-info">
                      <span className="type-name">{type}</span>
                      <span className="type-count">{count}</span>
                    </div>
                    <div className="type-bar">
                      <div
                        className="type-bar-fill"
                        style={{
                          width: `${(count / uploadResult.total_equipment) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Data Hint */}
      <div className="sample-hint">
        <span className="hint-icon">💡</span>
        <p>
          <strong>Tip:</strong> Your CSV should include columns:
          <code>Equipment Name</code>, <code>Type</code>, <code>Flowrate</code>,
          <code>Pressure</code>, <code>Temperature</code>
        </p>
      </div>
    </div>
  );
}