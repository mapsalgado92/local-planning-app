import { Button, DropdownButton, ListGroup, Form, Tabs, Tab, Alert, InputGroup } from "react-bootstrap"
import { useState } from 'react'

const LobManagement = ({ data, refresh }) => {
  const [selected, setSelected] = useState({ project: null, lob: null })
  const [formInfo, setFormInfo] = useState({ name: "", startWeek: "", config: { trWeeks: "", ocpWeeks: "", tgAHT: "", tgSL: "" } })


  const handleSelect = (item, type) => {

    setSelected({ ...selected, [type]: item })

    if (type === "lob") {
      setFormInfo({ name: (item.name || ""), startWeek: (item.startWeek || ""), active: (item.active || false), config: (item.config || { trWeeks: "", ocpWeeks: "", tgAHT: "", tgSL: "" }) })
    } else {
      setSelected({ project: item, lob: null })
      setFormInfo({ name: "", startWeek: "", config: { trWeeks: "", ocpWeeks: "", tgAHT: "", tgSL: "" } })
    }

  }

  const handleChange = (e, field, changeConfig) => {
    if (!changeConfig) {
      setFormInfo({ ...formInfo, [field]: e.target.value })
    } else {
      setFormInfo({ ...formInfo, config: { ...formInfo.config, [field]: e.target.value } })
    }
  }

  const handleAddLOB = async () => {
    if (formInfo.name && selected.project) {
      let lob = { name: formInfo.name, project: selected.project._id, config: { trWeeks: null, ocpWeeks: null, tgAHT: null, tgSL: null } }
      let res = await fetch("/api/lobs",
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: lob
          })
        })

      console.log(res)

      setFormInfo({ name: "", startWeek: "", config: { trWeeks: null, ocpWeeks: null, tgAHT: null, tgSL: null } })
      refresh("lobs")
    }
  }

  const handleEditLOB = async () => {
    let lob = selected.lob
    if (formInfo.name) {
      lob.name = formInfo.name
    }

    lob.config = formInfo.config

    let res = await fetch("/api/lobs",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: lob
        })
      })

    console.log(res)

    setFormInfo({ name: "", startWeek: "", config: null })
    setSelected({ project: null })
    refresh("lobs")
  }

  return (
    <div>
      <h3>LOBs</h3>
      <Tabs defaultActiveKey="new" id="uncontrolled-tab-example">
        <Tab eventKey="new" title="new">
          <Form>
            <Form.Label as="h5" className="mt-4">Selection</Form.Label>
            <DropdownButton size="sm" title={selected.project ? selected.project.name : "Select a Project"} disabled={data.projects.length === 0}>
              <ListGroup variant="flush">
                {data.projects && data.projects.map(project =>
                  <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project, "project") }}>
                    {project.name}
                  </ListGroup.Item>)}
              </ListGroup>
            </DropdownButton>
            <Form.Label as="h5" className="mt-4">LOB Name</Form.Label>
            <Form.Control
              placeholder="LOB Name"
              aria-label="LOB Name"
              value={formInfo.name || ""}
              onChange={(e) => handleChange(e, "name")}
            />

            <br />

            <Button size="sm" variant="outline-success" disabled={!selected.project} onClick={handleAddLOB}>ADD LOB</Button>

          </Form>
        </Tab>
        <Tab eventKey="edit" title="edit">
          <Form>
            <Form.Label as="h5" className="mt-4">Selection</Form.Label>
            <InputGroup>
              <DropdownButton size="sm" className="me-2" title={selected.project ? selected.project.name : "Select a Project"} disabled={data.projects === 0}>
                <ListGroup variant="flush">
                  {data.projects && data.projects.map(project =>
                    <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project) }}>
                      {project.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>


              <DropdownButton size="sm" title={selected.lob ? selected.lob.name : "Select a LOB"} disabled={!selected.project}>
                <ListGroup variant="flush">
                  {selected.project && data.lobs.filter(lob => lob.project === selected.project._id) && data.lobs.filter(lob => lob.project === selected.project._id).map(lob =>
                    <ListGroup.Item key={lob._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(lob, "lob") }}>
                      {lob.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>

            </InputGroup>

            <Form.Label as="h5" className="mt-4">LOB Name</Form.Label>
            <Form.Control
              placeholder="New LOB Name"
              aria-label="LOB Name"
              value={formInfo.name || ""}
              onChange={(e) => handleChange(e, "name")}
            />

            <Form.Label as="h5" className="mt-4">Config</Form.Label>
            {formInfo.config && Object.keys(formInfo.config).map(key => <>
              <Form.Label as="h6" className="mt-4">{key}</Form.Label>
              <Form.Control
                className="mb-1"
                key={key}
                placeholder={key}
                aria-label={key}
                value={formInfo.config[key] || ""}
                onChange={(e) => handleChange(e, key, true)}
              /></>)}

            <br></br>

            <Button size="sm" variant="outline-success" disabled={!selected.lob} onClick={handleEditLOB}>UPDATE LOB</Button>

          </Form>
        </Tab>

      </Tabs>
      <br></br>
    </div>
  )
}

export default LobManagement
