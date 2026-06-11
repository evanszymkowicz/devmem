"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// App-wide toast host. The app forces dark mode on <html> (no next-themes), so we
// pin the toaster theme to "dark" rather than reading a theme provider.
function Toaster(props: ToasterProps) {
  return <Sonner theme="dark" richColors closeButton {...props} />;
}

export { Toaster };
