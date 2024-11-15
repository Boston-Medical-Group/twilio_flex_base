const HubspotClient = require('@hubspot/api-client').Client;

const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [];

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const {
      hs_bject_id,
      hs_timestamp,
      hs_call_body,
      hs_call_callee_object_type_id,
      hs_call_direction,
      hs_call_disposition,
      hs_call_duration,
      hs_call_from_number,
      hs_call_to_number,
      hs_call_recording_url,
      hs_call_status,
      hubspot_owner_id,
      hubspot_deal_id,
      hs_call_title,
    } = event;

    let hs_call_callee_object_id = event.hs_call_callee_object_id;

    let recordingUrl = hs_call_recording_url;
    if (!hs_call_recording_url || hs_call_recording_url === null) {
      console.log('No recording URL for', hs_call_callee_object_id, hs_call_from_number, hs_call_to_number);
      if (event.taskAttributes && event.taskAttributes.conference?.sid) {
        await delay(2000);

        const client = context.getTwilioClient();
        await client.recordings
          .list({
            conferenceSid: event.taskAttributes.conference?.sid,
          })
          .then((recordings) => {
            console.log('Fetched recording from conference', event.taskAttributes.conference?.sid);
            recordingUrl = recordings[0].mediaUrl ?? '';
          });
      }
    }

    const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN });
    if (!hs_call_callee_object_id) {
      const fixedNumberOrig = hs_call_direction === 'INBOUND' ? hs_call_from_number : hs_call_to_number;
      // Remove dash, spaces and parenthesis from the number
      const fixedNumber = fixedNumberOrig.replace(/[- )(]/g, '');

      // FIX: si se marca desde dialpad, no tenemos CRMID así que buscamos el telefono en Hubspot
      const seachedCRMID = await hubspotClient.crm.contacts.searchApi
        .doSearch({
          query: fixedNumber,
          filterGroups: [],
          limit: 1,
          after: 0,
          sorts: ['phone'],
          properties: ['hs_object_id'],
        })
        .then((contacts) => {
          if (contacts.results.length > 0) {
            return contacts.results[0].properties.hs_object_id;
          }

          return false;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });

      if (typeof seachedCRMID === 'string') {
        hs_call_callee_object_id = seachedCRMID;
      } else {
        // SI no tenemos CRMID, algo anda mal porque este se crea en inbounds
        // y no debería hacer log a contactos inexistentes en HS
        console.log('No CRMID found for', fixedNumberOrig);
        throw new Error('CRMID Inválido');
      }
    }

    const toHubspot = {
      properties: {
        hs_call_title,
        hs_call_callee_object_id,
        hs_timestamp,
        hs_call_body,
        hs_call_direction,
        hs_call_duration,
        hs_call_from_number,
        hs_call_to_number,
        hs_call_recording_url: recordingUrl,
        hs_call_status,
        hs_call_disposition,
        hubspot_owner_id,
      },
      associations: [
        {
          to: {
            id: hs_call_callee_object_id,
          },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 194,
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
            associationTypeId: 206,
          },
        ],
      });
    }

    const call = await hubspotClient.crm.objects.calls.basicApi
      .create(toHubspot)
      .then((c) => c)
      .catch((err) => {
        console.error(err);
        return {};
      });

    response.setBody(call);

    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});
