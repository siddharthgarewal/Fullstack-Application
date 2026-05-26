export function calculateMovingAverage(
  values: number[],
  windowSize: number,
): number[] {
  if (windowSize <= 0 || values.length < windowSize) {
    return [];
  }

  const output: number[] = [];

  for (let i = 0; i <= values.length - windowSize; i += 1) {
    let sum = 0;

    for (let j = i; j < i + windowSize; j += 1) {
      sum += values[j];
    }

    output.push(Number((sum / windowSize).toFixed(2)));
  }

  return output;
}

export function calculateVolatility(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance =
    values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;

  return Number(Math.sqrt(variance).toFixed(3));
}

export function createDemoSeries(length: number): number[] {
  return Array.from({ length }, (_, index) =>
    Number((80 + Math.sin(index / 3) * 10 + index * 0.5).toFixed(2)),
  );
}

// Unused exports are intentionally kept to demonstrate tree shaking.
export function formatAsCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function expensiveStringPadding(text: string): string {
  return `${text}`.padStart(1000, "*");
}
