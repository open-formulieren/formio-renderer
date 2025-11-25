import type {ITEM_EXPANDED_MARKER} from './constants';

export type MarkedEditGridItem<T> = T & {[ITEM_EXPANDED_MARKER]?: true};
