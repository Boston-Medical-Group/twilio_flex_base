import { useEffect } from "react";
import { Manager } from "@twilio/flex-ui";
import HubspotCRMService from "../utils/serverless/HubspotCRMService";

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 *
 * @return { JSX.Element | null } - the rendered JSX element or null if isOpen is false
 */



const SyncHubspotUser = () => {
    useEffect(() => {
        sync();
    }, [])

    var manager = Manager.getInstance();
    const sync = async () => {
        let hubspotId = manager.workerClient?.attributes.hasOwnProperty('hubspot_id') ? manager.workerClient.attributes.hubspot_id : false;
        let hubspotOwnerId = manager.workerClient?.attributes.hasOwnProperty('hubspot_owner_id') ? manager.workerClient.attributes.hubspot_owner_id : false;

        let newAttrs = manager.workerClient?.attributes as { [key: string]: any };
        if (hubspotId && !hubspotOwnerId) {
            await HubspotCRMService.getHubspotUserOwnerByQuery({
                query: hubspotId,
                by: 'userId'
            })
                .then(async (owner) => {
                    if (owner?.id) {
                        newAttrs.hubspot_owner_id = owner.id;
                    }

                    await manager.workerClient?.setAttributes(newAttrs);
                })
                .catch(() => console.log("Error while Syncing Hubspot User with UserID"));;
        } else if (hubspotOwnerId && !hubspotId) {
            // Sync con hubspot_id
            await HubspotCRMService.getHubspotUserOwnerByQuery({
                query: hubspotOwnerId,
                by: 'id'
            })
                .then(async (owner) => {
                    if (owner?.userId) {
                        newAttrs.hubspot_id = owner.userId;
                    }

                    await manager.workerClient?.setAttributes(newAttrs);
                })
                .catch(() => console.log("Error while Syncing Hubspot User with OwnerID"));
        } else if (!hubspotId && !hubspotOwnerId) {
            await HubspotCRMService.getHubspotUserOwnerByQuery({
                query: newAttrs.email,
                by: 'email'
            })
                .then(async (users) => {
                    if (users?.results && users.results[0]) {
                        const user = users.results[0];
                        if (user) {
                            if (user.userId) {
                                newAttrs.hubspot_id = user.userId;
                            }
                            if (user.id) {
                                newAttrs.hubspot_owner_id = user.id;
                            }

                            await manager.workerClient?.setAttributes(newAttrs);
                        }
                    }
                })
                .catch(() => console.log("Error while Syncing Hubspot User with Email"));
        }
    }

    return null;
};

export default SyncHubspotUser;