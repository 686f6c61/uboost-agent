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
  CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileService from '../../services/FileService';

// Componente de tabla para mostrar todos los metadatos
const MetadataTable = () => {
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('filename');
  const [order, setOrder] = useState('asc');
  const [exporting, setExporting] = useState(false);

  // Cargar metadatos al montar el componente
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        const response = await FileService.getAllMetadata();
        
        if (response.success && response.metadata) {
          setMetadata(response.metadata);
        } else {
          setError('No se pudieron cargar los metadatos');
        }
      } catch (error) {
        console.error('Error al cargar metadatos:', error);
        setError('Error al cargar metadatos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetadata();
  }, []);
  
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
  
  // Manejar cambio en ordenación
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Convertir el objeto de metadatos a un array para ordenación
  const metadataArray = Object.entries(metadata).map(([filename, data]) => ({
    filename,
    title: data.title || 'N/A',
    authors: data.authors || 'N/A',
    year: data.year || 'N/A',
    keywords: data.keywords || 'N/A'
  }));
  
  // Función para ordenar los datos
  const sortedData = metadataArray.sort((a, b) => {
    let valueA = a[orderBy];
    let valueB = b[orderBy];
    
    // Convertir año a número para ordenación correcta
    if (orderBy === 'year') {
      valueA = valueA === 'N/A' ? 0 : parseInt(valueA, 10);
      valueB = valueB === 'N/A' ? 0 : parseInt(valueB, 10);
    }
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
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
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          disabled={exporting || metadataArray.length === 0}
        >
          {exporting ? 'Exportando...' : 'Exportar a CSV'}
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow 
                key={row.filename}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.filename}
                </TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.title}
                </TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.authors}
                </TableCell>
                <TableCell>{row.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MetadataTable; 