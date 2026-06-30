import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>AddressKit Examples</h1>
      <p>Select an example to view:</p>
      <ul style={{ lineHeight: 2 }}>
        <li>
          <Link href="/libaddress">libaddressinput Provider (7 countries)</Link>
        </li>
        <li>
          <Link href="/dr5hn">dr5hn Provider (250 countries)</Link>
        </li>
        <li>
          <Link href="/headless">Headless API</Link>
        </li>
        <li>
          <Link href="/rhf">React Hook Form Integration</Link>
        </li>
        <li>
          <Link href="/country-restricted">Country-Restricted</Link>
        </li>
      </ul>
    </div>
  );
}
