import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const AnalysisStep = ({ onNext, onBack }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [logs, setLogs] = useState([]);
  const [objective, setObjective] = useState('');
  const [criteria, setCriteria] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    deepseek: ''
  });

  useEffect(() => {
    // Cargar archivos del localStorage
    const storedFiles = localStorage.getItem('uploadedFiles');
    if (storedFiles) {
      try {
        const parsedFiles = JSON.parse(storedFiles);
        console.log("Archivos cargados:", parsedFiles); // Depuración
        setFiles(parsedFiles);
      } catch (error) {
        console.error('Error al cargar información de archivos:', error);
        addLog('Error al cargar información de archivos', 'error');
      }
    }

    // Cargar objetivo y criterios
    const savedObjective = localStorage.getItem('studyObjective');
    const savedCriteria = localStorage.getItem('inclusionCriteria');
    
    if (savedObjective) setObjective(savedObjective);
    if (savedCriteria) setCriteria(savedCriteria);

    // Cargar configuración de API Keys
    const storedApiKeys = localStorage.getItem('apiKeys');
    if (storedApiKeys) {
      try {
        const parsedApiKeys = JSON.parse(storedApiKeys);
        setApiKeys(parsedApiKeys);
      } catch (error) {
        console.error('Error al cargar API Keys:', error);
      }
    }

    // Cargar modelo predeterminado
    const defaultModel = localStorage.getItem('defaultModel') || 'gpt4o-mini';
    setSelectedModel(defaultModel);
  }, []);

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

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { message, timestamp, type }]);
  };

  const startAnalysis = () => {
    // Verificar que hay archivos para analizar
    if (!files || files.length === 0) {
      showAlert('No hay archivos para analizar', 'error');
      return;
    }

    // Verificar que hay un objetivo definido
    if (!objective) {
      showAlert('Debes definir un objetivo para el estudio', 'error');
      return;
    }

    // Verificar que hay una API Key para el modelo seleccionado
    const modelToApiKeyMap = {
      'gpt4o': 'openai',
      'gpt4o-mini': 'openai',
      'sonnet': 'anthropic',
      'deepseek': 'deepseek'
    };

    const requiredApiKey = modelToApiKeyMap[selectedModel];
    if (!apiKeys[requiredApiKey]) {
      showAlert(`Necesitas configurar una API Key para ${requiredApiKey} para usar este modelo`, 'error');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setResults([]);
    setAnalysisComplete(false);
    setLogs([]);
    
    addLog('Iniciando análisis de artículos científicos según normas PRISMA...', 'info');
    addLog(`Modelo seleccionado: ${getModelDisplayName(selectedModel)}`, 'info');
    addLog(`Objetivo del estudio: ${objective.substring(0, 100)}${objective.length > 100 ? '...' : ''}`, 'info');
    
    if (criteria) {
      addLog(`Criterios de inclusión/exclusión: ${criteria.substring(0, 100)}${criteria.length > 100 ? '...' : ''}`, 'info');
    }
    
    // Simular análisis de archivos
    analyzeFiles();
  };

  const getModelDisplayName = (modelId) => {
    const modelNames = {
      'gpt4o': 'OpenAI GPT-4o',
      'gpt4o-mini': 'OpenAI GPT-4o-mini',
      'sonnet': 'Anthropic Sonnet 3.7',
      'deepseek': 'DeepSeek'
    };
    return modelNames[modelId] || modelId;
  };

  const analyzeFiles = async () => {
    const totalFiles = files.length;
    const analysisResults = [];
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setCurrentFile(file);
      
      // Verificar que el archivo tiene un nombre válido
      if (!file || !file.name) {
        console.error("Archivo inválido o sin nombre:", file);
        addLog(`❌ Error: Archivo ${i + 1} inválido o sin nombre`, 'error');
        
        // Añadir un resultado de error
        analysisResults.push({
          titulo: file ? (file.name || `Archivo ${i + 1}`) : `Archivo ${i + 1}`,
          autores: 'No disponible',
          resumen: 'Error: Archivo inválido o sin nombre',
          aplica: false,
          puntuacion: 0,
          justificacion: 'No se pudo procesar el archivo debido a metadatos inválidos',
          error: true
        });
        
        continue;
      }
      
      // Actualizar progreso
      const currentProgress = Math.round(((i) / totalFiles) * 100);
      setProgress(currentProgress);
      
      addLog(`Analizando archivo ${i + 1} de ${totalFiles}: ${file.name}`, 'info');
      
      try {
        // Simular llamada a la API del modelo de IA
        addLog(`Enviando contenido a ${getModelDisplayName(selectedModel)}...`, 'info');
        
        // Simular tiempo de análisis
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
        
        // Simular resultado del análisis
        const result = await simulateAIAnalysis(file, selectedModel);
        analysisResults.push(result);
        
        addLog(`✅ Análisis completado para: ${file.name}`, 'success');
        addLog(`   Título: ${result.titulo}`, 'info');
        addLog(`   Autores: ${result.autores}`, 'info');
        addLog(`   ¿Aplica?: ${result.aplica ? 'Sí' : 'No'}`, 'info');
        addLog(`   Puntuación: ${result.puntuacion}/10`, 'info');
      } catch (error) {
        console.error(`Error al analizar el archivo ${file.name}:`, error);
        addLog(`❌ Error al analizar ${file.name}: ${error.message}`, 'error');
        
        // Añadir un resultado de error
        analysisResults.push({
          titulo: file.name,
          autores: 'No disponible',
          resumen: 'Error al analizar el archivo',
          aplica: false,
          puntuacion: 0,
          justificacion: `Error durante el análisis: ${error.message}`,
          error: true
        });
      }
    }
    
    // Análisis completado
    setProgress(100);
    setResults(analysisResults);
    setAnalysisComplete(true);
    setAnalyzing(false);
    
    // Guardar resultados en localStorage
    localStorage.setItem('analysisResults', JSON.stringify(analysisResults));
    
    // Calcular estadísticas
    const applicableCount = analysisResults.filter(r => r.aplica).length;
    const avgScore = analysisResults.length > 0 
      ? (analysisResults.reduce((sum, r) => sum + r.puntuacion, 0) / analysisResults.length).toFixed(1)
      : 0;
    
    addLog('✅ Análisis completado para todos los archivos.', 'success');
    addLog(`Total de artículos analizados: ${analysisResults.length}`, 'info');
    addLog(`Artículos aplicables según PRISMA: ${applicableCount}`, 'info');
    addLog(`Puntuación promedio: ${avgScore}/10`, 'info');
  };

  const simulateAIAnalysis = async (file, model) => {
    // En una implementación real, esto enviaría el archivo al backend para su análisis
    // y recibiría los resultados reales de la IA
    
    // Generar resultados aleatorios para demostración
    const applies = Math.random() > 0.3; // 70% de probabilidad de que aplique
    const score = applies ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 3; // Puntuación 8-10 si aplica, 3-7 si no
    
    let title, authors, summary, justification;
    
    // Usar el nombre del archivo para generar un título más realista
    const fileName = file.name || "archivo.pdf";
    const fileNameWithoutExt = fileName.replace(/\.pdf$/i, '');
    
    // Obtener el objetivo o tags del estudio
    const analysisConfig = JSON.parse(localStorage.getItem('analysisConfig') || '{}');
    const definitionMode = analysisConfig.definitionMode || 0;
    const tags = analysisConfig.tags || [];
    const tagsText = tags.join(', ');
    
    switch (model) {
      case 'gpt4o':
        title = `Análisis exhaustivo sobre ${fileNameWithoutExt}`;
        authors = 'Dr. Smith, J., Prof. Johnson, A., et al.';
        summary = 'Este estudio presenta un análisis detallado y metodológicamente riguroso sobre el tema, con conclusiones bien fundamentadas en evidencia empírica.';
        justification = applies 
          ? `Este estudio se alinea perfectamente con ${definitionMode === 1 ? `los temas seleccionados (${tagsText}).` : 'el objetivo de investigación planteado.'} La metodología es sólida, los resultados están claramente presentados y las conclusiones son coherentes.`
          : `Aunque el estudio es de alta calidad, no se alinea adecuadamente con ${definitionMode === 1 ? `los temas especificados (${tagsText}).` : 'el objetivo de investigación planteado.'} El enfoque del estudio difiere significativamente del objetivo buscado.`;
        break;
      case 'sonnet':
        title = `Estudio sobre ${fileNameWithoutExt}: Perspectivas y hallazgos`;
        authors = 'Williams, R., Thompson, K., García, M.';
        summary = 'Los autores presentan un análisis detallado del tema, explorando múltiples dimensiones y ofreciendo una perspectiva equilibrada sobre los hallazgos.';
        justification = applies 
          ? `El estudio se alinea perfectamente con ${definitionMode === 1 ? `las etiquetas temáticas definidas (${tagsText}).` : 'el objetivo de la investigación.'} Presenta datos relevantes, utiliza una metodología apropiada y sus conclusiones contribuyen significativamente al campo de estudio.`
          : `El estudio, aunque valioso en su propio contexto, no se alinea con ${definitionMode === 1 ? `los temas específicos buscados (${tagsText}).` : 'el objetivo específico de la investigación.'} La temática analizada difiere sustancialmente de la que es objeto de interés.`;
        break;
      default:
        title = `Estudio sobre ${fileNameWithoutExt}`;
        authors = 'Autor A, Autor B, Autor C';
        summary = 'Este estudio examina diversos aspectos relacionados con el tema principal, presentando resultados y conclusiones basadas en la investigación realizada.';
        justification = applies 
          ? `Este estudio proporciona información relevante ${definitionMode === 1 ? `para los temas seleccionados (${tagsText}).` : 'para el objetivo de la investigación.'}`
          : `Este estudio no proporciona información relevante ${definitionMode === 1 ? `para los temas seleccionados (${tagsText}).` : 'para el objetivo de la investigación.'}`;
    }
    
    return {
      titulo: title,
      autores: authors,
      resumen: summary,
      aplica: applies,
      puntuacion: score,
      justificacion: justification
    };
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Análisis con IA
      </Typography>
      
      <Typography variant="body1" paragraph>
        La IA analizará los PDFs según el objetivo definido. Este proceso puede tomar varios minutos dependiendo del número y tamaño de los archivos.
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
      
      {!analyzing && !analysisComplete && (
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="model-select-label">Modelo de IA</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={selectedModel}
              label="Modelo de IA"
              onChange={handleModelChange}
            >
              <MenuItem value="gpt4o-mini" disabled={!apiKeys.openai}>OpenAI GPT-4o-mini</MenuItem>
              <MenuItem value="gpt4o" disabled={!apiKeys.openai}>OpenAI GPT-4o</MenuItem>
              <MenuItem value="sonnet" disabled={!apiKeys.anthropic}>Anthropic Sonnet 3.7</MenuItem>
              <MenuItem value="deepseek" disabled={!apiKeys.deepseek}>DeepSeek</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AnalyticsIcon />}
              onClick={startAnalysis}
              disabled={!files || files.length === 0 || !objective}
            >
              Iniciar Análisis
            </Button>
          </Box>
          
          {(!files || files.length === 0) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No hay archivos para analizar. Vuelve al paso anterior para cargar PDFs.
            </Alert>
          )}
          
          {!objective && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No se ha definido un objetivo para el estudio. Vuelve al paso anterior para definirlo.
            </Alert>
          )}
        </Box>
      )}
      
      {(analyzing || analysisComplete) && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              Progreso: {progress}%
            </Typography>
            {analyzing && <CircularProgress size={20} sx={{ ml: 1 }} />}
            {analysisComplete && <CheckCircleIcon color="success" sx={{ ml: 1 }} />}
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              mb: 2
            }} 
          />
          
          {currentFile && analyzing && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Analizando: {currentFile.name || "Archivo sin nombre"}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Registro de actividad
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          {logs.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center">
              El registro de actividad aparecerá aquí cuando inicie el análisis.
            </Typography>
          ) : (
            logs.map((log, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  color: log.type === 'success' ? 'success.main' : 
                         log.type === 'error' ? 'error.main' : 
                         'text.primary',
                  mb: 0.5
                }}
              >
                [{log.timestamp}] {log.message}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
      
      {analysisComplete && results.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Resumen de resultados
          </Typography>
          <List>
            {results.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <PictureAsPdfIcon color={result.error ? "error" : "primary"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={result.titulo}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {result.autores}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={result.aplica ? 'Aplica' : 'No aplica'} 
                            color={result.aplica ? 'success' : 'error'} 
                            size="small"
                            icon={result.aplica ? <CheckCircleIcon /> : <ErrorIcon />}
                          />
                          <Chip 
                            label={`Puntuación: ${result.puntuacion}/10`} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < results.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onBack}
          disabled={analyzing}
        >
          Atrás
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onNext}
          disabled={!analysisComplete || results.length === 0}
        >
          Ver Resultados Completos
        </Button>
      </Box>
    </Paper>
  );
};

export default AnalysisStep;
