# Stock Market Data Files

This directory contains pregenerated mock data files for the stock market analysis application.

## Files

- `nasdaq100.csv`: Contains NASDAQ-100 stock symbols and company names
- `nasdaq100_price_change.csv`: Contains year-to-date (YTD) price changes for NASDAQ-100 stocks
- `nasdaq100_mock_data.csv`: Comprehensive mock data file with all stock information including:
  - Symbol
  - Company name
  - YTD performance
  - Sector
  - Industry
  - Market cap
  - PE ratio
  - Dividend yield
  - Price

## Usage

The application uses these pregenerated files instead of making API calls to improve performance and reduce API usage. This approach eliminates the need for rate limiting and retries, making the application faster and more reliable.

The `nasdaq100_mock_data.csv` file is the primary data source used by the application. It contains all the information needed for stock analysis and AI recommendations.

## Updating Data

To update the mock data:

1. Edit the `nasdaq100_mock_data.csv` file directly
2. Add new stocks or update existing stock information as needed
3. Ensure all required fields are included for each stock

No API calls are made when using mock data, so the application will run faster and more reliably.