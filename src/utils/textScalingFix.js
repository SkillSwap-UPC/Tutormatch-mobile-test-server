import { Text, TextInput } from 'react-native';

// Fix for Text component
if (Text) {
  if (!Text.defaultProps) {
    Text.defaultProps = {};
  }
  Text.defaultProps.allowFontScaling = false;
}

// Fix for TextInput
if (TextInput) {
  if (!TextInput.defaultProps) {
    TextInput.defaultProps = {};
  }
  TextInput.defaultProps.allowFontScaling = false;
}

console.log('Text scaling fix applied');