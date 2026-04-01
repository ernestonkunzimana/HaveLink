<div align="center">

# 🏗️ PCS-B-LTD Construction Management Platform

**Professional Construction Services — Business Limited**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js%2013-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ernestonkunzimana/pcs-b-ltd?style=flat-square)](https://github.com/ernestonkunzimana/pcs-b-ltd/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ernestonkunzimana/pcs-b-ltd?style=flat-square)](https://github.com/ernestonkunzimana/pcs-b-ltd/network/members)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/ernestonkunzimana/pcs-b-ltd/pulls)

*A full-stack, enterprise-grade construction project management platform with real-time collaboration, ESG tracking, multi-language support, and offline-first PWA architecture.*

[🚀 Live Demo](#) · [📋 Documentation](#table-of-contents) · [🐛 Report Bug](https://github.com/ernestonkunzimana/pcs-b-ltd/issues) · [✨ Request Feature](https://github.com/ernestonkunzimana/pcs-b-ltd/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [ESG & Sustainability](#-esg--sustainability)
- [Internationalization](#-internationalization)
- [Docker Deployment](#-docker-deployment)
- [About the Developer](#-about-the-developer)
- [Portfolio — All Projects](#-portfolio--all-projects)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**PCS-B-LTD** is a comprehensive, enterprise-grade **Construction Management Platform** built to streamline every aspect of construction project operations. It brings together project managers, field workers, clients, and administrators under a single, real-time collaborative environment.

The platform is designed for construction companies operating across **East Africa and beyond**, with first-class support for low-connectivity environments, multiple languages, and ESG (Environmental, Social & Governance) compliance reporting.

> 🏆 **Highlights:** 500+ projects managed · 1,200+ team members · 12+ countries served · 5 languages supported

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Access Control** | Secure authentication with granular permissions for Admins, Managers, Workers, and Clients |
| 📊 **Project Management** | End-to-end project tracking with milestones, Gantt-style timelines, and real-time updates |
| 📦 **Inventory Management** | Track materials, equipment, and supply chains across multiple sites |
| 💰 **Financial Management** | Invoice generation, payment tracking, and financial transaction reporting |
| 🌱 **ESG Metrics** | Built-in environmental, social, and governance compliance reporting |
| 🌍 **Multi-Language Support** | English, Swahili, French, Kinyarwanda, and Luganda |
| 📱 **Progressive Web App** | Install on any device; works seamlessly offline with background sync |
| ⚡ **Real-Time Collaboration** | Instant notifications and live updates via Socket.io |
| 📋 **Audit Logging** | Complete activity trail for compliance and accountability |
| 🎮 **Gamification** | Engagement features and leaderboards to boost team productivity |

---

## 🛠️ Tech Stack

### Frontend
```
Next.js 13 (App Router)   →  Full-stack React framework with SSR/SSG
React 18                  →  UI component library
TypeScript 5              →  Type-safe development
Tailwind CSS 3            →  Utility-first styling
shadcn/ui + Radix UI      →  Accessible, composable component system
Framer Motion             →  Smooth animations and transitions
Recharts                  →  Data visualization and dashboards
Socket.io Client          →  Real-time bidirectional communication
next-i18next              →  Internationalization (i18n)
next-pwa                  →  Progressive Web App capabilities
React Hook Form + Zod     →  Form management and validation
```

### Backend
```
Node.js / Express         →  REST API server
Supabase (PostgreSQL)     →  Relational database with real-time subscriptions
Socket.io                 →  WebSocket server for live updates
JWT Authentication        →  Secure token-based auth
```

### DevOps & Infrastructure
```
Docker + Docker Compose   →  Containerized deployment
Nginx                     →  Reverse proxy and static asset serving
Workbox                   →  Service worker and offline caching strategy
```

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  Next.js 13 App (PWA)  ←→  Socket.io Client                │
│  React 18 + TypeScript + Tailwind CSS                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────┐
│                        API LAYER                            │
│  Express REST API  ←→  Socket.io Server                     │
│  JWT Auth  ·  Role-Based Middleware  ·  Audit Logging       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      DATA LAYER                             │
│  Supabase (PostgreSQL)                                      │
│  Projects · Tasks · Inventory · Invoices · ESG Metrics      │
│  Transactions · Audit Logs · Users & Roles                  │
└─────────────────────────────────────────────────────────────┘
```

### Role Hierarchy

```
Admin ──────► Full system control, user management, analytics
  │
Manager ────► Project creation, task assignment, reporting
  │
Worker ─────► Task updates, time logging, field reporting
  │
Client ─────► Project status visibility, invoice review
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Docker** (optional, for containerized deployment)
- A **Supabase** project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ernestonkunzimana/pcs-b-ltd.git
cd pcs-b-ltd

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and API keys

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
JWT_SECRET=your_jwt_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Database Setup

```bash
# Apply the database schema to your Supabase project
psql -h your_supabase_host -U postgres -d postgres -f pcs_b_ltd_schema.sql
```

---

## 💡 Usage

### Running the Full Stack

```bash
# Frontend (Next.js)
npm run dev

# Backend API (in a separate terminal)
cd backend && npm install && npm run dev
```

### Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

### Building for Production

```bash
npm run build
npm start
```

---

## 📸 Screenshots

### Landing Page
The platform features a modern, animated landing page showcasing key features, statistics, and a clear call-to-action for different user roles.

### Dashboard Views
- **Admin Dashboard** — System-wide analytics, user management, audit logs
- **Manager Dashboard** — Project overview, team assignments, ESG reports
- **Worker Dashboard** — Task list, time tracking, field updates
- **Client Dashboard** — Project status, invoice history, payment tracking

---

## 🌱 ESG & Sustainability

PCS-B-LTD integrates **Environmental, Social & Governance (ESG)** tracking directly into project workflows:

- 🌿 **Environmental** — Carbon footprint estimates, material waste logging, energy consumption tracking
- 🤝 **Social** — Worker safety records, community impact assessments, diversity metrics
- ⚖️ **Governance** — Compliance checklists, audit trails, regulatory reporting

---

## 🌍 Internationalization

The platform supports 5 languages out of the box:

| Language | Code | Region |
|---|---|---|
| English | `en` | International |
| Swahili | `sw` | East Africa |
| French | `fr` | Francophone Africa |
| Kinyarwanda | `rw` | Rwanda |
| Luganda | `lg` | Uganda |

Language switching is available in-app without page reload.

---

## 🐳 Docker Deployment

```bash
# Build the Docker image
docker build -t pcs-b-ltd .

# Run with Docker Compose (recommended)
docker-compose up -d

# View logs
docker-compose logs -f
```

The `docker-compose.yml` orchestrates the **Next.js frontend**, **Express backend**, and **Nginx reverse proxy** in a single command.

---

## 👨‍💻 About the Developer

<div align="center">

### Ernest Nkunzimana

**Full-Stack Software Engineer & Innovator**
*Building technology solutions for Africa and beyond*

[![GitHub](https://img.shields.io/badge/GitHub-ernestonkunzimana-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ernestonkunzimana)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ernest%20Nkunzimana-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ernestonkunzimana)

</div>

Ernest Nkunzimana is a passionate full-stack software engineer with deep expertise in building scalable, real-world applications across **healthcare, fintech, IoT, blockchain, and construction technology**. With a strong foundation in both frontend and backend development, Ernest delivers end-to-end solutions from system design to production deployment.

**Core Competencies:**
- 🚀 Full-Stack Web Development (React, Next.js, Node.js, Django, Python)
- 📱 Mobile Development (React Native, TypeScript)
- ☁️ Cloud & DevOps (Docker, Azure, CI/CD, Nginx)
- 🔗 Blockchain & Smart Contracts (Solidity, ICP, ECDSA)
- 🤖 AI/ML Integration (Python, Federated Learning, NLP)
- 🏥 Healthcare Systems (HL7 FHIR, EHR/EMR, Telemedicine)
- 🌐 IoT & Embedded Systems (Hardware integration, PCB design)

---

## 🗂️ Portfolio — All Projects

> Below is a comprehensive list of projects built and maintained by **Ernest Nkunzimana**. Each project links directly to its GitHub repository.

### 🏗️ Enterprise & Business Applications

| Project | Description | Tech | Status |
|---|---|---|---|
| [**pcs-b-ltd**](https://github.com/ernestonkunzimana/pcs-b-ltd) | Professional Construction Services Management Platform with real-time updates, ESG tracking, multi-language support, and PWA | TypeScript · Next.js · Supabase | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**TradeTrack-Pro-MobileApp**](https://github.com/ernestonkunzimana/TradeTrack-Pro-MobileApp) | Mobile trading and inventory tracking application | TypeScript · React Native | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**PCB-P-SOLUTIONS**](https://github.com/ernestonkunzimana/PCB-P-SOLUTIONS) | Business management solution for Benjamin Sekabuga | — | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**PCS-BLTD**](https://github.com/ernestonkunzimana/PCS-BLTD) | Additional PCS-B-LTD business tooling | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**RFI**](https://github.com/ernestonkunzimana/RFI) | Rwanda Football Intelligence platform | TypeScript | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |

### 🏥 Healthcare & Biomedical Systems

| Project | Description | Tech | Status |
|---|---|---|---|
| [**africa-healthcare**](https://github.com/ernestonkunzimana/africa-healthcare) | Africa Healthcare Solution integrating AI, VR, AR, and Blockchain for accessible care | Python · AI/ML | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**National-Health-API-Gateway**](https://github.com/ernestonkunzimana/National-Health-API-Gateway) | Rwanda's national health insurance API gateway — bridging hospitals, insurers & regulators | TypeScript | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**ubuntu-Systems**](https://github.com/ernestonkunzimana/ubuntu-Systems) | Ubuntu Healthcare Systems for community-centred care delivery | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**Ubuntu_health_Systems**](https://github.com/ernestonkunzimana/Ubuntu_health_Systems) | Extended Ubuntu health system modules | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**mhealthllc**](https://github.com/ernestonkunzimana/mhealthllc) | Mobile health platform for remote patient monitoring | TypeScript | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**HealthGuardian**](https://github.com/ernestonkunzimana/HealthGuardian) | Personal health guardian and wellness tracking platform | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**VitaVerse**](https://github.com/ernestonkunzimana/VitaVerse) | Immersive health and wellness virtual platform | — | ![In Progress](https://img.shields.io/badge/Status-In%20Progress-yellow) |
| [**HSP-PCB-board**](https://github.com/ernestonkunzimana/HSP-PCB-board) | Human-Sovereign Privacy & Security PCB — user-owned root-of-trust hardware module for smart devices | Hardware · PCB | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |

### 🤖 AI, ML & Emerging Technologies

| Project | Description | Tech | Status |
|---|---|---|---|
| [**SEFC-Net**](https://github.com/ernestonkunzimana/SEFC-Net-Self-Evolving-Federated-Cognitive-Network) | Self-Evolving Federated Cognitive Network — autonomous federated intelligence framework | Python · Federated Learning | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**nexus-edge-systems**](https://github.com/ernestonkunzimana/nexus-edge-systems) | Africa's Digital Future at the intersection of AI, IoT, Blockchain, and Space Technology | TypeScript · AI | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**building-a-super-simple-chatbot-using-openAI-s-API**](https://github.com/ernestonkunzimana/building-a-super-simple-chatbot-using-openAI-s-API) | OpenAI-powered conversational chatbot | TypeScript · OpenAI | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**ChatterBotDapp_new**](https://github.com/ernestonkunzimana/ChatterBotDapp_new) | Decentralized chatbot application | TypeScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |

### 🔗 Blockchain & Web3

| Project | Description | Tech | Status |
|---|---|---|---|
| [**Proposal-Contract-project**](https://github.com/ernestonkunzimana/Proposal-Contract-project) | Decentralized voting and proposal system with Solidity smart contracts | Solidity | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**Smart_Counter_Contract**](https://github.com/ernestonkunzimana/Smart_Counter_Contract) | Solidity smart contract demonstrating counter patterns | Solidity | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**ICP-Smart-Contract-101**](https://github.com/ernestonkunzimana/ICP-Smart-Contract-101) | Internet Computer Protocol smart contract from Dacade | TypeScript · ICP | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**secure-ecdsa-wallet**](https://github.com/ernestonkunzimana/secure-ecdsa-wallet) | Secure ECDSA cryptographic wallet implementation | JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |

### 🌍 Social Impact & Civic Technology

| Project | Description | Tech | Status |
|---|---|---|---|
| [**CivicSignal**](https://github.com/ernestonkunzimana/CivicSignal) | Secure civic engagement platform for anonymous policy feedback and digital town halls | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**ExploreRwanda**](https://github.com/ernestonkunzimana/ExploreRwanda) | AI-powered tourism platform for Rwanda using AR/VR and blockchain | JavaScript | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**Rwanda360**](https://github.com/ernestonkunzimana/Rwanda360) | 360° immersive content platform for Rwanda | — | ![In Progress](https://img.shields.io/badge/Status-In%20Progress-yellow) |
| [**HarvestLink-Marketplace**](https://github.com/ernestonkunzimana/HarvestLink-Marketplace) | Agricultural marketplace connecting farmers to buyers | TypeScript | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |
| [**The-Ernest-Foundation-for-Ethical-AI-Open-Knowledge**](https://github.com/ernestonkunzimana/The-Ernest-Foundation-for-Ethical-AI-Open-Knowledge) | Foundation for Ethical AI and Open Knowledge access | — | ![Active](https://img.shields.io/badge/Status-Active-brightgreen) |

### 🌐 IoT & Embedded Systems

| Project | Description | Tech | Status |
|---|---|---|---|
| [**DIY IoT LED Controls**](https://github.com/ernestonkunzimana/-DIY-Do-It-Yourself-instructions-for-an-IoT-embedded-systems-project-with-LED-controls) | Step-by-step DIY guide for IoT/embedded systems with LED controls | Embedded C | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |

### 🎓 Learning & Development Projects

| Project | Description | Tech | Status |
|---|---|---|---|
| [**PLP-Fellowship**](https://github.com/ernestonkunzimana/PLP-Fellowship) | Power Learn Project Fellowship — software engineering curriculum | HTML · Python | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**FullstackDjango_React**](https://github.com/ernestonkunzimana/FullstackDjango_React) | Full-stack Django + React application | Python · JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**DjangoRestFramework_ReactJS**](https://github.com/ernestonkunzimana/DjangoRestFramework_ReactJS) | Django REST Framework with ReactJS development | Python · JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**django-todo-react**](https://github.com/ernestonkunzimana/django-todo-react) | Todo application with Django backend and React frontend | Python · JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**KGLMob-**](https://github.com/ernestonkunzimana/KGLMob-) | Mobile-first web application | CSS | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**TaskManagerApplication**](https://github.com/ernestonkunzimana/TaskManagerApplication) | Task manager app with localStorage | JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**Photo-Gallery**](https://github.com/ernestonkunzimana/Photo-Gallery) | Interactive photo gallery with JavaScript coding challenges | JavaScript | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**nkodin-recipes**](https://github.com/ernestonkunzimana/nkodin-recipes) | Basic recipe website — The Odin Project | HTML | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**Azure-DevOps-project**](https://github.com/ernestonkunzimana/Azure-DevOps-project) | Azure DevOps pipeline setup and configuration | Azure | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |
| [**Learn-Devops-withMe**](https://github.com/ernestonkunzimana/Learn-Devops-withMe) | DevOps learning — collaboration between dev and ops teams | — | ![Complete](https://img.shields.io/badge/Status-Complete-blue) |

### 📊 Project Progress Overview

```
Enterprise & Business    ████████████░░░░  75% Complete
Healthcare Systems       ████████████████  80% Active Development  
AI & ML Projects         ██████████░░░░░░  65% Complete
Blockchain & Web3        ████████████████  100% Deployed
Social Impact & Civic    ████████░░░░░░░░  50% In Progress
IoT & Embedded           ████████████████  100% Complete
Learning & Education     ████████████████  100% Complete
```

> 🔗 **View full GitHub profile:** [github.com/ernestonkunzimana](https://github.com/ernestonkunzimana)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing TypeScript/ESLint conventions and includes appropriate tests.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Ernest Nkunzimana](https://github.com/ernestonkunzimana)**

*Empowering Africa's construction industry through innovative technology*

[![GitHub followers](https://img.shields.io/github/followers/ernestonkunzimana?label=Follow&style=social)](https://github.com/ernestonkunzimana)
[![GitHub stars](https://img.shields.io/github/stars/ernestonkunzimana/pcs-b-ltd?style=social)](https://github.com/ernestonkunzimana/pcs-b-ltd)

</div>
