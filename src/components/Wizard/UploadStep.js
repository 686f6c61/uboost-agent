import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  Divider,
  Checkbox,
  Tooltip,
  ButtonGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import SelectAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';
import FileService from '../../services/FileService';
import FileList from './FileList';
import ServerFileList from './ServerFileList';
import FileActions from './FileActions';
import ServerFileActions from './ServerFileActions';
import LinearProgress from './LinearProgress';
import { processAllFiles } from './PDFUtils';

// Importar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadStep = ({ onNext, onBack }) => {
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
  
  const extractTextFromPDF = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Si solo tenemos metadatos, no podemos extraer texto
        if (file.isMetadataOnly) {
          resolve({
            text: file.text || "Contenido no disponible (solo metadatos)",
            numPages: file.numPages || 0,
            info: file.info || {}
          });
          return;
        }
        
        // Convertir el archivo a ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Cargar el documento PDF
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        // Obtener información del documento
        const info = await pdf.getMetadata();
        
        // Extraer texto de todas las páginas
        let fullText = '';
        const numPages = pdf.numPages;
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
          
          // Actualizar progreso
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              pageProgress: Math.round((i / numPages) * 100)
            }
          }));
        }
        
        resolve({
          text: fullText,
          numPages,
          info
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  
  const processAllFiles = async () => {
    const processedFiles = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Inicializar progreso
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: {
          overall: Math.round((i / files.length) * 100),
          pageProgress: 0
        }
      }));
      
      try {
        // Si ya tenemos los datos procesados (de localStorage), usamos esos
        if (file.isMetadataOnly && file.processed) {
          processedFiles.push(file);
          continue;
        }
        
        // Extraer texto y metadatos
        const { text, numPages, info } = await extractTextFromPDF(file);
        
        // Extraer autores del PDF (simulado)
        let authors = "Autor desconocido";
        if (info && info.info) {
          if (info.info.Author) {
            authors = info.info.Author;
          }
        }
        
        // Extraer título del PDF (simulado)
        let title = file.name.replace('.pdf', '');
        if (info && info.info) {
          if (info.info.Title && info.info.Title.trim() !== '') {
            title = info.info.Title;
          }
        }
        
        // Detectar idioma (simulado)
        const language = detectLanguage(text);
        
        processedFiles.push({
          name: file.name,
          size: file.size,
          title,
          authors,
          text,
          numPages,
          language,
          processed: true
        });
      } catch (error) {
        console.error(`Error al procesar el archivo ${file.name}:`, error);
        errors.push({ name: file.name, error: error.message });
      }
    }
    
    // Actualizar progreso final
    setUploadProgress(prev => ({
      ...prev,
      overall: 100
    }));
    
    return { processedFiles, errors };
  };
  
  // Función simple para detectar idioma (simulada)
  const detectLanguage = (text) => {
    // En una implementación real, usaríamos una biblioteca de detección de idioma
    // Para esta demo, simplemente detectamos basado en palabras comunes
    const spanishWords = ['el', 'la', 'los', 'las', 'y', 'en', 'de', 'que', 'es', 'por'];
    const englishWords = ['the', 'and', 'of', 'to', 'in', 'is', 'that', 'for', 'with', 'as'];
    
    const words = text.toLowerCase().split(/\s+/);
    let spanishCount = 0;
    let englishCount = 0;
    
    words.forEach(word => {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    });
    
    return spanishCount > englishCount ? 'Español' : 'Inglés';
  };
  
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
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Carga de artículos
      </Typography>
      
      <Collapse in={alert.show}>
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      </Collapse>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          Selecciona los archivos PDF de los artículos científicos que deseas analizar. Puedes seleccionar hasta 200 archivos a la vez.
        </Typography>
        
        {/* Acciones para archivos locales */}
        <FileActions
          files={files}
          selectedFiles={selectedFiles}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onRemoveSelected={handleRemoveSelected}
          onUploadToServer={handleUploadToServer}
          uploading={uploading}
          processing={processing}
          VisuallyHiddenInput={VisuallyHiddenInput}
          onFileChange={handleFileChange}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Formatos aceptados: PDF
        </Typography>
      </Box>
      
      {/* Lista de archivos locales */}
      <FileList
        files={files}
        selectedFiles={selectedFiles}
        onToggleSelect={handleToggleSelect}
        onRemove={handleRemoveFile}
        uploading={uploading}
        processing={processing}
        uploadProgress={uploadProgress}
      />
      
      {serverFiles.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Archivos disponibles en el servidor
          </Typography>
          
          <Alert 
            severity="info" 
            icon={<InfoIcon />} 
            sx={{ 
              mb: 3, 
              '& .MuiAlert-message': { 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1 
              } 
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              ¿Cómo usar esta herramienta?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }}/>
              <Typography variant="body2">
                Selecciona los artículos que quieres analizar para determinar si corresponden a las etiquetas de tu investigación.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }}/>
              <Typography variant="body2">
                Este análisis te ayudará a identificar rápidamente qué artículos son relevantes para tu tema de interés.
              </Typography>
            </Box>
          </Alert>
          
          {/* Acciones para archivos del servidor */}
          <ServerFileActions
            files={serverFiles}
            selectedServerFiles={selectedServerFiles}
            onSelectAllServer={handleSelectAllServer}
            onDeselectAllServer={handleDeselectAllServer}
            onDeleteSelectedServer={handleDeleteSelectedServer}
            uploading={uploading}
            processing={processing}
            loading={loadingServerFiles}
          />
          
          {/* Mostrar contador de archivos seleccionados */}
          {selectedServerFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`${selectedServerFiles.length} archivos seleccionados`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          )}
          
          {/* Lista de archivos del servidor */}
          <ServerFileList
            files={serverFiles}
            selectedServerFiles={selectedServerFiles}
            onToggleSelect={handleToggleSelectServer}
            onDelete={handleDeleteServerFile}
            uploading={uploading}
            processing={processing}
            loading={loadingServerFiles}
          />
        </>
      )}
      
      {(uploading || processing) && (
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {uploading ? 'Subiendo archivos...' : 'Procesando archivos...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esto puede tomar varios minutos dependiendo del tamaño y número de archivos.
          </Typography>
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress.overall || 0} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress.overall || 0}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onBack}
          disabled={uploading || processing}
        >
          Atrás
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={(files.length === 0 && selectedServerFiles.length === 0) || uploading || processing}
        >
          {uploading || processing ? 'Procesando...' : 'Continuar'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UploadStep;
