# 02 Turborepo

En este ejemplo, vamos a incluir `turborepo` al ejemplo anterior para ver las mejoras que nos aporta.

## Primeros pasos

Vamos a instalar `turborepo` en el proyecto raiz:

```bash
npm uninstall npm-run-all --save-dev

npm install turbo --save-dev

```

> OJO que NO es turborepo el nombre del paquete, sino turbo.

El fichero más importante que vamos a crear ahora, es `turbo.json` donde definimos:

_./turbo.json_

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "cache": false,
      "persistent": true
    }
  }
}

```

> NOTAS
>
> - `cache`: por defecto cachea los resultados de los comandos, pero en este caso no lo necesitamos.
>
> - `persistent`: pensado para procesos que se ejecuten en modo "watch" y que dependan unos de otros, lo habilitamos para que no se queden procesos sin ejecutar.

Actualizamos los scripts del `package.json`:

_./package.json_

```diff
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": [
    "helpers/*",
    "apps/*"
  ],
  "scripts": {
-   "start": "run-p start:*",
+   "start": "turbo start"
-   "start:motto-helpers": "npm run build:watch -w @my-org/motto-helpers",
-   "start:stark": "npm start -w @my-org/house-stark",
-   "start:targaryen": "npm start -w @my-org/house-targaryen",
-   "start:lannister": "npm start -w @my-org/house-lannister",
-   "start:baratheon": "npm start -w @my-org/house-baratheon"
  },
  "devDependencies": {
    "turbo": "^1.10.1"
  }
}

```

Vamos a probarlo:

```bash
npm start

```

Vamos a añadir ahora el comando `build`, en este caso, antes de hacer la build, queremos ejecutar el comando `types` por si ocurre algún error, cortar el proceso:

_./turbo.json_

```diff
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "cache": false,
      "persistent": true
    },
+   "types": {
+     "outputs": ["dist/**/*"]
+   },
+   "build": {
+     "outputs": ["dist/**/*"],
+     "dependsOn": ["types"]
+   }
  }
}

```

Lo añadimos al `package.json`:

_./pacakge.json_

```diff
{
  "name": "game-of-thrones",
  "private": true,
  "workspaces": [
    "helpers/*",
    "apps/*"
  ],
  "scripts": {
    "start": "turbo start",
+   "build": "turbo build"
  },
  "devDependencies": {
    "turbo": "^1.10.1"
  }
}

```

Vamos a probarlo:

```bash
npm run build

```

> NOTAS:
>
> Ejecutar varias veces para probar la cache.
>
> Hacer que falle la build para ver que se corta el proceso.

En el caso en el que tengamos más de un proyecto donde se necesite hacer la build, y dependan unos de otros, automáticamente resolverá el orden de ejecución segun las dependencias.

Vamos a hacer que el proyecto `house-helpers` ejecute una `build`:

```bash
npm install npm-run-all vite --save-dev -w @my-org/house-helpers

```

_./helpers/house-helpers/package.json_

```diff
{
  "name": "@my-org/house-helpers",
  "version": "1.0.0",
- "private": true,
+ "private": false,
  "author": "Lemoncode",
  "license": "MIT",
- "types": "src/index.ts",
- "type": "module",
- "main": "src/index.ts",
+ "files": [
+   "dist"
+ ],
+ "types": "dist/index.d.ts",
+ "type": "module",
+ "main": "dist/house-helpers.cjs.js",
+ "module": "dist/house-helpers.es.js",
+ "exports": {
+   ".": {
+     "import": "./dist/house-helpers.es.js",
+     "require": "./dist/house-helpers.cjs.js",
+     "types": "./dist/index.d.ts"
+   }
+ },
+ "scripts": {
+   "build:watch": "run-p \"types -- --watch\" \"build -- --watch\"",
+   "build": "vite build",
+   "types": "tsc --emitDeclarationOnly"
+ },
  "devDependencies": {
    "npm-run-all": "^4.1.5",
    "typescript": "^5.1.3",
    "vite": "^4.3.9"
  }
}

```

> NOTA: El proyecto ya tenía configurado el proyecto vite.config.ts

Por último, para que `turborepo` sepa que tiene que ejecutar la build de `house-helpers` antes de la build de `motto-helpers`, tenemos que indicarlo como dependencia en el fichero `turbo.json`:

_./turbo.json_

```diff
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "cache": false,
      "persistent": true
    },
    "types": {
      "outputs": ["dist/**/*"],
+     "dependsOn": ["^build"]
    },
    "build": {
      "outputs": ["dist/**/*"],
-     "dependsOn": ["types"]
+     "dependsOn": ["^build", "types"]
    }
  }
}

```

> NOTA: Con el símbolo `^`, le decimos que primero resuelva el comando `build` de las dependencias, y después el comando del proyecto actual.

Vamos a probarlo:

```bash
npm run build

```

Sabiendo lo anterior, antes de ejecutar el comando `start` deberíamos ejecutar la build de sus dependencias (por ejemplo si borramos la carpeta `dist` de los helpers):

_./turbo.json_

```diff
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "cache": false,
      "persistent": true,
+     "dependsOn": ["^build"]
    },
    "types": {
      "outputs": ["dist/**/*"],
      "dependsOn": ["^build"]
    },
    "build": {
      "outputs": ["dist/**/*"],
      "dependsOn": ["^build", "types"]
    }
  }
}

```

¿Y si quiero ejecutar la `build` en modo `watch` junto al `start`?:

_./turbo.json_

```diff
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "types": {
      "outputs": ["dist/**/*"],
      "dependsOn": ["^build"]
    },
    "build": {
      "outputs": ["dist/**/*"],
      "dependsOn": ["^build", "types"]
    },
+   "build:watch": {
+     "cache": false,
+     "persistent": true
+   }
  }
}

```

_./package.json_

```diff
...
  "scripts": {
-   "start": "turbo start",
+   "start": "turbo start build:watch --concurrency 13",
    "build": "turbo build"
  },
```

> NOTAS:
>
> No podemos poner procesos en modo watch como dependencias en `dependsOn` porque quedaria bloqueado el proceso.
>
> concurrency: por defecto el máximo de procesos peristentes concurrentes es de 10.

Por último, si por ejemplo solamente queremos ejecutar un comando para ciertos proyectos, podemos hacerlo utilizando el flag de `filter`:

```bash
npm start -- --filter=@my-org/house-stark --filter='./helpers/*'

```
