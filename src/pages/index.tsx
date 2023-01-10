import { type NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from 'socket.io-client';
import {DefaultEventsMap} from "@socket.io/component-emitter";
import { CellType, PlayerInit } from "./types";

// Gobal Variable Declaration // 
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

interface BoardProps {
    onClick(cellIndex: number): void;
    boardCells: CellType[];
};

const Board: React.FC<BoardProps> = (props) => {
    const cellStyle: string = `border-solid border-2 border-black 
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
}

// Main Page Layout //
const Home: NextPage = () => {
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [turn, setTurn] = useState(false);
    const [gameBoard, setGameBoard] = useState<CellType[]>(Array(9).fill(''));
    let playerSymbol: CellType = '';

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
                playerSymbol = 'X';
                setTurn(!turn);
            } else if (playerInit.p2Id === socket.id) {
                playerSymbol = 'O';
            }

            setGameStarted(!gameStarted);
            console.log('Game has been started...');
        });

        socket.on('move-made', (cellIndex: number) => {
            if (playerSymbol === 'X' || playerSymbol === 'O') {
                const updatedBoard = [...gameBoard];
                updatedBoard[cellIndex] =  (playerSymbol === 'X') ? 'X' : 'O';
                setGameBoard(updatedBoard);
                setTurn(!turn);
            }
        });
    };

    // Socket will be initalized when first loading the page
    useEffect(() => { socketInitializer(); }, []);

    const handleCellClick = (cellIndex: number) => {
        if (turn && gameBoard[cellIndex] === '') {
            socket.emit('cell-clicked', cellIndex);
            const updatedBoard = [...gameBoard];
            updatedBoard[cellIndex] =  (playerSymbol === 'X') ? 'O' : 'X';
            setGameBoard(updatedBoard);
            setTurn(!turn);
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
                    boardCells={gameBoard} 
                />
            </main>
        </>
    );
};

export default Home;
