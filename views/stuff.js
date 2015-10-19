"use strict";

var host = 'http://1111hui.com:88';

var SearchBox = React.createClass({
	displayName: "SearchBox",

	onChange: function onChange(e) {
		var val = $(e.target).val();
		this.props.onSearch(val);
	},
	render: function render() {
		return React.createElement(
			"div",
			null,
			React.createElement("input", { type: "search", className: "searchInput", placeholder: "输入关键词", onChange: this.onChange })
		);
	}
});

var UserForm = React.createClass({
	displayName: "UserForm",

	submit: function onSubmit(e) {
		e.preventDefault();
		var newData = this.props.data;
		for (var i in this.refs) {
			var v = this.refs[i];
			if (v.name) newData[i] = v.value;
		}
		var infoEl = this.refs.info;
		$(this).removeAttr('style').html('更新中...').show();
		$.ajax({
			url: host + '/updateOneStuff',
			type: 'POST',
			data: JSON.stringify(newData),
			contentType: 'application/json',
			success: function success(data) {
				infoEl.className = 'info success';
				infoEl.innerHTML = '已更新!';
			},
			error: function error(err) {
				console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
				infoEl.className = 'info fail';
				infoEl.innerHTML = '更新错误!';
			},
			complete: function complete() {
				$(infoEl).removeAttr('style').stop().animate({ opacity: 0 }, 5000, function () {
					$(this).hide();
				});
			}
		});
	},
	handleChange: function handleChange(event) {
		var val = event.target.value;
	},
	render: function renderForm() {

		return React.createElement(
			"li",
			null,
			React.createElement(
				"form",
				{ onSubmit: this.submit },
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement(
						"p",
						null,
						"用户ID:"
					),
					React.createElement("input", { type: "text", defaultValue: this.props.data.userid, ref: "userid", disabled: true, name: "userid" })
				),
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement(
						"p",
						null,
						"电脑名称:"
					),
					React.createElement("input", { type: "text", defaultValue: this.props.data.client, placeholder: "电脑名称", ref: "client", name: "client" })
				),
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement(
						"p",
						null,
						"IP地址:"
					),
					React.createElement("input", { type: "text", defaultValue: this.props.data.ip, placeholder: "IP地址", onChange: this.handleChange, ref: "ip", name: "ip" })
				),
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement(
						"p",
						null,
						"用户级别:"
					),
					React.createElement("input", { type: "text", defaultValue: this.props.data.level, placeholder: "用户级别", ref: "level", name: "level" })
				),
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement(
						"p",
						null,
						"短号:"
					),
					React.createElement("input", { type: "text", defaultValue: this.props.data.shortPhone, placeholder: "短号", ref: "shortPhone", name: "shortPhone" })
				),
				React.createElement(
					"div",
					{ className: "line" },
					React.createElement("p", null),
					React.createElement("input", { type: "submit", value: "提交" }),
					React.createElement("span", { className: "info", ref: "info" })
				)
			)
		);
	}
});

var User = React.createClass({
	displayName: "User",

	onSearch: function onSearch(val) {
		if (!window.STUFF_LIST) return;
		//if(!val) return this.replaceState({data:window.STUFF_LIST}, ()=> {});
		var newData = window.STUFF_LIST.filter(function (v) {
			return v.userid.match(new RegExp(val), 'i') || v.name && v.name.match(new RegExp(val), 'i') || v.client && v.client.match(new RegExp(val), 'i') || v.ip && v.ip.match(new RegExp(val), 'i') || v.shortPhone && v.shortPhone.match(new RegExp(val), 'i') || v.phone && v.phone.match(new RegExp(val), 'i');
		});
		this.replaceState({ data: [] }, function () {
			this.replaceState({ data: newData, searchText: val }, function () {});
		});
	},

	getData: function getData(initData) {
		var _this = this;

		if (!initData) {
			$.post(host + '/getStuffList', function (data) {
				window.STUFF_LIST = data;
				_this.setState({ data: data }, function () {});
			});
		} else {
			this.setState({ data: initData });
		}
	},

	getInitialState: function getInitialState() {
		return { data: [] };
	},
	componentDidMount: function componentDidMount() {
		this.getData();
	},
	render: function renderUser() {
		var _this2 = this;

		var forms = this.state.data.map(function (v) {
			return window.STUFF_LIST ? React.createElement(UserForm, { className: "list", data: v, searchText: _this2.state.searchText }) : React.createElement(
				UserForm,
				null,
				"读取中..."
			);
		});

		return React.createElement(
			"div",
			null,
			React.createElement(SearchBox, { onSearch: this.onSearch }),
			React.createElement(
				"ul",
				{ className: "listUL" },
				forms
			)
		);
	}
});

ReactDOM.render(React.createElement(User, null), $('.wrap')[0]);
/* // Below use defaultValue="" instead of value="" to make input editable, but after search with keyword, the input value don't update  */