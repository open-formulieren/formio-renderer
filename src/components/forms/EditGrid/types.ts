import type {ITEM_ADDED_MARKER, ITEM_EXPANDED_MARKER} from './constants';

export type MarkedEditGridItem<T> = T & {
  [ITEM_EXPANDED_MARKER]?: true;
  [ITEM_ADDED_MARKER]?: true;
};
