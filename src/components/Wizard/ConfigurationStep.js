import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Collapse,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  Zoom
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import FileService from '../../services/FileService';

const ConfigurationStep = ({ onNext }) => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    deepseek: '',
    google: ''
  });
  const [defaultModel, setDefaultModel] = useState('gpt4o-mini');
  const [advancedOptions, setAdvancedOptions] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    showAdvanced: false
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState({
    openai: false,
    anthropic: false,
    deepseek: false,
    google: false
  });

  // Añadir los límites de tokens por modelo
  const modelTokenLimits = {
    'gpt4o': 128000,
    'gpt4o-mini': 32000,
    'sonnet': 200000,
    'deepseek': 32000,
    'gemini-2.5-pro': 2097152,
    'gemini-2.0-flash': 1048576
  };

  // *** Definir el mapeo aquí para que esté disponible en todo el componente ***
  const modelToApiKeyMap = {
    'gpt4o': 'openai',
    'gpt4o-mini': 'openai',
    'sonnet': 'anthropic',
    'deepseek': 'deepseek',
    'gemini-2.5-pro': 'google',
    'gemini-2.0-flash': 'google'
  };

  // Cargar configuración guardada al iniciar
  React.useEffect(() => {
    // Eliminar carga de apiKeys de localStorage
    // const savedApiKeys = localStorage.getItem('apiKeys');
    const savedDefaultModel = localStorage.getItem('defaultModel');
    const savedAdvancedOptions = localStorage.getItem('advancedOptions');
    
    // *** Cargar estado de las keys desde el backend ***
    const fetchApiKeyStatus = async () => {
      try {
        // Asumiendo que FileService.getApiKeyStatus() existe y devuelve { openai: true, google: false, ... }
        const status = await FileService.getApiKeyStatus();
        setVerified(prev => ({ 
          ...prev, // Mantener valores iniciales por si la API falla
          openai: !!status.openai, // Asegurarse de que sean booleanos
          anthropic: !!status.anthropic,
          deepseek: !!status.deepseek,
          google: !!status.google
        }));
      } catch (error) {
        console.error('Error al cargar estado de API Keys desde el servidor:', error);
        // Mantener verified en false si hay error
        setVerified({ openai: false, anthropic: false, deepseek: false, google: false });
      }
    };
    fetchApiKeyStatus();
    // *** Fin carga estado backend ***
    
    if (savedDefaultModel) {
      setDefaultModel(savedDefaultModel);
    }
    
    if (savedAdvancedOptions) {
      try {
        const parsedOptions = JSON.parse(savedAdvancedOptions);
        setAdvancedOptions(prev => ({
          ...prev,
          temperature: parsedOptions.temperature !== undefined ? parsedOptions.temperature : prev.temperature,
          maxTokens: parsedOptions.maxTokens !== undefined ? parsedOptions.maxTokens : prev.maxTokens,
          topP: parsedOptions.topP !== undefined ? parsedOptions.topP : prev.topP,
          frequencyPenalty: parsedOptions.frequencyPenalty !== undefined ? parsedOptions.frequencyPenalty : prev.frequencyPenalty,
          presencePenalty: parsedOptions.presencePenalty !== undefined ? parsedOptions.presencePenalty : prev.presencePenalty
        }));
      } catch (error) {
        console.error('Error al cargar opciones avanzadas:', error);
      }
    }
  }, []);

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
    
    // Resetear verificación al cambiar la API Key
    if (verified[provider]) {
      setVerified(prev => ({
        ...prev,
        [provider]: false
      }));
    }
    
    // Limpiar error si existe
    if (errors[provider]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[provider];
        return newErrors;
      });
    }
  };

  const handleDefaultModelChange = (event) => {
    setDefaultModel(event.target.value);
  };

  const handleAdvancedOptionChange = (option, value) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const toggleAdvancedOptions = () => {
    setAdvancedOptions(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
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

  const verifyApiKey = async (provider) => {
    if (!apiKeys[provider]) {
      setErrors(prev => ({
        ...prev,
        [provider]: 'La API Key es obligatoria para verificar'
      }));
      return false;
    }
    
    setVerifying(true);
    
    try {
      // Simular verificación de API Key
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una aplicación real, aquí se haría una llamada a la API para verificar la clave
      const isValid = Math.random() > 0.2; // Simular 80% de éxito
      
      if (isValid) {
        setVerified(prev => ({
          ...prev,
          [provider]: true
        }));
        
        // Limpiar error si existe
        if (errors[provider]) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[provider];
            return newErrors;
          });
        }
        
        showAlert(`API Key de ${getProviderName(provider)} verificada correctamente`, 'success');
        return true;
      } else {
        setErrors(prev => ({
          ...prev,
          [provider]: 'API Key inválida o error de conexión'
        }));
        
        setVerified(prev => ({
          ...prev,
          [provider]: false
        }));
        
        showAlert(`Error al verificar la API Key de ${getProviderName(provider)}`, 'error');
        return false;
      }
    } catch (error) {
      console.error(`Error al verificar API Key de ${provider}:`, error);
      
      setErrors(prev => ({
        ...prev,
        [provider]: 'Error al verificar la API Key'
      }));
      
      showAlert(`Error al verificar la API Key de ${getProviderName(provider)}: ${error.message}`, 'error');
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic';
      case 'deepseek': return 'DeepSeek';
      case 'google': return 'Google AI';
      default: return provider;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que al menos una API Key esté configurada
    const hasApiKey = Object.values(apiKeys).some(key => key.trim() !== '');
    
    if (!hasApiKey) {
      showAlert('Debes configurar al menos una API Key para continuar', 'error');
      return;
    }
    
    // Verificar que la API Key del modelo predeterminado esté configurada
    const requiredProvider = modelToApiKeyMap[defaultModel];
    
    if (!apiKeys[requiredProvider]) {
      showAlert(`Debes configurar la API Key de ${getProviderName(requiredProvider)} para usar el modelo predeterminado seleccionado`, 'error');
      return;
    }
    
    // Verificar la API Key del modelo predeterminado si no está verificada
    if (!verified[requiredProvider]) {
      const isValid = await verifyApiKey(requiredProvider);
      
      if (!isValid) {
        return;
      }
    }
    
    // *** Modificar guardado ***
    try {
      // Enviar keys al backend para guardar en .env
      // Asumiendo que FileService.saveApiKeys(apiKeys) existe
      await FileService.saveApiKeys(apiKeys);
      showAlert('Configuración de API Keys guardada en el servidor.', 'success');

      // Guardar solo el modelo predeterminado y opciones avanzadas en localStorage
      localStorage.setItem('defaultModel', defaultModel);
      localStorage.setItem('advancedOptions', JSON.stringify({
        temperature: advancedOptions.temperature,
        maxTokens: advancedOptions.maxTokens,
        topP: advancedOptions.topP,
        frequencyPenalty: advancedOptions.frequencyPenalty,
        presencePenalty: advancedOptions.presencePenalty
      }));
      
      // Continuar al siguiente paso
      onNext();

    } catch (error) {
      console.error('Error guardando API Keys en el servidor:', error);
      showAlert(`Error al guardar la configuración en el servidor: ${error.message}`, 'error');
    }
  };

  const setMaxTokensForModel = () => {
    const provider = modelToApiKeyMap[defaultModel] || 'deepseek';
    const maxTokens = modelTokenLimits[defaultModel] || 2000;
    handleAdvancedOptionChange('maxTokens', maxTokens);
  };

  // *** Nueva función para borrar API Key ***
  const handleClearApiKey = async (provider) => {
    // Limpiar estado local
    setApiKeys(prev => ({ ...prev, [provider]: '' }));
    setVerified(prev => ({ ...prev, [provider]: false }));
    if (errors[provider]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[provider];
        return newErrors;
      });
    }

    // Llamar al backend para borrar
    try {
      // Asumiendo que FileService.deleteApiKey(provider) existe
      await FileService.deleteApiKey(provider);
      showAlert(`API Key de ${getProviderName(provider)} borrada del servidor.`, 'success');
    } catch (error) {
      console.error(`Error borrando API Key de ${provider} en servidor:`, error);
      showAlert(`Error al borrar la API Key de ${provider} en el servidor.`, 'error');
      // Opcional: Revertir el cambio local si falla el borrado en backend?
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Configuración de APIs
      </Typography>
      
      <Typography variant="body1" paragraph>
        Configura las API Keys de los modelos de IA que deseas utilizar para analizar los artículos científicos.
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
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* OpenAI API Key */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.openai}
              >
                <TextField
                  id="openai-api-key"
                  label="OpenAI API Key (GPT-4o / GPT-4o-mini)"
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  error={!!errors.openai}
                  helperText={errors.openai}
                  disabled={verifying}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="sk-..."
                  InputProps={{
                    endAdornment: verified.openai && (
                      <Zoom in={verified.openai}>
                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                      </Zoom>
                    )
                  }}
                />
              </FormControl>
              <Tooltip title="Verificar API Key">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => verifyApiKey('openai')}
                    disabled={!apiKeys.openai || verifying}
                    sx={{ mt: 1, minWidth: 100 }}
                  >
                    {verifying ? <CircularProgress size={24} /> : 'Verificar'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={`Borrar API Key de ${getProviderName('openai')}`}>
                <span>
                  <IconButton
                    onClick={() => handleClearApiKey('openai')}
                    disabled={!apiKeys.openai || verifying}
                    size="large"
                    sx={{ mt: 0.5 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
          
          {/* Anthropic API Key */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.anthropic}
              >
                <TextField
                  id="anthropic-api-key"
                  label="Anthropic API Key (Sonnet 3.7)"
                  type="password"
                  value={apiKeys.anthropic}
                  onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  error={!!errors.anthropic}
                  helperText={errors.anthropic}
                  disabled={verifying}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="sk-ant-..."
                  InputProps={{
                    endAdornment: verified.anthropic && (
                      <Zoom in={verified.anthropic}>
                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                      </Zoom>
                    )
                  }}
                />
              </FormControl>
              <Tooltip title="Verificar API Key">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => verifyApiKey('anthropic')}
                    disabled={!apiKeys.anthropic || verifying}
                    sx={{ mt: 1, minWidth: 100 }}
                  >
                    {verifying ? <CircularProgress size={24} /> : 'Verificar'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={`Borrar API Key de ${getProviderName('anthropic')}`}>
                <span>
                  <IconButton
                    onClick={() => handleClearApiKey('anthropic')}
                    disabled={!apiKeys.anthropic || verifying}
                    size="large"
                    sx={{ mt: 0.5 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
          
          {/* DeepSeek API Key */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.deepseek}
              >
                <TextField
                  id="deepseek-api-key"
                  label="DeepSeek API Key"
                  type="password"
                  value={apiKeys.deepseek}
                  onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                  error={!!errors.deepseek}
                  helperText={errors.deepseek}
                  disabled={verifying}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="sk-..."
                  InputProps={{
                    endAdornment: verified.deepseek && (
                      <Zoom in={verified.deepseek}>
                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                      </Zoom>
                    )
                  }}
                />
              </FormControl>
              <Tooltip title="Verificar API Key">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => verifyApiKey('deepseek')}
                    disabled={!apiKeys.deepseek || verifying}
                    sx={{ mt: 1, minWidth: 100 }}
                  >
                    {verifying ? <CircularProgress size={24} /> : 'Verificar'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={`Borrar API Key de ${getProviderName('deepseek')}`}>
                <span>
                  <IconButton
                    onClick={() => handleClearApiKey('deepseek')}
                    disabled={!apiKeys.deepseek || verifying}
                    size="large"
                    sx={{ mt: 0.5 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
          
          {/* Google AI Key */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.google}
              >
                <TextField
                  id="google-api-key"
                  label="Google AI Key (Gemini 2.5 Pro / 2.0 Flash)"
                  type="password"
                  value={apiKeys.google}
                  onChange={(e) => handleApiKeyChange('google', e.target.value)}
                  error={!!errors.google}
                  helperText={errors.google}
                  disabled={verifying}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="AIza..."
                  InputProps={{
                    endAdornment: verified.google && (
                      <Zoom in={verified.google}>
                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                      </Zoom>
                    )
                  }}
                />
              </FormControl>
              <Tooltip title="Verificar API Key">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => verifyApiKey('google')}
                    disabled={!apiKeys.google || verifying}
                    sx={{ mt: 1, minWidth: 100 }}
                  >
                    {verifying ? <CircularProgress size={24} /> : 'Verificar'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={`Borrar API Key de ${getProviderName('google')}`}>
                <span>
                  <IconButton
                    onClick={() => handleClearApiKey('google')}
                    disabled={!apiKeys.google || verifying}
                    size="large"
                    sx={{ mt: 0.5 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          {/* Modelo predeterminado */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="default-model-label">Modelo predeterminado</InputLabel>
              <Select
                labelId="default-model-label"
                id="default-model"
                value={defaultModel}
                label="Modelo predeterminado"
                onChange={handleDefaultModelChange}
                disabled={verifying}
              >
                <MenuItem value="gpt4o-mini" disabled={!apiKeys.openai}>OpenAI GPT-4o-mini</MenuItem>
                <MenuItem value="gpt4o" disabled={!apiKeys.openai}>OpenAI GPT-4o</MenuItem>
                <MenuItem value="sonnet" disabled={!apiKeys.anthropic}>Anthropic Sonnet 3.7</MenuItem>
                <MenuItem value="deepseek" disabled={!apiKeys.deepseek}>DeepSeek</MenuItem>
                <MenuItem value="gemini-2.5-pro" disabled={!apiKeys.google}>Google Gemini 2.5 Pro</MenuItem>
                <MenuItem value="gemini-2.0-flash" disabled={!apiKeys.google}>Google Gemini 2.0 Flash</MenuItem>
              </Select>
              <FormHelperText>
                Selecciona el modelo que se utilizará por defecto para el análisis
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={advancedOptions.showAdvanced} 
                  onChange={toggleAdvancedOptions}
                  color="primary"
                />
              }
              label="Mostrar opciones avanzadas"
            />
          </Grid>
          
          {advancedOptions.showAdvanced && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                  Opciones avanzadas para {getProviderName(modelToApiKeyMap[defaultModel] || 'deepseek')}
                </Typography>
              </Grid>
            
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Temperatura
                    <Tooltip title="Controla la aleatoriedad de las respuestas. Valores más bajos generan respuestas más deterministas y enfocadas, mientras que valores más altos producen respuestas más creativas y diversas.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Preciso
                    </Typography>
                    <TextField
                      type="range"
                      inputProps={{
                        min: 0,
                        max: 1,
                        step: 0.1
                      }}
                      value={advancedOptions.temperature}
                      onChange={(e) => handleAdvancedOptionChange('temperature', parseFloat(e.target.value))}
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Creativo
                    </Typography>
                  </Box>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {advancedOptions.temperature}
                  </Typography>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TextField
                      id="max-tokens"
                      label="Tokens máximos"
                      type="number"
                      value={advancedOptions.maxTokens}
                      onChange={(e) => handleAdvancedOptionChange('maxTokens', parseInt(e.target.value, 10))}
                      inputProps={{ min: 100, max: 200000 }}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Tooltip title={`Establecer al máximo para ${getProviderName(modelToApiKeyMap[defaultModel] || 'deepseek')}: ${modelTokenLimits[defaultModel] || 32000} tokens`}>
                      <Button
                        variant="outlined"
                        onClick={setMaxTokensForModel}
                        sx={{ mt: 1, minWidth: 80 }}
                      >
                        MAX
                      </Button>
                    </Tooltip>
                  </Box>
                  <FormHelperText>
                    Límite máximo de tokens para las respuestas del modelo
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Top P
                    <Tooltip title="Controla la diversidad seleccionando tokens con probabilidad acumulada. 0.9 significa que solo se consideran tokens que constituyen el 90% de la masa de probabilidad.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Enfocado
                    </Typography>
                    <TextField
                      type="range"
                      inputProps={{
                        min: 0.1,
                        max: 1,
                        step: 0.05
                      }}
                      value={advancedOptions.topP}
                      onChange={(e) => handleAdvancedOptionChange('topP', parseFloat(e.target.value))}
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Diverso
                    </Typography>
                  </Box>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {advancedOptions.topP}
                  </Typography>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Penalización de frecuencia
                    <Tooltip title="Reduce la probabilidad de repetir los mismos tokens. Valores más altos penalizan más la repetición.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ninguna
                    </Typography>
                    <TextField
                      type="range"
                      inputProps={{
                        min: 0,
                        max: 2,
                        step: 0.1
                      }}
                      value={advancedOptions.frequencyPenalty}
                      onChange={(e) => handleAdvancedOptionChange('frequencyPenalty', parseFloat(e.target.value))}
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Máxima
                    </Typography>
                  </Box>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {advancedOptions.frequencyPenalty}
                  </Typography>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Penalización de presencia
                    <Tooltip title="Reduce la probabilidad de generar tokens que ya han aparecido. Útil para evitar repeticiones de temas.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ninguna
                    </Typography>
                    <TextField
                      type="range"
                      inputProps={{
                        min: 0,
                        max: 2,
                        step: 0.1
                      }}
                      value={advancedOptions.presencePenalty}
                      onChange={(e) => handleAdvancedOptionChange('presencePenalty', parseFloat(e.target.value))}
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Máxima
                    </Typography>
                  </Box>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {advancedOptions.presencePenalty}
                  </Typography>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={verifying}
          >
            Continuar
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ConfigurationStep;
