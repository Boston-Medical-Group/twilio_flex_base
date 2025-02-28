import React, { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Manager, templates, Notifications, Actions } from "@twilio/flex-ui";
import { CustomizationProvider } from '@twilio-paste/core/customization';
import { Box, Heading, Paragraph, Button } from '@twilio-paste/core';
import { SMSIcon } from '@twilio-paste/icons/esm/SMSIcon';
import { CallIcon } from '@twilio-paste/icons/esm/CallIcon';
import { CalendarIcon } from "@twilio-paste/icons/esm/CalendarIcon";
import SendSmsModal from './SendSmsModal';
import SendWAModal from './SendWAModal';
import { HubspotContact } from '../../types/HubspotInteract';
import { fullName } from '../../utils/helpers';
import { StringTemplates } from '../../flex-hooks/strings';
import { reduxNamespace } from '../../../../utils/state';
import { AppState } from '../../../../types/manager';
import { hubspotCalendarUrlField } from '../../config';
import { HubspotInteractNotification } from '../../flex-hooks/notifications/HubspotInteract';


type Props = {
  callHandler: (event: any) => void
  smsHandler: (event: any) => void
  whatsappHandler: (event: any) => void
  interactionHandler: any
}

const disabledButtonStyles = {
  ':disabled': {
    backgroundColor: 'colorBackgroundStrong',
    borderColor: 'colorBorder',
    boxShadow: 'none',
  },
  ':hover:disabled': {
    color: 'colorTextInverse',
    backgroundColor: 'colorBackgroundStrong',
    borderColor: 'colorBorder',
    boxShadow: 'none',
  }
}

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const InteractionCard = ({ callHandler, smsHandler, whatsappHandler, interactionHandler }: Props) => {
  const workerClient = Manager.getInstance().workerClient;
  const [actionDisabled, setActionDisabled] = useState(workerClient ? !workerClient.activity.available : true);
  const [selectedSmsContact, setSelectedSmsContact] = useState<HubspotContact>();
  const [selectedWAContact, setSelectedWAContact] = useState<HubspotContact>();
  const [doNotCall, setDoNotCall] = useState(true);
  const [doNotWhatsapp, setDoNotWhatsapp] = useState(true);

  const { contact, deal } = useSelector((state: AppState) => state[reduxNamespace].hubspotInteract);

  const afterSetActivityListener = useCallback((payload) => {
    if (payload.activityAvailable) {
      setActionDisabled(false)
    } else {
      setActionDisabled(true)
    }
  }, []);

  /** DO NOT CALL & DO NOT WHATSAPP */
  useEffect(() => {
    const parseBool = (val: string | boolean) => val === true || val === "true"
    if (typeof contact === 'object') {
      let dnc = typeof contact.donotcall === 'string' ? parseBool(contact.donotcall.toLowerCase()) : contact.donotcall;
      setDoNotCall(dnc ? true : false)

      let dnw = typeof contact?.whatsappoptout === 'string' ? parseBool(contact?.whatsappoptout.toLowerCase()) : contact.whatsappoptout;
      setDoNotWhatsapp(dnw ? true : false)
    }

  }, [contact])

  useEffect(() => {
    Actions.addListener("afterSetActivity", afterSetActivityListener);

    return () => {
      Actions.removeListener("afterSetActivity", afterSetActivityListener)
    }
  }, [afterSetActivityListener])

  const handleCloseModel = React.useCallback(() => {
    setSelectedSmsContact(undefined);
    setSelectedWAContact(undefined);
  }, []);

  const sendCalendarHandler = useCallback(() => {
    interactionHandler()
    window.open(calendar(), '_blank');
  }, [])

  const calendar = useCallback(() => {
    if (hubspotCalendarUrlField() != undefined) {
      const myVar = hubspotCalendarUrlField();

      if (deal && typeof deal === 'object') {
        if (deal.hasOwnProperty(myVar)) {
          return deal[myVar] ?? '';
        }
      }

      return contact[myVar] ?? '';
    }

    return '';
  }, [actionDisabled])

  if (typeof contact !== 'object' || contact === null || !contact.hasOwnProperty('hs_object_id')) {
    let notification = Notifications.registeredNotifications.get(HubspotInteractNotification.ContactNotFoundOnHubpost)
    if (notification) {
      notification.content = templates[StringTemplates.HIContactNotFound]()
    }
    Notifications.showNotification(HubspotInteractNotification.ContactNotFoundOnHubpost, undefined);
    return null;
  }

  return (
    <>
      <SendSmsModal selectedContact={selectedSmsContact} dealId={deal?.hs_object_id} handleClose={handleCloseModel} />
      <SendWAModal selectedContact={selectedWAContact} dealId={deal?.hs_object_id} handleClose={handleCloseModel} />
      <Box paddingTop="space60">
        <Heading as="h4" variant="heading40">{templates[StringTemplates.HIInteractWith]()} {fullName(contact)}</Heading>
        <Paragraph>
          {templates[StringTemplates.HISelectInteractionMethod]()}
        </Paragraph>
        {doNotCall && (
          <Paragraph>
            {templates[StringTemplates.HIDoNotCall]()}
          </Paragraph>
        )}
        <Box display="flex"
          rowGap="space60"
          flexWrap="wrap"
          justifyContent="space-between"
          flexDirection="column"
          margin="auto"
          maxWidth="300px">
          <Button variant="primary"
            title={doNotCall ? templates[StringTemplates.HIDoNotCall]() : (actionDisabled ? templates[StringTemplates.HIChangeStatusForCall]() : templates[StringTemplates.HIMakeCall]())}
            disabled={actionDisabled || doNotCall}
            onClick={callHandler}><CallIcon decorative={false} title={templates[StringTemplates.HIStartCall]()} /> {templates[StringTemplates.HIStartCall]()}</Button>

          <CustomizationProvider
            elements={{
              BUTTON: {
                backgroundColor: 'colorBackgroundInverse',
                boxShadow: 'shadowBorderInverseWeakest',
                ...disabledButtonStyles,
                ':hover': {
                  color: 'colorTextPrimaryStrongest',
                  borderColor: 'colorBorderInverse',
                  boxShadow: 'shadowBorderInverseWeakest',
                },

              },
            }}
          >
            <Button variant="primary" disabled={actionDisabled} fullWidth onClick={() => smsHandler}><SMSIcon decorative={false} title={templates[StringTemplates.HISMS]()} /> {templates[StringTemplates.HISMS]()}</Button>
          </CustomizationProvider>

          <CustomizationProvider
            elements={{
              BUTTON: {
                backgroundColor: 'colorBackgroundSuccess',
                borderColor: 'colorBorderSuccess',
                boxShadow: 'none',
                ...disabledButtonStyles,
                ':hover': {
                  borderColor: 'colorBorderSuccess',
                  color: 'colorTextSuccess',
                  boxShadow: 'shadowBorderSuccessWeaker',
                }
              },
            }}
          >
            <Button variant="primary"
              fullWidth
              title={doNotWhatsapp ? templates[StringTemplates.HIDoNotCall]() : (actionDisabled ? templates[StringTemplates.HIChangeStatusForWhatsApp]() : templates[StringTemplates.HIStartWhatsAppConversation]())}
              disabled={actionDisabled || doNotWhatsapp}
              onClick={whatsappHandler}
            >{templates[StringTemplates.HIWhatsApp]()}</Button>
          </CustomizationProvider>

          {calendar() !== '' && (
            <CustomizationProvider
              elements={{
                BUTTON: {
                  backgroundColor: 'colorBackgroundWarning',
                  borderColor: 'colorBorderWarning',
                  boxShadow: 'shadowBorderWarningWeaker',
                  ...disabledButtonStyles,
                  ':hover': {
                    borderColor: 'colorBorderWarning',
                    color: 'colorTextWarning',
                    boxShadow: 'shadowBorderWarningWeaker',
                  }
                },
              }}
            >
              <Button disabled={actionDisabled} variant="primary" onClick={sendCalendarHandler} fullWidth><CalendarIcon decorative={false} title={templates[StringTemplates.HIAppointment]()} /> {templates[StringTemplates.HIAppointment]()}</Button>
            </CustomizationProvider>
          )}
        </Box>
      </Box>
    </>
  );
};

export default InteractionCard;
