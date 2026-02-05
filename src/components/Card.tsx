import { type CardType } from "../utils/deck";

interface CardProps {
    card: CardType;
}

export default function Card({ card }: CardProps) {
    const valueMap: Record<string,string> = {
        "A":"A","J":"J","Q":"Q","K":"K",
        "2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"0"
    };

    const imgSrc = card.hidden
        ? "https://deckofcardsapi.com/static/img/back.png"
        : `https://deckofcardsapi.com/static/img/${valueMap[card.value]}${card.suit}.png`;

    return <img src={imgSrc} alt={`${card.value} of ${card.suit}`} style={{ width: "80px", margin: "2px" }} />;
}