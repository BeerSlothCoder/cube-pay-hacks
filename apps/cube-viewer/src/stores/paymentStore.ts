import { create } from 'zustand';
import type { DeployedObject } from '@cubepay/types';

export type PaymentFace = 'crypto_qr' | 'virtual_card' | 'sound_pay' | 'voice_pay' | 'on_off_ramp' | 'ens_payment';

interface PaymentStore {
  selectedAgent: DeployedObject | null;
  showCube: boolean;
  showPaymentModal: boolean;
  selectedFace: PaymentFace | null;
  selectAgent: (agent: DeployedObject) => void;
  deselectAgent: () => void;
  selectPaymentFace: (face: PaymentFace) => void;
  closePaymentModal: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  selectedAgent: null,
  showCube: false,
  showPaymentModal: false,
  selectedFace: null,

  selectAgent: (agent: DeployedObject) => {
    set({ 
      selectedAgent: agent, 
      showCube: true,
      showPaymentModal: false,
      selectedFace: null
    });
  },

  deselectAgent: () => {
    set({ 
      selectedAgent: null, 
      showCube: false,
      showPaymentModal: false,
      selectedFace: null
    });
  },

  selectPaymentFace: (face: PaymentFace) => {
    set({ 
      selectedFace: face,
      showPaymentModal: true,
      showCube: false
    });
  },

  closePaymentModal: () => {
    set({ 
      showPaymentModal: false,
      showCube: true,
      selectedFace: null
    });
  },
}));
