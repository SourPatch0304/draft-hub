// src/StatsTablePage.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowParams } from '@mui/x-data-grid';
import rawData from './data/intern_project_data.json';
import type { Player, ScoutRanking } from './types/player';
import { getAverageRank } from './PlayerCard';
import PlayerProfile from './PlayerProfile';

// Define static columns
const STATIC_COLUMNS: GridColDef[] = [
  {
    field: 'avgRank',
    headerName: 'Avg. Scout Rank',
    flex: 1,
    minWidth: 100,
    type: 'number',
    renderCell: (params: GridRenderCellParams<number | null>) => {
      const value = params.value;
      if (value == null) return <Box sx={{ textAlign: 'center', width: '100%' }}>–</Box>;
      const min = 1, max = 50;
      const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
      const r = Math.round(255 * ratio), g = Math.round(255 * (1 - ratio));
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `rgb(${r},${g},0)`,
            color: '#fff',
            borderRadius: 0.5,
          }}
        >
          {value.toFixed(1)}
        </Box>
      );
    },
  },
  { field: 'firstName', headerName: 'First Name', flex: 1, minWidth: 100 },
  { field: 'lastName', headerName: 'Last Name', flex: 1, minWidth: 100 },
  { field: 'height', headerName: 'Height (in)', flex: 1, minWidth: 80, type: 'number' },
  { field: 'weight', headerName: 'Weight (lbs)', flex: 1, minWidth: 80, type: 'number' },
];

// Sidebar categories
const COLUMN_CATEGORIES = [
  { label: 'Bio', fields: ['firstName', 'lastName'] },
  { label: 'Measurements', fields: ['height', 'weight', 'avgRank'] },
  { label: 'Scout Rankings', fields: [] as string[] }, // will fill later
];

export default function StatsTablePage() {
  // Dialog state
  const [open, setOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // Open dialog on row click
  const handleRowClick = (params: GridRowParams) => {
    console.log('Row clicked:', params.id);
    setSelectedPlayerId(params.id as number);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlayerId(null);
  };

  // Build rows and scout fields
  const { rows, allScoutFields } = useMemo(() => {
    const map = new Map<number, Player>();
    rawData.bio.forEach(b => map.set(b.playerId, { playerId: b.playerId, bio: b, gameLogs: [] }));
    rawData.scoutRankings.forEach(sr => {
      const p = map.get(sr.playerId)!;
      p.scoutRanking = sr as ScoutRanking;
    });
    rawData.measurements.forEach(m => {
      const p = map.get(m.playerId)!;
      p.measurement = m;
    });
    rawData.game_logs.forEach(g => {
      map.get(g.playerId)!.gameLogs.push(g);
    });

    const scoutNames = new Set<string>();
    rawData.scoutRankings.forEach(sr => {
      Object.keys(sr).forEach(key => { if (key !== 'playerId') scoutNames.add(key); });
    });

    const built = Array.from(map.values()).map(p => {
      const base: Record<string, any> = {
        id: p.playerId,
        firstName: p.bio.firstName,
        lastName: p.bio.lastName,
        height: p.bio.height,
        weight: p.bio.weight,
        avgRank: Number(getAverageRank(p.scoutRanking)),
      };
      scoutNames.forEach(name => { base[name] = p.scoutRanking?.[name] ?? null; });
      return base;
    });

    return { rows: built.sort((a, b) => a.avgRank - b.avgRank), allScoutFields: Array.from(scoutNames) };
  }, []);

  // Build all columns
  const ALL_COLUMNS: GridColDef[] = useMemo(() => {
    const scoutCols = allScoutFields.map(name => ({
      field: name,
      headerName: name,
      flex: 1,
      minWidth: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams<number | null>) => {
        const value = params.value;
        if (value == null) return <Box sx={{ textAlign: 'center', width: '100%' }}>–</Box>;
        const min = 1, max = 50;
        const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
        const r = Math.round(255 * ratio), g = Math.round(255 * (1 - ratio));
        return (
          <Box sx={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `rgb(${r},${g},0)`, color: '#fff', borderRadius: 0.5
          }}>
            {value.toFixed(1)}
          </Box>
        );
      }
    }));
    COLUMN_CATEGORIES.find(c => c.label === 'Scout Rankings')!.fields = allScoutFields;
    return [...STATIC_COLUMNS, ...scoutCols];
  }, [allScoutFields]);

  // Visibility state
  const [visible, setVisible] = useState(() =>
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.field]: true }), {} as Record<string, boolean>)
  );
  const columns = ALL_COLUMNS.filter(col => visible[col.field]);
  const handleToggle = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisible(v => ({ ...v, [field]: e.target.checked }));
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', p: 2, boxSizing: 'border-box' }}>
      {/* Sidebar */}
      <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider', minWidth: 160, maxWidth: 200 }}>
        <Typography variant="subtitle1" gutterBottom>Toggle columns</Typography>
        <Divider sx={{ mb: 2 }} />
        {COLUMN_CATEGORIES.map(cat => (
          <Box key={cat.label} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>{cat.label}</Typography>
            <FormGroup>
              {cat.fields.map(field => (
                <FormControlLabel
                  key={field}
                  control={<Checkbox size="small" checked={visible[field]} onChange={handleToggle(field)} />}
                  label={ALL_COLUMNS.find(c => c.field === field)!.headerName}
                />
              ))}
            </FormGroup>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* DataGrid */}
      <Box sx={{ flexGrow: 1, p: 2, boxSizing: 'border-box' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          onRowClick={handleRowClick}
          initialState={{
            sorting: { sortModel: [{ field: 'avgRank', sort: 'asc' }] },
            pagination: { paginationModel: { pageSize: 50 } }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{ height: '100%' }}
        />
      </Box>

      {/* Player Profile Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth={false} PaperProps={{ sx: { width: '90vw', height: '90vh', maxWidth: 'none',backgroundColor: '#00538C'} }}>
        <Box sx={{ display: 'flex',justifyContent: 'space-between', alignItems: 'center', p: 1, }}>
          <Typography sx={{color:"white"}} variant="h6">Player Profile</Typography>
          <IconButton size="small" onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <DialogContent sx={{ p: 2 }}>
          {selectedPlayerId != null && <PlayerProfile playerId={selectedPlayerId} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
