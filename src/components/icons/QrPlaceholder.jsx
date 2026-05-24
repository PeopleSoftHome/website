/**
 * QrPlaceholder — 二维码占位 SVG（80×80px，点阵纹理）
 */
export default function QrPlaceholder() {
  const dots = [
    [38, 38], [42, 38], [50, 38], [58, 38], [62, 38],
    [38, 42], [46, 42], [54, 42], [62, 42],
    [42, 46], [50, 46], [58, 46],
    [38, 50], [46, 50], [54, 50], [62, 50],
    [42, 54], [46, 54], [58, 54], [62, 54],
    [38, 58], [50, 58], [54, 58],
    [42, 62], [46, 62], [50, 62], [58, 62],
  ];
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="78" height="78" rx="6"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <rect x="10" y="10" width="22" height="22" rx="2"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <rect x="14" y="14" width="14" height="14" rx="1"
        fill="rgba(255,255,255,0.12)" />
      <rect x="48" y="10" width="22" height="22" rx="2"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <rect x="52" y="14" width="14" height="14" rx="1"
        fill="rgba(255,255,255,0.12)" />
      <rect x="10" y="48" width="22" height="22" rx="2"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <rect x="14" y="52" width="14" height="14" rx="1"
        fill="rgba(255,255,255,0.12)" />
      {dots.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3"
          fill="rgba(255,255,255,0.2)" />
      ))}
    </svg>
  );
}
