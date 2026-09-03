/* src/app/layout.tsx */
import './globals.css';

export const metadata = {
  title: 'V.A.R.U.N.A. - Oil Spill Fingerprinting System',
  description: 'Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}