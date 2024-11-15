import * as Flex from '@twilio/flex-ui';
import { Actions, ITask } from '@twilio/flex-ui';

import logger from '../../../../utils/logger';
import HubspotEngagementService from '../../utils/HubspotEngagementService';

export const registerLogHubspotSummaryNote = async () => {
  Actions.registerAction('LogHubspotSummaryNote', async (payload: { manager: Flex.Manager; task?: ITask }) => {
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
    const accountCountry = manager.serviceConfiguration.attributes.account_country;

    const params = {
      conversationSid: task.attributes.conversationSid,
      hubspot_contact_id: task.attributes.hubspot_contact_id ?? null,
      hubspot_deal_id: task.attributes.hubspot_deal_id ?? null,
      hs_timestamp: Date.parse(task.dateCreated.toUTCString()),
      hubspot_owner_id: ownerId,
      accountCountry,
    };

    await HubspotEngagementService.postSummaryNote(params);
  });
};
