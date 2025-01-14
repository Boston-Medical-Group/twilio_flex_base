import * as Flex from '@twilio/flex-ui';

import ContactCard from '../../custom-components/ContactCard/ContactCard';
import { FlexActionEvent } from '../../../../types/feature-loader';

import { isUrlTabEnabled } from '../../../enhanced-crm-container/config';

export const actionEvent = FlexActionEvent.after;
export const actionName = 'LoadCRMContainerTabs';
export const actionHook = function addToEnhancedCRM(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task) {
      return;
    }

    if (!isUrlTabEnabled()) {
      flex.AgentDesktopView.Panel2.Content.replace(
        <ContactCard key="HubspotCrmPlugin-component-ContactCard"
          task={payload.task}
        />, {
        if: () => payload.task
      }
      )

      return
    }

    if (payload.task?.attributes?.hubspot_contact_id !== '' || payload.task?.attributes?.hubspotContact) {
      payload.components = [
        ...payload.components,
        {
          title: 'Contact',
          order: 0, // optionally define preferred tab order, defaults to 999 if not present
          component: <ContactCard key="HubspotCrmPlugin-component-ContactCard" task={payload.task} />
        }
      ]
    }
  });
};