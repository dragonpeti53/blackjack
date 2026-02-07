export type CardValue = "2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"|"A";
export type Suit = "C"|"D"|"H"|"S";

export interface Card {
    value: CardValue;
    suit: Suit;
    hidden: boolean;
}

const values: CardValue[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

/**
 * Create a deck of cards
 * @param numDecks number of decks to include
 */
export function createDeck(numDecks = 1): Card[] {
    const deck: Card[] = [];

    const suits: Suit[] = ['C', 'D', 'H', 'S'];

    for (let d = 0; d < numDecks; d++) {
        for (const value of values) {
            for (const suit of suits) {
                deck.push({ value, suit, hidden: false });
            }
        }
    }

    for (let i = deck.length - 1; i > 0; i--) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const j = array[0] % (i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

export function makeCard(value: CardValue, suit: Suit) {
    let card: Card = {
        value,
        suit,
        hidden: false,
    }
    return card;
}