

var host = 'http://1111hui.com:88';

var SearchBox = React.createClass({
	onChange:function  (e) {
		var val = $(e.target).val();
		this.props.onSearch(val);
	},
	render:function  () {
		return(
<div><input type="search" className="searchInput" placeholder="输入关键词" onChange={this.onChange} /></div>
			);
	}
});

var UserForm = React.createClass({

	submit:function onSubmit (e) {
		e.preventDefault();
		var newData = this.props.data;
		for(var i in this.refs){
			var v = this.refs[i];
			if(v.name) newData[i] = v.value;
		}
		var infoEl = this.refs.info;
		$(this).removeAttr('style').html('更新中...').show();
		$.ajax({
			url: host+'/updateOneStuff',
			type:'POST',
			data: JSON.stringify(newData),
			contentType:'application/json',
			success:function  (data) {
				infoEl.className = 'info success';
				infoEl.innerHTML = '已更新!';
			},
			error: function (err) {
		        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
				infoEl.className = 'info fail';
		        infoEl.innerHTML = '更新错误!';
		    }, 
		    complete:function  () {
		    	$(infoEl).removeAttr('style').stop().animate({opacity:0}, 5000, function  () {
		    		$(this).hide();
		    	});
		    }
		});
	},
	handleChange: function(event) {
		var val = event.target.value;
	},
	render:function renderForm () {

		return(

<li>
	<form onSubmit={this.submit}>
		{/* // Below use defaultValue="" instead of value="" to make input editable, but after search with keyword, the input value don't update  */} 
		<div className="line"><p>用户ID:</p><input type="text" defaultValue={this.props.data.userid} ref="userid" disabled name="userid" /></div>
		<div className="line"><p>电脑名称:</p><input type="text" defaultValue={this.props.data.client} placeholder="电脑名称" ref="client" name="client" /></div>
		<div className="line"><p>IP地址:</p><input type="text" defaultValue={this.props.data.ip} placeholder="IP地址" onChange={this.handleChange} ref="ip" name="ip" /></div>
		<div className="line"><p>用户级别:</p><input type="text" defaultValue={this.props.data.level} placeholder="用户级别" ref="level" name="level" /></div>
		<div className="line"><p>短号:</p><input type="text" defaultValue={this.props.data.shortPhone} placeholder="短号" ref="shortPhone" name="shortPhone" /></div>
		<div className="line"><p></p><input type="submit" value="提交" /><span className="info" ref="info"></span></div>
	</form>
</li>

			);
	}
});

var User = React.createClass({

	onSearch:function  (val) {
		if(!window.STUFF_LIST) return;
		//if(!val) return this.replaceState({data:window.STUFF_LIST}, ()=> {});
		var newData = window.STUFF_LIST.filter(v=> {
			return (
				v.userid.match(new RegExp(val), 'i') 
				|| v.name&&v.name.match(new RegExp(val), 'i') 
				|| v.client&&v.client.match(new RegExp(val), 'i')
				|| v.ip&&v.ip.match(new RegExp(val), 'i')
				|| v.shortPhone&&v.shortPhone.match(new RegExp(val), 'i')
				|| v.phone&&v.phone.match(new RegExp(val), 'i')
			)
		});
		this.replaceState({data:[]}, function  () {
			this.replaceState({data:newData, searchText:val}, ()=> {});
		});
		
	},

	getData:function  (initData) {
		if(!initData){
			$.post( host+'/getStuffList', data=>{
				window.STUFF_LIST = data;
				this.setState({data:data}, function  () {
				});
			} );
		} else {
			this.setState({data:initData});
		}
	},

	getInitialState:function  () {
		return {data:[]}
	},
	componentDidMount:function  () {
		this.getData();
	},
	render:function renderUser () {
		var forms = this.state.data.map(v=>{
			return window.STUFF_LIST ? <UserForm className="list" data={v} searchText={this.state.searchText} /> :  <UserForm>读取中...</UserForm>
		});

		return(
<div>
	<SearchBox onSearch={this.onSearch} />
	<ul className="listUL">
	{forms}
	</ul>
</div>

			);
		
	}
});


ReactDOM.render( <User />, $('.wrap')[0] );

