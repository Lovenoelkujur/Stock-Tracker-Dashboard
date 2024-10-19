// Set up API and other elements
const apiKey = " 83XB4LGMWKLNEISV";
const apiUrl = 'https://www.alphavantage.co/query';
const stockForm = document.getElementById('stock-form');
const stockSymbolInput = document.getElementById('stock-symbol');
const trendingStocksDropdown = document.getElementById('trending-stocks');
const stockTableBody = document.querySelector('#stock-table tbody');
const ctx = document.getElementById('stock-chart').getContext('2d');
let chart;

// Fetch stock data
async function fetchStockData(symbol) {
    const response = await fetch(`${apiUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
    const data = await response.json();
    return data['Time Series (Daily)']; 
}

// Render table with stock info
function renderStockData(symbol, stockData) {
    const latestDate = Object.keys(stockData)[0];
    const { '1. open': price, '5. volume': volume } = stockData[latestDate];

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${symbol}</td>
        <td>${price}</td>
        <td>${volume}</td>
        <td>${(parseFloat(price) - parseFloat(stockData[latestDate]['4. close'])).toFixed(2)}</td>
    `;
    stockTableBody.appendChild(newRow);
}

// Render stock price graph
function renderStockChart(symbol, stockData) {
    const dates = Object.keys(stockData).reverse();
    const prices = dates.map(date => stockData[date]['4. close']);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${symbol} Price`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
            }]
        },
        options: {
            responsive: true,
        }
    });
}

// Event listener for stock search form
stockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = stockSymbolInput.value.toUpperCase();
    const stockData = await fetchStockData(symbol);
    renderStockData(symbol, stockData);
    renderStockChart(symbol, stockData);
    stockSymbolInput.value = '';
});

// Fetch and render trending stocks (this could be a separate API call)
async function fetchTrendingStocks() {
    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NFLX', 'NVDA', 'BABA', 'INTC']; // Example, fetch actual trending stocks here
    trendingSymbols.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        option.textContent = symbol;
        trendingStocksDropdown.appendChild(option);
    });
}

trendingStocksDropdown.addEventListener('change', async (e) => {
    const symbol = e.target.value;
    if (symbol) {
        const stockData = await fetchStockData(symbol);
        renderStockData(symbol, stockData);
        renderStockChart(symbol, stockData);
    }
});

// Initialize trending stocks on page load
fetchTrendingStocks();
