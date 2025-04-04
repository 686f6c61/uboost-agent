import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  Collapse,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileList from './FileList';
import ServerFileList from './ServerFileList';
import FileActions from './FileActions';
import ServerFileActions from './ServerFileActions';
import LinearProgress from './LinearProgress';
import { useUploadState } from './UploadState';
import FileService from '../../services/FileService';

// Estilos para el input oculto
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

// Componente principal para el paso de carga
const UploadStep = ({ onNext, onBack }) => {
  // Obtener estado y funciones del hook personalizado
  const { 
    files,
    serverFiles,
    uploading,
    processing,
    uploadProgress,
    alert,
    selectedFiles,
    selectedServerFiles,
    loadingServerFiles,
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
    handleSubmit
  } = useUploadState(onNext);
  
  const [serverFilesState, setServerFilesState] = useState([]);
  
  // Cargar archivos del servidor
  const loadServerFiles = async () => {
    try {
      const response = await FileService.getFiles();
      if (response.success) {
        setServerFilesState(response.files);
      }
    } catch (error) {
      console.error('Error al cargar archivos del servidor:', error);
    }
  };
  
  // Cargar archivos al iniciar
  useEffect(() => {
    loadServerFiles();
  }, []);
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Carga de artículos
      </Typography>
      
      {/* Alertas */}
      <Collapse in={alert.show}>
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      </Collapse>
      
      {/* Selección de archivos locales */}
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
      
      {/* Archivos en el servidor */}
      {serverFiles.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Archivos disponibles en el servidor
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecciona los artículos que deseas analizar para determinar si corresponden a las etiquetas de tu investigación. 
            Este análisis te permitirá identificar rápidamente qué artículos son relevantes para tu tema de interés.
          </Typography>
          
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
            onFilesUpdated={loadServerFiles}
          />
        </>
      )}
      
      {/* Indicadores de progreso */}
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
      
      {/* Botones de navegación */}
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