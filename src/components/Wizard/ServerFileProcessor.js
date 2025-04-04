import FileService from '../../services/FileService';

// Clase para procesar archivos en el servidor
export class ServerFileProcessor {
  // Analizar un archivo PDF con IA
  static async analyzeFile(filename, model, apiKeys) {
    try {
      if (!filename || !model || !apiKeys) {
        throw new Error('Faltan parámetros para analizar el archivo');
      }
      
      const response = await FileService.analyzePDF(filename, model, apiKeys);
      
      if (response.success) {
        return {
          success: true,
          metadata: response.metadata
        };
      } else {
        return {
          success: false,
          error: 'Error al analizar el archivo con IA'
        };
      }
    } catch (error) {
      console.error(`Error al analizar archivo ${filename}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Analizar múltiples archivos PDF con IA
  static async analyzeMultipleFiles(filenames, model, apiKeys, onProgress) {
    try {
      if (!filenames || !filenames.length || !model || !apiKeys) {
        throw new Error('Faltan parámetros para analizar los archivos');
      }
      
      const results = {};
      
      for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        
        // Actualizar progreso si se proporciona una función
        if (onProgress) {
          onProgress(Math.round((i / filenames.length) * 100));
        }
        
        try {
          const response = await FileService.analyzePDF(filename, model, apiKeys);
          
          if (response.success) {
            results[filename] = response.metadata;
          }
        } catch (error) {
          console.error(`Error al analizar el archivo ${filename}:`, error);
        }
      }
      
      // Actualizar progreso final
      if (onProgress) {
        onProgress(100);
      }
      
      return results;
    } catch (error) {
      console.error('Error al analizar múltiples archivos:', error);
      throw error;
    }
  }
  
  // Cargar los metadatos existentes para los archivos
  static async loadMetadata(filenames) {
    try {
      const results = {};
      
      for (const filename of filenames) {
        try {
          // Aquí podríamos tener una API para obtener metadatos guardados previamente
          // Por ahora, simplemente devolvemos un objeto vacío
          results[filename] = {
            title: '',
            authors: '',
            year: ''
          };
        } catch (error) {
          console.error(`Error al cargar metadatos del archivo ${filename}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error al cargar metadatos:', error);
      throw error;
    }
  }
  
  // Guardar los metadatos actualizados
  static async saveMetadata(filename, metadata) {
    try {
      // Aquí podríamos tener una API para guardar metadatos
      // Por ahora, simplemente retornamos éxito
      return {
        success: true
      };
    } catch (error) {
      console.error(`Error al guardar metadatos del archivo ${filename}:`, error);
      throw error;
    }
  }
} 