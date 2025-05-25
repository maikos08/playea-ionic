# 🧭 Tour de la App **Playea**

Playea es una aplicación desarrollada con **Angular + Ionic**, con integración a **Firebase** y soporte para bases de datos locales vía SQLite (en dispositivos móviles). A continuación, exploramos su arquitectura y cómo funciona cada parte.

---

## 🏗️ Estructura General

```
src/
│
├── app/
│   ├── components/           # Componentes reutilizables (cards, headers, etc.)
│   ├── layout/               # Layouts con o sin cabecera
│   ├── models/               # Interfaces de datos (User, Beach, Comment)
│   ├── pages/                # Páginas principales de la app
│   ├── services/             # Lógica de negocio y conexión a Firebase/local
│   ├── constants/            # Datos estáticos
│   ├── utils/                # Funciones utilitarias (validaciones, toggles)
│   ├── app.routes.ts         # Rutas principales
│   └── app.component.ts      # Entrada de la app
```

---

## 🧩 Componentes Clave

### 🔹 `BeachCardComponent`

Muestra un resumen visual de una playa, incluyendo bandera azul, nombre, isla y longitud.

### 🔹 `TitlePageComponent`

Componente para mostrar títulos con imagen de fondo en páginas como "Favoritos".

### 🔹 `UserHeaderComponent`

Gestiona la visibilidad del popup de usuario (login/register vs avatar), foto de perfil y logout.

### 🔹 `HeaderComponent`

Contiene la cabecera principal con navegación y avatar del usuario.

---

## 🧱 Layouts

### 🧭 `MainLayoutComponent`

Contenedor principal para páginas con cabecera (`/`, `/beach/:slug`, `/favorites`).

### 🔒 `NoHeaderLayoutComponent`

Diseñado para páginas como login y registro, sin cabecera.

---

## 📄 Páginas

### 🏠 `HomeComponent`

Página de inicio con banner, buscador (opcional) y grilla de playas.

### ⭐ `FavoritesComponent`

Muestra playas guardadas localmente (SQLite en móvil, `localStorage` en web).

### 📍 `BeachDetailComponent`

Muestra detalles completos de una playa y permite dejar comentarios (si el usuario está logueado).

### 👤 `ProfileComponent`

Muestra los datos del usuario actual, permite editar nombre, apellido y cambiar foto.

### 🔐 `LoginComponent` / `RegisterComponent`

Páginas de autenticación integradas con Firebase Auth.

---

## 🔄 Rutas (`app.routes.ts`)

```ts
[
  { path: "", component: MainLayoutComponent, loadChildren: () => import("./pages/pages.routes") },
  { path: "auth", component: NoHeaderLayoutComponent, loadChildren: () => import("./pages/auth/auth.routes") },
  { path: "**", redirectTo: "/" },
];
```

---

## 🔥 Firebase

Se utiliza para:

- **Autenticación (Auth)**
- **Base de datos (Firestore)** para usuarios, playas y comentarios
- Manejo reactivo de estado con `authState` y servicios como `AuthStateService`.

---

## 💬 Comentarios

- Asociados a usuarios y playas.
- Mostrados en el detalle de playa con posibilidad de editar y eliminar si el usuario es el autor.

---

## 💾 Base de Datos Local

- Implementada con **SQLite** (capacitor-community/sqlite).
- En web se simula con `localStorage`.
- Usada para guardar **playas favoritas**.

---

## 📥 Servicios

- `AuthService`: Registro, login, logout, edición de perfil.
- `BeachService`: Obtener, crear, editar y eliminar playas.
- `CommentService`: CRUD para comentarios y agregación de datos relacionados.
- `DatabaseService`: Persistencia local (favoritos).
- `PopupService`: Control de popups y estado del usuario.
- `AuthStateService`: Gestión del usuario logueado a nivel global.

---

## 🧪 Validaciones y Utilidades

- Validaciones reactivas en formularios (`isRequired`, `hasEmailError`, etc.).
- `togglePasswordView`: Mostrar/ocultar contraseña con íconos.

---

## 🧠 Conclusión

Esta aplicación está pensada para ser **escalable, responsive y modular**, ofreciendo:

- Experiencia de usuario cuidada con Ionic.
- Seguridad y persistencia mediante Firebase.
- Soporte para datos offline.
- Componentes reutilizables y layouts flexibles.

¡Lista para desplegarse como PWA o app nativa! 🚀

## 📹 vídeo presentación

https://drive.google.com/file/d/1TK3PLG2AWPtaMwfhc00BrqHmChREgDtg/view?usp=sharing

