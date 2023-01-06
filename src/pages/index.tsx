import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

const PageHead = () => {
    return (
        <Head>
            <title>3T</title>
            <meta name="description" content="Tic Tac Toe Game" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
};

const Home: NextPage = () => {
    const [canJoin, setCanJoin] = useState(true);
    const gameBoard: number[] = new Array(9).fill(0);

    const handleCellClick = (cellIndex: number) => {
        // TODO: Handle Event
    }

    const renderBoard = () => {
        const stringBoard: string[] = new Array(9).fill('');
        for (let i = 0; i < stringBoard.length; ++i) {
            if (gameBoard[i] === 1) {
                stringBoard[i] = 'X';
            } else if (gameBoard[i] === 2) {
                stringBoard[i] = 'O';
            }
        }

        return (
            <div className="grid grid-cols-3 mt-2">
                { stringBoard.map( (cellVal, index) => {
                    return <div 
                        className="border-solid border-2 border-black w-32 h-32 text-6xl text-center flex items-center justify-center" 
                        key={index}>
                        {cellVal}
                    </div>;
                })}
            </div>
        );
    };

    return (
        <>
            <PageHead />
            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="text-3xl py-2">Tic Tac Toe</h1>
                { canJoin && <button 
                    className="bg-blue-600 w-24 h-8 hover:bg-gray-500 text-white" 
                    onClick={ () => setCanJoin(!canJoin) }> 
                    Join 
                </button> }

                { renderBoard() }
            </main>
        </>
    );
};

export default Home;

