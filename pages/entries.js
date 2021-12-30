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
  Spinner,
} from "react-bootstrap"
import CSVUploader from "../components/entries/CSVUploader"
import useCapacity from "../hooks/useCapacity"
import { connectToDatabase } from "../lib/mongodb"

const Entries = (props) => {
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
  const [uploading, setUploading] = useState(false)

  const capacity = useCapacity(data)

  const headcountFields = [
    "attrition",
    "moveIN",
    "moveOUT",
    "loaIN",
    "loaOUT",
    "rwsIN",
    "rwsOUT",
  ]

  const trainingFields = [
    "trCommit",
    "trGap",
    "trAttrition",
    "ocpAttrition",
    "trWeeks",
    "ocpWeeks",
  ]

  const targetFields = ["billable", "requirements", "tgAHT", "tgSL"]

  const forecastFields = [
    "fcAttrition",
    "fcTrAttrition",
    "fcVolumes",
    "fcAHT",
    "fcRequirements",
  ]

  const actualFields = ["Volumes", "AHT", "Requirements"]

  const handleChange = (e, field, changeConfig) => {
    if (!changeConfig) {
      setFormInfo({ ...formInfo, [field]: e.target.value })
    } else {
      setFormInfo({
        ...formInfo,
        config: { ...formInfo.config, [field]: e.target.value },
      })
    }
  }

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

  const handleSubmit = async () => {
    let newEntry = {}

    if (entry) {
      newEntry = entry
    } else {
      newEntry.capPlan = selected.capPlan._id
      newEntry.week = selected.week.code
    }

    newEntry = { ...newEntry, ...formInfo }

    Object.keys(newEntry).forEach((key) => {
      if (newEntry[key] === "delete") {
        newEntry[key] = ""
      }
    })

    let res = await fetch("/api/capEntries", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item: newEntry,
      }),
    })

    console.log(res)

    capacity.rawUpdate(selected.capPlan)

    handleSelect(selected.week, "week")
  }

  const handleSubmitBulk = async () => {
    setUploading(true)
    if (uploaded.length > 0) {
      for (const item of uploaded) {
        let newEntry = {}
        let existing = await fetch(
          `api/capEntries/capPlan=${item.capPlan}/week=${item.week}`
        )
          .then((data) => data.json())
          .catch()

        if (existing.length === 1) {
          console.log("EXISTING ENTRY!!!!")
          newEntry = { ...existing[0], ...item }
          console.log(newEntry)
        } else if (existing.length === 0) {
          newEntry = {
            capPlan: item.capPlan,
            ...item,
          }
        } else {
          console.log("DUPLICATED ENTRIES")
          return -1
        }

        console.log("WILL UPLOAD ENTRY", newEntry)

        fetch("/api/capEntries", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: newEntry,
          }),
        })
      }
    }
    setUploading(false)
  }

  const handleSubmitUpload = async () => {
    if (uploaded.length > 0) {
      for (const item of uploaded) {
        let newEntry = {}
        let existing = await fetch(
          `api/capEntries/capPlan=${selected.capPlan._id}/week=${item.week}`
        )
          .then((data) => data.json())
          .catch()

        if (existing.length === 1) {
          console.log("EXISTING ENTRY!!!!")
          newEntry = { ...existing[0], ...item }
          console.log(newEntry)
        } else if (existing.length === 0) {
          newEntry = {
            capPlan: selected.capPlan._id,
            ...item,
          }
        } else {
          console.log("DUPLICATED ENTRIES")
          return -1
        }

        console.log("WILL UPLOAD ENTRY", newEntry)

        fetch("/api/capEntries", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: newEntry,
          }),
        })
      }
    }
  }

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
        <title>Planning App | Entries</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className="mt-4">
          <h2 className="text-center text-danger">Entries</h2>
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
            <Tab eventKey="upload" title="upload">
              <br />
              <br />
              <CSVUploader
                loadedHandler={(csv) => handleUploadCSV(csv)}
                removeHandler={() => setUploaded(null)}
                label="week (YYYYw#) - fieldName 1 - [...fieldName N]"
              ></CSVUploader>
              <br />
              {uploaded && (
                <Row className="justify-content-center">
                  <Col xs={12} className="text-center">
                    <h5>Entries:</h5>
                    <p>{uploaded.length}</p>
                  </Col>
                  {Object.keys(uploaded[0]).map((field, index) => (
                    <Col
                      key={"entry-field-" + index}
                      xs={2}
                      className="text-center"
                    >
                      <h5>Field {index}</h5>
                      <p>{field}</p>
                    </Col>
                  ))}
                </Row>
              )}
              <br />
              <Row>
                <Col xs={4} className="mx-auto d-flex justify-content-center">
                  <Button
                    size="sm"
                    onClick={handleSubmitUpload}
                    disabled={!uploaded || !selected.capPlan}
                  >
                    Submit Upload
                  </Button>
                </Col>
              </Row>
              <br />
            </Tab>
            <Tab eventKey="bulk" title="bulk">
              <br />
              <br />
              <CSVUploader
                loadedHandler={(csv) => handleUploadCSV(csv)}
                removeHandler={() => setUploaded(null)}
                label="capPlan (capPlan ID) - week (YYYYw#) - fieldName 1 (value) - [...fieldName N ]"
              ></CSVUploader>
              <br />
              {uploaded && (
                <Row className="justify-content-center">
                  <Col xs={12} className="text-center">
                    <h5>Entries:</h5>
                    <p>{uploaded.length}</p>
                  </Col>
                  {Object.keys(uploaded[0]).map((field, index) => (
                    <Col
                      key={"entry-field-" + index}
                      xs={2}
                      className="text-center"
                    >
                      <h5>Field {index}</h5>
                      <p>{field}</p>
                    </Col>
                  ))}
                </Row>
              )}
              <br />
              <Row>
                <Col xs={4} className="mx-auto d-flex justify-content-center">
                  <Button
                    size="sm"
                    onClick={handleSubmitBulk}
                    disabled={!uploaded || !uploaded[0].capPlan}
                  >
                    Submit Bulk
                    <Spinner
                      animation="border"
                      role="status"
                      hidden={!uploading}
                      size="sm"
                      className="ms-3"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </Button>
                </Col>
              </Row>
              <br />
            </Tab>
            <Tab eventKey="single" title="single">
              <br />
              <Form>
                <DropdownButton
                  size="sm"
                  variant="danger"
                  className="me-2"
                  title={
                    selected.week
                      ? selected.week.code +
                        " - " +
                        selected.week.firstDate.split("T")[0]
                      : "Select a Week"
                  }
                  disabled={!selected.capPlan}
                >
                  <ListGroup variant="flush">
                    {selected.capPlan &&
                      data.weeks.slice(
                        data.weeks.indexOf(
                          data.weeks.find(
                            (week) => week.code === selected.capPlan.firstWeek
                          )
                        )
                      ) &&
                      data.weeks
                        .slice(
                          data.weeks.indexOf(
                            data.weeks.find(
                              (week) => week.code === selected.capPlan.firstWeek
                            )
                          )
                        )
                        .map((week) => (
                          <ListGroup.Item
                            key={week._id}
                            action
                            className="rounded-0 flush"
                            variant={
                              selected.week && week.code === selected.week.code
                                ? "warning"
                                : "light"
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              handleSelect(week, "week")
                            }}
                          >
                            {week.code + " - " + week.firstDate.split("T")[0]}
                          </ListGroup.Item>
                        ))}
                  </ListGroup>
                </DropdownButton>

                <br />

                <Row>
                  <Form.Label as="h4">Headcount</Form.Label>
                  {headcountFields.map((field) => (
                    <Col key={`Col-${field}`} sm={4} md={3} lg={2}>
                      <Form.Label as="h5">{field}</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          readOnly={true}
                          className="ms-1"
                          aria-label={field}
                          value={(entry && entry[field]) || "none"}
                        />
                        <Form.Control
                          className={
                            "ms-1 " + (formInfo[field] ? "border-danger" : "")
                          }
                          aria-label={field}
                          value={formInfo[field] || ""}
                          disabled={!selected.week}
                          onChange={(e) => handleChange(e, field)}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                </Row>
                <br></br>
                <Row>
                  <Form.Label as="h4">Training</Form.Label>
                  {trainingFields.map((field) => (
                    <Col key={`Col-${field}`} sm={4} md={3} lg={2}>
                      <Form.Label as="h5">{field}</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          readOnly={true}
                          className="ms-1"
                          aria-label={field}
                          value={(entry && entry[field]) || "none"}
                        />
                        <Form.Control
                          className={
                            "ms-1 " + (formInfo[field] ? "border-danger" : "")
                          }
                          aria-label={field}
                          value={formInfo[field] || ""}
                          disabled={!selected.week}
                          onChange={(e) => handleChange(e, field)}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                </Row>
                <br></br>
                <Row>
                  <Form.Label as="h4">Target</Form.Label>
                  {targetFields.map((field) => (
                    <Col key={`Col-${field}`} sm={4} md={3} lg={2}>
                      <Form.Label as="h5">{field}</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          readOnly={true}
                          className="ms-1"
                          aria-label={field}
                          value={(entry && entry[field]) || "none"}
                        />
                        <Form.Control
                          className={
                            "ms-1 " + (formInfo[field] ? "border-danger" : "")
                          }
                          aria-label={field}
                          value={formInfo[field] || ""}
                          disabled={!selected.week}
                          onChange={(e) => handleChange(e, field)}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                </Row>
                <br></br>
                <Row>
                  <Form.Label as="h4">Forecast</Form.Label>
                  {forecastFields.map((field) => (
                    <Col key={`Col-${field}`} sm={4} md={3} lg={2}>
                      <Form.Label as="h5">{field}</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          readOnly={true}
                          className="ms-1"
                          aria-label={field}
                          value={(entry && entry[field]) || "none"}
                        />
                        <Form.Control
                          className={
                            "ms-1 " + (formInfo[field] ? "border-danger" : "")
                          }
                          aria-label={field}
                          value={formInfo[field] || ""}
                          disabled={!selected.week}
                          onChange={(e) => handleChange(e, field)}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                </Row>
                <br></br>
                <Row>
                  <Form.Label as="h4">Actuals</Form.Label>
                  {actualFields.map((field) => (
                    <Col key={`Col-${field}`} sm={4} md={3} lg={2}>
                      <Form.Label as="h5">{field}</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          readOnly={true}
                          className="ms-1"
                          aria-label={field}
                          value={(entry && entry[field]) || "none"}
                        />
                        <Form.Control
                          className={
                            "ms-1 " + (formInfo[field] ? "border-danger" : "")
                          }
                          aria-label={field}
                          value={formInfo[field] || ""}
                          disabled={!selected.week}
                          onChange={(e) => handleChange(e, field)}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                </Row>
                <br></br>
                <Row>
                  <Form.Label as="h4">Comment</Form.Label>
                  <Col key={`Col-Comment`}>
                    <InputGroup size="sm">
                      <Form.Control
                        readOnly={true}
                        className="ms-1"
                        as="textarea"
                        rows={5}
                        placeholder={"Comment"}
                        aria-label={"Comment"}
                        value={(entry && entry["Comment"]) || "none"}
                      />
                      <Form.Control
                        className={
                          "ms-1 " + (formInfo["Comment"] ? "border-danger" : "")
                        }
                        as="textarea"
                        rows={5}
                        placeholder={"Comment"}
                        aria-label={"Comment"}
                        value={formInfo["Comment"] || ""}
                        disabled={!selected.week}
                        onChange={(e) => handleChange(e, "Comment")}
                      />
                    </InputGroup>
                  </Col>
                </Row>

                <br></br>

                <Row>
                  <Col>
                    <Button
                      size="sm"
                      className="w-100"
                      onClick={handleSubmit}
                      disabled={!loaded}
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>

                <br></br>
              </Form>
            </Tab>
          </Tabs>

          <br></br>
        </Container>
      </main>
    </>
  )
}

export default Entries

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
