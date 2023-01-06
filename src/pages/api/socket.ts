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
    console.log(req);
    console.log(res);
    if (res.socket.server.io) {
        console.log('Socket already exists');
    } else {
        console.log('Socket initalizing...');

        // Socket Initalization
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        io.on('connect', socket => {
            console.log('A user has connected: ' + socket.id);
            console.log(socket);
            console.log(game);

            socket.on('join-game', () => {
                if (!game.running) {
                    const newLength = game.playerIds.push(socket.id);
                    if (newLength == 2) {
                        game.running = true;
                    }
                }
            });
        });
    }

    res.end();
};

export default SocketHandler;
