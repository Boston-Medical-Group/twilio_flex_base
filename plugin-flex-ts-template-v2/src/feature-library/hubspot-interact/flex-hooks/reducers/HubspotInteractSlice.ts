import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { HubspotContact, HubspotDeal } from '../../types/HubspotInteract';

export interface HubspotInteractState {
    contact?: HubspotContact
    deal?: HubspotDeal
}

const initialState = {
    contact: undefined,
    deal: undefined
} as HubspotInteractState;

const hubspotInteractSlice = createSlice({
    name: 'hubspotInteract',
    initialState,
    reducers: {
        setContact: (state, action: PayloadAction<undefined | HubspotContact>) => {
            // Instead of recreating state, you can directly mutate
            // state values in these reducers. Immer will handle the
            // immutability aspects under the hood for you
            state.contact = action.payload;
        },

        setDeal: (state, action: PayloadAction<undefined | HubspotDeal>) => {
            state.deal = action.payload
        }
    },
});

export const { setContact, setDeal } = hubspotInteractSlice.actions;
export const reducerHook = () => ({ hubspotInteract: hubspotInteractSlice.reducer });