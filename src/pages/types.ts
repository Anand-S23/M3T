type CellType = 'X' | 'O' | '';

type PlayerInit = {
    p1Id: string | undefined,
    p2Id: string | undefined
};

type GameState = {
    running: boolean,
    board: number[],
    movesPlayed: number,
    playerTurn: number,
    playerIds: string[]
};

export type { CellType, PlayerInit, GameState };