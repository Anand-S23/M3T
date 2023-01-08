import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';

interface SocketServer extends HTTPServer {
    io?: SocketIOServer | undefined
}

interface SocketWithIO extends Socket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

type GameState = {
    running: boolean,
    board: number[],
    movesPlayed: number,
    playerTurn: number,
    playerIds: string[]
};

const game: GameState = {
    running: false,
    board: new Array(9).fill(0),
    movesPlayed: 0,
    playerTurn: 1,
    playerIds: []
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

                        // Emit game start to both players
                        socket.emit('game-start');
                        socket.broadcast.emit('game-start');
                    }
                }
            });

            socket.on('cell-clicked', (cellIndex: number) => {
                let currentPlayerIndex = game.playerTurn - 1;
                if (socket.id === game.playerIds[currentPlayerIndex]) {
                    // Update game board
                    console.log('Updating board...');
                    game.board[cellIndex] = game.playerTurn;

                    // Emit data to both players
                    // TODO: Might not have to send data to both players
                    socket.emit('move-made', game.board);
                    socket.broadcast.emit('move-made', game.board);

                    // Set turn to next player
                    game.playerTurn = (game.playerTurn === 1) ? 2 : 1;
                } else {
                    console.log(`Move by ${socket.id} failed, other player needs move first`);
                }
            });
        });
    }

    res.end();
};

export default SocketHandler;
