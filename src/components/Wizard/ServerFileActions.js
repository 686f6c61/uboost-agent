import React from 'react';
import {
  Grid,
  Button,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import SelectAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteIcon from '@mui/icons-material/Delete';

const ServerFileActions = ({
  files,
  selectedServerFiles,
  onSelectAllServer,
  onDeselectAllServer,
  onDeleteSelectedServer,
  uploading,
  processing,
  loading
}) => {
  if (!files || files.length === 0) return null;
  
  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
      <Grid item>
        <ButtonGroup variant="outlined" size="small">
          <Tooltip title="Seleccionar todos los archivos del servidor">
            <span>
              <Button 
                onClick={onSelectAllServer}
                disabled={uploading || processing || loading}
                startIcon={<SelectAllIcon />}
              >
                Seleccionar todos
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Deseleccionar todos los archivos del servidor">
            <span>
              <Button 
                onClick={onDeselectAllServer}
                disabled={uploading || processing || loading || selectedServerFiles.length === 0}
                startIcon={<ClearAllIcon />}
              >
                Deseleccionar todos
              </Button>
            </span>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      
      <Grid item>
        <Tooltip title="Eliminar archivos seleccionados del servidor">
          <span>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDeleteSelectedServer}
              disabled={uploading || processing || loading || selectedServerFiles.length === 0}
            >
              Eliminar seleccionados
            </Button>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export default ServerFileActions; 