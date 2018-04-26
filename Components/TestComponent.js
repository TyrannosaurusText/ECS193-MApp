import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-navigation';

export default class TestComponent extends Component
{
    // static navigationOptions = {
    //     title: 'Testing State'
    // };

    constructor ()
    {
        super();
        this.state = {
            count: 0
        };

        setInterval(() => {
            this.setState((previousState) => {
                return {count: previousState.count + 1}
            });
        }, 1000);
    }

    render ()
    {
        var cnt = this.state.count;
        return (
            <SafeAreaView>
                <Text>Current Count: {cnt}</Text>
            </SafeAreaView>
        );
    }
}