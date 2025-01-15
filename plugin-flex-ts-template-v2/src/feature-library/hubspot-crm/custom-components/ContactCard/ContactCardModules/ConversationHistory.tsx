import React, { useEffect, useState } from 'react';
import { Manager, templates } from "@twilio/flex-ui";
import { Notifications } from "@twilio/flex-ui";
import { Box, SkeletonLoader, Stack, Text } from '@twilio-paste/core';
import ConversationHistoryEntry from './ConversationHistory/ConversationHistoryEntry';
import { HubspotContact } from '../../../types/HubpostContact';
import HubspotCRMService from '../../../utils/serverless/HubspotCRMService';
import { StringTemplates } from '../../../flex-hooks/strings';
import { HubspotCRMNotification } from '../../../flex-hooks/notifications/HubspotCRM';

type Props = {
    contact: HubspotContact
    currentConversation: string
}

const ConversationHistory = ({ contact, currentConversation }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const [conversations, setConversations] = useState([])

    useEffect(() => {
        HubspotCRMService.loadConversations({
            phone: contact.phone,
            currentConversation
        })
            .then((conversations) => {
                if (!conversations.hasOwnProperty('error')) {
                    setConversations(conversations)
                } else {
                    Notifications.showNotification(HubspotCRMNotification.HCRMErrorLoadingConversations);
                }

                setLoaded(true)
            })
    }, [])

    return (
        <Box>
            {!loaded && <SkeletonLoader height="150px" />}
            {loaded && (
                <Stack orientation="vertical" spacing="space50">
                    {conversations.length > 0 && conversations.map((conversation, index) => (
                        <ConversationHistoryEntry key={index} conversation={conversation} />
                    ))}

                    {conversations.length === 0 && (
                        <Box padding="space40">
                            <Text as="p" textAlign="center">{templates[StringTemplates.NoConversationsFound]()}</Text>
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    )
}

export default ConversationHistory