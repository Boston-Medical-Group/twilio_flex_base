const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const OpenAI = require("openai");

const requiredParameters = [
  { key: 'thread_id', purpose: 'ID del hilo de la conversación de ChatGPT' },
  { key: 'run_id', purpose: 'ID del run de la solicitud a ChatGPT' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const API_KEY = context.OPENAI_GPT_ASSISTANT_APIKEY;

    const openai = new OpenAI({
      apiKey: API_KEY,
    });

    const {
      thread_id,
      run_id
    } = event;

    const run = await openai.beta.threads.runs.retrieve(thread_id, run_id)

    if (!run) {
      console.log('RUN NOT FOUND')
      response.setBody({
        code: "NOT_FOUND"
      })
      return callback(null, response)
    }

    if (run.status !== 'completed') {
      console.log(`RUN NOT COMPLETED YET: ${run.status}`)
      response.setBody({
        code: "IN_PROGRESS"
      })
      return callback(null, response)
    }

    const message = await openai.beta.threads.messages.list(event.thread_id)
      .then(async (messages) => {
        const runMessage = messages.getPaginatedItems().find((message) => message.run_id === event.run_id)
        return runMessage ? runMessage : null
      }).catch((error) => null)

    if (message) {
      if (message.content[0].type !== 'text') {
        response.setBody({
          code: "NOT_TEXT",
          body: null
        })
        return callback(null, response)
      } else {
        response.setBody({
          code: "SUCCESS",
          body: message.content[0].text.value
        })
        return callback(null, response)
      }
    } else {
      console.log('MESSAGE NOT FOUND')
      response.setBody({
        code: "NOT_FOUND"
      })
      return callback(null, response)
    }
  } catch (err) {
    return handleError(err)
  }
})