type CellType = 'X' | 'O' | '';

type PlayerInit = {
    p1Id: string | undefined,
    p2Id: string | undefined
};

type GameState = {
    running: boolean,
    board: CellType[],
    movesPlayed: number,
    playerTurn: CellType,
    playerIds: string[]
};

type GameStatus = {
    gameOver: boolean,
    winner: CellType
};

export type { CellType, PlayerInit, GameState, GameStatus };