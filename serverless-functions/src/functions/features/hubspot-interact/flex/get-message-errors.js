const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
  { key: 'conversationSid', purpose: 'Conversation SID' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const errors = [];

  try {
    const result = await twilioExecute(context, (client) =>
      client.conversations.v1.conversations(event.conversationSid).messages.list({
        limit: 1,
        order: 'desc'
      })
    );

    if (result.success) {
      if (result.data.length > 0) {
        const message = result.data[0]
        const receipts = message.deliveryReceipts()
        const deliveryReceipts = await twilioExecute(context, (client) =>
          receipts.list({})
        )

        if (deliveryReceipts.success) {
          const codes = [];
          deliveryReceipts.data.forEach((deliveryReceipt) => {
            if (deliveryReceipt.errorCode !== null) {
              codes.push({
                date: deliveryReceipt.dateCreated,
                code: deliveryReceipt.errorCode
              })
            }
          })

          errors.push(...codes)
        }
      }
    }
  } catch (err) {
    console.log(err)
  }

  response.setBody(errors);

  callback(null, response);
})