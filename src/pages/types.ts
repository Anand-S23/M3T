type CellType = 'X' | 'O' | '';

type PlayerSymbol = {
    1: CellType,
    2: CellType
};

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

export type { CellType, PlayerSymbol, PlayerInit, GameState };