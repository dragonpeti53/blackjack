import { handTotal } from '../utils/hand.ts'
import { type Card, makeCard } from '../utils/deck.ts'

let c1: Card = makeCard('10', 'S');
let c2: Card = makeCard('A', 'S');

let h1: Card[] = [c1, c2];

let result = handTotal(h1);
if (result === 21) {
    console.log(result, 'pass');
} else {
    console.log(result, 'FAIL');
}