import { useState } from "react";
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

    const reshuffleIfNeeded = () => {
        if (deck.length < 15) setDeck(createDeck(1));
    };

    const dealInitial = () => {
        if (!gameOver) return;
        if (bet < 1 || bet > bankroll) {
            setMessage("Invalid bet!");
            return;
        }

        reshuffleIfNeeded();
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
    };

    const hit = () => {
        if (gameOver) return;

        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        setDeck(newDeck);
        setRunningCount(prev => prev + hiLoValue(card.value));

        const total = handTotal(newHand.map(c => c.value));
        if (total > 21) {
            setMessage(`Player busts! You lose $${bet}.`);
            setGameOver(true);
            setCanDouble(false);
            playDealer(true);
        }
    };

    const stand = () => {
        if (gameOver) return;
        setCanDouble(false);
        playDealer();
    };

    const doubleDown = () => {
        if (!canDouble || bankroll < bet) return;

        setBankroll(prev => prev - bet);
        setBet(prev => prev * 2);

        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        setDeck(newDeck);
        setRunningCount(prev => prev + hiLoValue(card.value));

        setCanDouble(false);
        playDealer();
    };

    const playDealer = (playerBusted = false) => {
        const dealerRevealed = dealerHand.map(c => ({ ...c, hidden: false }));
        setDealerHand(dealerRevealed);
        let dealer = [...dealerRevealed];
        let newDeck = [...deck];

        const dealerTotal = () => handTotal(dealer.map(c => c.value));

        while (dealerTotal() < 17) {
            const card = newDeck.pop()!;
            dealer.push(card);
            setRunningCount(prev => prev + hiLoValue(card.value));
        }

        setDealerHand(dealer);
        setDeck(newDeck);

        const playerTotal = handTotal(playerHand.map(c => c.value));
        const finalDealerTotal = dealerTotal();

        let resultMessage;
        let payout = 0;

        if (playerBusted) {
            payout = 0;
            resultMessage = `Player busts! You lose $${bet}.`;
        } else if (finalDealerTotal > 21) {
            payout = bet * 2;
            resultMessage = `Dealer busts! You win $${bet * 2}!`;
        } else if (playerTotal > finalDealerTotal) {
            payout = bet * 2;
            resultMessage = `Player wins! You win $${bet * 2}!`;
        } else if (playerTotal < finalDealerTotal) {
            payout = 0;
            resultMessage = `Dealer wins! You lose $${bet}.`;
        } else {
            payout = bet;
            resultMessage = "Push!";
        }

        setMessage(resultMessage);
        setBankroll(prev => prev + payout);
        setGameOver(true);
        setBet(10);
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
