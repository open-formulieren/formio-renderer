import {ExtendedComponentSchema} from 'formiojs';

export interface IFormioForm {
  display?: 'form';

  components: ExtendedComponentSchema[];
}
