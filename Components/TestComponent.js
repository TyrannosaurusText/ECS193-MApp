import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
                <Icon name="notifications" size={30}/>
            </SafeAreaView>
        );
    }
}