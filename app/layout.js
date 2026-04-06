import "./globals.css";

export const metadata = {
  title: "College Complaint Management System",
  description: "JUIT Complaint Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
