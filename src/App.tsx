import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Slider,
  Collapse
} from '@mui/material';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelGroupHandle
} from "react-resizable-panels";
import ServerInfo from './components/ServerInfo';
import ProductList from './components/ProductList';
import FileOperations from './components/FileOperations';
import LicensePreview from './components/LicensePreview';
import LicenseSearch from './components/LicenseSearch';
import { useLicenseStore } from './store/licenseStore';
import ServerAndGlobalAccordion from './components/ServerAndGlobalAccordion';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const App: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dragActive, setDragActive] = useState(false);
  const fileOpRef = useRef<HTMLDivElement>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const lastControlsSizeRef = useRef<number>(60);

  const {
    clearAll,
    themeMode,
    toggleThemeMode,
    appZoomFactor,
    setAppZoomFactor,
    previewFontSize,
  } = useLicenseStore();

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      const initialZoom = useLicenseStore.getState().appZoomFactor;
      window.electronAPI.setZoomFactor(initialZoom);
    }
  }, []);

  const handleZoom = (change: number) => {
    if (window.electronAPI) {
      const currentFactor = window.electronAPI.getZoomFactor();
      const newFactor = Math.max(0.5, Math.min(3, currentFactor + change));
      window.electronAPI.setZoomFactor(newFactor);
      setAppZoomFactor(newFactor);
    }
  };

  const handleResetZoom = () => {
    if (window.electronAPI) {
      window.electronAPI.setZoomFactor(1);
      setAppZoomFactor(1);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as Node;
    const container = e.currentTarget;
    if (!container.contains(relatedTarget)) {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInput = fileOpRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const dt = new DataTransfer();
        dt.items.add(e.dataTransfer.files[0]);
        fileInput.files = dt.files;
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  };
  
  const toggleControlsPanel = () => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const layout = panelGroup.getLayout();
    if (layout[0] > 5) {
      lastControlsSizeRef.current = layout[0];
      panelGroup.setLayout([0, 100]);
    } else {
      panelGroup.setLayout([lastControlsSizeRef.current, 100 - lastControlsSizeRef.current]); 
    }
  };
  
  const isControlsCurrentlyVisible = () => {
     const panelGroup = panelGroupRef.current;
     if (!panelGroup) return true;
     const layout = panelGroup.getLayout();
     return layout[0] > 5;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        bgcolor: dragActive ? 'rgba(25, 118, 210, 0.08)' : 'background.default',
        transition: 'background-color 0.2s ease',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AppBar position="static" sx={{ marginBottom: 1, bgcolor: '#155FA0', color: '#ffffff' }}>
        <Toolbar>
          <Tooltip title={isControlsCurrentlyVisible() ? "Hide Controls" : "Show Controls"} arrow>
            <IconButton 
              color="inherit" 
              onClick={toggleControlsPanel}
              sx={{ 
                mr: 1, 
                border: '1px solid #ffffff',
                borderRadius: '50%',
                padding: 1
              }}
            >
              {isControlsCurrentlyVisible() ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RLM License Generator
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isSearchVisible ? "Hide Search Panel" : "Show Search Panel"} arrow>
              <IconButton 
                color="inherit" 
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                <ManageSearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} arrow>
              <IconButton 
                color="inherit" 
                onClick={toggleThemeMode}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isPreviewVisible ? "Hide Preview" : "Show Preview"} arrow>
              <IconButton 
                color="inherit" 
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                {isPreviewVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Zoom Out" arrow>
              <IconButton 
                color="inherit" 
                onClick={() => handleZoom(-0.1)}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Zoom" arrow>
              <IconButton 
                color="inherit" 
                onClick={handleResetZoom}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                <ZoomOutMapIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In" arrow>
              <IconButton 
                color="inherit" 
                onClick={() => handleZoom(0.1)}
                sx={{ 
                  border: '1px solid #ffffff',
                  borderRadius: '50%',
                  mx: 0.5,
                  padding: 1
                }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 1 }}>
        <PanelGroup 
          ref={panelGroupRef}
          direction="horizontal" 
          style={{ display: 'flex', flex: 1, gap: '8px' }}
        >
          <Panel 
            defaultSize={60} 
            minSize={5}
            collapsible={true}
            order={1}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} 
      >
        <Box 
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', overflow: 'hidden'}}
        >
          <Collapse in={isSearchVisible} timeout="auto" unmountOnExit>
             <LicenseSearch /> 
          </Collapse>
          <Paper elevation={1} sx={{ p: 1.5, borderRadius: 1 }}>
                <ServerAndGlobalAccordion />
          </Paper>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ overflow: 'auto', flex: 1, pr: 1 }}>
              <ProductList />
            </Box>
          </Paper>
          <Paper elevation={1} sx={{ p: 1, borderRadius: 1 }} ref={fileOpRef}>
                <FileOperations />
          </Paper>
        </Box>
          </Panel>

          {isControlsCurrentlyVisible() && isPreviewVisible && (
             <PanelResizeHandle /> 
           )}

          {isPreviewVisible && (
            <Panel 
              defaultSize={40} 
              minSize={20} 
              order={2}
              style={{ display: 'flex', height: '100%' }} 
            >
              <Paper 
                elevation={1} 
                sx={{ 
                  width: '100%',
                  p: 1.5,
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <LicensePreview />
              </Paper>
            </Panel>
          )}
        </PanelGroup>
      </Box>
      
      {dragActive && (
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
            pointerEvents: 'none',
            zIndex: 1200,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'primary.main',
              bgcolor: 'background.paper',
              padding: 3,
              borderRadius: 1,
              boxShadow: 3,
              opacity: 0.9,
            }}
          >
            Drop License File Here
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default App;