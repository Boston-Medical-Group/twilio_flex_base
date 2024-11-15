import * as Flex from '@twilio/flex-ui';
import { Actions, ITask } from '@twilio/flex-ui';

import logger from '../../../../utils/logger';
import HubspotEngagementService from '../../utils/HubspotEngagementService';

export const registerLogHubspotChatEngagement = async () => {
  Actions.registerAction('LogHubspotChatEngagement', async (payload: { manager: Flex.Manager; task?: ITask }) => {
    // eslint-disable-next-line prefer-const
    let { task, manager } = payload;

    if (!task) {
      logger.error(
        '[hubspot-engagement] Cannot create hubspot chat engagement without either a task or a valid task sid',
      );
      return;
    }

    if (!task.attributes.hubspot_contact_id) {
      logger.error('[hubspot-engagement] Cannot create hubspot chat engagement without a hubspot contact id');
      return;
    }

    const ownerId = manager.workerClient?.attributes?.hubspot_owner_id ?? null;

    const bodyContent =
      task.attributes.conversations?.content === undefined ? '--' : task.attributes.conversations?.content;
    const params = {
      conversationSid: task.attributes.conversationSid,
      hubspot_contact_id: task.attributes.hubspot_contact_id ?? null,
      hubspot_deal_id: task.attributes.hubspot_deal_id ?? null,
      hs_communication_channel_type: task.attributes.channelType.toLowerCase() === 'whatsapp' ? 'WHATS_APP' : 'SMS',
      hs_communication_logged_from: 'CRM',
      hs_communication_body: `NOTA: "${bodyContent ?? '--'}"
    - Duración: ${task.age} segundos`,
      hs_timestamp: Date.parse(task.dateCreated.toUTCString()),
      hubspot_owner_id: ownerId,
    };

    await HubspotEngagementService.postChatEngagement(params);
  });
};
