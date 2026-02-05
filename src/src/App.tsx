import { useState, useEffect } from "react";
import { createDeck, type CardType } from "./utils/deck";
import { handTotal } from "./utils/hand";
import { hiLoValue } from "./utils/count";
import Hand from "./components/Hand";
import Controls from "./components/Controls";
import BetPanel from "./components/BetPanel";

export default function App() {
    const [deck, setDeck] = useState<CardType[]>(createDeck(1));
    const [bankroll, setBankroll] = useState(1000);
    const [bet, setBet] = useState(10);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [runningCount, setRunningCount] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [canDouble, setCanDouble] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        console.log("Running count:", runningCount);
    }, [runningCount]);


    const dealInitial = () => {
        if (!gameOver) return;

        if (deck.length < 10) {
            setDeck(createDeck(1));
            setMessage("Created new deck!");
            return;
        }

        if (bet < 1 || bet > bankroll) {
            setMessage("Invalid bet!");
            return;
        }

        const newDeck = [...deck];
        const p1 = newDeck.pop()!;
        const d1 = newDeck.pop()!;
        const p2 = newDeck.pop()!;
        const d2 = newDeck.pop()!;

        setPlayerHand([p1, p2]);
        setDealerHand([{ ...d1, hidden: true }, d2]);
        setDeck(newDeck);

        const count = hiLoValue(p1.value) + hiLoValue(p2.value) + hiLoValue(d2.value);
        setRunningCount(count);

        setBankroll(prev => prev - bet);
        setGameOver(false);
        setCanDouble(true);
        setMessage("");

        if (checkState(bet, [p1, p2])) {
            setGameOver(true);
            return;
        }
    };

    const hit = () => {
        if (gameOver) return;

        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        setDeck(newDeck);
        setRunningCount(prev => prev + hiLoValue(card.value));
        setCanDouble(false);

        if(checkState(bet, newHand)) {
            revealDealer();
            setGameOver(true);
            return;
        }

        return;
    }

    const stand = () => {
        setCanDouble(false);
        revealDealer();
        playDealer(bet, playerHand);
        return;
    }

    const doubleDown = () => {
        if (!canDouble) return;

        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        setDeck(newDeck);
        setRunningCount(prev => prev + hiLoValue(card.value));
        setCanDouble(false);

        const newBet = bet * 2;

        setBankroll(prev => prev - bet);
        setBet(newBet);

        revealDealer();

        if(checkState(newBet, newHand)) {
            setGameOver(true);
            return;
        } else {
            playDealer(newBet, newHand);
        }

        return;
    }

    const playDealer = (currentBet, newPlayerHand) => {
        revealDealer();

        let newDeck = [...deck];
        let newDealerHand = [...dealerHand];

        while (handTotal(newDealerHand) < 17) {
            const card = newDeck.pop()!;
            newDealerHand.push(card);
            setRunningCount(prev => prev + hiLoValue(card.value));
        }

        setDealerHand(newDealerHand);
        setDeck(newDeck);

        const player = handTotal(newPlayerHand);
        const dealer = handTotal(newDealerHand);

        if (dealer > 21) {
            setMessage(`Dealer busts! You get $${2 * currentBet}!`);
            setBankroll(prev => prev + (2 * currentBet));
            setGameOver(true);
            return 1;
        }

        if (player > dealer) {
            setMessage(`Player wins! You get $${2 * currentBet}!`);
            setBankroll(prev => prev + (2 * currentBet));
            setGameOver(true);
            return;
        }

        if (dealer > player) {
            setMessage("Dealer wins. You lose.");
            setGameOver(true);
            return;
        }

        if (player === dealer) {
            setMessage("Push!");
            setBankroll(prev => prev + currentBet);
            setGameOver(true);
            return;
        }
    }

    const checkState = (currentBet = bet, latestPlayerHand) => {
        let player = handTotal(latestPlayerHand);
        let dealer = handTotal(dealerHand);

        const playerBJ = player === 21 && latestPlayerHand.length === 2;
        const dealerBJ = dealer === 21 && dealerHand.length === 2;

        if (playerBJ && dealerBJ) {
            revealDealer();
            setMessage("Push! Both have Blackjack.");
            setBankroll(prev => prev + currentBet);
            return 1;
        }

        if (playerBJ) {
            revealDealer();
            setMessage(`Blackjack! You get $${2.5 * currentBet}!`);
            setBankroll(prev => prev + (2.5 * currentBet));
            return 1;
        }

        if (dealerBJ) {
            revealDealer();
            setMessage("Dealer has Blackjack. You lose.");
            return 1;
        }

        if (player > 21) {
            revealDealer();
            setMessage("Bust! You lose.");
            return 1;
        }

        if (dealer > 21) {
            setMessage(`Dealer busts! You get $${2 * currentBet}!`);
            setBankroll(prev => prev + (2 * currentBet));
            return 1;
        }

        if (player === 21 && dealer !== 21) {
            setMessage(`21! You get $${2 * currentBet}!`);
            setBankroll(prev => prev + (2 * currentBet));
            return 1;
        }

        return 0;
    };

    const revealDealer = (hand = dealerHand) => {
        if (!hand || hand.length === 0) {
            console.error("No hand!");
            return;
        }

        const hiddenCardValue = hiLoValue(hand[0].value);
        const newHand = hand.map((card, i) =>
            i === 0 ? { ...card, hidden: false } : card
        );

        setDealerHand(newHand);
        setRunningCount(prev => prev + hiddenCardValue);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>Blackjack</h1>
            <p hidden={true}>Running Count: {runningCount}</p>

            <BetPanel
                bankroll={bankroll}
                bet={bet}
                setBet={setBet}
                onDeal={dealInitial}
                gameOver={gameOver}
            />

            <Hand hand={dealerHand} label="Dealer" />
            <Hand hand={playerHand} label="Player" />

            {!gameOver && playerHand.length > 0 && (
                <Controls
                    onHit={hit}
                    onStand={stand}
                    onDouble={doubleDown}
                    canDouble={canDouble}
                />
            )}

            {message && <h2>{message}</h2>}
        </div>
    );
}
