import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme, useMediaQuery } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-start',
          textAlign: isMobile ? 'center' : 'left',
          gap: 2
        }}>
          <Box>
            <Typography variant="h6" color="primary" gutterBottom>
              Agente de artículos científicos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analiza y evalúa artículos científicos según las normas PRISMA utilizando modelos avanzados de inteligencia artificial.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Modelos de IA soportados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <b>OpenAI:</b> GPT-4o / GPT-4o-mini
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <b>Anthropic:</b> Sonnet 3.7
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <b>Google:</b> Gemini 2.5 Pro / Gemini 2.0 Flash
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <b>DeepSeek:</b> V3
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} (U)Boost Agent
          </Typography>
          <Link href="https://github.com" target="_blank" rel="noopener" color="inherit">
            <GitHubIcon fontSize="small" />
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
