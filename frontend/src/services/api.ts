import axios from 'axios';

// In development with Vite proxy, we can use relative URLs
// In production, use the full URL with the correct port
const API_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Status
export const checkApiStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

// Data Status
export const checkDataStatus = async () => {
  const response = await api.get('/data-status');
  return response.data;
};

// Fetch Data
export const fetchStockData = async (maxStocks: number, useMockData: boolean) => {
  const response = await api.post('/fetch-data', {
    max_stocks: maxStocks,
    use_mock_data: useMockData,
  });
  return response.data;
};

// Get Task Status
export const getTaskStatus = async () => {
  const response = await api.get('/task-status');
  return response.data;
};

// Get Recommendations
export const getRecommendations = async () => {
  try {
    const response = await api.post('/get-recommendations');
    return response.data;
  } catch (error: any) {
    // Check if it's a 409 Conflict error (task already running)
    if (error.response && error.response.status === 409) {
      const errorData = error.response.data;
      // Include task_info in the error object
      const enhancedError: any = new Error(errorData.message || 'Another task is already running. Please wait for it to complete.');
      enhancedError.taskInfo = errorData.task_info;
      throw enhancedError;
    }
    // Handle other errors
    throw new Error(error.response?.data?.message || error.message || 'Failed to get recommendations');
  }
};

// Upload Files
export const uploadFiles = async (files: File[]): Promise<{
  success: boolean;
  message: string;
  files?: string[];
  analysis?: string;
}> => {
  try {
    const formData = new FormData();
    
    // Add each file to the form data
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    // Log the number of files being uploaded (for debugging)
    console.log(`Uploading ${files.length} files`);
    
    // Create a custom instance for file uploads with different content type
    const response = await axios.post(`${API_URL}/upload-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Add timeout and retry options
      timeout: 30000, // 30 seconds timeout
    });
    
    return response.data;
  } catch (error: any) {
    console.error('File upload error:', error);
    
    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.status, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

// Get Results
export const getResults = async () => {
  const response = await api.get('/results');
  return response.data;
};

// View Recommendation
export const viewRecommendation = async (filename: string) => {
  const response = await api.get(`/view-recommendation/${filename}`);
  return response.data;
};

// Get Download URL
export const getDownloadUrl = (filename: string) => {
  return `${API_URL}/download/${filename}`;
};

// Get Mock Data
export const getMockData = async () => {
  const response = await api.get('/mock-data');
  return response.data;
}; 