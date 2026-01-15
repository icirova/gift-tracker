const isValidPrice = (price) => Number.isFinite(price) && price > 0;

export const calculateYearStats = (gifts) => {
  let boughtTotal = 0;
  let ideaTotal = 0;
  let ideaMissingCount = 0;
  let boughtCount = 0;
  let mostExpensiveGift = null;
  let cheapestGift = null;

  gifts.forEach((gift) => {
    const priceValue = Number(gift.price);
    const hasValidPrice = isValidPrice(priceValue);

    if (hasValidPrice) {
      if (mostExpensiveGift === null || priceValue > mostExpensiveGift) {
        mostExpensiveGift = priceValue;
      }
    }

    if (gift.status === 'bought') {
      if (!hasValidPrice) {
        return;
      }
      boughtTotal += priceValue;
      boughtCount += 1;
      if (cheapestGift === null || priceValue < cheapestGift) {
        cheapestGift = priceValue;
      }
      return;
    }

    if (gift.status === 'idea') {
      if (hasValidPrice) {
        ideaTotal += priceValue;
      } else {
        ideaMissingCount += 1;
      }
    }
  });

  return {
    totalItems: gifts.length,
    boughtTotal,
    ideaTotal,
    ideaMissingCount,
    boughtCount,
    mostExpensiveGift,
    cheapestGift,
  };
};

export const calculateSpentTotalForYear = (gifts, year) =>
  gifts.reduce((sum, gift) => {
    const priceValue = Number(gift.price);
    if (gift.year !== year || gift.status !== 'bought' || !isValidPrice(priceValue)) {
      return sum;
    }
    return sum + priceValue;
  }, 0);

export const buildYearlyTotals = (gifts) => {
  const annualTotals = gifts.reduce((acc, gift) => {
    const priceValue = Number(gift.price);
    if (gift.status !== 'bought' || !isValidPrice(priceValue)) {
      return acc;
    }
    acc[gift.year] = (acc[gift.year] ?? 0) + priceValue;
    return acc;
  }, {});

  return Object.entries(annualTotals)
    .map(([year, total]) => ({ year: Number(year), total }))
    .sort((a, b) => a.year - b.year);
};

export const calculateBudgetPercents = ({
  currentBudget,
  boughtTotal,
  ideaTotal,
  planTotal,
}) => {
  if (!currentBudget || currentBudget <= 0 || planTotal <= 0) {
    return { bought: 0, idea: 0, over: 0, total: 0 };
  }

  if (planTotal > currentBudget) {
    const withinPercent = (currentBudget / planTotal) * 100;
    const boughtShare = (boughtTotal / planTotal) * withinPercent;
    const ideaShare = (ideaTotal / planTotal) * withinPercent;
    const overShare = 100 - withinPercent;
    return {
      bought: boughtShare,
      idea: ideaShare,
      over: overShare,
      total: 100,
    };
  }

  const boughtPercent = (boughtTotal / currentBudget) * 100;
  const ideaPercent = (ideaTotal / currentBudget) * 100;
  const totalPercent = Math.min((planTotal / currentBudget) * 100, 100);
  return {
    bought: boughtPercent,
    idea: ideaPercent,
    over: 0,
    total: totalPercent,
  };
};
