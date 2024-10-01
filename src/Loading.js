import React, { useRef } from 'react'
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native'
import FastImage from 'react-native-fast-image'

// import video from './assets/loading.mp4'

const Loading = () => {

    const videoRef = useRef(null)

  return (
    <View style={styles.container}>
        {/* <Text style={{fontSize: 25}}>로딩중이야!!</Text> */}
        <FastImage source={require('./assets/png/dovi.gif')} 
            style={styles.loading}
            resizeMode='contain' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading : {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 1.1
  }
});

export default Loading