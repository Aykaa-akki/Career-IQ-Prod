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
      <BrowserRouter basename="/career-iq">
        <Routes>
          {/* Home page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Order/Checkout page */}
          <Route path="/checkout" element={<OrderPage />} />
          
          {/* Processing page - Initial report generation */}
          <Route path="/Intelligence_report_generation/:sessionId" element={<ProcessingPage />} />
          
          {/* Report page - Initial verdict */}
          <Route path="/Intelligence_report_verdict/:sessionId" element={<ReportPage />} />
          
          {/* Upsell processing - Complete analysis generation */}
          <Route path="/complete_analyis_generation/:sessionId" element={<ProcessingPage isUpsell={true} />} />
          
          {/* Upsell report - Complete analysis */}
          <Route path="/complete_analyis/:sessionId" element={<ReportPage />} />
          
          {/* Legacy routes (redirect support) */}
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
