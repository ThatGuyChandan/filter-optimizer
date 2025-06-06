import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchData } from '../features/dataSlice';
import { setFilter, resetFilters } from '../features/filterSlice';
import DataTable from 'react-data-table-component';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import Papa from 'papaparse';

interface Dataset {
  label: string;
  value: string;
  type: 'custom';
}

interface FilterOption {
  label: string;
  value: any;
}

const PAGE_SIZE = 100;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, columns } = useSelector((state: RootState) => state.data);
  const filters = useSelector((state: RootState) => state.filters);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [page, setPage] = useState(1);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentDataset && currentDataset.value) {
      dispatch(fetchData(currentDataset.value)); 
      dispatch(resetFilters());
      setPage(1);
    }
  }, [currentDataset, dispatch]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      const s3Location = result.s3Location;

      if (s3Location) {
        const newDataset: Dataset = {
          label: file.name,
          value: s3Location,
          type: 'custom'
        };

        setCurrentDataset(newDataset);
        setOpenUpload(false);
      } else {
        setUploadError('Upload succeeded, but S3 location not received.');
      }

    } catch (error: any) {
      console.error('Upload Error:', error);
      setUploadError(error.message || 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; 
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    Object.entries(filters).forEach(([col, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((row: any) => values.includes(row[col]));
      }
    });
    return filtered;
  }, [data, filters]);

  const getFilterOptions = (col: string): FilterOption[] => {
    if (!data) return [];
    let filtered = data;
    Object.entries(filters).forEach(([otherCol, values]) => {
      if (otherCol !== col && values.length > 0) {
        filtered = filtered.filter((row: any) => values.includes(row[otherCol]));
      }
    });
    const uniqueValues = Array.from(new Set(filtered.map((row: any) => row[col])));
    return uniqueValues.map(value => ({
      label: String(value),
      value: value
    }));
  };

  const totalItems = filteredData.length;
  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tableColumns = useMemo(() => 
    columns.map((col) => ({
      name: col,
      selector: (row: any) => row[col],
      sortable: true,
    })), [columns]);

  const handleFilterChange = (column: string, newValue: FilterOption[]) => {
    dispatch(setFilter({ 
      column, 
      values: newValue.map(option => option.value)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>BI Dashboard - Filter Optimization</Typography>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Tooltip title="Upload Custom Dataset">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenUpload(true)}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Dataset'}
          </Button>
        </Tooltip>

        {currentDataset && data && data.length > 0 && (
          <Button 
            onClick={() => dispatch(resetFilters())} 
            variant="outlined"
            color="secondary"
          >
            Reset Filters
          </Button>
        )}
      </Box>

      <Dialog open={openUpload} onClose={() => !isUploading && setOpenUpload(false)}>
        <DialogTitle>Upload Custom Dataset</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="csv-upload">
              <Button variant="contained" component="span" disabled={isUploading}>
                Choose CSV File
              </Button>
            </label>
            {isUploading && <CircularProgress size={20} sx={{ ml: 2 }} />}
            {uploadError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {uploadError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)} disabled={isUploading}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {loading || isUploading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
      ) : currentDataset && data && data.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {columns.map((col) => (
              <Box key={col} sx={{ minWidth: 200 }}>
                <Autocomplete
                  multiple
                  options={getFilterOptions(col)}
                  getOptionLabel={(option) => String(option.label)}
                  value={getFilterOptions(col).filter(option => 
                    (filters[col] || []).includes(option.value)
                  )}
                  onChange={(_, newValue) => handleFilterChange(col, newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  disableCloseOnSelect
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                          borderRadius: '3px',
                          mr: 1,
                          mt: '2px',
                          backgroundColor: selected ? 'primary.main' : 'transparent',
                          border: '1px solid',
                          borderColor: selected ? 'primary.main' : 'divider',
                        }}
                      />
                      {option.label}
                    </li>
                  )}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ height: 500, mb: 2 }}>
            <DataTable
              columns={tableColumns}
              data={pagedData}
              pagination={false}
              highlightOnHover
              dense
              fixedHeader
              fixedHeaderScrollHeight="500px"
              noHeader
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            {totalItems > 0 && (
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                {startIndex} - {endIndex} / {totalItems}
              </Typography>
            )}
            <IconButton 
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton 
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalItems === 0}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Please upload a CSV file to begin
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 