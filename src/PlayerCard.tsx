// src/components/PlayerCard.tsx
import React from 'react';
import { Card, CardMedia, CardContent, Typography, useTheme, Box } from '@mui/material';
import type { Player, ScoutRanking } from './types/player';

interface Props {
  player: Player;
}

export const getAverageRank = (sr?: ScoutRanking): string => {
  if (!sr) return '??';
  const vals = Object.entries(sr)
    .filter(([k, v]) => k !== 'playerId' && typeof v === 'number')
    .map(([_, v]) => v as number)
    .filter((n) => !isNaN(n));
  if (!vals.length) return '??';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

// Increase overall card height and image height
const CARD_WIDTH = 240;
const CARD_HEIGHT = 380;
const IMAGE_HEIGHT = 300;

const PlayerCard: React.FC<Props> = ({ player }) => {
  const theme = useTheme();
  const avgRank = getAverageRank(player.scoutRanking);

  return (
    <Card
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 2,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardMedia
        component="img"
        height={IMAGE_HEIGHT}
        image={player.bio.photoUrl ?? '/placeholder.png'}
        alt={player.bio.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            noWrap
            title={player.bio.name}
          >
            {player.bio.name}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          title={`Avg. Scout Rank: ${avgRank}`}
        >
          Avg. Scout Rank: {avgRank}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
