import React, { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Manager, templates, Actions } from "@twilio/flex-ui";
import { Box, Heading, Select, Option, Stack, Label, Button } from '@twilio-paste/core';
import { CallIcon } from '@twilio-paste/icons/esm/CallIcon';
import { Workspace, TaskQueue } from "twilio-taskrouter";
import { StringTemplates } from '../../flex-hooks/strings';
import { fullName } from '../../utils/helpers';
import { reduxNamespace } from '../../../../utils/state';
import { AppState } from '../../../../types/manager';

const { FLEX_APP_OUTBOUND_WORKFLOW_SID, FLEX_APP_OUTBOUND_QUEUE_SID } = process.env;

type Props = {
  interactionHandler: () => void
}

type PhonesList = Array<{
  phone: string
  obfuscated: string
}>

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const CallCard = ({ interactionHandler }: Props) => {
  const workerClient = Manager.getInstance().workerClient;

  const [actionDisabled, setActionDisabled] = useState(workerClient ? !workerClient.activity.available : true);
  const [queues, setQueues] = useState<Array<TaskQueue>>([]);
  const [defaultQueue] = useState<string>(workerClient?.attributes?.last_used_queue ?? FLEX_APP_OUTBOUND_QUEUE_SID as string);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false)
  const [doNotCall, setDoNotCall] = useState(true);
  const [phonesList, setPhonesList] = useState<PhonesList>([]);

  const { contact, deal } = useSelector((state: AppState) => state[reduxNamespace].hubspotInteract);

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
      //console.log('DO NOT CALL THIS CONTACT')
    } else {
      setDoNotCall(false)
    }
  }, [contact])

  useEffect(() => {
    setSelectedQueue(defaultQueue);
    setSelectedPhone(contact.phone as string);
    const workspaceClient = Manager.getInstance().workspaceClient as Workspace
    workspaceClient.fetchTaskQueues()
      .then((queues) => {
        let taskQueues: Array<TaskQueue> = [];
        queues.forEach((value) => taskQueues.push(value))
        setQueues(taskQueues)
      })
  }, []);

  useEffect(() => {
    Actions.addListener("afterSetActivity", afterSetActivityListener);

    return () => {
      Actions.removeListener("afterSetActivity", afterSetActivityListener)
    }
  }, [afterSetActivityListener])

  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQueue(event.target.value);
  }, [])

  const handlePhoneChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhone(event.target.value);
  }, [])

  const initiateCallHandler = useCallback(async () => {
    setIsLoading(true)
    const workerAttributes = workerClient?.attributes
    if (workerAttributes) {
      workerAttributes.last_used_queue = selectedQueue
      await workerClient.setAttributes(workerAttributes)
    }

    Actions.invokeAction("StartOutboundCall", {
      destination: selectedPhone,
      queueSid: selectedQueue,
      taskAttributes: {
        customerName: `${contact.firstname || ''} ${contact?.lastname || ''}`.trim(),
        name: `${contact.firstname || ''} ${contact?.lastname || ''}`.trim(),
        hubspot_contact_id: contact.hs_object_id,
        hubspot_deal_id: deal?.hs_object_id,
        customers: {
          external_id: contact.hs_object_id,
          phone: contact.phone, // El customer sigue teniendo el telefono de su cuenta pero el destino puede ser un telefono secundario
          email: contact.email
        }
      }
    }).finally(() => {
      interactionHandler()
      setIsLoading(false)
    });
  }, [selectedQueue, selectedPhone]);

  useEffect(() => {
    const obfuscate = (phone: string) => {
      const firstPart = phone.slice(0, -4)
      const lastDigits = phone.slice(-4)

      return firstPart.replace(/\d/g, '*') + lastDigits
    }

    let phones = []
    if (contact.phone) {
      phones.push({
        phone: contact.phone as string,
        obfuscated: obfuscate(contact.phone as string)
      })

      if (contact.numero_de_telefono_adicional_ || contact.numero_de_telefono_adicional) {
        const secondaryPhone = contact.numero_de_telefono_adicional_ ?? contact.numero_de_telefono_adicional
        if (phones.findIndex((phone) => phone.phone === secondaryPhone) === -1) {
          phones.push({
            phone: secondaryPhone as string,
            obfuscated: obfuscate(secondaryPhone as string)
          })
        }
      }

      setPhonesList(phones)
    }
  }, [contact])

  return (
    <>
      <Box paddingTop="space60" marginX="space60">
        <Heading as="h4" variant="heading40">{templates[StringTemplates.HICall]()} {fullName(contact)}</Heading>
        <Box justifyContent="center" alignItems="center" rowGap="space10" marginBottom="space80">
          <Label htmlFor="queue">{templates[StringTemplates.HISelectQueue]()}</Label>
          <Select id="queue" value={selectedQueue ?? queues.at(0)?.queueSid} onChange={handleSelectChange}>
            {queues.map((queue: TaskQueue) => (
              <Option value={queue.queueSid} key={queue.queueSid}>{queue.queueName}</Option>
            ))}
          </Select>
        </Box>

        <Box justifyContent="center" alignItems="center" rowGap="space10" marginBottom="space80">
          <Label htmlFor="to">{templates[StringTemplates.HISelectNumberToCall]()}</Label>
          <Select id="to" value={selectedPhone ?? phonesList.at(0)?.phone} onChange={handlePhoneChange}>
            {phonesList.map((phone) => (
              <Option value={phone.phone} key={phone.phone}>{phone.obfuscated}</Option>
            ))}
          </Select>
        </Box>
        <Stack orientation="horizontal" spacing="space30">
          <Button loading={isLoading} variant="primary" title={doNotCall ? templates[StringTemplates.HIDoNotCall]() : (actionDisabled ? templates[StringTemplates.HIChangeStatusForCall]() : templates[StringTemplates.HIMakeCall]())} disabled={actionDisabled || doNotCall} onClick={() => initiateCallHandler()}><CallIcon decorative={true} /> {templates[StringTemplates.HIStartCall]()}</Button>
        </Stack>
      </Box>
    </>
  );
};

export default CallCard;
