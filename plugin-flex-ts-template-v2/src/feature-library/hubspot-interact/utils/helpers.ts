import { HubspotContact } from "../types/HubspotInteract"

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

export {
    fullName,
}