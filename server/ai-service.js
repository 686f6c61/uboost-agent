const axios = require('axios');

// Servicio para conectarse a diferentes APIs de IA
class AIService {
  // Analizar un PDF con el modelo especificado
  static async analyzePDF(pdfText, model, apiKeys) {
    // Verificar que tenemos texto
    if (!pdfText || pdfText.trim() === '') {
      throw new Error('No se proporcionó texto para analizar');
    }

    // Verificar que tenemos un modelo válido
    if (!model || !apiKeys) {
      throw new Error('No se proporcionó modelo o API keys');
    }

    // Limitar el texto a las primeras 3000 palabras (aproximadamente las primeras 3 páginas)
    const limitedText = pdfText.split(' ').slice(0, 3000).join(' ');

    // Instrucciones específicas para extraer título, autores, año y keywords
    const instructions = `
      Lee cuidadosamente el siguiente extracto de un artículo científico (primeras páginas) y extrae:
      1. El título completo del artículo.
      2. Los autores (nombres completos, separados por comas si hay más de uno).
      3. El año de publicación (solo el número de 4 dígitos).
      4. Las palabras clave (Keywords) proporcionadas en el artículo (separadas por comas).

      Responde ÚNICAMENTE en formato JSON con el siguiente formato exacto:
      {
        "title": "Título completo del artículo",
        "authors": "Nombres de los autores separados por comas",
        "year": "Año de publicación (solo 4 dígitos)",
        "keywords": "PalabraClave1, PalabraClave2, PalabraClave3"
      }

      Si no puedes determinar alguno de estos datos de forma fiable, usa "Desconocido" como valor para ese campo específico.
      Si no hay palabras clave explícitas, usa "Desconocido" para el campo keywords.
      NO incluyas ningún otro texto, explicación o análisis fuera del JSON.
    `;

    try {
      // Seleccionar la API correcta según el modelo
      if (model === 'gpt4o' || model === 'gpt4o-mini') {
        return await this.callOpenAI(limitedText, instructions, model, apiKeys.openai);
      } else if (model === 'sonnet') {
        return await this.callAnthropic(limitedText, instructions, apiKeys.anthropic);
      } else if (model === 'deepseek') {
        return await this.callDeepSeek(limitedText, instructions, apiKeys.deepseek);
      } else {
        throw new Error(`Modelo no soportado: ${model}`);
      }
    } catch (error) {
      console.error(`Error al analizar PDF con ${model}:`, error);
      throw error;
    }
  }

  // Llamar a la API de OpenAI
  static async callOpenAI(text, instructions, model, apiKey) {
    if (!apiKey) {
      throw new Error('API key de OpenAI no proporcionada');
    }

    const modelName = model === 'gpt4o' ? 'gpt-4o' : 'gpt-4o-mini';
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelName,
          messages: [
            { 
              role: 'system', 
              content: instructions 
            },
            { 
              role: 'user', 
              content: text 
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      // Extraer la respuesta JSON
      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      // Parsear el JSON de la respuesta
      try {
        // Buscar y extraer solo el objeto JSON de la respuesta, por si hay texto adicional
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró un objeto JSON en la respuesta');
        }
      } catch (parseError) {
        console.error('Error al parsear respuesta JSON:', content);
        throw new Error('Error al parsear la respuesta de la IA');
      }
    } catch (error) {
      console.error('Error en llamada a OpenAI:', error.response?.data || error.message);
      throw error;
    }
  }

  // Llamar a la API de Anthropic (Claude)
  static async callAnthropic(text, instructions, apiKey) {
    if (!apiKey) {
      throw new Error('API key de Anthropic no proporcionada');
    }
    
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          temperature: 0.3,
          system: instructions,
          messages: [
            {
              role: 'user',
              content: text
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      // Extraer la respuesta JSON
      const content = response.data.content[0]?.text;
      if (!content) {
        throw new Error('Respuesta vacía de Anthropic');
      }

      // Parsear el JSON de la respuesta
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró un objeto JSON en la respuesta');
        }
      } catch (parseError) {
        console.error('Error al parsear respuesta JSON:', content);
        throw new Error('Error al parsear la respuesta de la IA');
      }
    } catch (error) {
      console.error('Error en llamada a Anthropic:', error.response?.data || error.message);
      throw error;
    }
  }

  // Llamar a la API de DeepSeek
  static async callDeepSeek(text, instructions, apiKey) {
    if (!apiKey) {
      throw new Error('API key de DeepSeek no proporcionada');
    }
    
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { 
              role: 'system', 
              content: instructions 
            },
            { 
              role: 'user', 
              content: text 
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      // Extraer la respuesta JSON
      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía de DeepSeek');
      }

      // Parsear el JSON de la respuesta
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró un objeto JSON en la respuesta');
        }
      } catch (parseError) {
        console.error('Error al parsear respuesta JSON:', content);
        throw new Error('Error al parsear la respuesta de la IA');
      }
    } catch (error) {
      console.error('Error en llamada a DeepSeek:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = AIService; 