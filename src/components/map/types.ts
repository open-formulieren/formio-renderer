import type {MapComponentSchema} from '@open-formulieren/types';

export type Overlay = NonNullable<MapComponentSchema['overlays']>[number];
export type Interactions = Required<MapComponentSchema>['interactions'];
