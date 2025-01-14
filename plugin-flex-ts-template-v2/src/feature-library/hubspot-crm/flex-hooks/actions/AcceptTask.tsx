import * as Flex from '@twilio/flex-ui';

import { isUrlTabEnabled } from '../../../enhanced-crm-container/config';
import ContactCard from '../../custom-components/ContactCard/ContactCard';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function loadContactCardOnAcceptTaskHook(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
    if (!payload.task) {
      return;
    }

    if (payload.task.attributes.direction.toLowerCase() === 'inbound' && payload.task.attributes.crmid) {
      window.open(`https://app-eu1.hubspot.com/contacts/${process.env.FLEX_APP_HUBSPOT_CRMID}/contact/${payload.task.attributes.crmid}`, '_blank');
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

    if (payload.task && payload.task?.attributes?.hubspot_contact_id !== '' || payload.task?.attributes?.hubspotContact) {
      payload.components = [
        ...payload.components,
        {
          title: 'Contact',
          order: 0, // optionally define preferred tab order, defaults to 999 if not present
          component: <ContactCard key="HubspotCrmPlugin-component-ContactCard" task={payload.task} />
        }
      ]

      Flex.Actions.invokeAction("SelectCRMContainerTab", {
        title: 'Contact'
      });
    }
  });
};