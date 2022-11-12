import { IGameArgs } from "../game";

interface IGameLayoutProps {
    gameArgs: IGameArgs;
    children?: React.ReactNode;
    gameOver?: string;
    maxWidth?: string;
    avoidOverscrollReload?: boolean;
    optionsMenuItems?: () => IOptionsItems[];
    extraCardContent?: React.ReactNode;
  }

export const GameLayout = enhance(GameLayoutInternal);
