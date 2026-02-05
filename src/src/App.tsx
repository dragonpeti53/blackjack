import {useEffect, useReducer} from "react";
import { createDeck, type Card } from "./utils/deck";
import { handTotal } from "./utils/hand";
import { hiLoValue } from "./utils/count";
import Hand from "./components/Hand";
import Controls from "./components/Controls";
import BetPanel from "./components/BetPanel";

type GameState = {
    deck: Card[];
    playerHand: Card[];
    dealerHand: Card[];
    turn: "player" | "dealer";
    status: string | "playing" | "busted" | "dealerTurn" | "finished";
    result: null | "win" | "lose" | "push";
    balance: number;
    bet: number;
    runningCount: number;
};

type Action =
    | { type: "DEAL" }
    | { type: "HIT" }
    | { type: "STAND" }
    | { type: "SET_BET"; payload: number }
    | { type: "DEALER_HIT" }
    | { type: "DEALER_STAND" }
    | { type: "RESET" };


export default function App() {

    const initialState = {
        deck: createDeck(),
        playerHand: [],
        dealerHand: [],
        turn: "player",  // "player" | "dealer"
        status: "finished",  // "playing" | "finished"
        result: null,  // null | "win" | "lose" | "push"
        balance: 1000,
        bet: 10,
        runningCount: 0,
    };

    function revealDealerHole(hand: Card[]) {
        return hand.map(c => ({ ...c, hidden: false }));
    }

    function reducer(state: GameState, action: Action) {
        switch (action.type) {
            case "DEAL": {
                let deck;
                if (state.deck.length < 15) {
                    deck = createDeck();
                } else {
                    deck = state.deck;
                }
                const p1: Card = { ...deck[0] };
                const d1: Card = { ...deck[1], hidden: true };
                const p2: Card = { ...deck[2] };
                const d2: Card = { ...deck[3] };

                const playerHand = [p1, p2];
                const dealerHand = [d1, d2];

                deck = deck.slice(4);

                let runningCount = hiLoValue(p1) + hiLoValue(p2) + hiLoValue(d2);

                const bet = state.bet;
                let balance = state.balance - bet;

                const playerTotal = handTotal(playerHand);
                const dealerTotal = handTotal(dealerHand);

                if (playerTotal === 21 || dealerTotal === 21) {
                    let result = state.result;

                    runningCount = runningCount + hiLoValue(d1);
                    const visibleDealerHand = revealDealerHole(dealerHand);

                    if (playerTotal === 21 && dealerTotal !== 21) {
                        result = "win";
                        balance = balance + bet * 2.5;
                    } else if (dealerTotal === 21 && playerTotal !== 21) {
                        result = "lose";
                    } else {
                        result = "push";
                        balance = balance + bet;
                    }

                    return {
                        ...state,
                        deck,
                        playerHand,
                        dealerHand: visibleDealerHand,
                        status: "finished",
                        turn: "player",
                        result,
                        runningCount,
                        balance,
                    };
                }

                return {
                    ...state,
                    deck,
                    playerHand,
                    dealerHand,
                    status: "playing",
                    turn: "player",
                    runningCount,
                    balance,
                    result: null,
                };
            }

            case "HIT": {
                if (state.turn !== "player") return state;
                if (state.status !== "playing") return state;

                const card = state.deck[0];
                const newHand = [...state.playerHand, card];
                const newDeck = state.deck.slice(1);

                const total = handTotal(newHand);
                const newRunningCount = state.runningCount + hiLoValue(card);

                if (total > 21) {
                    let finalRunningCount = newRunningCount;
                    let revealedDealerHand = state.dealerHand;
                    const dealerHole = state.dealerHand[0];

                    if (dealerHole && (dealerHole as any).hidden) {
                        finalRunningCount += hiLoValue(dealerHole);
                        revealedDealerHand = revealDealerHole(state.dealerHand);
                    }

                    return {
                        ...state,
                        deck: newDeck,
                        playerHand: newHand,
                        dealerHand: revealedDealerHand,
                        runningCount: finalRunningCount,
                        status: "finished",
                        result: "lose",
                        turn: "player",
                    };
                }


                return {
                    ...state,
                    deck: newDeck,
                    playerHand: newHand,
                    runningCount: newRunningCount,
                }
            }

            case "STAND": {
                if (state.turn !== "player") return state;
                if (state.status !== "playing") return state;

                const dealerHole = state.dealerHand[0];
                let runningCount = state.runningCount;
                let revealedDealerHand = state.dealerHand;

                if (dealerHole && (dealerHole as any).hidden) {
                    runningCount += hiLoValue(dealerHole);
                    revealedDealerHand = revealDealerHole(state.dealerHand);
                }

                return {
                    ...state,
                    dealerHand: revealedDealerHand,
                    turn: "dealer",
                    status: "dealerTurn",
                    runningCount,
                };
            }

            case "DEALER_HIT": {
                let deck = state.deck;
                let dealerHand = state.dealerHand;
                const card = deck[0];
                dealerHand = [...dealerHand, card];
                deck = deck.slice(1);

                let runningCount = state.runningCount + hiLoValue(card);

                return {
                    ...state,
                    deck,
                    dealerHand,
                    runningCount,
                };
            }

            case "DEALER_STAND": {
                const playerTotal = handTotal(state.playerHand);
                const dealerTotal = handTotal(state.dealerHand);

                let result: "win" | "lose" | "push" = "push";

                let newBalance = state.balance;

                if (playerTotal > 21) {
                    result = "lose";
                } else if (dealerTotal > 21) {
                    result = "win";
                    newBalance = state.balance + state.bet * 2;
                } else if (playerTotal > dealerTotal) {
                    result = "win";
                    newBalance = state.balance + state.bet * 2;
                } else if (playerTotal < dealerTotal) {
                    result = "lose";
                } else {
                    result = "push";
                    newBalance = state.balance + state.bet;
                }

                return {
                    ...state,
                    status: "finished",
                    balance: newBalance,
                    result,
                    turn: "player",
                };
            }

/*
                const playerTotal = handTotal(state.playerHand);
                const dealerTotal = handTotal(dealerHand);

                let result = state.result;

                if (dealerTotal > 21) {
                    result = "win";
                }

                else if (playerTotal === dealerTotal) {
                    result = "push";
                }

                else if (playerTotal > dealerTotal) {
                    result = "win";
                }

                else if (playerTotal <  dealerTotal) {
                    result = "lose";
                }

                let status = state.status;

                if (result !== null) {
                    status = "finished";
                }

                return {
                    ...state,
                    deck,
                    dealerHand,
                    turn,
                    status,
                    runningCount,
                    result,
                }

            }
*/
            case "SET_BET": {
                const amount = action.payload;
                if (state.status !== "finished") return state;
                if (amount < 0) return state;
                if (amount > state.balance) return state;

                return {
                    ...state,
                    bet: amount,
                };
            }

            case "RESET": {
                return {
                    ...initialState,
                    balance: state.balance
                };
            }

            default:
                return state;

        }
    }

    const [gameState, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (
            gameState.turn === "dealer" &&
            gameState.status === "dealerTurn" &&
            gameState.result === null
        ) {
            const dealerPlay = () => {
                const playerTotal = handTotal(gameState.playerHand);
                if (playerTotal > 21) {
                    dispatch({ type: "DEALER_STAND" }); // ensure finalization if odd state
                    return;
                }

                const dealerTotal = handTotal(gameState.dealerHand);
                if (dealerTotal < 17 && gameState.deck.length > 0) {
                    dispatch({ type: "DEALER_HIT" });
                } else {
                    dispatch({ type: "DEALER_STAND" });
                }
            };

            const timeout = setTimeout(dealerPlay, 450);
            return () => clearTimeout(timeout);
        }
    }, [
        gameState.turn,
        gameState.status,
        gameState.dealerHand,
        gameState.deck,
        gameState.playerHand,
        gameState.result,
    ]);


    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>Blackjack</h1>
            <p hidden={true}>Running Count: {gameState.runningCount}</p>

            <BetPanel
                bankroll={gameState.balance}
                bet={gameState.bet}
                setBet={(amount: number) => dispatch({ type: "SET_BET", payload: amount })}
                onDeal={() => dispatch({ type: "DEAL" })}
                gameOver={gameState.status === "finished"}
            />

            <Hand hand={gameState.dealerHand} label="Dealer" />
            <Hand hand={gameState.playerHand} label="Player" />

            {gameState.status === "playing" && gameState.turn === "player" && (
                <Controls
                    onHit={() => dispatch({ type: "HIT" })}
                    onStand={() => dispatch({ type: "STAND" })}
                />
            )}

            {gameState.status === "finished" && gameState.result && (
                <h2>
                    {gameState.result === "win" && "You Win!"}
                    {gameState.result === "lose" && "You Lose!"}
                    {gameState.result === "push" && "Push!"}
                </h2>
            )}

            {gameState.status === "finished" && (
                <button onClick={() => dispatch({ type: "RESET" })}>
                    New Round
                </button>
            )}
        </div>
    );
}
