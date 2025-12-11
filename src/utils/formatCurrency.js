const currencyFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  minimumFractionDigits: 0,
});

export const formatCurrency = (value) => currencyFormatter.format(value);
