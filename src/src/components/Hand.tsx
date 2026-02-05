import Card from "./Card";
import type { CardType } from "../utils/deck";

interface HandProps {
    hand: CardType[];
    label: string;
}

export default function Hand({ hand, label }: HandProps) {
    return (
        <div style={{ marginBottom: "10px" }}>
            <h3>{label}</h3>
            <div style={{ display: "flex" }}>
                {hand.map((c, i) => <Card card={c} key={i} />)}
            </div>
        </div>
    );
}
