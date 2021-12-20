import { useState, useEffect } from "react"
import {
  Row,
  Col,
  ListGroup,
  Container,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap"

const EntriyForm = ({ selected, week, capacity }) => {
  const [entry, setEntry] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [formInfo, setFormInfo] = useState({})

  useEffect(() => {
    const fetchEntry = async () => {
      let entries = await fetch(
        `api/capEntries/capPlan=${selected.capPlan._id}/week=${week.code}`
      )
        .then((data) => data.json())
        .catch()
      if (entries.length === 1) {
        setEntry(entries[0])
        setFormInfo({ Comment: entries[0]["Comment"] })
      } else if (entries.length > 1) {
        console.log(
          "Multiple Entries!",
          entries.map((entry) => entry.id)
        )
      } else if (entries.length === 0) {
        console.log("No entry found")
      }
      setLoaded(true)
    }

    fetchEntry()
  }, [selected, week])

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

  const handleSubmit = async () => {
    let newEntry = {}

    if (entry) {
      newEntry = entry
    } else {
      newEntry.capPlan = selected.capPlan._id
      newEntry.week = week.code
      console.log("THIS IS NEW ENTRY", newEntry)
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

    setEntry(newEntry)
    setFormInfo({ Comment: newEntry["Comment"] })
  }

  return (
    <>
      <Container className="mt-4">
        <h2 className="text-center text-danger">Entries</h2>
        <br></br>

        <Form>
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
                    disabled={!week}
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
                    disabled={!week}
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
                    disabled={!week}
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
                    disabled={!week}
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
                    disabled={!week}
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
                  disabled={!week}
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

        <br></br>
      </Container>
    </>
  )
}

export default EntriyForm
