import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';
import { GameState, PlayerInit } from '../types';

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
    board: new Array(9).fill(0),
    movesPlayed: 0,
    playerTurn: 1,
    playerIds: []
};

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
                console.log('Updating board...');

                const correctTurn: boolean = (game.playerTurn === 1 && socket.id === game.playerIds[0] || 
                    game.playerTurn === 2 && socket.id === game.playerIds[1]);

                if (game.board[cellIndex] === 0 && correctTurn) {
                    // Update the bord if the move is valid
                    game.board[cellIndex] = game.playerTurn;
                    game.movesPlayed++;

                    // Emit move made to clients so they can update
                    socket.emit('move-made', cellIndex);
                    socket.broadcast.emit('move-made', cellIndex);

                    // TODO: Check for winner or draw

                    // Set turn to next player
                    game.playerTurn = (game.playerTurn === 1) ? 2 : 1;
                }
            });
        });
    }

    res.end();
};

export default SocketHandler;
