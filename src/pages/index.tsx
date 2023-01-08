import { type NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from 'socket.io-client';
import {DefaultEventsMap} from "@socket.io/component-emitter";

// Gobal socket declaration
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const renderBoard = (gameBoard: number[]) => {
    const stringBoard: string[] = new Array(9).fill('');
    for (let i = 0; i < stringBoard.length; ++i) {
        if (gameBoard[i] === 1) {
            stringBoard[i] = 'X';
        } else if (gameBoard[i] === 2) {
            stringBoard[i] = 'O';
        }
    }

    const handleCellClick = (cellIndex: number) => {
        socket.emit('cell-clicked', cellIndex);
    }

    return (
        <div className="grid grid-cols-3 mt-2">
            { stringBoard.map( (cellVal, index) => {
                return <div
                    className="border-solid border-2 border-black w-32 h-32
                        text-6xl text-center flex items-center justify-center
                        hover:cusor-pointer"
                    onClick={() => { handleCellClick(index); }}
                    key={index}>
                        {cellVal}
                </div>;
            })}
        </div>
    );
};

const PageHead: FC = () => {
    return (
        <Head>
            <title>3T</title>
            <meta name="description" content="Tic Tac Toe Game" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
};

const Home: NextPage = () => {
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    var gameBoard: number[] = new Array(9).fill(0);

    const socketInitializer = async () => {
        await fetch('/api/socket');
        socket = io();

        socket.on('connect', () => {
            console.log('connected')
        });

        socket.on('game-start', () => {
            setGameStarted(true);
            console.log('Game has been started...');
        });

        socket.on('move-made', (newGameBoard: number[]) => {
            gameBoard = newGameBoard;
        });
    };

    // Socket will be initalized when first loading the page
    useEffect(() => { socketInitializer(); }, []);

    // TODO: Figure if there is better way of doing this
    useEffect(() => { renderBoard(gameBoard); }, [gameBoard]);

    return (
        <>
            <PageHead />
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

                { renderBoard(gameBoard) }
            </main>
        </>
    );
};

export default Home;

