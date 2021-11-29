import Head from 'next/head'
import { useState } from 'react'
import { Row, Col, ListGroup, Container, Spinner } from 'react-bootstrap'
import CapManagement from '../components/management/CapManagement'
import LobManagement from '../components/management/LobManagement'
import ProjectManagement from '../components/management/ProjectManagement'
import useCapacity from '../hooks/useCapacity'
import { connectToDatabase } from '../lib/mongodb'


export default function Management(props) {

  const [data, setData] = useState(props)
  const [screen, setScreen] = useState("project")
  const [updating, setUpdating] = useState(false)

  const capacity = useCapacity(data)

  const handleRefresh = async (collection) => {

    const newData = await fetch(`api/${collection}`).then(res => res.json())

    console.log("NEW DATA: ", newData)

    setData({ ...data, [collection]: newData })
  }

  return (
    <>
      <Head>
        <title>Planning App | Management</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container className="mt-4">
          <h2 className="text-center text-danger">Management</h2>
          <Row>
            <Col sm={3}>
              <ListGroup className="shadow-sm">
                <ListGroup.Item action onClick={() => setScreen("projects")}>Projects</ListGroup.Item>
                <ListGroup.Item action onClick={() => setScreen("lobs")}>LOBs</ListGroup.Item>
                <ListGroup.Item action onClick={() => setScreen("capPlans")}>Capacity Plans</ListGroup.Item>
                <ListGroup.Item action variant="danger" onClick={async () => {
                  setUpdating(true)
                  for await (let capPlan of data.capPlans.filter(capPlan => capPlan.active)) {
                    await capacity.rawUpdate(capPlan)
                  }
                  setUpdating(false)
                }}>Update Raw </ListGroup.Item>
                {updating && <span className="p-3"><Spinner animation="border" variant="danger" className="me-2" />Updating...</span>}

              </ListGroup>

            </Col>
            <Col sm={9}>

              {screen === "projects" && <ProjectManagement data={data} refresh={handleRefresh}></ProjectManagement>}
              {screen === "lobs" && <LobManagement data={data} refresh={handleRefresh}></LobManagement>}
              {screen === "capPlans" && <CapManagement data={data} refresh={handleRefresh}></CapManagement>}


            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const { client, db } = await connectToDatabase()

  const isConnected = await client.isConnected()

  const projects = await db.collection("projects").find({}).sort({ name: 1 }).toArray()
  const languages = await db.collection("languages").find({}).sort({ name: 1 }).toArray()
  const lobs = await db.collection("lobs").find({}).sort({ name: 1 }).toArray()
  const capPlans = await db.collection("capPlans").find({}).sort({ name: 1 }).toArray()
  const weeks = await db.collection("weeks").find({}).sort({ year: 1, weekNum: 1 }).toArray()
  const fields = await db.collection("fields").find({}).sort({ order: 1 }).toArray()
  const props = { isConnected, projects, languages, lobs, weeks, capPlans, fields }

  return {
    props: JSON.parse(JSON.stringify(props))
  }
}