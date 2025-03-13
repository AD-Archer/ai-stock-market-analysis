# Stock Market Analysis

## Overview
This project analyzes stock market data specifically focusing on companies listed in the Nasdaq-100 index. It utilizes OpenAI's API to classify companies into sectors and provides insights into top-performing sectors based on year-to-date (YTD) performance. The main script, `main.py`, orchestrates the data loading, processing, and recommendation generation.

## Files
- **main.py**: Contains the main logic for analyzing stock market data.
- **data/nasdaq100.csv**: Dataset of companies in the Nasdaq-100 index.
- **data/nasdaq100_price_change.csv**: Year-to-date price change data for the companies.
- **requirements.txt**: Lists the dependencies required to run the project.
- **README.md**: Documentation for the project.
- **.env.example**: Template for environment variables needed for the project.

## Installation Instructions
1. Clone the repository:
   ```
   git clone github.com/ad-archer/stock-market-analysis-test
   cd stock-market-analysis-test
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your environment variables:
   - Copy `.env.example` to `.env` and fill in your OpenAI API key:
     ```
     cp .env.example .env
     ```

## Usage
To run the analysis, execute the following command:
```
python main.py
```

The script will classify companies into sectors, count the number of companies per sector, identify top-performing sectors, and generate stock recommendations based on YTD performance.

## Notes
- Ensure you have a valid OpenAI API key to use the classification feature.
- The datasets `nasdaq100.csv` and `nasdaq100_price_change.csv` in the `data` directory should be changed to better reflect the current stock market.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.