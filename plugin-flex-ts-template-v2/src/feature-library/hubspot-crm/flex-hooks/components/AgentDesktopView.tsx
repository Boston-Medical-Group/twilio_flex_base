import * as Flex from '@twilio/flex-ui';

import SyncHubspotUser from '../../custom-components/SyncHubspotUser';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.AgentDesktopView;
export const componentHook = function addMyComponentToAgentDesktopView(flex: typeof Flex, manager: Flex.Manager) {
    flex.AgentDesktopView.Panel1.Content.add(<SyncHubspotUser key="HubspotCrmPlugin-component-SyncHubspotUser" />, {
        sortOrder: -1,
    });
};