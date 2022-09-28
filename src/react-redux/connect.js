
import React, { useContext, useMemo, useReducer, useLayoutEffect } from 'react';
import ReactReduxContext from './ReactReduxContext';
import { bindActionCreators } from '../redux';
/**
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