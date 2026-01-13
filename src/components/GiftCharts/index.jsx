import { useMemo } from 'react';
import PropTypes from 'prop-types';
import GiftCountChart from '../GiftCountChart';
import TotalPriceChart from '../TotalPriceChart';
import YearlySpendingChart from '../YearlySpendingChart';
import { buildColorPalette } from '../../utils/colorPalette';
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
        acc.totals[index] += gift.price ?? 0;
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
  const sharedColors = useMemo(
    () => (persons.length ? buildColorPalette(persons.length) : []),
    [persons.length],
  );

  return (
    <div className='charts'>
      {hasYearData ? (
        <>
          <GiftCountChart persons={persons} giftCount={giftCount} colors={sharedColors} />
          <TotalPriceChart persons={persons} totalPrice={totalPrice} colors={sharedColors} />
        </>
      ) : (
        <div className='chart chart--empty'>
          <p className='chart-message'>Pro vybraný rok nemáme žádná data.</p>
        </div>
      )}
      {hasYearData && persons.length > 0 && (
        <div className='charts-legend'>
          {persons.map((person, index) => (
            <div className='charts-legend__item' key={person}>
              <span
                className='charts-legend__swatch'
                style={{ backgroundColor: sharedColors[index % sharedColors.length] }}
              />
              <span>{person}</span>
            </div>
          ))}
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
      price: PropTypes.number,
      status: PropTypes.oneOf(['bought', 'idea']).isRequired,
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
