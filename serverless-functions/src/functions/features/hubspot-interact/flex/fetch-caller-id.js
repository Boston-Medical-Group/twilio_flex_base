const axios = require('axios');
const { prepareFlexFunction, executeWithRetry } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const utils = require(Runtime.getFunctions()['common/helpers/customs-helper'].path);

const requiredParameters = [
  { key: 'contentSid', purpose: 'Content SID' },
  { key: 'contentVariables', purpose: 'Variables object' },
  { key: 'conversationSid', purpose: 'Conversation SID' },
  { key: 'identity', purpose: 'Author display name' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const PAGE_SIZE = 150

    let callerId, count = 0;
    let queueSid = event.queueSid ?? undefined;

    const country = utils.countryToIso2(context.COUNTRY);
    const countryResponse = await executeWithRetry(context, async () => {
      const response = await axios({
        url: `${context.FLEXMANAGER_API_URL}/countries/${context.COUNTRY}`,
        method: "GET",
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${context.FLEXMANAGER_API_KEY}`
        }
      });

      return response.data;
    });

    if (countryResponse.success) {
      callerId = null;
      response.setBody({});
      return callback(null, response);
    }

    const defaultQueue = countryResponse.data.attributes.defaultQueue
    const prefix = countryResponse.data.attributes.prefix
    const useAreaDDI = countryResponse.data.attributes.useAreaCode
    const queryQueue = event.queueSid || defaultQueue
    let callerIds;

    if (useAreaDDI && event.toNumber) {
      const toNumberWOPrefix = event.toNumber.replace(prefix, '')

      for (let i = 3; i > 1; i--) {
        let probableAreaCode = toNumberWOPrefix.substring(0, i);
        let areaCodeQueue = utils.areaCodeQueue(country, probableAreaCode);

        if (areaCodeQueue) {
          callerIds = await executeWithRetry(context, async () => {
            const callerIdsResponse = await axios({
              url: `${context.FLEXMANAGER_API_URL}/caller-id-pools?filter[country]=${context.COUNTRY}&filter[queue]=${areaCodeQueue}&page[size]=${PAGE_SIZE}`,
              method: "GET",
              headers: {
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${context.FLEXMANAGER_API_KEY}`
              }
            });

            return callerIdsResponse.data;
          });

          if (callerIds.success && callerIds.data.meta.page.total) {
            count = await utils.getRRCounter(probableAreaCode, context) || 0;
            break;
          }
        }
      }
    }

    if (callerIds === null || !callerIds.data.meta.page.total) {
      callerIds = await executeWithRetry(context, async () => {
        const newCalleriIdsResponse = await axios({
          url: `${context.FLEXMANAGER_API_URL}/caller-id-pools?filter[country]=${context.COUNTRY}&filter[queue]=${queryQueue}&page[size]=${PAGE_SIZE}`,
          method: "GET",
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'Authorization': `Bearer ${context.FLEXMANAGER_API_KEY}`
          }
        });

        return newCalleriIdsResponse.data;
      });

      count = await utils.getRRCounter(queryQueue, context) || 0;
    }

    if (callerIds.success) {
      if (count >= callerIds.data.meta.page.total) {
        count = 0;
      }
      callerId = callerIds.data.at(count)?.attributes.ddi || null;
      count++

      utils.updateRRCounter(queueSid, count, context)
      if (callerId === null) {
        console.log(`CALLERID NULL FOR: ${queueSid}`)
      }
    } else {
      callerId = null;
    }

    response.setBody({ callerId });
    return callback(null, response);
  } catch (err) {
    return handleError(err);
  }
})
