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
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
    },
    background: {
      default: darkMode ? '#0f0f0f' : '#f8fafc',
      paper: darkMode ? '#1a1a1a' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#ffffff' : '#1f2937',
      secondary: darkMode ? '#a3a3a3' : '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      background: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 50%, #8b5cf6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.mode === 'dark' 
            ? 'rgba(26, 26, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
              : '0 20px 40px rgba(0, 0, 0, 0.15)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.mode === 'dark' 
            ? 'rgba(26, 26, 26, 0.9)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(15px)',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.severity-high': {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
          '&.severity-medium': {
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            color: '#d97706',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          },
          '&.severity-low': {
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: '#059669',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          },
        },
      },
    },
  },
});

function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createCustomTheme(darkMode);
  const [indicators, setIndicators] = useState([]);
  const [stats, setStats] = useState({
    total: 25385,
    recent_count: 25385,
    types: {
      available: ['domain', 'hash', 'ip', 'url'],
      breakdown: { domain: 1, hash: 688, ip: 4547, url: 20149 }
    },
    categories: {
      available: ['Banking Trojan', 'Malicious IP', 'Malicious URL', 'Malware Hash'],
      breakdown: { 'Banking Trojan': 3, 'Malicious IP': 4543, 'Malicious URL': 20149, 'Malware Hash': 687 }
    },
    sources: {
      available: ['Feodo Tracker', 'FireHOL', 'MalwareBazaar', 'URLhaus'],
      breakdown: { 'Feodo Tracker': 3, 'FireHOL': 4543, 'MalwareBazaar': 687, 'URLhaus': 20149 }
    },
    severities: {
      available: ['high'],
      breakdown: { high: 20839 }
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const fetchIndicators = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: options.limit || rowsPerPage,
        offset: ((options.page || 0) * rowsPerPage),
        q: options.search || searchQuery,
        source: options.source || selectedSource,
        category: options.category || selectedCategory,
        type: options.type || selectedType,
        severity: options.severity || selectedSeverity,
      };

      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });

      const response = await apiClient.getIndicators(params);
      console.log('API Response:', response);
      
      if (response && Array.isArray(response.items)) {
        // Map the response to match expected structure
        const mappedIndicators = response.items.map((item, index) => ({
          id: item.id || index,
          value: item.value,
          type: item.type,
          severity: item.metadata?.severity || 'unknown',
          category: item.metadata?.category || 'Unknown',
          source: item.metadata?.source || 'Unknown',
          last_seen: item.last_seen,
          first_seen: item.first_seen,
        }));
        setIndicators(mappedIndicators);
      } else {
        setIndicators([]);
      }
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setError('Failed to fetch threat indicators. Please try again.');
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    fetchIndicators({ page: 0 });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSource('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedSeverity('');
    setPage(0);
    fetchIndicators({ 
      page: 0, 
      search: '', 
      source: '', 
      category: '', 
      type: '', 
      severity: '' 
    });
  };

  const handleRowHover = (rowId) => {
    setHoveredRow(rowId);
  };

  const handleRowLeave = () => {
    setHoveredRow(null);
  };

  const toggleCardExpansion = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
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
        <Tooltip title="Hover row for details">
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
          className={`severity-${params.value?.toLowerCase() || 'unknown'}`}
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
    {
      field: 'last_seen',
      headerName: 'Last Seen',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString() : 'Unknown'}
        </Typography>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <Toolbar>
            <Shield sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Threat Intelligence Dashboard
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  icon={<LightMode />}
                  checkedIcon={<DarkMode />}
                />
              }
              label=""
              sx={{ mr: 2 }}
            />
            <Badge badgeContent={stats.total.toLocaleString()} color="primary" max={999999}>
              <Security />
            </Badge>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom>
              Cybersecurity Threat Intelligence
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Real-time monitoring and analysis of global security threats
            </Typography>
            <Chip
              icon={<CheckCircle />}
              label="SYSTEM ONLINE"
              color="success"
              sx={{ mt: 2, fontWeight: 'bold' }}
            />
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
            <Grid item xs={12} sm={6} md={3} lg={2.8}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => toggleCardExpansion('total')}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        TOTAL THREATS
                      </Typography>
                      <Typography variant="h4" component="div" color="primary.main">
                        {stats.total.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Security sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                      {expandedCards.has('total') ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Box>
                  <Collapse in={expandedCards.has('total')}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>Breakdown by Type:</Typography>
                      {Object.entries(stats.types.breakdown).map(([type, count]) => (
                        <Box key={type} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{type.toUpperCase()}:</Typography>
                          <Typography variant="body2" color="primary.main">{count.toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.8}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => toggleCardExpansion('recent')}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        RECENT (24H)
                      </Typography>
                      <Typography variant="h4" component="div" color="warning.main">
                        {stats.recent_count.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
                      {expandedCards.has('recent') ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Box>
                  <Collapse in={expandedCards.has('recent')}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>Recent Activity:</Typography>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">New indicators:</Typography>
                        <Typography variant="body2" color="warning.main">{stats.recent_count.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">Update rate:</Typography>
                        <Typography variant="body2" color="warning.main">Real-time</Typography>
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.8}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => toggleCardExpansion('types')}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        THREAT TYPES
                      </Typography>
                      <Typography variant="h4" component="div" color="secondary.main">
                        {stats.types.available.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Warning sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.8 }} />
                      {expandedCards.has('types') ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Box>
                  <Collapse in={expandedCards.has('types')}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>Available Types:</Typography>
                      {stats.types.available.map((type) => (
                        <Box key={type} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{type.toUpperCase()}:</Typography>
                          <Typography variant="body2" color="secondary.main">{stats.types.breakdown[type]?.toLocaleString() || 0}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.8}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => toggleCardExpansion('sources')}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        INTEL SOURCES
                      </Typography>
                      <Typography variant="h4" component="div" color="success.main">
                        {stats.sources.available.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Shield sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
                      {expandedCards.has('sources') ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Box>
                  <Collapse in={expandedCards.has('sources')}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>Active Sources:</Typography>
                      {stats.sources.available.map((source) => (
                        <Box key={source} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{source}:</Typography>
                          <Typography variant="body2" color="success.main">{stats.sources.breakdown[source]?.toLocaleString() || 0}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Control Panel */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterList sx={{ mr: 1 }} />
              Advanced Threat Filtering
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* Filters Row */}
            <Grid container spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
              <Grid item xs={12} sm={6} md={2.3}>
                <FormControl fullWidth size="small" sx={{ minWidth: '160px' }}>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={selectedSource}
                    label="Source"
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <MenuItem value="">All Sources</MenuItem>
                    {stats.sources.available.map((source) => (
                      <MenuItem key={source} value={source}>
                        {source} ({stats.sources.breakdown[source]?.toLocaleString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.3}>
                <FormControl fullWidth size="small" sx={{ minWidth: '160px' }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {stats.categories.available.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category} ({stats.categories.breakdown[category]?.toLocaleString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.3}>
                <FormControl fullWidth size="small" sx={{ minWidth: '160px' }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedType}
                    label="Type"
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {stats.types.available.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.toUpperCase()} ({stats.types.breakdown[type]?.toLocaleString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.3}>
                <FormControl fullWidth size="small" sx={{ minWidth: '160px' }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={selectedSeverity}
                    label="Severity"
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                  >
                    <MenuItem value="">All Severities</MenuItem>
                    {stats.severities.available.map((severity) => (
                      <MenuItem key={severity} value={severity}>
                        {severity.toUpperCase()} ({stats.severities.breakdown[severity]?.toLocaleString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={2.8}>
                <Stack direction="row" spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleSearch}
                    disabled={loading}
                    size="small"
                    sx={{ minWidth: '120px' }}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    disabled={loading}
                    size="small"
                    sx={{ minWidth: '100px' }}
                  >
                    Clear
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Search Row */}
            <Grid container spacing={2} alignItems="center" sx={{ justifyContent: 'space-between' }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search indicators (IP, domain, hash, URL...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  sx={{ minWidth: '300px' }}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => fetchIndicators()}
                  disabled={loading}
                  fullWidth
                  sx={{ height: '40px', minWidth: '140px' }}
                >
                  Refresh Data
                </Button>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {indicators.length} results
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Section */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
              <>
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
                    slotProps={{
                      row: {
                        onClick: (event) => {
                          const rowId = event.currentTarget.getAttribute('data-id');
                          if (rowId) {
                            console.log('Clicking row:', rowId);
                            if (hoveredRow === rowId) {
                              handleRowLeave(); // Close if already open
                            } else {
                              handleRowHover(rowId); // Open new one
                            }
                          }
                        },
                      },
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
                  
                  {/* Hover Tooltip */}
                  {hoveredRow && (() => {
                    const indicator = indicators.find((ind, index) => 
                      (ind.id || `row-${index}`) === hoveredRow
                    );
                    
                    if (!indicator) {
                      console.log('No indicator found for hoveredRow:', hoveredRow);
                      return null;
                    }
                    
                    console.log('Rendering hover tooltip for:', indicator.value?.substring(0, 30));
                    
                    return (
                      <>
                        <Box
                          onClick={handleRowLeave}
                          sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                            p: 4,
                            minWidth: 600,
                            maxWidth: 800,
                            zIndex: 9999,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderRadius: 3,
                            background: theme.palette.mode === 'dark' 
                              ? 'rgba(30, 30, 30, 0.98)' 
                              : 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" color="primary.main" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                              <Security sx={{ mr: 2, fontSize: 30 }} />
                              Threat Intelligence Details
                            </Typography>
                            <IconButton onClick={handleRowLeave} color="error" sx={{ '&:hover': { bgcolor: 'error.light' } }}>
                              <Clear />
                            </IconButton>
                          </Box>
                          
                          <Divider sx={{ mb: 3 }} />
                          
                          {/* Indicator Value Section */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                              <Security fontSize="small" sx={{ mr: 1 }} color="primary" />
                              Indicator Value
                            </Typography>
                            <Paper sx={{ 
                              p: 3, 
                              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', 
                              border: '1px solid', 
                              borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                              borderRadius: 2
                            }}>
                              <Typography variant="body1" sx={{ 
                                fontFamily: 'monospace', 
                                wordBreak: 'break-all',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                              }}>
                                {indicator.value}
                              </Typography>
                            </Paper>
                          </Box>
                          
                          {/* Details Grid */}
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Warning fontSize="small" sx={{ mr: 1 }} color="warning" />
                                  Type
                                </Typography>
                                <Chip 
                                  label={indicator.type?.toUpperCase() || 'Unknown'} 
                                  color={getTypeColor(indicator.type)}
                                  size="medium"
                                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Shield fontSize="small" sx={{ mr: 1 }} color="error" />
                                  Severity
                                </Typography>
                                <Chip 
                                  label={indicator.severity || 'Unknown'} 
                                  color={getSeverityColor(indicator.severity)}
                                  size="medium"
                                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <TrendingUp fontSize="small" sx={{ mr: 1 }} color="secondary" />
                                  Category
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', fontSize: '1rem' }}>
                                  {indicator.category || 'Unknown'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Visibility fontSize="small" sx={{ mr: 1 }} color="success" />
                                  Source
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', fontSize: '1rem' }}>
                                  {indicator.source || 'Unknown'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle fontSize="small" sx={{ mr: 1 }} color="info" />
                                  First Seen
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', fontSize: '1rem' }}>
                                  {indicator.first_seen ? new Intl.DateTimeFormat('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  }).format(new Date(indicator.first_seen)) : 'Unknown'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle fontSize="small" sx={{ mr: 1 }} color="info" />
                                  Last Seen
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', fontSize: '1rem' }}>
                                  {indicator.last_seen ? new Intl.DateTimeFormat('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  }).format(new Date(indicator.last_seen)) : 'Unknown'}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </>
                    );
                  })()}
                </Box>
                

              </>
            )}
          </Paper>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="export"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <GetApp />
        </Fab>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;