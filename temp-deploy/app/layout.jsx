import { Inter, Rubik } from "next/font/google";
import "./globals.css";
var inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});
var rubik = Rubik({
    subsets: ["latin"],
    variable: "--font-rubik",
    display: "swap",
});
export var metadata = {
    title: "ResearchCollab - Research Collaboration Platform",
    description: "Connect with fellow researchers, find collaborators for your projects, join research guilds, and more.",
};
export default function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en" className={"".concat(inter.variable, " ").concat(rubik.variable)}>
      <body className="font-sans">
        {children}
      </body>
    </html>);
}
