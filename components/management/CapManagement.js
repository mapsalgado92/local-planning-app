import { Button, DropdownButton, ListGroup, Form, Tabs, Tab, InputGroup } from "react-bootstrap"
import { useState } from 'react'

const CapManagement = ({ data, refresh }) => {
  const [selected, setSelected] = useState({ project: null, lob: null, capPlan: null })
  const [formInfo, setFormInfo] = useState({})

  const handleSelect = (item, type) => {

    if (type === "project") {
      setSelected({ project: item, lob: null, capPlan: null })
    } else if (type === "lob") {
      setSelected({ ...selected, lob: item, capPlan: null })
    } else {
      setSelected({ ...selected, [type]: item })
    }

    if (type === "capPlan") {
      setFormInfo({
        firstWeek: item.firstWeek,
        startingHC: item.startingHC,
        active: item.active,
        name: item.name
      })
    } else {
      setFormInfo({ firstWeek: "", startingHC: "", active: "false", name: "" })
    }
  }

  const handleChange = (e, field) => {
    setFormInfo({ ...formInfo, [field]: e.target.value })
  }

  const handleAddCapPlan = async () => {

    let capPlan = { name: selected.project.name + "_" + selected.lob.name + "_" + selected.language.name + "_capPlan", lob: selected.lob._id, language: selected.language._id }
    let res = await fetch("/api/capPlans",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: capPlan
        })
      })

    console.log(res)

    refresh("capPlans")
    setSelected({ project: null, lob: null, capPlan: null })
  }

  const handleEditCapPlan = async () => {

    let capPlan = { ...selected.capPlan, ...formInfo }

    let res = await fetch("/api/capPlans",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: capPlan
        })
      })

    let url = `api/capEntries/week=${formInfo.firstWeek}/capPlan=${selected.capPlan._id}`

   

    res = await fetch(url).then(response => response.json())

    

    if (res.length === 0) {
      res = await fetch("api/capEntries",
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: {
              capPlan: selected.capPlan._id,
              week: formInfo.firstWeek,
              trWeeks: selected.lob.config.trWeeks,
              ocpWeeks: selected.lob.config.ocpWeeks,
              tgAHT: selected.lob.config.tgAHT,
              tgSL: selected.lob.config.tgSL
            }
          })
        }
      )
    } else {
      console.log("THERE IS ALREADY A STARTING ENTRY FOR THIS CAPACITY PLAN")
    }



    refresh("capPlans")
    setSelected({ project: null, lob: null, capPlan: null })
    setFormInfo({})
  }

  return (
    <div>
      <h3>Capacity Plans</h3>
      <Tabs defaultActiveKey="new" id="uncontrolled-tab-example">
        <Tab eventKey="new" title="new">
          <Form>
            <Form.Label as="h5" className="mt-4">Selection</Form.Label>
            <InputGroup>

              <DropdownButton size="sm" className="me-2" title={selected.project ? selected.project.name : "Select a Project"} disabled={data.projects === 0}>
                <ListGroup variant="flush">
                  {data.projects && data.projects.map(project =>
                    <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project, "project") }}>
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
            <Form.Label as="h5" className="mt-4">Language</Form.Label>
            <DropdownButton size="sm" className="me-2" title={selected.language ? selected.language.name : "Select a Language"} disabled={data.languages === 0}>
              <ListGroup variant="flush">
                {data.languages && data.languages.map(language =>
                  <ListGroup.Item key={language._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(language, "language") }}>
                    {language.name}
                  </ListGroup.Item>)}
              </ListGroup>
            </DropdownButton>

            <Form.Label as="h5" className="mt-4">Capacity Plan Name</Form.Label>

            <Form.Control
              readOnly
              placeholder="Capacity Plan Name"
              aria-label="Capacity Plan Name"
              value={(selected.lob && selected.language) ? selected.project.name + "_" + selected.lob.name + "_" + selected.language.name + "_capPlan" : ""}
            />

            <br />

            <Button size="sm" variant="outline-success" onClick={handleAddCapPlan} disabled={!(selected.lob && selected.language)}>ADD CAPACITY PLAN</Button>

          </Form>


        </Tab>
        <Tab eventKey="edit" title="edit">
          <Form>
            <Form.Label as="h5" className="mt-4">Selection</Form.Label>
            <InputGroup>

              <DropdownButton size="sm" className="me-2" title={selected.project ? selected.project.name : "Select a Project"} disabled={data.projects === 0}>
                <ListGroup variant="flush">
                  {data.projects && data.projects.map(project =>
                    <ListGroup.Item key={project._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(project, "project") }}>
                      {project.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>


              <DropdownButton size="sm" className="me-2" title={selected.lob ? selected.lob.name : "Select a LOB"} disabled={!selected.project}>
                <ListGroup variant="flush">
                  {selected.project && data.lobs.filter(lob => lob.project === selected.project._id) && data.lobs.filter(lob => lob.project === selected.project._id).map(lob =>
                    <ListGroup.Item key={lob._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(lob, "lob") }}>
                      {lob.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>

              <DropdownButton size="sm" className="me-2" title={selected.capPlan ? selected.capPlan.name : "Select a Capacity Plan"} disabled={!selected.lob}>
                <ListGroup variant="flush">
                  {selected.lob && data.capPlans.filter(capPlan => capPlan.lob === selected.lob._id) && data.capPlans.filter(capPlan => capPlan.lob === selected.lob._id).map(capPlan =>
                    <ListGroup.Item key={capPlan._id} action className="rounded-0 flush" onClick={(e) => { e.preventDefault(); handleSelect(capPlan, "capPlan") }}>
                      {capPlan.name}
                    </ListGroup.Item>)}
                </ListGroup>
              </DropdownButton>

            </InputGroup>

            <Form.Label as="h5" className="mt-4">Name</Form.Label>
            <Form.Control
              placeholder="Custom Name"
              aria-label="Custom Name"
              value={formInfo.name ? formInfo.name : ""}
              onChange={(e) => handleChange(e, "name")}
            />

            <Form.Label as="h5" className="mt-4">Active</Form.Label>
            <Form.Check
              placeholder="Active Capacity Plan"
              aria-label="Active Capacity Plan"
              checked={formInfo.active ? formInfo.active : false}
              onChange={() => setFormInfo({ ...formInfo, active: !formInfo.active })}
            />


            <Form.Label as="h5" className="mt-4">First Week</Form.Label>
            <Form.Control
              placeholder="First Week (YYYYw#)"
              aria-label="First Week"
              value={formInfo.firstWeek ? formInfo.firstWeek : ""}
              onChange={(e) => handleChange(e, "firstWeek")}
            />
            <Form.Label as="h5" className="mt-4">Starting HC</Form.Label>
            <Form.Control
              placeholder="Starting HC"
              aria-label="Starting HC"
              value={formInfo.startingHC ? formInfo.startingHC : ""}
              onChange={(e) => handleChange(e, "startingHC")}
            />
          </Form>

          <br />

          <Button size="sm" variant="outline-success" onClick={handleEditCapPlan} disabled={!selected.capPlan}>UPDATE CAPACITY PLAN</Button>

        </Tab>

      </Tabs>
      <br></br>
    </div >
  )
}

export default CapManagement
