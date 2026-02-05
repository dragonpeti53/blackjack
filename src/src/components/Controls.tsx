import React from "react";

interface ControlsProps {
    onHit: () => void;
    onStand: () => void;
    onDouble?: () => void;
    canDouble?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onHit, onStand, onDouble, canDouble = false }) => {
    return (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={onHit}>Hit</button>
            <button onClick={onStand}>Stand</button>
            {onDouble && (
                <button onClick={onDouble} disabled={!canDouble}>
                    Double
                </button>
            )}
        </div>
    );
};

export default Controls;
