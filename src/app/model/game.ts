import {Player} from './Player';

export interface Game {
  id: number;
  name: string;
  active: boolean;
  players: Array<Player>;
}
