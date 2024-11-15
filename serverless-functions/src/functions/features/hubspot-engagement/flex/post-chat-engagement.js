import { Client as HubspotClient } from '@hubspot/api-client';

const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [{ key: 'conversationSid', purpose: 'Unique ID of the conversation' }];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const {
      conversationSid,
      hubspot_contact_id,
      hubspot_deal_id,
      hs_communication_channel_type,
      hs_communication_logged_from,
      hs_communication_body,
      hs_timestamp,
      hubspot_owner_id,
    } = event;

    const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN });
    if (!hubspot_contact_id) {
      throw new Error('CRMID Inválido - Cant post chat engagement');
    }

    let logBody = hs_communication_body;
    logBody += '<br /><br />';
    const conversationMessages = await getMessages(context, conversationSid);
    logBody += await getHtmlMessage(conversationMessages);

    const toHubspot = {
      properties: {
        hs_communication_channel_type,
        hs_communication_logged_from,
        hs_communication_body: logBody,
        hs_timestamp,
        hubspot_owner_id,
      },
      associations: [
        {
          to: {
            id: hubspot_contact_id,
          },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 81,
            },
          ],
        },
      ],
    };

    if (hubspot_deal_id !== undefined && hubspot_deal_id !== null) {
      toHubspot.associations.push({
        to: {
          id: hubspot_deal_id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 85,
          },
        ],
      });
    }

    const communication = await hubspotClient.crm.objects.communications.basicApi.create(toHubspot);

    response.setBody(communication);

    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});
