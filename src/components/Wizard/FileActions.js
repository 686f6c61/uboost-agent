import React from 'react';
import {
  Grid,
  Button,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SaveIcon from '@mui/icons-material/Save';

const FileActions = ({
  files,
  selectedFiles,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
  onUploadToServer,
  uploading,
  processing,
  VisuallyHiddenInput,
  onFileChange
}) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploading || processing}
        >
          Seleccionar PDFs
          <VisuallyHiddenInput 
            type="file" 
            multiple 
            accept=".pdf" 
            onChange={onFileChange}
            disabled={uploading || processing}
          />
        </Button>
      </Grid>
      
      {files.length > 0 && (
        <>
          <Grid item>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Seleccionar todos">
                <span>
                  <Button 
                    onClick={onSelectAll}
                    disabled={uploading || processing}
                    startIcon={<SelectAllIcon />}
                  >
                    Seleccionar todos
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Deseleccionar todos">
                <span>
                  <Button 
                    onClick={onDeselectAll}
                    disabled={uploading || processing || selectedFiles.length === 0}
                    startIcon={<ClearAllIcon />}
                  >
                    Deseleccionar todos
                  </Button>
                </span>
              </Tooltip>
            </ButtonGroup>
          </Grid>
          
          <Grid item>
            <Tooltip title="Eliminar seleccionados">
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onRemoveSelected}
                  disabled={uploading || processing || selectedFiles.length === 0}
                >
                  Eliminar seleccionados
                </Button>
              </span>
            </Tooltip>
          </Grid>
          
          <Grid item>
            <Tooltip title="Subir al servidor">
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={onUploadToServer}
                  disabled={uploading || processing || files.length === 0}
                >
                  Guardar en el servidor
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default FileActions; 