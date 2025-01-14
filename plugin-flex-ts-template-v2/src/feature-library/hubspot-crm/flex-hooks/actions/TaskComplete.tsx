import * as Flex from '@twilio/flex-ui';

import { isUrlTabEnabled } from '../../../enhanced-crm-container/config';
import ContactCard from '../../custom-components/ContactCard/ContactCard';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.CompleteTask;
export const actionHook = function loadContactCardOnSelectTaskHook(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
    if (!payload.task) {
      return;
    }

    if (!isUrlTabEnabled()) {
      flex.AgentDesktopView.Panel2.Content.remove('HubspotCrmPlugin-component-ContactCard')

      return
    }

    flex.AgentDesktopView.Panel2.Content.remove('HubspotCrmPlugin-component-ContactCard')
    /*
    payload.components = [
      ...payload.components,
      {
        title: 'Contact',
        order: 0, // optionally define preferred tab order, defaults to 999 if not present
        component: <ContactCard key="HubspotCrmPlugin-component-ContactCard" task={payload.task} />
      }
    ]*/

  });
};