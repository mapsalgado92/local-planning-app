
import Head from 'next/head'
import { useState } from 'react'
import { ListGroup, Button, Container, Form, DropdownButton, InputGroup, Spinner } from 'react-bootstrap'
import { connectToDatabase } from '../lib/mongodb'
import useCapacity from '../hooks/useCapacity'
import CapacityViewer from '../components/capacity/CapacityViewer'
import useWeeks from '../hooks/useWeeks'
import SQLTable from '../components/capacity/SQLTable'
import AggregatedTotals from '../components/capacity/AggregatedTotals'
import TotalPercentageChart from '../components/capacity/TotalPercentageChart'

const Aggregate = (props) => {
  const [data, setData] = useState(props)
  const [selected, setSelected] = useState({ languages: [] })
  const capacity = useCapacity(data)
  const myWeeks = useWeeks(data)

  const handleSelect = async (item, type) => {

    if (type === "project") {
      setSelected({ ...selected, project: item, lob: null, capPlan: null, week: null })
    } else if (type === "lob") {
      setSelected({ ...selected, lob: item, capPlan: null, week: null })
    } else if (type === "capPlan") {
      setSelected({ ...selected, capPlan: item, week: null })
    } else if (type === "fromWeek") {
      if (selected.toWeek && selected.toWeek.firstDate < item.firstDate) {
        setSelected({ ...selected, fromWeek: item, toWeek: item })
      } else {
        setSelected({ ...selected, fromWeek: item })
      }
    } else if (type === "toWeek") {
      if (selected.fromWeek && selected.fromWeek.firstDate > item.firstDate) {
        setSelected({ ...selected, fromWeek: item, toWeek: item })
      } else {
        setSelected({ ...selected, toWeek: item })
      }
    } else if (type === "language") {
      let newLanguages = [...selected.languages]
      if (newLanguages.includes(item)) {
        newLanguages = newLanguages.filter(language => language !== item)
      } else {
        newLanguages.push(item)
      }
      setSelected({ ...selected, languages: newLanguages })
    }
  }

  const handleAggregate = async () => {

    let selectedCapPlans = data.capPlans.filter(capPlan => capPlan.active)

    let selectedLOBs = []
    let selectedLanguages = selected.languages

    if (selected.lob) {
      selectedLOBs = [selected.lob]
    } else if (selected.project) {
      selectedLOBs = data.lobs.filter(lob => lob.project === selected.project._id)
    }

    if (selectedLOBs.length > 0) {
      selectedCapPlans = selectedCapPlans.filter(capPlan => {
        if (selectedLOBs.find(lob => capPlan.lob === lob._id)) {
          return true
        } else {
          return false
        }
      })
    }

    if (selectedLanguages && selectedLanguages.length > 0) {
      selectedCapPlans = selectedCapPlans.filter(capPlan => {
        if (selectedLanguages.find(language => capPlan.language === language._id)) {
          return true
        } else {
          return false
        }
      })
    }

    capacity.aggregate(selectedCapPlans, selected.fromWeek, selected.toWeek)

  }

  return (
    <>
      <Head>
        <title>Planning App | Aggregate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className="mt-4">
          <h2 className="text-center text-danger">Aggregate</h2>
          <Form>
            <Form.Label as="h4">Selection by Project</Form.Label>
            <InputGroup>

              <DropdownButton size="sm" className="me-2" title={selected.project ? selected.project.name : "All Projects"} disabled={data.projects === 0}>
                <ListGroup.Item key={"all-projecs"} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(null, "project") }}>
                  {"All Projects"}
                </ListGroup.Item>
                <ListGroup variant="flush">
                  {data.projects && data.projects.map(project =>
                    <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project, "project") }}>
                      {project.name}
                    </ListGroup.Item>)}

                </ListGroup>
              </DropdownButton>


              <DropdownButton size="sm" className="me-2" title={selected.lob ? selected.lob.name : "All LOBs"} disabled={!selected.project}>
                <ListGroup variant="flush">
                  <ListGroup.Item key={"all-lobs"} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(null, "lob") }}>
                    {"All LOBs"}
                  </ListGroup.Item>
                  {selected.project && data.lobs.filter(lob => lob.project === selected.project._id) && data.lobs.filter(lob => lob.project === selected.project._id).map(lob =>
                    <ListGroup.Item key={lob._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(lob, "lob") }}>
                      {lob.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>
            </InputGroup>
            <br></br>

            <Form.Label as="h4">Selection by Language</Form.Label>


            {data.languages && data.languages.sort((a, b) => {
              if (a.name > b.name) {
                return 1
              } else if (a.name < b.name) {
                return -1
              } else {
                return 0
              }
            }).map(language =>
              <Button key={language._id} variant={selected.languages && selected.languages.includes(language) ? "primary" : "outline-primary"} size="sm" className="m-1" onClick={(e) => { e.preventDefault(); handleSelect(language, "language") }}>
                {language.name}
              </Button>
            )}


            <br></br>
            <br></br>
            <InputGroup>
              <div className="me-4">
                <Form.Label as="h4">From Week</Form.Label>
                <DropdownButton size="sm" variant="danger" className="me-2" title={selected.fromWeek ? selected.fromWeek.code + " - " + selected.fromWeek.firstDate.split("T")[0] : "Select a Week"}>
                  <ListGroup variant="flush" >
                    {data.weeks && data.weeks.map(week =>
                      <ListGroup.Item key={week._id} action className={"rounded-0 flush text-nowrap" + (myWeeks.getCurrentWeek().code === week.code ? " border border-danger text-danger" : "")} variant={(selected.fromWeek && week.code === selected.fromWeek.code) ? "warning" : "light"} onClick={(e) => { e.preventDefault(); handleSelect(week, "fromWeek") }}>
                        {week.code + " - " + week.firstDate.split("T")[0]}
                      </ListGroup.Item>)}
                  </ListGroup>
                </DropdownButton>

              </div>
              <br />
              <div>
                <Form.Label as="h4">To Week</Form.Label>
                <DropdownButton size="sm" variant="danger" className="me-2" title={selected.toWeek ? selected.toWeek.code + " - " + selected.toWeek.firstDate.split("T")[0] : "Select a Week"}>
                  <ListGroup variant="flush">
                    {data.weeks && data.weeks.map(week =>
                      <ListGroup.Item key={week._id} action className={"rounded-0 flush text-nowrap" + (myWeeks.getCurrentWeek().code === week.code ? " border border-danger text-danger" : "")} variant={(selected.toWeek && week.code === selected.toWeek.code) ? "warning" : "light"} onClick={(e) => { e.preventDefault(); handleSelect(week, "toWeek") }}>
                        {week.code + " - " + week.firstDate.split("T")[0]}
                      </ListGroup.Item>)}
                  </ListGroup>
                </DropdownButton>
              </div>
            </InputGroup>
            <br />

            <Button size="sm" onClick={handleAggregate} variant="dark" disabled={!selected.fromWeek || !selected.toWeek}>AGGREGATE</Button>

          </Form>

          <br></br>
          <br></br>

          {capacity.aggOutput ? <CapacityViewer capacity={capacity} data={data} outputType={"aggOutput"}></CapacityViewer> : capacity.status && <span><Spinner animation="border" variant="danger" className="me-2" />{capacity.status} </span>}

          <br></br>
          <br></br>

          {capacity.aggOutput && <AggregatedTotals capacity={capacity} />}

          <br />
          <br />


          {capacity.aggOutput && <>
            <h3 className="text-center mb-0">FTE vs Attrition</h3>
            <TotalPercentageChart data={capacity.aggOutput} lines={["billableFTE", "totalFTE", "expectedFTE"]} percentages={["attrPercent"]} />
          </>
          }
          <br />
          <br />

          {capacity.aggOutput && <>
            <h3 className="text-center mb-0">Training</h3>
            <TotalPercentageChart data={capacity.aggOutput} lines={["trainees", "nesting"]} />
          </>
          }

          <br></br>
          <br></br>



          {capacity.aggOutput && <SQLTable input={capacity.getAggregatedTable(data.fields.filter(field => field.aggregatable))} title="Table View" />}

          <br></br>

        </Container>

      </main>
    </>
  )
}

export default Aggregate

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