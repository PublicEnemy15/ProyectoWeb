# 🎲 KITH
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Nunito&weight=700&pause=1000&color=B63DEF&width=435&lines=PROYECTO+PARA+TALLER+WEB;DOCENTE%3A+JOSE+ANTONIO+ESPINAL+TEVES" alt="Typing SVG" /></a>

>[!NOTE]
> 🧑‍🚀 **1.- Definición general**
<p align="justify">
Kith es una página web, enfocada en ser una vitrina digital para artistas y creadores de contenido visual como mangas, historietas e ilustraciones. Los usuarios pueden iniciar sesión y publicar sus obras bajo su nombre, fomentando así la promoción y visibilidad de su arte. Cada obra publicada incluye el nombre del autor, asegurando el reconocimiento adecuado. La web cuenta con una interfaz moderna, y se organiza en varias secciones clave, incluyendo una pestaña de comunidad, donde los usuarios pueden interactuar, y una sección de lo más popular, destacando los contenidos más vistos o valorados.
</p>

>[!IMPORTANT]
>Tener instalado node.js y el pnpm
>
<a href="https://nodejs.org/" rel="nofollow"><img src="https://camo.githubusercontent.com/ab2f6071dd849b60b0ac1934c145fdd092baf9e69363d8c804abc6f00a0d5538/68747470733a2f2f637573746f6d2d69636f6e2d6261646765732e64656d6f6c61622e636f6d2f62616467652f2d4e6f64652e6a732d3333393933333f7374796c653d666f722d7468652d6261646765266c6f676f3d6e6f64652e6a73266c6f676f436f6c6f723d7768697465" alt="Nodo.js" data-canonical-src="https://custom-icon-badges.demolab.com/badge/-Node.js-339933?style=for-the-badge&amp;logo=node.js&amp;logoColor=white" style="max-width: 100%;"></a>
<a href="https://pnpm.io/installation" rel="nofollow"><img src="https://camo.githubusercontent.com/047d735a434305f169d2e737eed3491fb6b784396b7ca3ff6d6f9fe09c38b8a6/68747470733a2f2f637573746f6d2d69636f6e2d6261646765732e64656d6f6c61622e636f6d2f62616467652f2d496e7374616c6c2532305061636b6167652d676f6c643f7374796c653d666f722d7468652d6261646765266c6f676f3d7061636b616765266c6f676f436f6c6f723d626c61636b" alt="instalar paquete" data-canonical-src="https://custom-icon-badges.demolab.com/badge/-Install%20Package-gold?style=for-the-badge&amp;logo=package&amp;logoColor=black" style="max-width: 100%;"></a>

## 🧞 Y ahora como me conecto a Git?
<p dir="auto">Para "conectarte" a Git deberas por lo menos configuirar lo basico, para lo cual dejare un video de como hacerlo "<a href="https://youtu.be/VdGzPZ31ts8?si=Dqdt-xA1JGxn8-KS&t=502" rel="nofollow">CONFIGURAR GIT</a>" una vez configuraste tus credenciales tendras que continuar clonando el repositorio de git del proyecto, la forma de clonar el repositorio es con el siguiente comando ejecuntandolo en Git:</p>

```sh
git clone https://github.com/PublicEnemy15/ProyectoWeb.git
```
continuaras ingresando a la carpeta que acabas de clonar con el siguiente comando:

```sh
Cd ProyectoWeb
```
Entonces ya estaras "conectado" al repositorio y trabajaras de forma `local`  pero no estás conectado como colaborador, para ello debo unirte como `coloaborador` por medio de tu `ID de Github`

## 🤖 Commandos (guia para los taraos)

Una vez que se te haya dado acceso como colaborador, deberás seguir estos pasos para trabajar correctamente en el proyecto y evitar errores.

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Nunito&weight=700&pause=1000&color=09FF96&width=435&lines=%F0%9F%90%B8+Comandos+iniciales" alt="Typing SVG" /></a>

| Comando                               | Acción                                                                 |
|---------------------------------------|------------------------------------------------------------------------|
| `git checkout`                        | Muestra en qué rama estás actualmente (por defecto suele ser `main`). |
| `git checkout -b nombredelarama`     | Crea una nueva rama con tu nombre y se cambia a ella automáticamente. Sustituye `nombredelarama` por tu nombre real (no uses uno falso). |
| `git branch`                          | Verifica en qué rama estás. Deberías ver marcada con `*` la que acabas de crear. |


<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Nunito&weight=700&pause=1000&color=04AAFF&width=435&lines=%F0%9F%94%84+Guardar+y+preparar+cambios" alt="Typing SVG" /></a>

Después de hacer cambios en los archivos del proyecto, usa los siguientes comandos:

| Comando                  | Descripción                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `git status`             | Muestra los archivos modificados, añadidos o eliminados.                    |
| `git add .`              | Añade todos los archivos modificados al área de preparación (staging).      |
| `git commit -m "Mensaje"`| Guarda tus cambios localmente con un mensaje que describa lo que hiciste.   |

<a href="#" style="text-decoration: none; font-family: monospace;"> <span style="color: red;">ejemplo</span> <span style="color: green;"> de</span> <span style="color: blue;"> commit</span> </a>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Nunito&weight=700&pause=1000&color=FF004B&width=435&lines=%F0%9F%94%B4+Ejemplo+de+commit" alt="Typing SVG" /></a>

```sh
git commit -m "Agregué el footer"
```
Con ello ya estarias trabajando en el proyecto de forma correcta ✅
---

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Comandos                   | Accion                                          |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

Tecnologias usadas para el proyecto:
<p align="left">
  <a href="https://astro.build"><img src="https://astro.badg.es/v2/built-with-astro/small.svg" alt="Built with Astro" width="192" height="32"></a>
<a target="_blank" rel="noopener noreferrer nofollow" href="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg"><img align="center" alt="Rafa-HTML" height="30" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" style="max-width: 100%;"></a>
<a target="_blank" rel="noopener noreferrer nofollow" href="https://camo.githubusercontent.com/abba501b95cfaf3f09d6547feb90ee82e26e92e273d23a057bd9d5a3e1e29b1c/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f64657669636f6e732f64657669636f6e406c61746573742f69636f6e732f7461696c77696e646373732f7461696c77696e646373732d6f726967696e616c2e737667"><img align="left" alt="Tailwind" title="Tailwind" width="30px" src="https://camo.githubusercontent.com/abba501b95cfaf3f09d6547feb90ee82e26e92e273d23a057bd9d5a3e1e29b1c/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f64657669636f6e732f64657669636f6e406c61746573742f69636f6e732f7461696c77696e646373732f7461696c77696e646373732d6f726967696e616c2e737667" data-canonical-src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" style="max-width: 100%;"></a>
  
</p>

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
