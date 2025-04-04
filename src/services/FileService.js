import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const FileService = {
  // Subir archivos al servidor
  uploadFiles: async (files) => {
    const formData = new FormData();
    
    // Añadir cada archivo al FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // Puedes usar esta función para monitorear el progreso de la carga
          console.log('Upload Progress:', progressEvent.loaded / progressEvent.total * 100, '%');
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir archivos:', error);
      throw error;
    }
  },
  
  // Obtener lista de archivos del servidor
  getFiles: async () => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      throw error;
    }
  },
  
  // Eliminar un archivo del servidor
  deleteFile: async (filename) => {
    try {
      const response = await axios.delete(`${API_URL}/files/${filename}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el archivo ${filename}:`, error);
      throw error;
    }
  },
  
  // Eliminar múltiples archivos del servidor
  deleteMultipleFiles: async (filenames) => {
    try {
      const response = await axios.post(`${API_URL}/files/delete-multiple`, { filenames });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivos:', error);
      throw error;
    }
  },
  
  // Obtener metadatos de un archivo PDF
  getFileMetadata: async (filename) => {
    try {
      const response = await axios.get(`${API_URL}/files/${filename}/metadata`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener metadatos del archivo ${filename}:`, error);
      throw error;
    }
  },
  
  // Obtener metadatos de múltiples archivos PDF
  getBatchMetadata: async (filenames) => {
    try {
      const response = await axios.post(`${API_URL}/files/metadata/batch`, { filenames });
      return response.data;
    } catch (error) {
      console.error('Error al obtener metadatos de archivos:', error);
      throw error;
    }
  },
  
  // Analizar un PDF con IA
  analyzePDF: async (filename, model, apiKeys) => {
    try {
      const response = await axios.post(`${API_URL}/files/${filename}/analyze`, { model, apiKeys });
      return response.data;
    } catch (error) {
      console.error(`Error al analizar el archivo ${filename}:`, error);
      throw error;
    }
  },
  
  // Analizar múltiples PDFs con IA
  analyzeMultiplePDFs: async (filenames, model, apiKeys) => {
    try {
      const response = await axios.post(`${API_URL}/files/analyze/batch`, { filenames, model, apiKeys });
      return response.data;
    } catch (error) {
      console.error('Error al analizar múltiples archivos:', error);
      throw error;
    }
  },
  
  // Obtener metadatos de todos los archivos
  getAllMetadata: async () => {
    try {
      const response = await axios.get(`${API_URL}/files/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener metadatos:', error);
      throw error;
    }
  },
  
  // Renombrar archivos usando metadatos
  renameFiles: async (filenames) => {
    try {
      const response = await axios.post(`${API_URL}/files/rename`, { filenames });
      return response.data;
    } catch (error) {
      console.error('Error al renombrar archivos:', error);
      throw error;
    }
  },
  
  // Exportar metadatos a CSV
  exportMetadataCSV: async () => {
    try {
      // Usar axios con responseType blob para descargar archivos
      const response = await axios.get(`${API_URL}/files/export-csv`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'metadata.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      console.error('Error al exportar metadatos a CSV:', error);
      throw error;
    }
  }
};

export default FileService; 