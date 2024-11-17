import React, { useEffect, useState } from 'react';
import { ITask, Manager, templates, withTaskContext } from '@twilio/flex-ui';
import gravatarUrl from 'gravatar-url';
import logger from 'utils/logger';

import {
  Box, Card, Heading, Stack, Avatar, DescriptionList, DescriptionListSet,
  DescriptionListTerm, DescriptionListDetails, Tabs, TabList, Tab, TabPanels, TabPanel, Truncate
} from '@twilio-paste/core';

import HubspotCrmService from '../../utils/HubspotCrmService';

// @ts-ignore
import { fullName } from '../../utils/helpers';

//import { Summary, ConversationHistory } from './ContactCardModules'
import { HubspotContact } from '../../types/types';

import { StringTemplates } from '../../flex-hooks/strings';

export interface OwnProps {
  manager: Manager
  task: ITask;
}

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const ContactCard = ({ manager, task }: OwnProps) => {
  const [contact, setContact] = useState<HubspotContact>();
  const [avatar, setAvatar] = useState<string>();

  useEffect(() => {
    if (!task) {
      return;
    }

    const hcid = task.attributes.hubspotContact;
    if (hcid === undefined) {
      if (task.attributes?.hubspot_contact_id) {
        HubspotCrmService.getContactById(task.attributes?.hubspot_contact_id).then((data) => {
          setContact(data.properties);
        });
      } else {
        logger.error('CONTACTID NOT FOUND: hubspot-crm/custom-components/ContactCard/ContactCard.jsx@48')
      }
    } else {
      setContact(task.attributes?.hubspotContact);
    }
  }, [task]);

  useEffect(() => {
    if (contact && contact.hasOwnProperty('email')) {
      const email = `${contact.email}`;
      if (email.length > 0 && contact.email !== null && email !== '') {
        setAvatar(gravatarUrl(email));
      }
    }
  }, [contact]);

  if (!contact || !contact.hasOwnProperty('hs_object_id') || !task) {
    return null;
  }

  return (
    <Box padding="space40" width="100%">
      <Card padding="space20">
        <Box padding="space40" maxWidth="100%">
          <Stack spacing="space50" orientation="horizontal">
            <Avatar size="sizeIcon110" name={fullName(contact)} variant="entity" src={avatar} />
            <Box rowGap="space20">
              <Heading as="h3" variant="heading30">
                <Truncate title={fullName(contact)}>{fullName(contact)}</Truncate>
              </Heading>

              <DescriptionList>
                <DescriptionListSet>
                  <DescriptionListTerm>{templates[StringTemplates.CreatedDate]()} </DescriptionListTerm>
                  <DescriptionListDetails>{contact.createdate}</DescriptionListDetails>
                </DescriptionListSet>
              </DescriptionList>
            </Box>
          </Stack>
        </Box>
        <Box padding="space40" width="100%">
          <Tabs baseId="horizontal-tabs-example">
            <TabList aria-label="Horizontal product tabs">
              <Tab>{templates[StringTemplates.Overview]()}</Tab>
              <Tab>{templates[StringTemplates.History]()}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Summary manager={manager} />
              </TabPanel>
              <TabPanel>
                <ConversationHistory manager={ manager } contact = { contact } currentConversation = { task?.attributes?.conversationSid } />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
};

export default withTaskContext(ContactCard);
