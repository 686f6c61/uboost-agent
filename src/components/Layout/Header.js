import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, useTheme, useMediaQuery, Button, IconButton, Tooltip } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

const Header = ({ onNavigate = () => {}, isConfigured = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigate = (tool) => {
    // This will be used to navigate between tools
    onNavigate(tool);
  };

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            mr: 4
          }} onClick={() => handleNavigate('home')}>
            <HomeIcon sx={{ fontSize: isMobile ? 24 : 32 }} />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h1"
              sx={{
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Agente (U)Boost
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              <Button 
                color="inherit" 
                startIcon={<ArticleIcon />}
                onClick={() => handleNavigate('adecuacion')}
              >
                Adecuación
              </Button>
              <Button 
                color="inherit" 
                startIcon={<SummarizeIcon />}
                onClick={() => handleNavigate('resumen')}
              >
                Resumen
              </Button>
              <Button 
                color="inherit" 
                startIcon={<AutoStoriesIcon />}
                onClick={() => handleNavigate('generador')}
              >
                Generador
              </Button>
              <Button 
                color="inherit" 
                startIcon={<PsychologyIcon />}
                onClick={() => handleNavigate('inteligencia')}
              >
                Inteligencia
              </Button>
              
              {isConfigured && (
                <Tooltip title="Configuración de API">
                  <IconButton 
                    color="inherit" 
                    onClick={() => handleNavigate('config')}
                    sx={{ ml: 1 }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
          
          {/* Botón de configuración en versión móvil */}
          {isMobile && isConfigured && (
            <Tooltip title="Configuración de API">
              <IconButton 
                color="inherit" 
                onClick={() => handleNavigate('config')}
                sx={{ ml: 'auto' }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
