import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Badge,
  Fab,
  Tooltip,
  Divider,
  Stack,
  useTheme,
  alpha,
  IconButton,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Security,
  Warning,
  TrendingUp,
  Shield,
  Search,
  Clear,
  FilterList,
  Refresh,
  GetApp,
  Visibility,
  CheckCircle,
  DarkMode,
  LightMode,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import apiClient from '../services/api';

// Dynamic theme creator function
const createCustomTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#3b82f6',
      dark: '#1e40af',
      light: '#60a5fa',
    },
    secondary: {
      main: '#8b5cf6',
      dark: '#7c3aed',
      light: '#a78bfa',
    },
    background: {
      default: darkMode ? '#0f172a' : '#f8fafc',
      paper: darkMode ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#f1f5f9' : '#0f172a',
      secondary: darkMode ? '#94a3b8' : '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createCustomTheme(darkMode);
  
  const [indicators, setIndicators] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRowForDetails, setSelectedRowForDetails] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const handleRowClick = (rowId) => {
    if (selectedRowForDetails === rowId) {
      setSelectedRowForDetails(null); // Close if same row clicked
    } else {
      setSelectedRowForDetails(rowId); // Open details for this row
    }
  };

  const handleCloseDetails = () => {
    setSelectedRowForDetails(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'ip': 'primary',
      'url': 'secondary',
      'hash': 'success',
      'domain': 'warning',
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  const columns = [
    {
      field: 'info',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Click row for details">
          <IconButton size="small" color="primary">
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'value',
      headerName: 'Indicator',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTypeColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Unknown'}
          color={getSeverityColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
  ];

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getIndicators({
        limit: 25,
        offset: 0,
        q: searchQuery,
        source: selectedSource,
        category: selectedCategory,
        type: selectedType,
        severity: selectedSeverity
      });

      setIndicators(response.items || []);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setError('Failed to fetch threat indicators. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              🛡️ Threat Intelligence Dashboard
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {darkMode ? <DarkMode sx={{ mr: 1 }} /> : <LightMode sx={{ mr: 1 }} />}
                  {darkMode ? 'Dark' : 'Light'} Mode
                </Box>
              }
            />
          </Box>

          {/* Search Controls */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Search sx={{ mr: 1 }} />
              Search & Filter
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Indicators"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="IP, domain, hash, URL..."
                  sx={{ minWidth: '200px' }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={fetchIndicators}
                  disabled={loading}
                  sx={{ height: '56px' }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Visibility sx={{ mr: 1 }} />
                Threat Intelligence Results
                <Chip 
                  label={`${indicators.length} indicators`} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 600, position: 'relative' }}>
                <DataGrid
                  rows={indicators.map((indicator, index) => ({
                    id: indicator.id || `row-${index}`,
                    ...indicator,
                  }))}
                  getRowId={(row) => row.id}
                  columns={columns}
                  pageSize={rowsPerPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  disableSelectionOnClick
                  disableRowSelectionOnClick
                  loading={loading}
                  onRowClick={(params) => {
                    handleRowClick(params.id);
                  }}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      cursor: 'pointer',
                    },
                  }}
                />

                {/* Click Details Modal */}
                {selectedRowForDetails && (() => {
                  const indicator = indicators.find((ind, index) => 
                    (ind.id || `row-${index}`) === selectedRowForDetails
                  );
                  
                  if (!indicator) return null;
                  
                  return (
                    <>
                      <Box
                        onClick={handleCloseDetails}
                        sx={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          zIndex: 9998,
                          cursor: 'pointer',
                        }}
                      />
                      <Paper
                        sx={{
                          position: 'fixed',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          p: 3,
                          minWidth: 500,
                          maxWidth: 700,
                          zIndex: 9999,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: 2,
                          background: theme.palette.mode === 'dark' 
                            ? 'rgba(30, 30, 30, 0.98)' 
                            : 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Security sx={{ mr: 1 }} />
                            Threat Intelligence Details
                          </Typography>
                          <IconButton onClick={handleCloseDetails} size="small">
                            <Clear />
                          </IconButton>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                              Indicator Value:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'monospace', 
                                wordBreak: 'break-all',
                                color: 'primary.main',
                                fontWeight: 'bold'
                              }}>
                                {indicator.value}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Type:</Typography>
                            <Chip 
                              label={indicator.type?.toUpperCase() || 'Unknown'} 
                              color={getTypeColor(indicator.type)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Severity:</Typography>
                            <Chip 
                              label={indicator.severity || 'Unknown'} 
                              color={getSeverityColor(indicator.severity)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Category:</Typography>
                            <Typography variant="body2">{indicator.category || 'Unknown'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Source:</Typography>
                            <Typography variant="body2">{indicator.source || 'Unknown'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">First Seen:</Typography>
                            <Typography variant="body2">
                              {indicator.first_seen ? new Intl.DateTimeFormat('en-US', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              }).format(new Date(indicator.first_seen)) : 'Unknown'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Last Seen:</Typography>
                            <Typography variant="body2">
                              {indicator.last_seen ? new Intl.DateTimeFormat('en-US', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              }).format(new Date(indicator.last_seen)) : 'Unknown'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </>
                  );
                })()}
              </Box>
            )}
          </Paper>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={fetchIndicators}
          >
            <Refresh />
          </Fab>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;