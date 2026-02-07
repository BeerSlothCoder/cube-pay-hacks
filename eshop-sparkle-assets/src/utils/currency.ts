export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateShipping = (subtotal: number): number => {
  return subtotal >= 100 ? 0 : 10;
};

export const calculateTax = (subtotal: number): number => {
  return subtotal * 0.08; // 8% tax rate
};
