import React from "react";

interface BetPanelProps {
    bankroll: number;
    bet: number;
    setBet: (value: number) => void;
    onDeal: () => void;
    gameOver: boolean;
}

const BetPanel: React.FC<BetPanelProps> = ({ bankroll, bet, setBet, onDeal, gameOver }) => {
    return (
        <div style={{ marginBottom: "20px" }}>
            <p>Bankroll: ${bankroll}</p>
            <input
                type="number"
                min={2}
                max={bankroll}
                value={bet}
                onChange={(e) => setBet(Math.min(bankroll, Math.max(1, Number(e.target.value))))}
                disabled={!gameOver}
                step={2}
            />
            <button
                onClick={onDeal}
                disabled={bet <= 0 || bet > bankroll || !gameOver}
            >
                Deal
            </button>
        </div>
    );
};

export default BetPanel;