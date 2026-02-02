import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Upload CSV file
export const uploadCSV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get upload history
export const getHistory = async () => {
    const response = await api.get('/history/');
    return response.data;
};

// Download PDF report
export const downloadReport = async (datasetId) => {
    const response = await api.get(`/report/${datasetId}/`, {
        responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `equipment_report_${datasetId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Register user
export const registerUser = async (username, password, email) => {
    const response = await api.post('/register/', { username, password, email });
    return response.data;
};

// Login user
export const loginUser = async (username, password) => {
    const response = await api.post('/login/', { username, password });
    return response.data;
};

export default api;
