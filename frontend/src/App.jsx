import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MergePDF from './pages/MergePDF'
import SplitPDF from './pages/SplitPDF'
import CompressPDF from './pages/CompressPDF'
import ConvertPDF from './pages/ConvertPDF'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/convert" element={<ConvertPDF />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App