import type {CosignV1ComponentSchema} from '@open-formulieren/types';
import {Alert, ButtonLink, FormField, Paragraph} from '@utrecht/component-library-react';
import {useId} from 'react';
import {FormattedMessage} from 'react-intl';
import {useAsync} from 'react-use';

import LoadingIndicator from '@/components/LoadingIndicator';
import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Icon from '@/components/icons';
import {useFormSettings} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './CoSignOld.scss';
import LoginButtonIcon from './LoginButtonIcon';
import ValueDisplay from './ValueDisplay';
import type {CosignOldParameters} from './types';

interface CosignAuthenticationProps extends CosignOldParameters {
  authPlugin: string;
}

const CosignAuthentication: React.FC<CosignAuthenticationProps> = ({
  getCosignStatus,
  getLoginOption,
  authPlugin,
}) => {
  const state = useAsync(getCosignStatus);
  // log errors to the console if any
  if (state.error) console.error(state.error);
  // while loading, display spinner
  if (state.loading) return <LoadingIndicator size="small" />;

  const {coSigned, representation} = state.value ?? {coSigned: false, representation: ''};
  // Early simple exit if it's cosigned already, but show error if we don't have a representation.
  if (coSigned) {
    return representation ? (
      <div className="openforms-co-sign-old__representation">{representation}</div>
    ) : (
      <Alert type="error" icon={<Icon icon="error" />}>
        <FormattedMessage
          description="Co-sign auth option not available on form"
          defaultMessage="Something went wrong while processing the co-sign results. Please contact the municipality."
        />
      </Alert>
    );
  }

  const loginOption = getLoginOption(authPlugin);

  if (!loginOption) {
    return (
      <Alert type="error" icon={<Icon icon="error" />}>
        <FormattedMessage
          description="Co-sign auth option not available on form"
          defaultMessage="Something went wrong while presenting the login option. Please contact the municipality."
        />
      </Alert>
    );
  }

  return (
    <div className="openforms-co-sign-old__login-button">
      <ButtonLink appearance="primary-action-button" href={loginOption.url}>
        <FormattedMessage
          description="Login button label"
          defaultMessage="Login with {provider}"
          values={{provider: loginOption.label}}
        />
      </ButtonLink>
      <LoginButtonIcon identifier={loginOption.identifier} logo={loginOption.logo} />
    </div>
  );
};

export interface FormioCosignOldProps {
  componentDefinition: CosignV1ComponentSchema;
}

export const FormioCosignOldField: React.FC<FormioCosignOldProps> = ({
  componentDefinition: {label, description, authPlugin},
}) => {
  // The legacy cosign has no value, so we don't have to do anything with Formik here
  const id = useId();
  const formSettings = useFormSettings();

  const getCosignStatus = formSettings?.componentParameters?.coSign?.getCosignStatus;
  const getLoginOption = formSettings?.componentParameters?.coSign?.getLoginOption;

  return (
    <FormField className="utrecht-form-field--openforms">
      <Label id={id}>{label}</Label>
      <Paragraph className="openforms-co-sign-old">
        {getCosignStatus && getLoginOption ? (
          <CosignAuthentication
            getCosignStatus={getCosignStatus}
            getLoginOption={getLoginOption}
            authPlugin={authPlugin}
          />
        ) : (
          <Alert type="error" icon={<Icon icon="error" />}>
            <FormattedMessage
              description="Required co-sign callbacks not configured"
              defaultMessage="Something went wrong while presenting the login option. Please contact the municipality."
            />
          </Alert>
        )}
      </Paragraph>
      <HelpText>{description}</HelpText>
    </FormField>
  );
};

const CosignOldComponent: RegistryEntry<CosignV1ComponentSchema> = {
  formField: FormioCosignOldField,
  valueDisplay: ValueDisplay,
};

export default CosignOldComponent;
