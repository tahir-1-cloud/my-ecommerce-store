import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import AppToaster from "@/components/Common/AppToaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>{children}
          <AppToaster />
      </body>

    </html>
  );
}