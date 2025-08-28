# Advanced Trading Strategies

## Overview
This module provides an engine and APIs to run and optimize advanced algorithmic trading strategies. It is designed to be DB-agnostic and currently simulates signals and metrics for rapid iteration and UI integration.

## Components
- Engine: `server/src/lib/advanced-strategies.ts`
- API: `server/src/api-advanced-strategies.ts`
- UI: `ui/src/components/AdvancedStrategiesDashboard.tsx` (integrated in `LearningAnalytics`)

## Strategy Types
- Trend Following (SMA crossover)
- Mean Reversion (RSI-based)
- Breakout (Donchian)

## API Endpoints
Base path: `/api/strategies`

- `GET /list`
  - Returns all available strategies with parameter schemas.

- `POST /run`
  - Body:
  ```json
  {
    "strategyId": "trend-following-basic",
    "asset": "BTC/USD",
    "timeframe": "1h",
    "startDate": "2025-08-20T00:00:00.000Z",
    "endDate": "2025-08-27T00:00:00.000Z",
    "parameters": { "fastPeriod": 20, "slowPeriod": 50, "riskPerTrade": 0.01 }
  }
  ```
  - Response includes signals and performance metrics.

- `POST /optimize`
  - Body:
  ```json
  {
    "strategyId": "trend-following-basic",
    "objective": "max_sharpe",
    "constraints": [
      { "parameter": "fastPeriod", "min": 5, "max": 25, "step": 5 },
      { "parameter": "slowPeriod", "min": 50, "max": 150, "step": 25 }
    ],
    "asset": "BTC/USD",
    "timeframe": "1h",
    "startDate": "2025-08-20T00:00:00.000Z",
    "endDate": "2025-08-27T00:00:00.000Z",
    "baselineParameters": { "fastPeriod": 20, "slowPeriod": 50, "riskPerTrade": 0.01 }
  }
  ```
  - Response includes best parameters, baseline vs best metrics, and improvement.

## Metrics
- Win Rate, Profit Factor, Sharpe Ratio, Max Drawdown, Average Return

## UI Usage
The dashboard allows selecting a strategy, configuring parameters, running it against a time window and asset, and optimizing parameters. Results are displayed with key metrics and sample signals.

## Future Enhancements
- Persist runs and optimizations in DB (Drizzle ORM)
- Add more strategies (momentum, pairs trading, volatility breakout)
- Integrate with real historical data/backtesting engine
- Parameter constraints validation and presets
- Batch optimization and parallel execution
