import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Solar from "./pages/Solar.tsx";
import Commercial from "./pages/Commercial.tsx";
import Agricultural from "./pages/Agricultural.tsx";
import Residential from "./pages/Residential.tsx";
import Privacy from "./pages/Privacy.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  // Light unless the visitor flips the navbar switch. color-scheme is left to index.css, because an
  // inline "light" here would override index.html's opt-out from browsers' forced dark modes.
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} enableColorScheme={false}>
    {/* Visitors whose device asks for less motion get the fades without the slides */}
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/solar" element={<Solar />} />
            <Route path="/commercial" element={<Commercial />} />
            <Route path="/agricultural" element={<Agricultural />} />
            <Route path="/residential" element={<Residential />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </ThemeProvider>
);

export default App;
