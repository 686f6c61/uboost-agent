import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FileService from '../../services/FileService';

const BatchMetadataControl = ({ filenames, model, apiKeys, onBatchComplete }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const handleProcessBatch = async () => {
    if (!filenames || filenames.length === 0 || loading) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Verificar que tenemos modelo y API keys
      if (!model || !apiKeys) {
        throw new Error('No se ha configurado un modelo o API keys');
      }
      
      // Procesar todos los archivos de una vez usando IA
      const response = await FileService.analyzeMultiplePDFs(filenames, model, apiKeys);
      
      if (response.success && response.results) {
        // Crear un mapa de metadatos por nombre de archivo
        const metadataMap = {};
        
        response.results.forEach(result => {
          if (result.success && result.metadata) {
            metadataMap[result.filename] = result.metadata;
          }
        });
        
        // Notificar al componente padre
        if (onBatchComplete) {
          onBatchComplete(metadataMap);
        }
      } else {
        setError('Error al analizar los archivos');
      }
    } catch (error) {
      console.error('Error al analizar PDFs:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };
  
  // No permitir procesar si no hay modelo o API keys
  const disabled = loading || !filenames || filenames.length === 0 || !model || !apiKeys;
  
  return (
    <Box sx={{ my: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!model && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se ha configurado un modelo de IA. Por favor, configura un modelo en el paso de configuración.
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="secondary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
        onClick={handleProcessBatch}
        disabled={disabled}
        fullWidth
      >
        {loading 
          ? `Analizando ${progress > 0 ? `(${Math.round(progress)}%)` : '...'}` 
          : `Analizar título, autores, año y keywords`}
      </Button>
      
      {loading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Extrayendo título, autores, año y keywords de los PDFs usando {getModelName(model)}...
        </Typography>
      )}
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

export default BatchMetadataControl; 