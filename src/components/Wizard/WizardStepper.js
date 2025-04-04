import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepConnector, 
  stepConnectorClasses,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Conector personalizado para el stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Icono personalizado para cada paso
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <SettingsIcon />,
    2: <CloudUploadIcon />,
    3: <AssignmentIcon />,
    4: <AnalyticsIcon />,
    5: <AssessmentIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const WizardStepper = ({ activeStep, skipFirstStep = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  let steps = [
    'Configuración',
    'Carga de artículos',
    'Objetivo',
    'Análisis',
    'Resultados'
  ];

  // Si skipFirstStep es true, eliminar el primer paso
  if (skipFirstStep) {
    steps = steps.slice(1);
  }

  // Ajustar el activeStep si se está omitiendo el primer paso
  const adjustedActiveStep = skipFirstStep ? activeStep - 1 : activeStep;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper 
        activeStep={adjustedActiveStep < 0 ? 0 : adjustedActiveStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        connector={<ColorlibConnector />}
      >
        {steps.map((label, index) => {
          // Ajustar el índice del icono si se omite el primer paso
          const iconIndex = skipFirstStep ? index + 2 : index + 1;
          
          return (
            <Step key={label}>
              <StepLabel StepIconComponent={(props) => 
                <ColorlibStepIcon {...props} icon={iconIndex} />
              }>
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default WizardStepper;
