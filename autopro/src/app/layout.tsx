import "../styles/globals.css";

export const metadata = { title: "Car Buyer Demo" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-gramm="false">
      <body className="flex" data-gramm="false">
        {children}
      </body>
    </html>
  );
}
