function App() {
  const gifts = [
    { item: "Ponožky", price: 200 },
    { item: "Kniha", price: 500 },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Seznam dárků</h1>
      <table>
        <thead>
          <tr>
            <th>Položka</th>
            <th>Cena</th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((gift, index) => (
            <tr key={index}>
              <td>{gift.item}</td>
              <td>{gift.price} Kč</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
