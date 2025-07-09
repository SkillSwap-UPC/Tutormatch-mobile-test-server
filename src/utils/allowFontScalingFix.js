// src/utils/allowFontScalingFix.js
import { Text, TextInput } from 'react-native';

// Monkey patch que intercepta getters/setters
Object.defineProperty(Text, 'defaultProps', {
  get: function() {
    return this._customDefaultProps || { allowFontScaling: false };
  },
  set: function(props) {
    this._customDefaultProps = { ...props, allowFontScaling: false };
  }
});

Object.defineProperty(TextInput, 'defaultProps', {
  get: function() {
    return this._customDefaultProps || { allowFontScaling: false };
  },
  set: function(props) {
    this._customDefaultProps = { ...props, allowFontScaling: false };
  }
});

console.log("Applied allowFontScaling fix");