type Point = { period: string; value: number };

export function Sparkline({
  data,
  color = "#c4a35a",
  height = 48,
  width = 180,
}: {
  data: Point[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;

  const h = height;
  const w = width;
  const ys = data.map((d) => d.value);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 8) + 4;
    const y = h - 6 - ((d.value - min) / span) * (h - 12);
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (w - 8) + 4;
        const y = h - 6 - ((d.value - min) / span) * (h - 12);
        return <circle key={d.period} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}