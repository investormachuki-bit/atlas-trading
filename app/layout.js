import "./globals.css";

export const metadata = {
  title: "ATLAS Trading Intelligence",
  description: "ATLAS algorithmic trading research and intelligence platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}