import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Opcional: Especifique la versión del API si es necesario, aunque generalmente no es requerido.
      // apiVersion: 'v1beta', 
    }),
  ],
  // Especificar el modelo por defecto aquí es una buena práctica
  model: 'googleai/gemini-1.5-flash',
  // Opcional: Habilitar logs para depurar problemas de Genkit
  logLevel: 'debug', 
  // Opcional: Habilitar logs de telemetría para un monitoreo más profundo
  telemetry: {
    instrumentation: 'google',
  },
});
