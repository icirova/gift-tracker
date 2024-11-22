import { useState, useCallback } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';

function App() {
  // Data o dárcích
  const [gifts] = useState([
    { name: "Ivetka", gift: "Parfém", price: 200 },
    { name: "Lukášek", gift: "Kniha", price: 350 },
    { name: "Sofinka", gift: "Parfém", price: 500 },
    { name: "Adámek", gift: "Hodinky", price: 1500 },
  ]);

  // Stav pro souhrn (počet dárků a celková cena)
  const [summary, setSummary] = useState({ totalItems: 0, totalPrice: 0 });

  // Funkce pro aktualizaci souhrnu - stabilizováno pomocí useCallback
  const handleSummaryUpdate = useCallback((totalItems, totalPrice) => {
    setSummary({ totalItems, totalPrice });
  }, []);

  return <div>
      <h1 className='title'>Christmas Gift Tracker</h1>

      <div className='section'>
        <Summary totalItems={summary.totalItems} totalPrice={summary.totalPrice} />
      </div>

      <div className='section'>

      
        <GiftCharts gifts={gifts} />
        </div>
     
     <div className='section'>
     <Table gifts={gifts} onSummaryUpdate={handleSummaryUpdate} />
     </div>
     
    </div>
}

export default App;
