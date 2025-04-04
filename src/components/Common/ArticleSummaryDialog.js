import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  Tabs,
  Tab,
  IconButton,
  List as MuiList,
  ListItem
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import MarkdownIcon from '@mui/icons-material/Code';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ArticleSummaryDialog = ({ open, onClose, article, model, maxTokens }) => {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [exportFormat, setExportFormat] = useState('txt');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info'
  });

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

  const handleTabChange = (event, newValue) => {
    setExportFormat(newValue);
  };

  const generateSummary = async () => {
    if (!article) return;
    
    setGenerating(true);
    
    try {
      // En una aplicación real, aquí se enviaría una solicitud a la API del modelo de IA
      // Simulamos la generación del resumen
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Generar un resumen estructurado simulado
      const generatedSummary = {
        titulo: article.titulo || "Título no disponible",
        contexto: "Este estudio se enmarca en el contexto de la investigación sobre inteligencia artificial y su aplicación en diversos campos. El objetivo principal es analizar el impacto de los algoritmos de aprendizaje automático en la toma de decisiones empresariales, con especial énfasis en la reducción de sesgos y la mejora de la eficiencia operativa. Los autores buscan establecer un marco de referencia para la implementación ética y efectiva de sistemas de IA en entornos organizacionales, considerando tanto aspectos técnicos como implicaciones sociales y económicas.",
        metodologia: "Se empleó una metodología mixta que combina análisis cuantitativo de datos históricos con entrevistas cualitativas a expertos del sector. Los datos fueron recopilados durante un período de 18 meses, abarcando diferentes sectores industriales y regiones geográficas. El estudio utilizó una combinación de técnicas estadísticas avanzadas y análisis temático para procesar la información obtenida. Se realizaron más de 50 entrevistas semiestructuradas con directivos y especialistas en IA de diversas organizaciones, complementadas con un análisis documental exhaustivo de políticas y procedimientos internos.",
        resultados: "Los resultados indican una correlación significativa (p<0.01) entre la implementación de sistemas de IA y la mejora en la eficiencia operativa. Se observó una reducción del 23% en los tiempos de procesamiento y un aumento del 17% en la precisión de las predicciones. Las conclusiones sugieren que la adopción de IA, cuando se implementa con las salvaguardas adecuadas, puede proporcionar ventajas competitivas sustanciales. Sin embargo, el estudio también identificó importantes desafíos relacionados con la transparencia algorítmica, la gestión del cambio organizacional y la necesidad de marcos regulatorios adaptados a las nuevas tecnologías. Los hallazgos subrayan la importancia de un enfoque holístico que considere factores técnicos, humanos y éticos en la implementación de soluciones basadas en IA.",
        ideasClave: [
          "La transparencia algorítmica es fundamental para generar confianza en los sistemas de IA",
          "Los sesgos en los datos de entrenamiento se amplifican en los resultados si no se mitigan adecuadamente",
          "La combinación de expertise humano con capacidades de IA produce mejores resultados que cualquiera de los dos por separado",
          "La adaptabilidad de los modelos a diferentes contextos culturales es un factor crítico de éxito",
          "Las organizaciones necesitan desarrollar competencias específicas para maximizar el valor de las implementaciones de IA",
          "Los marcos éticos deben evolucionar paralelamente a los avances tecnológicos"
        ],
        idioma: "Español",
        tipoTrabajo: "Empírico",
        detallesEmpiricos: {
          enfoque: "Mixto (Cuantitativo y Cualitativo)",
          paises: ["España", "México", "Colombia"],
          muestra: "Empresas del sector tecnológico y financiero",
          tamanoMuestra: "150 empresas y 300 profesionales",
          metodo: "Regresión logística, Análisis de componentes principales, Entrevistas semiestructuradas",
          variables: {
            dependientes: ["Eficiencia operativa (medida en tiempo de procesamiento)", "Precisión de predicciones (%)", "Satisfacción de usuarios (escala Likert 1-7)"],
            independientes: ["Nivel de adopción de IA", "Inversión en tecnología", "Tamaño de la organización", "Madurez digital"],
            moderadoras: ["Cultura organizacional", "Nivel de formación del personal", "Experiencia previa con tecnologías avanzadas"],
            mediadoras: ["Resistencia al cambio", "Percepción de utilidad", "Facilidad de uso percibida"],
            control: ["Sector industrial", "Ubicación geográfica", "Antigüedad de la empresa", "Estructura de propiedad"]
          }
        },
        marcoTeorico: "El estudio se fundamenta principalmente en la Teoría de la Aceptación Tecnológica (TAM) de Davis (1989) y en el marco de Gobernanza Algorítmica propuesto por Yeung (2018). Adicionalmente, incorpora elementos de la Teoría de Sistemas Sociotécnicos para analizar la interacción entre los componentes humanos y tecnológicos. Los autores desarrollan un marco conceptual integrador que vincula estos enfoques teóricos con las particularidades de los sistemas de inteligencia artificial, prestando especial atención a las dimensiones éticas y de responsabilidad corporativa. El trabajo se sitúa en la intersección de los campos de sistemas de información, gestión estratégica y ética aplicada.",
        referenciasClave: [
          {
            autor: "Davis, F. D.",
            año: 1989,
            titulo: "Perceived usefulness, perceived ease of use, and user acceptance of information technology",
            ubicacion: "Sección 2.3, páginas 23-27"
          },
          {
            autor: "Yeung, K.",
            año: 2018,
            titulo: "Algorithmic regulation: A critical interrogation",
            ubicacion: "Sección 4.1, páginas 78-82"
          },
          {
            autor: "Barocas, S. & Selbst, A. D.",
            año: 2016,
            titulo: "Big data's disparate impact",
            ubicacion: "Sección 3.2, páginas 45-51"
          },
          {
            autor: "Floridi, L. & Cowls, J.",
            año: 2019,
            titulo: "A unified framework of five principles for AI in society",
            ubicacion: "Sección 5.4, páginas 112-118"
          },
          {
            autor: "Brynjolfsson, E. & McAfee, A.",
            año: 2017,
            titulo: "The business of artificial intelligence",
            ubicacion: "Sección 1.1, páginas 3-9"
          }
        ]
      };
      
      setSummary(generatedSummary);
    } catch (error) {
      console.error("Error al generar el resumen:", error);
      showAlert("Error al generar el resumen: " + error.message, "error");
    } finally {
      setGenerating(false);
    }
  };

  // Generar el resumen al abrir el diálogo
  React.useEffect(() => {
    if (open && article && !summary) {
      generateSummary();
    }
  }, [open, article, summary, generateSummary]);

  const formatSummaryAsTxt = () => {
    if (!summary) return "";
    
    let text = `RESUMEN ESTRUCTURADO DEL ARTÍCULO\n`;
    text += `=================================\n\n`;
    
    text += `TÍTULO: ${summary.titulo}\n\n`;
    
    text += `CONTEXTO Y OBJETIVOS DE LA PUBLICACIÓN\n`;
    text += `-------------------------------------\n`;
    text += `${summary.contexto}\n\n`;
    
    text += `METODOLOGÍA USADA\n`;
    text += `----------------\n`;
    text += `${summary.metodologia}\n\n`;
    
    text += `RESULTADOS Y CONCLUSIONES\n`;
    text += `------------------------\n`;
    text += `${summary.resultados}\n\n`;
    
    text += `IDEAS CLAVE\n`;
    text += `-----------\n`;
    summary.ideasClave.forEach((idea, index) => {
      text += `${index + 1}. ${idea}\n`;
    });
    text += `\n`;
    
    text += `IDIOMA: ${summary.idioma}\n\n`;
    
    text += `TIPO DE TRABAJO: ${summary.tipoTrabajo}\n\n`;
    
    if (summary.tipoTrabajo === "Empírico") {
      text += `DETALLES DEL TRABAJO EMPÍRICO\n`;
      text += `----------------------------\n`;
      text += `Enfoque: ${summary.detallesEmpiricos.enfoque}\n`;
      text += `Países: ${summary.detallesEmpiricos.paises.join(", ")}\n`;
      text += `Muestra: ${summary.detallesEmpiricos.muestra}\n`;
      text += `Tamaño de la muestra: ${summary.detallesEmpiricos.tamanoMuestra}\n`;
      text += `Método usado: ${summary.detallesEmpiricos.metodo}\n\n`;
      
      text += `VARIABLES EMPLEADAS\n`;
      text += `-----------------\n`;
      
      text += `Variables dependientes:\n`;
      summary.detallesEmpiricos.variables.dependientes.forEach(v => {
        text += `- ${v}\n`;
      });
      
      text += `\nVariables independientes:\n`;
      summary.detallesEmpiricos.variables.independientes.forEach(v => {
        text += `- ${v}\n`;
      });
      
      text += `\nVariables moderadoras:\n`;
      summary.detallesEmpiricos.variables.moderadoras.forEach(v => {
        text += `- ${v}\n`;
      });
      
      text += `\nVariables mediadoras:\n`;
      summary.detallesEmpiricos.variables.mediadoras.forEach(v => {
        text += `- ${v}\n`;
      });
      
      text += `\nVariables de control:\n`;
      summary.detallesEmpiricos.variables.control.forEach(v => {
        text += `- ${v}\n`;
      });
      
      text += `\n`;
    }
    
    text += `MARCO TEÓRICO DE REFERENCIA\n`;
    text += `---------------------------\n`;
    text += `${summary.marcoTeorico}\n\n`;
    
    text += `REFERENCIAS CLAVE\n`;
    text += `----------------\n`;
    summary.referenciasClave.forEach((ref, index) => {
      text += `${index + 1}. ${ref.autor} (${ref.año}). ${ref.titulo}. Ubicación: ${ref.ubicacion}\n`;
    });
    
    return text;
  };

  const formatSummaryAsMd = () => {
    if (!summary) return "";
    
    let md = `# Resumen Estructurado: ${summary.titulo}\n\n`;
    
    md += `## Contexto y objetivos de la publicación\n\n`;
    md += `${summary.contexto}\n\n`;
    
    md += `## Metodología usada\n\n`;
    md += `${summary.metodologia}\n\n`;
    
    md += `## Resultados y conclusiones\n\n`;
    md += `${summary.resultados}\n\n`;
    
    md += `## Ideas clave\n\n`;
    summary.ideasClave.forEach((idea) => {
      md += `- ${idea}\n`;
    });
    md += `\n`;
    
    md += `**Idioma:** ${summary.idioma}\n\n`;
    
    md += `**Tipo de trabajo:** ${summary.tipoTrabajo}\n\n`;
    
    if (summary.tipoTrabajo === "Empírico") {
      md += `## Detalles del trabajo empírico\n\n`;
      md += `- **Enfoque:** ${summary.detallesEmpiricos.enfoque}\n`;
      md += `- **Países:** ${summary.detallesEmpiricos.paises.join(", ")}\n`;
      md += `- **Muestra:** ${summary.detallesEmpiricos.muestra}\n`;
      md += `- **Tamaño de la muestra:** ${summary.detallesEmpiricos.tamanoMuestra}\n`;
      md += `- **Método usado:** ${summary.detallesEmpiricos.metodo}\n\n`;
      
      md += `### Variables empleadas\n\n`;
      
      md += `#### Variables dependientes\n\n`;
      summary.detallesEmpiricos.variables.dependientes.forEach(v => {
        md += `- ${v}\n`;
      });
      
      md += `\n#### Variables independientes\n\n`;
      summary.detallesEmpiricos.variables.independientes.forEach(v => {
        md += `- ${v}\n`;
      });
      
      md += `\n#### Variables moderadoras\n\n`;
      summary.detallesEmpiricos.variables.moderadoras.forEach(v => {
        md += `- ${v}\n`;
      });
      
      md += `\n#### Variables mediadoras\n\n`;
      summary.detallesEmpiricos.variables.mediadoras.forEach(v => {
        md += `- ${v}\n`;
      });
      
      md += `\n#### Variables de control\n\n`;
      summary.detallesEmpiricos.variables.control.forEach(v => {
        md += `- ${v}\n`;
      });
      
      md += `\n`;
    }
    
    md += `## Marco teórico de referencia\n\n`;
    md += `${summary.marcoTeorico}\n\n`;
    
    md += `## Referencias clave\n\n`;
    summary.referenciasClave.forEach((ref) => {
      md += `- **${ref.autor}** (${ref.año}). *${ref.titulo}*. Ubicación: ${ref.ubicacion}\n`;
    });
    
    return md;
  };

  const handleDownload = () => {
    if (!summary) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    // Preparar contenido según formato seleccionado
    switch (exportFormat) {
      case 'txt':
        content = formatSummaryAsTxt();
        filename = `resumen_${article.titulo.replace(/\s+/g, '_').substring(0, 30)}.txt`;
        mimeType = 'text/plain';
        break;
      case 'md':
        content = formatSummaryAsMd();
        filename = `resumen_${article.titulo.replace(/\s+/g, '_').substring(0, 30)}.md`;
        mimeType = 'text/markdown';
        break;
      case 'pdf':
        // En una implementación real, aquí se generaría un PDF
        // Para esta demo, usaremos un enfoque simplificado
        alert("La generación de PDF requiere una biblioteca adicional. Por favor, selecciona TXT o MD.");
        return;
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
    
    showAlert(`Archivo ${filename} descargado correctamente`, 'success');
  };

  const handleCopyToClipboard = () => {
    if (!summary) return;
    
    let content = '';
    
    // Preparar contenido según formato seleccionado
    switch (exportFormat) {
      case 'txt':
        content = formatSummaryAsTxt();
        break;
      case 'md':
        content = formatSummaryAsMd();
        break;
      default:
        return;
    }
    
    navigator.clipboard.writeText(content)
      .then(() => {
        showAlert('Contenido copiado al portapapeles', 'success');
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        showAlert('Error al copiar al portapapeles', 'error');
      });
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'txt':
        return <TextSnippetIcon />;
      case 'md':
        return <MarkdownIcon />;
      case 'pdf':
        return <PictureAsPdfIcon />;
      default:
        return <TextSnippetIcon />;
    }
  };

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
            Resumen Estructurado del Artículo
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Collapse in={alert.show}>
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 3 }}
            onClose={() => setAlert({ ...alert, show: false })}
          >
            {alert.message}
          </Alert>
        </Collapse>
        
        {generating ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Generando resumen estructurado...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esto puede tomar un momento. Estamos analizando el artículo en profundidad.
            </Typography>
          </Box>
        ) : summary ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              {summary.titulo}
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Contexto y objetivos de la publicación
              </Typography>
              <Typography variant="body1" paragraph>
                {summary.contexto}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Metodología usada
              </Typography>
              <Typography variant="body1" paragraph>
                {summary.metodologia}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Resultados y conclusiones
              </Typography>
              <Typography variant="body1" paragraph>
                {summary.resultados}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ideas clave
              </Typography>
              <ul>
                {summary.ideasClave.map((idea, index) => (
                  <li key={index}>
                    <Typography variant="body1">
                      {idea}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Idioma
                </Typography>
                <Chip label={summary.idioma} color="primary" />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle1" gutterBottom>
                  Tipo de trabajo
                </Typography>
                <Chip 
                  label={summary.tipoTrabajo} 
                  color={
                    summary.tipoTrabajo === "Empírico" ? "success" :
                    summary.tipoTrabajo === "Teórico" ? "info" :
                    summary.tipoTrabajo === "Revisión" ? "warning" : "default"
                  } 
                />
              </Grid>
            </Grid>
            
            {summary.tipoTrabajo === "Empírico" && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles del trabajo empírico
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Enfoque
                    </Typography>
                    <Typography variant="body1">
                      {summary.detallesEmpiricos.enfoque}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Países
                    </Typography>
                    <Typography variant="body1">
                      {summary.detallesEmpiricos.paises.join(", ")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Muestra
                    </Typography>
                    <Typography variant="body1">
                      {summary.detallesEmpiricos.muestra}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tamaño de la muestra
                    </Typography>
                    <Typography variant="body1">
                      {summary.detallesEmpiricos.tamanoMuestra}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Método usado
                    </Typography>
                    <Typography variant="body1">
                      {summary.detallesEmpiricos.metodo}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom>
                  Variables empleadas
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Variables dependientes
                        </Typography>
                        <ul>
                          {summary.detallesEmpiricos.variables.dependientes.map((v, i) => (
                            <li key={i}>
                              <Typography variant="body2">{v}</Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Variables independientes
                        </Typography>
                        <ul>
                          {summary.detallesEmpiricos.variables.independientes.map((v, i) => (
                            <li key={i}>
                              <Typography variant="body2">{v}</Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Variables moderadoras
                        </Typography>
                        <ul>
                          {summary.detallesEmpiricos.variables.moderadoras.map((v, i) => (
                            <li key={i}>
                              <Typography variant="body2">{v}</Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Variables mediadoras
                        </Typography>
                        <ul>
                          {summary.detallesEmpiricos.variables.mediadoras.map((v, i) => (
                            <li key={i}>
                              <Typography variant="body2">{v}</Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Variables de control
                        </Typography>
                        <ul>
                          {summary.detallesEmpiricos.variables.control.map((v, i) => (
                            <li key={i}>
                              <Typography variant="body2">{v}</Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Marco teórico de referencia
              </Typography>
              <Typography variant="body1" paragraph>
                {summary.marcoTeorico}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Referencias clave
              </Typography>
              <MuiList>
                {summary.referenciasClave.map((ref, index) => (
                  <ListItem key={index} sx={{ display: 'block', mb: 2 }}>
                    <Typography variant="body1">
                      <strong>{ref.autor}</strong> ({ref.año}). <em>{ref.titulo}</em>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ubicación: {ref.ubicacion}
                    </Typography>
                    {index < summary.referenciasClave.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </ListItem>
                ))}
              </MuiList>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No se ha podido generar el resumen. Por favor, inténtalo de nuevo.
            </Typography>
            <Button 
              variant="contained" 
              onClick={generateSummary} 
              sx={{ mt: 2 }}
            >
              Reintentar
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Tabs 
            value={exportFormat} 
            onChange={handleTabChange} 
            centered
            variant="fullWidth"
          >
            <Tab 
              icon={<TextSnippetIcon />} 
              label="TXT" 
              value="txt"
              iconPosition="start"
            />
            <Tab 
              icon={<MarkdownIcon />} 
              label="MD" 
              value="md"
              iconPosition="start"
            />
            <Tab 
              icon={<PictureAsPdfIcon />} 
              label="PDF" 
              value="pdf"
              iconPosition="start"
              disabled
            />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button 
            onClick={onClose} 
            color="inherit"
          >
            Cerrar
          </Button>
          <Box>
            <Button 
              onClick={handleCopyToClipboard} 
              startIcon={<ContentCopyIcon />}
              disabled={!summary || generating}
              sx={{ mr: 1 }}
            >
              Copiar
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="contained" 
              color="primary" 
              startIcon={getFormatIcon(exportFormat)}
              disabled={!summary || generating}
            >
              Descargar {exportFormat.toUpperCase()}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleSummaryDialog;
