import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Collapse,
  Divider,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PDFMetadataItem from './PDFMetadataItem';
import BatchMetadataControl from './BatchMetadataControl';
import MetadataTable from './MetadataTable';
import FileService from '../../services/FileService';

// Componente para la lista de archivos en el servidor
const ServerFileList = ({ 
  files, 
  selectedServerFiles, 
  onToggleSelect, 
  onDelete, 
  uploading, 
  processing, 
  loading,
  onFilesUpdated
}) => {
  const [fileMetadata, setFileMetadata] = useState({});
  const [aiModel, setAiModel] = useState(null);
  const [apiKeys, setApiKeys] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [openTableDialog, setOpenTableDialog] = useState(false);
  
  const loadSavedMetadata = async () => {
    try {
      // La lógica de setLoading/setError podría manejarse aquí si fuera necesario,
      // pero como se llama desde efectos, quizás no sea crítico.
      const response = await FileService.getAllMetadata();
      if (response.success && response.metadata) {
        setFileMetadata(response.metadata);
      } else {
         // Manejar el caso de que no haya metadatos o haya error
         console.error('No se pudieron cargar los metadatos desde ServerFileList');
         setFileMetadata({}); // Establecer como vacío para evitar errores
      }
    } catch (error) {
      console.error('Error al cargar metadatos guardados en ServerFileList:', error);
      setFileMetadata({}); // Establecer como vacío en caso de error
    }
  };
  
  // Cargar el modelo y las API keys de la configuración
  useEffect(() => {
    const storedDefaultModel = localStorage.getItem('defaultModel');
    const storedApiKeys = localStorage.getItem('apiKeys');
    
    if (storedDefaultModel) {
      setAiModel(storedDefaultModel);
    } else {
      setAiModel('deepseek'); // Modelo predeterminado
    }
    
    if (storedApiKeys) {
      try {
        setApiKeys(JSON.parse(storedApiKeys));
      } catch (error) {
        console.error('Error al cargar API keys:', error);
      }
    }
  }, []);
  
  // Cargar metadatos guardados al iniciar
  useEffect(() => {
    loadSavedMetadata(); 
  }, []);
  
  // Manejar la actualización de metadatos de un archivo
  const handleMetadataUpdated = (filename, metadata) => {
    setFileMetadata(prev => ({
      ...prev,
      [filename]: metadata
    }));
  };
  
  // Manejar la actualización en lote de metadatos
  const handleBatchComplete = (metadataMap) => {
    setFileMetadata(prev => ({
      ...prev,
      ...metadataMap
    }));
  };
  
  // Verificar si tenemos API keys configuradas
  const hasValidApiKey = (model) => {
    if (!apiKeys) return false;
    
    if (model === 'gpt4o' || model === 'gpt4o-mini') {
      return !!apiKeys.openai;
    } else if (model === 'sonnet') {
      return !!apiKeys.anthropic;
    } else if (model === 'deepseek') {
      return !!apiKeys.deepseek;
    }
    
    return false;
  };
  
  // Manejar el renombrado de archivos
  const handleRenameFiles = async () => {
    if (!selectedServerFiles.length) return;
    
    setRenaming(true);
    try {
      const response = await FileService.renameFiles(selectedServerFiles);
      
      if (response.success) {
        // Notificar y esperar a que el padre actualice la lista de archivos (prop 'files')
        if (onFilesUpdated) {
          await onFilesUpdated(); // Esperar a que el padre actualice
          // Una vez que 'files' (prop) se actualice, recargar metadatos locales
          await loadSavedMetadata(); // Asegurarse de que los metadatos locales están sincronizados
        }
        console.log(`${response.results.success.length} archivos renombrados`);
      } else {
        console.error('Error al renombrar archivos:', response.message);
      }
    } catch (error) {
      console.error('Error al renombrar archivos:', error);
    } finally {
      setRenaming(false);
    }
  };
  
  // Manejar la exportación a CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await FileService.exportMetadataCSV();
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
    } finally {
      setExporting(false);
    }
  };
  
  // Abrir diálogo de tabla de metadatos
  const handleOpenTableDialog = () => {
    setOpenTableDialog(true);
  };
  
  // Cerrar diálogo de tabla de metadatos
  const handleCloseTableDialog = () => {
    setOpenTableDialog(false);
  };
  
  if (!files || files.length === 0) return null;

  return (
    <Box>
      {/* Mostrar alerta si no hay API keys configuradas */}
      {!hasValidApiKey(aiModel) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay una API key configurada para el modelo {getModelName(aiModel)}. 
          Por favor, configura la API key en el paso de configuración.
        </Alert>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {selectedServerFiles.length > 0 && (
          <>
            <BatchMetadataControl 
              filenames={selectedServerFiles} 
              model={aiModel}
              apiKeys={apiKeys}
              onBatchComplete={handleBatchComplete}
            />
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DriveFileRenameOutlineIcon />}
              onClick={handleRenameFiles}
              disabled={renaming || uploading || processing}
            >
              {renaming ? 'Renombrando...' : 'Renombrar archivos'}
            </Button>
          </>
        )}
        
        {/* Botones para exportar CSV y ver tabla */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          disabled={exporting || uploading || processing}
        >
          {exporting ? 'Exportando...' : 'Exportar a CSV'}
        </Button>
        
        <Button
          variant="outlined"
          color="info"
          startIcon={<TableViewIcon />}
          onClick={handleOpenTableDialog}
          disabled={uploading || processing}
        >
          Ver tabla de metadatos
        </Button>
      </Box>
      
      <List dense>
        {files.map((file, index) => (
          <React.Fragment key={index}>
            <ListItem 
              sx={{ 
                borderRadius: 1,
                bgcolor: selectedServerFiles.includes(file.filename) ? 'action.selected' : 'transparent',
                flexDirection: 'column',
                alignItems: 'stretch'
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <Checkbox
                    edge="start"
                    checked={selectedServerFiles.includes(file.filename)}
                    onChange={(e) => {
                      onToggleSelect(file.filename);
                    }}
                    disabled={uploading || processing}
                  />
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <PictureAsPdfIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    `${fileMetadata[file.filename]?.title || file.originalName}` + 
                    `${fileMetadata[file.filename]?.authors ? ` - ${fileMetadata[file.filename]?.authors}` : ''}` + 
                    `${fileMetadata[file.filename]?.year ? ` (${fileMetadata[file.filename]?.year})` : ''}`
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" component="div" color="text.secondary">
                        {`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      </Typography>
                    </Box>
                  }
                  sx={{ mr: 6 }}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="open" 
                    onClick={(e) => {
                      window.open(`http://localhost:5000/uploads/${file.filename}`, '_blank');
                    }}
                    disabled={uploading || processing || loading}
                    sx={{ mr: 1 }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={(e) => {
                      onDelete(file.filename);
                    }}
                    disabled={uploading || processing || loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Box>

              {fileMetadata[file.filename] && (
                <Box sx={{ width: '100%', pl: 6, pr: 2, pt: 1 }}>
                  <PDFMetadataItem 
                    filename={file.filename} 
                    model={aiModel}
                    apiKeys={apiKeys}
                    onMetadataUpdated={handleMetadataUpdated}
                    metadata={fileMetadata[file.filename]}
                  />
                </Box>
              )}
            </ListItem>
            
            {index < files.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
      
      {/* Diálogo para mostrar tabla de metadatos */}
      <Dialog
        open={openTableDialog}
        onClose={handleCloseTableDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Tabla de Metadatos</DialogTitle>
        <DialogContent dividers>
          <MetadataTable 
            metadata={fileMetadata} 
            existingFiles={files.map(f => f.filename)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTableDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Función auxiliar para obtener el nombre de modelo para mostrar
function getModelName(modelId) {
  const models = {
    'gpt4o': 'GPT-4o',
    'gpt4o-mini': 'GPT-4o Mini',
    'sonnet': 'Claude Sonnet',
    'deepseek': 'DeepSeek',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash'
  };
  
  return models[modelId] || modelId || 'IA';
}

export default ServerFileList; 