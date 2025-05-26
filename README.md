# Lego Planner

A modern weekly planning tool built with Next.js and Shadcn UI that displays calendar quarters in weekly blocks.

## Overview

Lego Planner is a visual project management tool designed to help teams plan their work across weeks and quarters. It displays projects as "lego blocks" on a calendar grid, with one project per week per assignee. The interface allows for easy navigation between different quarters and years.

![Lego Planner Screenshot](public/lego-planner-preview.png)

## Features

- 📅 Weekly planning view with quarter-based navigation
- 👥 Assignee management (team members, teams, dependencies, events)
- 🧩 Project blocks with different visual styles based on project type
- 🔍 Filtering by assignee
- 🌓 Light and dark mode support
- 📱 Responsive design with sticky headers and sidebars

## Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Runtime**: [Bun](https://bun.sh/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **Deployment**: Docker Compose

## Project Structure

```
src/
├── app/             # Next.js App Router files
│   ├── api/         # API routes for backend
│   └── ...          # App routes and pages
├── components/      # React components
│   ├── ui/          # Shadcn UI components
│   └── ...          # Custom components
├── lib/             # Utilities and type definitions
│   ├── models/      # Mongoose models
│   └── ...          # Utility functions
├── hooks/           # Custom React hooks
└── ...
```

### Key Components

- **`LegoPlanner`**: Main component that integrates all parts
- **`WeekBlock`**: Individual block representing a project assignment
- **`CalendarNavigation`**: Controls for navigating between quarters/years

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lego-planner.git
cd lego-planner

# Install dependencies
bun install
# or npm install

# Start the development server
bun dev
# or npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Workflow

### Running the Development Server

```bash
bun dev
```

This starts the Next.js development server with Turbopack for fast refresh.

### Building for Production

```bash
bun build
```

### Starting the Production Server

```bash
bun start
```

## Project Components

### Data Structure

Lego Planner uses the following data types:

- **Assignee**: Person, team, dependency, or event assigned to projects
- **Project**: Work item with a name and type (regular, tech-debt, team-event, etc.)
- **WeekData**: Information about a specific week (number, start/end dates)
- **Assignment**: Links an assignee to a project for a specific week

### Customization

The project uses Shadcn UI components which can be easily customized:

- Modify the theme in `src/app/globals.css`
- Update component variants in the respective component files under `src/components/ui`

## Backend API

The project uses a MongoDB database for data persistence. API endpoints are implemented using Next.js App Router API routes.

### Data Models

The project uses Mongoose for MongoDB object modeling:

- **Project**: Represents a work item with attributes like name, type, priority, etc.
- **Assignment**: Links assignees to projects for specific weeks
- **Assignee**: Represents a person, team, dependency, or event

## Development with MongoDB

### Running MongoDB with Docker Compose

The project includes a Docker Compose setup for easy MongoDB deployment:

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Stop the services
docker-compose down
```

Mongo Express, a web-based MongoDB admin interface, is available at [http://localhost:8081](http://localhost:8081).

### Environment Variables

Copy the `.env.example` file to `.env` and update the values as needed:

```bash
cp .env.example .env
```

The following environment variables are used:

- `MONGODB_URI`: MongoDB connection string

## Deployment

The application can be deployed using Docker and MongoDB:

1. Configure your `.env` file with appropriate values
2. Build and deploy the Docker containers:

```bash
docker-compose up -d
```

3. Access your application at the configured URL

## Planned Features

- Drag and drop support for assignments
- Project creation and editing
- CSV/Excel export functionality
- Team workload views
- Advanced filtering options
- Authentication and authorization
- Backup and restore functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
