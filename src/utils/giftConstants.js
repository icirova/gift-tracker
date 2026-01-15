export const GIFT_STATUS = {
  bought: 'bought',
  idea: 'idea',
};

export const STATUS_VALUES = new Set(Object.values(GIFT_STATUS));

export const STATUS_OPTIONS = [
  { value: GIFT_STATUS.bought, label: 'Koupeno' },
  { value: GIFT_STATUS.idea, label: 'Plánováno' },
];
