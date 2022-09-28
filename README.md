## 1. Redux应用场景

## 1. Redux应用场景

1. Redux应用场景

* 随着 JavaScript 单页应用开发日趋复杂,管理不断变化的 state 非常困难
* Redux的出现就是为了解决state里的数据问题
* 在React中，数据在组件中是单向流动的
* 数据从一个方向父组件流向子组件(通过props)，由于这个特征，两个非父子关系的组件（或者称作兄弟组件）之间的通信就比较麻烦

## 2. Redux设计思想

* Redux是将整个应用状态存储到到一个地方，称为store
* 里面保存一棵状态树state tree
* 组件可以派发dispatch行为action给store,而不是直接通知其它组件
* 其它组件可以通过订阅store中的状态(state)来刷新自己的视图

## 3. Redux三大原则

* 整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中
* State 是只读的，惟一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象 使用纯函数来执行修改，为了描述action如何改变state tree ，你需要编写 reducers
* 单一数据源的设计让React的组件之间的通信更加方便，同时也便于状态的统一管理

## 4. createStore.js

```javascript
    const createStore = (reducer, preloadedState) => {
    let state=preloadedState;
    let listeners = [];
    function getState() {
      return state;
    }
    function dispatch(action) {
      state = reducer(state, action);
      console.log(state, 'state-');
      listeners.forEach(l => l());

      console.log(action, 'action-');
      return action;
    }
    function subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    }
    dispatch({ type: '@@REDUX/INIT' });
    return {
      getState,
      dispatch,
      subscribe
    }
  }
  export default createStore;
```

## 5. bindActionCreators.js

```javascript
    function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args))
    }
    }

    export default function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch)
    }
    const boundActionCreators = {}
    for (const key in actionCreators) {
        const actionCreator = actionCreators[key]
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }
    return boundActionCreators
}
```

## 6. combineReducers.js

```javascript
    function combineReducers(reducers){
    return function combination(state={},action){
       let nextState = {};
       for(let key in reducers){//key=x
         nextState[key]=reducers[key](state[key],action);
       }
       return nextState;
    }
}
export default combineReducers;
```

## 7. react-redux/connect.js

```javascript
    import React, { useContext, useMemo, useReducer, useLayoutEffect } from 'react';
import ReactReduxContext from './ReactReduxContext';
import { bindActionCreators } from '../redux';
/**
 * PureComponent当属性和状态没有变化的时候不重新渲染
 * 刚才做的优化是有些值只计算一次，不需要反复计算
 * 因为函数组件没有构造函数，没有地方说只能执行一次，只能用useMemo
 * @param {*} mapStateToProps 把仓库中状态映射为当前的组件的属性
 * @param {*} mapDispatchToProps 把派发动作的方法映射为组件的属性
 */
 function connect(mapStateToProps, mapDispatchToProps) {
    return function (OldComponent) {
        return function (props) {
            const { store } = useContext(ReactReduxContext);
            const { getState, dispatch, subscribe } = store;
            const prevState = getState();
            const stateProps = useMemo(() => mapStateToProps(prevState), [prevState]);
            let dispatchProps = useMemo(() => {
                console.log('dispatchProps render');
                let dispatchProps;
                if (typeof mapDispatchToProps === 'function') {
                    dispatchProps = mapDispatchToProps(dispatch);
                } else if (typeof mapDispatchToProps === 'object') {
                    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
                } else {
                    dispatchProps = { dispatch };
                }
                return dispatchProps;
            }, [dispatch]);
            const [, forceUpdate] = useReducer(x => x + 1, 0);
            useLayoutEffect(() => {
                return subscribe(forceUpdate);
            }, [subscribe]);
            
            //18版本时候可以用新提供的api去订阅处理 useSyncExternalStore
            return <OldComponent {...props} {...stateProps} {...dispatchProps} />
        }
    }
}
export default connect;

```

## 8. react-redux/hook/useDispatch.js

```javascript
    import {useContext} from 'react';
import ReactReduxContext from '../ReactReduxContext';

const  useDispatch = ()=>{
    const {store} = useContext(ReactReduxContext);
    return store.dispatch;
}
export default  useDispatch 
```

## 8. react-redux/hook/ReactReduxContext.js

```javascript
    import React from 'react';
export const ReactReduxContext = React.createContext(null)
export default ReactReduxContext;
```

## 9. react-redux/hook/useSelector.js

```javascript
import {useContext,useLayoutEffect,useReducer,useRef} from 'react';
import { shallowEqual } from '../';
import ReactReduxContext from "../ReactReduxContext";
function useSelector(selector,equalityFn=shallowEqual){
    const {store} = useContext(ReactReduxContext);
    let lastSelectedState = useRef(null);
    //获取仓库中的最新的状态
    let state = store.getState();
    let selectedState = selector(state);
    //每次计算完selectedState之后会判断状态变化了没有，如果变化 了，组件会刷新，如果没变化组件不刷新
    let [,forceUpdate] = useReducer(x=>x+1,0);
    useLayoutEffect(()=>store.subscribe(()=>{
        //比较老状态和新选中状态是否相等，如果相等，不刷新
        let selectedState = selector(store.getState());
        if(!equalityFn(lastSelectedState.current,selectedState)){
            console.log('重新渲染');
            forceUpdate();
            lastSelectedState.current = selectedState;
        }
    }),[]);
    //如何获取 最新的状态值  定义useEffect,然后给lastSelectedState.current赋值，可以在任何地方通过                  lastSelectedState.current取到新的值
    return selectedState;
}
export default useSelector;
```

## 10. react-redux/hook/useBoundDispatch.js

```javascript
  import React from 'react';
  import { bindActionCreators } from '../../redux';
  import ReactReduxContext from '../ReactReduxContext';
  function useBoundDispatch(actions){
    const {store} = React.useContext(ReactReduxContext);
    let boundActions = bindActionCreators(actions,store.dispatch);
    return boundActions;
  }
```


1. Redux应用场景

* 随着 JavaScript 单页应用开发日趋复杂,管理不断变化的 state 非常困难
* Redux的出现就是为了解决state里的数据问题
* 在React中，数据在组件中是单向流动的
* 数据从一个方向父组件流向子组件(通过props)，由于这个特征，两个非父子关系的组件（或者称作兄弟组件）之间的通信就比较麻烦

## 2. Redux设计思想

* Redux是将整个应用状态存储到到一个地方，称为store
* 里面保存一棵状态树state tree
* 组件可以派发dispatch行为action给store,而不是直接通知其它组件
* 其它组件可以通过订阅store中的状态(state)来刷新自己的视图

## 3. Redux三大原则

* 整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中
* State 是只读的，惟一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象 使用纯函数来执行修改，为了描述action如何改变state tree ，你需要编写 reducers
* 单一数据源的设计让React的组件之间的通信更加方便，同时也便于状态的统一管理

## 4. createStore.js

```javascript
    const createStore = (reducer, preloadedState) => {
    let state=preloadedState;
    let listeners = [];
    function getState() {
      return state;
    }
    function dispatch(action) {
      state = reducer(state, action);
      console.log(state, 'state-');
      listeners.forEach(l => l());

      console.log(action, 'action-');
      return action;
    }
    function subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    }
    dispatch({ type: '@@REDUX/INIT' });
    return {
      getState,
      dispatch,
      subscribe
    }
  }
  export default createStore;
```

## 5. bindActionCreators.js

```javascript
    function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args))
    }
    }

    export default function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch)
    }
    const boundActionCreators = {}
    for (const key in actionCreators) {
        const actionCreator = actionCreators[key]
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }
    return boundActionCreators
}
```

## 6. combineReducers.js

```javascript
    function combineReducers(reducers){
    return function combination(state={},action){
       let nextState = {};
       for(let key in reducers){//key=x
         nextState[key]=reducers[key](state[key],action);
       }
       return nextState;
    }
}
export default combineReducers;
```

## 7. react-redux/connect.js

```javascript
    import React, { useContext, useMemo, useReducer, useLayoutEffect } from 'react';
import ReactReduxContext from './ReactReduxContext';
import { bindActionCreators } from '../redux';
/**
 * PureComponent当属性和状态没有变化的时候不重新渲染
 * 刚才做的优化是有些值只计算一次，不需要反复计算
 * 因为函数组件没有构造函数，没有地方说只能执行一次，只能用useMemo
 * @param {*} mapStateToProps 把仓库中状态映射为当前的组件的属性
 * @param {*} mapDispatchToProps 把派发动作的方法映射为组件的属性
 */
 function connect(mapStateToProps, mapDispatchToProps) {
    return function (OldComponent) {
        return function (props) {
            const { store } = useContext(ReactReduxContext);
            const { getState, dispatch, subscribe } = store;
            const prevState = getState();
            const stateProps = useMemo(() => mapStateToProps(prevState), [prevState]);
            let dispatchProps = useMemo(() => {
                console.log('dispatchProps render');
                let dispatchProps;
                if (typeof mapDispatchToProps === 'function') {
                    dispatchProps = mapDispatchToProps(dispatch);
                } else if (typeof mapDispatchToProps === 'object') {
                    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
                } else {
                    dispatchProps = { dispatch };
                }
                return dispatchProps;
            }, [dispatch]);
            const [, forceUpdate] = useReducer(x => x + 1, 0);
            useLayoutEffect(() => {
                return subscribe(forceUpdate);
            }, [subscribe]);
            return <OldComponent {...props} {...stateProps} {...dispatchProps} />
        }
    }
}
export default connect;

```

## 8. react-redux/hook/useDispatch.js

```javascript
    import {useContext} from 'react';
import ReactReduxContext from '../ReactReduxContext';

const  useDispatch = ()=>{
    const {store} = useContext(ReactReduxContext);
    return store.dispatch;
}
export default  useDispatch 
```

## 8. react-redux/hook/ReactReduxContext.js

```javascript
    import React from 'react';
export const ReactReduxContext = React.createContext(null)
export default ReactReduxContext;
```

## 9. react-redux/hook/useSelector.js

```javascript
import {useContext,useLayoutEffect,useReducer,useRef} from 'react';
import { shallowEqual } from '../';
import ReactReduxContext from "../ReactReduxContext";
function useSelector(selector,equalityFn=shallowEqual){
    const {store} = useContext(ReactReduxContext);
    let lastSelectedState = useRef(null);
    //获取仓库中的最新的状态
    let state = store.getState();
    let selectedState = selector(state);
    //每次计算完selectedState之后会判断状态变化了没有，如果变化 了，组件会刷新，如果没变化组件不刷新
    let [,forceUpdate] = useReducer(x=>x+1,0);
    useLayoutEffect(()=>store.subscribe(()=>{
        //比较老状态和新选中状态是否相等，如果相等，不刷新
        let selectedState = selector(store.getState());
        if(!equalityFn(lastSelectedState.current,selectedState)){
            console.log('重新渲染');
            forceUpdate();
            lastSelectedState.current = selectedState;
        }
    }),[]);
    //如何获取 最新的状态值  定义useEffect,然后给lastSelectedState.current赋值，可以在任何地方通过                  lastSelectedState.current取到新的值
    return selectedState;
}
export default useSelector;
```

## 10. react-redux/hook/useBoundDispatch.js

```javascript
  import React from 'react';
  import { bindActionCreators } from '../../redux';
  import ReactReduxContext from '../ReactReduxContext';
  function useBoundDispatch(actions){
    const {store} = React.useContext(ReactReduxContext);
    let boundActions = bindActionCreators(actions,store.dispatch);
    return boundActions;
  }
```
