// src/utils/TextFix.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// Create a safe wrapper for Text component
export const Text: React.FC<TextProps> = (props) => {
  // Use safe props with defaults, handle undefined/null cases
  const safeProps = {
    allowFontScaling: false,
    ...(props || {})
  };

  return (
    <RNText {...safeProps}>
      {safeProps.children}
    </RNText>
  );
};

export default Text;