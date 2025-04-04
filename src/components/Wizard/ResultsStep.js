import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  Collapse
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import MarkdownIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PieChartIcon from '@mui/icons-material/PieChart';
import ExportDialog from '../Common/ExportDialog';
import ArticleSummaryDialog from '../Common/ArticleSummaryDialog';
import ArticleDetailsDialog from '../Common/ArticleDetailsDialog';

const ResultsStep = ({ onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });
  
  // Cargar resultados del localStorage
  React.useEffect(() => {
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
        prepareChartData(parsedResults);
      } catch (error) {
        console.error('Error al cargar resultados:', error);
      }
    }
    
    // Cargar configuración
    const defaultModel = localStorage.getItem('defaultModel') || 'gpt4o-mini';
    const advancedOptions = localStorage.getItem('advancedOptions');
    if (advancedOptions) {
      try {
        const parsedOptions = JSON.parse(advancedOptions);
        setMaxTokens(parsedOptions.maxTokens || 2000);
      } catch (error) {
        console.error('Error al cargar opciones avanzadas:', error);
      }
    }
  }, []);
  
  // Estado para los datos del gráfico
  const [chartData, setChartData] = useState([]);
  const [maxTokens, setMaxTokens] = useState(2000);
  
  // Preparar datos para el gráfico
  const prepareChartData = (resultsData) => {
    if (!resultsData || resultsData.length === 0) return;
    
    // Contar artículos que aplican y no aplican
    const aplicanCount = resultsData.filter(r => r.aplica).length;
    const noAplicanCount = resultsData.filter(r => !r.aplica).length;
    
    // Preparar datos para el gráfico de distribución
    const data = [
      { name: 'Aplican', value: aplicanCount },
      { name: 'No Aplican', value: noAplicanCount }
    ];
    
    setChartData(data);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
  };
  
  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
  };
  
  const handleOpenMenu = (event, rowIndex) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(rowIndex);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };
  
  const handleOpenSummaryDialog = (article) => {
    setSelectedArticle(article);
    setSummaryDialogOpen(true);
    handleCloseMenu();
  };
  
  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
  };
  
  const handleOpenDetailsDialog = (article) => {
    setSelectedArticle(article);
    setDetailsDialogOpen(true);
    handleCloseMenu();
  };
  
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
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
  
  // Colores para el gráfico
  const COLORS = ['#4caf50', '#f44336'];
  
  // Calcular estadísticas
  const totalArticles = results.length;
  const applicableArticles = results.filter(r => r.aplica).length;
  const applicablePercentage = totalArticles > 0 ? Math.round((applicableArticles / totalArticles) * 100) : 0;
  const averageScore = results.length > 0 
    ? (results.reduce((sum, r) => sum + r.puntuacion, 0) / results.length).toFixed(1)
    : 0;
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Resultados del Análisis
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
      
      {results.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h3" align="center" color="primary">
                        {totalArticles}
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Artículos analizados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h3" align="center" color="success.main">
                        {applicableArticles}
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Artículos aplicables ({applicablePercentage}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h3" align="center" color="secondary.main">
                        {averageScore}
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Puntuación promedio
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Distribución de artículos
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} artículos`, 'Cantidad']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tabla de resultados
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }} aria-label="tabla de resultados">
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Autores</TableCell>
                    <TableCell>Idioma</TableCell>
                    <TableCell>Páginas</TableCell>
                    <TableCell align="center">¿Aplica?</TableCell>
                    <TableCell align="center">Puntuación</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.titulo}
                        </TableCell>
                        <TableCell>{row.autores}</TableCell>
                        <TableCell>{row.idioma || "No especificado"}</TableCell>
                        <TableCell>{row.numPages || "N/A"}</TableCell>
                        <TableCell align="center">
                          {row.aplica ? (
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="Sí" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<CancelIcon />} 
                              label="No" 
                              color="error" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${row.puntuacion}/10`} 
                            color={
                              row.puntuacion >= 8 ? "success" :
                              row.puntuacion >= 5 ? "warning" : "error"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="más opciones"
                            onClick={(e) => handleOpenMenu(e, index)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={results.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={onBack}
            >
              Atrás
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DownloadIcon />}
              onClick={handleOpenExportDialog}
            >
              Exportar Resultados
            </Button>
          </Box>
          
          {/* Menú de opciones para cada fila */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handleOpenSummaryDialog(results[page * rowsPerPage + selectedRow])}>
              <ListItemIcon>
                <SummarizeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Generar resumen estructurado</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOpenDetailsDialog(results[page * rowsPerPage + selectedRow])}>
              <ListItemIcon>
                <ArticleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver detalles completos</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Diálogo de exportación */}
          <ExportDialog 
            open={exportDialogOpen} 
            onClose={handleCloseExportDialog} 
            results={results} 
          />
          
          {/* Diálogo de resumen estructurado */}
          <ArticleSummaryDialog
            open={summaryDialogOpen}
            onClose={handleCloseSummaryDialog}
            article={selectedArticle}
            model={localStorage.getItem('defaultModel') || 'gpt4o-mini'}
            maxTokens={maxTokens}
          />
          
          {/* Diálogo de detalles completos */}
          <ArticleDetailsDialog
            open={detailsDialogOpen}
            onClose={handleCloseDetailsDialog}
            article={selectedArticle}
          />
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay resultados disponibles
          </Typography>
          <Typography variant="body1" paragraph>
            Vuelve al paso anterior para analizar artículos.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onBack}
          >
            Volver al análisis
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ResultsStep;
