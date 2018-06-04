import React, { Component } from 'react';
import {
    // AppRegistry,
    StyleSheet,
    Text,
    View,
    // TouchableHighlight,
    // NativeAppEventEmitter,
    // NativeEventEmitter,
    // NativeModules,
    // Platform,
    // PermissionsAndroid,
    Button,
    Spacer,
    ListView,
    ScrollView,
    AppState,
    Dimensions,
    Linking
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, Grid } from 'react-native-svg-charts'
import FeedbackComponent from './FeedbackComponent';
import { withNavigation } from 'react-navigation';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class ProfileComponent extends Component 
{
    constructor() 
    {
        super();
    }

    render () 
    {
        const {navigate} = this.props.navigation;
        
        return (

            <SafeAreaView>
            {   
                (this.props.globalState.givenName == '') && <View style = {{height: window.height * 0.8, width: window.width}}>
                <Text style = {{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>Please sign in first</Text>
                </View>
            }
            {   (this.props.globalState.givenName != '') && <View>

                <View style={{height:window.height * 0.3}}>
                    <Text style={{fontWeight: 'bold', fontSize: 20}}>Personal Information:</Text>
                    <Text style={{fontSize: 15}}>{this.props.globalState.givenName}, {this.props.globalState.familyName}</Text>
                    <Text style={{fontSize: 15}}>{this.props.globalState.email}</Text>
                </View>
                <View style={{height:window.height * 0.3}}>
                    <Text style={{fontWeight: 'bold', fontSize: 20}}>Doctor Information:</Text>
                    <Text style={{fontSize: 15}}>{this.props.globalState.doctorGivenName}, {this.props.globalState.doctorFamilyName}</Text>
                    <Text style={{fontSize: 15}}>{this.props.globalState.doctorEmail}</Text>
                </View>

                <View style={{marginTop:window.height*0.05, marginRight:window.width*0.25, marginLeft:window.width*0.25}} >                
                <View style = {{marginTop: window.height * 0.01}}>
                    <Button
                        title = "Contact your doctor"
                        onPress={() => Linking.openURL('mailto:' + this.props.globalState.doctorEmail) } 
                    />
                </View>
                </View>
                </View>
            }

            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
});


export default withGlobalState(ProfileComponent);