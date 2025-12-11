import { useMemo } from 'react';
import PropTypes from 'prop-types';
import GiftCountChart from '../GiftCountChart';
import TotalPriceChart from '../TotalPriceChart';
import YearlySpendingChart from '../YearlySpendingChart';
import './style.css';

const GiftCharts = ({ gifts, yearlyTotals }) => {
  const { persons, giftCount, totalPrice } = useMemo(() => {
    const aggregations = gifts.reduce(
      (acc, gift) => {
        const index = acc.map.get(gift.name) ?? acc.order.length;
        if (!acc.map.has(gift.name)) {
          acc.map.set(gift.name, acc.order.length);
          acc.order.push(gift.name);
          acc.counts.push(0);
          acc.totals.push(0);
        }

        acc.counts[index] += 1;
        acc.totals[index] += gift.price;
        return acc;
      },
      {
        map: new Map(),
        order: [],
        counts: [],
        totals: [],
      },
    );

    return {
      persons: aggregations.order,
      giftCount: aggregations.counts,
      totalPrice: aggregations.totals,
    };
  }, [gifts]);

  const hasYearData = gifts.length > 0;

  return (
    <div className='charts'>
      {hasYearData ? (
        <>
          <GiftCountChart persons={persons} giftCount={giftCount} />
          <TotalPriceChart persons={persons} totalPrice={totalPrice} />
        </>
      ) : (
        <div className='chart chart--empty'>
          <p className='chart-message'>Pro vybraný rok nemáme žádná data.</p>
        </div>
      )}
      <YearlySpendingChart data={yearlyTotals} />
    </div>
  );
};

GiftCharts.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      year: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      gift: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  yearlyTotals: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default GiftCharts;
