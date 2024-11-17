import { HubspotContact } from "../types/types";

export const fullName = (contact: HubspotContact) => {
  if (!contact) {
    return 'Unknown name';
  }

  const fullName = `${contact.firstname ?? ''} ${contact.lastname ?? ''}`;
  if (fullName.trim() === '') {
    return 'Unknown name';
  }

  return fullName;
};
