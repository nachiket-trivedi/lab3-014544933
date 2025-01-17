import React,{Component} from 'react';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';
import axios from "axios";
import { connect } from 'react-redux';
import {hostedAddress} from "../../GlobalVar"
import * as action from "../redux-files/CustomerActions/CustomerActions"
import ReactPaginate from 'react-paginate';

let doneSearchFlag=false, allOrders=null;
let finalOrder, wholeOrder
//create the Landing Component
class UpcomingOrdersCust extends Component {
    constructor(props){
    super(props);
    finalOrder=[];
    wholeOrder=[];
    // this.searchFunction = this.searchFunction.bind(this);
    this.state={msg:""}
    this.onChangeMessage=this.onChangeMessage.bind(this);
    let data={cust_email:localStorage.getItem('email'), rest_email:this.props.rest_email, rest_name:this.props.rest_name};
    console.log('data---',data)
    let token=localStorage.getItem('bearer-token');
    this.props.showOrdersCust(data,token);
    // this.setState({})
    }
onChangeMessage=(e)=>{
    let msg=e.target.value;
    this.setState({'msg':msg})
}
sendMessage=(order_id, order_rest)=>{
    let token=localStorage.getItem('bearer-token');
    let data={msg:this.state.msg, order_id:order_id, cust_email:localStorage.getItem('email'), rest_name:order_rest, sender:localStorage.getItem('name')}
    axios.defaults.withCredentials = true;//very imp
    console.log('data',data)
    axios.post(hostedAddress+":3001/postMessage", data, {params:{},headers:{'Authorization':token, 'Accept':'application/json','Content-Type':'application/json'}})
    .then(response => {   
        window.location.reload();
    })
    .catch()
}
    render(){
    allOrders=this.props.OrdersCust;
    if(allOrders!=undefined)
    { 
        let orderMap=new Map();
        finalOrder=[], wholeOrder=[]
        orderMap.clear();
        console.log('allorders', allOrders)
        let details = allOrders.map(entry => { 
        if(entry['order_status']!='Delivered' && entry['order_status']!='Cancelled')
        {
            let orderDetails=entry['order_details']
            let orders=orderDetails.map(oEntry=>{
                console.log('oEntry',oEntry);
                if(orderMap.has(entry['_id']))
                {
                    var myList = orderMap.get(entry['_id'])
                    myList.push([entry['order_status'],entry['rest_name'], oEntry[0],oEntry[1],oEntry[2]])
                    // console.log('sirf ye dekh',myList);
                    orderMap.set(entry['_id'],myList);
                }
                else
                {
                    orderMap.set(entry['_id'],[[entry['order_status'],entry['rest_name'],oEntry[0],oEntry[1],oEntry[2]]])
                }
            }
            )                        
        }
    })
    console.log('ordermap',orderMap)
    for(let orderId of orderMap)
    {
        let eachOrder=[]
        // console.log('ooo',orderId)
        let order_id=orderId[0]
        let order_status=((orderMap.get(orderId[0]))[0])[0]
        let order_rest=((orderMap.get(orderId[0]))[0])[1]
        let rest_address=((orderMap.get(orderId[0]))[0])[5]
        console.log('ye dekhoo',order_id, order_status, order_rest)
        finalOrder.push((<div><br/><br/></div>));
        finalOrder.push(<div class='h_order'><h4>Order ID: {order_id}</h4>
        <h4>Restaurant: {order_rest}</h4>
        </div>)
        eachOrder.push([<tr>
            <th class='th_order'>Item Name</th>
            <th class='th_order'>Item Price</th>
            <th class='th_order'>Item Quantity</th>
        </tr>])
        let finalPrice=0;
        let orderDetails = (orderMap.get(orderId[0])).map(item => {  
            finalPrice+=item[3]*item[4];
            return(
                <tr>
                    <td class='t_order'>{item[2]}</td>
                    <td class='t_order'>{item[3]}</td>
                    <td class='t_order'>{item[4]}</td>
                </tr>
            )})
            eachOrder.push(orderDetails);
            // eachOrder.push(<div class='h1_new'>Final Price: ${finalPrice}</div>)
            wholeOrder=(<div><table class='table_order'>{eachOrder}</table></div>)
            finalOrder.push(wholeOrder);
            finalOrder.push(<div><div class='h1_new'><h4>Order Status: <font color='green' face='Arial'><b>{order_status}</b></font></h4></div><div class='h1_new'>Total Price: ${finalPrice}</div>
            <textarea id="msg" onChange={this.onChangeMessage}></textarea>
            <button type="submit" class="btn btn-primary"  onClick={this.sendMessage.bind(this,order_id, order_rest)}>Send Message</button>
            <br/><hr/></div>)
                }
            }
        console.log('rendered')
        let redirectVar=null
        if(localStorage.getItem('cookie')!='customer'){
            redirectVar = <Redirect to="/login"/>}
        return(
            <div>
            <div class='maincust' style={{textAlign:"center", width: '200', height:'200'}}>
                {redirectVar}
                <h1 class='h1' style={{textAlign:"center"}}>{localStorage.getItem('name')}! Here are your upcoming orders  <span style={{fontSize:40}}>&#127827;</span></h1>
                <table class='table'>
                    {finalOrder}
                </table>
        </div>
        <div class='container'>
                        <ReactPaginate 
                        previousLabel={'previous'}
                        nextLabel={'next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={4}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                      />
                    </div>
                      </div>
        )
    }
}

const mapStateToProps=(store)=>{
    if(store!=undefined){
    console.log('store',store)
    return{
        OrdersCust:store.OrdersCust,
    }
    }
}

const mapDispatchToProps=(dispatch)=>{
    return{
        showOrdersCust:(data,token)=>dispatch(action.showOrdersCust(data,token))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UpcomingOrdersCust);