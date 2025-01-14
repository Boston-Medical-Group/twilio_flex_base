import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { HubspotContact } from '../../types/HubpostContact';

export interface HubspotCRMState {
    contact?: HubspotContact
}

const initialState = {
    contact: undefined,
} as HubspotCRMState;

const hubspotCRMSlice = createSlice({
    name: 'hubspotCRM',
    initialState,
    reducers: {
        setContact(state, action: PayloadAction<undefined | HubspotContact>) {
            state.contact = action.payload;
        }
    },
});

export const { setContact } = hubspotCRMSlice.actions;
export const reducerHook = () => ({ hubspotCRM: hubspotCRMSlice.reducer });