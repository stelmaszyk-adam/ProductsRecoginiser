import React from 'react';
import { StyleSheet, View, TouchableHighlight, Text, Button, Image, ActivityIndicator, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CaptureButton from '../component/CaptureButton';
import RNFetchBlob from 'rn-fetch-blob';
import Tts from 'react-native-tts';

const url = 'TODO set correct url';

export default class OnlyOneMainView extends React.Component {
    constructor(props) {
        super(props);

        Tts.setDefaultPitch(1)
        Tts.setDefaultRate(0.5)

        this.state = {
            getText: 'Prediction text',
            loading: false,
            buttonDisabled: false,
            uri: '',
            probability: 0,
            voices: [],
            ttsStatus: "initiliazing",
            selectedVoice: null,
            speechRate: 0.1,
            speechPitch: 1,
        };
    }

    initTts = async () => {
        const voices = await Tts.voices();
        const availableVoices = voices
            .filter(v => !v.networkConnectionRequired && !v.notInstalled)
            .map(v => {
                return { id: v.id, name: v.name, language: v.language };
            });
        let selectedVoice = null;
        if (voices && voices.length > 0) {
            selectedVoice = voices[0].id;
            try {
                await Tts.setDefaultLanguage(voices[0].language);
            } catch (err) {
                // My Samsung S9 has always this error: "Language is not supported"
                console.log(`setDefaultLanguage error `, err);
            }
            await Tts.setDefaultVoice(voices[0].id);
            this.setState({
                voices: availableVoices,
                selectedVoice,
                ttsStatus: 'initialized',
            });
        } else {
            this.setState({ ttsStatus: 'initialized' });
        }
    };

    takePicture = async function () {
        if (this.camera) {
            // Pause the camera's preview
            //   this.camera.pausePreview();

            // Set the activity indicator
            this.setState((previousState, props) => ({
                loading: true,
            }));

            // Set options
            const options = {
                base64: true,
                quality: 0.8,
            };

            const data = await this.camera
                .takePictureAsync(options)

                .then(data => {
                    this.uploadPhoto(data);

                });
        }
    };

    uploadPhoto = data => {
        RNFetchBlob.fetch(
            'POST',
            url,
            {
                'Prediction-Key': 'TODO put set Prediction Key',
                // 'Prediction-Key': 'a86f2ec994de4e97b3cbe35f6d565cf7',
                'Content-Type': 'application/octet-stream',
            },
            [
                {
                    name: 'ketchup.jpg',
                    filename: 'ketchup.jpg',
                    type: data.type,

                    data: data.base64,
                },
            ],
        )
            .then(response => {
                this.setState((prevState, props) => ({
                    loading: false,
                }));
                console.log('upload succes');
                var dataJSON = JSON.parse(response.data)
                dataJSON.predictions.forEach(singleData => {
                    if (this.state.probability < singleData.probability) {
                        this.setState({
                            probability: singleData.probability,
                            getText: 'Chocolate: ' + singleData.tagName
                        })
                    }
                })
                // alert('Load correct');
                Tts.speak(this.state.getText);
                this.setState({ probability: 0 })
            })
            .catch(error => {
                this.setState((prevState, props) => ({
                    loading: false,
                }));
                console.log('upload error', error);
                alert('Upload failed!');
            });
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.textContainer}>
                    <Text style={styles.textStyle}>{this.state.getText}</Text>
                </View>
                <View style={{ flex: 5 }}>
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={styles.preview}>
                        <ActivityIndicator
                            size="large"
                            style={styles.loadingIndicator}
                            color="#fff"
                            animating={this.state.loading}
                        />
                    </RNCamera>
                </View>
                <View style={styles.container}>
                    <TouchableHighlight style={styles.imageTouchable}
                        disabled={this.state.buttonDisabled}
                    >
                        <Image resizeMode="cover" style={styles.image} source={require('../image/changer.png')} />
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.imageTouchable}
                        disabled={this.state.loading}
                        onPress={this.takePicture.bind(this)}>
                        <Image resizeMode="cover" style={styles.image} source={require('../image/camera.png')} />
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.imageTouchable}
                        disabled={this.state.buttonDisabled}>
                        <Image resizeMode="cover" style={styles.image} source={require('../image/speaker.png')} />
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#008AD7',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        // width: "90%",
        alignSelf: "center",
        // borderRadius: 3,
        backgroundColor: '#008AD7'
        // margin:10,
    },
    switchToServices: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textToServices: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    imageTouchable: {
        flex: 1,
        borderColor: "#000000",
        borderWidth: 2,
        backgroundColor: '#ffff',
        borderRadius: 3,
        margin: 10,
        backgroundColor: '#17c0d1'
    },
    image: {
        padding: 10,
        margin: 10,
        width: "80%",
        height: "80%",
        alignSelf: "center",

    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
    loadingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});