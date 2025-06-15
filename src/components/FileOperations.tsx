import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import { useLicenseStore } from '../store/licenseStore';
import { saveAs } from 'file-saver';

interface FileOperationsProps {}

const FileOperations: React.FC<FileOperationsProps> = () => {
  const { 
    generateLicenseFile, 
    clearAll, 
    arrangeProducts, 
    serverInfo,
    parseLicenseContent,
    destinationFolderPath,
    setDestinationFolderPath
  } = useLicenseStore();
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localDragActive, setLocalDragActive] = useState(false);

  const handleGenerateLicense = async () => {
    const licenseContent = generateLicenseFile();
    const customerId = serverInfo?.customerId;
    const filename = `${customerId || 'license'}.lic`;
    
    if (destinationFolderPath && window.electronAPI) {
      // Save to destination folder using Electron API
      try {
        const savedPath = await window.electronAPI.saveToDestination(destinationFolderPath, filename, licenseContent);
        setNotification({ message: `License saved to: ${savedPath}`, type: 'success' });
      } catch (error) {
        console.error('Error saving to destination:', error);
        setNotification({ message: 'Error saving to destination folder', type: 'error' });
      }
    } else {
      // Fallback to browser download
      const blob = new Blob([licenseContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
    }
  };

  const handleSelectDestinationFolder = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openDirectoryDialog();
      if (path) {
        setDestinationFolderPath(path);
        setNotification({ message: `Destination folder set: ${path}`, type: 'success' });
      }
    }
  };

  // Browser-based drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localDragActive) setLocalDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as Node;
    const container = e.currentTarget;
    if (!container?.contains(relatedTarget)) {
      setLocalDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = async () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    if (file.name.toLowerCase().endsWith('.exe')) {
      setNotification({ message: `EXE file "${file.name}" detected - this is not a license file`, type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Failed to read file content");
        parseLicenseContent(content);
        setNotification({ message: `License file "${file.name}" loaded successfully`, type: 'success' });
      } catch (error) {
        console.error('Error processing license file:', error);
        setNotification({ message: `Error: ${error instanceof Error ? error.message : 'Failed to process license file'}`, type: 'error' });
      }
    };
    reader.onerror = () => {
      setNotification({ message: 'Error reading file', type: 'error' });
    };
    reader.readAsText(file);
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{ 
        position: 'relative',
        border: localDragActive ? '2px dashed #2196f3' : 'none',
        borderRadius: 1,
        transition: 'all 0.2s ease-in-out',
        backgroundColor: localDragActive ? 'rgba(33, 150, 243, 0.08)' : 'transparent'
      }}
    >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        File Operations
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Destination Folder Selection - placed first in the row */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<FolderOpenIcon />}
          onClick={handleSelectDestinationFolder}
          sx={{ textTransform: 'none', flexShrink: 0 }}
        >
          {destinationFolderPath ? `...${destinationFolderPath.slice(-20)}` : 'Destination'}
        </Button>
        {destinationFolderPath && (
          <Tooltip title="Clear destination folder">
            <IconButton
              size="small"
              onClick={() => setDestinationFolderPath(null)}
              sx={{ flexShrink: 0, mr: 1 }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Button
          variant="contained"
          onClick={handleGenerateLicense}
          sx={{ 
            textTransform: 'uppercase',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#155FA0' : '#155FA0',
            color: '#ffffff',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'light' ? '#1A4F7D' : '#1A70BD',
            }
          }}
        >
          Generate License File
        </Button>
        
        <Button
          variant="contained"
          onClick={handleButtonClick}
          sx={{ 
            textTransform: 'uppercase',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#E54677' : '#E54677',
            color: '#ffffff',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'light' ? '#D13864' : '#D13864',
            }
          }}
        >
          Load License File
        </Button>
        
        <Button
          variant="contained"
          color="warning"
          onClick={arrangeProducts}
          sx={{ 
            textTransform: 'uppercase',
            color: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#000000'
          }}
        >
          Arrange Products
        </Button>
        
        <Button
          variant="contained"
          color="error"
          onClick={clearAll}
          sx={{ 
            textTransform: 'uppercase',
            color: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#000000'
          }}
        >
          Clear All
        </Button>
        
        {/* Hidden file input for file selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".lic,.txt,.exe"
          style={{ display: 'none' }}
        />
      </Box>
      

      
      {/* Drag-and-drop overlay only in browser mode */}
      {localDragActive && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            Drop License File Here
          </Typography>
        </Box>
      )}
      
      {/* Notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : <div />}
      </Snackbar>
    </Box>
  );
};

export default FileOperations;