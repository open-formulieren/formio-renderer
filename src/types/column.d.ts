import { IFormioComponent } from './component'

type ColumnSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface IFormioColumn {
  components: IFormioComponent[];
  size: ColumnSize;
  sizeMobile?: ColumnSize;
}
