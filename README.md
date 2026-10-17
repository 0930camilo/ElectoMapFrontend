# ElectoMap Frontend

Frontend standalone con Angular 20 para la gestión de la campaña.

## Desarrollo

```bash
npm install
npm start
```

Angular sirve la aplicación en `http://localhost:4200`. El proxy de desarrollo (`proxy.conf.json`) reenvía las rutas `/api` a `http://localhost:8080`, evitando configurar la URL del backend en el código.

## Configuración de entorno

Los valores por entorno están en `src/environments/environment.ts` y `src/environments/environment.prod.ts`. `apiUrl` está vacío para usar rutas relativas `/api`; en producción, el servidor web debe reenviar esas rutas al backend.

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
