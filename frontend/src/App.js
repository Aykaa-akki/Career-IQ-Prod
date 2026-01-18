import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import OrderPage from "./pages/OrderPage";
import ReportPage from "./pages/ReportPage";
import ProcessingPage from "./pages/ProcessingPage";
import { captureUTMParams, pushUTMToDataLayer } from "./utils/utm";
import "./App.css";

function App() {
  // Capture UTM parameters on app load
  useEffect(() => {
    captureUTMParams();
    pushUTMToDataLayer();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/:tier" element={<OrderPage />} />
          <Route path="/processing/:sessionId" element={<ProcessingPage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
