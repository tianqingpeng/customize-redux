import { createStore } from '../redux';
import reducer from './reducers';

const store = createStore(reducer, { counter3: { number: 0 }, counter4: { number: 0 } });

console.log('--store', store)
export default store;