import { useState, useCallback } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';

function App() {
  // Data o dárcích
  const [gifts] = useState([
    { name: "Ivetka", gift: "Parfém", price: 200 },
    { name: "Ivetka", gift: "Parfém", price: 200 },
    { name: "Lukášek", gift: "Kniha", price: 350 },
    { name: "Lukášek", gift: "Kniha", price: 350 },
    { name: "Lukášek", gift: "Kniha", price: 350 },
    { name: "Sofinka", gift: "Parfém", price: 500 },
    { name: "Sofinka", gift: "Parfém", price: 500 },
    { name: "Sofinka", gift: "Parfém", price: 500 },
    { name: "Sofinka", gift: "Parfém", price: 500 },
    { name: "Adámek", gift: "Hodinky", price: 1500 },
    { name: "Babička", gift: "Lama", price: 15000 },
    { name: "Děda", gift: "Ponožky", price: 120 },
  ]);

  //Data o Kč/rok
  const giftData = [
    { year: 2022, total: 40000 },
    { year: 2023, total: 32000 },
    { year: 2024, total: 35000 },
  ];
  

  // Stav pro souhrn (počet dárků a celková cena)
  const [summary, setSummary] = useState({ totalItems: 0, totalPrice: 0 });

  // Funkce pro aktualizaci souhrnu - stabilizováno pomocí useCallback
  const handleSummaryUpdate = useCallback((totalItems, totalPrice) => {
    setSummary({ totalItems, totalPrice });
  }, []);

  return <div className='wrapper'>

    <div className='heading-icons'>
      <img className='icon-head' src="snowflake1.svg" alt="vločka" />
      <img className='icon-head-lg' src="snowflake2.svg" alt="vločka" />
      <img className='icon-head-sm' src="snowflake3.svg" alt="vločka" />
      <img className='icon-head' src="snowflake4.svg" alt="vločka" />
      <img className='icon-head-sm' src="snowflake5.svg" alt="vločka" />
      <img className='icon-head-lg' src="snowflake14.svg" alt="vločka" />
      <img className='icon-head' src="snowflake13.svg" alt="vločka" />
      <img className='icon-head-sm' src="snowflake8.svg" alt="vločka" />
      <img className='icon-head' src="snowflake9.svg" alt="vločka" />
      <img className='icon-head-lg' src="snowflake10.svg" alt="vločka" />
      <img className='icon-head-sm' src="snowflake11.svg" alt="vločka" />
      <img className='icon-head' src="snowflake12.svg" alt="vločka" />

    </div>

    <div className='heading-container'>
      <h1 className='title-decor'>Christmas</h1>
      <h1 className='title'> Gift Tracker</h1>
    </div>
      

      <div className='section'>
        <Summary totalItems={summary.totalItems} totalPrice={summary.totalPrice} />
      </div>

      <div className='section'>

      
        <GiftCharts gifts={gifts} giftData={giftData}/>
        </div>
     
     <div className='section'>
     <Table gifts={gifts} onSummaryUpdate={handleSummaryUpdate} />
     </div>
     
    </div>
}

export default App;
