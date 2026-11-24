import { Inter, Newsreader } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// The serif of the headlines, see the `headline` utility in globals.css. The
// variable font, with optical sizing so large headlines get finer details.
export const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  variable: "--font-newsreader",
});
