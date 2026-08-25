export const metadata = {
  title: "ATLAS Trading Intelligence",
  description: "ATLAS algorithmic trading research and intelligence platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}