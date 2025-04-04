import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
import WizardStepper from './components/Wizard/WizardStepper';
import ConfigurationStep from './components/Wizard/ConfigurationStep';
import UploadStep from './components/Wizard/UploadStep';
import ObjectiveStep from './components/Wizard/ObjectiveStep';
import AnalysisStep from './components/Wizard/AnalysisStep';
import ResultsStep from './components/Wizard/ResultsStep';
import HomePage from './components/HomePage';

function App() {
  const [wizardStarted, setWizardStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [currentTool, setCurrentTool] = useState('home');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Verificar si ya hay API keys configuradas
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('apiKeys');
    if (savedApiKeys) {
      try {
        const parsedApiKeys = JSON.parse(savedApiKeys);
        // Verificar si al menos una API key está configurada
        const hasApiKey = Object.values(parsedApiKeys).some(key => key.trim() !== '');
        setIsConfigured(hasApiKey);
      } catch (error) {
        console.error('Error al cargar API Keys:', error);
        setIsConfigured(false);
      }
    } else {
      setIsConfigured(false);
    }
  }, []);

  const handleStartWizard = () => {
    setWizardStarted(true);
    // Si ya está configurado, comenzar desde el paso 1 (Upload)
    setActiveStep(isConfigured && !showConfig ? 1 : 0);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const handleNavigate = (tool) => {
    if (tool === 'home') {
      setWizardStarted(false);
      setCurrentTool('home');
      setShowConfig(false);
    } else if (tool === 'config') {
      setCurrentTool('adecuacion');
      setWizardStarted(true);
      setActiveStep(0);
      setShowConfig(true);
    } else {
      setCurrentTool(tool);
      // Only start the wizard if the tool is adecuacion
      if (tool === 'adecuacion') {
        setWizardStarted(true);
        // Si ya está configurado, comenzar desde el paso 1 (Upload)
        setActiveStep(isConfigured && !showConfig ? 1 : 0);
      } else {
        setWizardStarted(false);
      }
    }
    window.scrollTo(0, 0);
  };

  const handleSelectTool = (tool) => {
    setCurrentTool(tool);
    // Only start the wizard if the tool is adecuacion
    if (tool === 'adecuacion') {
      setWizardStarted(true);
      // Si ya está configurado, comenzar desde el paso 1 (Upload)
      setActiveStep(isConfigured && !showConfig ? 1 : 0);
    }
  };

  const renderStep = () => {
    // Si no está configurado o se solicita explícitamente mostrar la configuración
    if (activeStep === 0 && (!isConfigured || showConfig)) {
      return <ConfigurationStep onNext={() => {
        setIsConfigured(true);
        setShowConfig(false);
        handleNext();
      }} />;
    }
    
    // Ajustar el paso según si la configuración se omitió
    const adjustedStep = isConfigured && !showConfig && activeStep === 0 ? 1 : activeStep;
    
    switch (adjustedStep) {
      case 0:
        return <ConfigurationStep onNext={handleNext} />;
      case 1:
        return <UploadStep onNext={handleNext} onBack={isConfigured && !showConfig ? null : handleBack} />;
      case 2:
        return <ObjectiveStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <AnalysisStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <ResultsStep onBack={handleBack} />;
      default:
        return <ConfigurationStep onNext={handleNext} />;
    }
  };

  const renderContent = () => {
    if (currentTool === 'adecuacion' && wizardStarted) {
      return (
        <Container maxWidth="lg">
          <WizardStepper 
            activeStep={activeStep} 
            skipFirstStep={isConfigured && !showConfig}
          />
          {renderStep()}
        </Container>
      );
    } else if (currentTool === 'resumen') {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <h2>Resumen de artículos</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </Box>
        </Container>
      );
    } else if (currentTool === 'generador') {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <h2>Generador de artículos de revisión</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </Box>
        </Container>
      );
    } else if (currentTool === 'inteligencia') {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <h2>Inteligencia sobre artículos</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </Box>
        </Container>
      );
    } else {
      return <HomePage onStartWizard={handleStartWizard} onSelectTool={handleSelectTool} />;
    }
  };

  return (
    <AppLayout onNavigate={handleNavigate} isConfigured={isConfigured}>
      {renderContent()}
    </AppLayout>
  );
}

export default App;
