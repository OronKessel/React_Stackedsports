import React, { Component } from 'react';
import { Keyboard, SectionList, KeyboardAvoidingView, Platform, Dimensions, Animated, FlatList, TouchableOpacity, StyleSheet, StatusBar, View, Image, Text, TextInput } from 'react-native';
import Styles from '../../common/style';
import { serviceGetAthletes } from '../../api/organization/athlete';
import { formatDate, getDay } from '../../util/utils';
const { styles } = Styles;
const { width, height } = Dimensions.get('window');
import Spinner from 'react-native-loading-spinner-overlay';

var self = null;
class ContactView extends Component {

  constructor(props) {
    super(props)
    self = this;
    this.state = {
      isVisibleSpin: false,
      isMaskShow: 'none',
      maskPos: 'relative',
      userInfo: this.props.userInfo,
      orgAthletes: [],
      athlets: [],
      refreshing: false,
      athletePage: 0,
      isSearch: false,
      prefixes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      filterSection: [],
      orgSection: []
    }
  }

  componentDidMount() {
    self.setState({ isVisibleSpin: true });
    this.webGetAthlets();
  }

  webGetAthlets() {
    var options = {
      page: this.state.athletePage + 1,
      ppage: 10,
      sort: 'first_name',
      sortdir: 'asc',
      search: ''
    };
    serviceGetAthletes(options)
      .then(res => {
        console.warn(res);
        var mergeRes = this.state.athlets.concat(res);
        result = this.sortByName(mergeRes);
        this.setState({ isVisibleSpin: false ,filterSection: result, orgSection: result, orgAthletes: this.state.athlets.concat(res), athlets: this.state.athlets.concat(res), athletePage: this.state.athletePage + 1 });
      })
      .catch(err => {
        self.setState({ isVisibleSpin: false });
      });
  }

  clickAthlet(item) {
    this.props.navigation.navigate('ProfileScreen', { userInfo: this.state.userInfo, athInfo: item });
  }

  renderAthletItem(item, index) {
    var backColor = "#263440";
    if (index % 2 == 1) {
      backColor = '#25313C';
    }
    return (
      <TouchableOpacity onPress={() => this.clickAthlet(item)}>
        <View>
          <View style={{ backgroundColor: backColor, flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <View>
              <Image style={[styles.img50, { borderRadius: 25 }]} source={{ uri: item.twitter_profile.profile_image }} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                <Text style={[styles.whiteColor, { fontSize: 14 }]}>{item.first_name} {item.last_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#8F969C', fontSize: 12 }}>{item.twitter_profile.screen_name != null ? '@' : null}{item.twitter_profile.screen_name}{item.phone != null ? ' - ' : null}{item.phone}</Text>
              </View>
            </View>
          </View>
          <View style={{ backgroundColor: '#323E49', height: 1 }}></View>
        </View>
      </TouchableOpacity>
    );
  }


  handleRefresh() {

  }

  loadMore() {
    if (!self.state.isSearch) {
      self.setState({ isVisibleSpin: true });
      self.webGetAthlets();
    }
  }


  filterInbox(text) {
    var filters = [];
    if (text == '') {
      this.setState({ filterSection: this.state.orgSection, isSearch: false });
    }
    else {
      for (var i = 0; i < this.state.orgSection.length; i++) {
        var item = {};
        var datas = [];
        for (j = 0; j < this.state.orgSection[i].data.length; j++) {
          if (this.state.orgSection[i].data[j].first_name.includes(text)) {
            datas.push(this.state.orgSection[i].data[j]);
            continue;
          }
          if (this.state.orgSection[i].data[j].last_name.includes(text)) {
            filters.push(this.state.orgSection[i].data[j])
            continue;
          }
        }
        if (datas.length > 0) {
          item.title = this.state.orgSection[i].title;
          item.data = datas;
          filters.push(item);
        }
      }
      this.setState({ filterSection: filters, isSearch: true });
    }
  }


  sortByName(res) {
    var result = [];
    var datas = [];
    for (i = 0; i < this.state.prefixes.length; i++) {
      datas = [];
      for (j = 0; j < res.length; j++) {
        if (res[j].first_name.startsWith(this.state.prefixes[i])) {
          datas.push(res[j]);
        }
      }
      if (datas.length > 0) {
        var item = {};
        item.title = this.state.prefixes[i];
        for (k = 0; k < datas.length - 1; k++) {
          for (t = k + 1; t < datas.length; t++) {
            name = datas[k].first_name + datas[k].last_name;
            name1 = datas[t].first_name + datas[t].last_name;
            if (name > name1) {
              var temp = datas[k];
              datas[k] = datas[t];
              datas[t] = temp;
            }
          }
        }
        item.data = datas;
        result.push(item);
      }
    }
    return result;
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
  render() {
    return (
      <View style={[styles.scene, { backgroundColor: '#25313C', flex: 1 }]}>
        <TextInput style={styles.inputSearch} placeholder="Search" placeholderTextColor="#8D9196" onChangeText={(text) => this.filterInbox(text)} />
        <View style={{ backgroundColor: '#323E49', height: 1 }}></View>

        <SectionList
          showsVerticalScrollIndicator={false}
          sections={this.state.filterSection}
          renderItem={({ item, index }) => this.renderAthletItem(item, index)}
          renderSectionHeader={({ section }) => <Text style={{ paddingLeft: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: '#1B242D', fontSize: 14, color: "#FFFFFF" }}>{section.title}</Text>}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.loadMore}
          onEndReachedThreshold={0.5}
        />
        {this.renderLoading()}
      </View>
    );
  }
}

export default ContactView
