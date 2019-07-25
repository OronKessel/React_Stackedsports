import
{
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native';

const { width, height } = Dimensions.get('window');
const bottomBarHeight = 150;

const styles = StyleSheet.create({  
  bg:{
  	backgroundColor:'#25313C'
  },
  bgImage:{
	  width:width,
	  height:height
  },  
  vwLoginFrame:
  {
	flex:1,
	alignItems:'center',
	justifyContent:'center'
  },
  loginLogo:
  {	
  	width:316,
	  height:65	
  },
  textColorBlue:{
	  color:'#2491C9'
  },
  whiteColor:
  {
	color:'#fff'
  },
  grayColor:{
	  color:'#58626B'
  },
  widthFullMargine20:{
	width:width - 40,
	marginLeft:20,
	marginRight:20,
  },
  inputForm:
  {	
	height:45,	
	backgroundColor:'#fff',
	borderRadius:0
  },  
  btnPrimary:
  {	  
	  fontSize:16,
	  fontWeight:'bold',
	  borderRadius:0,
	  borderWidth:1,
	  borderColor:'#4C5E6E',
	  backgroundColor:'#273541',
	  padding:13,
	  textAlign:'center',
	  justifyContent:'center',
	  alignItems:'center'
  },
  vwTopBar:{
	height:60,
	backgroundColor:'#1B242D',	
	alignItems:'center',
	flexDirection:'row',
	justifyContent:'center'
  },
  drawerStyle:{
	shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3,
	paddingLeft: 3
  },
  img15:
  {
	  width:15,
	  height:15
  },
  img30:
  {
	  width:30,
	  height:30
  },
  img50:{
	  width:50,
	  height:50
  },
  flexFull:{
  	flex:1
  },
  vwFrame:
  {
	backgroundColor:'#FFFFFF',
  	marginTop:20,
  	padding:15,
  	borderColor:'#EDEDEA',
  	borderRadius:10,
  	borderWidth:2
  },
  vwLogin:
  {
  	backgroundColor:'#FFFFFF',
  	width:300,
  	marginTop:20,
  	padding:15,
  	borderColor:'#EDEDEA',
  	borderRadius:10,
  	borderWidth:2
  },
  loginButton:{
  	borderWidth:1,
  	borderRadius:5,
  	textAlign:'center',
  	borderColor:'#5DA1DA',
  	backgroundColor:'#F2F8FD',
  	color:'#5DA1DA',
  	padding:10,
  	width:80
  },
  imgProfile:{
  	width:70,
  	height:70,
  	borderRadius:35
  },
  txtName:
  {
  	fontSize:20,
  	color:'#969693',
  	padding:5
  },
  txtRole:
  {
  	fontSize:16,
  	color:'#7FB2E8',
  	padding:5
	},
	inputSearch:{
		borderWidth:1,
		borderRadius:15,
		color:'#fff',
		textAlign:'center',
		borderColor:'#313D47',
		height:40,
		margin:10,
		fontSize:12,
		backgroundColor:'#1B242D'
	},
	fullWidthHeight:
	{
		width:width,
		height:height + 100
	}
});

export default {
  styles 
};
