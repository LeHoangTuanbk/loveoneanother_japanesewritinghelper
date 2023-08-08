"use strict";

var _express = _interopRequireDefault(require("express"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _viewEngine = _interopRequireDefault(require("./configs/viewEngine"));
var _web = _interopRequireDefault(require("./routes/web"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();
app.use(_bodyParser["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
(0, _viewEngine["default"])(app);
(0, _web["default"])(app);
var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("App is running at the port: ".concat(port));
});
//# sourceMappingURL=server.js.map