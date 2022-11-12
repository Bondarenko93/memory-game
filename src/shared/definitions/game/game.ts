import { GameMode } from "./mode";
import { IPlayerInRoom } from "./player";


export interface IGameArgs {
    gameCode: string;
    mode: GameMode;
    matchCode?: string;
    players?: IPlayerInRoom[];
  }