const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
    { key: 'contentSid', purpose: 'Content SID' },
    { key: 'contentVariables', purpose: 'Variables object' },
    { key: 'conversationSid', purpose: 'Conversation SID' },
    { key: 'identity', purpose: 'Author display name' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const {
            contentSid,
            contentVariables,
            conversationSid,
            identity
        } = event;

        await twilioExecute(context, (client) =>
            client.conversations.v1.conversations(conversationSid).messages.create({
                contentSid,
                contentVariables: JSON.stringify(contentVariables),
                author: identity
            })
        );

        return callback(null, response);
    } catch (err) {
        return handleError(err);
    }
});