import React, { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Manager, templates, Actions } from "@twilio/flex-ui";
import { Box, Heading, Select, Option, Stack, Label, Button } from '@twilio-paste/core';
import { fullName } from '../../utils/helpers';
import { reduxNamespace } from '../../../../utils/state';
import { AppState } from '../../../../types/manager';
import { StringTemplates } from '../../flex-hooks/strings';

type Props = {
  sendHandler: (phone: string) => Promise<void>
  interactionHandler: () => void
}

type PhonesList = Array<{
  phone: string
  obfuscated: string
}>

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const CallCard = ({ sendHandler, interactionHandler }: Props) => {
  const workerClient = Manager.getInstance().workerClient;

  const [actionDisabled, setActionDisabled] = useState(workerClient ? !workerClient.activity.available : true);
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false)
  const [doNotCall, setDoNotCall] = useState(true);
  const [phonesList, setPhonesList] = useState<PhonesList>([]);

  const { contact } = useSelector((state: AppState) => state[reduxNamespace].hubspotInteract);

  const afterSetActivityListener = useCallback((payload) => {
    if (payload.activityAvailable) {
      setActionDisabled(false)
    } else {
      setActionDisabled(true)
    }
  }, []);

  /** DO NOT CALL */
  useEffect(() => {
    const parseBool = (val: string | boolean) => val === true || val === "true"
    let dnc = typeof contact.donotcall === 'string' ? parseBool(contact.donotcall.toLowerCase()) : contact.donotcall;
    if (dnc) {
      setDoNotCall(true)
    } else {
      setDoNotCall(false)
    }
  }, [contact])

  useEffect(() => {
    setSelectedPhone((contact.hs_whatsapp_phone_number ?? contact.phone) as string);
  }, []);

  useEffect(() => {
    Actions.addListener("afterSetActivity", afterSetActivityListener);

    return () => {
      Actions.removeListener("afterSetActivity", afterSetActivityListener)
    }
  }, [afterSetActivityListener])

  const handlePhoneChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhone(event.target.value);
  }, [])

  const initiateSendHandler = async () => {
    setIsLoading(true)

    await sendHandler(selectedPhone).finally(() => {
      interactionHandler()
      setIsLoading(false)
    });
  }

  useEffect(() => {
    //console.log('CONTACT WAS UPDATED OUTSIDE', contact)
  }, [sendHandler])

  useEffect(() => {
    const obfuscate = (phone: string) => {
      const firstPart = phone.slice(0, -4)
      const lastDigits = phone.slice(-4)

      return firstPart.replace(/\d/g, '*') + lastDigits
    }

    let phones: Array<{ phone: string, obfuscated: string }> = []
    const injectPhone = (search: string) => {
      if (phones.findIndex((phone) => phone.phone === search) === -1) {
        phones.push({
          phone: search as string,
          obfuscated: obfuscate(search as string)
        })
      }
    }

    if (contact.hs_whatsapp_phone_number) {
      injectPhone(contact.hs_whatsapp_phone_number)
    }

    if (contact.phone) {
      injectPhone(contact.phone)
    }

    setPhonesList(phones)
  }, [contact])

  return (
    <>
      <Box paddingTop="space60" marginX="space60">
        <Heading as="h4" variant="heading40">{templates[StringTemplates.HIStartConversationWith]()} {fullName(contact)}</Heading>
        <Box justifyContent="center" alignItems="center" rowGap="space10" marginBottom="space80">
          <Label htmlFor="to">{templates[StringTemplates.HISelectWhatsAppAddress]()}</Label>
          <Select id="to" value={selectedPhone ?? phonesList.at(0)?.phone} onChange={handlePhoneChange}>
            {phonesList.map((phone) => (
              <Option value={phone.phone} key={phone.phone}>{phone.obfuscated}</Option>
            ))}
          </Select>
        </Box>
        <Stack orientation="horizontal" spacing="space30">
          <Button loading={isLoading} variant="primary" title={doNotCall ? templates[StringTemplates.HIDoNotWhatsApp]() : (actionDisabled ? templates[StringTemplates.HIChangeStatusForWhatsApp]() : templates[StringTemplates.HIStartConversation]())} disabled={actionDisabled || doNotCall} onClick={initiateSendHandler}>{templates[StringTemplates.HIStartConversation]()}</Button>
        </Stack>
      </Box>
    </>
  );
};

export default CallCard;
