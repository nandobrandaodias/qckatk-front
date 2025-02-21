import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const PrimaryTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: { color: '#ec6613' },
      },
    },
  },
});
