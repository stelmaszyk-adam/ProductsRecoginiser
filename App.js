import React  from 'react';
import { StyleSheet, View } from 'react-native';
// import MainApp from './src/common/MainApp';
import OnlyOneMainView from './src/common/OnlyOneMainView';

export default class App extends React.Component {

    constructor(props){
        super(props);
        
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <OnlyOneMainView />
            </View>
        );
    }
}

