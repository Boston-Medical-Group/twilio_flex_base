const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

const requiredParameters = [
  { key: 'To', purpose: 'Destination' }
];

/**
 * Get an active conversation for this contact
 */
const getActiveConversation = async (context, to) => {
  const participantConversations = await twilioExecute(context, (client) =>
    client.conversations.v1.participantConversations.list({
      limit: 100,
      pageSize: 100,
      address: to
    })
  )

  if (!participantConversations.success) {
    return false;
  }

  // Find first participantConversation with state active
  const participantConversation = participantConversations.data.find((participantConversation) => participantConversation.conversationState === 'active')
  if (participantConversation) {
    const conversation = await twilioExecute(context, (client) =>
      client.conversations.v1.conversations(participantConversation.conversationSid).fetch()
    )

    if (conversation.status) {
      return conversation.data;
    }
  }

  return false;
}

const openAChatTask = async (
  context,
  To,
  customerName,
  From,
  WorkerConversationIdentity, // Worker identity
  channel,
  hubspotContact,
  hubspot_contact_id,
  hubspot_deal_id,
  routingProperties
) => {

  const conversation = await getActiveConversation(context, To);

  // Theres already an active conversation
  if (conversation) {
    const participants = await twilioExecute(context, (client) =>
      conversation.participants().list()
    )

    // If more than one participant
    if (participants.success && participants.data.length > 1) {
      // Check if current agent (Token) is part of this conversation
      const agent = participants.data.find((participant) => participant.identity === WorkerConversationIdentity)
      if (!agent) { // Not the current agent
        return {
          conversationSid: conversation.sid,
          success: false,
          errorMessage: 'ALREADY_ACTIVE_CONVERSATION_WITH_ANOTHER_AGENT'
        };
      } else { // Conversation is linked to current agent, cant start a new one
        return {
          conversationSid: conversation.sid,
          success: false,
          errorMessage: 'ALREADY_ACTIVE_CONVERSATION_WITH_AGENT'
        };
      }
    } else {
      // Orphan conversation. ...notify
      return {
        conversationSid: conversation.sid,
        success: false,
        errorMessage: 'ALREADY_ACTIVE_CONVERSATION_WITHOUT_AGENT'
      };

      // @todo Should route the conversation to current agent
      /* BAD PRACTICE
      await client.conversations.v1.conversations(conversation.sid).participants.create({
          identity: WorkerConversationIdentity
      })
      conversationSid = conversation.sid
      */
    }
  }

  // Create an interaction
  const interaction = await twilioExecute(context, (client) =>
    client.flexApi.v1.interaction.create({
      channel: {
        type: channel,
        initiated_by: "agent",
        participants: [
          {
            address: To,
            proxy_address: From,
          },
        ],
        xTwilioWebhookEnabled: true,
        friendlyName: `Outbound: ${hubspot_contact_id}`,
      },
      routing: {
        properties: {
          ...routingProperties,
          task_channel_unique_name: channel === 'whatsapp' ? 'chat' : channel,
          attributes: {
            //conversationSid, // Disabled due that agent is not added as a participant
            direction: "outbound",
            channelType: channel,
            xTwilioWebhookEnabled: true,

            from: To, // This is the contact number?
            name: customerName,

            hubspotContact,
            hubspot_contact_id,
            hubspot_deal_id,

            twilioNumber: From,

            customerName: customerName,
            customerAddress: To,
            customers: {
              external_id: hubspotContact.hs_object_id || null,
              phone: hubspotContact.phone || null,
              email: hubspotContact.email || null
            }
          },
        },
      }
    })
  )

  // At this point the interaction should have created a new conversation if there is no active conversation
  // Or it should have added the agent to the active conversation
  if (!interaction.success) {
    return {
      conversationSid: conversation.sid,
      success: false,
      errorMessage: 'API_ERROR'
    };
  }

  const taskAttributes = JSON.parse(interaction.data.routing.properties.attributes);

  return {
    success: true,
    interactionSid: interaction.data.sid,
    conversationSid: taskAttributes.conversationSid
  };
};

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const {
    To,
    customerName,
    hubspotContact,
    hubspot_contact_id,
    hubspot_deal_id,
    Token
  } = event;

  const channel = To.includes('whatsapp') ? 'whatsapp' : 'sms';
  const From = channel === 'whatsapp' ? `whatsapp:${context.TWILIO_WA_PHONE_NUMBER}` : context.TWILIO_PHONE_NUMBER;

  try {
    let sendResponse = null;

    const {
      worker_sid,
      identity
    } = event.TokenResult;


    // create task and open chat window for user
    sendResponse = await openAChatTask(
      context,
      To,
      customerName,
      From,
      identity,
      channel,
      hubspotContact,
      hubspot_contact_id,
      hubspot_deal_id,
      {
        workspace_sid: context.TWILIO_FLEX_WORKSPACE_SID,
        workflow_sid: context.TASK_ROUTER_WORKFLOW_SID,
        queue_sid: context.FLEX_APP_OUTBOUND_WHATSAPP_QUEUE_SID,
        worker_sid: worker_sid // Perhaps knownWorker
      }
    );

    response.setBody(sendResponse);
    // Return a success response using the callback function.
  } catch (err) {
    return handleError(err);
  }

  return callback(null, response);
});