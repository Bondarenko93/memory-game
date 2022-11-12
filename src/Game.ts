import { match } from "assert";
import { Game } from "boardgame.io";
import { CARD_CONTENT } from "./constants";
import { DEFAULT_FULL_CUSTOMIZATION, FullCustomizationState } from "./customization";
import { ICardInfo, IGameState, ECardState } from "./definations";
import { GameCustomizationState } from "./shared/definitions/game/customization";
import { shuffleArray } from "./utils";
export const MemoryGame: Game<IGameState> = {
    name: 'memorygame',
    setup: (ctx, customData: GameCustomizationState) => {
        const customizationState = (customData?.full as FullCustomizationState) || DEFAULT_FULL_CUSTOMIZATION;
        const stayInTurnOnMatch = customizationState.stayInTurnOnMatch;
        const gridSize = 5;
        const shuffeledContnet = shuffleArray(Object.keys(CARD_CONTENT)).slice(0, Math.floor((gridSize * gridSize) / 2));
        const doubledContent = shuffleArray([...shuffeledContnet, ...shuffeledContnet]);
        const cards: ICardInfo[] = [];
        for (let id = 0; id < doubledContent.length; id++) {
            cards.push({
                id: id >= shuffeledContnet.length && gridSize % 2 ? id + 1 : id,
                name: doubledContent[id],
                state: ECardState.HIDDEN
            })

        }
        return { cards, timeShownCards: false, gridSize, stayInTurnOnMatch };
    },
    moves: {
        cardClicked: (G: IGameState, ctx, cardId: number) => {
            const clickedCard = G.cards.filter((c) => c.id === cardId)[0];
            const cardPair = G.cards.filter((c) => c.name === clickedCard.name && c.id !== cardId)[0];
            const shownCards = G.cards.filter((c) => c.state === ECardState.SHOWN);
            const currentPlayer = ctx.currentPlayer;
            let changeTurn = false;
            G.timeShownCards = false; // disable timer by default

            if (clickedCard.state === ECardState.HIDDEN) {
                clickedCard.openedBy = currentPlayer;
                if (shownCards.length >= 1) {
                    if (cardPair.state === ECardState.SHOWN && cardPair.openedBy === currentPlayer) {
                        // mark the pair as open
                        cardPair.state = ECardState.OPEN;
                        clickedCard.state = ECardState.OPEN;
                        if (!G.stayInTurnOnMatch) {
                            changeTurn = true;
                        }
                    } else {
                        // mark current card as shown
                        clickedCard.state = ECardState.SHOWN;
                        G.timeShownCards = true;
                        if (G.stayInTurnOnMatch && shownCards.length % 2 == 0) {
                            changeTurn = true;
                        }
                    }
                } else {
                    clickedCard.state = ECardState.SHOWN;
                }
            }
            if (changeTurn) {
                ctx.events.endTurn();
            } else {
                ctx.events.endTurn({ next: currentPlayer });
            }
            return G;
        },
        hideShownCards: (G: IGameState, ctx:any) => {
            const shownCards = G.cards.filter((c) => c.state === ECardState.SHOWN);
            for (let i = 0; i < shownCards.length; i++) {
                shownCards[i].state = ECardState.HIDDEN;
                shownCards[i].openedBy = undefined;
            }
            G.timeShownCards = false;
            ctx.events.endTurn();
            return G;
        },
    },
    endIf: (G: IGameState, ctx:any) => {
        // check if game is over
        const unOpenedCards = G.cards.filter((c) => !c.openedBy);
        if (unOpenedCards.length === 0) {
            // game should end
            const scoreBoard = getScoreBoard(G, ctx);
            if (scoreBoard[0].score == scoreBoard[1].score) {
                return { draw: true };
            } else {
                return { winner: scoreBoard[0].playerID };
            }
        }
    },
}