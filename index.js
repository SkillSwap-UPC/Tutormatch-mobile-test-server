// index.js
import { AppRegistry, Text, TextInput } from 'react-native';
import './src/utils/deepFix';

// Aplicar parche antes de cualquier otra importación
if (Text) {
  if (Text.defaultProps === undefined) {
    Text.defaultProps = {};
  }
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput) {
  if (TextInput.defaultProps === undefined) {
    TextInput.defaultProps = {};
  }
  TextInput.defaultProps.allowFontScaling = false;
}

// Importar y registrar la aplicación
import App from './src/main';
AppRegistry.registerComponent('tutormatch-mobile', () => App);