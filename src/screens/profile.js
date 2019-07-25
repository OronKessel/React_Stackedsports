import React, {Component} from 'react';
import {Alert,TouchableOpacity,StatusBar, View,Image,Text,Linking} from 'react-native';
import Dialog from "react-native-dialog";
import Spinner from 'react-native-loading-spinner-overlay';
import {serviceGetAthlete} from '../api/organization/athlete';
import call from 'react-native-phone-call'
import Communications from 'react-native-communications';
import Composer from 'react-native-message-composer';

import Styles from '../common/style';

const { styles } = Styles;

var self= null;
export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    self = this;    
    const {state} = props.navigation;    
    this.state = {
        userInfo:state.params.userInfo,
        info:state.params.athInfo,
        messages:[],
        isVisibleSpin:false
    }
    
  }
  componentDidMount()
  {   
    self.setState({isVisibleSpin:true});
    this.webGetAthleteInfo()
  }  
  renderSeparator()
  {
    return(
        <View style={{backgroundColor:'#323E49',height:1}}>
          
        </View>
      );
  } 

  spinnerStyle = function () {
    return {
      alignSelf:'center',
      justifyContent:'center',
      position:'absolute',
      top:0,
      bottom:0
    }
  }
  
  
  renderLoading = () => {
        if (this.state.isVisibleSpin) 
            return (
                <View style={this.spinnerStyle()}>
                    <Spinner visible={true}/>
                </View>
            );
        else
            return null;
  }
  
  clickItem(item,index)
  {
    this.props.navigation.navigate('ConversationScreen',{athlet:item,userInfo:self.state.userInfo});
  }
  clickSms()
  {
    //Communications.text(this.state.info.phone, '');
    Composer.composeMessageWithArgs(
        {
            'messageText':'Message',
            'subject':'New',
            'recipients':[this.state.info.phone],
            'presentAnimated': true,
            'dismissAnimated': false,
            'attachments':[
                {
                  url: 'http://192.168.1.105:8088/Hoppi/upload/1562054620_0.jpg',               // required
                  typeIdentifier: 'public.jpeg',   // required
                  filename: 'pic.jpg',             // optional
                 }
              ]
           },
        (result) => {
            switch(result) {
                case Composer.Sent:
                    console.warn('the message has been sent');
                    break;
                case Composer.Cancelled:
                    console.warn('user cancelled sending the message');
                    break;
                case Composer.Failed:
                    console.warn('failed to send the message');
                    break;
                case Composer.NotSupported:
                    console.warn('this device does not support sending texts');
                    break;
                default:
                    console.warn('something unexpected happened');
                    break;
            }
        }
    );

  }
  clickPhoneCall()
  {
    const args = {
        number: this.state.info.phone,
        prompt: false
    }
    call(args).catch(console.error);
  }
  webGetAthleteInfo()
  {    
    serviceGetAthlete(this.state.info.id)
    .then(res=>{        
        console.warn(res);
        self.setState({isVisibleSpin:false,info:res});
    })
    .catch(err=>{
        self.setState({isVisibleSpin:false});
    });
  }
  render() {
    return (              
        <View style={[styles.bg,styles.flexFull]}>        
            <StatusBar hidden={true} />
            <View style={[styles.vwTopBar]}>
                <View style={{flex:1,flexDirection:'row'}}>
                    <TouchableOpacity style={{marginLeft:10,width:35,height:35,padding:10}} onPress={()=>this.props.navigation.goBack()}>
                        <Image style={[styles.img15]} source={require('../assets/back-512.png')}/>
                    </TouchableOpacity>
                    <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                        <TouchableOpacity style={{marginRight:10,padding:10}} onPress={()=>this.props.navigation.goBack()}>
                            <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                                <Text style={{color:'#fff',fontSize:14,textAlign:'center'}}>Done</Text>                            
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[{position:'absolute',alignItems:'center',paddingTop:15}]}>
                    <TouchableOpacity>
                        <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                            <Text style={[styles.textColorBlue,{fontSize:16,textAlign:'center'}]}>Profile</Text>                            
                        </View>
                    </TouchableOpacity>
                </View>                          
            </View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440'}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={[styles.whiteColor,{fontSize:14}]}>{this.state.info.first_name} {this.state.info.last_name}</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:14}}>{self.state.info.twitter_profile.screen_name != null?'@':null}{self.state.info.twitter_profile.screen_name}{self.state.info.phone != null?' - ':null}{self.state.info.phone}</Text>                        
                    </View>
                </View>
                <View>
                    <Image style={[styles.img50,{borderRadius:25}]} source={{uri:this.state.info.twitter_profile.profile_image}}/>
                </View>      
            </View>
            <View style={{backgroundColor:'#25313C',flexDirection:'row',alignItems:'center',padding:10}}>                          
                <Text style={{color:'#D8D8D8',fontSize:14,paddingLeft:10}}>GENERAL INFO</Text>
            </View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:12}}>Mobile</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <Text style={{color:'#fff',fontSize:14}}>{self.state.info.phone}</Text>                        
                    </View>
                </View>
                {
                    this.state.info.phone?
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginRight:10}}>
                        <TouchableOpacity onPress={() => this.clickSms()}>
                            <Image resizeMode="stretch" style={{width:25,height:20}} source={require('../assets/ic_comment.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginLeft:10}} onPress={() => this.clickPhoneCall()}>
                            <Image resizeMode="stretch" style={{width:22,height:20}} source={require('../assets/ic_phone.png')}/>
                        </TouchableOpacity>
                    </View>:
                    null
                }
                
            </View>
            <View style={{backgroundColor:'#323E49',height:1,marginLeft:10,marginRight:10}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:12}}>Email</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <Text style={{color:'#fff',fontSize:14}}>{self.state.info.email}</Text>                        
                    </View>
                </View>
            </View>
            <View style={{backgroundColor:'#323E49',height:1,marginLeft:10,marginRight:10}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:12}}>Twitter</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image resizeMode="stretch" style={{width:15,height:15}} source={require('../assets/twitter-512.png')}/>
                            <Text style={{color:'#fff',fontSize:14,marginLeft:5}}>{self.state.info.twitter_profile.screen_name}</Text>                        
                        </View>
                    </View>
                </View>
                <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginRight:10}}>
                    <TouchableOpacity>
                        <Image resizeMode="stretch" style={{width:25,height:20}} source={require('../assets/ic_comment.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{backgroundColor:'#25313C',flexDirection:'row',alignItems:'center',padding:10}}>                          
                <Text style={{color:'#D8D8D8',fontSize:14,paddingLeft:10}}>DETAILS</Text>
            </View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:12}}>Grade Year</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <Text style={{color:'#fff',fontSize:14}}></Text>                        
                    </View>
                </View>
            </View>
            <View style={{backgroundColor:'#323E49',height:1,marginLeft:10,marginRight:10}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                        <Text style={{color:'#8F969C',fontSize:12}}>Tags</Text>                            
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <Text style={{color:'#fff',fontSize:14}}></Text>                        
                    </View>
                </View>
            </View>
            <View style={{backgroundColor:'#323E49',height:1,marginLeft:10,marginRight:10}}></View>
            <View style={{flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'#273440',height:60}}>
                <View style={{marginLeft:10,flex:1}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:5}}>
                        <Text style={{color:'#fff',fontSize:14}}>Top Guys</Text>                        
                    </View>
                </View>
            </View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>





            {this.renderLoading()}
      </View>
    );
  }
}