import React, { useState, useEffect, useCallback } from 'react';
import { Actions, ITask, useFlexSelector, templates } from '@twilio/flex-ui';
import { Box } from '@twilio-paste/core/box';
import { Tooltip } from '@twilio-paste/tooltip';
import { SkeletonLoader } from '@twilio-paste/core/skeleton-loader';
import { ChatIcon } from '@twilio-paste/icons/esm/ChatIcon';
import { ErrorIcon } from '@twilio-paste/icons/esm/ErrorIcon';
import { WarningIcon } from '@twilio-paste/icons/esm/WarningIcon';
import { CloseIcon } from '@twilio-paste/icons/esm/CloseIcon';
import { Button } from '@twilio-paste/core/button';
import * as Flex from "@twilio/flex-ui";
import { ContentApprovalInstance } from '../../types/WhatsAppTemplates';
import { Card, Heading, Input, Label, Stack, Badge } from '@twilio-paste/core';
import { DescriptionList, DescriptionListDetails, DescriptionListSet, DescriptionListTerm } from '@twilio-paste/description-list';
import { Modal, ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalFooterActions, Paragraph } from '@twilio-paste/core';
import WhatsAppTemplate from './ContentType';
import HubspotInteractService from '../../utils/serverless/HubspotInteractService';
import { StringTemplates } from '../../flex-hooks/strings';

interface WhatsAppTemplatesDropdownProps {
  task: ITask;
}

const WhatsAppTemplatesDropdown: React.FunctionComponent<WhatsAppTemplatesDropdownProps> = ({ task }) => {
  const [templateList, setTemplateList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [search, setSearch] = useState("");
  const [messageErrors, setMessageErrors] = useState([]);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);
  const conversationSid = task.attributes.conversationSid ?? task.attributes.channelSid;
  const inputState = useFlexSelector((state) => state.flex.chat.conversationInput[conversationSid]?.inputText);

  const [selectedTemplate, setSelectedTemplate] = useState<ContentApprovalInstance>();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenErrors = () => {
    setMessageErrors([])
    setIsLoadingErrors(true)
    setIsErrorsOpen(true)

    HubspotInteractService.getMessageErrors({
      conversationSid: task.attributes.conversationSid
    })
      .then((data) => {
        setMessageErrors(data)
        setIsLoadingErrors(false)
      })
  };
  const handleCloseErrors = () => {
    setMessageErrors([])
    setIsErrorsOpen(false)
  };

  /**
   * Use the selected template
   */
  const onClickUse = (contentApproval: ContentApprovalInstance) => {
    if (!conversationSid) return;
    let currentInput = inputState;
    if (currentInput.length > 0 && currentInput.charAt(currentInput.length - 1) !== ' ') {
      currentInput += ' ';
    }
    //currentInput += text;

    Actions.invokeAction('SetInputText', {
      body: currentInput,
      conversationSid,
      selectionStart: currentInput.length,
      selectionEnd: currentInput.length,
    });
  };

  const errorMessageString = (code: number) => {
    if (code === 63016) {
      return templates[StringTemplates.HIOutOf24HourWindow]()
    } else if (code === 63051) {
      return templates[StringTemplates.HIWhatsAppBlocked]()
    } else if (code === 63032) {
      return templates[StringTemplates.HIServiceLimitationWhatsApp]()
    } else if (code === 63024) {
      return templates[StringTemplates.HIInvalidDestination]()
    } else if (code === 21610) {
      return templates[StringTemplates.HIUserOptedOut]()
    } else {
      return templates[StringTemplates.HIUnhandledError]()
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setTemplateList([]);
    setError(false);

    HubspotInteractService.getContents({
      prefix: 'ui_'
    })
      .then((data) => { setTemplateList(data) })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const closeSelectedTemplateHandler = useCallback((close: boolean): void => {
    setSelectedTemplate(undefined)
    if (close) {
      handleCloseModal()
    }

    return
  }, [])

  const setTemplate = (content: ContentApprovalInstance) => {
    setSelectedTemplate(content)
  }

  return (
    <>
      <Box paddingLeft='space30' paddingTop='space20'>
        {isLoading && <SkeletonLoader />}
        {Boolean(templateList) && !isLoading && (
          <>
            <Button variant="secondary" size="circle" onClick={handleOpenModal}>
              <ChatIcon decorative={false} title={templates[StringTemplates.HITemplates]()} />
            </Button>
            <WhatsAppTemplate item={selectedTemplate as ContentApprovalInstance} isOpen={selectedTemplate !== undefined} closeHandler={closeSelectedTemplateHandler} />
            <Modal ariaLabelledby="whatsapp-templates-modal" isOpen={isModalOpen} onDismiss={handleCloseModal} size="wide">
              <ModalHeader>
                <ModalHeading as="h3" id="whatsapp-templates-modal">{templates[StringTemplates.HISelectTemplate]()}</ModalHeading>
              </ModalHeader>
              <ModalBody>

                <Box marginBottom='space30'>
                  <Label htmlFor="search">{templates[StringTemplates.HIFilterTemplates]()}</Label>
                  <Input id="search" name="search" type="email" value={search} placeholder={templates[StringTemplates.HIFilter]()} onChange={(event) => setSearch(event.target.value)}
                    insertAfter={
                      <Button variant="link" onClick={() => setSearch("")}>
                        <CloseIcon decorative={false} size="sizeIcon20" title={templates[StringTemplates.HIClear]()} />
                      </Button>
                    }
                  />
                </Box>
                <Stack orientation="vertical" spacing="space60">
                  {
                    templateList.map((item: ContentApprovalInstance, index) => {
                      if (search.length < 3 || (search.length >= 3 && item.friendlyName.includes(search))) {
                        return (
                          <Card key={index} padding='space60'>
                            <Heading as="h3" variant="heading30">{item.friendlyName}</Heading>
                            <Box display="flex" columnGap="space40" marginBottom={'space20'}>
                              <Badge as="span" variant="decorative10">{item.approvalRequests.category}</Badge>
                              <Badge as="span" variant="decorative40">{item.language}</Badge>
                            </Box>
                            <Paragraph>{item.types[item.approvalRequests.content_type].body}</Paragraph>
                            <Button variant="primary" type='button'
                              onClick={() => {
                                setTemplate(item)
                                //onClickUse(item);
                                //handleCloseModal();
                              }}>{templates[StringTemplates.HISelect]()}</Button>
                          </Card>
                        )
                      }
                    })
                  }
                </Stack>
              </ModalBody>
              <ModalFooter>
                <ModalFooterActions>
                  <Button variant="secondary" onClick={handleCloseModal}>{templates[StringTemplates.HICancel]()}</Button>
                </ModalFooterActions>
              </ModalFooter>
            </Modal>
          </>
        )}
      </Box>
      <Box paddingLeft='space30' paddingTop='space20'>
        <Button variant="secondary" size="circle" onClick={handleOpenErrors}>
          <WarningIcon decorative={false} title="Ver errores" />
        </Button>
        <Modal ariaLabelledby="message-errors-modal" isOpen={isErrorsOpen} onDismiss={handleCloseErrors} size="default">
          <ModalHeader>
            <ModalHeading as="h3" id="message-errors-modal">{templates[StringTemplates.HILatestErrors]()}</ModalHeading>
          </ModalHeader>
          <ModalBody>

            {isErrorsOpen && isLoadingErrors && (<SkeletonLoader />)}
            {!isLoadingErrors && messageErrors.length === 0 && (
              <Paragraph>{templates[StringTemplates.HINoRecentErrors]()}</Paragraph>
            )}
            {!isLoadingErrors && messageErrors.length > 0 && (
              <DescriptionList>
                {messageErrors.map((error: { date: Date, code: number }, index) => {
                  return (
                    <DescriptionListSet key={index}>
                      <DescriptionListTerm>{error.date}</DescriptionListTerm>
                      <DescriptionListDetails>
                        <strong>{error.code}</strong>: {errorMessageString(error.code)}

                      </DescriptionListDetails>
                    </DescriptionListSet>
                  )
                })}
              </DescriptionList>
            )}

          </ModalBody>
        </Modal>
        {error && (
          <Tooltip text={templates[StringTemplates.HIErrorFetchingTemplates]()}>
            <Button variant={'destructive_icon'}>
              <ErrorIcon decorative />
            </Button>
          </Tooltip>
        )}
      </Box>
    </>
  );
};

export default WhatsAppTemplatesDropdown;