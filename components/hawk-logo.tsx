export function HawkLogo({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hawk.png"
      alt="RefinedHawk Logo"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
