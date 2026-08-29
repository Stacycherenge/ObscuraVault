
import { VaultProvider } from "@/context/Vaultcontext";
import "@/app/globals.css"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VaultProvider>
          {children}
        </VaultProvider>
      </body>
    </html>
  );
}
