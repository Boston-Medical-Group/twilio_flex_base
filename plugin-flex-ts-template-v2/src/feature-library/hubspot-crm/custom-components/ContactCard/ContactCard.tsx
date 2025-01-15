import React, { useEffect, useState } from 'react';
import { ITask, templates } from "@twilio/flex-ui";
import {
    Box, Card, Heading, Stack, Avatar, DescriptionList, DescriptionListSet,
    DescriptionListTerm, DescriptionListDetails, Tabs, TabList, Tab, TabPanels, TabPanel, Truncate
} from '@twilio-paste/core';
// @ts-ignore
import { Summary, ConversationHistory } from './ContactCardModules'
import HubspotCRMService from '../../utils/serverless/HubspotCRMService';
import { ContactCardViewWrapper } from './ContactCardStyles';
import { StringTemplates } from '../../flex-hooks/strings';
import { HubspotContact } from '../../types/HubpostContact';

type Props = {
    task: ITask
}

const fullName = (contact: HubspotContact) => {
    if (!contact) {
        return 'Unknown name';
    }

    let fullName = `${contact.firstname ?? ''} ${contact.lastname ?? ''}`;
    if (fullName.trim() == '') {
        return 'Unknown name';
    }

    return fullName;
}

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const ContactCard = ({ task }: Props) => {

    const [contact, setContact] = useState<HubspotContact>();
    const [contactId, setContactId] = useState<Number | String | undefined>();

    useEffect(() => {
        let isMounted = true; // Indicador para saber si el componente está montado

        const fetchData = async () => {
            try {
                let hcid = task?.attributes?.hubspotContact ?? false
                if (!hcid) {
                    if (!task?.attributes?.hubspot_contact_id) {
                        console.log('CONTACTID NOT FOUND: components/ContactCard/ContactCard.jsx@47')
                    } else {
                        HubspotCRMService.getContactById({
                            contact_id: task.attributes?.hubspot_contact_id
                        }).then((data) => {
                            if (isMounted) {
                                setContact(data.properties);
                            }
                        });
                    }
                } else {
                    setContact(task.attributes?.hubspotContact)
                }
            } catch (err) {
                if (isMounted) {
                    console.log('Error mounting');
                }
            }
        }

        fetchData();

        setContactId(task?.attributes?.hubspot_contact_id)

        return () => {
            isMounted = false;
        }
    }, [task])

    if (contact === undefined || !contact.hasOwnProperty('hs_object_id') || !task) {
        return null;
    }

    return (
        <ContactCardViewWrapper>
            <Box padding="space40">
                <Card padding="space20">
                    <Box padding="space40" maxWidth="100%">
                        <Stack spacing="space50" orientation="horizontal">
                            <Avatar size="sizeIcon110" name={fullName(contact)} variant="entity" />
                            <Box rowGap="space20">
                                <Heading as="h3" variant="heading30">
                                    <Truncate title={fullName(contact)}>{fullName(contact)}</Truncate>
                                </Heading>
                                <DescriptionList>
                                    <DescriptionListSet>
                                        <DescriptionListTerm>{templates[StringTemplates.CreatedDate]()}</DescriptionListTerm>
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
                                    <Summary task={task} />
                                </TabPanel>
                                <TabPanel>
                                    <ConversationHistory contact={contact} currentConversation={task?.attributes?.conversationSid} />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>


                </Card>
            </Box>
        </ContactCardViewWrapper>
    );
};

export default ContactCard