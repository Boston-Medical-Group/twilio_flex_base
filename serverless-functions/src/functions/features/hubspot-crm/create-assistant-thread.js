const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const { getGPTThreadRun } = require(Runtime.getFunctions()['common/helpers/openai-helper'].path);

const OpenAI = require("openai");

const requiredParameters = [
  { key: 'conversationSid', purpose: 'Conversation ID' }
];

const MAX_CONVERSATIONS_TO_FETCH = 5;

const createThreadAndRun = async (historyDelivered, instruction, context) => {
  if (historyDelivered.length == 0) {
    return false
  }

  const API_KEY = context.OPENAI_GPT_ASSISTANT_APIKEY;
  const ASSISTANT = context.OPENAI_ASSISTANT_ID;

  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  return await getGPTThreadRun(openai, historyDelivered, instruction, ASSISTANT)
}

async function getConversationMessages(context, conversationSid) {
  //fetch conversations with filters
  const history = await twilioExecute(context, async (client) =>
    client.conversations.v1.conversations(conversationSid).messages.list()
  )
  let historyDelivered = []

  if (!history.success) {
    console.log(error);
  }

  try {
    historyDelivered = history.data.filter((h) => h.delivery === null || h.delivery?.delivered === 'all')
  } catch (error) {
    console.log(error)
  }

  return historyDelivered;
}

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    // Necesito obtener las conversaciones del contacto (SMS o Whatsapp)
    const {
      conversationSid,
      instruction
    } = event;

    await getConversationMessages(context, conversationSid)
      .then(async (resp) => {
        // handle success 
        await createThreadAndRun(resp, instruction, context)
          .then(async (data) => {
            if (!data) {
              response.setBody({ error: 'La conversación es muy corta para generar una sugerencia' })
            } else {
              response.setBody(data)
            }
            response.setStatusCode(200);
          }).catch((err) => {
            response.setBody({ error: err })
            response.setStatusCode(200);
          })
      })
      .catch(function (err) {
        response.setBody({ error: err });
        response.setStatusCode(200);
      })

    callback(null, response);
  } catch (err) {
    handleError(err)
  }

})