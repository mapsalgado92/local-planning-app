import Head from 'next/head'
import { connectToDatabase } from '../lib/mongodb'

export default function Home({ isConnected, projects, languages, weeks, lobs }) {
  return (
    <>
      <Head>
        <title>Planning App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="d-flex flex-column justify-content-center mb-4 align-items-center">

        <h1 className="display-2">the <span className="text-danger">planning app</span></h1>

      </main>

    </>
  )
}

export async function getServerSideProps() {
  const { client, db } = await connectToDatabase()

  const isConnected = await client.isConnected()

  const projects = await db.collection("projects").find({}).toArray()
  const languages = await db.collection("languages").find({}).toArray()
  const lobs = await db.collection("lobs").find({}).toArray()
  const weeks = await db.collection("weeks").find({}).toArray()

  const props = { isConnected, projects, languages, lobs, weeks }

  return {
    props: JSON.parse(JSON.stringify(props))
  }
}
