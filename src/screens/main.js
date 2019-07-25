import React, {Component} from 'react';
import {Platform, Dimensions,FlatList,Linking,findNodeHandle,TouchableOpacity,StyleSheet, StatusBar, View,Image,Text,TextInput} from 'react-native';
import Dialog from "react-native-dialog";
import Drawer from 'react-native-drawer'
import Spinner from 'react-native-loading-spinner-overlay';
import { TabView, SceneMap } from 'react-native-tab-view';
import {ViewPager} from 'rn-viewpager';
import InboxView from '../components/inbox/inbox'
import PictureView from '../components/inbox/picture'
import ScheduleView from '../components/inbox/schedule'
import ContactView from '../components/inbox/contact'

import Styles from '../common/style';

import {serviceRegisterDevice} from '../api/notification/push';
import {formatDate,getDay} from '../util/utils';
import DefaultPreference from 'react-native-default-preference';
import { serviceGetTag } from '../api/media/tag';


var PushNotification = require('react-native-push-notification');



const { width, height } = Dimensions.get('window');

const { styles } = Styles;

var self= null;
export default class MainScreen extends Component {
  constructor(props) {
    super(props);
    self = this;    
    var viewpager;
    const {state} = props.navigation;    
    this.state = {
        isVisibleSpin:false,
        isMaskShow:'none',
        maskPos:'relative',
        userInfo:state.params.userInfo,
        filterContacts:[],
        contacts:[],
        refreshing:false,
        tabIndex:0,
        tabIcons:[require('../assets/pending-512.png'),
        require('../assets/tabpicture.png'),
        require('../assets/tabrun.png'),
        require('../assets/ic_msg_white.png')]
    }    
  }
  webRegisterDeviceIOS(token)
  {
        serviceRegisterDevice(self.state.userInfo.id,'apn',token)
        .then(res=>{      
            //console.warn(res);
        })
        .catch(err=>{
            //console.warn(err);
        });
  }
  initPush()
  {
    PushNotification.setApplicationIconBadgeNumber(0);
    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
          if (Platform.OS === 'ios')
          {
            self.webRegisterDeviceIOS(token.token)
          }
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
          //console.warn( 'NOTIFICATION:', notification );

          PushNotification.getApplicationIconBadgeNumber((res)=>{
            //console.warn(res) //returns 10
            if (res != null)
              PushNotification.setApplicationIconBadgeNumber(res + 1)
            else 
              PushNotification.setApplicationIconBadgeNumber(1)
          });
          
          // process the notification
          // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
          //notification.finish(PushNotificationIOS.FetchResult.NoData);
          PushNotification.localNotification(
          {
            title: notification.message.title, // (o
            message: notification.message.body, // (required)
            playSound: false, // (optional) de
          });
      },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "YOUR GCM (OR FCM) SENDER ID",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
          alert: true,
          badge: true,
          sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
  });


    


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
  getTimeString(receiveTime)
  {
    var date = new Date();
    var recDate = new Date(Date.parse(receiveTime));
    if (date.toDateString() == recDate.toDateString())
    {        
        return formatDate(recDate);
    }
    else if (date.getTime() - recDate.getTime() > 1000 * 3600 * 24 * 7)
    {
        currentDate = ("0" + (recDate.getMonth() + 1)).slice(-2) + "/" + ("0" + recDate.getDate()).slice(-2) + "/" + recDate.getFullYear();
        return currentDate;
    }
    else
    {
        return getDay(recDate);
        
    }
  }
  clickItem(item,index)
  {
    this.props.navigation.navigate('ConversationScreen',{athlet:item,userInfo:self.state.userInfo});
  }
  renderInboxItem(item,index)
  {   
      var backColor = "#263440";   
      if (index % 2 == 1)
      {
          backColor = '#25313C';
      }      
      return(
        <TouchableOpacity onPress={()=>this.clickItem(item,index)}>
            <View>            
                <View style={{backgroundColor:backColor,flexDirection:'row',alignItems:'center',padding:10}}>                
                    <View>
                        <Image style={[styles.img50,{borderRadius:25}]} source={{uri:item.profile_image}}/>
                        {this.renderAddUnread(item)}                    
                    </View>                
                    <View style={{marginLeft:10,flex:1}}>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                            <Text style={[styles.whiteColor,{fontSize:14}]}>{item.first_name} {item.last_name}</Text>
                            <Image style={{width:18,height:15,marginLeft:10}} source={require('../assets/ic_msg.png')}/>
                            {
                              width < 350?
                                <Text style={{color:'#2491C9',fontSize:12,textAlign:'right',flex:1}}>{this.getTimeString(item.last_received_time).substring(0,3)}</Text>                                
                                :
                                <Text style={{color:'#2491C9',fontSize:12,textAlign:'right',flex:1}}>{this.getTimeString(item.last_received_time)}</Text>

                            }                            
                        </View>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                            <Text style={{color:'#8F969C',fontSize:12}}>{item.last_message_preview}</Text>                        
                        </View>
                    </View>
                </View>
                <View style={{backgroundColor:'#323E49',height:1}}></View>            
            </View>        
        </TouchableOpacity>
      );
  }
  getTabTitle()
  {
      if (this.state.tabIndex == 0)
      {
          return "Message Queue";
      }
      else if (this.state.tabIndex == 1)
      {
          return "Media Library";
      }
      else if (this.state.tabIndex == 2)
      {
          return "Contact";
      }
      else return "Inbox";
  }
  handleRefresh()
  {
        self.setState({refreshing:true});
        serviceGetInbox()
        .then(res=>{
            self.setState({refreshing:false,contacts:res,filterContacts:res});
        })
        .catch(err=>{
            self.setState({refreshing:false});            
        });
  }
  renderInbox()
  {      
      if (this.state.contacts.length == 0)
      {
        return (
            <View style={{flex:1}}>
                <Text style={{color:'#fff',margin:20,textAlign:'center',fontSize:16}}>You have no message in your inbox. Compose a new message by selecting the plus sign below</Text>
            </View>
        );
      }
      else
      {
        return(
            <FlatList              
              data={this.state.filterContacts}
              renderItem={({item,index}) => this.renderInboxItem(item,index)}
              keyExtractor={(item, index) => index.toString()}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
        )
      }
  }
  clickFaq()
  {
    Linking.canOpenURL("http://www.stackedsports.com/faq").then(supported => {
        if (supported) {
          Linking.openURL("http://www.stackedsports.com/faq");
        }
    });
  }
  renderSms()
  {
      if (this.state.userInfo.sms_number != null && this.state.userInfo.sms_number != "")
      {
        return(
            <View style={{backgroundColor:'#273440',flexDirection:'row',padding:10,alignItems:'center'}}>
                <Image style={[styles.img15,{marginLeft:10}]} source={require('../assets/phone-green-512.png')}/>                
                <Text style={[styles.whiteColor,{fontSize:16,flex:1,marginLeft:10}]}>{this.state.userInfo.sms_number}</Text>                   
            </View>
        )
      }
      else{
        
      }
  }
  renderMenu()
  {
      return(
        <View style={{backgroundColor:'#25313C',flex:1}}>
            <View style={{backgroundColor:'#273440',flexDirection:'row',paddingTop:45,paddingLeft:10,paddingRight:10,paddingBottom:10}}>
                <Image style={[styles.img50,{borderRadius:25}]} source={{uri: this.state.userInfo.twitter_profile.profile_image}}/>
                <View style={{margin:10}}>
                    <Text style={[styles.whiteColor,{fontSize:16}]}>{this.state.userInfo.first_name} {this.state.userInfo.last_name}</Text>   
                    <Text style={[styles.grayColor,{fontSize:16}]}>Last Login:{this.state.userInfo.last_login_at.substring(0, 10)}</Text>
                </View>                
            </View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <View style={{backgroundColor:'#323E49',height:1,marginTop:30}}></View>
            <TouchableOpacity onPress={()=> this.clickPushSetting()}>
                <View style={{backgroundColor:'#273440',flexDirection:'row',padding:10,alignItems:'center'}}>
                    <Text style={[styles.whiteColor,{fontSize:16,flex:1}]}>Push Notifications</Text>   
                    <Image style={[styles.img15,{marginRight:10}]} source={require('../assets/gt-512.png')}/>                
                </View>
            </TouchableOpacity>            
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <TouchableOpacity>
                <View style={{backgroundColor:'#273440',flexDirection:'row',padding:10,alignItems:'center'}}>
                    <Text style={[styles.whiteColor,{fontSize:16,flex:1}]} onPress={()=> this.clickFaq()}>FAQ</Text>   
                    <Image style={[styles.img15,{marginRight:10}]} source={require('../assets/gt-512.png')}/>                
                </View>
            </TouchableOpacity>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <View style={{backgroundColor:'#273440',flexDirection:'row',height:100,padding:10,alignItems:'center'}}></View>
            <View style={{backgroundColor:'#323E49',height:1,marginTop:30}}></View>
            <View style={{backgroundColor:'#273440',flexDirection:'row',padding:10,alignItems:'center'}}>
                <Image style={[styles.img15,{marginLeft:10}]} source={require('../assets/twitter-512.png')}/>                
                <Text style={[styles.whiteColor,{fontSize:16,flex:1,marginLeft:10}]}>{this.state.userInfo.twitter_profile.screen_name}</Text>                   
            </View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            {this.renderSms()}
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <View style={{backgroundColor:'#273440',flexDirection:'row',height:100,padding:10,alignItems:'center'}}></View>
            <View style={{backgroundColor:'#323E49',height:1}}></View>
            <TouchableOpacity onPress={()=>this.clickLogout()}>
                <View style={{backgroundColor:'#273440',flexDirection:'row',padding:10,alignItems:'center'}}>
                    <Text style={{fontSize:16,flex:1,textAlign:'center',color:'#EE4236'}}>Sign Out</Text>                   
                </View>
            </TouchableOpacity>
            <View style={{backgroundColor:'#323E49',height:1}}></View>            
        </View>
      );
  }
  clickLogout()
  {
      DefaultPreference.clearMultiple(['user','password']).then(function() 
      {        
        self.props.navigation.navigate('LoginScreen');
      })
      .catch(err=>{            

      });
  }
  clickPushSetting()
  {
    this.closeControlPanel();
    this.props.navigation.navigate('NotificationScreen')
  }
  closeControlPanel = () => {
    this._drawer.close()
    this.setState({isMaskShow:'none',maskPos:'relative'});
  };
  openControlPanel = () => {
    this._drawer.open()
    this.setState({isMaskShow:'flex',maskPos:'absolute'});
  };
  goQueueScreen()
  {    
      setTimeout(() => {
        this.props.navigation.navigate('QueueScreen',{userInfo:this.state.userInfo});
      }, 100); 
      
  }

  pageSelected(index)
  {      
      this.setTab(index.position);
      //this.setState({tabIndex:index.position});
  }

  setTab(index)
  {
        var icons = [require('../assets/pending-512.png'),
        require('../assets/tabpicture.png'),
        require('../assets/tabrun.png'),
        require('../assets/ic_msg_white.png')];
        if (index == 0)
        {
            icons[0] = require('../assets/ic_schedule_p.png');
        }
        else if (index == 1)
        {
            icons[1] = require('../assets/tabpicture_p.png');
        }
        else if (index == 2)
        {
            icons[2] = require('../assets/tabrun_p.png');
        }
        else if (index == 3)
        {
            icons[3] = require('../assets/ic_chat_p.png');
        }
        this.viewpager.setPage(index);
        this.setState({tabIndex:index,tabIcons:icons});
  }
  renderTab()
  {     
       return(
            <View style={{flex:1}}>
                <ViewPager ref={ref => this.viewpager = ref}  style={{flex:1}}
                onPageSelected={(index) => self.pageSelected(index)}>                    
                    <View style={{flex:1}}>
                        <ScheduleView navigation={this.props.navigation} userInfo={this.state.userInfo} style={{flex:1}}/>
                    </View>
                    <View>
                        <PictureView navigation={this.props.navigation} userInfo={this.state.userInfo} style={{flex:1}}/>
                    </View>                
                    <View>
                        <ContactView navigation={this.props.navigation} userInfo={this.state.userInfo} style={{flex:1}}/>
                    </View>    
                    <View>
                        <InboxView navigation={this.props.navigation} userInfo={this.state.userInfo} style={{flex:1}}/>
                    </View>
                </ViewPager>
                <View style={{height:70,backgroundColor:'#1B242D',flexDirection:'row'}}>
                    <TouchableOpacity style={{flex:1}} onPress={()=> this.setTab(0)}>
                        {
                            this.state.tabIndex == 0? <View style={{height:1,backgroundColor:'#2491C9',position:'relative'}}></View>:null
                        }
                        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Image style={[styles.img30]} resizeMode="stretch" source={this.state.tabIcons[0]}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex:1}} onPress={()=> this.setTab(1)}>
                        {
                            this.state.tabIndex == 1? <View style={{height:1,backgroundColor:'#2491C9',position:'relative'}}></View>:null
                        }
                        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Image style={[styles.img30,{height:23}]} resizeMode="stretch" source={this.state.tabIcons[1]}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex:1}} onPress={()=> this.setTab(2)}>
                        {
                            this.state.tabIndex == 2? <View style={{height:2,backgroundColor:'#2491C9',position:'relative'}}></View>:null
                        }
                        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Image style={[styles.img30]} resizeMode="stretch" source={this.state.tabIcons[2]}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex:1}} onPress={()=> this.setTab(3)}>
                        {
                            this.state.tabIndex == 3? <View style={{height:3,backgroundColor:'#2491C9',position:'relative'}}></View>:null
                        }
                        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Image style={[styles.img30,{height:23}]} resizeMode="stretch" source={this.state.tabIcons[3]}/>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
       );       
    }

  render() {
    const drawerStyles = {
        drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
        main: {paddingLeft: 3},
    }
    return (
      <Drawer        
        onClose={() => this.setState({isMaskShow:'none',maskPos:'relative'})}
        ref={(ref) => this._drawer = ref}
        tapToClose={true}
        openDrawerOffset={80}        
        content={this.renderMenu()}
        type="overlay"
        style={drawerStyles}        
        >
        <StatusBar hidden={true} />
        <View style={[styles.bg,styles.flexFull]}>        
            <View style={[styles.vwTopBar]}>
                <View style={{flex:1}}>
                    <TouchableOpacity style={{marginLeft:10,width:35,height:35,padding:10}} onPress={()=> this.openControlPanel()}>
                        <Image style={[styles.img15]} source={require('../assets/menu-512.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={[{position:'absolute',alignItems:'center',paddingTop:20}]}>
                    <TouchableOpacity>
                        <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                            <Text style={[styles.textColorBlue,{fontSize:16,textAlign:'center'}]}>{this.getTabTitle()}</Text>                            
                        </View>
                    </TouchableOpacity>
                </View>                
                <View style={{flex:1,alignItems:'flex-end'}}>
                    {/* <TouchableOpacity style={{marginLeft:10,width:35,height:35,padding:10}} onPress={()=> this.props.navigation.navigate('QueueScreen',{userInfo:self.state.userInfo})}>
                        <Image style={[styles.img15]} source={require('../assets/pending-512.png')}/>
                    </TouchableOpacity> */}
                </View>
            </View>
                        
            {this.renderTab()}
            
            <View style={[styles.fullWidthHeight,{display:this.state.isMaskShow,position:this.state.maskPos,backgroundColor:'#000000',opacity:0.5}]}>
                
            </View>
            {this.renderLoading()}
        </View>
      </Drawer>
      
    );
  }
}