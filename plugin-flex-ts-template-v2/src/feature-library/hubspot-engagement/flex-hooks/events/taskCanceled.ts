import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';

const DELAY_TO_LOG_CALL_TASKS = 5;

export const eventName = FlexEvent.taskCanceled;
export const eventHook = async (flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) => {
  if (task.taskChannelUniqueName.toLowerCase() === 'voice' && task.age > DELAY_TO_LOG_CALL_TASKS) {
    flex.Actions.invokeAction('LogHubspotCallEngagement', {
      task,
    });
  }
};
