// app/(product)/layout.tsx

import type React from "react";
import { Providers } from "./provider";
import { ProductThemeProvider } from "./theme-provider";
import "./product.css";

type ProductLayoutProps = {
  children: React.ReactNode;
};

export default function ProductLayout({ children }: ProductLayoutProps) {
  return (
    <ProductThemeProvider>
      <Providers>
        <div className="font-sans">{children}</div>
      </Providers>
    </ProductThemeProvider>
  );
}
