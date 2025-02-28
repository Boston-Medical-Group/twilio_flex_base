import { Heading, Paragraph, Spinner, Grid, Column, Stack } from '@twilio-paste/core';
import { Alert } from '@twilio-paste/core/alert';
import { Box } from '@twilio-paste/core/box';
import { Button } from '@twilio-paste/core/button';
import { Label } from '@twilio-paste/core/label';
import { Badge } from '@twilio-paste/core/badge';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { Text } from '@twilio-paste/core/text';
import { TextArea } from '@twilio-paste/core/textarea';
import { Manager } from "@twilio/flex-ui";
import { useCallback, useEffect, useState } from "react";
import HubspotInteractService from '../../utils/serverless/HubspotInteractService'

const MODAL_ID = "smsOutboundModal";

const SendWAModal = ({ selectedContact, dealId, handleClose }) => {
  const workerClient = Manager.getInstance().workerClient;

  const [templateList, setTemplateList] = useState([]);
  const [message, setMessage] = useState();
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);
  const [loadTemplates, setLoadTemplates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState();
  const [templateError, setTemplateError] = useState();

  useEffect(() => {
    if (selectedContact) {

    }
  }, [selectedContact]);

  const onSelectTemplateHandler = async (event) => {
    event.preventDefault();

    setLoadTemplates(true);
    setIsLoadingTemplate(true);
    setTemplateList(undefined);
    setTemplateError(undefined);
    await HubspotInteractService.getTemplate({
      hubspot: {
        contact: selectedContact,
        deal: selectedContact.deal ?? {},
        hubspot_id: selectedContact.hs_object_id,
        deal_id: dealId
      }
    })
      .then((data) => { setTemplateList(data) })
      .catch(() => setTemplateError("Error while loading tempaltes"))
      .finally(() => setIsLoadingTemplate(false));
  }

  const closeModal = useCallback(() => {
    setMessage(undefined);
    setError(undefined);
    setIsProcessing(false);
    setMessageSent(false);
    handleClose();
  }, [handleClose]);

  const setTemplate = (item) => {
    setMessage(item);
    setLoadTemplates(false);
    setIsUsingTemplate(true);
  }

  const discardTemplate = (event) => {
    event.preventDefault();

    if (isUsingTemplate) {
      setIsUsingTemplate(false);
      setMessage(undefined);
    }
  }


  const onSubmitHandler = useCallback(async (event) => {
    event.preventDefault();

    setIsProcessing(true);

    if (selectedContact) {
      await HubspotInteractService.sendOutboundMessage({
        To: `whatsapp:${selectedContact.phone}`,
        customerName: `${selectedContact.firstname || ''} ${selectedContact.lastname || ''}`.trim(),
        Body: message,
        WorkerFriendlyName: workerClient ? workerClient.name : '',
        KnownAgentRoutingFlag: false,
        OpenChatFlag: true,
        hubspot_contact_id: selectedContact.hs_object_id,
        hubspot_deal_id: dealId ?? null
      })
        .then(() => setMessageSent(true))
        .catch(() => setError("Error while sending the SMS"))
        .finally(() => setIsProcessing(false));
    }



  }, [selectedContact, message]);

  if (!selectedContact) {
    return null;
  }

  if (messageSent) {
    return (
      <Modal size="wide" ariaLabelledby={MODAL_ID} isOpen onDismiss={closeModal}>
        <ModalHeader>
          <ModalHeading as="h3" id={MODAL_ID}>Send WhatsApp Message to {selectedContact.firstname} {selectedContact.lastname}</ModalHeading>
        </ModalHeader>
        <ModalBody>
          <Alert variant='neutral'>
            <Text as="p">Message successfully sent to {selectedContact.firstname} {selectedContact.lastname}.</Text>
          </Alert>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" type='button' onClick={closeModal}>Close</Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    )
  }

  if (loadTemplates && templateList) {
    //console.log('TEMPLATES', templateList);
    return (
      <Modal size="wide" ariaLabelledby={MODAL_ID} isOpen onDismiss={closeModal}>
        <ModalHeader>
          <ModalHeading as="h3" id={MODAL_ID}>Send Whatsapp Message to {selectedContact.firstname} {selectedContact.lastname}</ModalHeading>
        </ModalHeader>
        <ModalBody>
          <Heading as="h4" variant="heading40">Select the template</Heading>
          <Grid gutter="space30" equalColumnHeights rowGap="space30" columnGap="space30">
            {
              templateList.map((item, index) => {
                return (
                  <Column span={[12, 4, 4]} key={index}>
                    <Box backgroundColor="colorBackgroundPrimaryWeakest" display="flex" flexDirection="column"
                      width="100%" justifyContent="space-between" padding="space50"
                      marginBottom="space30">
                      <Box spacing='space20' rowGap='space30' display="flex" flexDirection="column">
                        <Badge as="span" variant="info" style={{ marginBottom: '10px' }}>{item.name}</Badge>
                        <Paragraph style={{ width: '100%' }}>{item.message}</Paragraph>
                      </Box>

                      <Button variant="primary" type='button' onClick={() => { setTemplate(item.message) }}>Select</Button>

                    </Box>
                  </Column>
                )
              })
            }
          </Grid>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" type='button' onClick={closeModal}>Cancel</Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    )
  } else {
    if (isLoadingTemplate) {
      return (
        <Modal size="wide" ariaLabelledby={MODAL_ID} isOpen onDismiss={closeModal}>
          <ModalHeader>
            <ModalHeading as="h3" id={MODAL_ID}>Send Whatsapp Message to {selectedContact.firstname} {selectedContact.lastname}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <Paragraph>Loading templates..</Paragraph>
            <Box display="flex" alignItems="center" justifyContent="center" >
              <Spinner size="sizeIcon100" decorative={false} title="Loading" />
            </Box>
          </ModalBody>
          <ModalFooter>
            <ModalFooterActions>
              <Button variant="secondary" type='button' onClick={closeModal}>Cancel</Button>
            </ModalFooterActions>
          </ModalFooter>
        </Modal>
      )
    }

    if (templateError) {
      return (
        <Modal size="wide" ariaLabelledby={MODAL_ID} isOpen onDismiss={closeModal}>
          <ModalHeader>
            <ModalHeading as="h3" id={MODAL_ID}>Send Whatsapp Message to {selectedContact.firstname} {selectedContact.lastname}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <Box marginBottom="space60">
              <Alert variant='error'>
                <Text as="p">{templateError}</Text>
              </Alert>
            </Box>
          </ModalBody>
          <ModalFooter>
            <ModalFooterActions>
              <Button variant="secondary" type='button' onClick={closeModal}>Cancel</Button>
            </ModalFooterActions>
          </ModalFooter>
        </Modal>
      )
    }
  }

  return (
    <Modal size="wide" ariaLabelledby={MODAL_ID} isOpen onDismiss={closeModal}>
      <ModalHeader>
        <ModalHeading as="h3" id={MODAL_ID}>Send Whatsapp Message to {selectedContact.firstname} {selectedContact.lastname}</ModalHeading>
      </ModalHeader>
      <Box as="form" onSubmit={onSubmitHandler}>
        <ModalBody>
          {
            error ? (
              <Box marginBottom="space60">
                <Alert variant='error'>
                  <Text as="p">{error}</Text>
                </Alert>
              </Box>
            ) : null
          }
          <Label htmlFor="message" required>Message</Label>
          <TextArea value={message} disabled={isUsingTemplate} id="message" name="message" required onChange={(event) => setMessage(event.target.value)} />
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            {isUsingTemplate && <Button variant="secondary" type='button' onClick={discardTemplate}>Editar plantilla</Button>}
            <Button variant="secondary" type='button' onClick={onSelectTemplateHandler}>Select template</Button>
            <Button variant="secondary" type='button' onClick={closeModal}>Cancel</Button>
            <Button variant="primary" type='submit' disabled={isProcessing}>{isProcessing ? 'Sending...' : 'Send'}</Button>
          </ModalFooterActions>
        </ModalFooter>
      </Box>
    </Modal>
  )


}

export default SendWAModal;