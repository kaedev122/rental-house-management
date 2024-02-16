import './App.css'
import { store } from './redux/store.jsx'
import { Provider } from 'react-redux'
import AppRouter from './routers'

function App() {

		return (
    <Provider store={store}>
			<AppRouter />
		</Provider>)
}

export default App
