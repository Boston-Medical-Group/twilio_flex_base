const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const { fetchByContact, fetchByDeal } = require(Runtime.getFunctions()['common/helpers/hubspot-helper'].path);

const requiredParameters = [];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const {
      contact_id,
      deal_id
    } = event;

    let data;
    if (contact_id) { // Search by Contact ID
      data = await fetchByContact(contact_id, context);
    } else if (deal_id) { // Search by Deal ID
      data = await fetchByDeal(deal_id, context);
    } else {
      return handleError('CONTACT ID (contact_id) o DEAL ID Inválidos');
    }

    if (data === null) { // No contact found
      response.setBody({});
    } else {
      response.setBody(data);
    }

    // Return a success response using the callback function.
    return callback(null, response);
  } catch (err) {
    return handleError(err);
  }
});
