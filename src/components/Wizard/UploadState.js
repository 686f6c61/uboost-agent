import { useState, useEffect } from 'react';
import FileService from '../../services/FileService';

// Hook personalizado para la gestión de estado y lógica en el paso de carga
export const useUploadState = (onNext) => {
  const [files, setFiles] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedServerFiles, setSelectedServerFiles] = useState([]);
  const [loadingServerFiles, setLoadingServerFiles] = useState(false);
  
  // Cargar archivos del servidor
  const loadServerFiles = async () => {
    setLoadingServerFiles(true);
    try {
      const response = await FileService.getFiles();
      if (response.success) {
        setServerFiles(response.files);
      } else {
        showAlert('Error al cargar archivos del servidor', 'error');
      }
    } catch (error) {
      console.error('Error al cargar archivos del servidor:', error);
      showAlert('Error al cargar archivos del servidor', 'error');
    } finally {
      setLoadingServerFiles(false);
    }
  };
  
  // Cargar archivos guardados al inicio
  useEffect(() => {
    loadServerFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Mostrar alertas al usuario
  const showAlert = (message, severity = 'info') => {
    setAlert({
      show: true,
      message,
      severity
    });
    
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Gestión de archivos locales
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    
    // Verificar si hay archivos que no son PDF
    const nonPdfFiles = newFiles.filter(file => file.type !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      showAlert(`Los siguientes archivos no son PDF y serán ignorados: ${nonPdfFiles.map(f => f.name).join(', ')}`, 'warning');
      // Filtrar solo archivos PDF
      const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
      setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    } else {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  // Gestión de selección de archivos locales
  const handleToggleSelect = (index) => {
    setSelectedFiles(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  const handleSelectAll = () => {
    const allIndices = files.map((_, index) => index);
    setSelectedFiles(allIndices);
  };
  
  const handleDeselectAll = () => {
    setSelectedFiles([]);
  };
  
  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter(i => i !== index));
  };
  
  const handleRemoveSelected = () => {
    // Ordenar índices en orden descendente para evitar problemas al eliminar
    const sortedIndices = [...selectedFiles].sort((a, b) => b - a);
    
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      sortedIndices.forEach(index => {
        newFiles.splice(index, 1);
      });
      return newFiles;
    });
    
    setSelectedFiles([]);
  };
  
  // Gestión de archivos del servidor
  const handleToggleSelectServer = (filename) => {
    setSelectedServerFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(f => f !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };
  
  const handleSelectAllServer = () => {
    const allFilenames = serverFiles.map(file => file.filename);
    setSelectedServerFiles(allFilenames);
  };
  
  const handleDeselectAllServer = () => {
    setSelectedServerFiles([]);
  };
  
  const handleDeleteServerFile = async (filename) => {
    try {
      const response = await FileService.deleteFile(filename);
      
      if (response.success) {
        showAlert('Archivo eliminado correctamente', 'success');
        // Actualizar la lista de archivos en el servidor
        await loadServerFiles();
        // Eliminar de la selección si estaba seleccionado
        setSelectedServerFiles(prev => prev.filter(f => f !== filename));
      } else {
        showAlert('Error al eliminar el archivo', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      showAlert(`Error al eliminar archivo: ${error.message}`, 'error');
    }
  };
  
  const handleDeleteSelectedServer = async () => {
    if (selectedServerFiles.length === 0) {
      showAlert('No hay archivos seleccionados para eliminar', 'warning');
      return;
    }
    
    try {
      const response = await FileService.deleteMultipleFiles(selectedServerFiles);
      
      if (response.success) {
        showAlert(`${response.results.success.length} archivos eliminados correctamente`, 'success');
        // Actualizar la lista de archivos en el servidor
        await loadServerFiles();
        // Limpiar la selección
        setSelectedServerFiles([]);
      } else {
        showAlert('Error al eliminar archivos', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar archivos:', error);
      showAlert(`Error al eliminar archivos: ${error.message}`, 'error');
    }
  };
  
  // Subir archivos al servidor
  const handleUploadToServer = async () => {
    if (files.length === 0) {
      showAlert('No hay archivos para subir', 'warning');
      return;
    }
    
    // Si hay archivos seleccionados, solo subir esos
    const filesToUpload = selectedFiles.length > 0 
      ? selectedFiles.map(index => files[index])
      : files;
      
    if (filesToUpload.length === 0) {
      showAlert('Por favor, selecciona al menos un archivo para subir', 'warning');
      return;
    }
    
    setUploading(true);
    
    try {
      const response = await FileService.uploadFiles(filesToUpload);
      
      if (response.success) {
        showAlert(`${response.files.length} archivos subidos correctamente`, 'success');
        
        // Actualizar la lista de archivos en el servidor
        await loadServerFiles();
        
        // Eliminar archivos subidos de la lista local
        if (selectedFiles.length > 0) {
          handleRemoveSelected();
        } else {
          setFiles([]);
        }
      } else {
        showAlert('Error al subir archivos al servidor', 'error');
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      showAlert(`Error al subir archivos: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };
  
  // Manejar la finalización del paso y avanzar al siguiente
  const handleSubmit = async () => {
    // Verificar si hay archivos para procesar
    if (files.length === 0 && selectedServerFiles.length === 0) {
      showAlert('Por favor, selecciona al menos un archivo para continuar.', 'warning');
      return;
    }
    
    // Primero, subir los archivos pendientes al servidor
    if (files.length > 0) {
      await handleUploadToServer();
    }
    
    setProcessing(true);
    
    try {
      // Guardar los archivos seleccionados para el siguiente paso
      localStorage.setItem('selectedFiles', JSON.stringify(selectedServerFiles));
      
      // Avanzar al siguiente paso
      onNext();
    } catch (error) {
      console.error('Error al procesar archivos:', error);
      showAlert(`Error al procesar archivos: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };
  
  return {
    // Estado
    files,
    serverFiles,
    uploading,
    processing,
    uploadProgress,
    alert,
    selectedFiles,
    selectedServerFiles,
    loadingServerFiles,
    
    // Funciones
    setAlert,
    handleFileChange,
    handleToggleSelect,
    handleSelectAll,
    handleDeselectAll,
    handleRemoveFile,
    handleRemoveSelected,
    handleToggleSelectServer,
    handleSelectAllServer,
    handleDeselectAllServer,
    handleDeleteServerFile,
    handleDeleteSelectedServer,
    handleUploadToServer,
    handleSubmit,
    setUploadProgress
  };
}; 