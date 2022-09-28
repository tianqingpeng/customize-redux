import React, { Component } from 'react';
import { bindActionCreators} from '../redux';
import actions from '../store/actions/counter4';
import store from '../store';
const boundActions = bindActionCreators(actions, store.dispatch);
export default class Counter5Counter extends Component {
    unsubscribe;
    constructor(props) {
        super(props);
        this.state = { number: 0 };
    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState({ number: store.getState().counter.number }));
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render() {
        return (
            <div>
                <p>版本4</p>
                <p>{this.state.number}</p>
               <button onClick={boundActions.add2}>+</button>
                <button onClick={boundActions.minus2}>-</button>
                <button onClick={
                    () => {
                        setTimeout(() => {
                           boundActions.add2();
                        }, 1000);
                    }
                }>1秒后加1</button>
            </div>
        )
    }
}