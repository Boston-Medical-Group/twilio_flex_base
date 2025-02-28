import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { HubspotContact, HubspotDeal, CallCardType } from '../../types/HubspotInteract';

export interface HubspotInteractCallCardState {
  callCard?: CallCardType
  isLoading?: boolean
}

const initialState = {
  callCard: undefined,
  isLoading: false
} as HubspotInteractCallCardState;

const hubspotInteractCallCardSlice = createSlice({
  name: 'hubspotInteractCallCard',
  initialState,
  reducers: {
    setCallCard: (state, action: PayloadAction<CallCardType>) => {
      // Instead of recreating state, you can directly mutate
      // state values in these reducers. Immer will handle the
      // immutability aspects under the hood for you
      state.callCard = action.payload;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  },
});

export const { setCallCard, setIsLoading } = hubspotInteractCallCardSlice.actions;
export const reducerHook = () => ({ hubspotInteractCallCard: hubspotInteractCallCardSlice.reducer });