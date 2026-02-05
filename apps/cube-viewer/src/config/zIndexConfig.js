/**
 * Centralized Z-Index Management
 * Prevents modal collision and stacking bugs
 * Ensures proper layering of UI components
 */

export const Z_INDEX = {
  CAMERA_VIEW: 0,
  AR_3D_SCENE: 10,
  CUBE_PAYMENT_ENGINE: 20,
  AGENT_INTERACTION_MODAL: 30,
  ARTM_DISPLAY_MODAL: 40,
  CARD_WITHDRAWAL_MODAL: 50,
  CRYPTO_WITHDRAWAL_MODAL: 50,
  NOTIFICATION_TOAST: 100,
  DEBUG_OVERLAY: 110,
};

export default Z_INDEX;
