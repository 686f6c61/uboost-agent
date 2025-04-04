# Instrucciones de Instalación

Para asegurar que la aplicación funcione correctamente, instala las siguientes dependencias:

```bash
# Navega al directorio del proyecto
cd "check-articulos-react"

# Limpia la caché de npm (si hay problemas)
npm cache clean --force

# Instala todas las dependencias del package.json
npm install

# Instala dependencias específicas que pueden causar problemas
npm install source-map-loader --save-dev
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled --save

# Inicia la aplicación
npm start
```

## Solución de problemas

Si encuentras errores al iniciar la aplicación:

1. Asegúrate de estar en el directorio correcto (`check-articulos-react`)
2. Intenta usar un terminal bash en lugar de PowerShell si hay problemas con la consola
3. Si hay problemas con los loaders de webpack, asegúrate de que `source-map-loader` esté instalado

## Acceso a la aplicación

Una vez iniciada, la aplicación estará disponible en:
- Local: http://localhost:3000 