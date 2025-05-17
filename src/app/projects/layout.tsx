import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects",
  description: "View and manage all projects in the organization.",
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 