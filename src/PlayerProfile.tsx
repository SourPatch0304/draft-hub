import { useState } from 'react';
import rawData from './data/intern_project_data.json';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { Bio, Measurement, ScoutRanking, GameLog, Player } from './types/player';
import PlayerCard from './PlayerCard';

interface PlayerProfileProps {
  playerId: number;
}

// Define a Report type for scouting entries
interface Report {
  name: string;
  timestamp: string;
  pros: string;
  cons: string;
  specialNotes: string;
}

export default function PlayerProfile({ playerId }: PlayerProfileProps) {
  // State for scouting reports (in-memory only)
  const [scoutReports, setScoutReports] = useState<Report[]>([]);
  // State for new report fields and dialog
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportPros, setReportPros] = useState('');
  const [reportCons, setReportCons] = useState('');
  const [reportSpecialNotes, setReportSpecialNotes] = useState('');

  const handleOpenDialog = () => setOpenReportDialog(true);
  // Only close dialog, do not clear inputs (preserves unsaved content)
  const handleCloseDialog = () => setOpenReportDialog(false);
  
  const handleSaveReport = () => {
    if (reportName.trim()) {
      const newEntry: Report = {
        name: reportName.trim(),
        timestamp: new Date().toLocaleString(),
        pros: reportPros.trim(),
        cons: reportCons.trim(),
        specialNotes: reportSpecialNotes.trim(),
      };
      setScoutReports(prev => [...prev, newEntry]);
      // Clear inputs after save
      setReportName('');
      setReportPros('');
      setReportCons('');
      setReportSpecialNotes('');
      setOpenReportDialog(false);
    }
  };

  // Fetch player bio
  const bio = rawData.bio.find((b: Bio) => b.playerId === playerId);
  if (!bio) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography>Player not found.</Typography>
      </Box>
    );
  }

  // Fetch measurement and logs
  const measurement = rawData.measurements.find((m: Measurement) => m.playerId === playerId);
  const scoutRankingRaw = rawData.scoutRankings.find((s: any) => s.playerId === playerId);
  // Sanitize nulls to undefined for compatibility with ScoutRanking type
  const scoutRanking: ScoutRanking | undefined = scoutRankingRaw
    ? {
        ...scoutRankingRaw,
        ["ESPN Rank"]: scoutRankingRaw["ESPN Rank"] ?? undefined,
        ["Sam Vecenie Rank"]: scoutRankingRaw["Sam Vecenie Rank"] ?? undefined,
        ["Kevin O'Connor Rank"]: scoutRankingRaw["Kevin O'Connor Rank"] ?? undefined,
        ["Kyle Boone Rank"]: scoutRankingRaw["Kyle Boone Rank"] ?? undefined,
        ["Gary Parrish Rank"]: scoutRankingRaw["Gary Parrish Rank"] ?? undefined,
      }
    : undefined;
  const gameLogs: GameLog[] = rawData.game_logs.filter(g => g.playerId === playerId);

  // Unified player
  const player: Player = { playerId: bio.playerId, bio, measurement, scoutRanking: scoutRanking || undefined, gameLogs };
  //const avgRank = player.scoutRanking ? getAverageRank(player.scoutRanking) : null;

  // Compute aggregates
  const totals = {
    pts: gameLogs.reduce((sum, g) => sum + g.pts, 0),
    reb: gameLogs.reduce((sum, g) => sum + g.reb, 0),
    ast: gameLogs.reduce((sum, g) => sum + g.ast, 0),
    stl: gameLogs.reduce((sum, g) => sum + (g.stl || 0), 0),
    blk: gameLogs.reduce((sum, g) => sum + (g.blk || 0), 0),
    tov: gameLogs.reduce((sum, g) => sum + (g.tov || 0), 0),
  };
  const count = gameLogs.length;
  const averages = Object.fromEntries(
    Object.entries(totals).map(([stat, total]) => [stat, count ? +(total / count).toFixed(1) : 0])
  ) as Record<keyof typeof totals, number>;

  // DataGrid rows and columns for stats
  const aggregateRows = Object.entries(totals).map(([stat, total]) => ({
    id: stat,
    stat: stat.toUpperCase(),
    total,
    average: averages[stat as keyof typeof averages],
  }));
  const aggregateColumns: GridColDef[] = [
    { field: 'stat', headerName: 'Stat', flex: 1, minWidth: 100, headerAlign: 'center' },
    { field: 'total', headerName: 'Total', type: 'number', flex: 1, minWidth: 80, align: 'right', headerAlign: 'right' },
    { field: 'average', headerName: 'Average', type: 'number', flex: 1, minWidth: 80, align: 'right', headerAlign: 'right' },
  ];

  // DataGrid rows and columns for measurements
  const measurementRows = measurement
    ? Object.entries(measurement)
        .filter(([key]) => !['playerId', 'noStepVertical', 'bodyFat', 'handWidth', 'shuttleLeft', 'shuttleRight'].includes(key))
        .map(([key, value]) => ({ id: key, measurement: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value: value as number }))
    : [];
  const measurementColumns: GridColDef[] = [
    { field: 'measurement', headerName: 'Measurement', flex: 1, minWidth: 120, headerAlign: 'center' },
    { field: 'value', headerName: 'Value', type: 'number', flex: 1, minWidth: 100, align: 'right', headerAlign: 'right' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1, backgroundColor: '#00538C', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Profile Card */}
        <Box sx={{ width: 280 }}>
          <Card elevation={3}>
            <CardContent>
              <PlayerCard player={player} />
            </CardContent>
          </Card>
        </Box>

        {/* Stats and Measurements */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Aggregated Stats */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardHeader sx={{ backgroundColor: '#00285E', color: '#fff' }} title="Aggregated Stats" />
              <CardContent>
                <DataGrid
                  rows={aggregateRows}
                  columns={aggregateColumns}
                  hideFooter
                  autoHeight
                  density="compact"
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Measurements */}
          {measurementRows.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <Card elevation={3}>
                <CardHeader sx={{ backgroundColor: '#00285E', color: '#fff' }} title="Measurements" />
                <CardContent>
                  <DataGrid
                    rows={measurementRows}
                    columns={measurementColumns}
                    hideFooter
                    autoHeight
                    density="compact"
                    sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                  />
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      {/* Scouting Reports Section */}
      <Box>
        <Card elevation={3}>
          <CardHeader
            sx={{ backgroundColor: '#00285E', color: '#fff' }}
            title="Scouting Reports"
            action={
              <Button variant="contained" size="small" onClick={handleOpenDialog}>
                Add Report
              </Button>
            }
          />
          <CardContent>
            {scoutReports.length === 0 ? (
              <Typography>No reports yet.</Typography>
            ) : (
              scoutReports.map((report, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {report.name} — {report.timestamp}
                  </Typography>
                  <Typography><strong>Pros:</strong> {report.pros}</Typography>
                  <Typography><strong>Cons:</strong> {report.cons}</Typography>
                  <Typography><strong>Special Notes:</strong> {report.specialNotes}</Typography>
                  {idx < scoutReports.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add Report Dialog */}
      <Dialog
        open={openReportDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Scouting Report</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Display existing reports in dialog */}
          {scoutReports.length > 0 && (
            <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
              <Typography variant="subtitle1">Existing Reports:</Typography>
              {scoutReports.map((report, idx) => (
                <Box key={idx} sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{report.name} — {report.timestamp}</Typography>
                  <Typography variant="body2"><strong>Pros:</strong> {report.pros}</Typography>
                  <Typography variant="body2"><strong>Cons:</strong> {report.cons}</Typography>
                  <Typography variant="body2"><strong>Notes:</strong> {report.specialNotes}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
            </Box>
          )}
          <TextField
            autoFocus
            label="Your Name"
            value={reportName}
            onChange={e => setReportName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Pros"
            value={reportPros}
            onChange={e => setReportPros(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Cons"
            value={reportCons}
            onChange={e => setReportCons(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Special Notes"
            value={reportSpecialNotes}
            onChange={e => setReportSpecialNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveReport} disabled={!reportName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
