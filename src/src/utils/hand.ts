import type { Card } from "./deck";

export function cardValue(value: Card): number {
    if (['J','Q','K'].includes(value.value)) return 10;
    if (value.value === 'A') return 11;
    return parseInt(value.value);
}

export function handTotal(hand: Card[]): number {
    let total = hand.reduce((sum, val) => sum + cardValue(val), 0);
    let aces = hand.filter(val => val.value === 'A').length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}
