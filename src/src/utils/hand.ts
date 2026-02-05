import type { CardValue, CardType } from "./deck";

export function cardValue(value: CardValue): number {
    if (['J','Q','K'].includes(value)) return 10;
    if (value === 'A') return 11;
    return parseInt(value);
}

export function handTotal(hand: CardType[]): number {
    let handValues = hand.map(c => cardValue(c.value));
    let total = handValues.reduce((sum, val) => sum + val, 0);
    let aces = hand.filter(val => val.value === 'A').length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}