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
        
        results.push({
          filename,
          success: true,
          metadata
        });
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

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
}); 