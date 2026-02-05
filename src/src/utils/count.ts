import type { CardValue } from "./deck";

/**
 * Hi-Lo card counting values
 * 2-6: +1
 * 7-9: 0
 * 10,Ace: -1
 */
export function hiLoValue(value: CardValue): number {
    if (['2','3','4','5','6'].includes(value)) return 1;
    if (['10','J','Q','K','A'].includes(value)) return -1;
    return 0;
}