import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';

export const eventName = FlexEvent.taskCompleted;
export const eventHook = async (flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) => {
  if (task.taskChannelUniqueName === 'voice') {
    flex.Actions.invokeAction('LogHubspotCallEngagement', {
      manager,
      task,
    });
  } else if (task.taskChannelUniqueName === 'chat' || task.taskChannelUniqueName === 'sms') {
    flex.Actions.invokeAction('LogHubspotChatEngagement', { manager, task });
    flex.Actions.invokeAction('LogHubspotSummaryNote', { manager, task });
  }
};
