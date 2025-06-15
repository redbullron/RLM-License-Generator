import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid
} from '@mui/material';
import { useLicenseStore } from '../store/licenseStore';

const ServerInfo: React.FC = () => {
  const { serverInfo, setServerInfo } = useLicenseStore();

  const handleChange = (field: keyof typeof serverInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServerInfo({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        Server Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Hostname"
            value={serverInfo.hostname}
            onChange={handleChange('hostname')}
            placeholder="Enter server hostname"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="MAC Address"
            value={serverInfo.macAddress}
            onChange={handleChange('macAddress')}
            placeholder="Enter MAC address"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Customer ID"
            value={serverInfo.customerId}
            onChange={handleChange('customerId')}
            placeholder="Enter customer ID"
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Communication Port"
            value={serverInfo.communicationPort}
            onChange={handleChange('communicationPort')}
            placeholder="5053"
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="ISV Port"
            value={serverInfo.isvPort}
            onChange={handleChange('isvPort')}
            placeholder="50053"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerInfo;