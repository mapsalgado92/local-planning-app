import Head from "next/head"
import { useState } from "react"
import {
  Row,
  Col,
  ListGroup,
  Container,
  Form,
  DropdownButton,
  InputGroup,
  Button,
  Tabs,
  Tab,
} from "react-bootstrap"
import CSVUploader from "../components/entries/CSVUploader"
import useCapacity from "../hooks/useCapacity"
import { connectToDatabase } from "../lib/mongodb"

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  gridClasses,
  GridToolbarFilterButton,
  GridFooterContainer,
} from "@mui/x-data-grid"

const Staffing = (props) => {
  const [data, setData] = useState(props)
  const [selected, setSelected] = useState({
    project: null,
    lob: null,
    capPlan: null,
    week: null,
  })
  const [entry, setEntry] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [formInfo, setFormInfo] = useState({})
  const [uploaded, setUploaded] = useState(null)

  const capacity = useCapacity(data)

  const rows = [
    { id: 1, col1: "Hello", col2: "World" },
    { id: 2, col1: "DataGridPro", col2: "is Awesome" },
    { id: 3, col1: "MUI", col2: "is Amazing" },
  ]

  const columns = [
    { field: "col1", headerName: "Column 1", minWidth: 100 },
    { field: "col2", headerName: "Column 2", minWidth: 100 },
  ]

  const handleSelect = async (item, type) => {
    setEntry(null)
    setLoaded(false)
    setFormInfo({})
    setUploaded(null)

    if (type === "project") {
      setSelected({ project: item, lob: null, capPlan: null, week: null })
    } else if (type === "lob") {
      setSelected({ ...selected, lob: item, capPlan: null, week: null })
    } else if (type === "capPlan") {
      setSelected({ ...selected, capPlan: item, week: null })
    } else if (type === "week") {
      setSelected({ ...selected, week: item })
      let entries = await fetch(
        `api/capEntries/capPlan=${selected.capPlan._id}/week=${item.code}`
      )
        .then((data) => data.json())
        .catch()
      setLoaded(true)
      if (entries.length === 1) {
        setEntry(entries[0])
        setFormInfo({ Comment: entries[0]["Comment"] })
      }
    }
  }

  const handleSubmitUpload = async () => {}

  const handleUploadCSV = (csv) => {
    let header = csv.shift()
    console.log(header)
    let entries = csv.map((row) => {
      let rowObj = {}
      header.forEach((field, index) => (rowObj[field] = row[index]))
      return rowObj
    })
    console.log("Entries", entries)
    setUploaded(entries)
  }

  return (
    <>
      <Head>
        <title>Planning App | Staffing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className="mt-4">
          <h2 className="text-center text-danger">Staffing</h2>
          <br></br>

          <Form>
            <Form.Label as="h4">Selection</Form.Label>
            <InputGroup>
              <DropdownButton
                size="sm"
                className="me-2"
                title={
                  selected.project ? selected.project.name : "Select a Project"
                }
                disabled={data.projects === 0}
              >
                <ListGroup variant="flush">
                  {data.projects &&
                    data.projects.map((project) => (
                      <ListGroup.Item
                        key={project._id}
                        action
                        className="rounded-0 flush"
                        onClick={(e) => {
                          e.preventDefault()
                          handleSelect(project, "project")
                        }}
                      >
                        {project.name}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </DropdownButton>

              <DropdownButton
                size="sm"
                className="me-2"
                title={selected.lob ? selected.lob.name : "Select a LOB"}
                disabled={!selected.project}
              >
                <ListGroup variant="flush">
                  {selected.project &&
                    data.lobs.filter(
                      (lob) => lob.project === selected.project._id
                    ) &&
                    data.lobs
                      .filter((lob) => lob.project === selected.project._id)
                      .map((lob) => (
                        <ListGroup.Item
                          key={lob._id}
                          action
                          className="rounded-0 flush"
                          onClick={(e) => {
                            e.preventDefault()
                            handleSelect(lob, "lob")
                          }}
                        >
                          {lob.name}
                        </ListGroup.Item>
                      ))}
                </ListGroup>
              </DropdownButton>

              <DropdownButton
                size="sm"
                className="me-2"
                title={
                  selected.capPlan
                    ? selected.capPlan.name
                    : "Select a Capacity Plan"
                }
                disabled={!selected.lob}
              >
                <ListGroup variant="flush">
                  {selected.lob &&
                    data.capPlans.filter(
                      (capPlan) => capPlan.lob === selected.lob._id
                    ) &&
                    data.capPlans
                      .filter((capPlan) => capPlan.lob === selected.lob._id)
                      .map((capPlan) => (
                        <ListGroup.Item
                          key={capPlan._id}
                          action
                          className="rounded-0 flush"
                          onClick={(e) => {
                            e.preventDefault()
                            handleSelect(capPlan, "capPlan")
                          }}
                        >
                          {capPlan.name}
                        </ListGroup.Item>
                      ))}
                </ListGroup>
              </DropdownButton>
            </InputGroup>
          </Form>
          <br />
          <Tabs defaultActiveKey="upload" id="uncontrolled-tab-example">
            <Tab eventKey="volumes" title="Volumes">
              <br />
              <br />
              <CSVUploader
                loadedHandler={(csv) => handleUploadCSV(csv)}
                removeHandler={() => setUploaded(null)}
              ></CSVUploader>
              <br />
              {uploaded && (
                <Row className="justify-content-center text-center">
                  <DataGrid
                    components={{
                      Footer: () => (
                        <GridFooterContainer
                          className={gridClasses.toolbarContainer}
                        >
                          <GridToolbarExport />
                        </GridFooterContainer>
                      ),
                    }}
                    checkboxSelection={true}
                    rows={uploaded.map((row, index) => ({
                      ...row,
                      id: index,
                    }))}
                    columns={[
                      { field: "id", headerName: "#", minWidth: 50, flex: 0.5 },
                      ...Object.keys(uploaded[0]).map((key, index) => ({
                        field: key,
                        headerName: key,
                        minWidth: 100,
                        flex: 1,
                      })),
                    ]}
                    autoHeight
                    pagination={false}
                    pageSize={12}
                  />
                </Row>
              )}
              <br />
              <Row>
                <Col xs={4} className="mx-auto">
                  <Button
                    size="sm"
                    className="w-100"
                    onClick={handleSubmitUpload}
                    disabled={!uploaded || !selected.capPlan}
                  >
                    Submit Upload
                  </Button>
                </Col>
              </Row>
              <br />
            </Tab>
            <Tab eventKey="aht" title="AHT">
              <br />
              <br />
              <CSVUploader
                loadedHandler={(csv) => handleUploadCSV(csv)}
                removeHandler={() => setUploaded(null)}
              ></CSVUploader>
              <br />

              {}

              <br />
              <Row>
                <Col xs={4} className="mx-auto">
                  <Button
                    size="sm"
                    className="w-100"
                    onClick={handleSubmitUpload}
                    disabled={!uploaded || !selected.capPlan}
                  >
                    Submit Upload
                  </Button>
                </Col>
              </Row>
              <br />
            </Tab>
          </Tabs>

          <br></br>
        </Container>
      </main>
    </>
  )
}

export default Staffing

export async function getServerSideProps() {
  const { client, db } = await connectToDatabase()

  const isConnected = await client.isConnected()

  const projects = await db
    .collection("projects")
    .find({})
    .sort({ name: 1 })
    .toArray()
  const languages = await db
    .collection("languages")
    .find({})
    .sort({ name: 1 })
    .toArray()
  const lobs = await db.collection("lobs").find({}).sort({ name: 1 }).toArray()
  const capPlans = await db
    .collection("capPlans")
    .find({})
    .sort({ name: 1 })
    .toArray()
  const weeks = await db
    .collection("weeks")
    .find({})
    .sort({ year: 1, weekNum: 1 })
    .toArray()
  const fields = await db
    .collection("fields")
    .find({})
    .sort({ oreder: 1 })
    .toArray()
  const props = {
    isConnected,
    projects,
    languages,
    lobs,
    weeks,
    capPlans,
    fields,
  }

  return {
    props: JSON.parse(JSON.stringify(props)),
  }
}
