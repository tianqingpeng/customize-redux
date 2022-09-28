import { combineReducers} from '../../redux';
import counter3 from './counter3';
import counter4 from './counter4';
let rootReducer = combineReducers({
    counter3,
    counter4
});
export default rootReducer;