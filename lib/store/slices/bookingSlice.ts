// lib/store/slices/bookingSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  selectedPracticeId: string;
  selectedPracticeName: string;
  selectedPracticeAddress: string;
  selectedPracticeImage: string;
  selectedPractitioner: string;
  selectedDateStr: string;
  selectedTime: string;
  selectedAppointmentType: string;
  patientType: 'New' | 'Existing';
  fromHomeWidget: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  selectedPracticeId: '',
  selectedPracticeName: '',
  selectedPracticeAddress: '',
  selectedPracticeImage: '',
  selectedPractitioner: '',
  selectedDateStr: '',
  selectedTime: '',
  selectedAppointmentType: '',
  patientType: 'New',
  fromHomeWidget: false,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedPractice: (state, action: PayloadAction<{
      id: string;
      name: string;
      address: string;
      image: string;
      date: string;
      time: string;
      fromHomeWidget: boolean;
    }>) => {
      state.selectedPracticeId = action.payload.id;
      state.selectedPracticeName = action.payload.name;
      state.selectedPracticeAddress = action.payload.address;
      state.selectedPracticeImage = action.payload.image;
      state.selectedDateStr = action.payload.date;
      state.selectedTime = action.payload.time;
      state.fromHomeWidget = action.payload.fromHomeWidget;
    },
    setPatientType: (state, action: PayloadAction<'New' | 'Existing'>) => {
      state.patientType = action.payload;
    },
    setSelectedPractitioner: (state, action: PayloadAction<string>) => {
      state.selectedPractitioner = action.payload;
    },
    setSelectedDateStr: (state, action: PayloadAction<string>) => {
      state.selectedDateStr = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload;
    },
    resetSelections: (state) => {
      state.selectedPractitioner = '';
      state.selectedDateStr = '';
      state.selectedTime = '';
    },
  },
});

export const {
  setSelectedPractice,
  setPatientType,
  setSelectedPractitioner,
  setSelectedDateStr,
  setSelectedTime,
  resetSelections,
} = bookingSlice.actions;

export default bookingSlice.reducer;