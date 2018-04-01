import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import { withGlobalState } from 'react-globally';
import BluetoothComponent from './BluetoothComponent';

class DashboardComponent extends Component
{
    constructor ()
    {
        super();

        this._signIn = this._signIn.bind(this);
        this._signOut = this._signOut.bind(this);
        this._showGlobalState = this._showGlobalState.bind(this);
    }

    componentDidMount ()
    {
        //Sign in configuration
        GoogleSignin
            .hasPlayServices({ autoResolve: true }).then(() => {
                this.props.setGlobalState({signInCapable: true});
                GoogleSignin
                    .configure({
                        iosClientId: '671445578517-8heborte0ukh0f5bt3tee02ttk9m3f3a.apps.googleusercontent.com',
                        webClientId: '671445578517-ogrl80hb1pnq5ruirarvjsmvd8th2hjp.apps.googleusercontent.com'
                    })
                    .then(() => { console.log('Configured'); })
            })
            .catch((err) => {
                console.log("Play services error", err.code, err.message);
            });
    }

    render ()
    {
        let signFunc = this.props.globalState.email != '' ? this._signOut : this._signIn;
        let signText = this.props.globalState.email != '' ? 'Sign Out' : 'Sign In';

        return (
            <SafeAreaView style = {{
                flex: 1, 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center'
            }}>
                <Button
                    title = {signText}
                    onPress = {signFunc}
                />
                <Button
                    title = 'Bluetooth Config'
                    onPress = {() => this.props.navigation.navigate('Bluetooth')}
                />
                <Button
                    title = 'Debug Global State'
                    onPress = {this._showGlobalState}
                />
            </SafeAreaView>
        );
    }

    //SIGN IN METHODS

    _signIn ()
    {
        GoogleSignin
            .signIn()
            .then((user) => {
                //console.log('User:');
                //console.log(user);

                //console.log('Checking Validity');
                fetch('https://majestic-legend-193620.appspot.com/security/getAuth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessToken: user.accessToken
                    })
                })
                .then((res) => res.json())
                .then((json) => {
                    console.log('RES');
                    console.log(json);
                    if (json.hasOwnProperty('err'))
                    {
                        GoogleSignin.signOut()
                            .then(() => {})
                            .catch((err) => {});
                    }
                    else
                    {
                        this.props.setGlobalState({
                            email: json.email,
                            id: json.id,
                            authCode: json.authCode
                        });
                    }
                })
                .catch((err) => {
                    console.log('ERR');
                    console.log(err);
                    this.props.setGlobalState({
                        email: '',
                        id: -1,
                        authCode: ''
                    });
                });
            })
            .catch((err) => {
                console.log('BAD SIGNIN', err);
                this.props.setGlobalState({
                    email: '',
                    id: -1,
                    authCode: ''
                });
            })
            .done();
    }

    _signOut ()
    {
        fetch('https://majestic-legend-193620.appspot.com/security/revokeAuth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.props.globalState.email,
                authCode: this.props.globalState.authCode,
                accType: 'patient'
            })
        })
        .then((res) => res.json())
        .then((json) => {
            if (!json.hasOwnProperty('err'))
            {
                //console.log('Signed Out');
                this.props.setGlobalState({
                    email: '',
                    id: -1,
                    authCode: ''
                });
                GoogleSignin.revokeAccess()
                    .then(() => {})
                    .catch((err) => {});
            }
        })
        .catch((err) => {
            console.log('ERR');
            console.log(err);
        });
    }

    _showGlobalState ()
    {
        console.log(this.props.globalState);
    }
}

export default withGlobalState(DashboardComponent);