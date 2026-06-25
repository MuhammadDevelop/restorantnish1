import './globals.css';

export const metadata = {
  title: 'Bella Vista — Fine Dining Restaurant',
  description: 'Experience the finest cuisine in an unforgettable ambiance. Reserve your table at Bella Vista today.',
  keywords: 'restaurant, fine dining, gourmet, reservation, luxury dining',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
