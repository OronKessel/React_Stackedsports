import React, { Component } from 'react';
import { Keyboard, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated, FlatList, TouchableOpacity, StyleSheet, StatusBar, View, Image, Text, TextInput } from 'react-native';
import Styles from '../../common/style';
import { serviceGetMessages } from '../../api/message/message';
const { styles } = Styles;
import { getDateTimeStringQuote } from '../../util/utils';
import Spinner from 'react-native-loading-spinner-overlay';

var self = null;
class ScheduleView extends Component {

    constructor(props) {
        super(props)
        self = this;
        this.state = {
            userInfo: this.props.userInfo,
            messages: [],
            isVisibleSpin: false,
            refreshing: false,
            tabIndex: 0
        }
    }

    componentDidMount() {
        this.setState({ isVisibleSpin: true });
        this.webGetMessages();
    }

    renderSeparator() {
        return (
            <View style={{ backgroundColor: '#323E49', height: 1 }}>

            </View>
        );
    }

    spinnerStyle = function () {
        return {
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0
        }
    }

    webGetMessages() {
        serviceGetMessages()
            .then(res => {
                this.setState({ isVisibleSpin: false, messages: res, refreshing: false });
            })
            .catch(err => {
                this.setState({ isVisibleSpin: false, refreshing: false });
            });
    }



    renderLoading = () => {
        if (this.state.isVisibleSpin)
            return (
                <View style={this.spinnerStyle()}>
                    <Spinner visible={true} />
                </View>
            );
        else
            return null;
    }
    handleRefresh() {
        self.setState({ refreshing: true });
        self.webGetMessages();
    }
    clickItem(item, index) {
        this.props.navigation.navigate('ConversationScreen', { athlet: item, userInfo: self.state.userInfo });
    }
    clickDetailQueue(item) {
        this.props.navigation.navigate('QueueDetailScreen', { userInfo: this.state.userInfo, queueInfo: item, onGoBack: () => this.handleRefresh() });
    }
    renderAddUnread(item) {

        if (item.recipients != null && item.recipients.status != null && item.recipients.status.total != null && item.recipients.status.total > 0) {
            return (
                <Text style={{ color: '#fff', backgroundColor: '#0897CE', padding: 3, borderRadius: 5, position: 'absolute', marginLeft: 25, top: 16 }}>
                    {item.recipients.status.total}
                </Text>
            );
        }
    }

    renderQueue() {
        return (
            <FlatList
                data={this.state.messages}
                renderItem={({ item, index }) => this.renderQueueItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
            />
        )
    }
    clickTab(tab) {
        this.setState({ tabIndex: tab });
    }

    renderTab() {
        var backColor1 = '#307AC5';
        var backColor2 = '#00000000';
        var tabImage1 = require('../../assets/user_white.png');
        var tabImage2 = require('../../assets/users_blue.png');
        if (this.state.tabIndex == 1) {
            backColor1 = '#00000000';
            backColor2 = '#307AC5';
            tabImage1 = require('../../assets/user_blue.png');
            tabImage2 = require('../../assets/users_white.png');
        }

        return (
            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 10, marginBottom: 10, height: 35 }}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.clickTab(0)}>
                    <View style={{ backgroundColor: backColor1, borderColor: '#307AC5', flex: 1, borderWidth: 1, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ width: 13, height: 13 }} source={tabImage1} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.clickTab(1)}>
                    <View style={{ backgroundColor: backColor2, borderColor: '#307AC5', flex: 1, borderWidth: 1, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ width: 20, height: 13 }} source={tabImage2} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    renderQueueItem(item, index) {
        var backColor = "#263440";
        if (index % 2 == 1) {
            backColor = '#25313C';
        }
        var duration = 0;
        return (
            <View style={{ backgroundColor: backColor, }}>
                <View style={{ backgroundColor: '#323E49', height: 1 }}></View>
                <View style={{ paddingLeft: 10, paddingTop: 5, paddingBottom: 5 }}>
                    <Text style={{ color: '#D8D8D8' }}>Message Paused</Text>
                </View>
                <View style={{ backgroundColor: '#323E49', height: 1 }}></View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 10 }}>
                    <View>
                        <Image style={{ width: 30, height: 30, marginRight: 30, marginLeft: 10 }} source={require('../../assets/msg.png')} />
                        {this.renderAddUnread(item)}
                    </View>
                    <View style={{ flex: 1 }}>
                        <View>
                            <Text style={{ color: '#90969B', fontSize: 14, flex: 1 }}>Message Text:</Text>
                            <Text style={{ color: '#C6C9CC', fontSize: 14, flex: 1 }}>{item.body}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#90969B', fontSize: 14 }}>Begin sending:</Text>
                            <Text style={{ color: '#C6C9CC', fontSize: 14, flex: 1, marginLeft: 5 }}>{getDateTimeStringQuote(new Date(Date.parse(item.next_send_at)))}</Text>
                        </View>
                        {
                            item.media && item.media.id ?
                                <View>
                                    <Image style={{ width: 120, height: 100 }} source={{ uri: item.media.urls.medium }} />
                                </View>
                                : null
                        }

                        <View>
                            <Text style={{ color: '#90969B', fontSize: 14, flex: 1 }}>Queued  {getDateTimeStringQuote(new Date(Date.parse(item.created_at)))} by {item.sender}</Text>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => this.clickDetailQueue(item)}>
                            <Image style={{ width: 30, height: 30 }} source={require('../../assets/ic_dots.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ backgroundColor: '#323E49', height: 1 }}></View>
            </View>
        );
    }

    render() {
        return (
            <View style={[styles.scene, { backgroundColor: '#25313C', flex: 1 }]}>
                {this.renderTab()}
                {this.renderQueue()}
                {this.renderLoading()}
            </View>
        );
    }
}

export default ScheduleView
