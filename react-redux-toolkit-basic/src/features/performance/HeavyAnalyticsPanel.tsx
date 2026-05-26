import { useMemo } from "react";
import {
  calculateMovingAverage,
  calculateVolatility,
  createDemoSeries,
} from "./math";

function HeavyAnalyticsPanel() {
  const prices = useMemo(() => createDemoSeries(24), []);
  const average5 = useMemo(() => calculateMovingAverage(prices, 5), [prices]);
  const volatility = useMemo(() => calculateVolatility(prices), [prices]);

  return (
    <div className="analysis-box">
      <h3>Lazy Analytics Panel</h3>
      <p>
        This component is loaded with <code>React.lazy</code>, so it lives in a
        separate chunk and only downloads when needed.
      </p>
      <p>
        Current volatility score (std dev): <strong>{volatility}</strong>
      </p>
      <p>Last 5-day moving averages:</p>
      <ul className="list">
        {average5.slice(-5).map((value, index) => (
          <li key={`${value}-${index}`}>{value}</li>
        ))}
      </ul>
    </div>
  );
}

export default HeavyAnalyticsPanel;
