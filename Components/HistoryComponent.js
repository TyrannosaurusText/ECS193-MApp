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
    ListView,
    ScrollView,
    // AppState,
    Dimensions,
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
// import BackgroundTask from 'react-native-background-task';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

// export default class HistoryComponent extends Component 
class HistoryComponent extends Component 
{
    constructor() 
    {
        super();
    }

    render () 
    {

        // const list = Array.from(this.state.peripherals.values());
        const list = [0, 1, 2, 3, 4];
        const dataSource = ds.cloneWithRows(list);
        
    //     return (
    //         <SafeAreaView>
    //             <Text>Hi</Text>
    //         </SafeAreaView>
    //     );
    // }
    //     const list = Array.from(this.state.peripherals.values());
    //     const dataSource = ds.cloneWithRows(list);

        return (
            <SafeAreaView style = {styles.container}>

                <ScrollView style = {styles.scroll}>
                    // {
                    //     (list.length == 0) &&
                    //     <View style = {{ flex:1, margin: 20 }}>
                    //         <Text style = {{ textAlign: 'center' }}>No peripherals</Text>
                    //     </View>
                    // }
                    <ListView
                        enableEmptySections = {true}
                        dataSource = {dataSource}
                        renderRow = {(item) => {
                            // const color = item.connected ? 'green' : '#fff';
                            return (
                                // <TouchableHighlight onPress={() => this.test(item) }>
                                    <View style={[ styles.row, { backgroundColor: 'green' } ]}>
                                        <Text 
                                            style = {{
                                                fontSize: 12, 
                                                textAlign: 'center', 
                                                color: '#333333', 
                                                padding: 10
                                            }}
                                        >Timestamp: {0}</Text>
                                        <Text 
                                            style = {{
                                                fontSize: 8, 
                                                textAlign: 'center', 
                                                color: '#333333', 
                                                padding: 10
                                            }}
                                        >Reading: {0}</Text>
                                    </View>
                                // </TouchableHighlight>
                            );
                        }}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height
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


export default withGlobalState(HistoryComponent);