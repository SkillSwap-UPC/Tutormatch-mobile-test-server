// src/utils/patchText.ts
import { Text, TextInput } from 'react-native';

export function patchReactNativeText() {
  try {
    // Patch Text component using type assertion
    if (Text && typeof Text === 'function') {
      const textComponent = Text as any;
      
      if (!textComponent.defaultProps) {
        textComponent.defaultProps = {};
      }
      textComponent.defaultProps.allowFontScaling = false;
    }
    
    // Patch TextInput component using type assertion
    if (TextInput && typeof TextInput === 'function') {
      const textInputComponent = TextInput as any;
      
      if (!textInputComponent.defaultProps) {
        textInputComponent.defaultProps = {};
      }
      textInputComponent.defaultProps.allowFontScaling = false;
    }
    
    console.log('Successfully patched React Native Text components');
  } catch (error) {
    console.warn('Failed to patch React Native Text components:', error);
  }
}