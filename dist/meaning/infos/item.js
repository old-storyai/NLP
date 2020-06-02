"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var info_1 = __importDefault(require("./info/info"));
var Item = /** @class */ (function (_super) {
    __extends(Item, _super);
    function Item() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Item.prototype.processWords = function () {
        this._modifiers = [];
        this._name = '';
        for (var _i = 0, _a = this._wordGroup._words; _i < _a.length; _i++) {
            var word = _a[_i];
            word = word;
            if (word.isAdjective())
                this._modifiers.push(word.toString());
            if (word.isNoun() || word.is('PRP'))
                this._name += ' ' + word.toString();
        }
        this._name = this._name.trim();
    };
    return Item;
}(info_1.default));
exports.default = Item;
//# sourceMappingURL=item.js.map