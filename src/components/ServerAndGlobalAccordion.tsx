import React from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useLicenseStore } from '../store/licenseStore';

const ServerAndGlobalAccordion: React.FC = () => {
  const { 
    serverInfo, 
    setServerInfo, 
    globalInfo, 
    setGlobalInfo, 
    vmToken, 
    setVMToken,
    applyGlobalValues 
  } = useLicenseStore();

  const handleServerChange = (field: keyof typeof serverInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServerInfo({ [field]: event.target.value });
  };

  const handleGlobalChange = (field: keyof typeof globalInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGlobalInfo({ [field]: event.target.value });
  };

  return (
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Server Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Hostname"
                value={serverInfo.hostname}
                onChange={handleServerChange('hostname')}
                placeholder="Enter server hostname"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="MAC Address"
                value={serverInfo.macAddress}
                onChange={handleServerChange('macAddress')}
                placeholder="Enter MAC address"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Customer ID"
                value={serverInfo.customerId}
                onChange={handleServerChange('customerId')}
                placeholder="Enter customer ID"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Communication Port"
                value={serverInfo.communicationPort}
                onChange={handleServerChange('communicationPort')}
                placeholder="5053"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="ISV Port"
                value={serverInfo.isvPort}
                onChange={handleServerChange('isvPort')}
                placeholder="50053"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Global Values
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Issue Date"
                value={globalInfo.issueDate}
                onChange={(date) => setGlobalInfo({ issueDate: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={globalInfo.startDate}
                onChange={(date) => setGlobalInfo({ startDate: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={globalInfo.endDate}
                onChange={(date) => setGlobalInfo({ endDate: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Year.Month (e.g., 2024.12)"
                value={globalInfo.yearMonth}
                onChange={handleGlobalChange('yearMonth')}
                placeholder="YYYY.MM"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Opportunity ID"
                value={globalInfo.opportunityId}
                onChange={handleGlobalChange('opportunityId')}
                placeholder="Enter opportunity ID"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={applyGlobalValues}
                sx={{ textTransform: 'none' }}
              >
                Apply Global Values to All Products
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            VM Token (Optional)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={vmToken.enabled}
                    onChange={(e) => setVMToken({ enabled: e.target.checked })}
                  />
                }
                label="Enable VM Token"
              />
            </Grid>
            
            {vmToken.enabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="VM Token Start Date"
                    value={vmToken.startDate}
                    onChange={(date) => setVMToken({ startDate: date })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="VM Token End Date"
                    value={vmToken.endDate}
                    onChange={(date) => setVMToken({ endDate: date })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={vmToken.isPermanent}
                        onChange={(e) => setVMToken({ isPermanent: e.target.checked })}
                      />
                    }
                    label="Permanent VM Token"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ServerAndGlobalAccordion;