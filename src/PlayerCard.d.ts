import React from 'react';
import type { Player, ScoutRanking } from './types/player';
interface Props {
    player: Player;
}
export declare const getAverageRank: (sr?: ScoutRanking) => string;
declare const PlayerCard: React.FC<Props>;
export default PlayerCard;
