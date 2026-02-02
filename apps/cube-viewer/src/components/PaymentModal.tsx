import React, { useState, useEffect } from 'react';
import { usePaymentStore } from '../stores/paymentStore';
import { X } from 'lucide-react';
import QRCode from 'qrcode';

export const PaymentModal: React.FC = () => {
  const { selectedPaymentFace, selectedAgent, closePaymentModal } = usePaymentStore();
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (selectedPaymentFace === 'crypto_qr') {
      // Generate QR code for crypto payment
      QRCode.toDataURL('bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001')
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation error:', err));
    }
  }, [selectedPaymentFace]);

  if (!selectedPaymentFace || !selectedAgent) return null;

  const faceConfigs = {
    crypto_qr: {
      title: 'Crypto QR Payment',
      color: '#00D4FF',
      description: 'Scan this QR code with your crypto wallet'
    },
    virtual_card: {
      title: 'Virtual Card Payment',
      color: '#7C3AED',
      description: 'Use your virtual card to complete the payment'
    },
    on_off_ramp: {
      title: 'On/Off Ramp',
      color: '#3B82F6',
      description: 'Convert between fiat and crypto'
    },
    ens_payment: {
      title: 'ENS Payment',
      color: '#F59E0B',
      description: 'Pay using your ENS domain'
    },
    sound_pay: {
      title: 'Sound Pay',
      color: '#64748B',
      description: 'Pay using sound waves'
    },
    voice_pay: {
      title: 'Voice Pay',
      color: '#64748B',
      description: 'Pay using voice commands'
    },
  };

  const config = faceConfigs[selectedPaymentFace];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 30 }}>
      <div className="bg-cubepay-bg rounded-2xl p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={closePaymentModal}
          className="absolute top-4 right-4 text-cubepay-text-secondary hover:text-cubepay-text"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cubepay-text mb-2">{config.title}</h2>
          <p className="text-cubepay-text-secondary">{config.description}</p>
          <p className="text-sm text-cubepay-text-secondary mt-1">Agent: {selectedAgent.agent_name}</p>
        </div>

        {/* Content based on payment face */}
        {selectedPaymentFace === 'crypto_qr' && (
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64 border-4 border-white rounded-lg" />
            )}
            <p className="text-cubepay-text text-center">Scan with your crypto wallet</p>
            <p className="text-xs text-cubepay-text-secondary text-center font-mono">
              1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
            </p>
          </div>
        )}

        {selectedPaymentFace === 'virtual_card' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-xl p-6 text-white">
              <p className="text-sm opacity-75 mb-4">Virtual Card</p>
              <p className="text-xl font-mono mb-4">**** **** **** 4242</p>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs opacity-75">Valid Thru</p>
                  <p className="font-mono">12/26</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">CVV</p>
                  <p className="font-mono">***</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
              Pay with Virtual Card
            </button>
          </div>
        )}

        {selectedPaymentFace === 'on_off_ramp' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Buy Crypto
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Sell Crypto
              </button>
            </div>
            <div className="bg-cubepay-card p-4 rounded-lg">
              <p className="text-cubepay-text-secondary text-sm mb-2">Convert</p>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="Amount"
                  className="bg-transparent text-cubepay-text text-2xl w-full outline-none"
                />
                <select className="bg-cubepay-card text-cubepay-text border border-cubepay-text-secondary rounded px-2 py-1">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedPaymentFace === 'ens_payment' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="vitalik.eth"
              className="w-full bg-cubepay-card text-cubepay-text px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold">
              Pay with ENS
            </button>
          </div>
        )}

        {(selectedPaymentFace === 'sound_pay' || selectedPaymentFace === 'voice_pay') && (
          <div className="text-center py-8">
            <p className="text-cubepay-text-secondary text-lg">Coming soon...</p>
            <p className="text-cubepay-text-secondary text-sm mt-2">This payment method is under development</p>
          </div>
        )}
      </div>
    </div>
  );
};
