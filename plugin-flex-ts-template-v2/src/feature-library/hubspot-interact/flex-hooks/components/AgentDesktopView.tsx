import * as Flex from '@twilio/flex-ui';

import InteractionContainer from '../../custom-components/InteractionContainer';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.AgentDesktopView;
export const componentHook = function addInteractionContainerToAgentDesktopView(flex: typeof Flex, manager: Flex.Manager) {
  flex.AgentDesktopView.Content.add(<InteractionContainer key="InteractionContainer-component" />, {
    sortOrder: -1,
  });
};