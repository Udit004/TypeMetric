# TypeMetric

<p align="center">
	<strong>Advanced typing speed test and analytics platform built for focused performance training.</strong>
</p>

<p align="center">
	<a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs"></a>
	<a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white"></a>
	<a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
	<a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"></a>
</p>

---

## Why TypeMetric?

TypeMetric is designed for people who want more than a basic typing test.
It combines a distraction-free typing experience with real-time metrics to help you improve deliberately.

### Core highlights

- Real-time WPM updates
- Live accuracy tracking
- Mistake counting and instant feedback
- Responsive keyboard-first interface
- Clean architecture with reusable typing engine modules

---

## Preview

The current interface focuses on clarity, speed, and performance:

- Modern hero layout
- Glowing gradient accents and subtle grid atmosphere
- Session analytics cards (WPM, Accuracy, Time, Mistakes)

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Linting | ESLint 9 |

---

## Getting started

### 1) Clone the repository

```bash
git clone https://github.com/Udit004/TypeMetric.git
cd TypeMetric
```

### 2) Install dependencies

```bash
npm install
```

### 3) Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Available scripts

```bash
npm run dev    # Start local development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

---

## Project structure

```text
src/
	app/
		layout.tsx
		page.tsx
		globals.css
	features/
		typing-engine/
			components/
			hooks/
			lib/
			types/
```

### Typing engine modules

- components: UI blocks like input, renderer, cursor, and stats
- hooks: typing and timer logic
- lib: metrics, parser, and validation utilities
- types: shared typing state contracts

---

## Metrics logic

TypeMetric uses standard typing formulas:

- WPM = (typed characters / 5) / elapsed minutes
- Accuracy = (correct characters / total typed characters) x 100

This gives reliable and familiar performance numbers while typing.

---

## SEO and metadata

The app includes production-ready metadata setup in the root layout:

- Search description and keywords
- Open Graph settings
- Twitter card metadata
- Robots indexing configuration

---

## Roadmap

- Custom text libraries
- Difficulty presets
- Session history and trends
- Personal best tracking
- Multiplayer typing battles

---

## Contributing

Contributions and ideas are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

No license has been added yet.
If you plan to open-source this project, add a LICENSE file (for example, MIT).
