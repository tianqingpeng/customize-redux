import React from 'react';
import {useDispatch,useSelector} from '../react-redux';
function Counter1(){
    let state = useSelector(state=>state.counter3);//状态映射函数 connect(mapStateToProps)
    let dispatch = useDispatch();
    return (
        <div>
               <p>{state.number}</p>
               <button onClick={()=>dispatch({type:'ADD1'})}>+</button>
           </div>
    )
}
export default Counter1;