# API_Whatsapp — Guía de arranque rápido

Breve guía para que un compañero pueda clonar, inicializar y ejecutar el proyecto después de hacer `git pull`.

**Requisitos**

- Node.js 18+ (se probó en Node 22). Verifica con `node -v`.
- MySQL (local o remota) si vas a probar la persistencia.
- Git y un editor (VS Code recomendado).

**Archivos importantes**

- `src/app.js` — punto de entrada del servidor.
- `src/routes/api.routes.js` — rutas API.
- `src/controllers/*` — controladores (ordenes, admin, etc.).
- `.env` — variables de entorno (no está en el repo si `.gitignore` funciona).

1. Clonar y moverte al repo

```bash
git clone <tu-repo-url>
cd API_Whatsapp
```

2. Instalar dependencias

```bash
npm install
```

3. Crear y configurar el fichero `.env`

Crea un archivo `.env` en la raíz con al menos estas variables (rellena con tus valores):

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=mi_basedatos
```

Importante: no comites `.env`. Si el repo contiene credenciales por error, rota las credenciales.

4. Crear carpeta de uploads (Multer escribe aquí)

```bash
mkdir -p public/uploads
```

5. Arrancar en modo desarrollo

```bash
npm run dev
```

Esto usa `nodemon` y recarga al detectar cambios.

6. Endpoints útiles

- Form submit (landing): `POST /api/orders` — formulario principal.
- Admin (UI estática en `public/` que consume estas rutas):
  - `GET /api/admin/stats`
  - `GET /api/admin/comprobantes`
  - `GET /api/admin/cupos`
  - `GET /api/admin/export/daily.xlsx` (requiere `exceljs`)
  - `GET /api/admin/export/daily.pdf` (requiere `pdfkit`)

7. Dependencias para exportar (opcional)

Si quieres usar las exportaciones Excel/PDF asegúrate de tener instaladas:

```bash
npm install exceljs pdfkit
```

Si el servidor falla con `Cannot find module 'exceljs'` o `Cannot find module 'pdfkit'`, instala las deps y reinicia.

8. Problemas comunes y soluciones rápidas

- Error "Cannot find module 'exceljs'": ejecutar `npm install exceljs` y reiniciar.
- Error "argument handler must be a function" al arrancar: normalmente indica que una ruta apunta a un `undefined` — revisa que los controladores exporten las funciones usadas en `src/routes/api.routes.js`.
- Si `nodemon` reinicia continuamente: revisa si un proceso de escritura (logs, herramientas) está tocando archivos en la raíz; también puedes ejecutar `node src/app.js` para una ejecución sin recarga.

9. Tips para desarrollo

- Usa `POSTMAN` o `curl` para probar endpoints API.
- Para front-end estático: abre `http://localhost:3000` después de arrancar el servidor.
- Para depuración rápida de rutas problemáticas, revisa `src/controllers/admin.controller.js` y confirma que todas las funciones están exportadas.

10. Comandos útiles

```bash
# Instalar deps
npm install

# Arrancar en dev (nodemon)
npm run dev

# Ejecutar sin nodemon
node src/app.js
```

11. ¿Qué hacer si algo falla?

- Pega aquí la salida completa del terminal tras ejecutar `npm run dev`.
- Indica qué archivo modificaste recientemente si ves reinicios constantes.

---

Si quieres, puedo añadir una plantilla de `.env.example` o un script `setup.sh`/`setup.ps1` para automatizar estos pasos.
