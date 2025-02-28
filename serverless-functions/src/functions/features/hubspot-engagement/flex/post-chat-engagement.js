const HubspotClient = require('@hubspot/api-client').Client;

const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [{ key: 'conversationSid', purpose: 'Unique ID of the conversation' }];


const getHtmlMessage = async (messages) => {
  let resultHtml = '<ul style="list-style:none;padding:0;">';

  try {
    let bgColor = 'transparent';
    messages.forEach(message => {
      bgColor = bgColor === 'transparent' ? '#0091ae12' : 'transparent';
      resultHtml += `<li style="background-color: ${bgColor};border: 1px solid #cfdae1;padding: 5px;margin-bottom: 4px;"><div style="color: #5d7185;font-weight: bold;margin-bottom:5px;"><span class="">${message.author}</span> - <span style="color: #738ba3;font-size: 9px;">${message.dateCreated.toLocaleString()}</span></div><div style="padding: 6px;color: #333f4d;"><p>${message.body}</p></div></li>`
    })

    resultHtml += '</ul>';

  } catch (err) {
    console.error(`Oeps, something is wrong ${err}`);
  }

  return resultHtml;
}

const getMessages = async (context, conversationSid) => {
  let messages = [];
  try {
    const result = await twilioExecute(context, (client) =>
      client.conversations.v1.conversations(conversationSid)
        .messages
        .list({ limit: 500 })
    )

    if (result.success) {
      messages = result.data;
    }
  } catch (err) {
    console.error(`Oeps, something is wrong ${err}`);
  }

  return messages;
}

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
