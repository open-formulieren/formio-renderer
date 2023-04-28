import {IContentComponent} from '@components';
import {IRendererComponent} from '@lib/renderer';

export const FORMIO_CONDITIONAL: Array<IRendererComponent | IContentComponent> = [
  // Reference field.
  {
    id: 'favoriteAnimal',
    type: 'textfield',
    label: 'Favorite animal',
    key: 'favoriteAnimal',
  },

  // Case: hide unless "cat"
  {
    conditional: {
      eq: 'cat',
      show: true,
      when: 'favoriteAnimal',
    },
    id: 'motivationCat',
    hidden: true,
    type: 'textfield',
    key: 'motivation',
    label: 'Motivation',
    placeholder: 'I like cats because...',
    description: 'Please motivate why "cat" is your favorite animal...',
  },

  // Case hide unless "dog"
  {
    conditional: {
      eq: 'dog',
      show: true,
      when: 'favoriteAnimal',
    },
    id: 'motivationDog',
    hidden: true,
    type: 'textfield',
    key: 'motivation',
    label: 'Motivation',
    placeholder: 'I like dogs because...',
    description: 'Please motivate why "dog" is your favorite animal...',
  },

  // Case hide unless "" (empty string)
  {
    conditional: {
      eq: '',
      show: true,
      when: 'favoriteAnimal',
    },
    id: 'content1',
    hidden: true,
    type: 'content',
    key: 'content',
    html: 'Please enter you favorite animal.',
  },

  // Case show unless "cat"
  {
    conditional: {
      eq: 'cat',
      show: false,
      when: 'favoriteAnimal',
    },
    id: 'content2',
    hidden: false,
    type: 'content',
    key: 'content',
    html: 'Have you tried "cat"?',
  },

  // Case show unless "dog"
  {
    conditional: {
      eq: 'dog',
      show: false,
      when: 'favoriteAnimal',
    },
    id: 'content3',
    hidden: false,
    type: 'content',
    key: 'content',
    html: 'Have you tried "dog"?',
  },
];
