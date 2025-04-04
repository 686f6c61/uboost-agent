import * as pdfjs from 'pdfjs-dist';

// Configuración global del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Extraer texto de un archivo PDF
export const extractTextFromPDF = async (file, setUploadProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Si solo tenemos metadatos, no podemos extraer texto
      if (file.isMetadataOnly) {
        resolve({
          text: file.text || "Contenido no disponible (solo metadatos)",
          numPages: file.numPages || 0,
          info: file.info || {}
        });
        return;
      }
      
      // Convertir el archivo a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Cargar el documento PDF
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      // Obtener información del documento
      const info = await pdf.getMetadata();
      
      // Extraer texto de todas las páginas
      let fullText = '';
      const numPages = pdf.numPages;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
        
        // Actualizar progreso si existe la función
        if (setUploadProgress) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              pageProgress: Math.round((i / numPages) * 100)
            }
          }));
        }
      }
      
      resolve({
        text: fullText,
        numPages,
        info
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Función para detectar el idioma del texto (simplificada)
export const detectLanguage = (text) => {
  // En una implementación real, usaríamos una biblioteca de detección de idioma
  // Para esta demo, simplemente detectamos basado en palabras comunes
  const spanishWords = ['el', 'la', 'los', 'las', 'y', 'en', 'de', 'que', 'es', 'por'];
  const englishWords = ['the', 'and', 'of', 'to', 'in', 'is', 'that', 'for', 'with', 'as'];
  
  const words = text.toLowerCase().split(/\s+/);
  let spanishCount = 0;
  let englishCount = 0;
  
  words.forEach(word => {
    if (spanishWords.includes(word)) spanishCount++;
    if (englishWords.includes(word)) englishCount++;
  });
  
  return spanishCount > englishCount ? 'Español' : 'Inglés';
};

// Procesar todos los archivos PDF
export const processAllFiles = async (files, setUploadProgress) => {
  const processedFiles = [];
  const errors = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Inicializar progreso
    if (setUploadProgress) {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: {
          overall: Math.round((i / files.length) * 100),
          pageProgress: 0
        }
      }));
    }
    
    try {
      // Si ya tenemos los datos procesados (de localStorage), usamos esos
      if (file.isMetadataOnly && file.processed) {
        processedFiles.push(file);
        continue;
      }
      
      // Extraer texto y metadatos
      const { text, numPages, info } = await extractTextFromPDF(file, setUploadProgress);
      
      // Extraer autores del PDF
      let authors = "Autor desconocido";
      if (info && info.info) {
        if (info.info.Author) {
          authors = info.info.Author;
        }
      }
      
      // Extraer título del PDF
      let title = file.name.replace('.pdf', '');
      if (info && info.info) {
        if (info.info.Title && info.info.Title.trim() !== '') {
          title = info.info.Title;
        }
      }
      
      // Detectar idioma
      const language = detectLanguage(text);
      
      processedFiles.push({
        name: file.name,
        size: file.size,
        title,
        authors,
        text,
        numPages,
        language,
        processed: true
      });
    } catch (error) {
      console.error(`Error al procesar el archivo ${file.name}:`, error);
      errors.push({ name: file.name, error: error.message });
    }
  }
  
  // Actualizar progreso final
  if (setUploadProgress) {
    setUploadProgress(prev => ({
      ...prev,
      overall: 100
    }));
  }
  
  return { processedFiles, errors };
}; 