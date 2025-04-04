import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import MarkdownIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ExportDialog = ({ open, onClose, results }) => {
  const [tabValue, setTabValue] = useState(0);
  const [format, setFormat] = useState('txt');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Actualizar formato basado en la pestaña
    const formats = ['txt', 'md', 'csv'];
    setFormat(formats[newValue]);
    
    // Generar contenido para el nuevo formato
    generateContent(formats[newValue]);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenPreview = () => {
    generateContent(format);
    setPreviewOpen(true);
    handleMenuClose();
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Contenido copiado al portapapeles',
          severity: 'success'
        });
        handleMenuClose();
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        setSnackbar({
          open: true,
          message: 'Error al copiar al portapapeles',
          severity: 'error'
        });
      });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const generateContent = (selectedFormat) => {
    setLoading(true);
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
      let generatedContent = '';
      
      switch (selectedFormat) {
        case 'txt':
          generatedContent = exportAsTxt(results);
          break;
        case 'md':
          generatedContent = exportAsMd(results);
          break;
        case 'csv':
          generatedContent = exportAsCsv(results);
          break;
        default:
          generatedContent = 'Formato no soportado';
      }
      
      setContent(generatedContent);
      setLoading(false);
    }, 500);
  };

  const exportAsTxt = (results) => {
    let content = 'RESULTADOS DEL ANÁLISIS DE ARTÍCULOS CIENTÍFICOS\n';
    content += '==============================================\n\n';
    
    results.forEach((result, index) => {
      content += `ARTÍCULO ${index + 1}\n`;
      content += '-----------------\n';
      content += `Título: ${result.titulo || 'No disponible'}\n`;
      content += `Autores: ${result.autores || 'No disponible'}\n`;
      content += `¿Aplica?: ${result.aplica ? 'Sí' : 'No'}\n`;
      content += `Puntuación: ${result.puntuacion ? result.puntuacion + '/10' : 'N/A'}\n\n`;
      content += `Resumen:\n${result.resumen || 'No disponible'}\n\n`;
      content += `Justificación:\n${result.justificacion || 'No disponible'}\n\n`;
      content += '==============================================\n\n';
    });
    
    return content;
  };

  const exportAsMd = (results) => {
    let content = '# Resultados del Análisis de Artículos Científicos\n\n';
    
    results.forEach((result, index) => {
      content += `## Artículo ${index + 1}: ${result.titulo || 'Sin título'}\n\n`;
      content += `**Autores:** ${result.autores || 'No disponible'}\n\n`;
      content += `**¿Aplica?:** ${result.aplica ? '✅ Sí' : '❌ No'}\n\n`;
      content += `**Puntuación:** ${result.puntuacion ? result.puntuacion + '/10' : 'N/A'}\n\n`;
      content += `### Resumen\n\n${result.resumen || 'No disponible'}\n\n`;
      content += `### Justificación\n\n${result.justificacion || 'No disponible'}\n\n`;
      content += '---\n\n';
    });
    
    return content;
  };

  const exportAsCsv = (results) => {
    // Cabecera del CSV
    let content = 'Título,Autores,Resumen,¿Aplica?,Puntuación,Justificación\n';
    
    // Función para escapar campos CSV
    const escapeCsv = (text) => {
      if (!text) return '';
      // Reemplazar comillas dobles por dos comillas dobles y envolver en comillas
      return `"${text.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    };
    
    // Agregar cada resultado como una fila
    results.forEach(result => {
      const row = [
        escapeCsv(result.titulo),
        escapeCsv(result.autores),
        escapeCsv(result.resumen),
        result.aplica ? 'Sí' : 'No',
        result.puntuacion || 'N/A',
        escapeCsv(result.justificacion)
      ].join(',');
      
      content += row + '\n';
    });
    
    return content;
  };

  const handleDownload = () => {
    // Preparar el contenido según el formato
    let filename = '';
    let mimeType = '';
    
    switch (format) {
      case 'txt':
        filename = 'resultados_analisis.txt';
        mimeType = 'text/plain';
        break;
      case 'md':
        filename = 'resultados_analisis.md';
        mimeType = 'text/markdown';
        break;
      case 'csv':
        filename = 'resultados_analisis.csv';
        mimeType = 'text/csv';
        break;
      default:
        return;
    }
    
    // Crear y descargar el archivo
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: `Archivo ${filename} descargado correctamente`,
      severity: 'success'
    });
  };

  // Inicializar contenido al abrir el diálogo
  React.useEffect(() => {
    if (open) {
      generateContent('txt');
    }
  }, [open, results]);

  const getFormatIcon = (formatType) => {
    switch (formatType) {
      case 'txt':
        return <TextSnippetIcon />;
      case 'md':
        return <MarkdownIcon />;
      case 'csv':
        return <TableChartIcon />;
      default:
        return <TextSnippetIcon />;
    }
  };

  const getFormatName = (formatType) => {
    switch (formatType) {
      case 'txt':
        return 'Texto plano (TXT)';
      case 'md':
        return 'Markdown (MD)';
      case 'csv':
        return 'Valores separados por comas (CSV)';
      default:
        return formatType.toUpperCase();
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Exportar resultados</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{ mb: 3 }}
          >
            <Tab 
              icon={<TextSnippetIcon />} 
              label="TXT" 
              iconPosition="start"
            />
            <Tab 
              icon={<MarkdownIcon />} 
              label="MD" 
              iconPosition="start"
            />
            <Tab 
              icon={<TableChartIcon />} 
              label="CSV" 
              iconPosition="start"
            />
          </Tabs>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {getFormatName(format)}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {format === 'txt' && 'Formato de texto plano, fácil de leer en cualquier editor de texto.'}
              {format === 'md' && 'Formato Markdown, ideal para documentación y publicación en plataformas como GitHub.'}
              {format === 'csv' && 'Formato de valores separados por comas, ideal para importar en Excel u otras herramientas de análisis de datos.'}
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  maxHeight: 200, 
                  overflow: 'auto',
                  bgcolor: 'background.default',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  position: 'relative'
                }}
              >
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Tooltip title="Opciones">
                    <IconButton size="small" onClick={handleMenuOpen}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleOpenPreview}>
                      <ListItemIcon>
                        <PreviewIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Ver vista previa completa</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCopyToClipboard}>
                      <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Copiar al portapapeles</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {content.length > 500 ? content.substring(0, 500) + '...' : content}
                </pre>
              </Paper>
              <Typography variant="caption" color="text.secondary">
                Vista previa limitada. Haz clic en "Ver vista previa completa" para ver todo el contenido.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de exportación
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="body2" color="text.secondary">
                  Artículos incluidos
                </Typography>
                <Typography variant="h6">
                  {results.length}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="body2" color="text.secondary">
                  Formato
                </Typography>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFormatIcon(format)}
                  {format.toUpperCase()}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="body2" color="text.secondary">
                  Tamaño aproximado
                </Typography>
                <Typography variant="h6">
                  {(content.length / 1024).toFixed(1)} KB
                </Typography>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}
          >
            Descargar {format.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de vista previa completa */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Vista previa de {format.toUpperCase()}</Typography>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: 500, 
              overflow: 'auto',
              bgcolor: 'background.default',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCopyToClipboard} 
            startIcon={<ContentCopyIcon />}
          >
            Copiar al portapapeles
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportDialog;
