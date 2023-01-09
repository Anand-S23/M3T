import { type NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from 'socket.io-client';
import {DefaultEventsMap} from "@socket.io/component-emitter";
import { CellType, PlayerInit, PlayerSymbol } from "./types";

// Gobal Variable Declaration // 
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

let playerSymbol: PlayerSymbol = {
    1: 'X',
    2: 'O'
};

// Component Props //
interface SquareProps {
    onClick(): void;
    value: CellType;
    index: number;
};

interface BoardProps {
    onClick(cellIndex: number): void;
    boardCells: CellType[];
};

// Components //
const Square: React.FC<SquareProps> = (props) => {
    return (
        <div className="border-solid border-2 border-black 
            w-32 h-32 text-6xl text-center flex items-center 
            justify-center hover:cusor-pointer"
            onClick={ props.onClick }
            key={ props.index }>
                { props.value }
        </div>
    );
};

const Board: React.FC<BoardProps> = (props) => {
    return (
        <div className="grid grid-cols-3 mt-2">
            { props.boardCells.map( (cellVal, index) => {
                return <Square
                    value={props.boardCells[index] || ''}
                    onClick={() => props.onClick(index)} 
                    index={index}/>
            })}
        </div>
    );
}

// Main Page Layout //
const Home: NextPage = () => {
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [turn, setTurn] = useState(false);
    let playerId: number = -1;

    var gameBoard: CellType[] = new Array(9).fill('');

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
            if (playerInit.p1Id === socket.id) {
                playerId = 1;
                setTurn(true);
            } else if (playerInit.p2Id === socket.id) {
                playerId = 2;
            }

            setGameStarted(true);
            console.log('Game has been started...');
        });

        socket.on('move-made', (index: number) => {
            gameBoard[index] = playerId === 1 ? playerSymbol[2] : playerSymbol[1];
            setTurn(true);
        });
    };

    // Socket will be initalized when first loading the page
    useEffect(() => { socketInitializer(); }, []);

    const handleCellClick = (index: number) => {
        if (turn && gameBoard[index] === '') {
            socket.emit('cell-clicked', index);
            gameBoard[index] = playerId === 1 ? playerSymbol[1] : playerSymbol[2];
            setTurn(false);
        }
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

                { !isJoined && !gameStarted && <button
                    className="bg-blue-600 w-24 h-8 hover:bg-gray-500 text-white"
                    onClick={ () => {
                        setIsJoined(!isJoined);
                        socket.emit('join-game');
                    }}>
                        Join Game
                </button> }

                { isJoined && !gameStarted && <div>
                    Waiting for other player to join...
                </div>}

                { isJoined && gameStarted && turn && <div>
                    Your Turn
                </div>}

                { isJoined && gameStarted && !turn && <div>
                    Opponent's Turn
                </div>}

                <Board 
                    onClick={ i => handleCellClick(i) }
                    boardCells={gameBoard} />
            </main>
        </>
    );
};

export default Home;
