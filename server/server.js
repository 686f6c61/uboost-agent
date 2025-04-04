// Cargar variables de entorno desde .env al inicio
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración específica para pdfjs-dist en Node.js
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
// No es necesario configurar el worker en Node.js

// Importar el servicio de IA
const AIService = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 5000;

// Ruta para el archivo de metadatos
const METADATA_FILE = path.join(__dirname, 'metadata.json');

// *** Helpers para manejar el archivo .env ***
const ENV_PATH = path.join(__dirname, '..', '.env'); // .env en la raíz

// Mapeo de proveedores a nombres de variables de entorno
const PROVIDER_TO_ENV_KEY = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  google: 'GOOGLE_API_KEY'
};

// Función para leer y parsear el .env (simple, puede mejorarse)
const readEnvFile = () => {
  try {
    if (!fs.existsSync(ENV_PATH)) {
      return {};
    }
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const envConfig = {};
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          envConfig[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return envConfig;
  } catch (error) {
    console.error("Error reading .env file:", error);
    return {};
  }
};

// Función para escribir el objeto de configuración al .env (sobrescribe)
const writeEnvFile = (envConfig) => {
  try {
    let content = "";
    for (const [key, value] of Object.entries(envConfig)) {
      // Solo escribir si la key y el value existen
      if (key && value) { 
        content += `${key}=${value}\n`;
      }
    }
    fs.writeFileSync(ENV_PATH, content, 'utf8');
  } catch (error) {
    console.error("Error writing .env file:", error);
    throw error; // Re-lanzar para que la ruta API falle
  }
};
// *** Fin Helpers .env ***

// Función para cargar metadatos
function loadMetadata() {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error('Error al cargar metadatos:', error);
    return {};
  }
}

// Función para guardar metadatos
function saveMetadata(metadata) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error al guardar metadatos:', error);
  }
}

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    // Usar timestamp para evitar nombres duplicados
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // Límite de 50MB por archivo
  }
});

// Ruta para subir archivos
app.post('/api/upload', upload.array('files', 200), (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date()
    }));

    res.status(200).json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Ruta para obtener la lista de archivos almacenados
app.get('/api/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al leer el directorio de archivos',
        error: err.message
      });
    }
    
    // Filtrar solo archivos PDF y obtener información
    const pdfFiles = files.filter(file => file.endsWith('.pdf') || path.extname(file).toLowerCase() === '.pdf');
    
    const filesInfo = pdfFiles.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        originalName: filename.substring(filename.indexOf('-') + 1),
        path: `/uploads/${filename}`,
        size: stats.size,
        uploadDate: stats.mtime
      };
    });
    
    res.status(200).json({
      success: true,
      files: filesInfo
    });
  });
});

// Ruta para eliminar un archivo
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el archivo',
        error: err.message
      });
    }
    
    // *** Añadir eliminación de metadatos aquí ***
    const allMetadata = loadMetadata();
    if (allMetadata[filename]) {
      delete allMetadata[filename];
      saveMetadata(allMetadata);
      console.log(`[Delete Single] Metadata entry removed for ${filename}`);
    }
    // *** Fin de la adición ***

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  });
});

// Ruta para eliminar múltiples archivos
app.post('/api/files/delete-multiple', (req, res) => {
  const { filenames } = req.body;
  
  if (!filenames || !Array.isArray(filenames)) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere una lista de nombres de archivos'
    });
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  // Eliminar cada archivo en la lista
  const deletePromises = filenames.map(filename => {
    return new Promise((resolve) => {
      const filePath = path.join(__dirname, 'uploads', filename);
      
      fs.unlink(filePath, (err) => {
        if (err) {
          results.failed.push({ filename, error: err.message });
        } else {
          results.success.push(filename);
        }
        resolve();
      });
    });
  });
  
  Promise.all(deletePromises)
    .then(() => {
      // *** Añadir eliminación de metadatos aquí ***
      if (results.success.length > 0) {
        const allMetadata = loadMetadata();
        let metadataChanged = false;
        results.success.forEach(deletedFilename => {
          if (allMetadata[deletedFilename]) {
            delete allMetadata[deletedFilename];
            metadataChanged = true;
            console.log(`[Delete Multiple] Metadata entry removed for ${deletedFilename}`);
          }
        });
        if (metadataChanged) {
          saveMetadata(allMetadata);
        }
      }
      // *** Fin de la adición ***

      res.status(200).json({
        success: true,
        message: `${results.success.length} archivos eliminados, ${results.failed.length} errores`,
        results
      });
    });
});

// Ruta para extraer metadatos de un PDF usando IA
app.post('/api/files/:filename/analyze', async (req, res) => {
  try {
    const { model, apiKeys } = req.body;
    
    if (!model || !apiKeys) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un modelo y API keys'
      });
    }
    
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Leer el archivo
    const data = new Uint8Array(fs.readFileSync(filePath));
    
    // Cargar el PDF
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    // Extraer texto de las primeras 3 páginas
    let extractedText = "";
    const maxPages = Math.min(3, pdf.numPages);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      extractedText += pageText + " ";
    }
    
    // Analizar el PDF con IA
    const metadata = await AIService.analyzePDF(extractedText, model, apiKeys);
    
    // Guardar metadatos
    const allMetadata = loadMetadata();
    allMetadata[filename] = metadata;
    saveMetadata(allMetadata);
    
    res.status(200).json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Error al analizar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar PDF',
      error: error.message
    });
  }
});

// Ruta para obtener metadatos de un archivo
app.get('/api/files/:filename/metadata', (req, res) => {
  try {
    const filename = req.params.filename;
    const allMetadata = loadMetadata();
    const metadata = allMetadata[filename];
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron metadatos para este archivo'
      });
    }
    
    res.status(200).json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Error al obtener metadatos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadatos',
      error: error.message
    });
  }
});

// Ruta para obtener metadatos de todos los archivos
app.get('/api/files/metadata', (req, res) => {
  try {
    const allMetadata = loadMetadata();
    res.status(200).json({
      success: true,
      metadata: allMetadata
    });
  } catch (error) {
    console.error('Error al obtener metadatos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadatos',
      error: error.message
    });
  }
});

// Ruta para analizar múltiples PDFs con IA
app.post('/api/files/analyze/batch', async (req, res) => {
  try {
    const { filenames, model, apiKeys } = req.body;
    
    if (!filenames || !Array.isArray(filenames) || !model || !apiKeys) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una lista de nombres de archivos, un modelo y API keys'
      });
    }
    
    const results = [];
    
    for (const filename of filenames) {
      try {
        const filePath = path.join(__dirname, 'uploads', filename);
        
        if (!fs.existsSync(filePath)) {
          results.push({
            filename,
            success: false,
            metadata: null,
            error: 'Archivo no encontrado'
          });
          continue;
        }
        
        // Leer el archivo
        const data = new Uint8Array(fs.readFileSync(filePath));
        
        // Cargar el PDF
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        
        // Extraer texto de las primeras 3 páginas
        let extractedText = "";
        const maxPages = Math.min(3, pdf.numPages);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          extractedText += pageText + " ";
        }
        
        // Analizar el PDF con IA
        const metadata = await AIService.analyzePDF(extractedText, model, apiKeys);
        
        // *** Log para depurar la respuesta de la IA ***
        console.log(`[Debug Analyze Batch] AI Response for ${filename}:`, JSON.stringify(metadata));

        results.push({
          filename,
          success: true,
          metadata
        });

        // *** Añadir guardado de metadatos aquí ***
        if (metadata) { // Solo guardar si se obtuvieron metadatos
          const allMetadata = loadMetadata();
          allMetadata[filename] = metadata;
          // *** Log para depurar lo que se va a guardar ***
          console.log(`[Debug Analyze Batch] Saving metadata for ${filename}:`, JSON.stringify(allMetadata[filename]));
          saveMetadata(allMetadata);
        }

      } catch (error) {
        console.error(`Error al analizar el archivo ${filename}:`, error);
        results.push({
          filename,
          success: false,
          metadata: null,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error al analizar PDFs en lote:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar PDFs en lote',
      error: error.message
    });
  }
});

// Ruta para renombrar archivos usando metadatos
app.post('/api/files/rename', async (req, res) => {
  try {
    const { filenames } = req.body;
    
    if (!filenames || !Array.isArray(filenames)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una lista de nombres de archivos'
      });
    }
    
    const allMetadata = loadMetadata();
    const results = {
      success: [],
      failed: []
    };
    
    for (const filename of filenames) {
      try {
        const metadata = allMetadata[filename];
        
        if (!metadata || !metadata.title || !metadata.authors || !metadata.year) {
          results.failed.push({
            filename,
            error: 'No hay metadatos completos para este archivo'
          });
          continue;
        }
        
        // Crear nuevo nombre de archivo - limpiar caracteres especiales
        const cleanTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const cleanAuthors = metadata.authors.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const newFilename = `${metadata.year}-${cleanAuthors}-${cleanTitle}.pdf`;
        
        // Ruta completa del archivo original y nuevo
        const oldPath = path.join(__dirname, 'uploads', filename);
        const newPath = path.join(__dirname, 'uploads', newFilename);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(oldPath)) {
          results.failed.push({
            filename,
            error: 'Archivo no encontrado'
          });
          continue;
        }
        
        // Renombrar el archivo
        fs.renameSync(oldPath, newPath);
        
        // Actualizar metadatos con el nuevo nombre
        allMetadata[newFilename] = metadata;
        delete allMetadata[filename];
        
        results.success.push({
          oldFilename: filename,
          newFilename: newFilename
        });
      } catch (error) {
        console.error(`Error al renombrar el archivo ${filename}:`, error);
        results.failed.push({
          filename,
          error: error.message
        });
      }
    }
    
    // Guardar metadatos actualizados
    saveMetadata(allMetadata);
    
    res.status(200).json({
      success: true,
      message: `${results.success.length} archivos renombrados, ${results.failed.length} errores`,
      results
    });
  } catch (error) {
    console.error('Error al renombrar archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al renombrar archivos',
      error: error.message
    });
  }
});

// Ruta para exportar metadatos a CSV
app.get('/api/files/export-csv', (req, res) => {
  try {
    const allMetadata = loadMetadata();
    
    if (Object.keys(allMetadata).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay metadatos para exportar'
      });
    }
    
    // Crear cabecera del CSV
    let csvContent = 'Nombre de archivo,Título,Autores,Año,Journal/Conference,DOI,Keywords\n';
    
    // Añadir filas de datos
    for (const [filename, metadata] of Object.entries(allMetadata)) {
      const title = metadata.title ? `"${metadata.title.replace(/"/g, '""')}"` : '';
      const authors = metadata.authors ? `"${metadata.authors.replace(/"/g, '""')}"` : '';
      const year = metadata.year || '';
      const journal = metadata.journal ? `"${metadata.journal.replace(/"/g, '""')}"` : '';
      const doi = metadata.doi || '';
      const keywords = metadata.keywords ? `"${metadata.keywords.replace(/"/g, '""')}"` : '';
      
      csvContent += `"${filename}",${title},${authors},${year},${journal},${doi},${keywords}\n`;
    }
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=metadata.csv');
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error al exportar a CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar a CSV',
      error: error.message
    });
  }
});

// *** Nueva Ruta para eliminar solo la entrada de metadatos ***
app.delete('/api/metadata/:filename', (req, res) => {
  const filename = req.params.filename;
  
  try {
    const allMetadata = loadMetadata();
    
    if (allMetadata[filename]) {
      delete allMetadata[filename];
      saveMetadata(allMetadata);
      console.log(`[API Delete Metadata] Metadata entry deleted for: ${filename}`);
      res.status(200).json({ success: true, message: 'Entrada de metadatos eliminada.' });
    } else {
      // Si no existe, igual consideramos éxito porque el estado deseado es que no esté.
      console.log(`[API Delete Metadata] Metadata entry not found for: ${filename}, considering success.`);
      res.status(200).json({ success: true, message: 'Entrada de metadatos no encontrada.' });
    }
  } catch (error) {
    console.error(`Error deleting metadata entry for ${filename}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error interno al eliminar la entrada de metadatos',
      error: error.message
    });
  }
});

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// *** NUEVAS RUTAS API para Configuración ***

// Obtener estado de las API Keys configuradas
app.get('/api/config/apikeys/status', (req, res) => {
  const status = {};
  for (const provider in PROVIDER_TO_ENV_KEY) {
    const envKey = PROVIDER_TO_ENV_KEY[provider];
    status[provider] = !!process.env[envKey]; // Verifica si la variable de entorno existe
  }
  res.json(status);
});

// Guardar/Actualizar API Keys
app.post('/api/config/apikeys', (req, res) => {
  const incomingKeys = req.body; // { openai: 'sk-...', google: 'AIza...', ... }
  if (!incomingKeys || typeof incomingKeys !== 'object') {
    return res.status(400).json({ success: false, message: 'Cuerpo inválido.' });
  }

  try {
    const currentEnv = readEnvFile();
    let changed = false;

    for (const provider in PROVIDER_TO_ENV_KEY) {
      const envKey = PROVIDER_TO_ENV_KEY[provider];
      const incomingValue = incomingKeys[provider];

      if (typeof incomingValue === 'string' && incomingValue.trim()) {
        // Añadir o actualizar si es diferente
        if (currentEnv[envKey] !== incomingValue.trim()) {
           currentEnv[envKey] = incomingValue.trim();
           changed = true;
           console.log(`[API Save Keys] Updating ${envKey}`);
        }
      } else {
        // Si el valor entrante está vacío o no es string, intentar eliminar
        if (currentEnv[envKey]) {
          delete currentEnv[envKey];
          changed = true;
          console.log(`[API Save Keys] Removing ${envKey} due to empty input`);
        }
      }
    }

    if (changed) {
      writeEnvFile(currentEnv);
      // IMPORTANTE: Recargar dotenv para que process.env se actualice en este proceso
      // Esto es simplista; en producción, reiniciar el servidor es más fiable.
      require('dotenv').config({ override: true }); 
      console.log('[API Save Keys] .env file updated. process.env might need server restart to fully reflect changes elsewhere.');
    }
    res.json({ success: true, message: 'Configuración guardada.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la configuración.', error: error.message });
  }
});

// Borrar API Key específica
app.delete('/api/config/apikeys/:provider', (req, res) => {
  const provider = req.params.provider;
  const envKey = PROVIDER_TO_ENV_KEY[provider];

  if (!envKey) {
    return res.status(400).json({ success: false, message: 'Proveedor inválido.' });
  }

  try {
    const currentEnv = readEnvFile();
    if (currentEnv[envKey]) {
      delete currentEnv[envKey];
      writeEnvFile(currentEnv);
      // Recargar dotenv (mismo comentario que arriba)
      require('dotenv').config({ override: true });
      console.log(`[API Delete Key] Removed ${envKey} from .env`);
      res.json({ success: true, message: `API Key para ${provider} eliminada.` });
    } else {
      res.json({ success: true, message: `API Key para ${provider} no encontrada.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Error al eliminar la API Key para ${provider}.`, error: error.message });
  }
});

// *** FIN NUEVAS RUTAS API ***

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
}); 