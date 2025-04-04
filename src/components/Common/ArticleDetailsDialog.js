import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  Divider, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

const ArticleDetailsDialog = ({ open, onClose, article }) => {
  if (!article) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Detalles del Artículo
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {article.titulo}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Autores:
                </Typography>
              </Box>
              <Typography variant="body1">
                {article.autores}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Idioma:
                </Typography>
              </Box>
              <Typography variant="body1">
                {article.idioma || "No especificado"}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Páginas:
                </Typography>
              </Box>
              <Typography variant="body1">
                {article.numPages || "No especificado"}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Año:
                </Typography>
              </Box>
              <Typography variant="body1">
                {article.año || "No especificado"}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Evaluación para el estudio de revisión
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    ¿Aplica?
                  </Typography>
                  {article.aplica ? (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Sí" 
                      color="success" 
                    />
                  ) : (
                    <Chip 
                      icon={<CancelIcon />} 
                      label="No" 
                      color="error" 
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    Puntuación:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                      {article.puntuacion}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 10
                    </Typography>
                    <StarIcon sx={{ ml: 1, color: 
                      article.puntuacion >= 8 ? '#4caf50' : 
                      article.puntuacion >= 5 ? '#ff9800' : '#f44336'
                    }} />
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Justificación:
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {article.justificacion || "No se proporcionó justificación."}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Resumen
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {article.resumen || "No se proporcionó resumen."}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Contenido del artículo
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: '300px', 
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {article.text ? (
              <Typography variant="body2" component="div">
                {article.text.substring(0, 2000)}
                {article.text.length > 2000 && (
                  <Box sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                    ... (texto truncado, el artículo completo contiene {article.text.length} caracteres)
                  </Box>
                )}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                El contenido del texto no está disponible.
              </Typography>
            )}
          </Paper>
          
          {article.metadatos && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Metadatos adicionales
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Propiedad</TableCell>
                      <TableCell>Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(article.metadatos).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" scope="row">
                          {key}
                        </TableCell>
                        <TableCell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleDetailsDialog;
