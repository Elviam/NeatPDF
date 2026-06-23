import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MergePDF from './pages/MergePDF'
import SplitPDF from './pages/SplitPDF'
import CompressPDF from './pages/CompressPDF'
import ConvertPDF from './pages/ConvertPDF'
import Navbar from './components/Navbar'
import MyDocuments from './pages/MyDocuments'
import ScrollToTop from './components/ScrollToTop'
import FAQ     from './pages/FAQ'
import Privacy from './pages/Privacy'
import Terms   from './pages/Terms'
import HowToUse from './pages/HowToUse'

function App() {
  return (
    <BrowserRouter>
      <div>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/convert" element={<ConvertPDF />} />
          <Route path="/documents" element={<MyDocuments />} />
          <Route path="/faq"     element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms"   element={<Terms />} />     
          <Route path="/how-to-use" element={<HowToUse />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App