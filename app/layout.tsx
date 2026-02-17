import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CameraSentinel from "@/components/CameraSentinel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hireperfect - AI-Enabled Proctored Assessments",
  description: "Secure, AI-monitored online assessments for students, job seekers, and professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CameraSentinel />
        {children}
      </body>
    </html>
  );
}
