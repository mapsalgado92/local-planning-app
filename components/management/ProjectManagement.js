import { Button, DropdownButton, ListGroup, Form, Tabs, Tab, InputGroup, Alert } from "react-bootstrap"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from 'react'

const ProjectManagement = ({ data, refresh }) => {
  const [selected, setSelected] = useState({ project: null })
  const [formInfo, setFormInfo] = useState({ projectName: "", startDate: null, bUnit: null })


  const handleSelect = (project) => {
    setSelected({ project: project })

    console.log(new Date(project.startDate))
    let newStartDate = null

    if (project.startDate) {
      newStartDate = new Date(project.startDate)
    }

    setFormInfo({ projectName: project.name, startDate: newStartDate, bUnit: project.bUnit ? project.bUnit : "" })
  }

  const handleChange = (e, field) => {
    setFormInfo({ ...formInfo, [field]: e.target.value })
  }

  const handleAddProject = async () => {
    if (formInfo.projectName) {
      let project = { name: formInfo.projectName, bUnit: formInfo.bUnit }
      let res = await fetch("/api/projects",
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: project
          })
        })


      setFormInfo({ projectName: "" })
      refresh("projects")
    }
  }

  const handleEditProject = async () => {
    let project = selected.project
    if (formInfo.projectName) {
      project.name = formInfo.projectName
    }
    if (formInfo.startDate) {
      project.startDate = formInfo.startDate
    }
    if (formInfo.bUnit) {
      project.bUnit = formInfo.bUnit
    }

    let res = await fetch("/api/projects",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: project
        })
      })

    console.log(res)
    setFormInfo({ projectName: "", setDate: "", bUnit: "" })
    setSelected({ project: null })
    refresh("projects")
  }

  return (
    <div>
      <h3>Projects</h3>
      <Tabs defaultActiveKey="new" id="uncontrolled-tab-example">
        <Tab eventKey="new" title="new">
          <Form>
            <Form.Label as="h5" className="mt-4">Project Name</Form.Label>
            <Form.Control
              placeholder="Project Name"
              aria-label="Project Name"
              value={formInfo.projectName}
              onChange={(e) => handleChange(e, "projectName")}
            />
            <br />
            <Button size="sm" variant="outline-success" onClick={handleAddProject}>ADD PROJECT</Button>

          </Form>
        </Tab>
        <Tab eventKey="edit" title="edit">
          <Form>
            <Form.Label as="h5" className="mt-4">Selection</Form.Label>
            <DropdownButton size="sm" title={selected.project ? selected.project.name : "Select a Project"} disabled={data.projects === 0}>
              <ListGroup variant="flush">
                {data.projects && data.projects.map(project =>
                  <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project) }}>
                    {project.name}
                  </ListGroup.Item>)}
              </ListGroup>
            </DropdownButton>

            <Form.Label as="h5" className="mt-4">Project Name</Form.Label>
            <Form.Control
              placeholder="New Project Name"
              aria-label="Project Name"
              value={formInfo.projectName}
              onChange={(e) => handleChange(e, "projectName")}
            />

            <Form.Label as="h5" className="mt-4">Business Unit</Form.Label>
            <Form.Control
              placeholder="Business Unit"
              aria-label="Business Unit"
              value={formInfo.bUnit}
              onChange={(e) => handleChange(e, "bUnit")}
            />

            <Form.Label as="h5" className="mt-4">Start Date</Form.Label>
            <InputGroup >
              <DatePicker style={{ zIndex: 999 }} placeholderText="Start Date" selected={formInfo.startDate} onChange={(date) => setFormInfo({ ...formInfo, startDate: date })}></DatePicker>
            </InputGroup>
            <br></br>
            <Button size="sm" variant="outline-success" disabled={!selected.project} onClick={handleEditProject}>UPDATE PROJECT</Button>
          </Form>
        </Tab>
      </Tabs>
      <br></br>
    </div>
  )
}

export default ProjectManagement
