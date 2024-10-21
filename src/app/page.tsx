import dynamic from 'next/dynamic'

const NoteTakingAppComponent = dynamic(() => import('@/components/note-taking-app').then((mod) => mod.NoteTakingAppComponent), { ssr: false })

export default function Home() {
  return (
    <NoteTakingAppComponent />
  );
}
