import {ContentComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';

const RenderContent: FormioComponentRenderer<ContentComponentSchema> = ({component: {html}}) => {
  // TODO: apply HTML sanitizer!
  // TODO: set appropriate classnames for styling
  return <div dangerouslySetInnerHTML={{__html: html}} />;
};

export default RenderContent;
