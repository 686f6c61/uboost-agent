import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from './LinearProgress';

// Componente para la lista de archivos locales (seleccionados)
const FileList = ({ 
  files, 
  selectedFiles, 
  onToggleSelect, 
  onRemove, 
  uploading, 
  processing, 
  uploadProgress 
}) => {
  if (!files || files.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Archivos seleccionados ({files.length})
      </Typography>
      
      <List dense>
        {files.map((file, index) => (
          <ListItem 
            key={index}
            sx={{
              bgcolor: selectedFiles.includes(index) ? 'action.selected' : 'transparent',
              borderRadius: 1
            }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedFiles.includes(index)}
                onChange={() => onToggleSelect(index)}
                disabled={uploading || processing}
              />
            </ListItemIcon>
            <ListItemIcon>
              <PictureAsPdfIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={file.name} 
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" component="div" color="text.secondary">
                    {file.isMetadataOnly 
                      ? 'Archivo previamente procesado' 
                      : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  </Typography>
                  
                  {uploading && uploadProgress[file.name] && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[file.name]?.pageProgress || 0} 
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {uploadProgress[file.name]?.pageProgress || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => onRemove(index)}
                disabled={uploading || processing}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileList; 