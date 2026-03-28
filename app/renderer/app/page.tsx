/**
 * Root page — redirects to /projects on load.
 */
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/projects')
}
