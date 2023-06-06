# 01 Workspaces

En este ejemplo, vamos a ver como podemos trabajar con los workspaces de `npm`.

## Primeros pasos

Vamos a crear el `package.json` principal (podemos usar `npm init -y` para crearlo y luego editarlo):

_./package.json_

```json
{
  "name": "game-of-thrones",
  "private": true
}
```

Podemos indicarle que queremos un nuevo `workspace` dentro de una carpeta llamada `helpers`:

```bash
npm init -y -w ./helpers/prueba

```

> NOTA: podemos usar la opción `-w` o `--workspace` para indicarle que queremos crear un workspace.

Si observamos los cambios que se han producido, vemos que el `package.json` raiz, tiene una nueva sección llamada `workspaces`:

_./package.json_

```json
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": ["helpers/prueba"]
}
```

Que se ha creado un nuevo `package.json` dentro de la carpeta `helpers/prueba`.

Y además, se ha creado el `package-lock.json` y la carpeta `node_modules` (aunque aún no tenemos ninguna depenencia de terceros), con el enlace simbólico del proyecto `helpers/prueba`.

Para poder añadir varios proyectos al workspace de `helpers`, podemos editar el `package.json` raiz de esta forma:

_./package.json_

```diff
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": [
-    "helpers/prueba"
+    "helpers/*"
  ]
}

```

Ahora si hacemos un npm install, veremos como se actualiza nuestro `package-lock.json`:

```bash
npm install

```

Vamos a eliminar el proyect `prueba` y nos copiaremos los proyectos `house-helpers` y `motto-helpers` de la carpeta `00-boilerplate`.

Volvamos a hacer el install de nuevo:

```bash
npm install

```

Y ahora, si observamos el `package-lock.json`, veremos que se han añadido las dependencias de los proyectos `house-helpers` y `motto-helpers` y que se han creado los enlaces simbólicos correspondientes (`@my-org`).

> NOTA: además solamente tenemos una carpeta de `node_modules` en la raiz del proyecto.

## Proyecto house-helpers

Este proyecto está configurado como un proyecto interno, pensado para ser usado sin compilación, sino directamente poder hacer referencia a los ficheros del código fuente.

_./helpers/house-helpers/package.json_

```json
{
  ...
  "types": "src/index.ts",
  "type": "module",
  "main": "src/index.ts",
}

```

## Proyecto motto-helpers

Este proyecto está configurado como un proyecto para poder ser publicado como libreria en `npm`. Por tanto, tiene los comandos de `build` para tal propósito y el comando `start` para poder probarlo en local.

_./helpers/motto-helpers/package.json_

```json
{
  ...
  "types": "./dist/index.d.ts",
  "type": "module",
  "main": "./dist/motto-helpers.cjs.js",
  "module": "./dist/motto-helpers.es.js",
  "exports": {
    ".": {
      "import": "./dist/motto-helpers.es.js",
      "require": "./dist/motto-helpers.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "start": "run-p \"types -- --watch\" \"build -- --watch\"",
    "build": "vite build",
    "types": "tsc --emitDeclarationOnly"
  },

```

Este proyecto, necesita como dependencia el proyecto `house-helpers`, para no duplicar el modelo. Por tanto vamos a instalarlo usando el workspace:

```bash
npm install @my-org/house-helpers -w @my-org/motto-helpers

```

Actualizamos el código del proyecto:

_./helpers/motto-helpers/src/motto.helpers.ts_

```diff
+ import { House } from '@my-org/house-helpers';

export const MOTTOS: Record<House, string> = {
  stark: 'Winter is Coming!',
  targaryen: 'Fire and Blood!',
  lannister: 'Hear Me Roar!',
  baratheon: 'Ours is the Fury!',
};

export const getHouseMotto = (house: House): string => MOTTOS[house];

```

Parece que todo funciona correctamente, incluido el tipado. Vamos a probarlo ejecutando en modo local:

```bash
npm start -w @my-org/motto-helpers

```

> Comprobamos la compilación en el fichero `dist/motto-helpers.es.js`

Y añadimos una nueva casa:

_./helpers/house-helpers/src/house.models.ts_

```diff
export enum House {
  stark = 'stark',
  targaryen = 'targaryen',
  lannister = 'lannister',
+ baratheon = 'baratheon',
}

```

Vemos que nos damos cuenta del error en el fichero `motto.helpers.ts`:

_./helpers/motto-helpers/src/motto.helpers.ts_

```diff
import { House } from '@my-org/house-helpers';

export const MOTTOS: Record<House, string> = {
  stark: 'Winter is Coming!',
  targaryen: 'Fire and Blood!',
  lannister: 'Hear Me Roar!',
+ baratheon: 'Ours is the Fury!',
};

export const getHouseMotto = (house: House): string => MOTTOS[house];

```

## Aplicaciones web

Vamos a añadir un nuevo workspace para las aplicaciones webs:

_./package.json_

```diff
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": [
    "helpers/*",
+    "apps/*"
  ]
}

```

Y copiamos los proyectos `baratheon`, `lannister`, `stark` y `targaryen` de la carpeta `00-boilerplate` a la ruta `./apps/*`.

Ejecutamos el install:

```bash
npm install

```

Todas estas apps, van a tener como dependencia los proyectos `house-helpers` (para usar el método `getHouseTitle`) y `motto-helpers` (para usar el método `getHouseMotto`). Por tanto, vamos a instalarlos usando el workspace:

```bash
npm install @my-org/house-helpers @my-org/motto-helpers -w @my-org/house-baratheon

npm install @my-org/house-helpers @my-org/motto-helpers -w @my-org/house-lannister

npm install @my-org/house-helpers @my-org/motto-helpers -w @my-org/house-stark

npm install @my-org/house-helpers @my-org/motto-helpers -w @my-org/house-targaryen

```

Para poder arrancar todos los proyectos a la vez, vamos a instalar la siguiente libreria:

```bash
npm install npm-run-all --save-dev

```

> NOTA: Existe la opción de ejecutar `npm start --workspaces --if-present` pero en cuanto haya un proyecto en modo watch, se queda bloqueado, ya que npm solamente ejecuta en serie los comandos.

Actualizamos el `package.json` raiz:

_./package.json_

```diff
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": [
    "helpers/*",
    "apps/*"
  ],
+ "scripts": {
+   "start": "run-p start:*",
+   "start:motto-helpers": "npm start -w @my-org/motto-helpers",
+   "start:stark": "npm start -w @my-org/house-stark",
+   "start:targaryen": "npm start -w @my-org/house-targaryen",
+   "start:lannister": "npm start -w @my-org/house-lannister",
+   "start:baratheon": "npm start -w @my-org/house-baratheon"
+ },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}

```

Actualicemos los proyectos:

_./apps/stark/src/app.component.tsx_

```diff
import './app.css';
import logo from '/logo.png';
+ import { House, getHouseTitle } from '@my-org/house-helpers';
+ import { getHouseMotto } from '@my-org/motto-helpers';

function App() {
  return (
    <>
      <img src={logo} className="logo" />
+     <h1>{getHouseTitle(House.stark)}</h1>
+     <h2>{getHouseMotto(House.stark)}</h2>
    </>
  );
}

export default App;

```

> NOTAS:
>
> Podemos ver los cambios si actualizamos el fichero `src/motto-helpers.ts`.
>
> Los demás proyectos ya tienen los imports incluidos.
