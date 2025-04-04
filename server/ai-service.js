const axios = require('axios');
// Importar la nueva librería
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Servicio para conectarse a diferentes APIs de IA
class AIService {
  // Analizar un PDF con el modelo especificado
  static async analyzePDF(pdfText, model /*, apiKeys*/) {
    // Verificar que tenemos texto
    if (!pdfText || pdfText.trim() === '') {
      throw new Error('No se proporcionó texto para analizar');
    }

    // Verificar que tenemos un modelo válido
    if (!model) {
      throw new Error('No se proporcionó modelo');
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

    // *** Opciones avanzadas - recuperar del localStorage o usar defaults ***
    // En un entorno de servidor real, estas opciones vendrían en la request, no de localStorage.
    // Por simplicidad aquí, asumimos que se pueden pasar o usar defaults.
    // const advancedOptions = { temperature: 0.5, maxOutputTokens: 500, topP: 0.9, topK: 40 }; // Ejemplo

    try {
      // Seleccionar la API correcta según el modelo
      if (model === 'gpt4o' || model === 'gpt4o-mini') {
        const apiKey = process.env.OPENAI_API_KEY;
        return await this.callOpenAI(limitedText, instructions, model, apiKey);
      } else if (model === 'sonnet') {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        return await this.callAnthropic(limitedText, instructions, apiKey);
      } else if (model === 'deepseek') {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        return await this.callDeepSeek(limitedText, instructions, apiKey);
      } else if (model === 'gemini-2.5-pro' || model === 'gemini-2.0-flash') {
        const apiKey = process.env.GOOGLE_API_KEY;
        return await this.callGoogleAI(limitedText, instructions, model, apiKey);
      } else {
        throw new Error(`Modelo no soportado: ${model}`);
      }
    } catch (error) {
      console.error(`Error al analizar PDF con ${model}:`, error);
      throw error;
    }
  }

  // Llamar a la API de OpenAI
  static async callOpenAI(text, instructions, model, apiKey /*, advancedOptions = {} */) {
    if (!apiKey) {
      throw new Error('API key de OpenAI no configurada en el servidor (.env)');
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
  static async callAnthropic(text, instructions, apiKey /*, advancedOptions = {} */) {
    if (!apiKey) {
      throw new Error('API key de Anthropic no configurada en el servidor (.env)');
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
  static async callDeepSeek(text, instructions, apiKey /*, advancedOptions = {} */) {
    if (!apiKey) {
      throw new Error('API key de DeepSeek no configurada en el servidor (.env)');
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

  // *** Nueva función para llamar a la API de Google Gemini ***
  static async callGoogleAI(text, instructions, model, apiKey /*, advancedOptions = {} */) {
    if (!apiKey) {
      throw new Error('API key de Google AI no configurada en el servidor (.env)');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ 
      model: model, // Usa el ID del modelo pasado (e.g., "gemini-1.5-pro-latest")
      // Configuración de seguridad (ejemplo, ajustar según necesidad)
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      // Configuración de generación (usar las opciones avanzadas si se proporcionan)
      generationConfig: {
        // Asegurarse de que los valores son del tipo correcto
        temperature: advancedOptions.temperature !== undefined ? Number(advancedOptions.temperature) : 0.5, 
        topP: advancedOptions.topP !== undefined ? Number(advancedOptions.topP) : undefined, // topP y topK son alternativos
        topK: advancedOptions.topK !== undefined ? Number(advancedOptions.topK) : undefined,
        maxOutputTokens: advancedOptions.maxTokens !== undefined ? Number(advancedOptions.maxTokens) : 500,
        // Gemini espera la respuesta en formato JSON
        responseMimeType: "application/json",
      },
    });

    // Crear el prompt combinado
    const prompt = `${instructions}\n\nTexto del PDF:\n${text}`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const contentText = response.text();

      if (!contentText) {
        throw new Error('Respuesta vacía de Google AI');
      }

      // El modelo está configurado para devolver JSON directamente
      try {
        return JSON.parse(contentText);
      } catch (parseError) {
        console.error('Error al parsear respuesta JSON de Google AI:', contentText);
        // Intentar extraer JSON si está envuelto en markdown
        const jsonMatch = contentText.match(/```json\n(\{[\s\S]*\})\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
             console.error('Error al parsear JSON extraído de Google AI:', jsonMatch[1]);
          }
        }
        throw new Error('Error al parsear la respuesta de la IA (formato JSON esperado)');
      }
    } catch (error) {
      console.error('Error en llamada a Google AI:', error);
      throw error;
    }
  }
}

module.exports = AIService; 