import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileService from '../../services/FileService';

// Componente de tabla para mostrar todos los metadatos
const MetadataTable = ({ metadata: initialMetadata = {}, existingFiles = [] }) => {
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('filename');
  const [order, setOrder] = useState('asc');
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState({ single: null, all: false });
  const [exportingTXT, setExportingTXT] = useState(false);
  const [exportingMD, setExportingMD] = useState(false);

  // Recuperar modelo y API keys del localStorage
  const [aiModel, setAiModel] = useState(null);
  const [apiKeys, setApiKeys] = useState(null);

  // Estado para el borrado de metadata específica
  const [deletingMetadata, setDeletingMetadata] = useState(null);

  useEffect(() => {
    const storedModel = localStorage.getItem('defaultModel');
    const storedKeys = localStorage.getItem('apiKeys');
    setAiModel(storedModel || 'deepseek'); // Modelo por defecto si no hay nada
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (e) {
        console.error("Error parsing API keys from localStorage", e);
        setError("Error al leer la configuración de API keys.");
      }
    }
  }, []);

  // Estado local para manejar actualizaciones internas tras regeneración
  const [internalMetadata, setInternalMetadata] = useState(initialMetadata);

  // Actualizar estado interno si la prop cambia (por si el diálogo se mantiene abierto)
  useEffect(() => {
    setInternalMetadata(initialMetadata);
  }, [initialMetadata]);

  // Regenerar metadatos para un solo archivo
  const handleRegenerateSingle = async (filename) => {
    if (!aiModel || !apiKeys) {
      setError('Configure el modelo y las API keys antes de regenerar.');
      return;
    }
    setRegenerating(prev => ({ ...prev, single: filename }));
    setError(null);
    try {
      const response = await FileService.analyzePDF(filename, aiModel, apiKeys);
      if (response.success && response.metadata) {
        // Actualizar estado INTERNO
        setInternalMetadata(prev => ({ ...prev, [filename]: response.metadata }));
      } else {
        setError(`Error al regenerar ${filename}: ${response.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(`Error al regenerar ${filename}:`, err);
      setError(`Error al regenerar ${filename}: ${err.message}`);
    } finally {
      setRegenerating(prev => ({ ...prev, single: null }));
    }
  };

  // Regenerar metadatos para todos los archivos
  const handleRegenerateAll = async () => {
    if (!aiModel || !apiKeys) {
      setError('Configure el modelo y las API keys antes de regenerar.');
      return;
    }
    const filenames = Object.keys(internalMetadata);
    if (filenames.length === 0) return;

    setRegenerating(prev => ({ ...prev, all: true }));
    setError(null);
    try {
      // Usar la función de análisis en lote del servicio
      const response = await FileService.analyzeMultiplePDFs(filenames, aiModel, apiKeys);
      
      if (response.success && response.results) {
        const updatedMetadata = { ...internalMetadata };
        let successCount = 0;
        const errors = [];
        
        response.results.forEach(result => {
          if (result.success && result.metadata) {
            updatedMetadata[result.filename] = result.metadata;
            successCount++;
          } else {
            errors.push(`${result.filename}: ${result.error || 'Error desconocido'}`);
          }
        });
        
        setInternalMetadata(updatedMetadata); // Actualizar estado interno
        
        if (errors.length > 0) {
          setError(`Errores durante la regeneración: ${errors.join('; ')}`);
        } else {
          setError(null); // Limpiar errores si todo fue bien
        }
        console.log(`${successCount} archivos regenerados correctamente.`);
      } else {
        // Error general de la llamada batch
        setError(`Error en la regeneración total: ${response.message || 'Error desconocido'}`);
      }

    } catch (err) {
      console.error('Error en regeneración total:', err);
      setError('Error grave durante la regeneración total.');
    } finally {
      setRegenerating(prev => ({ ...prev, all: false }));
    }
  };

  // Exportar metadatos a CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await FileService.exportMetadataCSV();
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      setError('Error al exportar a CSV: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Función auxiliar para descargar contenido como archivo
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exportar metadatos a TXT
  const handleExportTXT = () => {
    setExportingTXT(true);
    setError(null);
    try {
      let txtContent = "Metadatos Extraídos\n====================\n\n";
      const metadataArray = Object.entries(internalMetadata);

      if (metadataArray.length === 0) {
        setError("No hay metadatos para exportar.");
        return;
      }

      metadataArray.forEach(([filename, data]) => {
        txtContent += `Archivo: ${filename}\n`;
        txtContent += `Título: ${data.title || 'N/A'}\n`;
        txtContent += `Autores: ${data.authors || 'N/A'}\n`;
        txtContent += `Año: ${data.year || 'N/A'}\n`;
        txtContent += `Keywords: ${data.keywords || 'N/A'}\n`;
        txtContent += "--------------------\n\n";
      });

      downloadFile(txtContent, 'metadata.txt', 'text/plain;charset=utf-8;');

    } catch (error) {
      console.error('Error al exportar a TXT:', error);
      setError('Error al generar el archivo TXT: ' + error.message);
    } finally {
      setExportingTXT(false);
    }
  };

  // Exportar metadatos a MD (Markdown)
  const handleExportMD = () => {
    setExportingMD(true);
    setError(null);
    try {
      let mdContent = "# Metadatos Extraídos\n\n";
      const metadataArray = Object.entries(internalMetadata);

      if (metadataArray.length === 0) {
        setError("No hay metadatos para exportar.");
        return;
      }

      // Cabecera de la tabla Markdown
      mdContent += "| Archivo | Título | Autores | Año | Keywords |\n";
      mdContent += "|---|---|---|---|---|\n";

      // Filas de la tabla Markdown
      metadataArray.forEach(([filename, data]) => {
        // Escapar pipes (|) dentro del contenido para evitar romper la tabla MD
        const safeFilename = filename.replace(/\|/g, '\\|');
        const safeTitle = (data.title || 'N/A').replace(/\|/g, '\\|');
        const safeAuthors = (data.authors || 'N/A').replace(/\|/g, '\\|');
        const safeYear = (data.year || 'N/A').toString().replace(/\|/g, '\\|');
        const safeKeywords = (data.keywords || 'N/A').replace(/\|/g, '\\|');
        
        mdContent += `| ${safeFilename} | ${safeTitle} | ${safeAuthors} | ${safeYear} | ${safeKeywords} |\n`;
      });

      downloadFile(mdContent, 'metadata.md', 'text/markdown;charset=utf-8;');

    } catch (error) {
      console.error('Error al exportar a MD:', error);
      setError('Error al generar el archivo MD: ' + error.message);
    } finally {
      setExportingMD(false);
    }
  };
  
  // Manejar cambio en ordenación
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Convertir el objeto de metadatos a un array y marcar si el archivo falta
  const metadataArray = Object.entries(internalMetadata).map(([filename, data]) => ({
    filename,
    title: data.title || 'N/A',
    authors: data.authors || 'N/A',
    year: data.year || 'N/A',
    keywords: data.keywords || 'N/A',
    isMissing: !existingFiles.includes(filename) // Marcar si no está en la lista de existentes
  }));
  
  // *** Log para depurar los datos antes de ordenar ***
  console.log("[Debug MetadataTable] Data before sort:", JSON.stringify(metadataArray, null, 2));

  // Función para ordenar los datos
  const sortedData = metadataArray.sort((a, b) => {
    let valueA = a[orderBy];
    let valueB = b[orderBy];
    
    // Convertir año a número para ordenación correcta
    if (orderBy === 'year') {
      valueA = valueA === 'N/A' ? 0 : parseInt(valueA, 10);
      valueB = valueB === 'N/A' ? 0 : parseInt(valueB, 10);
    }
    // Manejar ordenación de keywords (case-insensitive)
    else if (orderBy === 'keywords') {
      valueA = (valueA || '').toLowerCase();
      valueB = (valueB || '').toLowerCase();
    }
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // *** Nueva función para borrar entrada de metadatos ***
  const handleDeleteMetadataEntry = async (filename) => {
    setDeletingMetadata(filename); // Marcar como borrando
    setError(null);
    try {
      // Llamar a un nuevo servicio para borrar solo la entrada de metadatos
      const response = await FileService.deleteMetadataEntry(filename);
      
      if (response.success) {
        // Eliminar la entrada del estado interno para actualizar la UI
        setInternalMetadata(prev => {
          const newState = { ...prev };
          delete newState[filename];
          return newState;
        });
      } else {
        setError(`Error al borrar metadatos para ${filename}: ${response.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(`Error al borrar metadatos para ${filename}:`, err);
      setError(`Error al borrar metadatos para ${filename}: ${err.message}`);
    } finally {
      setDeletingMetadata(null); // Terminar estado de borrado
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (metadataArray.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No hay metadatos disponibles. Por favor, analice algunos PDFs primero.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Metadatos extraídos ({metadataArray.length} archivos)
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={regenerating.all ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={handleRegenerateAll}
            disabled={regenerating.all || regenerating.single || metadataArray.length === 0 || !aiModel || !apiKeys}
            sx={{ mr: 1 }}
          >
            {regenerating.all ? 'Regenerando Todos...' : 'Regenerar Todos'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={exporting || metadataArray.length === 0}
            sx={{ mr: 1 }}
          >
            {exporting ? 'Exportando...' : 'Exportar a CSV'}
          </Button>
          <Button
            variant="outlined"
            startIcon={exportingTXT ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            onClick={handleExportTXT}
            disabled={exportingTXT || metadataArray.length === 0}
            sx={{ mr: 1 }}
          >
            {exportingTXT ? 'Exportando...' : 'Exportar a TXT'}
          </Button>
          <Button
            variant="outlined"
            startIcon={exportingMD ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            onClick={handleExportMD}
            disabled={exportingMD || metadataArray.length === 0}
          >
            {exportingMD ? 'Exportando...' : 'Exportar a MD'}
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="tabla de metadatos" size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'filename'}
                  direction={orderBy === 'filename' ? order : 'asc'}
                  onClick={() => handleRequestSort('filename')}
                >
                  Archivo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'authors'}
                  direction={orderBy === 'authors' ? order : 'asc'}
                  onClick={() => handleRequestSort('authors')}
                >
                  Autores
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'year'}
                  direction={orderBy === 'year' ? order : 'asc'}
                  onClick={() => handleRequestSort('year')}
                >
                  Año
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'keywords'}
                  direction={orderBy === 'keywords' ? order : 'asc'}
                  onClick={() => handleRequestSort('keywords')}
                >
                  Keywords
                </TableSortLabel>
              </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow 
                key={row.filename}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  // Aplicar estilo si el archivo falta
                  opacity: row.isMissing ? 0.6 : 1, 
                  fontStyle: row.isMissing ? 'italic' : 'normal'
                }}
              >
                <TableCell component="th" scope="row" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.filename}
                  {/* Icono si el archivo falta */} 
                  {row.isMissing && (
                    <Tooltip title="Archivo PDF no encontrado en el servidor">
                      <ReportProblemIcon 
                        fontSize="small" 
                        color="warning" 
                        sx={{ verticalAlign: 'middle', ml: 0.5 }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.title}
                </TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.authors}
                </TableCell>
                <TableCell>{row.year}</TableCell>
                <TableCell 
                  sx={{
                    maxWidth: 200, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.keywords}
                </TableCell>
                <TableCell>
                  {row.isMissing ? (
                    // Si falta el archivo, mostrar botón para borrar metadatos
                    <Tooltip title="Eliminar esta entrada de metadatos (el archivo PDF no existe)">
                      <span> {/* Span para Tooltip en botón deshabilitado */} 
                        <Button
                          size="small"
                          color="error"
                          startIcon={deletingMetadata === row.filename ? <CircularProgress size={16} /> : <DeleteForeverIcon />}
                          onClick={() => handleDeleteMetadataEntry(row.filename)}
                          disabled={!!deletingMetadata} // Deshabilitar si algo se está borrando
                        >
                          {deletingMetadata === row.filename ? '...' : 'Borrar Metadata'}
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    // Si el archivo existe, mostrar botón Regenerar
                    <Button
                      size="small"
                      startIcon={regenerating.single === row.filename ? <CircularProgress size={16} /> : <RefreshIcon />}
                      onClick={() => handleRegenerateSingle(row.filename)}
                      disabled={regenerating.all || !!regenerating.single || !aiModel || !apiKeys}
                    >
                      {regenerating.single === row.filename ? '...' : 'Regenerar'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MetadataTable; 