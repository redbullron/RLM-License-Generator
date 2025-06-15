import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import { useLicenseStore } from '../store/licenseStore';

const LicensePreview: React.FC = () => {
  const { generateLicenseFile, previewFontSize } = useLicenseStore();

  const licenseContent = generateLicenseFile();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        License Preview
      </Typography>
      
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          bgcolor: 'background.default',
          fontFamily: 'monospace'
        }}
      >
        <Typography
          component="pre"
          sx={{
            fontSize: `${previewFontSize}rem`,
            lineHeight: 1.4,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {licenseContent || 'No license content to preview. Add server information and products to generate a license.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LicensePreview;