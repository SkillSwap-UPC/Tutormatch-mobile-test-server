// src/utils/deepFix.js
// Esta es una solución extrema que debe usarse sólo si otras fallan
const originalGet = Object.getOwnPropertyDescriptor(Object.prototype, 'allowFontScaling');

Object.defineProperty(Object.prototype, 'allowFontScaling', {
  get: function() {
    if (this === undefined || this === null) {
      console.log('Prevented undefined access to allowFontScaling');
      return false; // Devolver un valor por defecto cuando se intenta acceder desde undefined
    }
    return originalGet ? originalGet.get.call(this) : undefined;
  },
  set: function(value) {
    if (this === undefined || this === null) {
      console.log('Prevented undefined access to allowFontScaling');
      return;
    }
    if (originalGet && originalGet.set) {
      originalGet.set.call(this, value);
    } else {
      this._allowFontScaling = value;
    }
  },
  configurable: true
});

console.log("Applied deep fix for allowFontScaling");