# 🚀 SocialApp - Backend API

Backend para red social desarrollado con **TypeScript**, **Apollo Server (GraphQL)**, **Express** y **MySQL**. Diseñado bajo una arquitectura modular desacoplada, con autenticación segura, procesamiento multimedia, notificaciones y suite de pruebas automatizadas.

---

## 🎯 Sobre este Proyecto

Este proyecto nació con el objetivo de llevar el backend a un nivel más profesional y moderno. Me sirvió como un excelente espacio de aprendizaje para dominar **GraphQL** (migrando completamente desde REST), profundizar en el uso avanzado de **TypeScript** y el tipado estático, y aplicar mejores prácticas de arquitectura modular, rendimiento y testing en Node.js.
---

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** TypeScript
- **API Engine:** GraphQL (Apollo Server v4 + Express 5)
- **Base de Datos:** MySQL (Driver `mysql2`)
- **Autenticación & Seguridad:** JWT (JSON Web Tokens), `bcrypt`, `cookie-parser`, `cors`
- **Procesamiento de Archivos:** `multer`, `sharp` (optimización/conversión a WebP)
- **Validación de Datos:** `zod`
- **Logging & Monitoreo:** `winston`, `@sentry/node`
- **Testing:** `vitest`, `sinon`
- **Mails:** `nodemailer`
---

## ✨ Módulos y Funcionalidades (MVP)

### 🔑 Autenticación y Usuarios (`auth` / `users`)
- Registro e inicio de sesión seguro con contraseñas hasheadas (`bcrypt`) y tokens JWT.
- Gestión de perfil de usuario e información de cuenta.

### 📝 Publicaciones y Contenido (`posts`)
- Creación, actualización y eliminación de publicaciones.
- **Paginación** eficiente de feed y publicaciones.
- **Búsqueda y Filtrado** de contenido.

### ❤️ Interacciones (`likes` / `comments`)
- Sistema de likes/reacciones en publicaciones.
- Comentarios en publicaciones.

### 🔔 Notificaciones (`notifications`)
- Generación de notificaciones en tiempo real/eventos para interacciones de usuarios (likes, comentarios, solicitudes).

### 👥 Amistades (`friends`)
- Sistema de gestión de amistades y solicitudes.

### 🖼️ Subida de Medios (`uploads`)
- Carga de imágenes optimizadas automáticamente mediante **Sharp**.
---

## 🏗️ Estructura del Proyecto

```text
Backend/
├── src/
│   ├── config/          # Configuración de BD, env, sentry y winston
│   ├── modules/         # Arquitectura modular (auth, posts, users, etc.)
│   │   ├── auth/        # Resolvers, typedefs, servicios y modelos de Auth
│   │   ├── posts/       # Resolvers, typedefs, servicios y modelos de Posts
│   │   └── ...          # Resto de módulos
│   ├── shared/          # Middlewares, utilidades, helpers globales
│   └── index.ts         # Punto de entrada y servidor Apollo
├── tests/               # Pruebas unitarias e integración
├── uploads/             # Directorio de archivos subidos (local/dev)
├── .gitignore
├── package.json
└── tsconfig.json
```


