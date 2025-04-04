import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Alert,
  Collapse,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TagIcon from '@mui/icons-material/LocalOffer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

// Función para generar tags relacionadas usando IA (simulada para demo)
const generateRelatedTags = (tag) => {
  // En una implementación real, esto haría una llamada a una API de IA
  const commonRelatedTags = {
    'Recursos Humanos': [
      'Reclutamiento', 'Selección', 'Formación', 'Evaluación del desempeño', 
      'Compensación', 'Retención', 'Desarrollo profesional', 'Gestión del talento',
      'RRHH digital', 'Relaciones laborales', 'Clima organizacional', 'Onboarding',
      'Employer branding', 'Diversidad e inclusión', 'Cultura organizacional'
    ],
    'Inteligencia Artificial': [
      'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 
      'Redes neuronales', 'Algoritmos', 'Ética en IA', 'IA Generativa', 
      'Procesamiento de datos', 'Automatización', 'Sesgo algorítmico',
      'IA explicable', 'Transfer learning', 'Visión por computadora', 'Robótica'
    ]
  };

  if (commonRelatedTags[tag]) {
    return commonRelatedTags[tag];
  }

  // Generar tags genéricas relacionadas (simulando respuesta de IA)
  const tagWords = tag.split(/\s+/);
  const baseTag = tagWords[0].toLowerCase();
  
  return [
    `${tag} avanzado`,
    `${tag} aplicado`,
    `Metodologías de ${tag}`,
    `Investigación en ${tag}`,
    `${tag} y tecnología`,
    `${tag} sostenible`,
    `Innovación en ${tag}`,
    `${tag} digital`,
    `Gestión de ${tag}`,
    `${tag} y sociedad`,
    `Fundamentos de ${tag}`,
    `${tag} emergente`,
    `Análisis de ${tag}`,
    `${tag} experimental`,
    `${tag} teórico`
  ];
};

const ObjectiveStep = ({ onNext, onBack }) => {
  // Estado para el contenido
  const [objective, setObjective] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState([]);

  // Estado para el modo de definición
  const [tabValue, setTabValue] = useState(0); // 0: descripción, 1: tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [generatingTags, setGeneratingTags] = useState(false);
  
  // Estado para el diálogo de tags generadas
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [selectedGeneratedTags, setSelectedGeneratedTags] = useState([]);

  useEffect(() => {
    // Cargar objetivo y tags guardados previamente
    const savedObjective = localStorage.getItem('studyObjective');
    const savedTags = localStorage.getItem('studyTags');
    const savedMode = localStorage.getItem('definitionMode');
    
    if (savedObjective) setObjective(savedObjective);
    
    if (savedTags) {
      try {
        setSelectedTags(JSON.parse(savedTags));
      } catch (error) {
        console.error('Error al cargar tags guardados:', error);
      }
    }
    
    if (savedMode && (savedMode === '0' || savedMode === '1')) {
      setTabValue(parseInt(savedMode));
    }
    
    // Cargar información de archivos
    const storedFiles = localStorage.getItem('uploadedFiles');
    if (storedFiles) {
      try {
        const parsedFiles = JSON.parse(storedFiles);
        setFiles(parsedFiles);
      } catch (error) {
        console.error('Error al cargar información de archivos:', error);
      }
    }
  }, []);
  
  // Función para generar tags con IA
  const handleGenerateTags = async () => {
    if (selectedTags.length === 0) {
      setError('Añade al menos una etiqueta para generar sugerencias');
      return;
    }
    
    setGeneratingTags(true);
    
    try {
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generar tags relacionadas para cada tag del usuario
      const newGeneratedTags = [];
      
      for (const tag of selectedTags) {
        const relatedTags = generateRelatedTags(tag);
        
        // Añadir solo tags que no estén ya seleccionadas
        for (const relatedTag of relatedTags) {
          if (!selectedTags.includes(relatedTag) && !newGeneratedTags.includes(relatedTag)) {
            newGeneratedTags.push(relatedTag);
          }
        }
      }
      
      // Abrir el diálogo con las tags generadas
      setGeneratedTags(newGeneratedTags);
      setSelectedGeneratedTags([]);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error al generar etiquetas:', error);
      showAlert('Error al generar etiquetas relacionadas', 'error');
    } finally {
      setGeneratingTags(false);
    }
  };
  
  // Manejar selección de tags generadas
  const handleToggleGeneratedTag = (tag) => {
    setSelectedGeneratedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Añadir las tags seleccionadas
  const handleAddSelectedTags = () => {
    if (selectedGeneratedTags.length === 0) {
      setOpenDialog(false);
      return;
    }
    
    // Añadir las tags seleccionadas a la lista principal
    setSelectedTags(prev => [...prev, ...selectedGeneratedTags]);
    setOpenDialog(false);
    showAlert(`Se añadieron ${selectedGeneratedTags.length} etiquetas`, 'success');
  };
  
  // Manejar cierre del diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Manejar selección de todas las tags generadas
  const handleSelectAllGeneratedTags = () => {
    setSelectedGeneratedTags([...generatedTags]);
  };
  
  // Manejar deselección de todas las tags generadas
  const handleDeselectAllGeneratedTags = () => {
    setSelectedGeneratedTags([]);
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

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    localStorage.setItem('definitionMode', newValue.toString());
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToDelete));
  };
  
  const handleAddTag = (event, newTags) => {
    setSelectedTags(newTags);
    if (error && newTags.length > 0) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tabValue === 0 && !objective.trim()) {
      setError('El objetivo del estudio es obligatorio');
      return;
    }
    
    if (tabValue === 1 && selectedTags.length === 0) {
      setError('Selecciona al menos una etiqueta de tema');
      return;
    }
    
    setSaving(true);
    
    try {
      // Guardar información en localStorage para uso posterior
      localStorage.setItem('studyObjective', objective);
      localStorage.setItem('studyTags', JSON.stringify(selectedTags));
      
      // Simular procesamiento en el servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Objetivo guardado correctamente', 'success');
      
      // Preparar información para el siguiente paso
      const analysisConfig = {
        objective: tabValue === 0 ? objective : `Análisis de artículos relacionados con: ${selectedTags.join(', ')}`,
        definitionMode: tabValue,
        tags: selectedTags,
        objectiveText: objective,
        files,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('analysisConfig', JSON.stringify(analysisConfig));
      
      setTimeout(() => {
        setSaving(false);
        onNext();
      }, 1000);
    } catch (error) {
      console.error('Error al guardar el objetivo:', error);
      showAlert('Error al guardar el objetivo: ' + error.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Definir Objetivo del Estudio
      </Typography>
      
      <Typography variant="body1" paragraph>
        Define el propósito de tu análisis para ayudar a la IA a evaluar la relevancia de cada artículo según tus intereses.
      </Typography>
      
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: 'primary.light', 
        borderRadius: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1
      }}>
        <InfoIcon color="primary" sx={{ mt: 0.5 }} />
        <Typography variant="body2" color="primary.dark">
          Puedes definir tu objetivo mediante una descripción textual o simplemente seleccionando etiquetas temáticas. Elige el método que te resulte más conveniente.
        </Typography>
      </Box>
      
      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Archivos seleccionados: {files.length}
          </Typography>
        </Box>
      )}
      
      <Collapse in={alert.show}>
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      </Collapse>
      
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="modo de definición">
          <Tab label="Definir con descripción" />
          <Tab label="Definir con etiquetas" icon={<TagIcon />} iconPosition="end" />
        </Tabs>
      </Box>
      
      <form onSubmit={handleSubmit}>
        {/* Pestaña de definición mediante descripción */}
        {tabValue === 0 && (
          <FormControl fullWidth error={!!error} sx={{ mb: 4 }}>
            <InputLabel htmlFor="objective">Objetivo del análisis</InputLabel>
            <OutlinedInput
              id="objective"
              label="Objetivo del análisis"
              multiline
              rows={4}
              value={objective}
              onChange={(e) => {
                setObjective(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="Ejemplo: Evaluar artículos sobre el impacto de la inteligencia artificial en procesos de reclutamiento y selección de personal..."
              disabled={saving}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )}
        
        {/* Pestaña de definición mediante etiquetas */}
        {tabValue === 1 && (
          <Box sx={{ mb: 4 }}>
            <FormControl error={!!error} sx={{ mb: 2, width: '100%', maxWidth: '600px' }}>
              <Autocomplete
                multiple
                id="tags-standard"
                options={[]} // Sin opciones predefinidas
                value={selectedTags}
                onChange={handleAddTag}
                freeSolo
                size="small"
                // Desactivar delimitadores coma y tabulador, solo aceptar Enter
                onKeyDown={(e) => {
                  if (e.key === 'Tab' || e.key === ',') {
                    e.preventDefault(); // Prevenir comportamiento predeterminado
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      onDelete={() => handleDeleteTag(option)}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Etiquetas temáticas"
                    placeholder="Añadir etiqueta y pulsar Enter"
                    helperText={error || "Añade etiquetas escribiendo y pulsando Enter"}
                    error={!!error}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <KeyboardReturnIcon color="action" fontSize="small" />
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />
                )}
                disabled={saving || generatingTags}
              />
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<AutoFixHighIcon />}
                onClick={handleGenerateTags}
                disabled={selectedTags.length === 0 || saving || generatingTags}
              >
                {generatingTags ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Generando...
                  </>
                ) : (
                  'Generar más etiquetas con IA'
                )}
              </Button>
            </Box>
            
            {selectedTags.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                El estudio debe ser coherente con los siguientes temas: <strong>{selectedTags.join(', ')}</strong>
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyboardReturnIcon fontSize="small" color="action" />
                Añade etiquetas escribiendo y pulsando la tecla Enter.
                Usa el botón "Generar más etiquetas" para obtener sugerencias de la IA.
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onBack}
            disabled={saving}
          >
            Atrás
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={saving || (tabValue === 0 && !objective.trim()) || (tabValue === 1 && selectedTags.length === 0)}
            startIcon={saving && <CircularProgress size={20} color="inherit" />}
          >
            {saving ? 'Guardando...' : 'Iniciar Análisis'}
          </Button>
        </Box>
      </form>
      
      {/* Diálogo para mostrar las tags generadas */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Etiquetas sugeridas por IA
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            La IA ha generado estas etiquetas basadas en tus selecciones. Selecciona las que quieras añadir:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Button 
                size="small" 
                onClick={handleSelectAllGeneratedTags}
                startIcon={<AddCircleIcon />}
                sx={{ mr: 1 }}
              >
                Seleccionar todas
              </Button>
              <Button 
                size="small" 
                onClick={handleDeselectAllGeneratedTags}
                startIcon={<DeleteSweepIcon />}
              >
                Deseleccionar todas
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {selectedGeneratedTags.length} de {generatedTags.length} seleccionadas
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {generatedTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                variant={selectedGeneratedTags.includes(tag) ? "filled" : "outlined"}
                color={selectedGeneratedTags.includes(tag) ? "primary" : "default"}
                onClick={() => handleToggleGeneratedTag(tag)}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleAddSelectedTags} 
            color="primary" 
            variant="contained"
            disabled={selectedGeneratedTags.length === 0}
          >
            Añadir {selectedGeneratedTags.length} etiquetas
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ObjectiveStep;
