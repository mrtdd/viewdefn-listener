"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pubsub_1 = require("@google-cloud/pubsub");
var lodash_1 = require("lodash");
var fs = require("fs");
var viewDefnMap = {};
var timeDefnVersion = {};
function getTimeStamp() {
    var current = new Date();
    return "" + current.getFullYear() + current.getMonth() + current.getDate() + current.getHours() + current.getMinutes() + current.getSeconds();
}
function quickstart(projectId, // Your Google Cloud Platform project ID
topicName, // Name for the new topic to create
subscriptionName // Name for the new subscription to create
) {
    if (projectId === void 0) { projectId = 'express-210300'; }
    if (topicName === void 0) { topicName = 'ViewDefn_pubsub_exqa'; }
    if (subscriptionName === void 0) { subscriptionName = 'ViewDefn_Log_exqa_subscriber2'; }
    return __awaiter(this, void 0, void 0, function () {
        var pubsub, topic, subscription;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pubsub = new pubsub_1.PubSub({ projectId: projectId });
                    topic = pubsub.topic(topicName);
                    // const [topic] = await pubsub.createTopic(topicName);
                    console.log("Topic " + topic.name + " created.");
                    // Creates a subscription on that new topic
                    return [4 /*yield*/, (topic.getSubscriptions().then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                            var subscriptions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        subscriptions = response[0];
                                        subscription = subscriptions.find(function (sub) { return sub.name.indexOf(subscriptionName) >= 0; });
                                        if (!(subscription == null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, topic.createSubscription(subscriptionName)];
                                    case 1:
                                        subscription = (_a.sent())[0];
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    // Creates a subscription on that new topic
                    _a.sent();
                    // Receive callbacks for new messages on the subscription
                    subscription.on('message', function (message) {
                        // console.log('Received message:', message.data.toString());
                        var msgData = JSON.parse(message.data.toString());
                        var defnName = msgData.textPayload.match(/defnId=(\S*)/)[1];
                        lodash_1.update(viewDefnMap, defnName, function (n) { return n ? n + 1 : 1; });
                        lodash_1.updateWith(timeDefnVersion, message.publishTime.getDay() + "." + message.publishTime.getHours() + "." + defnName, function (n) { return n ? n + 1 : 1; }, Object);
                        console.log(lodash_1.slice(lodash_1.map(lodash_1.sortBy(lodash_1.map(viewDefnMap, function (v, k) { return [k, v]; }), function (x) { return -x[1]; }), function (v) { return v[0] + ": " + v[1]; }), 0, 5));
                        // process.exit(0);
                    });
                    // Receive callbacks for errors on the subscription
                    subscription.on('error', function (error) {
                        console.error('Received error:', error);
                        process.exit(1);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
quickstart().then(function () {
    console.info("Started listening.");
});
function exitHandler() {
    fs.writeFileSync("./output/timedata_" + getTimeStamp() + ".json", JSON.stringify(timeDefnVersion, null, 2));
    fs.writeFileSync("./output/alldata_" + getTimeStamp() + ".json", JSON.stringify(viewDefnMap, null, 2));
    process.exit(0);
}
process.on('SIGINT', exitHandler);
process.on('exit', exitHandler);
process.on('uncaughtException', exitHandler);
//# sourceMappingURL=index.js.map