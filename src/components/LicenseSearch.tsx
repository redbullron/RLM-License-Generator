import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useLicenseStore } from '../store/licenseStore';

const LicenseSearch: React.FC = () => {
  const { searchFolderPath, setSearchFolderPath } = useLicenseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openDirectoryDialog();
      if (path) {
        setSearchFolderPath(path);
        setError(null);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchFolderPath || !searchTerm.trim()) {
      setError('Please select a folder and enter a search term');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      if (window.electronAPI) {
        const results = await window.electronAPI.searchLicenses({
          folderPath: searchFolderPath,
          searchTerm: searchTerm.trim()
        });
        setSearchResults(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadFile = async (filePath: string) => {
    try {
      if (window.electronAPI) {
        const content = await window.electronAPI.readFile(filePath);
        // You would typically parse this content and load it into the store
        console.log('File content:', content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        License File Search
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FolderOpenIcon />}
          onClick={handleSelectFolder}
          sx={{ textTransform: 'none' }}
        >
          {searchFolderPath ? `...${searchFolderPath.slice(-20)}` : 'Select Folder'}
        </Button>
        
        <TextField
          size="small"
          placeholder="Search term (e.g., customer ID)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        
        <Button
          variant="contained"
          size="small"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={isSearching || !searchFolderPath || !searchTerm.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {searchResults.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Found {searchResults.length} file(s):
          </Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
            {searchResults.map((filePath, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleLoadFile(filePath)}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.5 }}
              >
                <ListItemText
                  primary={filePath.split(/[/\\]/).pop()}
                  secondary={filePath}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {searchResults.length === 0 && searchTerm && !isSearching && !error && (
        <Typography variant="body2" color="text.secondary">
          No files found containing "{searchTerm}"
        </Typography>
      )}
    </Box>
  );
};

export default LicenseSearch;