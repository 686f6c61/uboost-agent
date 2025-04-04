import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArticleIcon from '@mui/icons-material/Article';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';

const ToolCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
    cursor: 'pointer',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const HomePage = ({ onStartWizard, onSelectTool = () => {} }) => {
  const handleToolSelect = (tool) => {
    onSelectTool(tool);
    if (tool === 'adecuacion') {
      onStartWizard();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          Agente de investigación científica
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: '800px', mb: 4 }}
        >
          Herramientas de IA para el análisis, generación y comprensión de artículos científicos.
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ToolCard elevation={3} onClick={() => handleToolSelect('adecuacion')}>
              <IconWrapper>
                <ArticleIcon fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" component="h3" gutterBottom>
                Adecuación de artículos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analiza y evalúa artículos científicos según las normas PRISMA.
              </Typography>
            </ToolCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ToolCard elevation={3} onClick={() => handleToolSelect('resumen')}>
              <IconWrapper>
                <SummarizeIcon fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" component="h3" gutterBottom>
                Resumen de artículos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Genera resúmenes detallados y precisos de artículos científicos.
              </Typography>
            </ToolCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ToolCard elevation={3} onClick={() => handleToolSelect('generador')}>
              <IconWrapper>
                <AutoStoriesIcon fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" component="h3" gutterBottom>
                Generador de revisión
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea artículos de revisión basados en múltiples fuentes científicas.
              </Typography>
            </ToolCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ToolCard elevation={3} onClick={() => handleToolSelect('inteligencia')}>
              <IconWrapper>
                <PsychologyIcon fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" component="h3" gutterBottom>
                Inteligencia sobre artículos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis avanzado y comprensión profunda de la literatura científica.
              </Typography>
            </ToolCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
