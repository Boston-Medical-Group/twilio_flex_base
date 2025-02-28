import { Manager, templates, Notifications, StateHelper } from '@twilio/flex-ui';
import { useSelector, useDispatch } from 'react-redux';
import InteractionCard from '../InteractionCard'
import { SkeletonLoader, Modal, ModalBody, ModalHeader, ModalHeading, Stack } from '@twilio-paste/core';
import { useEffect, useState, useCallback } from 'react';
import CallCard from '../InteractionCard/CallCard';
import WhatsappCard from '../InteractionCard/WhatsappCard';
import { reduxNamespace } from '../../../../utils/state';
import { AppState } from '../../../../types/manager';
import HubspotInteractService from '../../utils/serverless/HubspotInteractService';
import { setContact, setDeal } from '../../flex-hooks/reducers/HubspotInteractSlice';
import { StringTemplates } from '../../flex-hooks/strings';

type CountryMap = {
    [key: string]: string
}

const InteractionContainer = () => {
    const dispatch = useDispatch();

    const { contact, deal } = useSelector((state: AppState) => state[reduxNamespace].hubspotInteract);

    const [isLoading, setIsLoading] = useState(false)
    const [showCallCard, setShowCallCard] = useState(false)
    const [showInteractionCard, setShowInteractionCard] = useState(false)
    const [showWhatsappCard, setShowWhatsappCard] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const callHandlerCallback = useCallback((event) => {
        setIsOpen(true)
        setInteraction('call')
    }, [])

    const whatsappHandlerCallback = useCallback(async (event) => {
        if (contact) {
            const phone1 = contact?.hs_whatsapp_phone_number && contact?.hs_whatsapp_phone_number !== '' ? contact?.hs_whatsapp_phone_number : contact?.phone
            const phone2 = contact?.phone

            if (phone1 === phone2 || (phone1 !== undefined && phone1 !== '' && phone2 === undefined || phone2 === '')) {
                await sendWAHandler(phone1)
            } else {
                setIsOpen(true)
                setInteraction('whatsapp')
            }
        }
    }, [contact])

    const smsHandlerCallback = useCallback((event) => {
        sendSmsHandler(contact?.hs_whatsapp_phone_number)
    }, [])

    const sendWAHandler = useCallback(async (phone: string) => {
        await sendHandler('whatsapp', phone, contact, deal)
    }, [contact, deal]);

    const sendSmsHandler = useCallback(async (phone: string) => {
        await sendHandler('sms', phone, contact, deal)
    }, [contact, deal]);

    const sendHandler = useCallback(async (channel: string, address: string, reloadContact: any, reloadDeal: any) => {
        if (reloadContact.country) {
            const countryMap: CountryMap = {
                CO: '+57',
                PE: '+51',
                AR: '+54',
                ES: '+34',
                MX: '+52',
                EC: '+593',
                BR: '+55',
            }

            if (!address.startsWith('+') && countryMap.hasOwnProperty(reloadContact.country)) {
                const currentCode: string = countryMap[reloadContact.country];
                // if contact.phone doesn't have country code, add it
                if (!address.startsWith(currentCode)) {
                    address = `${currentCode}${address}`;
                }
            }
        }

        // @todo Enviar mensajes de hubspot con interaction 
        // @todo corregir telefono e164
        const result = await HubspotInteractService.startOutboundConversation({
            To: channel === 'whatsapp' ? `whatsapp:${address}` : address,
            customerName: `${reloadContact.firstname || ''} ${reloadContact.lastname || ''}`.trim(),
            WorkerFriendlyName: Manager.getInstance().workerClient ? Manager.getInstance().workerClient?.name : '',
            KnownAgentRoutingFlag: false,
            OpenChatFlag: true,
            hubspotContact: reloadContact,
            hubspot_contact_id: reloadContact.hs_object_id,
            hubspot_deal_id: reloadDeal?.hs_object_id ?? null
        })

        setIsOpen(false)

        const isSuccess = result.success
        if (!isSuccess) {
            const errorCode = result.errorMessage
            Notifications.showNotification(errorCode, { conversationSid: result.conversationSid });
        }
    }, [])

    useEffect(() => {
        const handleReceiveMessage = (event: any) => {
            const { data } = event;
            if (data.from === 'FLEX_SCRIPT') {
                resetContactOrDeal()
                setIsOpen(true)
                setIsLoading(true)

                if (data.actionType === 'gotoInteraction') {
                    //dispatch(actions.interactionCallCard.setIsLoading(true))
                    setInteraction('interaction')
                } else if (data.actionType === 'dial') {
                    setInteraction('call')
                }

                if (data.hasOwnProperty('contact_id')) {
                    console.info('LOADING DATA FOR CONTACT ID', data.contact_id)
                    loadContact(data.contact_id);
                } else if (data.hasOwnProperty('deal_id')) {
                    console.info('LOADING DATA FOR DEAL ID', data.deal_id)
                    loadContact(null, data.deal_id);
                }
            }
        }

        window.addEventListener("message", handleReceiveMessage);
        return () => {
            window.removeEventListener("message", handleReceiveMessage);
        }
    }, [])

    const resetContactOrDeal = () => {
        setShowCallCard(false);
        setShowInteractionCard(false);
    }

    const loadContact = useCallback(async (contactId = null, dealId = null) => {
        dispatch(setContact(undefined))
        dispatch(setDeal(undefined))

        if (!contactId && !dealId) {
            return;
        }

        setIsLoading(true)
        if (contactId) {
            HubspotInteractService.getDataByContactId({ contact_id: contactId })
                .then(data => {
                    dispatch(setContact(data.properties))
                })
                .catch(() => console.log("Error while fetching data from Hubspot"))
                .finally(() => {
                    //resetContactOrDeal()
                    setIsLoading(false)
                })
        } else if (dealId) {
            HubspotInteractService.getDataByDealId({ deal_id: dealId })
                .then((data) => {
                    dispatch(setContact(data.properties))
                    if (data.deal !== undefined && data.deal !== null) {
                        dispatch(setDeal(data.deal.properties))
                    }
                })
                .catch(() => console.log("Error while fetching data from Hubspot"))
                .finally(() => {
                    setIsLoading(false)
                });
        }
    }, [contact, deal])

    const setInteraction = useCallback((type: string) => {
        if (type === 'call') {
            setShowCallCard(true)
            setShowInteractionCard(false)
            setShowWhatsappCard(false)
        } else if (type === 'interaction') {
            setShowCallCard(false)
            setShowInteractionCard(true)
            setShowWhatsappCard(false)
        } else if (type === 'whatsapp') {
            setShowCallCard(false)
            setShowInteractionCard(false)
            setShowWhatsappCard(true)
        }
    }, [])

    return (
        <>
            <Modal isOpen={isOpen} size="default" onDismiss={() => setIsOpen(false)} ariaLabelledby='interaction-modal'>
                <ModalHeader>
                    <ModalHeading>{templates[StringTemplates.HIBostonMedicalElexial]()}</ModalHeading>
                </ModalHeader>

                <ModalBody>
                    <Stack orientation="vertical" spacing="space60">

                        {isLoading && (
                            <SkeletonLoader height="150px" />
                        )}

                        {!isLoading && showCallCard && (
                            <CallCard interactionHandler={() => setIsOpen(false)} />
                        )}

                        {!isLoading && showWhatsappCard && (
                            <WhatsappCard sendHandler={sendWAHandler} interactionHandler={() => setIsOpen(false)} />
                        )}

                        {!isLoading && showInteractionCard && (
                            <InteractionCard
                                callHandler={callHandlerCallback}
                                smsHandler={smsHandlerCallback}
                                whatsappHandler={whatsappHandlerCallback}
                                interactionHandler={() => setIsOpen(false)} />
                        )}
                    </Stack>
                </ModalBody>
            </Modal>

        </>
    );

}

export default InteractionContainer