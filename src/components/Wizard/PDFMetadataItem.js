import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FileService from '../../services/FileService';

const PDFMetadataItem = ({ 
  filename, 
  model, 
  apiKeys, 
  onMetadataUpdated, 
  metadata: initialMetadata // Recibir metadata como prop
}) => {
  // Eliminar estado interno de metadata y useEffect para cargarla
  // const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // // Eliminar useEffect que cargaba metadata internamente
  // useEffect(() => {
  //   const loadSavedMetadata = async () => {
  //     try {
  //       const response = await FileService.getAllMetadata();
  //       if (response.success && response.metadata && response.metadata[filename]) {
  //         // setMetadata(response.metadata[filename]);
  //       }
  //     } catch (error) {
  //       console.error('Error al cargar metadatos guardados:', error);
  //     }
  //   };
  //   loadSavedMetadata();
  // }, [filename]);
  
  // Analizar PDF con IA
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!model || !apiKeys) {
        throw new Error('No se ha configurado un modelo o API keys');
      }
      
      const response = await FileService.analyzePDF(filename, model, apiKeys);
      
      if (response.success) {
        // Ya no se setea estado interno, solo se notifica al padre
        // setMetadata(response.metadata);
        if (onMetadataUpdated) {
          onMetadataUpdated(filename, response.metadata);
        }
      } else {
        setError('Error al analizar el PDF');
      }
    } catch (error) {
      console.error('Error al analizar PDF:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Usar la prop 'initialMetadata' para decidir qué renderizar
  const currentMetadata = initialMetadata;

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Analizando PDF con {getModelName(model)}...
          </Typography>
        </Box>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
          <Button 
            size="small" 
            startIcon={<RefreshIcon />}
            onClick={handleAnalyze}
            sx={{ ml: 1 }}
          >
            Reintentar
          </Button>
        </Typography>
      // Usar 'currentMetadata' (la prop) en lugar del estado interno 'metadata'
      ) : currentMetadata ? (
        <Paper sx={{ p: 1, bgcolor: 'background.default' }} elevation={0} variant="outlined">
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {currentMetadata.title || 'Sin título'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <span style={{ fontWeight: 'medium' }}>Autores:</span> {currentMetadata.authors || 'Desconocido'}
              </Typography>
            </Grid>
            {/* Fila para Keywords con Chips */}
            {currentMetadata.keywords && currentMetadata.keywords !== 'Desconocido' && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Keywords:
                  </Typography>
                  {currentMetadata.keywords.split(',').map(keyword => keyword.trim()).filter(k => k).map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label={`Año: ${currentMetadata.year || 'N/A'}`} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
                <Button 
                  size="small" 
                  startIcon={<RefreshIcon />}
                  onClick={handleAnalyze}
                >
                  Regenerar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Si no hay metadatos (currentMetadata es null/undefined), 
        // podría mostrarse un estado o simplemente null si el padre decide no renderizarlo.
        // Dado que el padre ServerFileList ya hace la comprobación, aquí puede ir null.
        null 
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
    'deepseek': 'DeepSeek'
  };
  
  return models[modelId] || modelId || 'IA';
}

export default PDFMetadataItem; 