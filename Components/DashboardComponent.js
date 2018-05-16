import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    AppState,
    AsyncStorage,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
// import { GoogleSignin, GoogleSigninButton } from 'react-native-community';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PushNotification from 'react-native-push-notification';

import BluetoothComponent from './BluetoothComponent';
import AlertsComponent from './AlertsComponent';
import PushNotificationComponent from './PushNotificationComponent';
import { ProgressCircle }  from 'react-native-svg-charts'

class DashboardComponent extends Component
{
    // static navigationOptions = ({ navigation }) => ({
    //     headerTitle: 'Dashboard',
    //     headerRight: (<Icon name="notifications" size={30} onPress={() => navigation.navigate('Alerts')}/>),
    // });

    constructor ()
    {
        super();
        this._signIn = this._signIn.bind(this);
        this._signOut = this._signOut.bind(this);
        this._showGlobalState = this._showGlobalState.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.sendNotification = this.sendNotification.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.storeItem = this.storeItem.bind(this);
    }

    componentDidMount ()
    {
        AppState.addEventListener('change', this.handleAppStateChange);

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

        var newHistory = [];

        this.retrieveItem("historyRecord").then((historyRecord) => {
            var historyArr = historyRecord.split(',');
            var historyCount = historyArr[0];

            for(var i = 1; i < 2 * historyCount;) {
                newHistory.push({"time": historyArr[i], "alert": historyArr[i + 1]})
                i = i + 2;
            }

            this.props.setGlobalState({
                history: newHistory
            });
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange(appState) {
        // if (appState === 'background') {
        //   // Schedule a notification
        //     PushNotification.localNotificationSchedule({
        //         message: 'Scheduled delay notification message', // (required)
        //         date: new Date(Date.now() + (3 * 1000)) // in 3 secs
        //     });
        // }
    };

    sendNotification() {
        var fullNess = Math.floor(Math.random() * 100);
        PushNotification.localNotification({
            message: 'Fullness: ' + fullNess + '%'
        });

        var newHistory = this.props.globalState.history;
        if(newHistory.length == 10) {
            newHistory.splice(0,1);
        }
        var da = new Date();
        var y = da.getFullYear();
        var m = (da.getMonth() + 1);
        m = (m < 10 ? '0' : '') + m;
        var d = da.getDate();
        d = (d < 10 ? '0' : '') + d;
        var h = da.getHours();
        h = (h < 10 ? '0' : '') + h;
        var mi = da.getMinutes();
        mi = (mi < 10 ? '0' : '') + mi;
        var s = da.getSeconds();
        s = (s < 10 ? '0' : '') + s;
        var utc = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
        newHistory.push({"time": utc.toString(), "alert": fullNess.toString()});
        
        this.props.setGlobalState({
            history: newHistory
        });

        // console.log("Stringify: " + newHistory[0]);
        var historyRecord = newHistory.length.toString();
        for(var i = 0; i < newHistory.length; i++) {
            historyRecord = historyRecord + ',' + newHistory[i].time + ',' + newHistory[i].alert;
        }

        console.log("historyRecord: " + historyRecord);

        this.storeItem("historyRecord", historyRecord).then((count) => {
                //this callback is executed when your Promise is resolved
                alert("Success writing");
                }).catch((error) => {
                //this callback is executed when your Promise is rejected
                console.log('Promise is rejected with error: ' + error);
        });
    };

    render ()
    {
        let signFunc = this.props.globalState.email != '' ? this._signOut : this._signIn;
        let signText = this.props.globalState.email != '' ? 'Sign Out' : 'Sign In';
        
        return (
            <SafeAreaView style = {{
                flex: 1, 
                flexDirection: 'column',
                justifyContent: 'center', 
                // alignItems: 'center'
            }}> 

                <ProgressCircle
                    style={ { height: 200 } }
                    progress={ 0.7 }
                    progressColor={'rgb(134, 65, 244)'}
                    startAngle={ -Math.PI * 0.8 }
                    endAngle={ Math.PI * 0.8 }
                />
                <Button
                    title = {signText}
                    onPress = {signFunc}
                />
                <Button title='Press here for a notification'
                    onPress={this.sendNotification} />
                <PushNotificationComponent />
 
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
                console.log(user);
                console.log(user.accessToken);
                //console.log('Checking Validity');
                fetch('https://majestic-legend-193620.appspot.com/security/getAuth', {
                // fetch('http://192.168.43.198:8080/security/getAuth', {
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

    async storeItem(key, item) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            // var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            var jsonOfItem = await AsyncStorage.setItem(key, item);
            return jsonOfItem;
        } catch (error) {
          console.log(error.message);
        }
    }

    //the functionality of the retrieveItem is shown below
    async retrieveItem(key) {
        try {
          const retrievedItem =  await AsyncStorage.getItem(key);
          // const item = JSON.parse(retrievedItem);
          const item = retrievedItem;
          return item;
        } catch (error) {
          console.log(error.message);
        }
    }

}

export default withGlobalState(DashboardComponent);