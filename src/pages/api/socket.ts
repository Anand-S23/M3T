import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';
import type { CellType, GameState, GameStatus, PlayerInit } from '../../types';
import { Server as SocketIOServer } from 'socket.io';

interface SocketServer extends HTTPServer {
    io?: SocketIOServer | undefined
}

interface SocketWithIO extends Socket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

const game: GameState = {
    running: false,
    board: new Array(9).fill(''),
    movesPlayed: 0,
    playerTurn: 'X',
    playerIds: []
};

const checkWinner = (board: CellType[], movesMade: number): GameStatus => {
    const winConditions: [number, number, number][] = [
        // Horizontal
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        // Veritical
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        // Diagonal
        [0, 4, 8],
        [2, 4, 6]
    ];

    const gameStatus: GameStatus = {
        gameOver: (movesMade === 9),
        winner: ''
    };

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i] || [10, 10, 10];
        if ((board[a] === 'X' || board[a] === 'O') && 
            board[a] === board[b] && board[a] === board[c]) {
                gameStatus.winner = board[a] || '';
                gameStatus.gameOver = true;
                return gameStatus;
        }
    }

    return gameStatus;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    if (res.socket.server.io) {
        console.log('Socket already exists');
    } else {
        console.log('Socket initalizing...');

        // Socket Initalization
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        io.on('connect', socket => {
            console.log('A user has connected: ' + socket.id);
            socket.emit('game-status', game.running);

            socket.on('join-game', () => {
                // Can only join if game not started
                console.log('Attempting to join game...');
                if (!game.running) {
                    console.log(`${socket.id} successfully connected to game...`);
                    const newLength = game.playerIds.push(socket.id);
                    if (newLength == 2) {
                        // Set game to running when two players join
                        game.running = true;

                        // Log game start
                        console.log('Game started...');
                        console.log('Player 1 ID: ' + game.playerIds[0]);
                        console.log('Player 2 ID: ' + game.playerIds[1]);

                        // Emit game start to all connected sockets
                        const playerInit: PlayerInit = {
                            p1Id: game.playerIds[0],
                            p2Id: game.playerIds[1]
                        };
                        socket.emit('game-start', playerInit);
                        socket.broadcast.emit('game-start', playerInit);
                    }
                }
            });

            socket.on('cell-clicked', (cellIndex: number) => {
                // Update game board
                const correctTurn: boolean = (game.playerTurn === 'X' && socket.id === game.playerIds[0] || 
                    game.playerTurn === 'O' && socket.id === game.playerIds[1]);

                if (game.board[cellIndex] === '' && correctTurn) {
                    // Update the bord if the move is valid
                    game.board[cellIndex] = game.playerTurn;
                    game.movesPlayed++;
                    game.playerTurn = (game.playerTurn === 'X') ? 'O' : 'X';

                    // Emit move made to clients so they can update
                    socket.emit('move-made', game.board);
                    socket.broadcast.emit('move-made', game.board);

                    // Check for winner or draw
                    const status = checkWinner(game.board, game.movesPlayed);
                    console.log('Game Status: ', status);
                    if (status.gameOver) {
                        socket.emit('game-over', status);
                        socket.broadcast.emit('game-over', status);

                        // Reset game
                    }

                }
            });
        });
    }

    res.end();
};

export default SocketHandler;
