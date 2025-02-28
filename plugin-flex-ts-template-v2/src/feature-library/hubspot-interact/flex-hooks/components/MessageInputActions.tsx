import * as Flex from '@twilio/flex-ui';

import WhatsAppTemplatesDropdown from '../../custom-components/WhatsAppTemplatesDropdown';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.MessageInputActions;
export const componentHook = function addWhatsAppTemplatesDropdownToMessageInputActions(flex: typeof Flex, manager: Flex.Manager) {
  flex.MessageInputActions.Content.add(<WhatsAppTemplatesDropdown key="whtasapp-templates-dropdown-button" />, {
    sortOrder: 4,
  });
};