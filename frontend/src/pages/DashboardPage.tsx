import React from 'react'
import { Dashboard } from '../components/Dashboard/Dashboard'
import { User } from '../types/index'

interface DashboardPageProps {
  user?: User
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  return <Dashboard user={user} />
}
