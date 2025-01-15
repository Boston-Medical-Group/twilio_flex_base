const OpenAI = require('openai');

const { getGPTSummary } = require(Runtime.getFunctions()['common/helpers/openai-helper'].path);
const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

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

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const {
      conversationSid,
    } = event;
    let forceSummary = event.force ?? false
    const accountCountry = event.accountCountry ?? 'esp';

    const conversation = await twilioExecute(context, (client) =>
      client.conversations.v1.conversations(conversationSid).fetch()
    );
    if (!conversation.success) {
      response.setBody({});
      return callback(null, response);
    }

    const history = await twilioExecute(context, (client) =>
      client.conversations.v1.conversations(conversationSid).messages.list()
    );
    if (!history.success) {
      response.setBody({});
      return callback(null, response);
    }

    let historyDelivered = history.data.filter((h) => h.delivery === null || h.delivery?.delivered === 'all')
    let conversationAttributes = JSON.parse(conversation.data.attributes)

    let summaryContent;
    let summaryTimestamp;

    let clientMessages = historyDelivered.filter((m) => m.author.startsWith('whatsapp:'))
    let agentMessages = historyDelivered.filter((m) => !m.author.startsWith('whatsapp:'))
    if (clientMessages.length === 0 && agentMessages.length > 0) {
      summaryContent = accountCountry === 'bra' ? 'O paciente foi contatado, mas ainda não recebeu resposta.' : 'Se ha contactado al paciente, pero aún no se obtuvo una respuesta'
    } else if (historyDelivered.length < 4) {
      summaryContent = accountCountry === 'bra' ? 'Nenhum resumo foi gerado ainda, pois a conversa foi muito breve.' : 'Aún no se ha generado resumen ya que la conversación es muy breve'
    } else {
      // Si la conversación se ha actualizado o ha pasado mucho tiempo, forzamos un nuevo resumen
      const oldCounter = conversationAttributes.chatgpt_summary_messages_counter ?? historyDelivered.length
      if (oldCounter < historyDelivered.length) {
        forceSummary = true
      }
      // Compare now with a ISOString date and check if there has been more than 10 minutes
      if (conversationAttributes.chatgpt_summary_timestamp) {
        const diff = new Date() - new Date(conversationAttributes.chatgpt_summary_timestamp);
        if (diff > 10 * 60 * 1000) {
          forceSummary = true
        }
      }

      if (!conversationAttributes.chatgpt_summary_content || forceSummary) {
        summaryContent = await createSummary(historyDelivered, context, accountCountry)
        if (summaryContent) {
          summaryTimestamp = new Date().toISOString()
          conversationAttributes.chatgpt_summary_content = summaryContent
          conversationAttributes.chatgpt_summary_timestamp = summaryTimestamp
          conversationAttributes.chatgpt_summary_messages_counter = historyDelivered.length
          await twilioExecute(context, (client) =>
            client.conversations.v1.conversations(conversationSid).update({
              attributes: JSON.stringify(conversationAttributes)
            })
          )
        }
      } else if (conversationAttributes.chatgpt_summary_content) {
        summaryContent = conversationAttributes.chatgpt_summary_content
      }
    }

    if (summaryContent != '') {
      response.setBody({ content: summaryContent, messagesCount: historyDelivered.length })
    } else {
      response.setBody({})
    }
  } catch (error) {
    response.setBody({});
  }

  return callback(null, response);
});
