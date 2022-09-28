function combineReducers(reducers){
    console.log(reducers, '--reducers');
    return function combination(state={},action){
       let nextState = {};
       for(let key in reducers){
         nextState[key]=reducers[key](state[key],action);
       }
       console.log(nextState,' nextState');
       return nextState;
    }
}
export default combineReducers;
