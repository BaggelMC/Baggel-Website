(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.adventure = {}));
})(this, (function (exports) { 'use strict';

    var Flags;
    ((Flags2) => {
      const SYMBOL = /* @__PURE__ */ Symbol("flags");
      Flags2.FROZEN = 1;
      function getFlags(value) {
        if (SYMBOL in value) return value[SYMBOL];
        return 0;
      }
      Flags2.getFlags = getFlags;
      function setFlags(value, flags) {
        if (SYMBOL in value) {
          value[SYMBOL] = flags;
          return;
        }
        Object.defineProperty(value, SYMBOL, {
          value: flags,
          configurable: false,
          enumerable: false,
          writable: true
        });
      }
      Flags2.setFlags = setFlags;
    })(Flags || (Flags = {}));
    var ArrayUtil;
    ((ArrayUtil2) => {
      function immutableView(array, copyFunc = (v) => v) {
        let f = Flags.getFlags(array);
        if (f & Flags.FROZEN) return array;
        const ret = new Array(array.length);
        for (let i = 0; i < array.length; i++) ret[i] = copyFunc(array[i]);
        Flags.setFlags(ret, f | Flags.FROZEN);
        return Object.freeze(ret);
      }
      ArrayUtil2.immutableView = immutableView;
      function insertAtStart(dest, src) {
        if (src === dest) throw new Error(`'dest' and 'src' must be distinct`);
        const count = src.length;
        if (count === 0) return;
        const length = dest.length;
        dest.length = length + count;
        for (let i = length - 1; i >= 0; i--) {
          dest[i + count] = dest[i];
        }
        for (let i = 0; i < count; i++) {
          dest[i] = src[i];
        }
      }
      ArrayUtil2.insertAtStart = insertAtStart;
    })(ArrayUtil || (ArrayUtil = {}));

    var __defProp$V = Object.defineProperty;
    var __defNormalProp$V = (obj, key, value) => key in obj ? __defProp$V(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$V = (obj, key, value) => __defNormalProp$V(obj, key + "" , value);
    exports.TextDecoration = void 0;
    ((TextDecoration2) => {
      TextDecoration2.OBFUSCATED = "obfuscated";
      TextDecoration2.BOLD = "bold";
      TextDecoration2.STRIKETHROUGH = "strikethrough";
      TextDecoration2.UNDERLINED = "underlined";
      TextDecoration2.ITALIC = "italic";
      const VALUES = ArrayUtil.immutableView([
        TextDecoration2.OBFUSCATED,
        TextDecoration2.BOLD,
        TextDecoration2.STRIKETHROUGH,
        TextDecoration2.UNDERLINED,
        TextDecoration2.ITALIC
      ]);
      const MAP = (() => {
        const ret = {};
        for (let i = 0; i < VALUES.length; i++) ret[VALUES[i]] = i;
        return Object.freeze(ret);
      })();
      function values() {
        return VALUES;
      }
      TextDecoration2.values = values;
      function ordinal(decoration) {
        if (!(decoration in MAP)) throw new Error(`Unknown decoration "${decoration}"`);
        return MAP[decoration];
      }
      TextDecoration2.ordinal = ordinal;
      function fromOrdinal(ordinal2) {
        if (ordinal2 < 0 || ordinal2 >= VALUES.length) throw new Error(`Illegal ordinal: ${ordinal2}`);
        return VALUES[ordinal2];
      }
      TextDecoration2.fromOrdinal = fromOrdinal;
      ((State2) => {
        State2.NOT_SET = "not_set";
        State2.FALSE = "false";
        State2.TRUE = "true";
        const VALUES2 = [
          State2.NOT_SET,
          State2.FALSE,
          State2.TRUE
        ];
        const MAP2 = (() => {
          const ret = {};
          for (let i = 0; i < VALUES2.length; i++) ret[VALUES2[i]] = i;
          return Object.freeze(ret);
        })();
        function ordinal2(decoration) {
          if (!(decoration in MAP2)) throw new Error(`Unknown state "${decoration}"`);
          return MAP2[decoration];
        }
        State2.ordinal = ordinal2;
        function fromOrdinal2(ordinal3) {
          if (ordinal3 < 0 || ordinal3 >= VALUES2.length) throw new Error(`Illegal ordinal: ${ordinal3}`);
          return VALUES2[ordinal3];
        }
        State2.fromOrdinal = fromOrdinal2;
        function fromBoolean(flag) {
          return flag ? State2.TRUE : State2.FALSE;
        }
        State2.fromBoolean = fromBoolean;
      })(TextDecoration2.State || (TextDecoration2.State = {}));
    })(exports.TextDecoration || (exports.TextDecoration = {}));
    class DecorationMap {
      constructor(value = 0) {
        __publicField$V(this, "_buffer");
        this._buffer = new Uint16Array(1);
        this._value = value;
      }
      //
      get _value() {
        return this._buffer[0];
      }
      set _value(v) {
        this._buffer[0] = v & 65535;
      }
      get(decoration) {
        return exports.TextDecoration.State.fromOrdinal(this._value >> exports.TextDecoration.ordinal(decoration) * 2 & 3);
      }
      with(decoration, state) {
        let v = this._value;
        const offset = exports.TextDecoration.ordinal(decoration) * 2;
        v &= ~(3 << offset);
        v |= exports.TextDecoration.State.ordinal(state) << offset;
        return new DecorationMap(v);
      }
      isEmpty() {
        return this._value === 0;
      }
      toObject() {
        const ret = {};
        for (const decoration of exports.TextDecoration.values()) ret[decoration] = this.get(decoration);
        return ret;
      }
    }

    const defineAccessor = ((getter, setter) => {
      return function() {
        const me = this;
        const count = arguments.length;
        if (count === 0) {
          return getter.apply(me, []);
        } else if (count === 1) {
          return setter.apply(me, [...arguments]);
        } else {
          throw new Error(`Too many arguments passed to accessor (expected 0 or 1, got ${count})`);
        }
      };
    });
    const defineContextualAccessor = ((getter, setter) => {
      return function() {
        const me = this;
        const count = arguments.length;
        if (count === 0) {
          throw new Error(`No arguments passed to contextual accessor (expected 1 or 2)`);
        } else if (count === 1) {
          return getter.apply(me, [...arguments]);
        } else if (count === 2) {
          return setter.apply(me, [...arguments]);
        } else {
          throw new Error(`Too many arguments passed to contextual accessor (expected 1 or 2, got ${count})`);
        }
      };
    });

    var __defProp$U = Object.defineProperty;
    var __defNormalProp$U = (obj, key, value) => key in obj ? __defProp$U(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$U = (obj, key, value) => __defNormalProp$U(obj, key + "" , value);
    function normalize(value) {
      let n;
      switch (typeof value) {
        case "object":
          if (value === null) throw new Error(`Cannot interpret null as Character`);
          if (value instanceof CharacterImpl) return value;
          if ("value" in value) {
            const n2 = value["value"];
            if (typeof n2 === "number") return new CharacterImpl(n2);
          }
          throw new Error(`Value (${value}) is not a Character`);
        case "number":
          n = value;
          break;
        case "string":
          const { length } = value;
          if (length !== 1) throw new Error(`Character string should have a length of 1 (got ${length})`);
          n = value.charCodeAt(0);
          break;
        default:
          throw new Error(`Cannot create Character from value of type "${typeof value}"`);
      }
      if (!Number.isSafeInteger(n) || n < 0 || n > 65535)
        throw new Error(`Illegal Character value: ${n}`);
      return new CharacterImpl(n);
    }
    class CharacterImpl {
      constructor(value) {
        __publicField$U(this, "_buf");
        this._buf = new Uint16Array(1);
        this._buf[0] = value;
      }
      //
      get value() {
        return this._buf[0];
      }
      compare(other) {
        return this.value - normalize(other).value;
      }
      is(other) {
        return this.value === normalize(other).value;
      }
      indexIn(string) {
        const { value } = this;
        for (let i = 0; i < string.length; i++) {
          if (string.charCodeAt(i) === value) return i;
        }
        return -1;
      }
      toString() {
        return String.fromCharCode(this.value);
      }
      [Symbol.toPrimitive](hint) {
        if (hint === "number") return this.value;
        return this.toString();
      }
      get [Symbol.toStringTag]() {
        return `Character`;
      }
    }
    const Character = ((known) => {
      let ret = normalize;
      for (const key of Object.keys(known)) {
        const value = normalize(known[key]);
        Object.defineProperty(ret, key, {
          value,
          configurable: false,
          enumerable: true,
          writable: false
        });
      }
      return ret;
    })({
      LESS_THAN: `<`,
      GREATER_THAN: `>`,
      SEMICOLON: `;`,
      QUOTATION: `"`,
      APOSTROPHE: `'`,
      AMPERSAND: `&`,
      COLON: `:`,
      NUMBER_SIGN: `#`,
      BACKSLASH: `\\`,
      DOLLAR_SIGN: `$`,
      ZERO: `0`,
      ONE: `1`,
      NINE: `9`,
      LOWERCASE_A: `a`,
      LOWERCASE_S: `s`,
      LOWERCASE_F: `f`,
      UPPERCASE_A: `A`,
      UPPERCASE_F: `F`,
      DASH: `-`,
      PERCENT: `%`,
      SLASH: `/`,
      SECTION: `\xA7`,
      LOWERCASE_K: "k",
      LOWERCASE_R: "r",
      LOWERCASE_O: "o",
      UPPERCASE_Z: "Z",
      SPACE: " ",
      UNDERSCORE: "_",
      LOWERCASE_Z: "z",
      PERIOD: ".",
      COMMA: ",",
      NEWLINE: `
`
    });

    var __defProp$T = Object.defineProperty;
    var __defNormalProp$T = (obj, key, value) => key in obj ? __defProp$T(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$T = (obj, key, value) => __defNormalProp$T(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _KeyImpl = class _KeyImpl {
      //
      constructor(_namespace, _value) {
        this._namespace = _namespace;
        this._value = _value;
        _KeyImpl._checkField(_namespace, _KeyImpl.D_NAMESPACE);
        _KeyImpl._checkField(_value, _KeyImpl.D_VALUE);
      }
      static _checkField(value, descriptor) {
        if (value.length === 0) throw new Error(`'${descriptor}' may not be an empty string`);
        const isValue = this.D_VALUE === descriptor;
        let char;
        for (let i = 0; i < value.length; i++) {
          char = value.charCodeAt(i);
          if (Character.UNDERSCORE.is(char)) continue;
          if (Character.DASH.is(char)) continue;
          if (Character.LOWERCASE_A.value <= char && char <= Character.LOWERCASE_Z.value) continue;
          if (Character.ZERO.value <= char && char <= Character.NINE.value) continue;
          if (Character.PERIOD.is(char)) continue;
          if (isValue && Character.SLASH.is(char)) continue;
          throw new Error(`Disallowed character @ position ${i} in field '${descriptor}'`);
        }
      }
      //
      namespace() {
        return this._namespace;
      }
      value() {
        return this._value;
      }
      asString() {
        return `${this._namespace}:${this._value}`;
      }
      asMinimalString() {
        if (exports.Key.MINECRAFT_NAMESPACE === this._namespace) return this._value;
        return this.asString();
      }
      toString() {
        return this.asString();
      }
      get [Symbol.toStringTag]() {
        return "Key";
      }
      [Symbol.toPrimitive](hint) {
        if ("number" === hint) return NaN;
        return this.asString();
      }
    };
    __publicField$T(_KeyImpl, "D_NAMESPACE", "namespace");
    __publicField$T(_KeyImpl, "D_VALUE", "value");
    let KeyImpl = _KeyImpl;
    exports.Key = void 0;
    ((Key2) => {
      Key2.MINECRAFT_NAMESPACE = "minecraft";
      Key2.DEFAULT_SEPARATOR = Character.COLON;
      Key2.key = function key2() {
        const nargs = arguments.length;
        if (nargs === 1) {
          const arg0 = arguments[0];
          if (typeof arg0 === "object" && arg0 instanceof KeyImpl) return arg0;
          const data = String(arg0);
          const index = Key2.DEFAULT_SEPARATOR.indexIn(data);
          if (index !== -1) {
            return new KeyImpl(data.substring(0, index), data.substring(index + 1));
          } else {
            return new KeyImpl(Key2.MINECRAFT_NAMESPACE, data);
          }
        } else if (nargs === 2) {
          return new KeyImpl(String(arguments[0]), String(arguments[1]));
        } else {
          throw new Error(`Expected 1-2 arguments, got ${nargs}`);
        }
      };
      function equals(a, b) {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a.namespace() !== b.namespace()) return false;
        return a.value() === b.value();
      }
      Key2.equals = equals;
    })(exports.Key || (exports.Key = {}));

    var __defProp$S = Object.defineProperty;
    var __defNormalProp$S = (obj, key, value) => key in obj ? __defProp$S(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$S = (obj, key, value) => __defNormalProp$S(obj, typeof key !== "symbol" ? key + "" : key, value);
    class TextColorImpl {
      constructor(value) {
        __publicField$S(this, "_buf");
        this._buf = new DataView(new ArrayBuffer(4));
        this._buf.setUint32(0, value, false);
      }
      //
      value() {
        return this._buf.getUint32(0, false);
      }
      asHexString() {
        let chars = new Array(7);
        let head = 0;
        chars[head++] = Character.NUMBER_SIGN.value;
        const nibble = ((n) => {
          chars[head++] = n < 10 ? Character.ZERO.value + n : Character.LOWERCASE_A.value + n - 10;
        });
        for (let i = 1; i < 4; i++) {
          const octet = this._buf.getUint8(i);
          nibble(octet >>> 4);
          nibble(octet & 15);
        }
        return String.fromCharCode.apply(null, chars);
      }
      red() {
        return this._buf.getUint8(1);
      }
      green() {
        return this._buf.getUint8(2);
      }
      blue() {
        return this._buf.getUint8(3);
      }
      toString() {
        return this.asHexString();
      }
    }
    exports.TextColor = void 0;
    ((TextColor2) => {
      function colorFunc() {
        const nargs = arguments.length;
        let value;
        if (nargs === 1) {
          value = (Number(arguments[0]) || 0) & 16777215;
        } else if (nargs === 3) {
          const r = Number(arguments[0]) || 0;
          const g = Number(arguments[1]) || 0;
          const b = Number(arguments[2]) || 0;
          value = (r & 255) << 16 | (g & 255) << 8 | b & 255;
        } else {
          throw new Error(`Expected 1 or 3 arguments, got ${nargs}`);
        }
        const named = exports.NamedTextColor.namedColor(value);
        if (named) return named;
        return new TextColorImpl(value);
      }
      TextColor2.color = colorFunc;
      function fromHexString(hex) {
        if (hex.length === 0 || hex.charCodeAt(0) !== Character.NUMBER_SIGN.value) return null;
        const n = parseInt(hex.substring(1), 16);
        if (isNaN(n)) return null;
        return (0, TextColor2.color)(n);
      }
      TextColor2.fromHexString = fromHexString;
      function lerp(v, from, to) {
        if (Number.isNaN(v) || !Number.isFinite(v)) throw new Error(`Invalid interpolation factor: ${v}`);
        v = Math.min(Math.max(v, 0), 1);
        const u = 1 - v;
        const ar = from.red();
        const ag = from.green();
        const ab = from.blue();
        const br = to.red();
        const bg = to.green();
        const bb = to.blue();
        return (0, TextColor2.color)(
          u * ar + v * br,
          u * ag + v * bg,
          u * ab + v * bb
        );
      }
      TextColor2.lerp = lerp;
    })(exports.TextColor || (exports.TextColor = {}));
    class NamedTextColorImpl extends TextColorImpl {
      constructor(name, value) {
        super(value);
        __publicField$S(this, "_name");
        this._name = name;
      }
      //
      name() {
        return this._name;
      }
      toString() {
        return this._name;
      }
    }
    exports.NamedTextColor = void 0;
    ((NamedTextColor2) => {
      const BLACK_VALUE = 0;
      const DARK_BLUE_VALUE = 170;
      const DARK_GREEN_VALUE = 43520;
      const DARK_AQUA_VALUE = 43690;
      const DARK_RED_VALUE = 11141120;
      const DARK_PURPLE_VALUE = 11141290;
      const GOLD_VALUE = 16755200;
      const GRAY_VALUE = 11184810;
      const DARK_GRAY_VALUE = 5592405;
      const BLUE_VALUE = 5592575;
      const GREEN_VALUE = 5635925;
      const AQUA_VALUE = 5636095;
      const RED_VALUE = 16733525;
      const LIGHT_PURPLE_VALUE = 16733695;
      const YELLOW_VALUE = 16777045;
      const WHITE_VALUE = 16777215;
      NamedTextColor2.BLACK = new NamedTextColorImpl("black", BLACK_VALUE);
      NamedTextColor2.DARK_BLUE = new NamedTextColorImpl("dark_blue", DARK_BLUE_VALUE);
      NamedTextColor2.DARK_GREEN = new NamedTextColorImpl("dark_green", DARK_GREEN_VALUE);
      NamedTextColor2.DARK_AQUA = new NamedTextColorImpl("dark_aqua", DARK_AQUA_VALUE);
      NamedTextColor2.DARK_RED = new NamedTextColorImpl("dark_red", DARK_RED_VALUE);
      NamedTextColor2.DARK_PURPLE = new NamedTextColorImpl("dark_purple", DARK_PURPLE_VALUE);
      NamedTextColor2.GOLD = new NamedTextColorImpl("gold", GOLD_VALUE);
      NamedTextColor2.GRAY = new NamedTextColorImpl("gray", GRAY_VALUE);
      NamedTextColor2.DARK_GRAY = new NamedTextColorImpl("dark_gray", DARK_GRAY_VALUE);
      NamedTextColor2.BLUE = new NamedTextColorImpl("blue", BLUE_VALUE);
      NamedTextColor2.GREEN = new NamedTextColorImpl("green", GREEN_VALUE);
      NamedTextColor2.AQUA = new NamedTextColorImpl("aqua", AQUA_VALUE);
      NamedTextColor2.RED = new NamedTextColorImpl("red", RED_VALUE);
      NamedTextColor2.LIGHT_PURPLE = new NamedTextColorImpl("light_purple", LIGHT_PURPLE_VALUE);
      NamedTextColor2.YELLOW = new NamedTextColorImpl("yellow", YELLOW_VALUE);
      NamedTextColor2.WHITE = new NamedTextColorImpl("white", WHITE_VALUE);
      function isNamed(color) {
        return color instanceof NamedTextColorImpl;
      }
      NamedTextColor2.isNamed = isNamed;
      function namedColor(value) {
        switch (value) {
          case BLACK_VALUE:
            return NamedTextColor2.BLACK;
          case DARK_BLUE_VALUE:
            return NamedTextColor2.DARK_BLUE;
          case DARK_GREEN_VALUE:
            return NamedTextColor2.DARK_GREEN;
          case DARK_AQUA_VALUE:
            return NamedTextColor2.DARK_AQUA;
          case DARK_RED_VALUE:
            return NamedTextColor2.DARK_RED;
          case DARK_PURPLE_VALUE:
            return NamedTextColor2.DARK_PURPLE;
          case GOLD_VALUE:
            return NamedTextColor2.GOLD;
          case GRAY_VALUE:
            return NamedTextColor2.GRAY;
          case DARK_GRAY_VALUE:
            return NamedTextColor2.DARK_GRAY;
          case BLUE_VALUE:
            return NamedTextColor2.BLUE;
          case GREEN_VALUE:
            return NamedTextColor2.GREEN;
          case AQUA_VALUE:
            return NamedTextColor2.AQUA;
          case RED_VALUE:
            return NamedTextColor2.RED;
          case LIGHT_PURPLE_VALUE:
            return NamedTextColor2.LIGHT_PURPLE;
          case YELLOW_VALUE:
            return NamedTextColor2.YELLOW;
          case WHITE_VALUE:
            return NamedTextColor2.WHITE;
          default:
            return null;
        }
      }
      NamedTextColor2.namedColor = namedColor;
      NamedTextColor2.NAMES = ((...colors) => {
        const ret = {};
        for (const color of colors) ret[color.name()] = color;
        return Object.freeze(ret);
      })(
        NamedTextColor2.BLACK,
        NamedTextColor2.DARK_BLUE,
        NamedTextColor2.DARK_GREEN,
        NamedTextColor2.DARK_AQUA,
        NamedTextColor2.DARK_RED,
        NamedTextColor2.DARK_PURPLE,
        NamedTextColor2.GOLD,
        NamedTextColor2.GRAY,
        NamedTextColor2.DARK_GRAY,
        NamedTextColor2.BLUE,
        NamedTextColor2.GREEN,
        NamedTextColor2.AQUA,
        NamedTextColor2.RED,
        NamedTextColor2.LIGHT_PURPLE,
        NamedTextColor2.YELLOW,
        NamedTextColor2.WHITE
      );
    })(exports.NamedTextColor || (exports.NamedTextColor = {}));

    var __defProp$R = Object.defineProperty;
    var __defNormalProp$R = (obj, key, value) => key in obj ? __defProp$R(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$R = (obj, key, value) => __defNormalProp$R(obj, key + "" , value);
    class ShadowColorImpl {
      constructor(value) {
        __publicField$R(this, "_buffer");
        this._buffer = new DataView(new ArrayBuffer(4));
        this._value = value;
      }
      //
      get _value() {
        return this._buffer.getUint32(0, false);
      }
      set _value(v) {
        this._buffer.setUint32(0, v, false);
      }
      value() {
        return this._value;
      }
      red() {
        return this._buffer.getUint8(1);
      }
      green() {
        return this._buffer.getUint8(2);
      }
      blue() {
        return this._buffer.getUint8(3);
      }
      alpha() {
        return this._buffer.getUint8(0);
      }
      asHexString() {
        const component = ((n) => {
          const v = this._buffer.getUint8(n);
          const hex = v.toString(16);
          if (hex.length === 1) return `0${hex}`;
          return hex;
        });
        return `#${component(1)}${component(2)}${component(3)}${component(0)}`;
      }
    }
    exports.ShadowColor = void 0;
    ((ShadowColor2) => {
      const NONE_VALUE = 0;
      const NONE = new ShadowColorImpl(NONE_VALUE);
      function none() {
        return NONE;
      }
      ShadowColor2.none = none;
      function shadowColorFunc() {
        const nargs = arguments.length;
        let value;
        if (nargs === 1) {
          value = (Number(arguments[0]) || 0) & 4294967295;
        } else if (nargs === 2) {
          const rgb = arguments[0];
          const alpha = (Number(arguments[1]) || 0) & 255;
          const rgbValue = Number(rgb.value()) & 16777215;
          value = alpha << 24 | rgbValue;
        } else if (nargs === 4) {
          const r = (Number(arguments[0]) || 0) & 255;
          const g = (Number(arguments[1]) || 0) & 255;
          const b = (Number(arguments[2]) || 0) & 255;
          const a = (Number(arguments[3]) || 0) & 255;
          value = a << 24 | r << 16 | g << 8 | b;
        } else {
          throw new Error(`Expected 1, 2, or 4 arguments (got ${nargs})`);
        }
        if (value === NONE_VALUE) return NONE;
        return new ShadowColorImpl(value);
      }
      ShadowColor2.shadowColor = shadowColorFunc;
      function fromHexString(hex) {
        if (hex.length !== 9 || hex.charCodeAt(0) !== Character.NUMBER_SIGN.value) return null;
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        const a = parseInt(hex.substring(7, 9), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
        return (0, ShadowColor2.shadowColor)(r, g, b, a);
      }
      ShadowColor2.fromHexString = fromHexString;
    })(exports.ShadowColor || (exports.ShadowColor = {}));

    var __defProp$Q = Object.defineProperty;
    var __defNormalProp$Q = (obj, key, value) => key in obj ? __defProp$Q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$Q = (obj, key, value) => __defNormalProp$Q(obj, typeof key !== "symbol" ? key + "" : key, value);
    class ClickEventImpl {
      constructor(action, payload) {
        __publicField$Q(this, "_action");
        __publicField$Q(this, "_payload");
        this._action = action;
        this._payload = payload;
      }
      //
      action() {
        return this._action;
      }
      payload() {
        return this._payload;
      }
    }
    exports.ClickEvent = void 0;
    ((ClickEvent2) => {
      function clickEvent(action, payload) {
        return new ClickEventImpl(action, payload);
      }
      ClickEvent2.clickEvent = clickEvent;
      function openUrl(url) {
        return clickEvent(Action.OPEN_URL, Payload.string(url));
      }
      ClickEvent2.openUrl = openUrl;
      function openFile(file) {
        return clickEvent(Action.OPEN_FILE, Payload.string(file));
      }
      ClickEvent2.openFile = openFile;
      function runCommand(command) {
        return clickEvent(Action.RUN_COMMAND, Payload.string(command));
      }
      ClickEvent2.runCommand = runCommand;
      function suggestCommand(command) {
        return clickEvent(Action.SUGGEST_COMMAND, Payload.string(command));
      }
      ClickEvent2.suggestCommand = suggestCommand;
      function changePage(page) {
        return clickEvent(Action.CHANGE_PAGE, Payload.integer(page));
      }
      ClickEvent2.changePage = changePage;
      function copyToClipboard(text) {
        return clickEvent(Action.COPY_TO_CLIPBOARD, Payload.string(text));
      }
      ClickEvent2.copyToClipboard = copyToClipboard;
      function custom(key, nbt) {
        return clickEvent(Action.CUSTOM, Payload.custom(key, nbt));
      }
      ClickEvent2.custom = custom;
      const TYPE_TEXT = "text";
      const TYPE_INT = "int";
      const TYPE_CUSTOM = "custom";
      let Payload;
      ((Payload2) => {
        function string(value) {
          return Object.freeze({
            type: TYPE_TEXT,
            value() {
              return value;
            }
          });
        }
        Payload2.string = string;
        function integer(integer2) {
          return Object.freeze({
            type: TYPE_INT,
            integer() {
              return integer2;
            }
          });
        }
        Payload2.integer = integer;
        function custom2(key, nbt) {
          const finalKey = exports.Key.key(key);
          return Object.freeze({
            type: TYPE_CUSTOM,
            key() {
              return finalKey;
            },
            nbt() {
              return nbt;
            }
          });
        }
        Payload2.custom = custom2;
      })(Payload = ClickEvent2.Payload || (ClickEvent2.Payload = {}));
      class ActionImpl {
        constructor(name, readable, type) {
          __publicField$Q(this, "_name");
          __publicField$Q(this, "_readable");
          __publicField$Q(this, "_type");
          this._name = name;
          this._readable = readable;
          this._type = type;
        }
        //
        readable() {
          return this._readable;
        }
        supports(payload) {
          return this._type === payload.type;
        }
        toString() {
          return this._name;
        }
      }
      let Action;
      ((Action2) => {
        Action2.OPEN_URL = new ActionImpl("open_url", true, TYPE_TEXT);
        Action2.OPEN_FILE = new ActionImpl("open_file", false, TYPE_TEXT);
        Action2.RUN_COMMAND = new ActionImpl("run_command", true, TYPE_TEXT);
        Action2.SUGGEST_COMMAND = new ActionImpl("suggest_command", true, TYPE_TEXT);
        Action2.CHANGE_PAGE = new ActionImpl("change_page", true, TYPE_INT);
        Action2.COPY_TO_CLIPBOARD = new ActionImpl("copy_to_clipboard", true, TYPE_TEXT);
        Action2.CUSTOM = new ActionImpl("custom", true, TYPE_CUSTOM);
        Action2.NAMES = ((...actions) => {
          const ret = {};
          for (const action of actions) ret[action.toString()] = action;
          return Object.freeze(ret);
        })(
          Action2.OPEN_URL,
          Action2.OPEN_FILE,
          Action2.RUN_COMMAND,
          Action2.SUGGEST_COMMAND,
          Action2.CHANGE_PAGE,
          Action2.COPY_TO_CLIPBOARD,
          Action2.CUSTOM
        );
      })(Action = ClickEvent2.Action || (ClickEvent2.Action = {}));
      class Handlers {
        constructor() {
          __publicField$Q(this, "_map");
          this._map = {};
        }
        //
        register(action, handler) {
          this._map[action.toString()] = handler;
        }
        invoke(event, context) {
          const action = event.action().toString();
          const handler = this._map[action];
          if (!handler) throw new Error(`Unhandled click event action: ${action}`);
          return handler(event, context);
        }
      }
      ClickEvent2.Handlers = Handlers;
    })(exports.ClickEvent || (exports.ClickEvent = {}));

    var __defProp$P = Object.defineProperty;
    var __defNormalProp$P = (obj, key, value) => key in obj ? __defProp$P(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$P = (obj, key, value) => __defNormalProp$P(obj, key + "" , value);
    exports.HoverEvent = void 0;
    ((HoverEvent2) => {
      function create(action, value) {
        return Object.freeze({
          action() {
            return action;
          },
          value(arg0) {
            if (typeof arg0 !== "undefined") return create(action, arg0);
            return value;
          },
          withRenderedValue(renderer, context) {
            const newValue = action.renderer().render(renderer, context, value);
            return create(action, newValue);
          }
        });
      }
      function hoverEvent(action, payload) {
        return create(action, payload);
      }
      HoverEvent2.hoverEvent = hoverEvent;
      function showText(text) {
        return create(Action.SHOW_TEXT, text);
      }
      HoverEvent2.showText = showText;
      function showItem(item, count) {
        return create(Action.SHOW_ITEM, ShowItem.showItem(item, count));
      }
      HoverEvent2.showItem = showItem;
      function showEntity(type, id, name = null) {
        return create(Action.SHOW_ENTITY, ShowEntity.showEntity(type, id, name));
      }
      HoverEvent2.showEntity = showEntity;
      let ShowItem;
      ((ShowItem2) => {
        function create2(item, count) {
          if (!Number.isFinite(count) || count < 0 || count > 2147483647) {
            throw new Error(`Invalid count: ${count}`);
          }
          count = Math.trunc(count);
          return Object.freeze({
            item: defineAccessor(
              () => item,
              (item2) => create2(exports.Key.key(item2), count)
            ),
            count: defineAccessor(
              () => count,
              (count2) => create2(item, count2)
            )
          });
        }
        function showItem2(item, count) {
          return create2(exports.Key.key(item), count);
        }
        ShowItem2.showItem = showItem2;
      })(ShowItem = HoverEvent2.ShowItem || (HoverEvent2.ShowItem = {}));
      let ShowEntity;
      ((ShowEntity2) => {
        function create2(type, id, name) {
          return Object.freeze({
            type: defineAccessor(
              () => type,
              (type2) => create2(type2, id, name)
            ),
            id: defineAccessor(
              () => id,
              (id2) => create2(type, id2, name)
            ),
            name: defineAccessor(
              () => name,
              (name2) => create2(type, id, name2)
            )
          });
        }
        function showEntity2(type, id, name = null) {
          return create2(type, id, name);
        }
        ShowEntity2.showEntity = showEntity2;
      })(ShowEntity = HoverEvent2.ShowEntity || (HoverEvent2.ShowEntity = {}));
      let Action;
      ((Action2) => {
        function define(name, readable, render) {
          const renderer = Object.freeze({ render });
          return Object.freeze({
            readable() {
              return readable;
            },
            renderer() {
              return renderer;
            },
            toString() {
              return name;
            }
          });
        }
        Action2.SHOW_TEXT = define(
          "show_text",
          true,
          (renderer, context, value) => renderer.render(value, context)
        );
        Action2.SHOW_ITEM = define(
          "show_item",
          true,
          (_a, _b, value) => value
        );
        Action2.SHOW_ENTITY = define(
          "show_entity",
          true,
          (renderer, context, value) => {
            const name = value.name();
            if (name === null) return value;
            return value.name(renderer.render(name, context));
          }
        );
        Action2.NAMES = ((...actions) => {
          const record = {};
          for (const action of actions) record[action.toString()] = action;
          return Object.freeze(record);
        })(
          Action2.SHOW_TEXT,
          Action2.SHOW_ITEM,
          Action2.SHOW_ENTITY
        );
      })(Action = HoverEvent2.Action || (HoverEvent2.Action = {}));
      class Handlers {
        constructor() {
          __publicField$P(this, "_map");
          this._map = {};
        }
        //
        register(action, handler) {
          this._map[action.toString()] = handler;
        }
        invoke(event, context) {
          const action = event.action().toString();
          const handler = this._map[action];
          if (!handler) throw new Error(`Unhandled hover event action: ${action}`);
          return handler(event, context);
        }
      }
      HoverEvent2.Handlers = Handlers;
    })(exports.HoverEvent || (exports.HoverEvent = {}));

    var __defProp$O = Object.defineProperty;
    var __defNormalProp$O = (obj, key, value) => key in obj ? __defProp$O(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$O = (obj, key, value) => __defNormalProp$O(obj, typeof key !== "symbol" ? key + "" : key, value);
    const EMPTY_STYLE_INIT = Object.freeze({
      font: null,
      color: null,
      shadowColor: null,
      decorations: new DecorationMap(),
      clickEvent: null,
      hoverEvent: null,
      insertion: null
    });
    class StyleImpl {
      constructor(init) {
        __publicField$O(this, "_init");
        //
        __publicField$O(this, "font", defineAccessor(
          () => this._get("font"),
          (font) => this._with({ font: font === null ? null : exports.Key.key(font) })
        ));
        __publicField$O(this, "color", defineAccessor(
          () => this._get("color"),
          (color) => this._with({ color })
        ));
        __publicField$O(this, "shadowColor", defineAccessor(
          () => this._get("shadowColor"),
          (shadowColor) => this._with({ shadowColor })
        ));
        __publicField$O(this, "decoration", defineContextualAccessor(
          (decoration) => this._get("decorations").get(decoration),
          (decoration, state) => {
            if (typeof state !== "string") {
              state = exports.TextDecoration.State.fromBoolean(!!state);
            }
            return this._with({ decorations: this._get("decorations").with(decoration, state) });
          }
        ));
        __publicField$O(this, "decorations", defineAccessor(
          () => this._get("decorations").toObject(),
          (value) => {
            let map = this._get("decorations");
            for (const key of Object.keys(value)) {
              const decoration = key;
              map = map.with(decoration, value[decoration]);
            }
            return this._with({ decorations: map });
          }
        ));
        __publicField$O(this, "clickEvent", defineAccessor(
          () => this._get("clickEvent"),
          (clickEvent) => this._with({ clickEvent })
        ));
        __publicField$O(this, "hoverEvent", defineAccessor(
          () => this._get("hoverEvent"),
          (hoverEvent) => this._with({ hoverEvent })
        ));
        __publicField$O(this, "insertion", defineAccessor(
          () => this._get("insertion"),
          (insertion) => this._with({ insertion })
        ));
        this._init = init;
      }
      colorIfAbsent(color) {
        return this._with({ color }, true);
      }
      shadowColorIfAbsent(shadowColor) {
        return this._with({ shadowColor }, true);
      }
      decorationIfAbsent(decoration, state) {
        let decorations = this._get("decorations");
        if (decorations.get(decoration) !== "not_set") return this;
        let parsed;
        if (typeof state === "boolean") {
          parsed = exports.TextDecoration.State.fromBoolean(state);
        } else {
          parsed = state;
        }
        decorations = decorations.with(decoration, parsed);
        return this._with({ decorations });
      }
      decorate(...decorations) {
        let map = this._get("decorations");
        for (const decoration of decorations) map = map.with(decoration, exports.TextDecoration.State.TRUE);
        return this._with({ decorations: map });
      }
      hasDecoration(decoration) {
        return this._get("decorations").get(decoration) === exports.TextDecoration.State.TRUE;
      }
      isEmpty() {
        if (this._get("font") !== null) return false;
        if (this._get("color") !== null) return false;
        if (this._get("shadowColor") !== null) return false;
        if (this._get("clickEvent") !== null) return false;
        if (this._get("hoverEvent") !== null) return false;
        if (this._get("insertion") !== null) return false;
        return this._get("decorations").isEmpty();
      }
      merge(source) {
        if (this.isEmpty()) return source;
        let newInit = { ...this._init };
        function apply(key, value) {
          if (newInit[key] !== null) return;
          newInit[key] = value;
        }
        apply("font", source.font());
        apply("color", source.color());
        apply("shadowColor", source.shadowColor());
        apply("insertion", source.insertion());
        apply("clickEvent", source.clickEvent());
        apply("hoverEvent", source.hoverEvent());
        for (const decoration of exports.TextDecoration.values()) {
          if (newInit.decorations.get(decoration) !== exports.TextDecoration.State.NOT_SET) continue;
          newInit.decorations = newInit.decorations.with(decoration, source.decoration(decoration));
        }
        return new StyleImpl(newInit);
      }
      unmerge(that) {
        if (this.isEmpty()) return this;
        let newInit = { ...this._init };
        const check = ((k, b, predicate) => {
          const a = this._init[k];
          if (a === null || b === null) return;
          if (predicate(a, b)) newInit[k] = null;
        });
        check(`font`, that.font(), (a, b) => exports.Key.equals(a, b));
        check(`color`, that.color(), (a, b) => a.value() === b.value());
        check(`shadowColor`, that.shadowColor(), (a, b) => a.value() === b.value());
        check(`insertion`, that.insertion(), (a, b) => a === b);
        check(`clickEvent`, that.clickEvent(), (a, b) => a === b);
        check(`hoverEvent`, that.hoverEvent(), (a, b) => a === b);
        for (const decoration of exports.TextDecoration.values()) {
          if (this._init.decorations.get(decoration) === that.decoration(decoration)) {
            newInit.decorations = newInit.decorations.with(decoration, exports.TextDecoration.State.NOT_SET);
          }
        }
        return new StyleImpl(newInit);
      }
      //
      _get(key) {
        return this._init[key];
      }
      _with(modifications, onlyIfAbsent) {
        let newInit = { ...this._init };
        if (onlyIfAbsent) {
          for (const key of Object.keys(modifications)) {
            const currentValue = this._init[key];
            if (null !== currentValue) continue;
            newInit[key] = modifications[key];
          }
        } else {
          Object.assign(newInit, modifications);
        }
        return new StyleImpl(newInit);
      }
    }
    exports.Style = void 0;
    ((Style2) => {
      function equals(a, b) {
        if (a === b) return true;
        if (!exports.Key.equals(a.font(), b.font())) return false;
        if (a.color() !== b.color()) return false;
        if (a.shadowColor() !== b.shadowColor()) return false;
        if (a.clickEvent() !== b.clickEvent()) return false;
        if (a.hoverEvent() !== b.hoverEvent()) return false;
        if (a.insertion() !== b.insertion()) return false;
        for (const decoration of exports.TextDecoration.values()) {
          if (a.decoration(decoration) !== b.decoration(decoration)) return false;
        }
        return true;
      }
      Style2.equals = equals;
      class BuilderImpl {
        constructor() {
          __publicField$O(this, "_init");
          this._init = { ...EMPTY_STYLE_INIT };
        }
        //
        font(font) {
          this._init.font = font === null ? font : exports.Key.key(font);
          return this;
        }
        color(color) {
          this._init.color = color;
          return this;
        }
        colorIfAbsent(color) {
          if (this._init.color === null) this._init.color = color;
          return this;
        }
        shadowColor(color) {
          this._init.shadowColor = color;
          return this;
        }
        shadowColorIfAbsent(color) {
          if (this._init.shadowColor === null) this._init.shadowColor = color;
          return this;
        }
        decorate(...decorations) {
          for (let decoration of decorations) {
            this._init.decorations = this._init.decorations.with(decoration, exports.TextDecoration.State.TRUE);
          }
          return this;
        }
        decoration(decoration, flag) {
          if (typeof flag === "boolean") flag = exports.TextDecoration.State.fromBoolean(flag);
          this._init.decorations = this._init.decorations.with(decoration, flag);
          return this;
        }
        decorations(decorations) {
          for (const key of Object.keys(decorations)) {
            const decoration = key;
            this._init.decorations = this._init.decorations.with(decoration, decorations[decoration]);
          }
          return this;
        }
        decorationIfAbsent(decoration, flag) {
          if (this._init.decorations.get(decoration) !== "not_set") return this;
          if (typeof flag === "boolean") flag = exports.TextDecoration.State.fromBoolean(flag);
          this._init.decorations = this._init.decorations.with(decoration, flag);
          return this;
        }
        clickEvent(clickEvent) {
          this._init.clickEvent = clickEvent;
          return this;
        }
        hoverEvent(hoverEvent) {
          this._init.hoverEvent = hoverEvent;
          return this;
        }
        insertion(insertion) {
          this._init.insertion = insertion;
          return this;
        }
        build() {
          return new StyleImpl({ ...this._init });
        }
      }
      const EMPTY_STYLE = new StyleImpl(EMPTY_STYLE_INIT);
      function empty() {
        return EMPTY_STYLE;
      }
      Style2.empty = empty;
      function styleFactory() {
        const nargs = arguments.length;
        if (nargs === 0) {
          return new BuilderImpl();
        } else if (nargs === 1) {
          const builder = new BuilderImpl();
          const fn = arguments[0];
          fn(builder);
          return builder.build();
        } else {
          const builder = new BuilderImpl();
          builder.color(arguments[0]);
          for (let i = 1; i < arguments.length; i++) {
            builder.decorate(arguments[i]);
          }
          return builder.build();
        }
      }
      Style2.style = styleFactory;
    })(exports.Style || (exports.Style = {}));

    var ComponentCompaction;
    ((ComponentCompaction2) => {
      function isText(component) {
        return component.type === "text";
      }
      function joinText(a, b) {
        return exports.Component.text(a.content() + b.content()).style(a.style()).append(...b.children());
      }
      function compact(self, parentStyle) {
        const children = self.children();
        let optimized = self.children([]);
        if (parentStyle) optimized = optimized.style(self.style().unmerge(parentStyle));
        const childrenSize = children.length;
        if (childrenSize === 0) return optimized;
        if (childrenSize === 1 && isText(optimized)) {
          const textComponent = optimized;
          if (textComponent.content().length === 0) {
            const child = children[0];
            return child.style(child.style().merge(optimized.style())).compact();
          }
        }
        let childParentStyle = optimized.style();
        if (parentStyle) childParentStyle = childParentStyle.merge(parentStyle);
        const childrenToAppend = new Array(childrenSize);
        let head = 0;
        for (let child of children) {
          child = compact(child, childParentStyle);
          if (child.children().length === 0 && isText(child)) {
            const textComponent = child;
            if (textComponent.content().length === 0) continue;
          }
          childrenToAppend[head++] = child;
        }
        childrenToAppend.length = head;
        if (isText(optimized)) {
          while (childrenToAppend.length !== 0) {
            const child = childrenToAppend[0];
            const childStyle = child.style().merge(childParentStyle);
            if (isText(child) && exports.Style.equals(childStyle, childParentStyle)) {
              optimized = joinText(optimized, child);
              childrenToAppend.splice(0, 1);
              ArrayUtil.insertAtStart(childrenToAppend, child.children());
            } else {
              break;
            }
          }
        }
        for (let i = 0; i + 1 < childrenToAppend.length; ) {
          const child = childrenToAppend[i];
          const neighbor = childrenToAppend[i + 1];
          if (child.children().length === 0 && isText(child) && isText(neighbor)) {
            const childStyle = child.style().merge(childParentStyle);
            const neighborStyle = neighbor.style().merge(childParentStyle);
            if (exports.Style.equals(childStyle, neighborStyle)) {
              childrenToAppend[i] = joinText(child, neighbor);
              childrenToAppend.splice(i + 1, 1);
              continue;
            }
          }
          i++;
        }
        return optimized.children(childrenToAppend);
      }
      ComponentCompaction2.compact = compact;
    })(ComponentCompaction || (ComponentCompaction = {}));

    var __defProp$N = Object.defineProperty;
    var __defNormalProp$N = (obj, key, value) => key in obj ? __defProp$N(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$N = (obj, key, value) => __defNormalProp$N(obj, typeof key !== "symbol" ? key + "" : key, value);
    class AbstractScopedComponent {
      constructor(extra, children = [], style = exports.Style.empty()) {
        __publicField$N(this, "_extra");
        __publicField$N(this, "_children");
        __publicField$N(this, "_style");
        __publicField$N(this, "children", defineAccessor(
          () => ArrayUtil.immutableView(this._children),
          (children) => {
            const normalized = new Array(children.length);
            for (let i = 0; i < children.length; i++) normalized[i] = children[i].asComponent();
            return this._mutate(this._extra, normalized, this._style);
          }
        ));
        __publicField$N(this, "style", defineAccessor(
          () => this._style,
          (style) => this._mutate(this._extra, this._children, style)
        ));
        __publicField$N(this, "font", defineAccessor(
          () => this._style.font(),
          (font) => this._mutateStyle((s) => s.font(font))
        ));
        __publicField$N(this, "color", defineAccessor(
          () => this._style.color(),
          (color) => this._mutateStyle((s) => s.color(color))
        ));
        __publicField$N(this, "shadowColor", defineAccessor(
          () => this._style.shadowColor(),
          (shadowColor) => this._mutateStyle((s) => s.shadowColor(shadowColor))
        ));
        __publicField$N(this, "decoration", defineContextualAccessor(
          (decoration) => this._style.decoration(decoration),
          (decoration, state) => this._mutateStyle((s) => s.decoration(decoration, state))
        ));
        __publicField$N(this, "decorations", defineAccessor(
          () => this._style.decorations(),
          (decorations) => this._mutateStyle((s) => s.decorations(decorations))
        ));
        __publicField$N(this, "clickEvent", defineAccessor(
          () => this._style.clickEvent(),
          (clickEvent) => this._mutateStyle((s) => s.clickEvent(clickEvent))
        ));
        __publicField$N(this, "hoverEvent", defineAccessor(
          () => this._style.hoverEvent(),
          (hoverEvent) => this._mutateStyle((s) => s.hoverEvent(hoverEvent))
        ));
        __publicField$N(this, "insertion", defineAccessor(
          () => this._style.insertion(),
          (insertion) => this._mutateStyle((s) => s.insertion(insertion))
        ));
        this._children = children;
        this._style = style;
        this._extra = extra;
      }
      //
      asComponent() {
        return this;
      }
      append(...components) {
        const current = this._children.length;
        const newChildren = new Array(current + components.length);
        for (let i = 0; i < current; i++) newChildren[i] = this._children[i];
        for (let i = 0; i < components.length; i++) newChildren[current + i] = components[i].asComponent();
        return this._mutate(this._extra, newChildren, this._style);
      }
      colorIfAbsent(color) {
        return this._mutateStyle((s) => s.colorIfAbsent(color));
      }
      shadowColorIfAbsent(shadowColor) {
        return this._mutateStyle((s) => s.shadowColorIfAbsent(shadowColor));
      }
      hasDecoration(decoration) {
        return this._style.hasDecoration(decoration);
      }
      decorate(...decorations) {
        return this._mutateStyle((s) => s.decorate(...decorations));
      }
      decorationIfAbsent(decoration, state) {
        return this._mutateStyle((s) => s.decorationIfAbsent(decoration, state));
      }
      compact(parentStyle) {
        return ComponentCompaction.compact(this.asComponent(), !!parentStyle ? parentStyle : null);
      }
      _getExtra(key) {
        return this._extra[key];
      }
      _withExtra(key, value) {
        const newExtra = { ...this._extra };
        newExtra[key] = value;
        return this._mutate(newExtra, this._children, this._style);
      }
      _mutateStyle(fn) {
        return this._mutate(this._extra, this._children, fn(this._style));
      }
    }

    var __defProp$M = Object.defineProperty;
    var __defNormalProp$M = (obj, key, value) => key in obj ? __defProp$M(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$M = (obj, key, value) => __defNormalProp$M(obj, typeof key !== "symbol" ? key + "" : key, value);
    var TextComponent;
    ((TextComponent2) => {
      TextComponent2.TYPE = "text";
    })(TextComponent || (TextComponent = {}));
    class TextComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$M(this, "type", TextComponent.TYPE);
        //
        __publicField$M(this, "content", defineAccessor(
          () => this._getExtra("content"),
          (content) => this._withExtra("content", content)
        ));
      }
      _mutate(extra, children, style) {
        return new TextComponentImpl(extra, children, style);
      }
    }

    var __defProp$L = Object.defineProperty;
    var __defNormalProp$L = (obj, key, value) => key in obj ? __defProp$L(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$L = (obj, key, value) => __defNormalProp$L(obj, typeof key !== "symbol" ? key + "" : key, value);
    var TranslatableComponent;
    ((TranslatableComponent2) => {
      TranslatableComponent2.TYPE = "translatable";
    })(TranslatableComponent || (TranslatableComponent = {}));
    class TranslatableComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$L(this, "type", TranslatableComponent.TYPE);
        //
        __publicField$L(this, "key", defineAccessor(
          () => this._getExtra("key"),
          (key) => this._withExtra("key", key)
        ));
        __publicField$L(this, "arguments", defineAccessor(
          () => ArrayUtil.immutableView(this._getExtra("arguments")),
          (args) => this._withExtra("arguments", ArrayUtil.immutableView(args))
        ));
        __publicField$L(this, "fallback", defineAccessor(
          () => this._getExtra("fallback"),
          (fallback) => this._withExtra("fallback", fallback)
        ));
      }
      _mutate(extra, children, style) {
        return new TranslatableComponentImpl(extra, children, style);
      }
    }

    var __defProp$K = Object.defineProperty;
    var __defNormalProp$K = (obj, key, value) => key in obj ? __defProp$K(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$K = (obj, key, value) => __defNormalProp$K(obj, typeof key !== "symbol" ? key + "" : key, value);
    var SelectorComponent;
    ((SelectorComponent2) => {
      SelectorComponent2.TYPE = "selector";
    })(SelectorComponent || (SelectorComponent = {}));
    class SelectorComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$K(this, "type", SelectorComponent.TYPE);
        //
        __publicField$K(this, "pattern", defineAccessor(
          () => this._getExtra("pattern"),
          (pattern) => this._withExtra("pattern", pattern)
        ));
        __publicField$K(this, "separator", defineAccessor(
          () => this._getExtra("separator"),
          (separator) => this._withExtra("separator", separator)
        ));
      }
      _mutate(extra, children, style) {
        return new SelectorComponentImpl(extra, children, style);
      }
    }

    var __defProp$J = Object.defineProperty;
    var __defNormalProp$J = (obj, key, value) => key in obj ? __defProp$J(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$J = (obj, key, value) => __defNormalProp$J(obj, typeof key !== "symbol" ? key + "" : key, value);
    var ScoreComponent;
    ((ScoreComponent2) => {
      ScoreComponent2.TYPE = "score";
    })(ScoreComponent || (ScoreComponent = {}));
    class ScoreComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$J(this, "type", ScoreComponent.TYPE);
        //
        __publicField$J(this, "name", defineAccessor(
          () => this._getExtra("name"),
          (name) => this._withExtra("name", name)
        ));
        __publicField$J(this, "objective", defineAccessor(
          () => this._getExtra("objective"),
          (objective) => this._withExtra("objective", objective)
        ));
      }
      _mutate(extra, children, style) {
        return new ScoreComponentImpl(extra, children, style);
      }
    }

    var __defProp$I = Object.defineProperty;
    var __defNormalProp$I = (obj, key, value) => key in obj ? __defProp$I(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$I = (obj, key, value) => __defNormalProp$I(obj, typeof key !== "symbol" ? key + "" : key, value);
    var KeybindComponent;
    ((KeybindComponent2) => {
      KeybindComponent2.TYPE = "keybind";
    })(KeybindComponent || (KeybindComponent = {}));
    class KeybindComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$I(this, "type", KeybindComponent.TYPE);
        //
        __publicField$I(this, "keybind", defineAccessor(
          () => this._getExtra("keybind"),
          (keybind) => this._withExtra("keybind", keybind)
        ));
      }
      _mutate(extra, children, style) {
        return new KeybindComponentImpl(extra, children, style);
      }
    }

    var __defProp$H = Object.defineProperty;
    var __defNormalProp$H = (obj, key, value) => key in obj ? __defProp$H(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$H = (obj, key, value) => __defNormalProp$H(obj, typeof key !== "symbol" ? key + "" : key, value);
    var ObjectComponent;
    ((ObjectComponent2) => {
      ObjectComponent2.TYPE = "object";
    })(ObjectComponent || (ObjectComponent = {}));
    class ObjectComponentImpl extends AbstractScopedComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$H(this, "type", ObjectComponent.TYPE);
        //
        __publicField$H(this, "contents", defineAccessor(
          () => this._getExtra("contents"),
          (contents) => this._withExtra("contents", contents)
        ));
      }
      _mutate(extra, children, style) {
        return new ObjectComponentImpl(extra, children, style);
      }
    }

    var __defProp$G = Object.defineProperty;
    var __defNormalProp$G = (obj, key, value) => key in obj ? __defProp$G(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$G = (obj, key, value) => __defNormalProp$G(obj, typeof key !== "symbol" ? key + "" : key, value);
    class AbstractNBTComponent extends AbstractScopedComponent {
      constructor() {
        super(...arguments);
        __publicField$G(this, "nbtPath", defineAccessor(
          () => this._getExtra("nbtPath"),
          (nbtPath) => this._withExtra("nbtPath", nbtPath)
        ));
        __publicField$G(this, "interpret", defineAccessor(
          () => this._getExtra("interpret"),
          (interpret) => this._withExtra("interpret", interpret)
        ));
        __publicField$G(this, "separator", defineAccessor(
          () => this._getExtra("separator"),
          (separator) => this._withExtra("separator", separator)
        ));
      }
    }

    var __defProp$F = Object.defineProperty;
    var __defNormalProp$F = (obj, key, value) => key in obj ? __defProp$F(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$F = (obj, key, value) => __defNormalProp$F(obj, typeof key !== "symbol" ? key + "" : key, value);
    var BlockNBTComponent;
    ((BlockNBTComponent2) => {
      BlockNBTComponent2.TYPE = "blockNBT";
      let LocalPos;
      ((LocalPos2) => {
        function localPos(left, up, forwards) {
          return Object.freeze({
            type: "local",
            left() {
              return left;
            },
            up() {
              return up;
            },
            forwards() {
              return forwards;
            },
            asString() {
              return `^${left} ^${up} ^${forwards}`;
            },
            toString() {
              return this.asString();
            }
          });
        }
        LocalPos2.localPos = localPos;
      })(LocalPos = BlockNBTComponent2.LocalPos || (BlockNBTComponent2.LocalPos = {}));
      let WorldPos;
      ((WorldPos2) => {
        function worldPos(x, y, z) {
          return Object.freeze({
            type: "world",
            x() {
              return x;
            },
            y() {
              return y;
            },
            z() {
              return z;
            },
            asString() {
              return `${x.toString()} ${y.toString()} ${z.toString()}`;
            },
            toString() {
              return this.asString();
            }
          });
        }
        WorldPos2.worldPos = worldPos;
        ((Coordinate2) => {
          function coordinate(value, type) {
            return Object.freeze({
              type() {
                return type;
              },
              value() {
                return value;
              },
              toString() {
                return type === "absolute" ? `${value}` : `~${value}`;
              }
            });
          }
          Coordinate2.coordinate = coordinate;
          function absolute(value) {
            return coordinate(value, "absolute");
          }
          Coordinate2.absolute = absolute;
          function relative(value) {
            return coordinate(value, "relative");
          }
          Coordinate2.relative = relative;
        })(WorldPos2.Coordinate || (WorldPos2.Coordinate = {}));
      })(WorldPos = BlockNBTComponent2.WorldPos || (BlockNBTComponent2.WorldPos = {}));
      ((Pos2) => {
        function fromString(input) {
          const localMatch = /^\^([\d.]+)\x20\^([\d.]+)\x20\^([\d.]+)$/.exec(input);
          if (localMatch) {
            const a = parseFloat(localMatch[1]);
            const b = parseFloat(localMatch[2]);
            const c = parseFloat(localMatch[3]);
            if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
              return LocalPos.localPos(a, b, c);
            }
          }
          const worldMatch = /^(~?)(\d+)\x20(~?)(\d+)\x20(~?)(\d+)$/.exec(input);
          if (worldMatch) {
            const ai = parseInt(worldMatch[2]);
            const bi = parseInt(worldMatch[4]);
            const ci = parseInt(worldMatch[6]);
            if (!isNaN(ai) && !isNaN(bi) && !isNaN(ci)) {
              const a = WorldPos.Coordinate.coordinate(ai, !!worldMatch[1] ? "relative" : "absolute");
              const b = WorldPos.Coordinate.coordinate(bi, !!worldMatch[3] ? "relative" : "absolute");
              const c = WorldPos.Coordinate.coordinate(ci, !!worldMatch[5] ? "relative" : "absolute");
              return WorldPos.worldPos(a, b, c);
            }
          }
          throw new Error(`Cannot convert position specification "${input}" into a position`);
        }
        Pos2.fromString = fromString;
      })(BlockNBTComponent2.Pos || (BlockNBTComponent2.Pos = {}));
    })(BlockNBTComponent || (BlockNBTComponent = {}));
    class BlockNBTComponentImpl extends AbstractNBTComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$F(this, "type", BlockNBTComponent.TYPE);
        //
        __publicField$F(this, "pos", defineAccessor(
          () => this._getExtra("pos"),
          (pos) => this._withExtra("pos", pos)
        ));
      }
      _mutate(extra, children, style) {
        return new BlockNBTComponentImpl(extra, children, style);
      }
    }

    var __defProp$E = Object.defineProperty;
    var __defNormalProp$E = (obj, key, value) => key in obj ? __defProp$E(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$E = (obj, key, value) => __defNormalProp$E(obj, typeof key !== "symbol" ? key + "" : key, value);
    var StorageNBTComponent;
    ((StorageNBTComponent2) => {
      StorageNBTComponent2.TYPE = "storageNBT";
    })(StorageNBTComponent || (StorageNBTComponent = {}));
    class StorageNBTComponentImpl extends AbstractNBTComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$E(this, "type", StorageNBTComponent.TYPE);
        //
        __publicField$E(this, "storage", defineAccessor(
          () => this._getExtra("storage"),
          (storage) => this._withExtra("storage", exports.Key.key(storage))
        ));
      }
      _mutate(extra, children, style) {
        return new StorageNBTComponentImpl(extra, children, style);
      }
    }

    var __defProp$D = Object.defineProperty;
    var __defNormalProp$D = (obj, key, value) => key in obj ? __defProp$D(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$D = (obj, key, value) => __defNormalProp$D(obj, typeof key !== "symbol" ? key + "" : key, value);
    var EntityNBTComponent;
    ((EntityNBTComponent2) => {
      EntityNBTComponent2.TYPE = "entityNBT";
    })(EntityNBTComponent || (EntityNBTComponent = {}));
    class EntityNBTComponentImpl extends AbstractNBTComponent {
      constructor(extra, children, style) {
        super(extra, children, style);
        __publicField$D(this, "type", EntityNBTComponent.TYPE);
        //
        __publicField$D(this, "selector", defineAccessor(
          () => this._getExtra("selector"),
          (selector) => this._withExtra("selector", selector)
        ));
      }
      _mutate(extra, children, style) {
        return new EntityNBTComponentImpl(extra, children, style);
      }
    }

    exports.Component = void 0;
    ((Component2) => {
      function isComponent(value) {
        return typeof value === "object" && value !== null && value instanceof AbstractScopedComponent;
      }
      Component2.isComponent = isComponent;
      function text(content) {
        return new TextComponentImpl({ content });
      }
      Component2.text = text;
      const EMPTY = text("");
      const NEWLINE = text("\n");
      const SPACE = text(" ");
      function empty() {
        return EMPTY;
      }
      Component2.empty = empty;
      function newline() {
        return NEWLINE;
      }
      Component2.newline = newline;
      function space() {
        return SPACE;
      }
      Component2.space = space;
      function translatable(key, fallback = null, args = []) {
        return new TranslatableComponentImpl({
          key,
          fallback,
          arguments: ArrayUtil.immutableView(args)
        });
      }
      Component2.translatable = translatable;
      function blockNBTConstructor() {
        let nbtPath;
        let interpret = false;
        let separator = null;
        let pos;
        if (arguments.length === 2) {
          nbtPath = `${arguments[0]}`;
          pos = arguments[1];
        } else if (arguments.length === 3) {
          nbtPath = `${arguments[0]}`;
          interpret = !!arguments[1];
          pos = arguments[2];
        } else if (arguments.length === 4) {
          nbtPath = `${arguments[0]}`;
          interpret = !!arguments[1];
          separator = arguments[2];
          pos = arguments[3];
        } else {
          throw new Error(`Expected 2-4 arguments, got ${arguments.length}`);
        }
        return new BlockNBTComponentImpl({
          nbtPath,
          interpret,
          separator: separator === null ? null : separator.asComponent(),
          pos
        });
      }
      Component2.blockNBT = blockNBTConstructor;
      function storageNBTConstructor() {
        let nbtPath;
        let interpret = false;
        let separator = null;
        let storage;
        if (arguments.length === 2) {
          nbtPath = `${arguments[0]}`;
          storage = arguments[1];
        } else if (arguments.length === 3) {
          nbtPath = `${arguments[0]}`;
          interpret = !!arguments[1];
          storage = arguments[2];
        } else if (arguments.length === 4) {
          nbtPath = `${arguments[0]}`;
          interpret = !!arguments[1];
          separator = arguments[2];
          storage = arguments[3];
        } else {
          throw new Error(`Expected 2-4 arguments, got ${arguments.length}`);
        }
        return new StorageNBTComponentImpl({
          nbtPath,
          interpret,
          separator: separator === null ? null : separator.asComponent(),
          storage: exports.Key.key(storage)
        });
      }
      Component2.storageNBT = storageNBTConstructor;
      function entityNBT(nbtPath, selector2) {
        return new EntityNBTComponentImpl({
          nbtPath,
          interpret: false,
          separator: null,
          selector: selector2
        });
      }
      Component2.entityNBT = entityNBT;
      function selector(pattern, separator = null) {
        return new SelectorComponentImpl({ pattern, separator });
      }
      Component2.selector = selector;
      function score(name, objective) {
        return new ScoreComponentImpl({ name, objective });
      }
      Component2.score = score;
      function keybind(keybind2) {
        return new KeybindComponentImpl({ keybind: keybind2 });
      }
      Component2.keybind = keybind;
      function object(contents) {
        return new ObjectComponentImpl({ contents });
      }
      Component2.object = object;
    })(exports.Component || (exports.Component = {}));

    var __defProp$C = Object.defineProperty;
    var __defNormalProp$C = (obj, key, value) => key in obj ? __defProp$C(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$C = (obj, key, value) => __defNormalProp$C(obj, typeof key !== "symbol" ? key + "" : key, value);
    var PlayerHeadObjectContents;
    ((PlayerHeadObjectContents2) => {
      function newContents(name, id, profileProperties, hat, texture) {
        const finalTexture = texture === null ? null : exports.Key.key(texture);
        return Object.freeze({
          type: "playerHead",
          name() {
            return name;
          },
          id() {
            return id;
          },
          profileProperties() {
            return ArrayUtil.immutableView(profileProperties);
          },
          hat() {
            return hat;
          },
          texture() {
            return finalTexture;
          }
        });
      }
      function property(name, value, signature = null) {
        return Object.freeze({
          name() {
            return name;
          },
          value() {
            return value;
          },
          signature() {
            return signature;
          }
        });
      }
      PlayerHeadObjectContents2.property = property;
      class BuilderImpl {
        constructor() {
          __publicField$C(this, "_name", null);
          __publicField$C(this, "_id", null);
          __publicField$C(this, "_properties", {});
          __publicField$C(this, "_hat", true);
          __publicField$C(this, "_texture", null);
        }
        //
        name(name) {
          this._name = name;
          return this;
        }
        id(id) {
          this._id = id;
          return this;
        }
        profileProperty(property2) {
          this._properties[property2.name()] = property2;
          return this;
        }
        profileProperties(properties) {
          this._properties = {};
          for (let property2 of properties) this._properties[property2.name()] = property2;
          return this;
        }
        hat(hat) {
          this._hat = hat;
          return this;
        }
        texture(texture) {
          this._texture = texture === null ? null : exports.Key.key(texture);
          return this;
        }
        build() {
          const propKeys = Object.keys(this._properties);
          const propValues = new Array(propKeys.length);
          for (let i = 0; i < propKeys.length; i++) {
            propValues[i] = this._properties[propKeys[i]];
          }
          return newContents(
            this._name,
            this._id,
            propValues,
            this._hat,
            this._texture
          );
        }
      }
      function builder() {
        return new BuilderImpl();
      }
      PlayerHeadObjectContents2.builder = builder;
    })(PlayerHeadObjectContents || (PlayerHeadObjectContents = {}));

    var SpriteObjectContents;
    ((SpriteObjectContents2) => {
      SpriteObjectContents2.DEFAULT_ATLAS = exports.Key.key("minecraft:blocks");
    })(SpriteObjectContents || (SpriteObjectContents = {}));

    exports.ObjectContents = void 0;
    ((ObjectContents2) => {
      function spriteConstructor() {
        let atlas = SpriteObjectContents.DEFAULT_ATLAS;
        let sprite2;
        if (arguments.length === 1) {
          sprite2 = exports.Key.key(arguments[0]);
        } else if (arguments.length === 2) {
          atlas = exports.Key.key(arguments[0]);
          sprite2 = exports.Key.key(arguments[1]);
        } else {
          throw new Error(`Expected 1-2 arguments, got ${arguments.length}`);
        }
        return Object.freeze({
          type: "sprite",
          atlas() {
            return atlas;
          },
          sprite() {
            return sprite2;
          }
        });
      }
      ObjectContents2.sprite = spriteConstructor;
      function playerHead() {
        return PlayerHeadObjectContents.builder();
      }
      ObjectContents2.playerHead = playerHead;
    })(exports.ObjectContents || (exports.ObjectContents = {}));

    function assertReal(x, descriptor) {
      if (typeof x === "undefined") throw new TypeError(`'${descriptor}' may not be undefined`);
      if (null === x) throw new TypeError(`'${descriptor}' may not be null`);
      return x;
    }
    function assertObject(x) {
      if (typeof x !== "object") throw new Error(`Expected object, got ${typeof x}`);
    }
    function assertNever(x) {
      throw new Error(`Unexpected value: ${x}`);
    }

    var __defProp$B = Object.defineProperty;
    var __defNormalProp$B = (obj, key, value) => key in obj ? __defProp$B(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$B = (obj, key, value) => __defNormalProp$B(obj, typeof key !== "symbol" ? key + "" : key, value);
    class FunctionalComponentRenderer {
      mapContext(transformer) {
        return new MappedComponentRenderer(this, transformer);
      }
    }
    class MappedComponentRenderer extends FunctionalComponentRenderer {
      constructor(backing, transformer) {
        super();
        __publicField$B(this, "_backing");
        __publicField$B(this, "_transformer");
        this._backing = backing;
        this._transformer = transformer;
      }
      render(component, context) {
        return this._backing.render(component, this._transformer.apply(null, [context]));
      }
    }
    class AbstractComponentRenderer extends FunctionalComponentRenderer {
      constructor() {
        super();
      }
      //
      render(component, context) {
        component = this.preRender(component, context);
        const { type } = component;
        let rendered;
        switch (type) {
          case TextComponent.TYPE:
            rendered = this.renderText(component, context);
            break;
          case TranslatableComponent.TYPE:
            rendered = this.renderTranslatable(component, context);
            break;
          case BlockNBTComponent.TYPE:
            rendered = this.renderBlock(component, context);
            break;
          case EntityNBTComponent.TYPE:
            rendered = this.renderEntity(component, context);
            break;
          case StorageNBTComponent.TYPE:
            rendered = this.renderStorage(component, context);
            break;
          case SelectorComponent.TYPE:
            rendered = this.renderSelector(component, context);
            break;
          case ScoreComponent.TYPE:
            rendered = this.renderScore(component, context);
            break;
          case KeybindComponent.TYPE:
            rendered = this.renderKeybind(component, context);
            break;
          case ObjectComponent.TYPE:
            rendered = this.renderObject(component, context);
            break;
          default:
            assertNever(type);
        }
        rendered = this.postRender(rendered, context);
        return rendered;
      }
      preRender(component, context) {
        return component;
      }
      postRender(component, context) {
        return component;
      }
    }

    var __defProp$A = Object.defineProperty;
    var __defNormalProp$A = (obj, key, value) => key in obj ? __defProp$A(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$A = (obj, key, value) => __defNormalProp$A(obj, typeof key !== "symbol" ? key + "" : key, value);
    const truncateColor = (() => {
      const NAMED = Object.values(exports.NamedTextColor.NAMES);
      const distance = ((a, b) => {
        let dist = 0;
        const sum = ((component) => {
          const difference = a[component]() - b[component]();
          dist += difference * difference;
        });
        sum("red");
        sum("green");
        sum("blue");
        return dist;
      });
      return ((color) => {
        if (exports.NamedTextColor.isNamed(color)) return color;
        let closest = NAMED[0];
        let closestDist = distance(color, closest);
        for (let i = 1; i < NAMED.length; i++) {
          const next = NAMED[i];
          const dist = distance(color, next);
          if (dist < closestDist) {
            closest = next;
            closestDist = dist;
          }
        }
        return closest;
      });
    })();
    const _LegacyColorComponentRenderer = class _LegacyColorComponentRenderer extends AbstractComponentRenderer {
      constructor() {
        super(...arguments);
        __publicField$A(this, "renderBlock", this._renderComponent);
        __publicField$A(this, "renderEntity", this._renderComponent);
        __publicField$A(this, "renderKeybind", this._renderComponent);
        __publicField$A(this, "renderObject", this._renderComponent);
        __publicField$A(this, "renderScore", this._renderComponent);
        __publicField$A(this, "renderSelector", this._renderComponent);
        __publicField$A(this, "renderStorage", this._renderComponent);
        __publicField$A(this, "renderText", this._renderComponent);
        __publicField$A(this, "renderTranslatable", this._renderComponent);
      }
      static renderer() {
        return this.INSTANCE;
      }
      //
      render(component) {
        return super.render(component, null);
      }
      //
      _renderComponent(component) {
        let style = component.style();
        let children = component.children();
        let changed = false;
        let copiedChildren = false;
        const color = style.color();
        if (color !== null) {
          style = style.color(truncateColor(color));
          changed = true;
        }
        const shadowColor = style.shadowColor();
        if (shadowColor !== null) {
          let value = shadowColor.value();
          let textColor = exports.TextColor.color(value & 16777215);
          textColor = truncateColor(textColor);
          value = textColor.value() | value & 4278190080;
          style = style.shadowColor(exports.ShadowColor.shadowColor(value));
          changed = true;
        }
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const renderedChild = this.render(child);
          if (!changed && child === renderedChild) continue;
          if (!copiedChildren) {
            children = [...children];
            copiedChildren = true;
          }
          children[i] = renderedChild;
          changed = true;
        }
        return changed ? component.style(style).children(children) : component;
      }
    };
    __publicField$A(_LegacyColorComponentRenderer, "INSTANCE", new _LegacyColorComponentRenderer());
    let LegacyColorComponentRenderer = _LegacyColorComponentRenderer;

    exports.FlattenerListener = void 0;
    ((FlattenerListener2) => {
      const DEFAULTS = {
        pushStyle() {
        },
        popStyle() {
        },
        shouldContinue() {
          return true;
        }
      };
      function of(fn) {
        return Object.freeze({ component: fn });
      }
      FlattenerListener2.of = of;
      function normalize(listener) {
        if (!("component" in listener)) {
          throw new Error(`Invalid listener`);
        }
        if ("pushStyle" in listener && "popStyle" in listener && "shouldContinue" in listener) {
          return listener;
        }
        return Object.freeze({
          ...DEFAULTS,
          ...listener
        });
      }
      FlattenerListener2.normalize = normalize;
    })(exports.FlattenerListener || (exports.FlattenerListener = {}));

    var __defProp$z = Object.defineProperty;
    var __defNormalProp$z = (obj, key, value) => key in obj ? __defProp$z(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$z = (obj, key, value) => __defNormalProp$z(obj, typeof key !== "symbol" ? key + "" : key, value);
    class Stack {
      constructor() {
        __publicField$z(this, "_tail");
        __publicField$z(this, "_size");
        this._tail = null;
        this._size = 0;
      }
      //
      get size() {
        return this._size;
      }
      clear() {
        this._tail = null;
        this._size = 0;
      }
      push(value) {
        this._tail = { value, parent: this._tail };
        this._size++;
        return value;
      }
      pop() {
        const node = this._tail;
        if (node === null) return null;
        this._tail = node.parent;
        this._size--;
        return node.value;
      }
      peek() {
        const node = this._tail;
        if (node === null) return null;
        return node.value;
      }
    }

    var __defProp$y = Object.defineProperty;
    var __defNormalProp$y = (obj, key, value) => key in obj ? __defProp$y(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$y = (obj, key, value) => __defNormalProp$y(obj, typeof key !== "symbol" ? key + "" : key, value);
    class ComponentFlattenerImpl {
      constructor(flatteners, unknownHandler) {
        __publicField$y(this, "_flatteners");
        __publicField$y(this, "_unknownHandler");
        this._flatteners = flatteners;
        this._unknownHandler = unknownHandler;
      }
      //
      flatten(input, listener) {
        const l = exports.FlattenerListener.normalize(listener);
        const componentStack = new Stack();
        const styleStack = new Stack();
        componentStack.push({ component: input, stylesToPop: 1 });
        let entry;
        while ((entry = componentStack.pop()) != null) {
          const component = entry.component;
          const handler = this.handler(component);
          const style = component.style();
          l.pushStyle(style);
          styleStack.push(style);
          if (handler)
            l.component(handler(component));
          const children = component.children();
          if (children.length !== 0 && l.shouldContinue()) {
            const z = children.length - 1;
            for (let i = z; i >= 0; i--) {
              if (i === z) {
                componentStack.push({
                  component: children[i],
                  stylesToPop: entry.stylesToPop + 1
                });
              } else {
                componentStack.push({
                  component: children[i],
                  stylesToPop: 1
                });
              }
            }
          } else {
            for (let i = entry.stylesToPop; i > 0; i--) {
              const style2 = styleStack.pop();
              l.popStyle(style2);
            }
          }
        }
        while (styleStack.size !== 0) {
          const style = styleStack.pop();
          l.popStyle(style);
        }
      }
      toBuilder() {
        const builder = exports.ComponentFlattener.builder();
        for (const key of Object.keys(this._flatteners)) {
          const type = key;
          builder.mapper(type, this._flatteners[type]);
        }
        return builder;
      }
      handler(component) {
        const handler = this._flatteners[component.type];
        if (handler) return handler;
        return this._unknownHandler;
      }
    }
    exports.ComponentFlattener = void 0;
    ((ComponentFlattener2) => {
      class BuilderImpl {
        constructor() {
          __publicField$y(this, "_flatteners", {});
          __publicField$y(this, "_unknownHandler", null);
        }
        //
        mapper(type, converter) {
          this._flatteners[type] = converter;
          return this;
        }
        unknownMapper(converter) {
          this._unknownHandler = converter;
          return this;
        }
        build() {
          return new ComponentFlattenerImpl(
            { ...this._flatteners },
            this._unknownHandler
          );
        }
      }
      function builder() {
        return new BuilderImpl();
      }
      ComponentFlattener2.builder = builder;
      const BASIC = builder().mapper(KeybindComponent.TYPE, (c) => c.keybind()).mapper(SelectorComponent.TYPE, (c) => c.pattern()).mapper(TextComponent.TYPE, (c) => c.content()).mapper(TranslatableComponent.TYPE, (c) => {
        const fallback = c.fallback();
        return fallback !== null ? fallback : c.key();
      }).mapper(ObjectComponent.TYPE, (c) => {
        const contents = c.contents();
        if (contents.type === "sprite") {
          let sprite = contents.sprite();
          let atlas = contents.atlas();
          return exports.Key.equals(atlas, SpriteObjectContents.DEFAULT_ATLAS) ? `[${sprite.asMinimalString()}]` : `[${sprite.asMinimalString()}@${atlas.asMinimalString()}]`;
        } else if (contents.type === "playerHead") {
          let name = contents.name();
          if (name === null) name = "unknown player";
          return `[${name} head]`;
        } else {
          return "";
        }
      }).build();
      const TEXT_ONLY = builder().mapper(TextComponent.TYPE, (c) => c.content()).build();
      function basic() {
        return BASIC;
      }
      ComponentFlattener2.basic = basic;
      function textOnly() {
        return TEXT_ONLY;
      }
      ComponentFlattener2.textOnly = textOnly;
    })(exports.ComponentFlattener || (exports.ComponentFlattener = {}));

    var __defProp$x = Object.defineProperty;
    var __defNormalProp$x = (obj, key, value) => key in obj ? __defProp$x(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$x = (obj, key, value) => __defNormalProp$x(obj, typeof key !== "symbol" ? key + "" : key, value);
    function codePointCount(data, from = 0, to = data.length) {
      let ret = 0;
      let codePoint;
      for (let i = from; i < to; i++) {
        codePoint = data.codePointAt(i);
        ret++;
        if (codePoint > 65535) i++;
      }
      return ret;
    }
    const _StringBuilder = class _StringBuilder {
      constructor(capacity = 16) {
        __publicField$x(this, "_u16");
        __publicField$x(this, "_initialCapacity");
        __publicField$x(this, "_capacity");
        __publicField$x(this, "_length");
        if (capacity < 0) throw new Error("Capacity must be positive");
        this._u16 = new Uint16Array(capacity);
        this._initialCapacity = capacity;
        this._capacity = capacity;
        this._length = 0;
      }
      get length() {
        return this._length;
      }
      clear() {
        this._length = 0;
        if (this._capacity > this._initialCapacity) {
          this.setCapacity(this._initialCapacity, false);
        }
      }
      isEmpty() {
        return this._length === 0;
      }
      // Ensure that the internal array can store "size" more elements
      provision(size) {
        let required = this._length + size;
        if (required <= this._capacity) return;
        required = Math.ceil((required + 1) / _StringBuilder.LOAD_FACTOR);
        this.setCapacity(required, true);
      }
      // Sets the capacity of the internal array
      setCapacity(cap, mustCopy) {
        let buf = this._u16.buffer;
        if ("transfer" in buf) {
          buf = buf.transfer(cap << 1);
          this._u16 = new Uint16Array(buf);
        } else {
          const cpy = new Uint16Array(cap);
          if (mustCopy) cpy.set(this._u16, 0);
          this._u16 = cpy;
        }
        this._capacity = cap;
      }
      append(value) {
        switch (typeof value) {
          case "string":
            return this.appendString(value);
          case "object":
            if (null === value) return this.appendString("null");
            if (value instanceof _StringBuilder) return this.appendStringBuilder(value);
            return this.appendString(value.toString());
          default:
            return this.appendString(String(value));
        }
      }
      appendChar(value) {
        this.provision(1);
        this._u16[this._length++] = Character(value).value;
        return this;
      }
      appendString(value, start = 0, end = value.length) {
        const length = end - start;
        if (length < 0) throw new Error(`Negative range`);
        this.provision(length);
        for (let i = start; i < end; i++) {
          this._u16[this._length++] = value.charCodeAt(i);
        }
        return this;
      }
      appendStringBuilder(other) {
        this.provision(other._length);
        this._u16.set(other._u16.subarray(0, other._length), this._length);
        this._length += other._length;
        return this;
      }
      charCodeAt(index) {
        if (index < 0 || index >= this._length)
          throw new Error(`Index ${index} out of bounds for length ${this._length}`);
        return this._u16[index];
      }
      indexOf(value) {
        const l = value.length;
        if (l === 0) return -1;
        let z = 0;
        for (let i = 0; i < this._length; i++) {
          if (value.charCodeAt(z) === this._u16[i]) {
            if (++z === l) return i - l + 1;
          } else {
            z = 0;
          }
        }
        return -1;
      }
      indexOfChar(char) {
        for (let i = 0; i < this._length; i++) {
          if (char === this._u16[i]) return i;
        }
        return -1;
      }
      /**
       * Converts the StringBuilder into a string.
       * @param offset Offset into the string (in codepoints) to start converting. Default is 0.
       * @param length Length (number of codepoints) to convert. Default is the length of the internal array.
       */
      toString(offset, length) {
        if (typeof offset === "undefined") {
          offset = 0;
        } else if (offset < 0) {
          throw new Error(`Offset cannot be negative`);
        } else if (offset >= this._length) {
          throw new Error(`Index ${offset} out of bounds for length ${this._length}`);
        }
        if (typeof length === "undefined") {
          length = this._length - offset;
          if (length < 0) throw new Error(`Offset ${offset} out of bounds for length ${this._length}`);
        } else if (length < 0) {
          throw new Error(`Length cannot be negative`);
        } else if (length > this._length - offset) {
          throw new Error(`Index ${length + offset - 1} out of bounds for length ${this._length}`);
        }
        return this.toString0(offset, length);
      }
      toString0(offset, length) {
        let ret = "";
        const codePointBufferSize = Math.min(length, 255);
        const codePointBuffer = new Array(codePointBufferSize);
        let codePointBufferPos = 0;
        let code;
        let i = 0;
        while (i < length) {
          code = this._u16[i++ + offset];
          if (code >= 55296 && code <= 57343 && i < length) {
            let lo = this._u16[i++ + offset];
            code = (code - 55296 << 10) + lo + 9216;
          }
          codePointBuffer[codePointBufferPos++] = code;
          if (codePointBufferPos === codePointBufferSize) {
            ret += String.fromCodePoint.apply(null, codePointBuffer);
            codePointBufferPos = 0;
          }
        }
        if (codePointBufferPos !== 0) {
          codePointBuffer.length = codePointBufferPos;
          ret += String.fromCodePoint.apply(null, codePointBuffer);
        }
        return ret;
      }
    };
    __publicField$x(_StringBuilder, "LOAD_FACTOR", 0.75);
    let StringBuilder = _StringBuilder;

    var __defProp$w = Object.defineProperty;
    var __defNormalProp$w = (obj, key, value) => key in obj ? __defProp$w(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$w = (obj, key, value) => __defNormalProp$w(obj, typeof key !== "symbol" ? key + "" : key, value);
    class PlainTextComponentSerializerImpl {
      constructor(flattener) {
        //
        __publicField$w(this, "_flattener");
        this._flattener = flattener;
      }
      //
      serialize(component) {
        const builder = new StringBuilder();
        this._flattener.flatten(component, exports.FlattenerListener.of((text) => {
          builder.append(text);
        }));
        return builder.toString();
      }
      deserialize(input) {
        return exports.Component.text(input);
      }
    }
    __publicField$w(PlainTextComponentSerializerImpl, "DEFAULT_FLATTENER", exports.ComponentFlattener.basic().toBuilder().unknownMapper((component) => {
      throw new Error(`Don't know how to turn component of type "${component.type}" into a string`);
    }).build());
    exports.PlainTextComponentSerializer = void 0;
    ((PlainTextComponentSerializer2) => {
      class BuilderImpl {
        constructor() {
          __publicField$w(this, "_flattener", PlainTextComponentSerializerImpl.DEFAULT_FLATTENER);
        }
        //
        flattener(flattener) {
          this._flattener = flattener;
          return this;
        }
        build() {
          return new PlainTextComponentSerializerImpl(this._flattener);
        }
      }
      const INSTANCE = new BuilderImpl().build();
      function plainText() {
        return INSTANCE;
      }
      PlainTextComponentSerializer2.plainText = plainText;
      function builder() {
        return new BuilderImpl();
      }
      PlainTextComponentSerializer2.builder = builder;
    })(exports.PlainTextComponentSerializer || (exports.PlainTextComponentSerializer = {}));

    var __defProp$v = Object.defineProperty;
    var __defNormalProp$v = (obj, key, value) => key in obj ? __defProp$v(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$v = (obj, key, value) => __defNormalProp$v(obj, typeof key !== "symbol" ? key + "" : key, value);
    const s = (() => {
      const n = new Uint32Array([738695, 669989, 770404, 703814]);
      return ((i) => {
        return n[i >> 4] >> (i & 3) * 5 & 31;
      });
    })();
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) {
      K[i] = 4294967296 * Math.abs(Math.sin(i + 1));
    }
    const BIG_ENDIAN = (() => {
      const buf = new ArrayBuffer(2);
      const u8 = new Uint8Array(buf);
      const u16 = new Uint16Array(buf);
      u8[0] = 170;
      u8[1] = 187;
      return u16[0] === 43707;
    })();
    class AlignedBuffer {
      constructor(byteLength) {
        __publicField$v(this, "raw");
        __publicField$v(this, "_u8");
        __publicField$v(this, "_u32");
        if (byteLength & 3) throw new Error(`Length ${byteLength} is not aligned`);
        this.raw = new ArrayBuffer(byteLength);
        this._u8 = new Uint8Array(this.raw);
        this._u32 = new Uint32Array(this.raw);
      }
      //
      get byteLength() {
        return this.raw.byteLength;
      }
      get wordLength() {
        return this.raw.byteLength >> 2;
      }
      get bytes() {
        return this._u8;
      }
      getWord(index) {
        this._checkWordIndex(index);
        let word = this._u32[index];
        if (BIG_ENDIAN) word = this._reverseWord(word);
        return word;
      }
      setWord(index, value) {
        this._checkWordIndex(index);
        if (BIG_ENDIAN) value = this._reverseWord(value);
        this._u32[index] = value;
      }
      putWords(src, offset = 0) {
        this._checkWordIndex(offset);
        this._u32.set(src, offset);
        if (BIG_ENDIAN) {
          for (let i = 0; i < src.length; i++) {
            this._u32[offset + i] = this._reverseWord(this._u32[offset + i]);
          }
        }
      }
      _checkWordIndex(index) {
        const length = this.wordLength;
        if (index < 0 || index >= length) throw new Error(`Word index ${index} out of bounds for length ${length}`);
      }
      _reverseWord(word) {
        return (word & 255) << 24 | (word & 65280) << 8 | word >> 24 & 255 | word >> 8 & 65280;
      }
    }
    class MessageDigest {
      constructor() {
        __publicField$v(this, "_digest");
        __publicField$v(this, "_buf");
        __publicField$v(this, "_head", 0);
        this._digest = new AlignedBuffer(16);
        this._buf = new AlignedBuffer(64);
        this._resetDigest();
      }
      //
      update(chunk) {
        const length = chunk.byteLength;
        let head = 0;
        while (head < length) {
          const bufferIndex = this._head % 64;
          const available = this._buf.byteLength - bufferIndex;
          const remaining = length - head;
          if (remaining < available) {
            this._buf.bytes.set(chunk.subarray(head, length), bufferIndex);
            this._head += remaining;
            return;
          }
          this._buf.bytes.set(chunk.subarray(head, head + available), bufferIndex);
          this._head += available;
          head += available;
          this._chunk();
        }
      }
      digest() {
        const byteLength = this._head;
        const bufferIndex = byteLength % 64;
        if (bufferIndex < 56) {
          if (bufferIndex !== 55) this._buf.bytes.fill(0, bufferIndex + 1, 56);
          this._buf.bytes[bufferIndex] = 128;
        } else {
          if (bufferIndex !== 63) this._buf.bytes.fill(0, bufferIndex + 1, 64);
          this._buf.bytes[bufferIndex] = 128;
          this._chunk();
          this._buf.bytes.fill(0, 0, 56);
        }
        this._buf.setWord(14, byteLength << 3 & 4294967295);
        this._buf.setWord(15, byteLength >>> 29);
        this._chunk();
        const ret = new Uint8Array(16);
        ret.set(this._digest.bytes, 0);
        this._resetDigest();
        return ret;
      }
      _chunk() {
        const vars = new Uint32Array(6);
        for (let i = 0; i < 4; i++) vars[i] = this._digest.getWord(i);
        for (let i = 0; i < 64; i++) {
          switch (i >> 4) {
            case 0:
              vars[4] = vars[1] & vars[2] | ~vars[1] & vars[3];
              vars[5] = i;
              break;
            case 1:
              vars[4] = vars[3] & vars[1] | ~vars[3] & vars[2];
              vars[5] = (5 * i + 1) % 16;
              break;
            case 2:
              vars[4] = vars[1] ^ vars[2] ^ vars[3];
              vars[5] = (3 * i + 5) % 16;
              break;
            case 3:
              vars[4] = vars[2] ^ (vars[1] | ~vars[3]);
              vars[5] = 7 * i % 16;
              break;
            default:
              return;
          }
          vars[4] = vars[4] + vars[0] + K[i] + this._buf.getWord(vars[5]);
          vars[0] = vars[3];
          vars[3] = vars[2];
          vars[2] = vars[1];
          vars[1] = vars[1] + this._lrot(vars[4], s(i));
        }
        this._digest.setWord(0, this._digest.getWord(0) + vars[0]);
        this._digest.setWord(1, this._digest.getWord(1) + vars[1]);
        this._digest.setWord(2, this._digest.getWord(2) + vars[2]);
        this._digest.setWord(3, this._digest.getWord(3) + vars[3]);
      }
      _resetDigest() {
        this._digest.putWords([1732584193, 4023233417, 2562383102, 271733878]);
        this._head = 0;
      }
      _lrot(n, v) {
        return n << v | n >>> 32 - v;
      }
    }

    var __defProp$u = Object.defineProperty;
    var __defNormalProp$u = (obj, key, value) => key in obj ? __defProp$u(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$u = (obj, key, value) => __defNormalProp$u(obj, key + "" , value);
    class UUID {
      constructor(ab) {
        //
        __publicField$u(this, "_buf");
        if (ab.byteLength !== 16) throw new Error(`Illegal byte length`);
        this._buf = new DataView(ab);
      }
      static fromArray(array) {
        if (array.length !== 4)
          throw new Error(`Expected UUID array to be 4 ints long, got ${array.length}`);
        const ab = new ArrayBuffer(16);
        const buf = new DataView(ab);
        buf.setInt32(0, array[0], false);
        buf.setInt32(4, array[1], false);
        buf.setInt32(8, array[2], false);
        buf.setInt32(12, array[3], false);
        return new UUID(ab);
      }
      static fromString(text) {
        let dashed;
        if (text.length === 36) {
          dashed = true;
        } else if (text.length === 32) {
          dashed = false;
        } else {
          throw new Error(`UUID string "${text}" should be 32 or 36 characters (got ${text.length}`);
        }
        const ab = new ArrayBuffer(16);
        const u8 = new Uint8Array(ab);
        let textHead = 0;
        let byteHead = 0;
        const nibble = (() => {
          const pos = textHead++;
          const char = text.charCodeAt(pos);
          if (Character.ZERO.value <= char && char <= Character.NINE.value) {
            return char - Character.ZERO.value;
          } else if (Character.LOWERCASE_A.value <= char && char <= Character.LOWERCASE_F.value) {
            return char - Character.LOWERCASE_A.value + 10;
          } else if (Character.UPPERCASE_A.value <= char && char <= Character.UPPERCASE_F.value) {
            return char - Character.UPPERCASE_A.value + 10;
          } else {
            throw new Error(`Expected hex char @ position ${pos} in UUID string "${text}"`);
          }
        });
        const hex = ((count) => {
          for (let i = 0; i < count; i++) {
            const hi = nibble();
            const lo = nibble();
            u8[byteHead++] = hi << 4 | lo;
          }
        });
        const dash = (() => {
          if (!dashed) return;
          const pos = textHead++;
          const char = text.charCodeAt(pos);
          if (char === Character.DASH.value) return;
          throw new Error(`Expected dash @ position ${pos} in UUID string "${text}"`);
        });
        hex(4);
        dash();
        hex(2);
        dash();
        hex(2);
        dash();
        hex(2);
        dash();
        hex(6);
        return new UUID(ab);
      }
      static nameUUIDFromBytes(bytes) {
        const md = new MessageDigest();
        md.update(bytes);
        const u8 = md.digest();
        u8[6] &= 15;
        u8[6] |= 48;
        u8[8] &= 63;
        u8[8] |= 128;
        return new UUID(u8.buffer);
      }
      //
      toArray() {
        return [
          this._buf.getInt32(0, false),
          this._buf.getInt32(4, false),
          this._buf.getInt32(8, false),
          this._buf.getInt32(12, false)
        ];
      }
      toString(noDashes) {
        const chars = new Array(noDashes ? 32 : 36);
        let head = 0;
        const nibble = ((n) => {
          chars[head++] = n < 10 ? Character.ZERO.value + n : Character.LOWERCASE_A.value + n - 10;
        });
        const hex = ((start, end) => {
          let u8;
          for (let i = start; i < end; i++) {
            u8 = this._buf.getUint8(i);
            nibble(u8 >>> 4);
            nibble(u8 & 15);
          }
        });
        const dash = (() => {
          if (noDashes) return;
          chars[head++] = Character.DASH.value;
        });
        hex(0, 4);
        dash();
        hex(4, 6);
        dash();
        hex(6, 8);
        dash();
        hex(8, 10);
        dash();
        hex(10, 16);
        chars.length = head;
        return String.fromCharCode.apply(null, chars);
      }
    }

    var __defProp$t = Object.defineProperty;
    var __defNormalProp$t = (obj, key, value) => key in obj ? __defProp$t(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$t = (obj, key, value) => __defNormalProp$t(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _JsonComponentSerializerImpl = class _JsonComponentSerializerImpl {
      //
      serialize(component) {
        switch (component.type) {
          case TextComponent.TYPE:
            return this.serializeText(component);
          case TranslatableComponent.TYPE:
            return this.serializeTranslatable(component);
          case ScoreComponent.TYPE:
            return this.serializeScore(component);
          case SelectorComponent.TYPE:
            return this.serializeSelector(component);
          case KeybindComponent.TYPE:
            return this.serializeKeybind(component);
          case StorageNBTComponent.TYPE:
            return this.serializeStorageNbt(component);
          case BlockNBTComponent.TYPE:
            return this.serializeBlockNbt(component);
          case EntityNBTComponent.TYPE:
            return this.serializeEntityNbt(component);
          case ObjectComponent.TYPE:
            return this.serializeObject(component);
          default:
            assertNever(component);
        }
      }
      deserialize(input) {
        if (typeof input !== "object" || input === null)
          return exports.Component.text(`${input}`);
        if (Array.isArray(input)) {
          const array = input;
          let ret2 = null;
          for (let i = 0; i < array.length; i++) {
            const next = this.deserialize(array[i]);
            if (ret2 === null) {
              ret2 = next;
            } else {
              ret2 = ret2.append(next);
            }
          }
          if (ret2 === null)
            throw new Error(`Unable to deserialize empty array`);
          return ret2;
        }
        const get = ((key) => {
          return input[key];
        });
        const getString = ((key) => {
          return `${get(key)}`;
        });
        const style = exports.Style.style();
        let extra = null;
        let text = null;
        let translate = null;
        let translateFallback = null;
        let translateWith = null;
        let scoreName = null;
        let scoreObjective = null;
        let selector = null;
        let keybind = null;
        let nbt = null;
        let nbtInterpret = false;
        let nbtBlock = null;
        let nbtEntity = null;
        let nbtStorage = null;
        let separator = null;
        let atlas = null;
        let sprite = null;
        let playerHeadContents = null;
        let playerHeadContentsHasProfile = false;
        for (const key of Object.keys(input)) {
          const qual = key;
          switch (qual) {
            case "text":
              text = getString(qual);
              break;
            case "translate":
              translate = getString(qual);
              break;
            case "fallback":
              translateFallback = getString(qual);
              break;
            case "with":
              translateWith = this.deserializeList(get(qual));
              break;
            case "score":
              const jsonScore = get(qual);
              scoreName = jsonScore.name;
              scoreObjective = jsonScore.objective;
              break;
            case "selector":
              selector = getString(qual);
              break;
            case "keybind":
              keybind = getString(qual);
              break;
            case "nbt":
              nbt = getString(qual);
              break;
            case "interpret":
              nbtInterpret = !!get(qual);
              break;
            case "block":
              const pos = getString(qual);
              nbtBlock = BlockNBTComponent.Pos.fromString(pos);
              break;
            case "entity":
              nbtEntity = getString(qual);
              break;
            case "storage":
              nbtStorage = getString(qual);
              break;
            case "extra":
              extra = this.deserializeList(get(qual));
              break;
            case "separator":
              separator = this.deserialize(get(qual));
              break;
            case "atlas":
              atlas = getString(qual);
              break;
            case "sprite":
              sprite = getString(qual);
              break;
            case "player":
              if (playerHeadContents === null) playerHeadContents = exports.ObjectContents.playerHead();
              const data = get(qual);
              if (typeof data === "string") {
                playerHeadContentsHasProfile = true;
                playerHeadContents.name(data);
              } else if (typeof data === "object") {
                playerHeadContentsHasProfile = true;
                if ("name" in data) playerHeadContents.name(`${data.name}`);
                if ("id" in data) playerHeadContents.id(UUID.fromArray(data.id).toString());
                if ("texture" in data) playerHeadContents.texture(`${data.texture}`);
                const { properties } = data;
                if (properties && Array.isArray(properties)) {
                  for (let i = 0; i < properties.length; i++) {
                    const jsonProperty = properties[i];
                    const { signature } = jsonProperty;
                    const property = PlayerHeadObjectContents.property(
                      jsonProperty.name,
                      jsonProperty.value,
                      !!signature ? signature : null
                    );
                    playerHeadContents.profileProperty(property);
                  }
                }
              }
              break;
            case "hat":
              if (playerHeadContents === null) playerHeadContents = exports.ObjectContents.playerHead();
              playerHeadContents.hat(!!get(qual));
              break;
            case "color":
              const jsonColor = getString(qual);
              let color = exports.TextColor.fromHexString(jsonColor);
              if (color === null) {
                const token = jsonColor.toLowerCase();
                if (token in exports.NamedTextColor.NAMES) color = exports.NamedTextColor.NAMES[token];
                throw new Error(`Unable to parse color: ${jsonColor}`);
              }
              style.color(color);
              break;
            case "font":
              style.font(getString(qual));
              break;
            case "bold":
            case "italic":
            case "underlined":
            case "strikethrough":
            case "obfuscated":
              const value = !!get(qual);
              style.decoration(qual, exports.TextDecoration.State.fromBoolean(value));
              break;
            case "shadow_color":
              const sc = get(qual);
              if (typeof sc === "number") {
                style.color(exports.ShadowColor.shadowColor(sc));
              } else if (Array.isArray(sc)) {
                const dv = new DataView(new ArrayBuffer(4));
                for (let i = 0; i < 4; i++) {
                  dv.setUint8(i, 255 * Number(sc[i]));
                }
                style.color(exports.ShadowColor.shadowColor(dv.getUint32(0, false)));
              }
              break;
            case "insertion":
              style.insertion(getString(qual));
              break;
            case "click_event":
              const e1 = get(qual);
              if (e1) style.clickEvent(this.deserializeClickEvent(e1));
              break;
            case "hover_event":
              const e2 = get(qual);
              if (e2) style.hoverEvent(this.deserializeHoverEvent(e2));
              break;
            case "object":
            case "type":
            case "source":
              break;
            default:
              assertNever(qual);
          }
        }
        let ret;
        if (text !== null) {
          ret = exports.Component.text(text);
        } else if (translate !== null) {
          if (translateWith !== null) {
            ret = exports.Component.translatable(translate, translateFallback, translateWith);
          } else {
            ret = exports.Component.translatable(translate, translateFallback);
          }
        } else if (scoreName !== null && scoreObjective !== null) {
          ret = exports.Component.score(scoreName, scoreObjective);
        } else if (selector !== null) {
          ret = exports.Component.selector(selector, separator);
        } else if (keybind !== null) {
          ret = exports.Component.keybind(keybind);
        } else if (nbt !== null) {
          if (nbtBlock !== null) {
            ret = exports.Component.blockNBT(nbt, nbtInterpret, separator, nbtBlock);
          } else if (nbtEntity !== null) {
            ret = exports.Component.entityNBT(nbt, nbtEntity).interpret(nbtInterpret).separator(separator);
          } else if (nbtStorage !== null) {
            ret = exports.Component.storageNBT(nbt, nbtStorage).interpret(nbtInterpret).separator(separator);
          } else {
            throw new Error(`Missing block, entity or storage tag in NBT component`);
          }
        } else if (sprite !== null) {
          ret = exports.Component.object(exports.ObjectContents.sprite(
            atlas !== null ? atlas : SpriteObjectContents.DEFAULT_ATLAS,
            sprite
          ));
        } else if (playerHeadContents !== null && playerHeadContentsHasProfile) {
          ret = exports.Component.object(playerHeadContents.build());
        } else {
          throw new Error(`Unable to deserialize object`);
        }
        ret = ret.style(style.build());
        if (extra !== null) ret = ret.append(...extra);
        return ret;
      }
      // Deserialization
      deserializeList(jsonComponents) {
        const components = new Array(jsonComponents.length);
        for (let i = 0; i < jsonComponents.length; i++) components[i] = this.deserialize(jsonComponents[i]);
        return components;
      }
      deserializeClickEvent(event) {
        const { action } = event;
        switch (action) {
          case "open_url":
            return exports.ClickEvent.openUrl(event.url);
          case "open_file":
            return exports.ClickEvent.openFile(event.path);
          case "run_command":
            return exports.ClickEvent.runCommand(event.command);
          case "suggest_command":
            return exports.ClickEvent.suggestCommand(event.command);
          case "change_page":
            return exports.ClickEvent.changePage(event.page);
          case "copy_to_clipboard":
            return exports.ClickEvent.copyToClipboard(event.value);
          case "show_dialog":
            throw new Error(`show_dialog click event is currently unsupported`);
          case "custom":
            return exports.ClickEvent.custom(event.id, `${event.payload}`);
          default:
            assertNever(action);
        }
      }
      deserializeHoverEvent(event) {
        const { action } = event;
        switch (action) {
          case "show_text":
            return exports.HoverEvent.showText(this.deserialize(event.value));
          case "show_entity":
            const { id, uuid, name } = event;
            return exports.HoverEvent.showEntity(
              id,
              Array.isArray(uuid) ? UUID.fromArray(uuid).toString() : `${uuid}`,
              !!name ? this.deserialize(name) : null
            );
          case "show_item":
            return exports.HoverEvent.showItem(event.id, event.count || 0);
          default:
            assertNever(action);
        }
      }
      // Serialization
      serializeText(component) {
        const content = component.content();
        if (component.children().length === 0 && component.style().isEmpty()) return content;
        return {
          ...this.serializeBase(component),
          text: content
        };
      }
      serializeTranslatable(component) {
        const key = component.key();
        const ret = {
          ...this.serializeBase(component),
          translate: key
        };
        const fallback = component.fallback();
        if (fallback) ret.fallback = fallback;
        const args = component.arguments();
        if (args && args.length !== 0) {
          const jsonArgs = new Array(args.length);
          for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (typeof arg === "object") {
              jsonArgs[i] = this.serialize(arg);
            } else {
              jsonArgs[i] = `${arg}`;
            }
          }
          ret.with = jsonArgs;
        }
        return ret;
      }
      serializeScore(component) {
        const name = component.name();
        const objective = component.objective();
        return {
          ...this.serializeBase(component),
          score: { name, objective }
        };
      }
      serializeSelector(component) {
        const pattern = component.pattern();
        const ret = {
          ...this.serializeBase(component),
          selector: pattern
        };
        const separator = component.separator();
        if (separator) ret.separator = this.serialize(separator);
        return ret;
      }
      serializeKeybind(component) {
        const keybind = component.keybind();
        return {
          ...this.serializeBase(component),
          keybind
        };
      }
      serializeStorageNbt(component) {
        const nbt = component.nbtPath();
        const interpret = component.interpret();
        const storage = component.storage().asString();
        const ret = {
          ...this.serializeBase(component),
          nbt,
          interpret,
          storage
        };
        const separator = component.separator();
        if (separator) ret.separator = this.serialize(separator);
        return ret;
      }
      serializeEntityNbt(component) {
        const nbt = component.nbtPath();
        const interpret = component.interpret();
        const entity = component.selector();
        const ret = {
          ...this.serializeBase(component),
          nbt,
          interpret,
          entity
        };
        const separator = component.separator();
        if (separator) ret.separator = this.serialize(separator);
        return ret;
      }
      serializeBlockNbt(component) {
        const nbt = component.nbtPath();
        const interpret = component.interpret();
        const block = component.pos();
        const ret = {
          ...this.serializeBase(component),
          nbt,
          interpret,
          block: block.asString()
        };
        const separator = component.separator();
        if (separator) ret.separator = this.serialize(separator);
        return ret;
      }
      serializeObject(component) {
        const contents = component.contents();
        const { type } = contents;
        if (type === "sprite") {
          const sprite = contents.sprite();
          const ret = {
            ...this.serializeBase(component),
            sprite: sprite.asString()
          };
          const atlas = contents.atlas();
          if (!exports.Key.equals(atlas, SpriteObjectContents.DEFAULT_ATLAS)) ret.atlas = atlas.asString();
          return ret;
        } else if (type === "playerHead") {
          const hat = contents.hat();
          const playerName = contents.name();
          const playerId = contents.id();
          const properties = contents.profileProperties();
          const texture = contents.texture();
          let profile;
          if (playerName !== null && playerId === null && properties.length === 0 && texture === null) {
            profile = playerName;
          } else {
            profile = {};
            if (playerName !== null) profile.name = playerName;
            if (playerId !== null) profile.id = UUID.fromString(playerId).toArray();
            if (texture !== null) profile.texture = texture.asString();
            if (properties.length !== 0) {
              const jsonProperties = new Array(properties.length);
              for (let i = 0; i < properties.length; i++) {
                const property = properties[i];
                const jsonProperty = {
                  name: property.name(),
                  value: property.value()
                };
                const signature = property.signature();
                if (signature) jsonProperty.signature = signature;
                jsonProperties[i] = jsonProperty;
              }
              profile.properties = jsonProperties;
            }
          }
          return {
            ...this.serializeBase(component),
            player: profile,
            hat
          };
        } else {
          throw new Error(`No rule to serialize contents of type "${type}"`);
        }
      }
      serializeBase(component) {
        const ret = {};
        const children = component.children();
        if (children.length !== 0) {
          const extra = new Array(children.length);
          for (let i = 0; i < children.length; i++) {
            extra[i] = this.serialize(children[i]);
          }
          ret.extra = extra;
        }
        const color = component.color();
        if (color) {
          if ("name" in color) {
            const namedColor = color;
            ret.color = namedColor.name();
          } else {
            ret.color = color.asHexString();
          }
        }
        const font = component.font();
        if (font) ret.font = font.asString();
        const useDecoration = ((decoration, consumer) => {
          const state = component.decoration(decoration);
          if (state === exports.TextDecoration.State.NOT_SET) return;
          consumer(state === exports.TextDecoration.State.TRUE);
        });
        useDecoration(exports.TextDecoration.BOLD, (v) => ret.bold = v);
        useDecoration(exports.TextDecoration.ITALIC, (v) => ret.italic = v);
        useDecoration(exports.TextDecoration.UNDERLINED, (v) => ret.underlined = v);
        useDecoration(exports.TextDecoration.STRIKETHROUGH, (v) => ret.strikethrough = v);
        useDecoration(exports.TextDecoration.OBFUSCATED, (v) => ret.obfuscated = v);
        const shadowColor = component.shadowColor();
        if (shadowColor) ret.shadow_color = shadowColor.value();
        const insertion = component.insertion();
        if (insertion) ret.insertion = insertion;
        const clickEvent = component.clickEvent();
        if (clickEvent) ret.click_event = this.serializeClickEvent(clickEvent);
        const hoverEvent = component.hoverEvent();
        if (hoverEvent) ret.hover_event = this.serializeHoverEvent(hoverEvent);
        return ret;
      }
      serializeClickEvent(clickEvent) {
        return _JsonComponentSerializerImpl.CLICK_EVENT_SERIALIZER.invoke(clickEvent, this);
      }
      serializeHoverEvent(hoverEvent) {
        return _JsonComponentSerializerImpl.HOVER_EVENT_SERIALIZER.invoke(hoverEvent, this);
      }
    };
    __publicField$t(_JsonComponentSerializerImpl, "CLICK_EVENT_SERIALIZER", (() => {
      const handlers = new exports.ClickEvent.Handlers();
      handlers.register(exports.ClickEvent.Action.RUN_COMMAND, (event) => {
        return { action: "run_command", command: event.payload().value() };
      });
      handlers.register(exports.ClickEvent.Action.SUGGEST_COMMAND, (event) => {
        return { action: "suggest_command", command: event.payload().value() };
      });
      handlers.register(exports.ClickEvent.Action.OPEN_URL, (event) => {
        return { action: "open_url", url: event.payload().value() };
      });
      handlers.register(exports.ClickEvent.Action.OPEN_FILE, (event) => {
        return { action: "open_file", path: event.payload().value() };
      });
      handlers.register(exports.ClickEvent.Action.COPY_TO_CLIPBOARD, (event) => {
        return { action: "copy_to_clipboard", value: event.payload().value() };
      });
      handlers.register(exports.ClickEvent.Action.CHANGE_PAGE, (event) => {
        return { action: "change_page", page: event.payload().integer() };
      });
      handlers.register(exports.ClickEvent.Action.CUSTOM, (event) => {
        const custom = event.payload();
        const ret = { action: "custom", id: custom.key().asString() };
        const nbt = custom.nbt();
        if (nbt !== null) ret.payload = nbt;
        return ret;
      });
      return handlers;
    })());
    __publicField$t(_JsonComponentSerializerImpl, "HOVER_EVENT_SERIALIZER", (() => {
      const handlers = new exports.HoverEvent.Handlers();
      handlers.register(exports.HoverEvent.Action.SHOW_ITEM, (event) => {
        const value = event.value();
        return { action: "show_item", id: value.item().asString(), count: value.count() };
      });
      handlers.register(exports.HoverEvent.Action.SHOW_TEXT, (event, context) => {
        return { action: "show_text", value: context.serialize(event.value()) };
      });
      handlers.register(exports.HoverEvent.Action.SHOW_ENTITY, (event, context) => {
        const value = event.value();
        let ret = { action: "show_entity", id: value.type(), uuid: value.id() };
        const name = value.name();
        if (name) ret.name = context.serialize(name);
        return ret;
      });
      return handlers;
    })());
    let JsonComponentSerializerImpl = _JsonComponentSerializerImpl;
    exports.JsonComponentSerializer = void 0;
    ((JsonComponentSerializer2) => {
      const INSTANCE = new JsonComponentSerializerImpl();
      function json() {
        return INSTANCE;
      }
      JsonComponentSerializer2.json = json;
    })(exports.JsonComponentSerializer || (exports.JsonComponentSerializer = {}));

    var TriState;
    ((TriState2) => {
      TriState2.TRUE = "true";
      TriState2.FALSE = "false";
      TriState2.NOT_SET = "not_set";
      function of(value) {
        return value ? TriState2.TRUE : TriState2.FALSE;
      }
      TriState2.of = of;
      function resolve(triState, fallback) {
        if (TriState2.TRUE === triState) return true;
        if (TriState2.FALSE === triState) return false;
        return fallback;
      }
      TriState2.resolve = resolve;
    })(TriState || (TriState = {}));

    const HtmlStyleStore = Object.freeze({
      get EMPTY() {
        return { underline: false, strikethrough: false };
      }
    });
    class BasicHtmlStyle {
      constructor(documentKey, sourceKey, value) {
        this.documentKey = documentKey;
        this.sourceKey = sourceKey;
        this.value = value;
      }
      //
      applyToStore() {
      }
      applyToDocument(style) {
        style[this.documentKey] = this.value;
      }
      applyToInlineSource(source) {
        if (!source.isEmpty()) source.appendChar(Character.SPACE);
        source.appendString(this.sourceKey).appendString(": ").append(this.value).appendChar(Character.SEMICOLON);
      }
    }
    class DecorationHtmlStyle {
      constructor(underline, strikethrough) {
        this.underline = underline;
        this.strikethrough = strikethrough;
      }
      //
      applyToStore(store) {
        if (this.underline === TriState.TRUE) store.underline = true;
        if (this.strikethrough === TriState.TRUE) store.strikethrough = true;
      }
      applyToDocument(style, parent) {
        style.textDecoration = this._computeValue(parent);
      }
      applyToInlineSource(source, parent) {
        if (!source.isEmpty()) source.appendChar(Character.SPACE);
        source.appendString("text-decoration: ").appendString(this._computeValue(parent)).appendChar(Character.SEMICOLON);
      }
      _computeValue(parent) {
        let decorations = [];
        if (this.underline === TriState.TRUE || this.underline !== TriState.FALSE && parent.underline)
          decorations.push("underline");
        if (this.strikethrough === TriState.TRUE || this.strikethrough !== TriState.FALSE && parent.strikethrough)
          decorations.push("line-through");
        if (decorations.length === 0) return "none";
        return decorations.join(" ");
      }
    }
    var HtmlStyle;
    ((HtmlStyle2) => {
      const DEFAULT_SHADOW_OFFSET = "0.10714286em";
      function textDecoration(underline, strikethrough) {
        return new DecorationHtmlStyle(underline, strikethrough);
      }
      HtmlStyle2.textDecoration = textDecoration;
      function fontWeight(weight) {
        return new BasicHtmlStyle("fontWeight", "font-weight", weight);
      }
      HtmlStyle2.fontWeight = fontWeight;
      function fontStyle(style) {
        return new BasicHtmlStyle("fontStyle", "font-style", style);
      }
      HtmlStyle2.fontStyle = fontStyle;
      function color(color2) {
        return new BasicHtmlStyle("color", "color", color2);
      }
      HtmlStyle2.color = color;
      function textShadow(color2, xOffset = DEFAULT_SHADOW_OFFSET, yOffset = DEFAULT_SHADOW_OFFSET) {
        return new BasicHtmlStyle("textShadow", "text-shadow", `${xOffset} ${yOffset} ${color2}`);
      }
      HtmlStyle2.textShadow = textShadow;
    })(HtmlStyle || (HtmlStyle = {}));

    var __defProp$s = Object.defineProperty;
    var __defNormalProp$s = (obj, key, value) => key in obj ? __defProp$s(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$s = (obj, key, value) => __defNormalProp$s(obj, typeof key !== "symbol" ? key + "" : key, value);
    const LOAD_FACTOR = 0.75;
    const mod = ((a, b) => {
      return (a % b + b) % b;
    });
    const hashNumber = (() => {
      const buf = new ArrayBuffer(8);
      const i32 = new Int32Array(buf);
      const f64 = new Float64Array(buf);
      return ((n) => {
        if (Number.isSafeInteger(n)) return n;
        f64[0] = n;
        return i32[0] ^ i32[1];
      });
    })();
    const uav = Character.UPPERCASE_A.value;
    const uzv = Character.UPPERCASE_Z.value;
    const ulo = Character.LOWERCASE_A.value - Character.UPPERCASE_A.value;
    class AbstractLookupTable {
      constructor(populate) {
        __publicField$s(this, "_buckets");
        __publicField$s(this, "_capacity");
        const queue = [];
        const put = ((k, v) => queue.push([k, v]));
        populate(put);
        const length = queue.length;
        const capacity = Math.ceil(length / LOAD_FACTOR);
        const buckets = new Array(capacity);
        buckets.fill(null);
        for (const entry of queue) {
          const [key, value] = entry;
          const newBucket = { key, value, next: null };
          const index = mod(this.hash(key), capacity);
          const existing = buckets[index];
          if (!existing) {
            buckets[index] = newBucket;
            continue;
          }
          let parent = existing;
          while (true) {
            if (this.eq(key, parent.key)) throw new Error(`Duplicate key (${value})`);
            const next = parent.next;
            if (!next) break;
            parent = next;
          }
          parent.next = newBucket;
        }
        this._buckets = buckets;
        this._capacity = capacity;
      }
      //
      has(key) {
        const index = mod(this.hash(key), this._capacity);
        let bucket = this._buckets[index];
        while (bucket) {
          if (this.eq(key, bucket.key)) return true;
          bucket = bucket.next;
        }
        return false;
      }
      get(key) {
        const index = mod(this.hash(key), this._capacity);
        let bucket = this._buckets[index];
        while (bucket) {
          if (this.eq(key, bucket.key)) return bucket.value;
          bucket = bucket.next;
        }
        return null;
      }
    }
    class NumberLookupTable extends AbstractLookupTable {
      constructor(populate) {
        super(populate);
      }
      //
      eq(a, b) {
        return a === b;
      }
      hash(k) {
        return hashNumber(k);
      }
    }
    class StringLookupTable extends AbstractLookupTable {
      constructor(populate, asciiCaseInsensitive = false) {
        super(populate);
        __publicField$s(this, "_asciiCaseInsensitive");
        this._asciiCaseInsensitive = asciiCaseInsensitive;
      }
      //
      eq(a, b) {
        if (!this._asciiCaseInsensitive)
          return a === b;
        const length = a.length;
        if (length !== b.length)
          return false;
        let ac;
        let bc;
        for (let i = 0; i < length; i++) {
          ac = a.charCodeAt(i);
          bc = b.charCodeAt(i);
          if (uav <= ac && ac <= uzv) ac += ulo;
          if (uav <= bc && bc <= uzv) bc += ulo;
          if (ac !== bc)
            return false;
        }
        return true;
      }
      hash(value) {
        let h = 7;
        for (let i = 0; i < value.length; i++) {
          let c = value.charCodeAt(i);
          if (this._asciiCaseInsensitive && uav <= c && c <= uzv) c += ulo;
          h = 31 * h + c;
        }
        return h;
      }
    }
    var LookupTable;
    ((LookupTable2) => {
      function number(populate) {
        return new NumberLookupTable(populate);
      }
      LookupTable2.number = number;
      function caseInsensitiveString(populate) {
        return new StringLookupTable(populate, true);
      }
      LookupTable2.caseInsensitiveString = caseInsensitiveString;
    })(LookupTable || (LookupTable = {}));

    var __defProp$r = Object.defineProperty;
    var __defNormalProp$r = (obj, key, value) => key in obj ? __defProp$r(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$r = (obj, key, value) => __defNormalProp$r(obj, typeof key !== "symbol" ? key + "" : key, value);
    const HTML_ENTITIES = LookupTable.number((put) => {
      put(Character.QUOTATION.value, `&quot;`);
      put(Character.APOSTROPHE.value, `&apos;`);
      put(Character.AMPERSAND.value, `&amp;`);
      put(Character.LESS_THAN.value, `&lt;`);
      put(Character.GREATER_THAN.value, `&gt;`);
      put(Character.NEWLINE.value, `<br>`);
    });
    class StringHtmlWriter {
      constructor() {
        __publicField$r(this, "_out");
        __publicField$r(this, "_stack");
        __publicField$r(this, "_writingProperties");
        __publicField$r(this, "_properties");
        __publicField$r(this, "_styles");
        this._out = new StringBuilder();
        this._stack = new Stack();
        this._writingProperties = false;
        this._properties = {};
        this._styles = HtmlStyleStore.EMPTY;
      }
      //
      openTag(tagName) {
        this._closeProperties();
        this._out.appendChar(Character.LESS_THAN).appendString(tagName);
        this._stack.push([tagName, { ...this._styles }]);
        this._writingProperties = true;
        this._properties = {};
        return this;
      }
      closeTag() {
        const data = this._stack.pop();
        if (data === null) throw new Error(`No tag to close`);
        this._closeProperties();
        this._out.appendString("</").appendString(data[0]).appendChar(Character.GREATER_THAN);
        this._styles = { ...data[1] };
        return this;
      }
      style(style) {
        this._checkWritingProperties();
        let sb;
        if ("style" in this._properties) {
          sb = this._properties["style"];
        } else {
          sb = new StringBuilder();
          this._properties["style"] = sb;
        }
        style.applyToInlineSource(sb, this._styles);
        style.applyToStore(this._styles);
        return this;
      }
      property(name, value) {
        this._checkWritingProperties();
        let sb;
        if (value) {
          sb = new StringBuilder(value.length);
          sb.appendString(value);
        } else {
          sb = new StringBuilder(0);
        }
        this._properties[name] = sb;
        return this;
      }
      content(text) {
        this._closeProperties();
        this._writeEscaping(text);
        return this;
      }
      toString() {
        return this._out.toString();
      }
      _checkWritingProperties() {
        if (this._writingProperties) return;
        throw new Error("Method call must follow a call to #openTag and precede any call to #content");
      }
      _closeProperties() {
        if (this._writingProperties) {
          for (const key of Object.keys(this._properties)) {
            this._out.appendChar(Character.SPACE).appendString(key).appendString(`="`);
            this._writeEscaping(this._properties[key]);
            this._out.appendChar(Character.QUOTATION);
          }
          this._out.appendChar(Character.GREATER_THAN);
          this._writingProperties = false;
        }
      }
      _writeEscaping(text) {
        let c;
        for (let i = 0; i < text.length; i++) {
          c = text.charCodeAt(i);
          const ent = HTML_ENTITIES.get(c);
          if (ent) {
            this._out.appendString(ent);
          } else {
            this._out.appendChar(c);
          }
        }
      }
    }

    var ObfuscatedFont;
    ((ObfuscatedFont2) => {
      ObfuscatedFont2.FAMILY = "Obfuscated";
      ObfuscatedFont2.inject = ((base64) => {
        const binary = atob(base64);
        const buf = new ArrayBuffer(binary.length);
        const u8 = new Uint8Array(buf);
        for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
        let loadPromise = null;
        return (() => {
          let ret = loadPromise;
          if (ret !== null) return ret;
          const face = new FontFace(ObfuscatedFont2.FAMILY, buf, { descentOverride: `30%`, ascentOverride: `104%` });
          loadPromise = ret = face.load().then((f) => {
            document.fonts.add(f);
          });
          return ret;
        });
      })(
        "d09GMgABAAAAAAP0AA0AAAAAEdAAAAOeAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGiAGYACCUhEICpY4jkkLcgABNgIkA3gEIAWDRQeBEhuHDBHVm3EhvjiwXdCgrSoiydUL8rhi5+BJySydJUvO46FvP353dvaL4RZ/wzWpJc9UfxuB5JmQiSaVRKgcQoS68Dw/9ztX3tv27+Qj1r1pJEQqGyJSqYnOD4UEKTA4b0gFuka19xDR17yla8MTHPgBx1fl1VxOXW5eqAJJ2hIa00qXZEN7d5lXZXYA6OrYGWShCIUnWVmngaypULaLdTXwK3BXOCyJAH/vz1fYgDdXDx/x2goCpmGeZQpUdG7025dEnhvhBQX6NQs2+wUVZAxrHjt3/qwD1rlfcfUNGzvJlg3rBOT4drJKAMclgVWqTYwrKaxz1f3esc5B13vvf/rP/lkAIEYhAKKAAgAQSEN1HcnF3aR1h2n96UQP+E+wZi2hjAup9HU/72es8yGmXGoDECd6V9znDnAXbynfyJMA48AIQDLKKSeUMvX0xE3CiMj9aIdRQr5nX5VSOE++42zDxDwaZm85DoRPlK/Dx/2t2Yf7e2PMftrPamo8JFLkCwmuo0ER1klon6IfCR9sZOrKzunBwb12VPrGyFjkDiOlwQ1C78PmQ9bSWOQh1dJR1+eAsgw9HpANlaBnKXUTwe1Y5EE30aPIirzT6BYmSEIz9J4dDFA3Mqul0/DyeiS8OXTEOjI0slY6f17MMu7z2HXIUQoNvzmRumOYScc1Cy14Bd6jSeEN1k24L2my8tqMZwMF4RKk9e5zKur7X4mztv3vRr8Pv9/AhJbO/v/zopucPK3n/iykQZ4+9M4whmqapmNdNXTRGAZtwklw9A4hOBJCDKZog6mUPTcKknu/yRwKNXlbdQ0pPIPbXVFlR06hIOYQjsEs1bS22kWRGkM/hTm4vdeTmnyW3j7JavpN0lqkGKz1djNMdkDgYHymPvxSXTY2yCBP/vPJ67V1e/9IOM+kFOlyYQXjyxOoQL5ymEUAWY1/CnEBCV4kYIdlRoECkszxJbhFhDCyBEVhF9KqZ1CN/MCI8L/zqFHUGKkVQAdiVoJqLYPZtwfcrHeQzPt9Edms/zic0hj8Xq3ap9eBUzeG//1HmH12Oqs3+m1qD/jtnV0BjjkdPvY1PkY9FFkeMZHcprFr5BmBEeqjCvwYgkoe8Iw9RuvJJG3Q5ProTTAvWkfaYHax4fGaG1iAQqNc8L7iQoP1eZ61AOAOCo5/ByAgmCAp2uX2eH0My/GCKMmKqgXd7DAt2/FjOEEiU6g0OoPJYnO4PL5AKBJLpDI5AA=="
      );
    })(ObfuscatedFont || (ObfuscatedFont = {}));

    var __defProp$q = Object.defineProperty;
    var __defNormalProp$q = (obj, key, value) => key in obj ? __defProp$q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$q = (obj, key, value) => __defNormalProp$q(obj, key + "" , value);
    class ObfuscatedDomEffectImpl {
      apply(element, data) {
        if (data) {
          ObfuscatedFont.inject().then(() => this._applyTrue(element));
        } else {
          this._applyFalse(element);
        }
      }
      serialize(data) {
        return data ? "true" : "false";
      }
      deserialize(value) {
        return "true" === value;
      }
      //
      _applyTrue(element) {
        element.style.fontFamily = ObfuscatedFont.FAMILY;
        const fragments = [];
        for (const node of element.childNodes) {
          if (node.nodeType !== Node.TEXT_NODE) continue;
          const content = node.textContent;
          if (content === null || content.length === 0) continue;
          const factory = new TextFactory(content);
          fragments.push(new Fragment(node, factory));
        }
        let last = window.performance.now();
        const frame = (() => {
          const now = window.performance.now();
          const elapsed = now - last;
          let ok;
          if (elapsed >= 20) {
            last = now;
            ok = false;
            for (const fragment of fragments) {
              ok || (ok = fragment.render());
            }
          } else {
            ok = true;
          }
          if (ok) {
            window.requestAnimationFrame(frame);
          }
        });
        window.requestAnimationFrame(frame);
      }
      _applyFalse(element) {
        let family = `sans-serif`;
        let parent = element.parentElement;
        let next = false;
        while (parent !== null) {
          if ("true" === parent.getAttribute(`data-mm-${ObfuscatedDomEffect.TOKEN}`)) {
            next = true;
          } else if (next) {
            family = window.getComputedStyle(parent).fontFamily;
            break;
          }
          parent = parent.parentElement;
        }
        element.style.fontFamily = family;
      }
    }
    var ObfuscatedDomEffect;
    ((ObfuscatedDomEffect2) => {
      ObfuscatedDomEffect2.TOKEN = "obfuscated";
      ObfuscatedDomEffect2.INSTANCE = new ObfuscatedDomEffectImpl();
    })(ObfuscatedDomEffect || (ObfuscatedDomEffect = {}));
    class Fragment {
      constructor(node, factory) {
        this.node = node;
        this.factory = factory;
      }
      //
      render() {
        if (this.node.isConnected) {
          this.node.textContent = this.factory.generate();
          return true;
        } else {
          return false;
        }
      }
    }
    class TextFactory {
      constructor(text) {
        __publicField$q(this, "_buf");
        const length = text.length;
        const buf = new Uint8Array(length);
        for (let i = 0; i < text.length; i++) {
          buf[i] = text.charCodeAt(i);
        }
        this._buf = buf;
      }
      //
      generate() {
        const la = Character.LOWERCASE_A.value;
        const f = Character.LOWERCASE_Z.value - la + 1;
        let c;
        for (let i = 0; i < this._buf.length; i++) {
          c = this._buf[i];
          if (Character.SPACE.is(c)) continue;
          c = Math.floor(Math.random() * f) + la;
          this._buf[i] = c;
        }
        return String.fromCharCode.apply(null, this._buf);
      }
    }

    var ErrorInfo;
    ((ErrorInfo2) => {
      const IS_ERROR_INFO = /* @__PURE__ */ Symbol("IS_ERROR_INFO");
      const FALLBACK_NAME = "Error";
      const isError = "isError" in Error ? ((e) => {
        return Error.isError(e);
      }) : ((e) => {
        return e instanceof Error;
      });
      function of(thrown) {
        let thrownIsError = false;
        let name = FALLBACK_NAME;
        let hasCause;
        let message;
        if (typeof thrown === "object") {
          if (thrown === null) {
            hasCause = false;
            message = "null";
          } else {
            if (IS_ERROR_INFO in thrown && thrown[IS_ERROR_INFO]) return thrown;
            hasCause = "cause" in thrown;
            if (isError(thrown)) {
              thrownIsError = true;
              const qual = thrown;
              name = qual.name;
              message = qual.message;
            } else {
              const className = thrown.constructor.name;
              if ("Object" !== className) name = className;
              message = thrown.toString();
            }
          }
        } else {
          hasCause = false;
          message = String(thrown);
        }
        const ret = {
          name,
          message,
          toError(type) {
            if (thrownIsError) return thrown;
            const ret2 = !!type ? new (Function.prototype.bind.apply(type, [message, this]))() : new Error(message, this);
            if (name !== ret2.name) ret2.name = name;
            return ret2;
          }
        };
        if (hasCause) {
          Object.defineProperty(ret, "cause", {
            get() {
              return thrown["cause"];
            },
            enumerable: true
          });
        }
        Object.defineProperty(ret, IS_ERROR_INFO, {
          value: true,
          writable: false,
          enumerable: false
        });
        return Object.freeze(ret);
      }
      ErrorInfo2.of = of;
    })(ErrorInfo || (ErrorInfo = {}));

    var __defProp$p = Object.defineProperty;
    var __defNormalProp$p = (obj, key, value) => key in obj ? __defProp$p(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$p = (obj, key, value) => __defNormalProp$p(obj, typeof key !== "symbol" ? key + "" : key, value);
    class Mutex {
      constructor() {
        __publicField$p(this, "_listeners", []);
        __publicField$p(this, "_locked", false);
      }
      //
      async lock() {
        if (!this._locked) {
          this._locked = true;
          return;
        }
        let listener = null;
        const promise = new Promise((resolve) => {
          listener = resolve;
        });
        if (listener === null) throw new Error(`Illegal promise behavior`);
        this._listeners.push(listener);
        return promise;
      }
      unlock() {
        if (!this._locked) return;
        if (this._listeners.length === 0) {
          this._locked = false;
          return;
        }
        const l0 = this._listeners.splice(0, 1)[0];
        try {
          l0();
        } catch (e) {
          this._locked = false;
          throw e;
        }
      }
    }
    class SharedCanvas {
      constructor(width, height) {
        __publicField$p(this, "_width");
        __publicField$p(this, "_height");
        __publicField$p(this, "_mutex");
        __publicField$p(this, "_state");
        this._width = width;
        this._height = height;
        this._mutex = new Mutex();
        this._state = null;
      }
      //
      async use(fn) {
        await this._mutex.lock();
        try {
          const state = this._getState();
          return await fn.apply(null, state);
        } finally {
          this._mutex.unlock();
        }
      }
      _getState() {
        if (this._state !== null) return this._state;
        const canvas = new OffscreenCanvas(this._width, this._height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error(`Failed to create rendering context`);
        return this._state = [canvas, ctx];
      }
    }

    var VanillaHeads;
    ((VanillaHeads2) => {
      const NAMES = ((...keys) => {
        const ret = {};
        let head = 0;
        for (const key of keys) {
          const index = head++;
          Object.defineProperty(ret, key, {
            value: index,
            writable: false,
            configurable: false,
            enumerable: true
          });
        }
        return ret;
      })(
        "alex",
        "ari",
        "efe",
        "kai",
        "makena",
        "noor",
        "steve",
        "sunny",
        "zuri"
      );
      const NAME_COUNT = Object.keys(NAMES).length;
      const getAtlas = /* @__PURE__ */ ((source) => {
        const load = (async (base64) => {
          const binaryString = atob(base64);
          const u8 = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) u8[i] = binaryString.charCodeAt(i);
          const blob = new Blob([u8.buffer], { type: "image/bmp" });
          const bitmap = await createImageBitmap(blob);
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const ctx = canvas.getContext("bitmaprenderer");
          ctx.transferFromImageBitmap(bitmap);
          return canvas;
        });
        const S_UNLOADED = 0;
        const S_LOADING = 1;
        const S_LOADED = 2;
        let state = { id: S_UNLOADED, source };
        return (async () => {
          const { id } = state;
          switch (id) {
            case S_UNLOADED:
              const promise = load(state.source);
              state = { id: S_LOADING, promise };
              promise.then((result) => {
                state = { id: S_LOADED, canvas: result };
              });
              return promise;
            case S_LOADING:
              return state.promise;
            case S_LOADED:
              return Promise.resolve(state.canvas);
          }
        });
      })(`Qk3uAwAAAAAAAK4BAAAoAAAASAAAAAgAAAABAAgAAAAAAEACAAAjLgAAIy4AAF4AAABeAAAAAAAAAAEEDgADAyQADgofABEOHgANERsAFhImABEWIgAIGCQAABguAA4YLgAeGTIADx4qAA0eKwAiIiIAER44AAodQgACHkEAGCIwABEkMwASJTQAGyg4ABAlSQAVKj8ALy8vAB0sWAAoNUQAODg4ADQraQAgNFkAEjCAACk+XwAnO3MAiT1SABg3hwAoPHUAMEBqADRFWgBJSUkAaT9mACBDdwA1QncAMEhtAB4/kwAkYiMAMUeRACJFnQA3U34Afk94ADlTgQBTZ0MAP1mQAIlYgQA6VqkAPl6PAI5chgA+YJQAQ1ynAEljmwCUYooATGeSAEBopABJaKYAnGmTAJ5rlQBKZ7kATHKrAFlyqgCpc5wAP3LBAF55swBbec0Aa4O3AEuE2ABhf+UATojOAG6B8QA/jeUAWJbfAD+Y6wBuk/EAX5/yAFio8wCGp/kAbbroALG77wCixN8AxsvTALDQ6wC/2u8AiuL7AJHt+wCq9PwA////AFhZWVlZWVhWUFNTU1NTU1A7QkJCQkJCO1tbTk5OTltbDBUaGhoaFQwtOUFBQUE5LTgxEBYQFjE2RUlRUVFRSUUfKi8vLy8qH1lZWVVVWVlYU1NTSkpTU1NAPkIoKEI+RFtOTigoTk5bFRoaEhIaGhU5QUEgIEFBOTM2FikpEDYxSVFRKChRUUkvLy8jIy8vKllZWVlZWVlZTExTU1NTTExAQkJCQkJCQFxOTk5OTk5bJRoaGhoaGiVBQUFBQUFBQTpDQyQkQ0M6UVFRUVFRUVE8Ly8vLy8vPFhdLFlZLF1YIl0CU1MCXSI7XRxCQhxdO1xdMk5OMl1cGlcJGhoJVxo1XRlBQRldNUNdIUM6IV1DSV0ASUkAXUkvXREvLxFdKk9PTVhZWFhNK1NTU1NTUys3PUJCQkJCNFtLTk5OTk5cFRoaGhoaGhVBNTVBQTU1QTpDRkZDQ0M6DhgbDhgYGA4vLy8vLy8vL09NT01WVk1PK1BTU1NTUCs7ND1COzA9O1tbW1tLTk5cBgsVBgMaFQY5QUdBQUFBOQ06RkhGQzoUGBgmGBsbGBgqLy8vLy8vKk9STU9NTU9SIitKUFBKKx43ND80OzsnO1taW1tbVFRbCwYLAxoaCwsPOUE5QTlBDwgTExcXExcTGBsmGyYYGxgBHyovLyofAU1ST1JNT1JNHi4rK0oiKyI3OztAOzswO1tbWltbW1tbBgMLCwQGCwYKDwodCg8KDxMTFxcXFxMNGBsYGyYYGxgBAQUHBwUBAQ==`);
      const getByOrdinal = (() => {
        const workspace = new SharedCanvas(8, 8);
        const cache = new Array(NAME_COUNT);
        cache.fill(null);
        return (async (ordinal) => {
          ordinal = Math.trunc(ordinal);
          if (ordinal < 0 || ordinal >= NAME_COUNT) throw new Error(`Illegal ordinal '${ordinal}'`);
          const existing = cache[ordinal];
          if (existing !== null) return existing;
          const promise = (async () => {
            const atlas = await getAtlas();
            const blob = await workspace.use((canvas, context) => {
              context.imageSmoothingEnabled = false;
              context.drawImage(
                atlas,
                ordinal * 8,
                0,
                8,
                8,
                0,
                0,
                8,
                8
              );
              return canvas.convertToBlob({ type: "image/bmp" });
            });
            return URL.createObjectURL(blob);
          })();
          cache[ordinal] = promise;
          promise.then((value) => {
            cache[ordinal] = value;
          });
          return promise;
        });
      })();
      function getByUUID(uuid) {
        const [i0, i1, i2, i3] = uuid.toArray();
        const hash = i0 ^ i1 ^ i2 ^ i3;
        const index = (hash % NAME_COUNT + NAME_COUNT) % NAME_COUNT;
        return getByOrdinal(index);
      }
      VanillaHeads2.getByUUID = getByUUID;
      function getByName(name) {
        return getByOrdinal(NAMES[name]);
      }
      VanillaHeads2.getByName = getByName;
      function checkName(name) {
        return name in NAMES;
      }
      VanillaHeads2.checkName = checkName;
      VanillaHeads2.MISSING = `data:image/gif;base64,R0lGODdhAQABAIABAPUA9VdXVywAAAAAAQABAAACAkQBADs=`;
    })(VanillaHeads || (VanillaHeads = {}));

    var OnlineHeads;
    ((OnlineHeads2) => {
      const workspace = new SharedCanvas(8, 8);
      function extractTextures(profile) {
        if (profile === null) return null;
        if (typeof profile !== "object") return null;
        if (!("properties" in profile)) return null;
        const properties = profile["properties"];
        if (!Array.isArray(properties)) return null;
        for (const property of properties) {
          if (property === null) continue;
          if (typeof property !== "object") continue;
          if (!("name" in property)) continue;
          if ("textures" !== property["name"]) continue;
          if (!("value" in property)) continue;
          return `${property["value"]}`;
        }
        return null;
      }
      function upgradeHTTP(url) {
        if (!url.startsWith("http:")) return url;
        return "https:" + url.substring(5);
      }
      async function get(id, hat) {
        const url = `https://corsjangsessionserver.b-cdn.net/session/minecraft/profile/${id.toString(true)}`;
        const response = await fetch(url, { cache: "force-cache" });
        if (response.status !== 200) return null;
        const json = await response.json();
        const texturesData = extractTextures(json);
        if (texturesData === null) return null;
        const texturesContainer = JSON.parse(atob(texturesData));
        const textures = texturesContainer["textures"];
        if (!textures) return null;
        const skin = textures["SKIN"];
        if (!skin) return null;
        let skinUrl = skin.url;
        skinUrl = upgradeHTTP(skinUrl);
        const bitmap = await fetch(skinUrl, { cache: "force-cache" }).then((r) => r.blob()).then((blob) => createImageBitmap(blob));
        const face = await workspace.use((canvas, context) => {
          context.imageSmoothingEnabled = false;
          context.globalCompositeOperation = "copy";
          context.drawImage(
            bitmap,
            8,
            8,
            8,
            8,
            0,
            0,
            8,
            8
          );
          if (hat) {
            context.globalCompositeOperation = "source-over";
            context.drawImage(
              bitmap,
              40,
              8,
              8,
              8,
              0,
              0,
              8,
              8
            );
          }
          return canvas.convertToBlob({ type: "image/bmp" });
        });
        return URL.createObjectURL(face);
      }
      OnlineHeads2.get = get;
      async function lookup(name) {
        const url = `https://corsjangservices.b-cdn.net/minecraft/profile/lookup/name/${name}`;
        const response = await fetch(url, { cache: "force-cache" });
        if (response.status !== 200) return null;
        const json = await response.json();
        if (typeof json === "object" && json !== null && "id" in json) return UUID.fromString(`${json["id"]}`);
        throw new Error(`Unexpected response payload (${json})`);
      }
      OnlineHeads2.lookup = lookup;
    })(OnlineHeads || (OnlineHeads = {}));

    var __defProp$o = Object.defineProperty;
    var __defNormalProp$o = (obj, key, value) => key in obj ? __defProp$o(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$o = (obj, key, value) => __defNormalProp$o(obj, typeof key !== "symbol" ? key + "" : key, value);
    class PlayerHeadDomEffectImpl {
      apply(element, data) {
        const tint = this._resolveColor(element);
        const image = this._createImage(data, tint);
        image.style.display = `inline-block`;
        image.style.width = `1em`;
        image.style.height = `1em`;
        image.style.verticalAlign = `-7%`;
        image.style.objectFit = `contain`;
        image.style.objectPosition = `center`;
        image.style.imageRendering = `pixelated`;
        element.appendChild(image);
      }
      serialize(data) {
        const take = ((key, consumer) => {
          const value = data[key]();
          if (null === value) return;
          consumer(value);
        });
        const form = {};
        if (!data.hat()) form.hat = false;
        take("id", (id) => form.id = id);
        take("name", (name) => form.name = name);
        take("texture", (texture) => form.texture = texture.asString());
        return JSON.stringify(form);
      }
      deserialize(value) {
        const parsed = JSON.parse(value);
        assertObject(parsed);
        const form = parsed;
        const builder = PlayerHeadObjectContents.builder();
        if ("hat" in form) builder.hat(form.hat);
        if ("id" in form) builder.id(form.id);
        if ("name" in form) builder.name(form.name);
        if ("texture" in form) builder.texture(form.texture);
        return builder.build();
      }
      _resolveColor(element) {
        let current = element;
        while (current !== null) {
          const color = current.style?.color;
          if (color) return color;
          current = current.parentElement;
        }
        return null;
      }
      _nameOfTexture(texture) {
        if (texture.namespace() !== exports.Key.MINECRAFT_NAMESPACE) return null;
        const value = texture.value();
        const match = /^entity\/player\/(?:slim|wide)\/(.*)$/.exec(value);
        if (!match || match.length < 2) return null;
        const name = match[1];
        if (!VanillaHeads.checkName(name)) return null;
        return name;
      }
      _createImage(data, tintColor) {
        const image = new PolyImage(tintColor);
        image.submit(VanillaHeads.getByName("alex"), ``, 0);
        const hat = data.hat();
        const id = data.id();
        const name = data.name();
        const texture = data.texture();
        const withUUID = ((uuid, alt) => {
          image.submit(VanillaHeads.getByUUID(uuid), alt, 1);
          OnlineHeads.get(uuid, hat).then((url) => {
            if (url !== null) image.submit(url, alt, 2, true);
          }).catch((e) => {
            const inf = ErrorInfo.of(e);
            console.warn(`Failed to check online head for UUID ${uuid} due to ${inf.name} (${inf.message})`);
          });
        });
        if (name !== null) {
          const fallback = (() => {
            const nameBytes = new TextEncoder().encode(name);
            const nameUUID = UUID.nameUUIDFromBytes(nameBytes);
            image.submit(VanillaHeads.getByUUID(nameUUID), `${nameUUID.toString()} (${name})`, 1);
          });
          OnlineHeads.lookup(name).then((id2) => {
            if (id2 !== null) {
              withUUID(id2, name);
            } else {
              fallback();
            }
          }).catch((e) => {
            const inf = ErrorInfo.of(e);
            console.warn(`Failed to lookup player name '${name}' due to ${inf.name} (${inf.message})`);
            fallback();
          });
        } else if (id !== null) {
          let uuid = null;
          try {
            uuid = UUID.fromString(id);
          } catch (e) {
          }
          if (uuid !== null) {
            withUUID(uuid, `${uuid.toString()}`);
          }
        } else if (texture !== null) {
          const name2 = this._nameOfTexture(texture);
          if (name2 !== null) {
            image.submit(VanillaHeads.getByName(name2), texture.asString(), 1);
          } else {
            image.submit(VanillaHeads.MISSING, texture.asString(), 1);
          }
        }
        return image.element;
      }
    }
    var PlayerHeadDomEffect;
    ((PlayerHeadDomEffect2) => {
      PlayerHeadDomEffect2.TOKEN = "player-head";
      PlayerHeadDomEffect2.INSTANCE = new PlayerHeadDomEffectImpl();
    })(PlayerHeadDomEffect || (PlayerHeadDomEffect = {}));
    class PolyImage {
      constructor(tintColor = null) {
        __publicField$o(this, "element");
        __publicField$o(this, "_activePriority");
        __publicField$o(this, "_lastController");
        __publicField$o(this, "_tintColor");
        __publicField$o(this, "_tintedUrl");
        this.element = document.createElement("img");
        this._activePriority = Number.MIN_VALUE;
        this._lastController = null;
        this._tintColor = tintColor;
        this._tintedUrl = null;
        if (tintColor !== null) {
          this.element.addEventListener("load", () => {
            if (this.element.src === this._tintedUrl) return;
            this._applyTint(this.element, tintColor);
          });
        }
      }
      submit(src, alt, priority, revoke = false) {
        (async () => src)().then((s) => {
          this._submitNow(s, alt, priority, revoke);
        });
      }
      _submitNow(src, alt, priority, revoke) {
        if (priority <= this._activePriority) {
          if (revoke) URL.revokeObjectURL(src);
          return;
        }
        this._activePriority = priority;
        this._resetController();
        const { element } = this;
        const abort = new AbortController();
        this._lastController = abort;
        const onSettled = (() => {
          this._resetController();
          if (revoke) URL.revokeObjectURL(src);
        });
        element.addEventListener("load", onSettled, { signal: abort.signal, once: true });
        element.addEventListener("error", onSettled, { signal: abort.signal, once: true });
        element.src = src;
        element.alt = alt;
        if (alt.length === 0) {
          element.removeAttribute("title");
        } else {
          element.title = alt;
        }
      }
      _applyTint(element, tintColor) {
        const canvas = document.createElement("canvas");
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(element, 0, 0);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = tintColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(element, 0, 0);
        canvas.toBlob((blob) => {
          if (blob === null) return;
          const oldTintedUrl = this._tintedUrl;
          const url = URL.createObjectURL(blob);
          this._tintedUrl = url;
          if (oldTintedUrl !== null) URL.revokeObjectURL(oldTintedUrl);
          element.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
          element.addEventListener("error", () => URL.revokeObjectURL(url), { once: true });
          element.src = url;
        });
      }
      _resetController() {
        const last = this._lastController;
        if (last !== null) last.abort();
        this._lastController = null;
      }
    }

    const DEFAULT_SHADOW_OFFSET = "0.10714286em";
    class ShadowDomEffectImpl {
      apply(element, color) {
        const images = element.querySelectorAll("img");
        const filter = `drop-shadow(${DEFAULT_SHADOW_OFFSET} ${DEFAULT_SHADOW_OFFSET} ${color})`;
        for (const image of images) {
          if (this._hasNestedShadowAncestor(image, element)) continue;
          const existing = image.style.filter;
          if (existing) {
            if (!existing.includes("drop-shadow")) {
              image.style.filter = `${existing} ${filter}`;
            }
          } else {
            image.style.filter = filter;
          }
        }
      }
      /**
       * Returns true if any ancestor of `element`, up to but not including
       * `boundary`, carries a `data-mm-shadow` attribute of its own
       * Meaning that ancestor is a more specific shadow scope that owns this image
       */
      _hasNestedShadowAncestor(element, boundary) {
        let current = element.parentElement;
        while (current !== null && current !== boundary) {
          if (current.hasAttribute("data-mm-shadow")) return true;
          current = current.parentElement;
        }
        return false;
      }
      serialize(color) {
        return color;
      }
      deserialize(value) {
        return value;
      }
    }
    var ShadowDomEffect;
    ((ShadowDomEffect2) => {
      ShadowDomEffect2.TOKEN = "shadow";
      ShadowDomEffect2.INSTANCE = new ShadowDomEffectImpl();
    })(ShadowDomEffect || (ShadowDomEffect = {}));

    class MiscDomEffectImpl {
      apply(element, data) {
      }
      serialize(data) {
        return JSON.stringify(exports.JsonComponentSerializer.json().serialize(data));
      }
      deserialize(value) {
        const parsed = JSON.parse(value);
        return exports.JsonComponentSerializer.json().deserialize(parsed);
      }
    }
    var MiscDomEffect;
    ((MiscDomEffect2) => {
      MiscDomEffect2.TOKEN = "misc";
      MiscDomEffect2.INSTANCE = new MiscDomEffectImpl();
    })(MiscDomEffect || (MiscDomEffect = {}));

    exports.DomEffects = void 0;
    ((DomEffects2) => {
      const PROPERTY_PREFIX = "data-mm-";
      const APPLIED = `${PROPERTY_PREFIX}applied`;
      const MAP = {
        [ObfuscatedDomEffect.TOKEN]: ObfuscatedDomEffect.INSTANCE,
        [PlayerHeadDomEffect.TOKEN]: PlayerHeadDomEffect.INSTANCE,
        [ShadowDomEffect.TOKEN]: ShadowDomEffect.INSTANCE,
        [MiscDomEffect.TOKEN]: MiscDomEffect.INSTANCE
      };
      function writeProperty(writer, token, value) {
        const effect = MAP[token];
        if (!effect) throw new Error(`Invalid effect '${token}'`);
        const serialized = effect.serialize(value);
        writer.property(`${PROPERTY_PREFIX}${token}`, serialized);
      }
      DomEffects2.writeProperty = writeProperty;
      function markApplied(key, element) {
        let applied = element.getAttribute(APPLIED);
        if (!applied) {
          element.setAttribute(APPLIED, key);
          return true;
        }
        let head = 0;
        let char;
        for (let i = 0; i < applied.length; i++) {
          char = applied.charCodeAt(i);
          if (Character.COMMA.is(char)) {
            head = 0;
          } else if (head !== -1 && head < key.length) {
            if (char === key.charCodeAt(head++)) {
              if (head === key.length) return false;
            } else {
              head = -1;
            }
          }
        }
        element.setAttribute(APPLIED, `${applied},${key}`);
        return true;
      }
      function applySingle0(key, effect, element, propertyValue) {
        try {
          const value = effect.deserialize(propertyValue);
          effect.apply(element, value);
        } catch (e) {
          const inf = ErrorInfo.of(e);
          console.warn(`Failed to apply DOM effect '${key}' to element due to ${inf.name} (${inf.message})`, element);
          return;
        }
      }
      function applySingle(key, effect, node, propertyValue) {
        const children = [...node.children];
        let effectivePropertyValue = propertyValue;
        if (node instanceof Element) {
          const ownPropertyValue = node.getAttribute(`${PROPERTY_PREFIX}${key}`);
          if (ownPropertyValue !== null) effectivePropertyValue = ownPropertyValue;
          if (effectivePropertyValue !== null && markApplied(key, node)) applySingle0(key, effect, node, effectivePropertyValue);
        }
        for (const child of children)
          applySingle(key, effect, child, effectivePropertyValue);
      }
      function apply(node) {
        for (const rawKey of Object.keys(MAP)) {
          const key = rawKey;
          applySingle(key, MAP[key], node, null);
        }
      }
      DomEffects2.apply = apply;
    })(exports.DomEffects || (exports.DomEffects = {}));

    var __defProp$n = Object.defineProperty;
    var __defNormalProp$n = (obj, key, value) => key in obj ? __defProp$n(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$n = (obj, key, value) => __defNormalProp$n(obj, typeof key !== "symbol" ? key + "" : key, value);
    function applyDomEffects(element) {
      if (typeof window === "undefined") return;
      const proceed = (() => {
        const { ownerDocument } = element;
        if (!ownerDocument) return;
        if (window !== ownerDocument.defaultView) return;
        exports.DomEffects.apply(element);
      });
      if ("isConnected" in element && element.isConnected) {
        proceed();
      } else {
        if ("requestAnimationFrame" in window) {
          window.requestAnimationFrame(proceed);
        } else {
          setTimeout(proceed, 10);
        }
      }
    }
    class DomHTMLWriter {
      constructor(parent, elementFactory) {
        __publicField$n(this, "_parent");
        __publicField$n(this, "_stack");
        __publicField$n(this, "_elementFactory");
        __publicField$n(this, "_styles");
        this._parent = parent;
        this._stack = new Stack();
        this._elementFactory = elementFactory;
        this._styles = HtmlStyleStore.EMPTY;
      }
      //
      openTag(tagName) {
        const element = this._elementFactory(tagName);
        this._stack.push([element, { ...this._styles }]);
        return this;
      }
      closeTag() {
        const data = this._stack.pop();
        if (data === null) throw new Error(`No tag to close`);
        let parentData = this._stack.peek();
        let parent;
        let domEffects;
        if (parentData === null) {
          parent = this._parent;
          domEffects = true;
        } else {
          parent = parentData[0];
          domEffects = false;
        }
        parent.appendChild(data[0]);
        this._styles = { ...data[1] };
        if (domEffects) applyDomEffects(parent);
        return this;
      }
      style(style) {
        const tail = this._tail();
        style.applyToDocument(tail.style, this._styles);
        style.applyToStore(this._styles);
        return this;
      }
      property(name, value) {
        const tail = this._tail();
        tail.setAttribute(name, value || "");
        return this;
      }
      content(text) {
        const tail = this._tail();
        const lines = text.split(`
`);
        for (let i = 0; i < lines.length; i++) {
          if (i !== 0) tail.append(this._elementFactory("br"));
          tail.append(lines[i]);
        }
        return this;
      }
      _tail() {
        const ret = this._stack.peek();
        if (ret === null) throw new Error(`No open tag`);
        return ret[0];
      }
    }

    exports.HtmlWriter = void 0;
    ((HtmlWriter2) => {
      function string() {
        return new StringHtmlWriter();
      }
      HtmlWriter2.string = string;
      function dom(parent, elementFactory) {
        if (typeof elementFactory === "undefined") {
          const { ownerDocument } = parent;
          elementFactory = ownerDocument ? ((tagName) => ownerDocument.createElement(tagName)) : ((tagName) => document.createElement(tagName));
        }
        return new DomHTMLWriter(parent, elementFactory);
      }
      HtmlWriter2.dom = dom;
    })(exports.HtmlWriter || (exports.HtmlWriter = {}));

    var ChunkType;
    ((ChunkType2) => {
      ChunkType2.LITERAL = /* @__PURE__ */ Symbol("literal");
      ChunkType2.ARGUMENT = /* @__PURE__ */ Symbol("argument");
    })(ChunkType || (ChunkType = {}));
    var Chunks;
    ((Chunks2) => {
      function stringify(chunks) {
        const sb = new StringBuilder();
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const { type } = chunk;
          switch (type) {
            case ChunkType.LITERAL:
              if (chunk.value === `%`) sb.appendChar(Character.PERCENT);
              sb.appendString(chunk.value);
              break;
            case ChunkType.ARGUMENT:
              sb.append(chunk.fallback);
              break;
            default:
              assertNever(type);
          }
        }
        return sb.toString();
      }
      Chunks2.stringify = stringify;
      function parse(text) {
        const ret = [];
        let start = 0;
        let head = 0;
        let autoIndex = 0;
        let c;
        function hasNext() {
          return head < text.length;
        }
        function next() {
          return text.charCodeAt(head++);
        }
        function literal(exclusive) {
          const end = exclusive ? head - 1 : head;
          if (start >= end) return;
          ret.push({
            type: ChunkType.LITERAL,
            value: text.substring(start, end)
          });
          start = end;
        }
        function argument(index) {
          ret.push({
            type: ChunkType.ARGUMENT,
            index,
            fallback: text.substring(start, head)
          });
          start = head;
        }
        while (hasNext()) {
          c = next();
          if (!Character.PERCENT.is(c)) {
            continue;
          }
          literal(true);
          if (!hasNext()) {
            ret.push({ type: ChunkType.LITERAL, value: "%" });
            start = head;
            continue;
          }
          c = next();
          if (Character.LOWERCASE_S.is(c)) {
            argument(autoIndex++);
            continue;
          }
          if (Character.PERCENT.is(c)) {
            literal(true);
            continue;
          }
          if (Character.ONE.value <= c && c <= Character.NINE.value) {
            let index = c - Character.ZERO.value;
            let termination = 0;
            while (hasNext()) {
              c = next();
              if (Character.LOWERCASE_S.is(c)) {
                if (termination & 1) termination |= 2;
                break;
              }
              if (termination) break;
              if (Character.DOLLAR_SIGN.is(c)) {
                termination |= 1;
              } else if (Character.ZERO.value <= c && c <= Character.NINE.value) {
                const newIndex = index * 10 + (c - Character.ZERO.value);
                if (newIndex > Number.MAX_SAFE_INTEGER) {
                  throw new Error(`Escape sequence at index ${head} of lang string "${text}" is too large`);
                }
                index = newIndex;
              } else {
                break;
              }
            }
            if (termination === 3) {
              argument(index - 1);
              continue;
            }
          }
          ret.push({ type: ChunkType.LITERAL, value: "%" });
          start = head - 1;
          head--;
        }
        literal(false);
        return ret;
      }
      Chunks2.parse = parse;
    })(Chunks || (Chunks = {}));

    var __defProp$m = Object.defineProperty;
    var __defNormalProp$m = (obj, key, value) => key in obj ? __defProp$m(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$m = (obj, key, value) => __defNormalProp$m(obj, typeof key !== "symbol" ? key + "" : key, value);
    class TranslationsImpl {
      constructor(_data, _fallback) {
        this._data = _data;
        this._fallback = _fallback;
      }
      //
      get data() {
        const ret = {};
        this._data.forEach((v, k) => {
          ret[k] = Chunks.stringify(v);
        });
        return Object.freeze(ret);
      }
      translate(key, args) {
        args = args || [];
        const chunks = this._data.get(key);
        if (!chunks) return this._normalize(this._fallback(key, args));
        let ret = exports.Component.empty();
        for (const chunk of chunks) {
          const { type } = chunk;
          switch (type) {
            case ChunkType.LITERAL:
              ret = ret.append(exports.Component.text(chunk.value));
              break;
            case ChunkType.ARGUMENT:
              ret = ret.append(this._resolve(chunk, args));
              break;
            default:
              assertNever(type);
          }
        }
        return ret;
      }
      _resolve(chunk, args) {
        const { index, fallback } = chunk;
        if (index < 0 || index >= args.length) return exports.Component.text(fallback);
        return this._normalize(args[index]);
      }
      _normalize(arg) {
        if (typeof arg === "object" && arg !== null) return arg;
        return exports.Component.text(`${arg}`);
      }
    }
    exports.Translations = void 0;
    ((Translations2) => {
      const _BuilderImpl = class _BuilderImpl {
        constructor() {
          //
          __publicField$m(this, "_data", /* @__PURE__ */ new Map());
          __publicField$m(this, "_fallback", _BuilderImpl.DEFAULT_FALLBACK);
          __publicField$m(this, "_open", true);
        }
        //
        with(data) {
          this._checkOpen();
          if (data instanceof TranslationsImpl) {
            const parsed = data["_data"];
            parsed.forEach((v, k) => this._data.set(k, v));
            this._fallback = data["_fallback"];
          } else {
            for (const key of Object.keys(data)) {
              const value = data[key];
              const parsedValue = Chunks.parse(`${value}`);
              this._data.set(key, parsedValue);
            }
          }
          return this;
        }
        fallback(fallback) {
          this._checkOpen();
          this._fallback = fallback;
          return this;
        }
        build() {
          this._open = false;
          return new TranslationsImpl(this._data, this._fallback);
        }
        _checkOpen() {
          if (this._open) return;
          throw new Error("Cannot use builder after #build");
        }
      };
      __publicField$m(_BuilderImpl, "DEFAULT_FALLBACK", (s) => s);
      let BuilderImpl = _BuilderImpl;
      const EMPTY = new BuilderImpl().build();
      function builder() {
        return new BuilderImpl();
      }
      Translations2.builder = builder;
      function empty() {
        return EMPTY;
      }
      Translations2.empty = empty;
      function of(data) {
        return builder().with(data).build();
      }
      Translations2.of = of;
    })(exports.Translations || (exports.Translations = {}));

    const KEYBIND_TO_TRANSLATABLE = {
      "key.jump": "key.keyboard.space",
      "key.sneak": "key.keyboard.left.shift",
      "key.sprint": "key.keyboard.left.control",
      "key.attack": "key.mouse.left",
      "key.use": "key.mouse.right",
      "key.pickItem": "key.mouse.middle",
      "key.playerlist": "key.keyboard.tab",
      "key.fullscreen": "key.keyboard.f11",
      "key.togglePerspective": "key.keyboard.f5",
      "key.spectatorHotbar": "key.mouse.middle",
      "key.screenshot": "key.keyboard.f2"
    };
    const KEYBIND_TO_LITERAL = {
      // movement
      "key.jump": "Space",
      "key.sneak": "Left Shift",
      "key.sprint": "Left Control",
      "key.left": "A",
      "key.right": "D",
      "key.back": "S",
      "key.forward": "W",
      // miscellaneous
      "key.advancements": "L",
      "key.quickActions": "G",
      "key.screenshot": "F2",
      "key.smoothCamera": "Not Bound",
      "key.fullscreen": "F11",
      "key.toggleGui": "F1",
      "key.togglePerspective": "F5",
      "key.toggleSpectatorShaderEffects": "F4",
      // multiplayer
      "key.friends": "O",
      "key.playerlist": "Tab",
      "key.chat": "T",
      "key.command": "/",
      "key.socialInteractions": "P",
      // gameplay
      "key.attack": "Left Button",
      "key.pickItem": "Middle Button",
      "key.use": "Right Button",
      // inventory
      "key.drop": "Q",
      "key.hotbar.1": "1",
      "key.hotbar.2": "2",
      "key.hotbar.3": "3",
      "key.hotbar.4": "4",
      "key.hotbar.5": "5",
      "key.hotbar.6": "6",
      "key.hotbar.7": "7",
      "key.hotbar.8": "8",
      "key.hotbar.9": "9",
      "key.inventory": "E",
      "key.swapOffhand": "F",
      // creative mode
      "key.loadToolbarActivator": "X",
      "key.saveToolbarActivator": "C",
      // spectator
      "key.spectatorOutlines": "Not Bound",
      "key.spectatorHotbar": "Middle Button",
      // debug
      "key.debug.overlay": "F3",
      "key.debug.modifier": "F3",
      "key.debug.clearChat": "D",
      "key.debug.copyRecreateCommand": "I",
      "key.debug.copyLocation": "C",
      "key.debug.spectate": "N",
      "key.debug.crash": "C",
      "key.debug.debugOptions": "F6",
      "key.debug.dumpDynamicTextures": "S",
      "key.debug.dumpVersion": "V",
      "key.debug.switchGameMode": "F4",
      "key.debug.reloadChunk": "A",
      "key.debug.reloadResourcePacks": "T",
      "key.debug.showAdvancedTooltips": "H",
      "key.debug.showHitboxes": "B",
      "key.debug.profiling": "L",
      "key.debug.focusPause": "P",
      "key.debug.profilingChart": "1",
      "key.debug.fpsCharts": "2",
      "key.debug.networkCharts": "3"
    };

    var __defProp$l = Object.defineProperty;
    var __defNormalProp$l = (obj, key, value) => key in obj ? __defProp$l(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$l = (obj, key, value) => __defNormalProp$l(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _HtmlComponentRenderer = class _HtmlComponentRenderer extends AbstractComponentRenderer {
      constructor(translations) {
        super();
        //
        __publicField$l(this, "_translations");
        __publicField$l(this, "renderBlock", this._renderMisc);
        __publicField$l(this, "renderEntity", this._renderMisc);
        __publicField$l(this, "renderStorage", this._renderMisc);
        __publicField$l(this, "renderScore", this._renderMisc);
        this._translations = translations;
      }
      //
      renderText(component, writer) {
        this._open(component, writer);
        writer.content(component.content());
        this._close(component, writer);
        return component;
      }
      renderTranslatable(component, writer) {
        const translated = this._translations.translate(component.key(), component.arguments());
        this.render(translated, writer);
        return translated;
      }
      renderSelector(component, writer) {
        this._open(component, writer);
        exports.DomEffects.writeProperty(writer, "misc", component);
        writer.content(component.pattern());
        this._close(component, writer);
        return component;
      }
      renderKeybind(component, writer) {
        this._open(component, writer);
        exports.DomEffects.writeProperty(writer, "misc", component);
        const key = component.keybind();
        writer.content(KEYBIND_TO_LITERAL[key] ?? KEYBIND_TO_TRANSLATABLE[key] ?? key);
        this._close(component, writer);
        return component;
      }
      renderObject(component, writer) {
        this._open(component, writer);
        const contents = component.contents();
        const contentsType = contents.type;
        switch (contentsType) {
          case "playerHead":
            exports.DomEffects.writeProperty(writer, "player-head", contents);
            break;
          case "sprite":
            exports.DomEffects.writeProperty(writer, "misc", component);
            break;
          default:
            assertNever(contentsType);
        }
        this._close(component, writer);
        return component;
      }
      //
      _renderMisc(component, writer) {
        this._open(component, writer);
        exports.DomEffects.writeProperty(writer, "misc", component);
        this._close(component, writer);
        return component;
      }
      _open(component, writer) {
        writer.openTag("span");
        let s;
        s = component.decoration(exports.TextDecoration.BOLD);
        if (s !== exports.TextDecoration.State.NOT_SET) {
          writer.style(HtmlStyle.fontWeight(s === exports.TextDecoration.State.TRUE ? "bold" : "normal"));
        }
        s = component.decoration(exports.TextDecoration.ITALIC);
        if (s !== exports.TextDecoration.State.NOT_SET) {
          writer.style(HtmlStyle.fontStyle(s === exports.TextDecoration.State.TRUE ? "italic" : "normal"));
        }
        s = component.decoration(exports.TextDecoration.OBFUSCATED);
        if (s !== exports.TextDecoration.State.NOT_SET) {
          exports.DomEffects.writeProperty(writer, "obfuscated", s === exports.TextDecoration.State.TRUE);
        }
        const underlined = component.decoration(exports.TextDecoration.UNDERLINED);
        const strikethrough = component.decoration(exports.TextDecoration.STRIKETHROUGH);
        if (underlined !== exports.TextDecoration.State.NOT_SET || strikethrough !== exports.TextDecoration.State.NOT_SET) {
          writer.style(HtmlStyle.textDecoration(underlined, strikethrough));
        }
        const color = component.color();
        if (color) writer.style(HtmlStyle.color(color.asHexString()));
        const shadowColor = component.shadowColor();
        if (shadowColor) {
          writer.style(HtmlStyle.textShadow(shadowColor.asHexString()));
          exports.DomEffects.writeProperty(writer, "shadow", shadowColor.asHexString());
        }
        const hover = component.hoverEvent();
        if (hover) _HtmlComponentRenderer.HOVER_EVENT_RENDERER.invoke(hover, { writer, renderer: this });
        const click = component.clickEvent();
        if (click) _HtmlComponentRenderer.CLICK_EVENT_RENDERER.invoke(click, { writer });
        const insertion = component.insertion();
        if (insertion) writer.property("data-mc-insertion", insertion);
      }
      _close(component, writer) {
        for (const child of component.children()) {
          this.render(child, writer);
        }
        writer.closeTag();
      }
    };
    __publicField$l(_HtmlComponentRenderer, "HOVER_EVENT_RENDERER", (() => {
      const handlers = new exports.HoverEvent.Handlers();
      handlers.register(exports.HoverEvent.Action.SHOW_TEXT, (event, { writer, renderer }) => {
        const inner = exports.HtmlWriter.string();
        renderer.render(event.value(), inner);
        writer.property("data-mc-tooltip", inner.toString());
      });
      handlers.register(exports.HoverEvent.Action.SHOW_ENTITY, (event, { writer, renderer }) => {
        const name = event.value().name();
        const inner = exports.HtmlWriter.string();
        if (name !== null) {
          renderer.render(name, inner);
        } else {
          inner.openTag("span").content(event.value().type()).closeTag();
        }
        writer.property("data-mc-tooltip", inner.toString());
      });
      handlers.register(exports.HoverEvent.Action.SHOW_ITEM, (event, { writer }) => {
        let text = event.value().item().asString();
        const count = event.value().count();
        if (count !== 1) text += ` x${count}`;
        writer.property("data-mc-tooltip", `<span>${text}</span>`);
      });
      return handlers;
    })());
    __publicField$l(_HtmlComponentRenderer, "CLICK_EVENT_RENDERER", (() => {
      const handlers = new exports.ClickEvent.Handlers();
      handlers.register(exports.ClickEvent.Action.OPEN_URL, (event, { writer }) => {
        writer.property("data-mc-click-action", "open_url");
        writer.property("data-mc-click-value", event.payload().value());
      });
      handlers.register(exports.ClickEvent.Action.OPEN_FILE, (event, { writer }) => {
        writer.property("data-mc-click-action", "open_file");
        writer.property("data-mc-click-value", event.payload().value());
      });
      handlers.register(exports.ClickEvent.Action.RUN_COMMAND, (event, { writer }) => {
        writer.property("data-mc-click-action", "run_command");
        writer.property("data-mc-click-value", event.payload().value());
      });
      handlers.register(exports.ClickEvent.Action.SUGGEST_COMMAND, (event, { writer }) => {
        writer.property("data-mc-click-action", "suggest_command");
        writer.property("data-mc-click-value", event.payload().value());
      });
      handlers.register(exports.ClickEvent.Action.CHANGE_PAGE, (event, { writer }) => {
        writer.property("data-mc-click-action", "change_page");
        writer.property("data-mc-click-value", event.payload().integer().toString());
      });
      handlers.register(exports.ClickEvent.Action.COPY_TO_CLIPBOARD, (event, { writer }) => {
        writer.property("data-mc-click-action", "copy_to_clipboard");
        writer.property("data-mc-click-value", event.payload().value());
      });
      handlers.register(exports.ClickEvent.Action.CUSTOM, (event, { writer }) => {
        writer.property("data-mc-click-action", "custom");
        writer.property("data-mc-click-value", event.payload().key().toString());
        const nbt = event.payload().nbt();
        if (nbt !== null) writer.property("data-mc-click-nbt", nbt);
      });
      return handlers;
    })());
    exports.HtmlComponentRenderer = _HtmlComponentRenderer;
    ((HtmlComponentRenderer2) => {
      const INSTANCE = new HtmlComponentRenderer2(exports.Translations.empty());
      function renderer(translations = exports.Translations.empty()) {
        if (arguments.length === 0) return INSTANCE;
        return new HtmlComponentRenderer2(translations);
      }
      HtmlComponentRenderer2.renderer = renderer;
    })(exports.HtmlComponentRenderer || (exports.HtmlComponentRenderer = {}));

    var __defProp$k = Object.defineProperty;
    var __defNormalProp$k = (obj, key, value) => key in obj ? __defProp$k(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$k = (obj, key, value) => __defNormalProp$k(obj, typeof key !== "symbol" ? key + "" : key, value);
    exports.TagResolver = void 0;
    ((TagResolver2) => {
      class SingleImpl {
        constructor(key, tag) {
          __publicField$k(this, "_key");
          __publicField$k(this, "_tag");
          this._key = key;
          this._tag = tag;
        }
        //
        key() {
          return this._key;
        }
        tag() {
          return this._tag;
        }
        has(name) {
          return this._key === name;
        }
        resolve(name, args, ctx) {
          if (!this.has(name)) return null;
          if (args.hasNext()) throw ctx.newException(`Tag <${name}> does not accept any arguments`, args);
          return this._tag;
        }
        contributeToMap(map) {
          map.set(this._key, this._tag);
          return true;
        }
      }
      class Sequential {
        constructor(resolvers) {
          this.resolvers = resolvers;
        }
        //
        resolve(name, args, ctx) {
          let thrown = null;
          for (const resolver2 of this.resolvers) {
            try {
              if (!resolver2.has(name)) continue;
              const placeholder = resolver2.resolve(name, args, ctx);
              if (placeholder !== null) return placeholder;
            } catch (e) {
              args.reset();
              const error = typeof e === "object" && e instanceof Error ? e : ctx.newException(`${e}`, args);
              if (thrown) error.cause = thrown;
              thrown = error;
            }
          }
          if (thrown) throw thrown;
          return null;
        }
        has(name) {
          for (const resolver2 of this.resolvers) {
            if (resolver2.has(name)) return true;
          }
          return false;
        }
      }
      class OfMap {
        constructor(tagMap) {
          this.tagMap = tagMap;
        }
        //
        has(name) {
          return this.tagMap.has(name);
        }
        resolve(name, args, ctx) {
          const tag = this.tagMap.get(name);
          if (!tag) return null;
          if (args.hasNext()) {
            throw ctx.newException(`Tag <${name}> does not accept any arguments`, args);
          }
          return tag;
        }
        contributeToMap(map) {
          this.tagMap.forEach((v, k) => map.set(k, v));
          return true;
        }
      }
      const EMPTY = new class {
        has(name) {
          return false;
        }
        resolve(name, args, ctx) {
          return null;
        }
        contributeToMap(map) {
          return true;
        }
      }();
      class BuilderImpl {
        constructor() {
          __publicField$k(this, "_replacements");
          __publicField$k(this, "_resolvers");
          this._replacements = /* @__PURE__ */ new Map();
          this._resolvers = [];
        }
        //
        tag(name, tag) {
          this._replacements.set(name, tag);
          return this;
        }
        resolver(resolver2) {
          if (resolver2 instanceof Sequential) {
            this.resolvers(...resolver2.resolvers);
          } else if (!this.consumePotentialMappable(resolver2)) {
            this.popMap();
            this._resolvers.push(resolver2);
          }
          return this;
        }
        resolvers(...resolvers) {
          this.resolvers0(resolvers, true);
          return this;
        }
        build() {
          this.popMap();
          const length = this._resolvers.length;
          if (length === 0) return EMPTY;
          if (length === 1) return this._resolvers[0];
          const resolvers = new Array(length);
          for (let i = 0; i < length; i++) resolvers[i] = this._resolvers[length - 1 - i];
          return new Sequential(resolvers);
        }
        resolvers0(resolvers, forwards) {
          let popped = false;
          if (forwards) {
            for (const resolver2 of resolvers) {
              popped = this.single(resolver2, popped);
            }
          } else {
            for (let i = resolvers.length - 1; i >= 0; i--) {
              popped = this.single(resolvers[i], popped);
            }
          }
        }
        single(resolver2, popped) {
          if (resolver2 instanceof Sequential) {
            this.resolvers0(resolver2.resolvers, false);
          } else if (!this.consumePotentialMappable(resolver2)) {
            if (!popped) this.popMap();
            this._resolvers.push(resolver2);
            return true;
          }
          return false;
        }
        consumePotentialMappable(resolver2) {
          if ("contributeToMap" in resolver2 && typeof resolver2["contributeToMap"] === "function") {
            return resolver2.contributeToMap(this._replacements);
          } else {
            return false;
          }
        }
        popMap() {
          if (this._replacements.size === 0) return;
          this._resolvers.push(new OfMap(new Map(this._replacements)));
          this._replacements.clear();
        }
      }
      function builder() {
        return new BuilderImpl();
      }
      TagResolver2.builder = builder;
      function empty() {
        return EMPTY;
      }
      TagResolver2.empty = empty;
      function resolver(name, tag) {
        return new SingleImpl(name, tag);
      }
      TagResolver2.resolver = resolver;
      function dynamic(name, handler, ...aliases) {
        let has;
        if (aliases.length === 0) {
          has = (n) => name === n;
        } else {
          const set = /* @__PURE__ */ new Set();
          set.add(name);
          for (const alias of aliases) set.add(alias);
          has = (n) => set.has(n);
        }
        return Object.freeze({
          has,
          resolve(n, args, ctx) {
            if (!has(n)) return null;
            return handler(args, ctx);
          }
        });
      }
      TagResolver2.dynamic = dynamic;
    })(exports.TagResolver || (exports.TagResolver = {}));

    var __defProp$j = Object.defineProperty;
    var __defNormalProp$j = (obj, key, value) => key in obj ? __defProp$j(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$j = (obj, key, value) => __defNormalProp$j(obj, typeof key !== "symbol" ? key + "" : key, value);
    var TokenType;
    ((TokenType2) => {
      TokenType2.TEXT = /* @__PURE__ */ Symbol("TEXT");
      TokenType2.OPEN_TAG = /* @__PURE__ */ Symbol("OPEN_TAG");
      TokenType2.OPEN_CLOSE_TAG = /* @__PURE__ */ Symbol("OPEN_CLOSE_TAG");
      TokenType2.CLOSE_TAG = /* @__PURE__ */ Symbol("CLOSE_TAG");
      TokenType2.TAG_VALUE = /* @__PURE__ */ Symbol("TAG_VALUE");
    })(TokenType || (TokenType = {}));
    class Token {
      constructor(startIndex, endIndex, type) {
        //
        __publicField$j(this, "_indices");
        __publicField$j(this, "_type");
        __publicField$j(this, "_childTokens");
        this._indices = new Uint32Array([startIndex, endIndex]);
        this._type = type;
        this._childTokens = null;
      }
      static match(token, handlers) {
        const type = token.type();
        switch (type) {
          case TokenType.TEXT:
            return handlers.text(token);
          case TokenType.OPEN_TAG:
            return handlers.openTag(token);
          case TokenType.OPEN_CLOSE_TAG:
            return handlers.openCloseTag(token);
          case TokenType.CLOSE_TAG:
            return handlers.closeTag(token);
          case TokenType.TAG_VALUE:
            return handlers.tagValue(token);
          default:
            assertNever(type);
        }
      }
      //
      startIndex() {
        return this._indices[0];
      }
      endIndex() {
        return this._indices[1];
      }
      type() {
        return this._type;
      }
      childTokens(childTokens) {
        if (childTokens) this._childTokens = ArrayUtil.immutableView(childTokens);
        return this._childTokens;
      }
      get(message) {
        return message.substring(this._indices[0], this._indices[1]);
      }
    }

    var __defProp$i = Object.defineProperty;
    var __defNormalProp$i = (obj, key, value) => key in obj ? __defProp$i(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$i = (obj, key, value) => __defNormalProp$i(obj, typeof key !== "symbol" ? key + "" : key, value);
    const TextNodeFactory = new class {
      constructor() {
        __publicField$i(this, "_bound", false);
        __publicField$i(this, "_identity", null);
        __publicField$i(this, "_generator", null);
      }
      //
      bind(identity, generator) {
        assertReal(identity, "identity");
        assertReal(generator, "generator");
        this._identity = identity;
        this._generator = generator;
        this._bound = true;
      }
      isTextNode(node) {
        this._checkBound();
        return this._identity(node);
      }
      create(parent, token, sourceMessage) {
        this._checkBound();
        return this._generator(parent, token, sourceMessage);
      }
      _checkBound() {
        if (!this._bound) throw new Error("Not bound");
      }
    }();

    var __defProp$h = Object.defineProperty;
    var __defNormalProp$h = (obj, key, value) => key in obj ? __defProp$h(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$h = (obj, key, value) => __defNormalProp$h(obj, typeof key !== "symbol" ? key + "" : key, value);
    class ElementNode {
      constructor(parent, token, sourceMessage) {
        __publicField$h(this, "_parent");
        __publicField$h(this, "_token");
        __publicField$h(this, "_sourceMessage");
        __publicField$h(this, "_children");
        this._parent = parent;
        this._token = token;
        this._sourceMessage = sourceMessage;
        this._children = [];
      }
      //
      parent() {
        return this._parent;
      }
      children() {
        return ArrayUtil.immutableView(this._children);
      }
      token() {
        return this._token;
      }
      sourceMessage() {
        return this._sourceMessage;
      }
      unsafeChildren() {
        return this._children;
      }
      addChild(childNode) {
        const last = this._children.length - 1;
        if (!TextNodeFactory.isTextNode(childNode) || this._children.length === 0 || !TextNodeFactory.isTextNode(this._children[last])) {
          this._children.push(childNode);
        } else {
          const lastNode = this._children.splice(last, 1)[0];
          if (lastNode.token().endIndex() === childNode.token().startIndex()) {
            const replace = new Token(
              lastNode.token().startIndex(),
              childNode.token().endIndex(),
              TokenType.TEXT
            );
            this._children.push(TextNodeFactory.create(this, replace, lastNode.sourceMessage()));
          } else {
            this._children.push(lastNode, childNode);
          }
        }
      }
    }

    var __defProp$g = Object.defineProperty;
    var __defNormalProp$g = (obj, key, value) => key in obj ? __defProp$g(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$g = (obj, key, value) => __defNormalProp$g(obj, key + "" , value);
    class RootNode extends ElementNode {
      constructor(sourceMessage, beforePreprocessing) {
        super(null, null, sourceMessage);
        __publicField$g(this, "_beforePreprocessing");
        this._beforePreprocessing = beforePreprocessing;
      }
      //
      input() {
        return this._beforePreprocessing;
      }
    }

    var __defProp$f = Object.defineProperty;
    var __defNormalProp$f = (obj, key, value) => key in obj ? __defProp$f(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$f = (obj, key, value) => __defNormalProp$f(obj, typeof key !== "symbol" ? key + "" : key, value);
    var TagInternals;
    ((TagInternals2) => {
      TagInternals2.TAG_NAME_REGEX = "[!?#]?[a-z0-9_-]*";
      const TAG_NAME_PATTERN = RegExp(TagInternals2.TAG_NAME_REGEX);
      function assertValidTagName(tagName) {
        if (TAG_NAME_PATTERN.test(tagName)) return;
        throw new Error(`Tag name must match pattern ${TagInternals2.TAG_NAME_REGEX}, was ${tagName}`);
      }
      TagInternals2.assertValidTagName = assertValidTagName;
      function sanitizeAndCheckValidTagName(tagName) {
        return TAG_NAME_PATTERN.test(tagName.toLowerCase());
      }
      TagInternals2.sanitizeAndCheckValidTagName = sanitizeAndCheckValidTagName;
      function sanitizeAndAssertValidTagName(tagName) {
        assertValidTagName(tagName.toLowerCase());
      }
      TagInternals2.sanitizeAndAssertValidTagName = sanitizeAndAssertValidTagName;
    })(TagInternals || (TagInternals = {}));
    class TagPart {
      constructor(sourceMessage, token, tagResolver) {
        //
        __publicField$f(this, "_value");
        __publicField$f(this, "_token");
        let v = TagPart.unquoteAndEscape(sourceMessage, token.startIndex(), token.endIndex());
        v = TokenParser.resolvePreProcessTags(v, tagResolver);
        this._value = v;
        this._token = token;
      }
      static unquoteAndEscape(text, start, end) {
        if (start === end)
          return "";
        let startIndex = start;
        let endIndex = end;
        const firstChar = text.charCodeAt(startIndex);
        const lastChar = text.charCodeAt(endIndex - 1);
        if (Character.APOSTROPHE.is(firstChar) || Character.QUOTATION.is(firstChar)) {
          startIndex++;
        } else {
          return text.substring(startIndex, endIndex);
        }
        if (Character.APOSTROPHE.is(lastChar) || Character.QUOTATION.is(lastChar)) {
          endIndex--;
        }
        if (startIndex > endIndex) {
          return text.substring(start, end);
        }
        return TokenParser.unescape(
          text,
          startIndex,
          endIndex,
          (i) => firstChar === i || TokenParser.ESCAPE.is(i)
        );
      }
      //
      value() {
        return this._value;
      }
      token() {
        return this._token;
      }
      asFloat() {
        const n = parseFloat(this._value);
        if (isNaN(n)) return null;
        return n;
      }
      asInt() {
        const n = parseInt(this._value);
        if (isNaN(n)) return null;
        return n;
      }
      isFalse() {
        return "false" === this._value || "off" === this._value;
      }
      isTrue() {
        return "true" === this._value || "on" === this._value;
      }
      lowerValue() {
        return this._value.toLowerCase();
      }
      toString() {
        return this._value;
      }
    }

    var __defProp$e = Object.defineProperty;
    var __defNormalProp$e = (obj, key, value) => key in obj ? __defProp$e(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$e = (obj, key, value) => __defNormalProp$e(obj, typeof key !== "symbol" ? key + "" : key, value);
    class MatchedTokenConsumer {
      constructor(input) {
        __publicField$e(this, "_input");
        __publicField$e(this, "_lastIndex");
        this._input = input;
        this._lastIndex = -1;
      }
      accept(start, end, type) {
        this._lastIndex = end;
      }
      lastEndIndex() {
        return this._lastIndex;
      }
    }

    var __defProp$d = Object.defineProperty;
    var __defNormalProp$d = (obj, key, value) => key in obj ? __defProp$d(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$d = (obj, key, value) => __defNormalProp$d(obj, key + "" , value);
    class PreProcessTagImpl {
      constructor(_value) {
        this._value = _value;
        __publicField$d(this, "type", "preProcess");
      }
      //
      value() {
        return this._value;
      }
    }

    var __defProp$c = Object.defineProperty;
    var __defNormalProp$c = (obj, key, value) => key in obj ? __defProp$c(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$c = (obj, key, value) => __defNormalProp$c(obj, typeof key !== "symbol" ? key + "" : key, value);
    class StringResolvingMatchedTokenConsumer extends MatchedTokenConsumer {
      constructor(input, tagProvider) {
        super(input);
        __publicField$c(this, "_builder");
        __publicField$c(this, "_tagProvider");
        this._builder = new StringBuilder(input.length);
        this._tagProvider = tagProvider;
      }
      //
      accept(start, end, type) {
        super.accept(start, end, type);
        if (type !== TokenType.OPEN_TAG) {
          this._builder.appendString(this._input, start, end);
          return;
        }
        const match = this._input.substring(start, end);
        const cleanup = this._input.substring(start + 1, end - 1);
        const index = TokenParser.SEPARATOR.indexIn(cleanup);
        const tag = index === -1 ? cleanup : cleanup.substring(0, index);
        if (TagInternals.sanitizeAndCheckValidTagName(tag)) {
          const tokens = TokenParser.tokenize(match, false);
          const parts = [];
          if (tokens.length !== 0) {
            const childs = tokens[0].childTokens();
            if (childs !== null) {
              for (let i = 1; i < childs.length; i++) {
                const child = childs[i];
                const part = new TagPart(match, child, this._tagProvider);
                parts.push(part);
              }
            }
          }
          const replacement = this._tagProvider.resolve(
            TokenParser.TagProvider.sanitizePlaceholderName(tag),
            parts,
            tokens.length !== 0 ? tokens[0] : null
          );
          if (replacement !== null && replacement instanceof PreProcessTagImpl) {
            this._builder.append(replacement.value());
            return;
          }
        }
        this._builder.appendString(match);
      }
      result() {
        return this._builder.toString();
      }
    }

    var __defProp$b = Object.defineProperty;
    var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$b = (obj, key, value) => __defNormalProp$b(obj, key + "" , value);
    class TokenListProducingMatchedTokenConsumer extends MatchedTokenConsumer {
      //
      constructor(input) {
        super(input);
        __publicField$b(this, "_result");
        this._result = null;
      }
      result() {
        let result = this._result;
        if (result === null) result = [];
        return ArrayUtil.immutableView(result);
      }
      accept(start, end, type) {
        super.accept(start, end, type);
        let array = this._result;
        if (array === null) this._result = array = [];
        array.push(new Token(start, end, type));
      }
    }

    var __defProp$a = Object.defineProperty;
    var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$a = (obj, key, value) => __defNormalProp$a(obj, key + "" , value);
    class ValueNode extends ElementNode {
      constructor(parent, token, sourceMessage, value) {
        super(parent, token, sourceMessage);
        __publicField$a(this, "_value");
        this._value = value;
      }
      value() {
        return this._value;
      }
      token() {
        const token = super.token();
        if (token === null) throw new Error(`token is not set`);
        return token;
      }
    }

    class TextNode extends ValueNode {
      static isEscape(escape) {
        return TokenParser.TAG_START.is(escape) || TokenParser.ESCAPE.is(escape);
      }
      //
      constructor(parent, token, sourceMessage) {
        super(
          parent,
          token,
          sourceMessage,
          TokenParser.unescape(sourceMessage, token.startIndex(), token.endIndex(), TextNode.isEscape)
        );
      }
      //
      valueName() {
        return "TextNode";
      }
    }
    TextNodeFactory.bind(
      (n) => n instanceof TextNode,
      (parent, token, sourceMessage) => new TextNode(parent, token, sourceMessage)
    );

    var __defProp$9 = Object.defineProperty;
    var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$9 = (obj, key, value) => __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
    class TagNode extends ElementNode {
      constructor(parent, token, sourceMessage, tagProvider) {
        super(parent, token, sourceMessage);
        //
        __publicField$9(this, "_parts");
        __publicField$9(this, "_tag");
        this._parts = ArrayUtil.immutableView(TagNode.genParts(token, sourceMessage, tagProvider));
        this._tag = null;
        if (this._parts.length === 0) throw new Error(`Tag has no parts`);
      }
      static genParts(token, sourceMessage, tagProvider) {
        const parts = [];
        const children = token.childTokens();
        if (children !== null) {
          for (const child of children) {
            parts.push(new TagPart(sourceMessage, child, tagProvider));
          }
        }
        return parts;
      }
      //
      parts() {
        return this._parts;
      }
      name() {
        return this._parts[0].value();
      }
      token() {
        const token = super.token();
        if (token === null) throw new Error(`token is not set`);
        return token;
      }
      tag(tag) {
        if (tag) {
          this._tag = tag;
          return tag;
        } else {
          const value = this._tag;
          if (value === null) throw new Error(`no tag set`);
          return value;
        }
      }
    }

    var ParserDirectiveTag;
    ((ParserDirectiveTag2) => {
      function newTag() {
        return Object.seal({
          type: "directive",
          uid: /* @__PURE__ */ Symbol()
        });
      }
      ParserDirectiveTag2.RESET = newTag();
    })(ParserDirectiveTag || (ParserDirectiveTag = {}));

    var __defProp$8 = Object.defineProperty;
    var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$8 = (obj, key, value) => __defNormalProp$8(obj, key + "" , value);
    class InsertingTagImpl {
      constructor(_value, _allowsChildren = true) {
        this._value = _value;
        this._allowsChildren = _allowsChildren;
        __publicField$8(this, "type", "inserting");
      }
      //
      value() {
        return this._value;
      }
      allowsChildren() {
        return this._allowsChildren;
      }
    }
    class StylingTagImpl {
      constructor(_styles) {
        this._styles = _styles;
        __publicField$8(this, "type", "inserting");
      }
      //
      value() {
        const component = exports.Component.text("");
        const style = exports.Style.style(this._styles);
        return component.style(style);
      }
      allowsChildren() {
        return true;
      }
    }

    var TokenParser;
    ((TokenParser2) => {
      const MAX_DEPTH = 16;
      TokenParser2.TAG_START = Character.LESS_THAN;
      TokenParser2.TAG_END = Character.GREATER_THAN;
      TokenParser2.CLOSE_TAG = Character.SLASH;
      TokenParser2.SEPARATOR = Character.COLON;
      TokenParser2.ESCAPE = Character.BACKSLASH;
      let FirstPassState;
      ((FirstPassState2) => {
        FirstPassState2[FirstPassState2["NORMAL"] = 0] = "NORMAL";
        FirstPassState2[FirstPassState2["TAG"] = 1] = "TAG";
        FirstPassState2[FirstPassState2["STRING"] = 2] = "STRING";
      })(FirstPassState || (FirstPassState = {}));
      let SecondPassState;
      ((SecondPassState2) => {
        SecondPassState2[SecondPassState2["NORMAL"] = 0] = "NORMAL";
        SecondPassState2[SecondPassState2["STRING"] = 1] = "STRING";
      })(SecondPassState || (SecondPassState = {}));
      function parse(provider, tagNameChecker, message, originalMessage, strict) {
        const tokens = tokenize(message, false);
        return buildTree(provider, tagNameChecker, tokens, message, originalMessage, strict);
      }
      TokenParser2.parse = parse;
      function resolvePreProcessTags(message, provider) {
        let passes = 0;
        let lastResult;
        let result = message;
        do {
          lastResult = result;
          const stringTokenResolver = new StringResolvingMatchedTokenConsumer(lastResult, provider);
          parseString(lastResult, false, stringTokenResolver);
          result = stringTokenResolver.result();
          passes++;
        } while (passes < MAX_DEPTH && lastResult !== result);
        return lastResult;
      }
      TokenParser2.resolvePreProcessTags = resolvePreProcessTags;
      function tokenize(message, lenient) {
        const listProducer = new TokenListProducingMatchedTokenConsumer(message);
        parseString(message, lenient, listProducer);
        const tokens = listProducer.result();
        parseSecondPass(message, tokens);
        return tokens;
      }
      TokenParser2.tokenize = tokenize;
      function parseString(message, lenient, consumer) {
        let state = 0 /* NORMAL */;
        let escaped = false;
        let currentTokenEnd = 0;
        let marker = -1;
        let currentStringChar = 0;
        const length = message.length;
        for (let i = 0; i < length; i++) {
          const codePoint = message.codePointAt(i);
          if (!lenient && Character.SECTION.is(codePoint) && i + 1 < length) {
            const nextChar = message.codePointAt(i + 1);
            if (Character.ZERO.value <= nextChar && nextChar <= Character.NINE.value || Character.LOWERCASE_A.value <= nextChar && nextChar <= Character.LOWERCASE_F.value || Character.LOWERCASE_R.is(nextChar) || Character.LOWERCASE_K.value <= nextChar && nextChar <= Character.LOWERCASE_O.value) {
              throw new Error(`Legacy formatting codes detected in strict mode`);
            }
          }
          if (codePoint > 65535) i++;
          if (!escaped) {
            if (TokenParser2.ESCAPE.is(codePoint) && i + 1 < message.length) {
              const nextCodePoint = message.codePointAt(i + 1);
              switch (state) {
                case 0 /* NORMAL */:
                  escaped = TokenParser2.TAG_START.is(nextCodePoint) || TokenParser2.ESCAPE.is(nextCodePoint);
                  break;
                case 2 /* STRING */:
                  escaped = currentStringChar === nextCodePoint || TokenParser2.ESCAPE.is(nextCodePoint);
                  break;
                case 1 /* TAG */:
                  if (TokenParser2.TAG_START.is(nextCodePoint)) {
                    escaped = true;
                    state = 0 /* NORMAL */;
                  }
                  break;
                default:
                  assertNever(state);
              }
              if (escaped) continue;
            }
          } else {
            escaped = false;
            continue;
          }
          switch (state) {
            case 0 /* NORMAL */:
              if (TokenParser2.TAG_START.is(codePoint)) {
                marker = i;
                state = 1 /* TAG */;
              }
              break;
            case 1 /* TAG */:
              switch (codePoint) {
                case TokenParser2.TAG_END.value:
                  if (i === marker + 1) {
                    state = 0 /* NORMAL */;
                    break;
                  }
                  if (currentTokenEnd !== marker) {
                    consumer.accept(currentTokenEnd, marker, TokenType.TEXT);
                  }
                  currentTokenEnd = i + 1;
                  let thisType = TokenType.OPEN_TAG;
                  if (boundsCheck(message, marker, 1) && message.charCodeAt(marker + 1) === TokenParser2.CLOSE_TAG.value) {
                    thisType = TokenType.CLOSE_TAG;
                  } else if (boundsCheck(message, marker, 2) && message.charCodeAt(i - 1) === TokenParser2.CLOSE_TAG.value) {
                    thisType = TokenType.OPEN_CLOSE_TAG;
                  }
                  consumer.accept(marker, currentTokenEnd, thisType);
                  state = 0 /* NORMAL */;
                  break;
                case TokenParser2.TAG_START.value:
                  marker = i;
                  break;
                case Character.APOSTROPHE.value:
                case Character.QUOTATION.value:
                  currentStringChar = codePoint;
                  if (message.indexOf(String.fromCodePoint(codePoint), i + 1) !== -1) {
                    state = 2 /* STRING */;
                  }
                  break;
              }
              break;
            case 2 /* STRING */:
              if (codePoint === currentStringChar) {
                state = 1 /* TAG */;
              }
              break;
            default:
              assertNever(state);
          }
          if (i === length - 1 && state === 1 /* TAG */) {
            i = marker;
            state = 0 /* NORMAL */;
          }
        }
        const end = consumer.lastEndIndex();
        if (end === -1) {
          consumer.accept(0, message.length, TokenType.TEXT);
        } else if (end !== message.length) {
          consumer.accept(end, message.length, TokenType.TEXT);
        }
      }
      TokenParser2.parseString = parseString;
      function unescape(text, startIndex, endIndex, escapes) {
        let from = startIndex;
        let i = text.indexOf(`\\`, from);
        if (i === -1 || i >= endIndex) return text.substring(from, endIndex);
        const sb = new StringBuilder(endIndex - startIndex);
        while (i !== -1 && i + 1 < endIndex) {
          if (escapes(text.codePointAt(i + 1))) {
            sb.appendString(text, from, i);
            i++;
            if (i >= endIndex) {
              from = endIndex;
              break;
            }
            const codePoint = text.codePointAt(i);
            sb.appendString(String.fromCodePoint(codePoint));
            if (codePoint > 65535) {
              i += 2;
            } else {
              i += 1;
            }
            if (i >= endIndex) {
              from = endIndex;
              break;
            }
          } else {
            i++;
            sb.appendString(text, from, i);
          }
          from = i;
          i = text.indexOf(`\\`, from);
        }
        sb.appendString(text, from, endIndex);
        return sb.toString();
      }
      TokenParser2.unescape = unescape;
      function parseSecondPass(message, tokens) {
        for (const token of tokens) {
          const type = token.type();
          if (type !== TokenType.OPEN_TAG && type !== TokenType.OPEN_CLOSE_TAG && type !== TokenType.CLOSE_TAG) continue;
          const startIndex = type === TokenType.CLOSE_TAG ? token.startIndex() + 2 : token.startIndex() + 1;
          const endIndex = type === TokenType.OPEN_CLOSE_TAG ? token.endIndex() - 2 : token.endIndex() - 1;
          let state = 0 /* NORMAL */;
          let escaped = false;
          let currentStringChar = 0;
          let marker = startIndex;
          for (let i = startIndex; i < endIndex; i++) {
            const codePoint = message.codePointAt(i);
            if (codePoint > 65535) i++;
            if (!escaped) {
              if (TokenParser2.ESCAPE.is(codePoint) && i + 1 < message.length) {
                const nextCodePoint = message.codePointAt(i + 1);
                switch (state) {
                  case 0 /* NORMAL */:
                    escaped = TokenParser2.TAG_START.is(nextCodePoint) || TokenParser2.ESCAPE.is(nextCodePoint);
                    break;
                  case 1 /* STRING */:
                    escaped = currentStringChar === nextCodePoint || TokenParser2.ESCAPE.is(nextCodePoint);
                    break;
                  default:
                    assertNever(state);
                }
                if (escaped) {
                  continue;
                }
              }
            } else {
              escaped = false;
              continue;
            }
            switch (state) {
              case 0 /* NORMAL */:
                if (TokenParser2.SEPARATOR.is(codePoint)) {
                  if (boundsCheck(message, i, 2) && Character.SLASH.is(message.charCodeAt(i + 1)) && Character.SLASH.is(message.charCodeAt(i + 1))) {
                    break;
                  }
                  if (marker === i) {
                    insert(token, new Token(i, i, TokenType.TAG_VALUE));
                    marker++;
                  } else {
                    insert(token, new Token(marker, i, TokenType.TAG_VALUE));
                    marker = i + 1;
                  }
                } else if (Character.QUOTATION.is(codePoint) || Character.APOSTROPHE.is(codePoint)) {
                  state = 1 /* STRING */;
                  currentStringChar = codePoint;
                }
                break;
              case 1 /* STRING */:
                if (codePoint === currentStringChar) {
                  state = 0 /* NORMAL */;
                }
                break;
              default:
                assertNever(state);
            }
          }
          const childTokens = token.childTokens();
          if (childTokens === null || childTokens.length === 0) {
            insert(token, new Token(startIndex, endIndex, TokenType.TAG_VALUE));
          } else {
            const end = childTokens[childTokens.length - 1].endIndex();
            if (end !== endIndex) {
              insert(token, new Token(end + 1, endIndex, TokenType.TAG_VALUE));
            }
          }
        }
      }
      function buildTree(tagProvider, tagNameChecker, tokens, message, originalMessage, strict) {
        const root = new RootNode(message, originalMessage);
        let node = root;
        for (const token of tokens) {
          const type = token.type();
          switch (type) {
            case TokenType.TEXT:
              node.addChild(new TextNode(node, token, message));
              break;
            case TokenType.OPEN_TAG:
            case TokenType.OPEN_CLOSE_TAG:
              const tagNamePart = token.childTokens()[0];
              const tagName = message.substring(tagNamePart.startIndex(), tagNamePart.endIndex());
              if (!TagInternals.sanitizeAndCheckValidTagName(tagName)) {
                node.addChild(new TextNode(node, token, message));
                break;
              }
              const tagNode = new TagNode(node, token, message, tagProvider);
              if (tagNameChecker(tagNode.name())) {
                const tag = tagProvider.resolve(
                  TokenParser2.TagProvider.sanitizePlaceholderName(tagNode.name()),
                  tagNode.parts().slice(1, tagNode.parts().length),
                  tagNode.token()
                );
                if (tag === null) {
                  node.addChild(new TextNode(node, token, message));
                } else if (tag === ParserDirectiveTag.RESET) {
                  if (strict) throw new Error(`<reset> tags are not allowed when strict mode is enabled`);
                  node = root;
                } else {
                  tagNode.tag(tag);
                  node.addChild(tagNode);
                  if (type !== TokenType.OPEN_CLOSE_TAG && (!(tag instanceof InsertingTagImpl) || tag.allowsChildren())) {
                    node = tagNode;
                  }
                }
              } else {
                node.addChild(new TextNode(node, token, message));
              }
              break;
            case TokenType.CLOSE_TAG:
              const childTokens = token.childTokens();
              if (childTokens === null || childTokens.length === 0) {
                throw new Error(`CLOSE_TAG token has no children`);
              }
              const closeValues = new Array(childTokens.length);
              for (let i = 0; i < childTokens.length; i++) {
                const childToken = childTokens[i];
                closeValues[i] = TagPart.unquoteAndEscape(message, childToken.startIndex(), childToken.endIndex());
              }
              const closeTagName = closeValues[0];
              if (tagNameChecker(closeTagName)) {
                const tag = tagProvider.resolve(closeTagName, [], null);
                if (tag === ParserDirectiveTag.RESET) continue;
              } else {
                node.addChild(new TextNode(node, token, message));
                continue;
              }
              let parentNode = node;
              while (parentNode instanceof TagNode) {
                const openParts = parentNode.parts();
                if (tagCloses(closeValues, openParts)) {
                  if (parentNode !== node && strict) {
                    throw new Error(`Unclosed tag encountered: ${node.name()} is not closed, because ${closeValues[0]} was closed first.`);
                  }
                  const par = parentNode.parent();
                  if (par !== null) {
                    node = par;
                  } else {
                    throw new Error(`Root node matched with close tag value`);
                  }
                  break;
                }
                parentNode = parentNode.parent();
              }
              if (parentNode === null || parentNode instanceof RootNode) {
                node.addChild(new TextNode(node, token, message));
              }
              break;
          }
        }
        if (strict && root !== node) {
          const openTags = [];
          let n = node;
          while (n !== null) {
            if (n instanceof TagNode) {
              openTags.push(n);
            } else {
              break;
            }
            n = n.parent();
          }
          const sb = new StringBuilder();
          sb.appendString("All tags must be explicitly closed while in strict mode. ").appendString("End of string found with open tags: ");
          for (let i = openTags.length - 1; i >= 0; i--) {
            const n2 = openTags[i];
            sb.appendString(n2.name());
            if (i !== 0) sb.appendString(", ");
          }
          throw new Error(sb.toString());
        }
        return root;
      }
      function tagCloses(closeParts, openParts) {
        if (closeParts.length > openParts.length) return false;
        if (closeParts[0].toLowerCase() !== openParts[0].lowerValue()) return false;
        for (let i = 1; i < closeParts.length; i++) {
          if (closeParts[i] !== openParts[i].value()) return false;
        }
        return true;
      }
      function boundsCheck(text, index, length) {
        return index + length < text.length;
      }
      function insert(token, value) {
        const childTokens = token.childTokens();
        if (childTokens === null) {
          token.childTokens([value]);
        } else if (childTokens.length === 1) {
          const list = [
            childTokens[0],
            value
          ];
          token.childTokens(list);
        } else {
          token.childTokens([
            ...childTokens,
            value
          ]);
        }
      }
      ((TagProvider2) => {
        function sanitizePlaceholderName(name) {
          return name.toLowerCase();
        }
        TagProvider2.sanitizePlaceholderName = sanitizePlaceholderName;
      })(TokenParser2.TagProvider || (TokenParser2.TagProvider = {}));
    })(TokenParser || (TokenParser = {}));

    var __defProp$7 = Object.defineProperty;
    var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
    class ArgumentQueueImpl {
      constructor(context, args) {
        __publicField$7(this, "_args");
        __publicField$7(this, "_context");
        __publicField$7(this, "_head");
        this._args = ArrayUtil.immutableView(args);
        this._context = context;
        this._head = 0;
      }
      //
      hasNext() {
        return this._head < this._args.length;
      }
      peek() {
        return this.hasNext() ? this._args[this._head] : null;
      }
      pop() {
        if (!this.hasNext()) throw this._context.newException("Missing argument for this tag!", this);
        return this._args[this._head++];
      }
      popOr(errorMessage) {
        if (!this.hasNext()) {
          const message = typeof errorMessage === "function" ? `${errorMessage()}` : `${errorMessage}`;
          throw this._context.newException(message, this);
        }
        return this._args[this._head++];
      }
      reset() {
        this._head = 0;
      }
      toString() {
        return this._args.toString();
      }
    }

    class MiniMessageParser {
      constructor(tagResolver) {
        this.tagResolver = tagResolver;
      }
      //
      escapeTokens(ctx) {
        const message = ctx.message();
        const sb = new StringBuilder(message.length);
        this._escapeTokens(sb, message, ctx);
        return sb.toString();
      }
      _escapeTokens(sb, richMessage, context) {
        this._processTokens(sb, richMessage, context, (token, sb2) => {
          sb2.appendChar(Character.BACKSLASH);
          sb2.appendChar(TokenParser.TAG_START);
          if (token.type() === TokenType.CLOSE_TAG) {
            sb2.appendChar(TokenParser.CLOSE_TAG);
          }
          const childTokens = token.childTokens();
          if (childTokens !== null) {
            for (let i = 0; i < childTokens.length; i++) {
              if (i) sb2.appendChar(TokenParser.SEPARATOR);
              this._escapeTokens(sb2, childTokens[i].get(richMessage), context);
            }
          }
          sb2.appendChar(TokenParser.TAG_END);
        });
      }
      stripTokens(ctx) {
        const message = ctx.message();
        const sb = new StringBuilder(message.length);
        this._processTokens(sb, message, ctx, () => {
        });
        return sb.toString();
      }
      _processTokens(sb, richMessage, context, tagHandler) {
        const combinedResolver = exports.TagResolver.builder().resolver(this.tagResolver).resolver(context.extraTags()).build();
        const root = TokenParser.tokenize(richMessage, true);
        for (const token of root) {
          switch (token.type()) {
            case TokenType.OPEN_TAG:
            case TokenType.CLOSE_TAG:
            case TokenType.OPEN_CLOSE_TAG:
              const childTokens = token.childTokens();
              if (childTokens !== null && childTokens.length !== 0) {
                const sanitized = TokenParser.TagProvider.sanitizePlaceholderName(childTokens[0].get(richMessage));
                if (combinedResolver.has(sanitized)) {
                  tagHandler(token, sb);
                  break;
                }
              }
            case TokenType.TEXT:
              sb.appendString(richMessage, token.startIndex(), token.endIndex());
              break;
            default:
              throw new Error(`Unsupported token type ${String(token.type())}`);
          }
        }
      }
      parseToTree(context) {
        const combinedResolver = exports.TagResolver.builder().resolver(this.tagResolver).resolver(context.extraTags()).build();
        const preprocessor = context.preProcessor();
        const processedMessage = preprocessor(context.message());
        const debug = context.debugOutput();
        if (typeof processedMessage !== "string") {
          throw context.newException(`Preprocessor gave a non-string value (${processedMessage})`);
        }
        if (debug) {
          debug("Beginning parsing message");
          debug(processedMessage);
          debug("\n");
        }
        let transformationFactory;
        if (debug) {
          transformationFactory = this._newTagProvider((name, trimmedArgs, token) => {
            try {
              debug("Attempting to match node '");
              debug(name);
              debug("'");
              if (token !== null) {
                debug(" at column ");
                debug(`${token.startIndex()}`);
              }
              debug("\n");
              const transformation = combinedResolver.resolve(
                name,
                new ArgumentQueueImpl(context, trimmedArgs),
                context
              );
              if (transformation === null) {
                debug("Could not match node '");
                debug(name);
                debug("'\n");
              } else {
                debug("Successfully matched node '");
                debug(name);
                debug("' to tag ");
                debug(transformation.type);
                debug("\n");
              }
              return transformation;
            } catch (e) {
              debug("Could not match node '");
              debug(name);
              debug("' - ");
              debug(ErrorInfo.of(e).message);
              debug("\n");
              return null;
            }
          });
        } else {
          transformationFactory = this._newTagProvider((name, args) => {
            try {
              return combinedResolver.resolve(name, new ArgumentQueueImpl(context, args), context);
            } catch (ignored) {
              return null;
            }
          });
        }
        const tagNameChecker = ((name) => {
          const sanitized = TokenParser.TagProvider.sanitizePlaceholderName(name);
          return combinedResolver.has(sanitized);
        });
        const preProcessed = TokenParser.resolvePreProcessTags(processedMessage, transformationFactory);
        context.message(preProcessed);
        const root = TokenParser.parse(
          transformationFactory,
          tagNameChecker,
          preProcessed,
          processedMessage,
          context.strict()
        );
        if (debug) {
          debug("Text parsed into element tree:\n");
          debug(root.toString());
        }
        return root;
      }
      _newTagProvider(resolve) {
        return { resolve };
      }
      parseFormat(context) {
        const root = this.parseToTree(context);
        let component = this.treeToComponent(root, context);
        const postProcessor = context.postProcessor();
        component = postProcessor(component);
        if (!exports.Component.isComponent(component))
          throw new Error(`Post-processor gave a non-Component value (${component})`);
        return component;
      }
      treeToComponent(node, context) {
        let comp = exports.Component.empty();
        let tag = null;
        if (node instanceof ValueNode) {
          comp = exports.Component.text(node.value());
        } else if (node instanceof TagNode) {
          tag = node.tag();
          if (tag.type === "modifying") {
            this._visitModifying(tag, node, 0);
            tag.postVisit();
          } else if (tag.type === "inserting") {
            comp = tag.value();
          }
        }
        const unsafeChildren = node.unsafeChildren();
        if (unsafeChildren.length !== 0) {
          const existingChildren = comp.children();
          const children = new Array(existingChildren.length + unsafeChildren.length);
          let head = 0;
          for (const child of existingChildren) {
            children[head++] = child;
          }
          for (const child of unsafeChildren) {
            children[head++] = this.treeToComponent(child, context);
          }
          children.length = head;
          comp = comp.children(children);
        }
        if (tag !== null && tag.type === "modifying") {
          comp = this._handleModifying(tag, comp, 0);
        }
        const debug = context.debugOutput();
        if (debug) {
          debug("==========\ntreeToComponent \n");
          debug(`${node}`);
          debug("\n");
          debug(`${comp}`);
          debug("\n==========\n");
        }
        return comp;
      }
      _visitModifying(modTransformation, node, depth) {
        modTransformation.visit(node, depth);
        for (const child of node.unsafeChildren()) {
          this._visitModifying(modTransformation, child, depth + 1);
        }
      }
      _handleModifying(modTransformation, current, depth) {
        let newComp = modTransformation.apply(current, depth);
        for (const child of current.children()) {
          newComp = newComp.append(this._handleModifying(modTransformation, child, depth + 1));
        }
        return newComp;
      }
    }

    exports.Tag = void 0;
    ((Tag2) => {
      function preProcessParsed(content) {
        return new PreProcessTagImpl(content);
      }
      Tag2.preProcessParsed = preProcessParsed;
      function inserting(content) {
        return new InsertingTagImpl(content.asComponent(), true);
      }
      Tag2.inserting = inserting;
      function selfClosingInserting(content) {
        return new InsertingTagImpl(content.asComponent(), false);
      }
      Tag2.selfClosingInserting = selfClosingInserting;
      function styling(styles) {
        return new StylingTagImpl(styles);
      }
      Tag2.styling = styling;
    })(exports.Tag || (exports.Tag = {}));

    var __defProp$6 = Object.defineProperty;
    var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _ColorTagResolver = class _ColorTagResolver {
      static isColorOrAbbreviation(name) {
        return this.COLOR === name || this.COLOR_2 === name || this.COLOR_3 === name;
      }
      static resolveColorOrNull(colorName) {
        let color;
        if (colorName in this.COLOR_ALIASES) {
          color = this.COLOR_ALIASES[colorName];
        } else if (colorName.charCodeAt(0) === Character.NUMBER_SIGN.value) {
          color = exports.TextColor.fromHexString(colorName);
        } else if (colorName in exports.NamedTextColor.NAMES) {
          color = exports.NamedTextColor.NAMES[colorName];
        } else {
          color = null;
        }
        return color;
      }
      static resolveColor(colorName, ctx) {
        const color = this.resolveColorOrNull(colorName);
        if (color === null)
          throw ctx.newException(`Unable to parse a color from '${colorName}'. Please use named colours or hex (#RRGGBB) colors.`);
        return color;
      }
      //
      has(name) {
        return _ColorTagResolver.isColorOrAbbreviation(name) || name in exports.NamedTextColor.NAMES || name in _ColorTagResolver.COLOR_ALIASES || exports.TextColor.fromHexString(name) !== null;
      }
      resolve(name, args, ctx) {
        if (!this.has(name))
          return null;
        let colorName;
        if (_ColorTagResolver.isColorOrAbbreviation(name)) {
          colorName = args.popOr("Expected to find a color parameter: <name>|#RRGGBB").lowerValue();
        } else {
          colorName = name;
        }
        const color = _ColorTagResolver.resolveColor(colorName, ctx);
        return exports.Tag.styling((style) => {
          style.color(color);
        });
      }
    };
    __publicField$6(_ColorTagResolver, "INSTANCE", new _ColorTagResolver());
    __publicField$6(_ColorTagResolver, "COLOR", "color");
    __publicField$6(_ColorTagResolver, "COLOR_2", "c");
    __publicField$6(_ColorTagResolver, "COLOR_3", "colour");
    __publicField$6(_ColorTagResolver, "COLOR_ALIASES", Object.freeze({
      "dark_grey": exports.NamedTextColor.DARK_GRAY,
      "grey": exports.NamedTextColor.GRAY
    }));
    let ColorTagResolver = _ColorTagResolver;

    var __defProp$5 = Object.defineProperty;
    var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, key + "" , value);
    class AbstractModifyingTag {
      constructor() {
        __publicField$5(this, "type", "modifying");
      }
      visit(current, depth) {
      }
      postVisit() {
      }
    }

    var __defProp$4 = Object.defineProperty;
    var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _AbstractColorChangingTag = class _AbstractColorChangingTag extends AbstractModifyingTag {
      constructor() {
        super(...arguments);
        //
        __publicField$4(this, "_visited", false);
        __publicField$4(this, "_size", 0);
        __publicField$4(this, "_disableApplyingColorDepth", -1);
      }
      //
      get size() {
        return this._size;
      }
      visit(current, depth) {
        if (this._visited) throw new Error(`Color changing tag instances cannot be reused`);
        if (current instanceof ValueNode) {
          const value = current.value();
          this._size += codePointCount(value);
        } else if (current instanceof TagNode) {
          const tag = current.tag();
          if (tag instanceof InsertingTagImpl) {
            _AbstractColorChangingTag.LENGTH_CALCULATOR.flatten(
              tag.value(),
              exports.FlattenerListener.of((s) => {
                this._size += codePointCount(s);
              })
            );
          }
        }
      }
      postVisit() {
        this._visited = true;
        this.init();
      }
      apply(current, depth) {
        if (this._disableApplyingColorDepth !== -1 && depth > this._disableApplyingColorDepth || current.style().color() !== null) {
          if (this._disableApplyingColorDepth === -1 || depth < this._disableApplyingColorDepth) {
            this._disableApplyingColorDepth = depth;
          }
          if (current.type === "text") {
            this.skipColorForLengthOf(current.content());
          }
          return current.children([]);
        }
        this._disableApplyingColorDepth = -1;
        if (current.type === "text") {
          if (current.content().length !== 0) {
            const content = current.content();
            let parent = exports.Component.empty();
            let head = 0;
            let codePoint;
            while (head < content.length) {
              codePoint = content.codePointAt(head++);
              if (codePoint > 65535) head++;
              const child = exports.Component.text(String.fromCodePoint(codePoint)).style(current.style().color(this.color()));
              this.advanceColor();
              parent = parent.append(child);
            }
            return parent;
          } else {
            return exports.Component.empty().style(current.style());
          }
        } else {
          const ret = current.children([]).colorIfAbsent(this.color());
          this.advanceColor();
          return ret;
        }
      }
      skipColorForLengthOf(content) {
        const count = codePointCount(content);
        for (let i = 0; i < count; i++) this.advanceColor();
      }
    };
    __publicField$4(_AbstractColorChangingTag, "LENGTH_CALCULATOR", exports.ComponentFlattener.builder().mapper(TextComponent.TYPE, (c) => c.content()).unknownMapper(() => "_").build());
    let AbstractColorChangingTag = _AbstractColorChangingTag;

    var __defProp$3 = Object.defineProperty;
    var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
    const _GradientTagImpl = class _GradientTagImpl extends AbstractColorChangingTag {
      constructor(phase, colors) {
        super();
        //
        __publicField$3(this, "_phase");
        __publicField$3(this, "_colors");
        __publicField$3(this, "_index");
        __publicField$3(this, "_mulitplier");
        if (colors.length === 0) {
          this._colors = [_GradientTagImpl.DEFAULT_WHITE, _GradientTagImpl.DEFAULT_BLACK];
        } else {
          this._colors = [...colors];
        }
        if (phase < 0) {
          this._phase = 1 + phase;
          this._colors.reverse();
        } else {
          this._phase = phase;
        }
        this._index = 0;
        this._mulitplier = 1;
      }
      static create(args, ctx) {
        let phase = 0;
        let colors = [];
        if (args.hasNext()) {
          while (args.hasNext()) {
            const arg = args.pop();
            const argValue = arg.value();
            const color = ColorTagResolver.resolveColorOrNull(argValue);
            if (color != null) {
              colors.push(color);
              continue;
            }
            if (!args.hasNext()) {
              const possiblePhase = arg.asFloat();
              if (possiblePhase !== null) {
                phase = possiblePhase;
                if (phase < -1 || phase > 1) {
                  throw ctx.newException(`Gradient phase is out of range (${phase}).  Must be in the range [-1.0, 1.0] (inclusive).`, args);
                }
                continue;
              }
            }
            throw ctx.newException(`Unable to parse a color from '${argValue}'`, args);
          }
          if (colors.length === 1) {
            throw ctx.newException("Invalid gradient, not enough colors. Gradients must have at least two colors.", args);
          }
        }
        return new _GradientTagImpl(phase, colors);
      }
      //
      init() {
        this._mulitplier = this.size === 1 ? 0 : (this._colors.length - 1) / (this.size - 1);
        this._phase *= this._colors.length - 1;
        this._index = 0;
      }
      color() {
        const position = this._index * this._mulitplier + this._phase;
        const lowUnclamped = Math.floor(position);
        const high = Math.ceil(position) % this._colors.length;
        const low = lowUnclamped % this._colors.length;
        return exports.TextColor.lerp(
          position - lowUnclamped,
          this._colors[low],
          this._colors[high]
        );
      }
      advanceColor() {
        this._index++;
      }
    };
    __publicField$3(_GradientTagImpl, "DEFAULT_WHITE", exports.TextColor.color(16777215));
    __publicField$3(_GradientTagImpl, "DEFAULT_BLACK", exports.TextColor.color(0));
    let GradientTagImpl = _GradientTagImpl;
    var GradientTag;
    ((GradientTag2) => {
      GradientTag2.GRADIENT = "gradient";
      GradientTag2.RESOLVER = exports.TagResolver.dynamic(GradientTag2.GRADIENT, GradientTagImpl.create);
      function of(phase, colors) {
        return new GradientTagImpl(phase, colors);
      }
      GradientTag2.of = of;
    })(GradientTag || (GradientTag = {}));

    var DecorationTag;
    ((DecorationTag2) => {
      const B = "b";
      const I = "i";
      const EM = "em";
      const OBF = "obf";
      const ST = "st";
      const U = "u";
      DecorationTag2.REVERT = "!";
      function create(decoration, args) {
        const flag = !args.hasNext() || !args.pop().isFalse();
        return exports.Tag.styling((style) => {
          style.decoration(decoration, flag);
        });
      }
      function createNegated(decoration) {
        return exports.Tag.styling((style) => {
          style.decoration(decoration, exports.TextDecoration.State.FALSE);
        });
      }
      function resolvers(decoration, ...aliases) {
        const names = /* @__PURE__ */ new Set();
        names.add(decoration);
        for (const alias of aliases) names.add(alias);
        const count = names.size;
        const resolvers2 = new Array(count * 2);
        let head = 0;
        for (const name of names) {
          resolvers2[head++] = exports.TagResolver.dynamic(name, (args) => create(decoration, args));
          resolvers2[head++] = exports.TagResolver.resolver(`${DecorationTag2.REVERT}${name}`, createNegated(decoration));
        }
        return { decoration, resolvers: resolvers2 };
      }
      DecorationTag2.RESOLVERS = ((stream) => {
        let ret = {};
        for (const resolvers2 of stream) {
          ret[resolvers2.decoration] = exports.TagResolver.builder().resolvers(...resolvers2.resolvers).build();
        }
        return Object.freeze(ret);
      })([
        resolvers(exports.TextDecoration.OBFUSCATED, OBF),
        resolvers(exports.TextDecoration.BOLD, B),
        resolvers(exports.TextDecoration.STRIKETHROUGH, ST),
        resolvers(exports.TextDecoration.UNDERLINED, U),
        resolvers(exports.TextDecoration.ITALIC, EM, I)
      ]);
      DecorationTag2.RESOLVER = exports.TagResolver.builder().resolvers(...Object.values(DecorationTag2.RESOLVERS)).build();
    })(DecorationTag || (DecorationTag = {}));

    var HoverTag;
    ((HoverTag2) => {
      function create(args, ctx) {
        const actionName = args.popOr(`Hover event requires an action as its first argument`).value();
        const action = exports.HoverEvent.Action.NAMES[actionName];
        const value = ActionHandler.of(action);
        if (value === null) {
          throw ctx.newException(`Don't know how to turn '${args}' into a hover event`, args);
        }
        const payload = value(args, ctx);
        return exports.Tag.styling((s) => {
          s.hoverEvent(exports.HoverEvent.hoverEvent(action, payload));
        });
      }
      HoverTag2.HOVER = "hover";
      HoverTag2.RESOLVER = exports.TagResolver.dynamic(HoverTag2.HOVER, create);
      let ActionHandler;
      ((ActionHandler2) => {
        const ShowText = ((args, ctx) => {
          return ctx.deserialize(args.popOr("show_text action requires a message").value());
        });
        const ShowItem = ((args, ctx) => {
          const key = args.popOr("Show item hover needs at least an item ID").value();
          const count = args.hasNext() ? args.pop().asInt() : 1;
          if (count === null) throw ctx.newException("The count argument was not a valid integer");
          return exports.HoverEvent.ShowItem.showItem(key, count);
        });
        const ShowEntity = ((args, ctx) => {
          const key = args.popOr("Show entity needs a type argument").value();
          const id = UUID.fromString(args.popOr("Show entity needs an entity UUID").value());
          if (args.hasNext()) {
            const name = ctx.deserialize(args.pop().value());
            return exports.HoverEvent.ShowEntity.showEntity(key, id.toString(), name);
          } else {
            return exports.HoverEvent.ShowEntity.showEntity(key, id.toString());
          }
        });
        function of(action) {
          let ret = null;
          if (action === exports.HoverEvent.Action.SHOW_TEXT) {
            ret = ShowText;
          } else if (action === exports.HoverEvent.Action.SHOW_ITEM) {
            ret = ShowItem;
          } else if (action === exports.HoverEvent.Action.SHOW_ENTITY) {
            ret = ShowEntity;
          }
          return ret;
        }
        ActionHandler2.of = of;
      })(ActionHandler || (ActionHandler = {}));
    })(HoverTag || (HoverTag = {}));

    var ClickTag;
    ((ClickTag2) => {
      function create(args, ctx) {
        const actionName = args.popOr("A click tag requires an action name").lowerValue();
        const action = exports.ClickEvent.Action.NAMES[actionName];
        if (!action) throw ctx.newException(`Unknown click event action '${actionName}'`, args);
        let event;
        if (action === exports.ClickEvent.Action.CHANGE_PAGE) {
          const page = args.popOr(`'change_page' click event requires a page argument`).asInt();
          if (page === null) throw ctx.newException(`'change_page' click event requires an integer page argument`);
          event = exports.ClickEvent.changePage(page);
        } else if (action === exports.ClickEvent.Action.CUSTOM) {
          const keyString = args.popOr(`'custom' click event requires a key argument`).value();
          let nbt;
          if (args.hasNext()) {
            nbt = args.pop().value();
          } else {
            nbt = null;
          }
          event = exports.ClickEvent.custom(keyString, nbt);
        } else {
          event = exports.ClickEvent.clickEvent(
            action,
            exports.ClickEvent.Payload.string(args.popOr(`'${action.toString()} click events require a value'`).value())
          );
        }
        return exports.Tag.styling((s) => {
          s.clickEvent(event);
        });
      }
      ClickTag2.CLICK = "click";
      ClickTag2.RESOLVER = exports.TagResolver.dynamic(ClickTag2.CLICK, create);
    })(ClickTag || (ClickTag = {}));

    var KeybindTag;
    ((KeybindTag2) => {
      function create(args, ctx) {
        return exports.Tag.inserting(exports.Component.keybind(args.popOr("A keybind id is required").value()));
      }
      KeybindTag2.KEYBIND = "key";
      KeybindTag2.RESOLVER = exports.TagResolver.dynamic(KeybindTag2.KEYBIND, create);
    })(KeybindTag || (KeybindTag = {}));

    var SequentialHeadTag;
    ((SequentialHeadTag2) => {
      const UUIDv4_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ABCD][0-9a-f]{3}-[0-9a-f]{12}/i;
      function argumentToTriState(arg) {
        if (arg.isTrue()) return TriState.TRUE;
        if (arg.isFalse()) return TriState.FALSE;
        return TriState.NOT_SET;
      }
      function create(args, ctx) {
        if (!args.hasNext()) {
          return exports.Tag.selfClosingInserting(exports.Component.object(
            exports.ObjectContents.playerHead().build()
          ));
        }
        const rawArgument = args.pop();
        const argument = rawArgument.value();
        let outerLayer;
        if (!args.hasNext()) {
          outerLayer = argumentToTriState(rawArgument);
          if (outerLayer !== TriState.NOT_SET) {
            return exports.Tag.selfClosingInserting(exports.Component.object(
              exports.ObjectContents.playerHead().hat(outerLayer === TriState.TRUE).build()
            ));
          }
        } else {
          outerLayer = argumentToTriState(args.pop());
        }
        if (args.hasNext()) {
          throw ctx.newException("Too many arguments present", args);
        }
        if (UUIDv4_PATTERN.test(argument)) {
          return exports.Tag.selfClosingInserting(exports.Component.object(
            exports.ObjectContents.playerHead().id(argument).hat(TriState.resolve(outerLayer, true)).build()
          ));
        }
        if (argument.indexOf("/") !== -1) {
          return exports.Tag.selfClosingInserting(exports.Component.object(
            exports.ObjectContents.playerHead().texture(argument).hat(TriState.resolve(outerLayer, true)).build()
          ));
        }
        return exports.Tag.selfClosingInserting(exports.Component.object(
          exports.ObjectContents.playerHead().name(argument).hat(TriState.resolve(outerLayer, true)).build()
        ));
      }
      SequentialHeadTag2.HEAD = "head";
      SequentialHeadTag2.RESOLVER = exports.TagResolver.dynamic(SequentialHeadTag2.HEAD, create);
    })(SequentialHeadTag || (SequentialHeadTag = {}));

    var TranslatableFallbackTag;
    ((TranslatableFallbackTag2) => {
      function create(args, ctx) {
        const key = args.popOr("A translation key is required").value();
        const fallback = args.popOr("A fallback message is required").value();
        return exports.Tag.inserting(exports.Component.translatable(key, fallback, constructWith(args, ctx)));
      }
      function constructWith(args, ctx) {
        let ret = [];
        while (args.hasNext()) {
          ret.push(ctx.deserialize(args.pop().value()));
        }
        return ret;
      }
      TranslatableFallbackTag2.constructWith = constructWith;
      TranslatableFallbackTag2.TR_OR = "tr_or";
      TranslatableFallbackTag2.TRANSLATE_OR = "translate_or";
      TranslatableFallbackTag2.LANG_OR = "lang_or";
      TranslatableFallbackTag2.RESOLVER = exports.TagResolver.dynamic(
        TranslatableFallbackTag2.TRANSLATE_OR,
        create,
        TranslatableFallbackTag2.TR_OR,
        TranslatableFallbackTag2.LANG_OR
      );
    })(TranslatableFallbackTag || (TranslatableFallbackTag = {}));

    var TranslatableTag;
    ((TranslatableTag2) => {
      function create(args, ctx) {
        const key = args.popOr("A translation key is required").value();
        return exports.Tag.inserting(exports.Component.translatable(key, null, TranslatableFallbackTag.constructWith(args, ctx)));
      }
      TranslatableTag2.TR = "tr";
      TranslatableTag2.TRANSLATE = "translate";
      TranslatableTag2.LANG = "lang";
      TranslatableTag2.RESOLVER = exports.TagResolver.dynamic(
        TranslatableTag2.TRANSLATE,
        create,
        TranslatableTag2.TR,
        TranslatableTag2.LANG
      );
    })(TranslatableTag || (TranslatableTag = {}));

    var InsertionTag;
    ((InsertionTag2) => {
      function create(args, ctx) {
        const insertion = args.popOr("A value is required to produce an insertion component").value();
        return exports.Tag.styling((s) => s.insertion(insertion));
      }
      InsertionTag2.INSERTION = "insert";
      InsertionTag2.RESOLVER = exports.TagResolver.dynamic(InsertionTag2.INSERTION, create);
    })(InsertionTag || (InsertionTag = {}));

    var FontTag;
    ((FontTag2) => {
      function create(args, ctx) {
        let font;
        const valueOrNamespace = args.popOr("A font tag must have either arguments of either <value> or <namespace:value>").value();
        if (args.hasNext()) {
          const value = args.pop().value();
          font = exports.Key.key(valueOrNamespace, value);
        } else {
          font = exports.Key.key(valueOrNamespace);
        }
        return exports.Tag.styling((b) => b.font(font));
      }
      FontTag2.FONT = "font";
      FontTag2.RESOLVER = exports.TagResolver.dynamic(FontTag2.FONT, create);
    })(FontTag || (FontTag = {}));

    var __defProp$2 = Object.defineProperty;
    var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
    const hue2rgb = ((h) => {
      const rgb = new Uint8Array(3);
      const q = Math.trunc(h * 1536);
      const n = q < 0 ? (q % 1536 + 1536) % 1536 : q % 1536;
      const i = n >>> 8;
      const f = n & 255;
      switch (i) {
        case 0:
          rgb[0] = 255;
          rgb[1] = f;
          break;
        case 1:
          rgb[0] = ~f;
          rgb[1] = 255;
          break;
        case 2:
          rgb[1] = 255;
          rgb[2] = f;
          break;
        case 3:
          rgb[1] = ~f;
          rgb[2] = 255;
          break;
        case 4:
          rgb[2] = 255;
          rgb[0] = f;
          break;
        case 5:
          rgb[2] = ~f;
          rgb[0] = 255;
          break;
      }
      return rgb;
    });
    class RainbowTagImpl extends AbstractColorChangingTag {
      constructor(reversed, phase) {
        super();
        __publicField$2(this, "reversed");
        __publicField$2(this, "dividedPhase");
        __publicField$2(this, "colorIndex");
        this.reversed = reversed;
        this.dividedPhase = phase / 10;
        this.colorIndex = 0;
      }
      //
      init() {
        if (this.reversed) {
          this.colorIndex = this.size - 1;
        }
      }
      advanceColor() {
        if (this.reversed) {
          if (this.colorIndex === 0) {
            this.colorIndex = this.size - 1;
          } else {
            this.colorIndex--;
          }
        } else {
          this.colorIndex++;
        }
      }
      color() {
        const hue = (this.colorIndex / this.size + this.dividedPhase) % 1;
        const [r, g, b] = hue2rgb(hue);
        return exports.TextColor.color(r, g, b);
      }
    }
    var RainbowTag;
    ((RainbowTag2) => {
      const REVERSE = "!";
      function create(args, ctx) {
        let reversed = false;
        let phase = 0;
        if (args.hasNext()) {
          let value = args.pop().value();
          if (value.startsWith(REVERSE)) {
            reversed = true;
            value = value.substring(REVERSE.length);
          }
          if (value.length !== 0) {
            phase = parseInt(value);
            if (isNaN(phase)) throw ctx.newException(`Expected phase, got ${value}`, args);
          }
        }
        return new RainbowTagImpl(reversed, phase);
      }
      RainbowTag2.RAINBOW = "rainbow";
      RainbowTag2.RESOLVER = exports.TagResolver.dynamic(RainbowTag2.RAINBOW, create);
    })(RainbowTag || (RainbowTag = {}));

    var TransitionTag;
    ((TransitionTag2) => {
      function resolveColor(colors, phase, negativePhase) {
        const steps = 1 / (colors.length - 1);
        for (let colorIndex = 1; colorIndex < colors.length; colorIndex++) {
          const val = colorIndex * steps;
          if (val >= phase) {
            const factor = 1 + (phase - val) * (colors.length - 1);
            if (negativePhase) {
              return exports.TextColor.lerp(1 - factor, colors[colorIndex], colors[colorIndex - 1]);
            } else {
              return exports.TextColor.lerp(factor, colors[colorIndex - 1], colors[colorIndex]);
            }
          }
        }
        return colors[0];
      }
      function create(args, ctx) {
        let phase = 0;
        let textColors = [];
        if (args.hasNext()) {
          do {
            const arg = args.pop();
            const argValue = arg.value();
            const color = ColorTagResolver.resolveColorOrNull(argValue);
            if (color !== null) {
              textColors.push(color);
            } else {
              if (!args.hasNext()) {
                const possiblePhase = arg.asFloat();
                if (possiblePhase !== null) {
                  if (possiblePhase < -1 || possiblePhase > 1) {
                    throw ctx.newException(`Gradient phase is out of range (${phase}). Must be in the range [-1.0f, 1.0f] (inclusive).`, args);
                  }
                  phase = possiblePhase;
                  break;
                }
              }
              throw ctx.newException(`Unable to parse a color from '${argValue}'. Please use named colors or hex (#RRGGBB) colors.`, args);
            }
          } while (args.hasNext());
          if (textColors.length < 2) {
            throw ctx.newException(`Invalid transition, not enough colors. Transitions must have at least two colors.`, args);
          }
        }
        let negativePhase;
        if (phase < 0) {
          negativePhase = true;
          phase = 1 + phase;
          textColors.reverse();
        } else {
          negativePhase = false;
        }
        if (textColors.length === 0) {
          textColors.push(
            exports.TextColor.color(16777215),
            exports.TextColor.color(0)
          );
        }
        const finalColor = resolveColor(textColors, phase, negativePhase);
        const component = exports.Component.text("").color(finalColor);
        return exports.Tag.inserting(component);
      }
      TransitionTag2.TRANSITION = "transition";
      TransitionTag2.RESOLVER = exports.TagResolver.dynamic(TransitionTag2.TRANSITION, create);
    })(TransitionTag || (TransitionTag = {}));

    var ResetTag;
    ((ResetTag2) => {
      ResetTag2.RESET = "reset";
      ResetTag2.RESOLVER = exports.TagResolver.resolver(ResetTag2.RESET, ParserDirectiveTag.RESET);
    })(ResetTag || (ResetTag = {}));

    var NewlineTag;
    ((NewlineTag2) => {
      function create() {
        return exports.Tag.selfClosingInserting(exports.Component.newline());
      }
      NewlineTag2.NEWLINE = "newline";
      NewlineTag2.BR = "br";
      NewlineTag2.RESOLVER = exports.TagResolver.dynamic(NewlineTag2.NEWLINE, create, NewlineTag2.BR);
    })(NewlineTag || (NewlineTag = {}));

    var SelectorTag;
    ((SelectorTag2) => {
      function create(args, ctx) {
        const key = args.popOr("A selection key is required").value();
        let separator = null;
        if (args.hasNext()) {
          separator = ctx.deserialize(args.pop().value());
        }
        return exports.Tag.inserting(exports.Component.selector(key, separator));
      }
      SelectorTag2.SELECTOR = "selector";
      SelectorTag2.SEL = "sel";
      SelectorTag2.RESOLVER = exports.TagResolver.dynamic(SelectorTag2.SELECTOR, create, SelectorTag2.SEL);
    })(SelectorTag || (SelectorTag = {}));

    var ScoreTag;
    ((ScoreTag2) => {
      function create(args) {
        const name = args.popOr("A scoreboard member name is required").value();
        const objective = args.popOr("An objective name is required").value();
        return exports.Tag.inserting(exports.Component.score(name, objective));
      }
      ScoreTag2.SCORE = "score";
      ScoreTag2.RESOLVER = exports.TagResolver.dynamic(ScoreTag2.SCORE, create);
    })(ScoreTag || (ScoreTag = {}));

    var NbtTag;
    ((NbtTag2) => {
      const BLOCK = "block";
      const ENTITY = "entity";
      const STORAGE = "storage";
      const INTERPRET = "interpret";
      function resolve(args, ctx) {
        const type = args.popOr("a type of block, entity, or storage is required").lowerValue();
        let header;
        switch (type) {
          case BLOCK:
            const pos = args.popOr("A position is required").value();
            let parsed;
            try {
              parsed = BlockNBTComponent.Pos.fromString(pos);
            } catch (e) {
              throw ctx.newException(`Invalid position '${pos}'`, args);
            }
            header = { type, pos: parsed };
            break;
          case ENTITY:
            const selector = args.popOr("A selector is required").value();
            header = { type, key: selector };
            break;
          case STORAGE:
            const storage = args.popOr("A storage key is required").value();
            header = { type, key: storage };
            break;
          default:
            throw ctx.newException(`Unknown nbt tag type '${type}'`, args);
        }
        const nbtPath = args.popOr("An NBT path is required").value();
        let component;
        const headerType = header.type;
        switch (headerType) {
          case BLOCK:
            component = exports.Component.blockNBT(nbtPath, header.pos);
            break;
          case ENTITY:
            component = exports.Component.entityNBT(nbtPath, header.key);
            break;
          case STORAGE:
            component = exports.Component.storageNBT(nbtPath, header.key);
            break;
          default:
            assertNever(headerType);
        }
        if (args.hasNext()) {
          const popped = args.pop().value();
          if (INTERPRET === popped.toLowerCase()) {
            component = component.interpret(true);
          } else {
            component = component.separator(ctx.deserialize(popped));
            if (args.hasNext() && INTERPRET === args.pop().lowerValue()) {
              component = component.interpret(true);
            }
          }
        }
        return exports.Tag.inserting(component);
      }
      NbtTag2.NBT = "nbt";
      NbtTag2.DATA = "data";
      NbtTag2.RESOLVER = exports.TagResolver.dynamic(NbtTag2.NBT, resolve, NbtTag2.DATA);
    })(NbtTag || (NbtTag = {}));

    var PrideTag;
    ((PrideTag2) => {
      function colors(...values) {
        const { length } = values;
        const ret = new Array(length);
        for (let i = 0; i < length; i++) {
          ret[i] = exports.TextColor.color(values[i]);
        }
        return ret;
      }
      PrideTag2.PRIDE = "pride";
      const FLAGS = LookupTable.caseInsensitiveString((put) => {
        put(PrideTag2.PRIDE, colors(15007744, 16747776, 16772608, 164129, 19711, 7798920));
        put("progress", colors(16777215, 16756679, 7591918, 6371605, 0, 15007744, 16747776, 16772608, 164129, 19711, 7798920));
        put("trans", colors(6017019, 16100281, 16777215, 16100281, 6017019));
        put("bi", colors(14025328, 10178454, 14504));
        put("pan", colors(16718989, 16766720, 1750015));
        put("nb", colors(16577585, 16579836, 10312146, 2631720));
        put("lesbian", colors(14034944, 16751446, 16777215, 13918886, 10748002));
        put("ace", colors(0, 10790052, 16777215, 8454273));
        put("agender", colors(0, 12237498, 16777215, 12252292, 16777215, 12237498, 0));
        put("demisexual", colors(0, 16777215, 7209073, 13882323));
        put("genderqueer", colors(11894749, 16777215, 4817438));
        put("genderfluid", colors(16676514, 16777215, 12522199, 0, 3161278));
        put("intersex", colors(16766976, 7930538, 16766976));
        put("aro", colors(3909440, 11064442, 16777215, 11250603, 0));
        put("femboy", colors(13787301, 14987213, 16711422, 5754616, 16711422, 14987213, 13787301));
        put("intersex inclusive", colors(16766976, 7930538, 16766976, 16777215, 16756679, 7591918, 6371605, 0, 15007744, 16747776, 16772608, 164129, 19711, 7798920));
        put("baker", colors(13461247, 16737689, 16646144, 16685312, 16776961, 39168, 39371, 3473561, 10027161));
        put("philly", colors(0, 7884567, 16646144, 16616448, 16770304, 1154827, 410803, 12725980));
        put("queer", colors(0, 10148330, 41960, 11920669, 16777215, 16763149, 16541287, 16690889, 0));
        put("gay", colors(495216, 2543274, 10021057, 16777215, 8105442, 5261771, 4004472));
        put("bigender", colors(12876192, 15509195, 14010344, 16777215, 14010344, 10143720, 7111631));
        put("demigender", colors(8355711, 12829635, 16514932, 16777215, 16514932, 12829635, 8355711));
      });
      function create(args, ctx) {
        let phase = 0;
        let flag = PrideTag2.PRIDE;
        if (args.hasNext()) {
          const value = args.pop().lowerValue();
          if (FLAGS.has(value)) {
            flag = value;
          } else if (value.length !== 0) {
            phase = parseFloat(value);
            if (isNaN(phase)) ctx.newException(`Expected phase, got ${value}`, args);
          }
          if (phase < -1 || phase > 1) {
            throw ctx.newException(`Gradient phase is out of range (${phase}). Must be in the range [-1.0, 1.0] (inclusive).`, args);
          }
        }
        return GradientTag.of(phase, FLAGS.get(flag));
      }
      PrideTag2.RESOLVER = exports.TagResolver.dynamic(PrideTag2.PRIDE, create);
    })(PrideTag || (PrideTag = {}));

    var ShadowColorTag;
    ((ShadowColorTag2) => {
      ShadowColorTag2.SHADOW_COLOR = "shadow";
      const SHADOW_NONE = "!" + ShadowColorTag2.SHADOW_COLOR;
      const DEFAULT_ALPHA = 0.25;
      function create(args, ctx) {
        const colorString = args.popOr(`Expected to find a color parameter: #RRGGBBAA`).lowerValue();
        let color;
        if (colorString.length === 9 && Character.NUMBER_SIGN.is(colorString.charCodeAt(0))) {
          const sc = exports.ShadowColor.fromHexString(colorString);
          if (sc === null) {
            throw ctx.newException(`Unable to parse a shadow color from '${colorString}'. Please use #RRGGBBAA formatting.`, args);
          }
          color = sc;
        } else {
          const text = ColorTagResolver.resolveColor(colorString, ctx);
          let alpha = DEFAULT_ALPHA;
          if (args.hasNext()) {
            const ac = args.pop().asFloat();
            if (ac === null) {
              throw ctx.newException(`Number was expected to be a float`, args);
            }
            alpha = ac;
          }
          color = exports.ShadowColor.shadowColor(text, Math.round(alpha * 255));
        }
        return exports.Tag.styling((b) => b.shadowColor(color));
      }
      const PRIMARY_RESOLVER = exports.TagResolver.dynamic(ShadowColorTag2.SHADOW_COLOR, create);
      const NONE_RESOLVER = exports.TagResolver.resolver(
        SHADOW_NONE,
        exports.Tag.styling((s) => s.shadowColor(exports.ShadowColor.none()))
      );
      ShadowColorTag2.RESOLVER = exports.TagResolver.builder().resolvers(PRIMARY_RESOLVER, NONE_RESOLVER).build();
    })(ShadowColorTag || (ShadowColorTag = {}));

    var SpriteTag;
    ((SpriteTag2) => {
      function create(args) {
        const firstArg = args.popOr(`An atlas id and or a sprite id is required to produce a sprite object component`).value();
        const secondArg = args.hasNext() ? args.pop().value() : null;
        if (secondArg === null) {
          return exports.Tag.selfClosingInserting(exports.Component.object(
            exports.ObjectContents.sprite(firstArg)
          ));
        } else {
          return exports.Tag.selfClosingInserting(exports.Component.object(
            exports.ObjectContents.sprite(firstArg, secondArg)
          ));
        }
      }
      SpriteTag2.SPRITE = "sprite";
      SpriteTag2.RESOLVER = exports.TagResolver.dynamic(SpriteTag2.SPRITE, create);
    })(SpriteTag || (SpriteTag = {}));

    exports.StandardTags = void 0;
    ((StandardTags2) => {
      const ALL = exports.TagResolver.builder().resolvers(
        ColorTagResolver.INSTANCE,
        GradientTag.RESOLVER,
        DecorationTag.RESOLVER,
        HoverTag.RESOLVER,
        ClickTag.RESOLVER,
        KeybindTag.RESOLVER,
        SequentialHeadTag.RESOLVER,
        TranslatableTag.RESOLVER,
        TranslatableFallbackTag.RESOLVER,
        InsertionTag.RESOLVER,
        FontTag.RESOLVER,
        RainbowTag.RESOLVER,
        TransitionTag.RESOLVER,
        ResetTag.RESOLVER,
        NewlineTag.RESOLVER,
        SelectorTag.RESOLVER,
        ScoreTag.RESOLVER,
        NbtTag.RESOLVER,
        PrideTag.RESOLVER,
        ShadowColorTag.RESOLVER,
        SpriteTag.RESOLVER,
        HoverTag.RESOLVER
      ).build();
      function defaults() {
        return ALL;
      }
      StandardTags2.defaults = defaults;
      function color() {
        return ColorTagResolver.INSTANCE;
      }
      StandardTags2.color = color;
      function gradient() {
        return GradientTag.RESOLVER;
      }
      StandardTags2.gradient = gradient;
      function decorations(decoration) {
        if (decoration) {
          if (decoration in DecorationTag.RESOLVERS) return DecorationTag.RESOLVERS[decoration];
          throw new Error(`No resolver found for decoration (${decoration})`);
        }
        return DecorationTag.RESOLVER;
      }
      StandardTags2.decorations = decorations;
      function hoverEvent() {
        return HoverTag.RESOLVER;
      }
      StandardTags2.hoverEvent = hoverEvent;
      function clickEvent() {
        return ClickTag.RESOLVER;
      }
      StandardTags2.clickEvent = clickEvent;
      function keybind() {
        return KeybindTag.RESOLVER;
      }
      StandardTags2.keybind = keybind;
      function sequentialHead() {
        return SequentialHeadTag.RESOLVER;
      }
      StandardTags2.sequentialHead = sequentialHead;
      function translatable() {
        return TranslatableTag.RESOLVER;
      }
      StandardTags2.translatable = translatable;
      function translatableFallback() {
        return TranslatableFallbackTag.RESOLVER;
      }
      StandardTags2.translatableFallback = translatableFallback;
      function insertion() {
        return InsertionTag.RESOLVER;
      }
      StandardTags2.insertion = insertion;
      function font() {
        return FontTag.RESOLVER;
      }
      StandardTags2.font = font;
      function rainbow() {
        return RainbowTag.RESOLVER;
      }
      StandardTags2.rainbow = rainbow;
      function transition() {
        return TransitionTag.RESOLVER;
      }
      StandardTags2.transition = transition;
      function reset() {
        return ResetTag.RESOLVER;
      }
      StandardTags2.reset = reset;
      function newline() {
        return NewlineTag.RESOLVER;
      }
      StandardTags2.newline = newline;
      function selector() {
        return SelectorTag.RESOLVER;
      }
      StandardTags2.selector = selector;
      function score() {
        return ScoreTag.RESOLVER;
      }
      StandardTags2.score = score;
      function nbt() {
        return NbtTag.RESOLVER;
      }
      StandardTags2.nbt = nbt;
      function pride() {
        return PrideTag.RESOLVER;
      }
      StandardTags2.pride = pride;
      function shadowColor() {
        return ShadowColorTag.RESOLVER;
      }
      StandardTags2.shadowColor = shadowColor;
      function sprite() {
        return SpriteTag.RESOLVER;
      }
      StandardTags2.sprite = sprite;
    })(exports.StandardTags || (exports.StandardTags = {}));

    var __defProp$1 = Object.defineProperty;
    var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
    class ContextImpl {
      constructor(strict, debugOutput, message, miniMessage, extraTags, preProcessor, postProcessor) {
        __publicField$1(this, "_strict");
        __publicField$1(this, "_debugOutput");
        __publicField$1(this, "_message");
        __publicField$1(this, "_miniMessage");
        __publicField$1(this, "_tagResolver");
        __publicField$1(this, "_preProcessor");
        __publicField$1(this, "_postProcessor");
        this._strict = strict;
        this._debugOutput = debugOutput;
        this._message = message;
        this._miniMessage = miniMessage;
        this._tagResolver = extraTags === null ? exports.TagResolver.empty() : extraTags;
        this._preProcessor = typeof preProcessor === "function" ? preProcessor : ((x) => x);
        this._postProcessor = typeof postProcessor === "function" ? postProcessor : ((x) => x);
      }
      //
      strict() {
        return this._strict;
      }
      debugOutput() {
        return this._debugOutput;
      }
      message(newMessage) {
        if (typeof newMessage === "string") this._message = newMessage;
        return this._message;
      }
      extraTags() {
        return this._tagResolver;
      }
      preProcessor() {
        return this._preProcessor;
      }
      postProcessor() {
        return this._postProcessor;
      }
      deserialize(message, ...resolvers) {
        return this._miniMessage.deserialize(message, this._tagResolver, ...resolvers);
      }
      newException(message, tags) {
        return new Error(message);
      }
    }

    var MiniMessageSerializer;
    ((MiniMessageSerializer2) => {
      const MAX_DEPTH = 64;
      const RENDERER = new class extends AbstractComponentRenderer {
        constructor() {
          super();
        }
        //
        preRender(component, context) {
          if (context.depth > MAX_DEPTH) {
            throw new Error(`Maximum recursion depth reached (${MAX_DEPTH})`);
          }
          const style = component.style();
          const styleTags = new Stack();
          const { out } = context;
          const emit = ((tag, ...args) => {
            styleTags.push(tag);
            this._openTag(out, tag, ...args);
          });
          const emitDecoration = ((tag, state) => {
            if (state === exports.TextDecoration.State.NOT_SET) return;
            emit(state === exports.TextDecoration.State.TRUE ? tag : `!${tag}`);
          });
          emitDecoration("b", style.decoration(exports.TextDecoration.BOLD));
          emitDecoration("i", style.decoration(exports.TextDecoration.ITALIC));
          emitDecoration("st", style.decoration(exports.TextDecoration.STRIKETHROUGH));
          emitDecoration("u", style.decoration(exports.TextDecoration.UNDERLINED));
          emitDecoration("obf", style.decoration(exports.TextDecoration.OBFUSCATED));
          const color = style.color();
          if (color !== null) emit(color.toString());
          const shadowColor = style.shadowColor();
          if (shadowColor !== null) emit(ShadowColorTag.SHADOW_COLOR, shadowColor.asHexString());
          const font = style.font();
          if (font !== null) emit(FontTag.FONT, font.asString());
          const insertion = style.insertion();
          if (insertion !== null) emit(InsertionTag.INSERTION, insertion);
          const clickEvent = style.clickEvent();
          if (clickEvent !== null) {
            const actionName = clickEvent.action().toString();
            const payload = clickEvent.payload();
            const payloadType = payload.type;
            switch (payloadType) {
              case "text":
                emit(ClickTag.CLICK, actionName, payload.value());
                break;
              case "int":
                emit(ClickTag.CLICK, actionName, `${payload.integer()}`);
                break;
              case "custom":
                const key = payload.key();
                const nbt = payload.nbt();
                if (nbt) {
                  emit(ClickTag.CLICK, actionName, key.asMinimalString(), nbt);
                } else {
                  emit(ClickTag.CLICK, actionName, key.asMinimalString());
                }
                break;
              default:
                assertNever(payloadType);
            }
          }
          const hoverEvent = style.hoverEvent();
          if (hoverEvent !== null) {
            const handlers = new exports.HoverEvent.Handlers();
            handlers.register(exports.HoverEvent.Action.SHOW_TEXT, (e) => {
              const value = this._serializeRichArgument(context, e.value());
              emit(HoverTag.HOVER, `show_text`, value);
            });
            handlers.register(exports.HoverEvent.Action.SHOW_ENTITY, (e) => {
              const showEntity = e.value();
              const type = showEntity.type();
              const id = showEntity.id();
              const name = showEntity.name();
              if (name) {
                emit(HoverTag.HOVER, `show_entity`, type, id, this._serializeRichArgument(context, name));
              } else {
                emit(HoverTag.HOVER, `show_entity`, type, id);
              }
            });
            handlers.register(exports.HoverEvent.Action.SHOW_ITEM, (e) => {
              const showItem = e.value();
              const item = showItem.item();
              const count = showItem.count();
              if (count !== 1) {
                emit(HoverTag.HOVER, `show_item`, item.asMinimalString(), `${count}`);
              } else {
                emit(HoverTag.HOVER, `show_item`, item.asMinimalString());
              }
            });
            handlers.invoke(hoverEvent, null);
          }
          context.styleTags.push(styleTags);
          return component;
        }
        postRender(component, context) {
          context.depth++;
          for (const child of component.children()) {
            this.render(child, context);
          }
          context.depth--;
          const { styleTags, out } = context;
          const tags = styleTags.pop();
          if (tags) {
            let tag;
            while ((tag = tags.pop()) !== null)
              this._closeTag(out, tag);
          }
          return component;
        }
        renderText(component, context) {
          const { out, miniMessage } = context;
          out.appendString(miniMessage.escapeTags(component.content()));
          return component;
        }
        renderTranslatable(component, context) {
          const { out } = context;
          const key = component.key();
          const args = component.arguments();
          if (args.length === 0) {
            this._openCloseTag(out, TranslatableTag.LANG, key);
          } else {
            const stringArgs = new Array(args.length + 1);
            stringArgs[0] = key;
            for (let i = 0; i < args.length; i++) {
              const arg = args[i];
              let value;
              if (exports.Component.isComponent(arg)) {
                value = this._serializeRichArgument(context, arg);
              } else {
                value = `${arg}`;
              }
              stringArgs[i + 1] = value;
            }
            this._openCloseTag(out, TranslatableTag.LANG, ...stringArgs);
          }
          return component;
        }
        renderBlock(component, context) {
          const { out } = context;
          this._openCloseTag(
            out,
            NbtTag.NBT,
            "block",
            component.pos().asString(),
            ...this._nbtFooter(context, component)
          );
          return component;
        }
        renderEntity(component, context) {
          const { out } = context;
          this._openCloseTag(
            out,
            NbtTag.NBT,
            "entity",
            component.selector(),
            ...this._nbtFooter(context, component)
          );
          return component;
        }
        renderStorage(component, context) {
          const { out } = context;
          this._openCloseTag(
            out,
            NbtTag.NBT,
            "storage",
            component.storage().asMinimalString(),
            ...this._nbtFooter(context, component)
          );
          return component;
        }
        renderSelector(component, context) {
          const { out } = context;
          const separator = component.separator();
          if (separator) {
            this._openCloseTag(
              out,
              SelectorTag.SELECTOR,
              component.pattern(),
              this._serializeRichArgument(context, separator)
            );
          } else {
            this._openCloseTag(
              out,
              SelectorTag.SELECTOR,
              component.pattern()
            );
          }
          return component;
        }
        renderScore(component, context) {
          const { out } = context;
          this._openCloseTag(
            out,
            ScoreTag.SCORE,
            component.name(),
            component.objective()
          );
          return component;
        }
        renderKeybind(component, context) {
          const { out } = context;
          this._openCloseTag(
            out,
            KeybindTag.KEYBIND,
            component.keybind()
          );
          return component;
        }
        renderObject(component, context) {
          const { out } = context;
          const contents = component.contents();
          const contentsType = contents.type;
          switch (contentsType) {
            case "playerHead":
              const hat = contents.hat();
              const name = contents.name();
              const id = contents.id();
              const texture = contents.texture();
              const put = ((value) => {
                if (hat) {
                  this._openCloseTag(out, SequentialHeadTag.HEAD, value);
                } else {
                  this._openCloseTag(out, SequentialHeadTag.HEAD, value, "false");
                }
              });
              let flag = 0;
              if (name !== null) flag |= 1;
              if (id !== null) flag |= 2;
              if (texture !== null) flag |= 4;
              switch (flag) {
                case 1:
                  put(name);
                  break;
                case 2:
                  put(id);
                  break;
                case 4:
                  put(texture.asMinimalString());
                  break;
                default:
                  throw new Error(`Unable to serialize ambiguous player head tag with name '${name}', id '${id}' and texture '${texture}'`);
              }
              break;
            case "sprite":
              const atlas = contents.atlas();
              const sprite = contents.sprite();
              if (!exports.Key.equals(atlas, SpriteObjectContents.DEFAULT_ATLAS)) {
                this._openCloseTag(out, SpriteTag.SPRITE, atlas.asMinimalString(), sprite.asMinimalString());
              } else {
                this._openCloseTag(out, SpriteTag.SPRITE, sprite.asMinimalString());
              }
              break;
            default:
              assertNever(contentsType);
          }
          return component;
        }
        //
        _openTag(out, tag, ...args) {
          out.appendChar(Character.LESS_THAN).append(tag);
          this._writeTagArgs(out, args);
          out.appendChar(Character.GREATER_THAN);
        }
        _openCloseTag(out, tag, ...args) {
          out.appendChar(Character.LESS_THAN).append(tag);
          this._writeTagArgs(out, args);
          out.appendChar(Character.SLASH).appendChar(Character.GREATER_THAN);
        }
        _closeTag(out, tag) {
          out.appendChar(Character.LESS_THAN).appendChar(Character.SLASH).append(tag).appendChar(Character.GREATER_THAN);
        }
        _writeTagArgs(out, args) {
          for (const arg of args) {
            out.appendChar(Character.COLON);
            this._escapeTagContent(out, arg);
          }
        }
        _serializeRichArgument(context, argument) {
          const childContext = {
            miniMessage: context.miniMessage,
            out: new StringBuilder(),
            styleTags: new Stack(),
            depth: context.depth + 1
          };
          this.render(argument, childContext);
          return childContext.out.toString();
        }
        _nbtFooter(context, component) {
          const ret = new Array(3);
          let head = 0;
          ret[head++] = component.nbtPath();
          const separator = component.separator();
          if (separator) ret[head++] = this._serializeRichArgument(context, separator);
          const interpret = component.interpret();
          if (interpret) ret[head++] = "interpret";
          ret.length = head;
          return ret;
        }
        _escapeTagContent(out, content) {
          let mustBeQuoted = false;
          let hasSingleQuote = false;
          let hasDoubleQuote = false;
          let active;
          for (let i = 0; i < content.length; i++) {
            active = content.charCodeAt(i);
            if (TokenParser.TAG_END.is(active) || TokenParser.SEPARATOR.is(active) || Character.SPACE.is(active)) {
              mustBeQuoted = true;
              if (hasSingleQuote && hasDoubleQuote) break;
            } else if (Character.APOSTROPHE.is(active)) {
              hasSingleQuote = true;
              break;
            } else if (Character.QUOTATION.is(active)) {
              hasDoubleQuote = true;
              break;
            }
          }
          if (hasSingleQuote) {
            out.appendChar(Character.QUOTATION);
            this._appendEscaping(
              out,
              content,
              [TokenParser.ESCAPE, Character.QUOTATION],
              true
            );
            out.appendChar(Character.QUOTATION);
          } else if (hasDoubleQuote || mustBeQuoted) {
            out.appendChar(Character.APOSTROPHE);
            this._appendEscaping(
              out,
              content,
              [TokenParser.ESCAPE, Character.APOSTROPHE],
              true
            );
            out.appendChar(Character.APOSTROPHE);
          } else {
            this._appendEscaping(
              out,
              content,
              [TokenParser.TAG_END, TokenParser.SEPARATOR],
              false
            );
          }
        }
        _appendEscaping(out, text, escapeChars, allowEscapes) {
          let startIdx = 0;
          let unescapedFound = false;
          for (let i = 0; i < text.length; i++) {
            const test = text.charCodeAt(i);
            let escaped = false;
            for (const c of escapeChars) {
              if (c.is(test)) {
                if (!allowEscapes) throw new Error();
                escaped = true;
                break;
              }
            }
            if (escaped) {
              if (unescapedFound) out.appendString(text, startIdx, i);
              startIdx = i + 1;
              out.appendChar(TokenParser.ESCAPE).appendChar(test);
            } else {
              unescapedFound = true;
            }
          }
          if (startIdx < text.length && unescapedFound) {
            out.appendString(text, startIdx, text.length);
          }
        }
      }();
      function serialize(miniMessage, component) {
        const context = {
          miniMessage,
          out: new StringBuilder(),
          styleTags: new Stack(),
          depth: 0
        };
        RENDERER.render(component, context);
        return context.out.toString();
      }
      MiniMessageSerializer2.serialize = serialize;
    })(MiniMessageSerializer || (MiniMessageSerializer = {}));

    var __defProp = Object.defineProperty;
    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    class MiniMessageImpl {
      constructor(tagResolver, _strict, _debugOutput, _preProcessor, _postProcessor, _translations) {
        this._strict = _strict;
        this._debugOutput = _debugOutput;
        this._preProcessor = _preProcessor;
        this._postProcessor = _postProcessor;
        this._translations = _translations;
        __publicField(this, "_parser");
        this._parser = new MiniMessageParser(tagResolver);
      }
      //
      tags() {
        return this._parser.tagResolver;
      }
      strict() {
        return this._strict;
      }
      translations() {
        return this._translations;
      }
      deserialize(input, ...resolvers) {
        return this._parser.parseFormat(this._newContext(input, resolvers));
      }
      deserializeToTree(input, ...resolvers) {
        return this._parser.parseToTree(this._newContext(input, resolvers));
      }
      escapeTags(input, ...resolvers) {
        return this._parser.escapeTokens(this._newContext(input, resolvers));
      }
      stripTags(input, ...resolvers) {
        return this._parser.stripTokens(this._newContext(input, resolvers));
      }
      serialize(component) {
        return MiniMessageSerializer.serialize(this, component);
      }
      toHTML(component, target, elementFactory) {
        const renderer = exports.HtmlComponentRenderer.renderer(this._translations);
        if (target) {
          const writer2 = exports.HtmlWriter.dom(target, elementFactory);
          renderer.render(component, writer2);
        }
        const writer = exports.HtmlWriter.string();
        renderer.render(component, writer);
        return writer.toString();
      }
      _newContext(input, resolvers) {
        assertReal(input, "input");
        let extraTags;
        if (resolvers.length === 0) {
          extraTags = null;
        } else {
          extraTags = exports.TagResolver.builder().resolvers(...resolvers).build();
        }
        return new ContextImpl(
          this._strict,
          this._debugOutput,
          input,
          this,
          extraTags,
          this._preProcessor,
          this._postProcessor
        );
      }
    }
    class MiniMessageBuilderImpl {
      constructor(serializer) {
        __publicField(this, "_tagResolver", exports.StandardTags.defaults());
        __publicField(this, "_strict", false);
        __publicField(this, "_debug", null);
        __publicField(this, "_preProcessor", ((x) => x));
        __publicField(this, "_postProcessor", ((x) => x.compact()));
        __publicField(this, "_translations", exports.Translations.empty());
        if (serializer) {
          this._tagResolver = serializer._parser.tagResolver;
          this._strict = serializer._strict;
          this._debug = serializer._debugOutput;
          this._preProcessor = serializer._preProcessor;
          this._postProcessor = serializer._postProcessor;
          this._translations = serializer._translations;
        }
      }
      //
      tags(tags) {
        this._tagResolver = assertReal(tags, "tags");
        return this;
      }
      editTags(adder) {
        assertReal(adder, "adder");
        const builder = exports.TagResolver.builder().resolver(this._tagResolver);
        adder(builder);
        this._tagResolver = builder.build();
        return this;
      }
      strict(strict) {
        this._strict = !!strict;
        return this;
      }
      debug(debugOutput) {
        if (null !== debugOutput && typeof debugOutput !== "function")
          throw new TypeError(`'debugOutput' must be either null or a function (got ${debugOutput})`);
        this._debug = debugOutput;
        return this;
      }
      preProcessor(preProcessor) {
        assertReal(preProcessor, "preProcessor");
        this._preProcessor = preProcessor;
        return this;
      }
      postProcessor(postProcessor) {
        assertReal(postProcessor, "postProcessor");
        this._postProcessor = postProcessor;
        return this;
      }
      translations(translations) {
        assertReal(translations, "translations");
        this._translations = exports.Translations.of(translations);
        return this;
      }
      build() {
        return new MiniMessageImpl(
          this._tagResolver,
          this._strict,
          this._debug,
          this._preProcessor,
          this._postProcessor,
          this._translations
        );
      }
    }

    exports.MiniMessage = void 0;
    ((MiniMessage2) => {
      const INSTANCE = new MiniMessageBuilderImpl().build();
      function miniMessage() {
        return INSTANCE;
      }
      MiniMessage2.miniMessage = miniMessage;
      function builder() {
        return new MiniMessageBuilderImpl();
      }
      MiniMessage2.builder = builder;
    })(exports.MiniMessage || (exports.MiniMessage = {}));

    exports.AbstractComponentRenderer = AbstractComponentRenderer;
    exports.LegacyColorComponentRenderer = LegacyColorComponentRenderer;

}));
