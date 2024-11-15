import { Client as HubspotClient } from '@hubspot/api-client';

const fetch = require('node-fetch');
const OpenAI = require('openai');

const { getGPTSummary } = require(Runtime.getFunctions()['common/helpers/openai-helper'].path);
const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [{ key: 'conversationSid', purpose: 'Unique ID of the conversation' }];

const createSummary = async (historyDelivered, context, accountCountry) => {
  if (historyDelivered.length <= 3) {
    return false;
  }

  const API_KEY = context.OPENAI_GPT_SUMMARY_APIKEY;
  const apiModel = context.OPENAI_GPT_API_MODEL ?? 'gpt-3.5-turbo-0125';

  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  return getGPTSummary(openai, historyDelivered, apiModel, accountCountry);
};

const getMessages = async (twilioClient, conversationSid) => {
  let messages = [];
  try {
    messages = await twilioClient.conversations.v1.conversations(conversationSid).messages.list({ limit: 500 });
  } catch (err) {
    console.error(`Oops, something is wrong ${err}`);
  }

  return messages;
};

const hasEnoughMessages = (messages) => {
  const historyDelivered = messages.filter((h) => h.delivery === null && h.author.startsWith('whatsapp:'));

  return historyDelivered.length > 0;
};

const getParseConversationForAI = async (messages) => {
  const historyDelivered = messages.filter((h) => h.delivery === null || h.delivery?.delivered === 'all');
  const messagesParsed = [];

  historyDelivered.forEach((h) => {
    let author = 'Agente';
    if (h.author.startsWith('whatsapp:')) {
      author = 'Paciente';
    }
    messagesParsed.push(`${h.dateCreated} @ ${author} : ${h.body}`);
  });

  return messagesParsed;
};

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { conversationSid, hs_timestamp, hubspot_contact_id, hubspot_deal_id, hubspot_owner_id } = event;
    const accountCountry = event.accountCountry ?? 'esp';

    if (!hubspot_contact_id) {
      console.log('hubspot_contact_id Inválido al crear el resumen');
      response.setBody({ error: 'hubspot_contact_id Inválido al crear resumen' });
      response.setStatusCode(404);
      return callback(null, response);
    }

    let summaryContent;
    const conversationContext = context.getTwilioClient().conversations.v1.conversations(conversationSid);
    const history = await conversationContext.messages.list();

    const historyDelivered = history.filter((h) => h.delivery === null || h.delivery?.delivered === 'all');

    const clientMessages = historyDelivered.filter((m) => m.author.startsWith('whatsapp:'));
    const agentMessages = historyDelivered.filter((m) => !m.author.startsWith('whatsapp:'));
    if (clientMessages.length === 0 && agentMessages.length > 0) {
      summaryContent =
        accountCountry === 'bra'
          ? 'O paciente foi contatado, mas ainda não recebeu resposta.'
          : 'Se ha contactado al paciente, pero aún no se obtuvo una respuesta';
    } else if (historyDelivered.length < 4) {
      response.setBody({ result: 'TOO_SHORT' });
      return callback(null, response);
    } else {
      summaryContent = await createSummary(historyDelivered, context, accountCountry);
    }

    const hs_note_body = accountCountry === 'bra' ? `Resumo da AI: ${summaryContent}` : `Resumen AI: ${summaryContent}`;

    const toHubspot = {
      properties: {
        hs_timestamp,
        hs_note_body,
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
              associationTypeId: 202,
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
            associationTypeId: 214,
          },
        ],
      });
    }

    const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN });
    const note = await hubspotClient.crm.objects.notes.basicApi.create(toHubspot);
    response.setBody(note);

    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});
