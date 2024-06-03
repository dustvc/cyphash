export async function fetchCryptoPrice(ticker) {
  const ticker_format = ticker.toLowerCase();

  const response = await fetch(
    `https://indodax.com/api/${ticker_format}_idr/ticker`
  );

  const data = await response.json();
  return data.ticker.last;
}
