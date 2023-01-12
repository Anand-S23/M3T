import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from 'socket.io-client';
import type {DefaultEventsMap} from "@socket.io/component-emitter";
import type { CellType, PlayerInit, GameStatus } from "../types";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

interface StatusProps {
    onClick(): void;
    gameStarted: boolean;
    isJoined: boolean;
    isXTurn: boolean;
    playerIsX: boolean;
}

interface BoardProps {
    onClick(cellIndex: number): void;
    boardCells: CellType[];
}

const Status: React.FC<StatusProps> = (props) => {
    return (
        <div>
            { !props.gameStarted && !props.isJoined && <button 
                className="bg-blue-600 w-24 h-8 hover:bg-gray-500 text-white"
                onClick={() => props.onClick()}>
                    Join Game
            </button> }

            { !props.gameStarted && props.isJoined && <span>
                Waiting for opponent to join...
            </span>}

            { props.gameStarted && props.isJoined && 
              props.isXTurn && props.playerIsX && <span>
                Your Turn...
            </span>}

            { props.gameStarted && props.isJoined && 
              !props.isXTurn && !props.playerIsX && <span>
                Your Turn...
            </span>}

            { props.gameStarted && props.isJoined && 
              !props.isXTurn && props.playerIsX && <span>
                { "Opponent's Turn..." }
            </span>}

            { props.gameStarted && props.isJoined && 
              props.isXTurn && !props.playerIsX && <span>
                { "Opponent's Turn..." }
            </span>}
        </div>
    );
};

const Board: React.FC<BoardProps> = (props) => {
    const cellStyle = `border-solid border-2 border-black 
        w-32 h-32 text-6xl text-center flex items-center 
        justify-center hover:cusor-pointer`;

    return (
        <div className="grid grid-cols-3 mt-2">
            { props.boardCells.map( (cellVal: CellType, index: number) => {
                return (
                    <div className={ cellStyle }
                        onClick={() => props.onClick(index)}
                        key={ index }>
                            { cellVal }
                    </div>
                );
            })}
        </div>
    );
};

const Home: NextPage = () => {
    const [isJoined, setIsJoined] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [isXTurn, setIsXTurn] = useState<boolean>(true);
    const [gameBoard, setGameBoard] = useState<CellType[]>(Array(9).fill(''));
    let isPlayerX = false;

    const socketInitializer = async () => {
        await fetch('/api/socket');
        socket = io();

        socket.on('connect', () => {
            console.log('connected')
        });

        socket.on('game-status', (started: boolean) => {
            setGameStarted(started);
        });

        socket.on('game-start', (playerInit: PlayerInit) => {
            isPlayerX = (playerInit.p1Id === socket.id) ? true : false;
            setGameStarted(!gameStarted);
            console.log('Game has been started...');
        });

        socket.on('move-made', (updatedBoard: CellType[]) => {
            setGameBoard(updatedBoard);
            setIsXTurn(!isXTurn);
        });

        socket.on('game-over', (status: GameStatus) => {
            const msg = (status.winner === '') ? 'Tie Game' : ' won the game';
            alert(status.winner + msg);
        });
    };

    // Socket will be initalized when first loading the page
    useEffect(() => { socketInitializer() }, []);

    const handleJoinButtonClick = () => {
        setIsJoined(!isJoined);
        socket.emit('join-game');
    };

    const handleCellClick = (cellIndex: number) => {
        socket.emit('cell-clicked', cellIndex);
    };

    return (
        <>
            <Head>
                <title>M3T</title>
                <meta name="description" content="Tic Tac Toe Game" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main
                className="container mx-auto flex min-h-screen flex-col
                items-center justify-center p-4">

                <h1 className="text-3xl py-2">Tic Tac Toe</h1>

                <Status
                    onClick={ handleJoinButtonClick }
                    gameStarted={ gameStarted }
                    isJoined={ isJoined }
                    isXTurn={ isXTurn }
                    playerIsX={ isPlayerX }
                />

                <Board 
                    onClick={ i => handleCellClick(i) }
                    boardCells={ gameBoard } 
                />
            </main>
        </>
    );
};

export default Home;
