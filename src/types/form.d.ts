import {ComponentSchema} from 'formiojs';

export interface IFormioForm {
  display?: 'form';

  components: ComponentSchema[];
}
