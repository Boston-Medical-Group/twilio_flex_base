const HubspotClient = require('@hubspot/api-client').Client;

const { prepareFlexFunction } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);

const requiredParameters = [];

const fetchByContact = async (contact_id, context, deal) => {
  const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN })
  const contact = await hubspotClient.crm.contacts.basicApi.getById(
    contact_id,
    [
      'email',
      'firstname',
      'lastname',
      'phone',
      'hs_object_id',
      'reservar_cita',
      'country',
      'donotcall',
      'numero_de_telefono_adicional',
      'numero_de_telefono_adicional_',
      'whatsappoptout',
      'hs_whatsapp_phone_number'
    ],
  )
    .then((hubpostContact) => hubpostContact)
    .catch((error) => {
      if (error.status === 404) {
        return null
      }

      console.error(error)
      throw new Error('Error while retrieving data from hubspot (CONTACT)');
    })

  if (contact === null && (deal === undefined || deal === null)) {
    return null
  }

  return {
    ...contact,
    deal: deal ?? null
  }
}

const fetchByDeal = async (deal_id, context) => {
  const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN })
  const deal = await hubspotClient.crm.deals.basicApi.getById(
    deal_id,
    ['dealname', 'dealstage', 'hs_object_id', 'reservar_cita'],
    [],
    ['contact']
  ).then((hubspotDeal) => hubspotDeal)
    .catch((error) => {
      throw new Error('Error while retrieving data from hubspot (DEAL)');
    })

  const contacts = deal.associations?.contacts ? deal.associations.contacts.results : [];

  if (contacts.length > 0) {
    const contactAssociation = contacts[0];
    return await fetchByContact(contactAssociation.id, context, deal);
  } else {
    throw new Error('Error while retrieving data from hubspot (DEALCONTACT)');
  }
}

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
