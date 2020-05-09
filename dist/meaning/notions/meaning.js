"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var time_1 = require("./time");
exports.Time = time_1.Time;
var person_1 = __importDefault(require("./person"));
exports.Person = person_1.default;
var location_1 = __importDefault(require("./location"));
exports.Location = location_1.default;
var value_1 = __importDefault(require("./value"));
exports.Value = value_1.default;
var item_1 = __importDefault(require("./item"));
exports.Item = item_1.default;
var action_1 = __importDefault(require("./action"));
exports.Action = action_1.default;
var Meaning = /** @class */ (function () {
    function Meaning() {
    }
    Meaning.prototype.isEmpty = function () {
        var res = true;
        for (var _i = 0, _a = Object.getOwnPropertyNames(this); _i < _a.length; _i++) {
            var prop = _a[_i];
            res = res && (!this[prop]);
        }
        return res;
    };
    Meaning.prototype.toString = function () {
        var out = '';
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var prop = _a[_i];
            out += prop.replace(/^_+/, '').replace(/^\w/, function (c) { return c.toUpperCase(); }) + ":\n" +
                ("\t" + this[prop].toString().replace(/\n/g, '\n\t') + "\n");
        }
        return '\n' + out;
    };
    return Meaning;
}());
exports.Meaning = Meaning;
//# sourceMappingURL=meaning.js.map