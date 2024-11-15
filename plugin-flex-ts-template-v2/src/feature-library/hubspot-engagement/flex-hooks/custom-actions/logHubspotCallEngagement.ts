import * as Flex from '@twilio/flex-ui';
import { Actions, ITask } from '@twilio/flex-ui';

import { CallOutcomes } from '../../enums/callOutcomes';
import logger from '../../../../utils/logger';
import HubspotEngagementService from '../../utils/HubspotEngagementService';

export const registerLogHubspotCallEngagement = async () => {
  Actions.registerAction('LogHubspotCallEngagement', async (payload: { manager: Flex.Manager; task?: ITask }) => {
    // eslint-disable-next-line prefer-const
    let { task, manager } = payload;

    if (!task) {
      logger.error(
        '[hubspot-engagement] Cannot create hubspot call engagement without either a task or a valid task sid',
      );
      return;
    }

    // if task.attributes.hubspot_contact_id is not available end this callback
    const ownerId = manager.workerClient?.attributes?.hubspot_owner_id ?? null;

    const direction = task.attributes.direction.toUpperCase();
    const params: any = {};

    let attributes: any = {};
    if (typeof task.attributes === 'string') {
      try {
        attributes = JSON.parse(task.attributes);
      } catch (e) {
        logger.error('Error parsing JSON string @ hubspot-engagement/flex-hooks/events/taskCanceled.tsx@26');
        attributes = {};
      }
    } else {
      attributes = task.attributes;
    }

    params.hs_call_callee_object_id = attributes.hubspot_contact_id ?? null;
    params.hubspot_deal_id = attributes.hubspot_deal_id ?? null;
    params.hs_timestamp = Date.parse(task.dateCreated.toUTCString());
    const bodyContent = attributes.conversations?.content === undefined ? '--' : attributes.conversations?.content;
    params.hs_call_body = `NOTA: "${bodyContent ?? '--'}"`;
    params.hs_call_callee_object_type_id = '0-1';
    params.hs_call_direction = direction;
    params.hs_call_duration = task.age * 1000;
    params.hs_call_title = attributes.callSid ? attributes.callSid : attributes.conversationSid ?? null;
    params.hubspot_owner_id = ownerId;
    // hs_call_disposition: mapOutcome[task.attributes.conversations?.outcome],
    // hs_call_status: task.status == 'completed' ? 'COMPLETED' : 'CALLING_CRM_USER',
    if (direction === 'INBOUND') {
      // hs_object_id: task.attributes.hubspot_contact_id ?? null,
      // convert task.dateCreated Date Object to UTC time and to timestamp
      // @todo custom disposition codes
      params.hs_call_from_number = attributes.from;
      params.hs_call_to_number = attributes.to;
      params.hs_call_recording_url = attributes.conversations?.segment_link ?? null;
    } else if (direction === 'OUTBOUND') {
      // hs_object_id: task.attributes.hubspot_contact_id ?? null,
      params.hs_call_callee_object_id = attributes.hubspot_contact_id ?? null;
      // convert task.dateCreated Date Object to UTC time and to timestamp
      // @todo custom disposition codes
      params.hs_call_from_number = task.formattedAttributes.from;
      params.hs_call_to_number = task.formattedAttributes.outbound_to;
      params.hs_call_recording_url = attributes.conversations?.segment_link ?? null;
    }

    params.taskAttributes = attributes;

    if (task.status.toLowerCase() === 'canceled') {
      logger.log('taskCanceledDebugV2', task);
      // @ts-ignore
      switch (task.reservation?.canceledReasonCode) {
        case 13223:
        case 21211:
          params.hs_call_status = 'FAILED';
          params.hs_call_disposition = CallOutcomes.WRONG_NUMBER;
          console.log('Invalid number!');
          break;
        case 21210:
          params.hs_call_status = 'FAILED';
          // params.hs_call_disposition = mapOutcome['WRONG_NUMBER'];
          console.log("Your 'from' number is unverified!");
          break;
        case 13227:
        case 21215:
          params.hs_call_status = 'FAILED';
          // params.hs_call_disposition = mapOutcome['WRONG_NUMBER'];
          console.log('Missing geopermissions!');
          break;
        case 45305:
          params.hs_call_status = 'NO_ANSWER';
          params.hs_call_disposition = CallOutcomes.NO_ANSWER;
          console.log('No answer!');
          break;
        case 45303:
        case 31486:
          params.hs_call_status = 'BUSY';
          console.log('Busy!');
          break;
        default:
          params.hs_call_status = 'CANCELED';
          params.hs_call_disposition = CallOutcomes.BUSY;
          console.log('Generic error');
      }
    } else {
      params.hs_call_disposition = CallOutcomes.CONNECTED;
      params.hs_call_status = 'COMPLETED';
    }

    HubspotEngagementService.postCallEngagement(params);
  });
};
