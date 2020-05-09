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
var thing_1 = __importDefault(require("./thing/thing"));
var Person = /** @class */ (function (_super) {
    __extends(Person, _super);
    function Person() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Person.prototype.processWords = function () {
        if (/^(me|I)$/i.test(this._wordGroup.toString())) {
            this._personTitle = 'SELF';
            return;
        }
        this._personTitle = '';
        this._modifiers = [];
        for (var _i = 0, _a = this._wordGroup._words; _i < _a.length; _i++) {
            var word = _a[_i];
            word = word;
            if (word.isAdjective()) {
                this._modifiers.push(word.toString());
            }
            else {
                this._personTitle += ' ' + word.toString();
            }
        }
        this._personTitle.trim();
    };
    return Person;
}(thing_1.default));
exports.default = Person;
//# sourceMappingURL=person.js.map