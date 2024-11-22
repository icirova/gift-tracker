import './style.css'
import PropTypes from 'prop-types';
import GiftCountChart from '../GiftCountChart';
import TotalPriceChart from '../TotalPriceChart';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrace potřebných komponent Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GiftCharts = ({ gifts }) => {
  // Seznam osob
  const persons = [...new Set(gifts.map((gift) => gift.name))];

  // Počet dárků pro každou osobu
  const giftCount = persons.map((person) => gifts.filter((gift) => gift.name === person).length);

  // Celková cena pro každou osobu
  const totalPrice = persons.map((person) =>
    gifts
      .filter((gift) => gift.name === person)
      .reduce((sum, gift) => sum + gift.price, 0)
  );

  return <div className='charts'>
      <GiftCountChart persons={persons} giftCount={giftCount} />
      <TotalPriceChart persons={persons} totalPrice={totalPrice} /> {/* Předání totalPrice správně */}
    </div>
};

// Validace props pomocí PropTypes
GiftCharts.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired, // Jméno osoby
      gift: PropTypes.string.isRequired, // Název dárku
      price: PropTypes.number.isRequired, // Cena dárku
    })
  ).isRequired,
};

export default GiftCharts;
