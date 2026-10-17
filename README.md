# ElectoMap Frontend

Frontend standalone con Angular 20 para la gestión de la campaña.

## Desarrollo

```bash
npm install
npm start
```

Angular sirve la aplicación en `http://localhost:4200`. El proxy de desarrollo (`proxy.conf.json`) reenvía las rutas `/api` a `http://localhost:8080`, evitando configurar la URL del backend en el código.

## API y despliegue

Los valores por entorno están en `src/environments/environment.ts` y `src/environments/environment.prod.ts`. El entorno local deja `apiUrl` vacío y `proxy.conf.json` reenvía `/api` a `http://localhost:8080`. El entorno de producción usa `https://electocotainer.vercel.app` como base; las rutas se normalizan al construirlas para no generar `//api`.

Para el despliegue Cloudflare Pages + Vercel, configura en los ajustes de entorno del proyecto backend de Vercel:

```text
CORS_ALLOWED_ORIGINS=https://electomap.pages.dev,https://www.electomap.pages.dev
```

Incluye solo dominios que realmente sirvan el frontend. Si Vercel ya tiene esta variable, reemplaza el valor predeterminado del backend y debe contener el origen de Pages exactamente, sin ruta final. Vuelve a desplegar el backend tras cambiarla. La app autentica con JWT en el encabezado `Authorization`, no con cookies; por eso no requiere CORS con credenciales. Después ejecuta `npm run build` y publica el nuevo contenido de `dist/ElectoMapFrontend/browser` en Cloudflare Pages. Si el navegador sigue usando el bundle anterior, purga la caché y comprueba en Network que la URL sea `https://electocotainer.vercel.app/api/...` con una sola barra antes de `api`.

## Organización del código

```text
src/
├── environments/
└── app/
    ├── core/
    │   ├── interceptors/
    │   └── services/
    ├── module/
    │   ├── auth/model/
    │   ├── cabeceras/model/
    │   ├── dashboard/model/
    │   ├── importaciones/model/
    │   ├── lideres/model/
    │   └── votantes/model/
    └── shared/
        ├── enums/
        └── interface/
```

Los modelos específicos se organizan por dominio y los servicios de autenticación, API e interceptores están en `core`. La interfaz actual sigue concentrada en el componente raíz `app.ts`/`app.html`; nuevas páginas y componentes pueden extraerse a `module/<dominio>/page` y `components/` al separar cada flujo.

## Build y pruebas

```bash
npm run build
npm test
```
