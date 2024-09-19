import './App.css'
import Routes from './routes'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <div className='md:bg-stone-100 w-full h-full'>
      <Routes />
      <Toaster />
    </div>
  )
}

export default App
