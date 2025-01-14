const HubspotClient = require('@hubspot/api-client').Client;

const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);

const requiredParameters = [
    { key: 'from', purpose: 'user contact identifier number (phone)' },
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    let result = {
        crmid: '',
        firstname: '',
        lastname: '',
        fullname: '',
        lifecyclestage: 'lead',
        leadorpatient: 'lead',
        tf_default_queue: '',
        tf_default_workflow: ''
    };
    let from = event.from;

    if (event.from === undefined) {
        return handleError('from is required');
    }

    //if the string from contains a whatsapp prefix we need to remove it
    from = from.replace(/\D/g, '');
    from = `+${from}`;
    let fromWithoutPrefix = removePrefix(from, ['+593', '+521', '+52', '+34', '+1', '+51', '+54', '+56', '+57', '+55'])

    let filterGroups = [
        {
            filters: [
                {
                    propertyName: 'phone',
                    operator: 'EQ',
                    value: from
                }
            ]
        },
        {
            filters: [
                {
                    propertyName: 'phone',
                    operator: 'CONTAINS_TOKEN',
                    value: `*${fromWithoutPrefix}`
                }
            ]
        }
    ]

    // Fix para brasil
    if (from.startsWith('+55')) {
        let tmpPhone = from.replace('+55', '');
        let prefix = tmpPhone.slice(0, 2);
        let validPrefixes = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34',
            '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65',
            '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92',
            '93', '94', '95', '96', '97', '98', '99'];
        if (validPrefixes.includes(prefix)) {
            let tmpPhoneWithoutPrefix = tmpPhone.slice(2);
            if (tmpPhoneWithoutPrefix.length === 8) {
                from = `+55${prefix}9${tmpPhoneWithoutPrefix}`
                filterGroups.push({
                    filters: [
                        {
                            propertyName: 'phone',
                            operator: 'CONTAINS_TOKEN',
                            value: `*${prefix}9${tmpPhoneWithoutPrefix}`
                        }
                    ]
                })
            } else {
                filterGroups.push({
                    filters: [
                        {
                            propertyName: 'phone',
                            operator: 'CONTAINS_TOKEN',
                            value: `*${prefix}${tmpPhoneWithoutPrefix.slice(1)}`
                        }
                    ]
                })
            }
        }
    }

    const hubspotClient = new HubspotClient({ accessToken: context.HUBSPOT_TOKEN })
    await hubspotClient.crm.contacts.searchApi.doSearch({
        //query: from,
        filterGroups,
        //@ts-ignore
        sorts: [{
            propertyName: 'phone',
            direction: 'ASCENDING'
        }],
        properties: ['firstname', 'lastname', 'lifecyclestage', 'phone', 'tf_default_workflow', 'tf_default_queue'],
        limit: 1,
        after: 0
    }).then((contacts) => {
        if (contacts.total > 0) {
            let contact = contacts.results[0];
            //the result object stores the data you need from hubspot. In this example we're returning the CRM ID, first name and last name only.
            result.crmid = `${contact.id}`; //required for screenpop
            result.firstname = `${contact.properties.firstname}`;
            result.lastname = `${contact.properties.lastname}`;
            result.fullname = `${contact.properties.firstname ?? ''} ${contact.properties.lastname ?? ''}`;
            result.lifecyclestage = `${contact.properties?.lifecyclestage ?? 'lead'}`;
            result.tf_default_queue = contact.properties?.tf_default_queue ?? '';
            result.tf_default_workflow = contact.properties?.tf_default_workflow ?? '';
            if ((result.lifecyclestage != 'lead') && (result.lifecyclestage != 'marketingqualifiedlead') && (result.lifecyclestage != 'opportunity' && (result.lifecyclestage !== 'subscriber'))) {
                result.leadorpatient = 'patient';
            }
            if (result.fullname.trim() == '') {
                result.fullname = 'Anonymous'
            }

            callback(null, result);
        } else {
            callback(null, {});
        }
    }).catch(function (error) {
        // handle error
        console.log(`Error: ${error}`);
        handleError(error);
    });
});

const removePrefix = (phone, prefixes) => {
    for (let prefix of prefixes) {
        if (phone.startsWith(prefix)) {
            // HACK para MX. No quitamos 521 si 1 es parte de los 10 digitos del telefono
            if (prefix == '+521' && phone.length < 14) {
                continue;
            }

            phone = phone.slice(prefix.length);
            break;
        }
    }
    return phone;
}