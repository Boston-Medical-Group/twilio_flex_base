import { getFeatureFlags } from '../../utils/configuration';
import HubspotCrmConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.hubspot_crm as HubspotCrmConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
