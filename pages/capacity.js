import Head from "next/head"
import { useState } from "react"
import {
  ListGroup,
  Button,
  Container,
  Form,
  DropdownButton,
  InputGroup,
  Modal,
  Row,
  Col,
} from "react-bootstrap"
import SQLTable from "../components/capacity/SQLTable"
import { connectToDatabase } from "../lib/mongodb"
import useCapacity from "../hooks/useCapacity"
import CapacityViewer from "../components/capacity/CapacityViewer"
import useWeeks from "../hooks/useWeeks"
import TotalPercentageChart from "../components/capacity/TotalPercentageChart"
import EntriyForm from "../components/entries/EntryForm"

const Capacity = (props) => {
  const [data, setData] = useState(props)
  const [selected, setSelected] = useState({})
  const [formInfo, setFormInfo] = useState({})
  const [modalShow, setModalShow] = useState(false)
  const capacity = useCapacity(data)

  const myWeeks = useWeeks(data)

  const handleSelect = async (item, type) => {
    if (type === "project") {
      setSelected({ project: item, lob: null, capPlan: null })
    } else if (type === "lob") {
      setSelected({ ...selected, lob: item, capPlan: null })
    } else if (type === "capPlan") {
      setSelected({ ...selected, capPlan: item })
    } else if (type === "entryWeek") {
      setSelected({ ...selected, entryWeek: item })
    } else if (type === "week") {
      if (selected.fromWeek && selected.fromWeek.firstDate > item.firstDate) {
        setSelected({ ...selected, fromWeek: item, week: item })
        setFormInfo({ ...formInfo, fromWeek: item.code, toWeek: item.code })
      } else {
        setSelected({ ...selected, week: item })
        setFormInfo({ ...formInfo, toWeek: item.code })
      }
    } else if (type === "fromWeek") {
      if (selected.week && selected.week.firstDate < item.firstDate) {
        setSelected({ ...selected, fromWeek: item, week: item })
        setFormInfo({ ...formInfo, fromWeek: item.code, toWeek: item.code })
      } else {
        setSelected({ ...selected, fromWeek: item })
        setFormInfo({ ...formInfo, fromWeek: item.code })
      }
    }
  }

  const handleShowModal = () => {
    setModalShow(true)
  }

  const handleHideModal = () => {
    setModalShow(false)
    capacity.generate(selected.capPlan, formInfo.toWeek, selected.fromWeek)
  }

  const handleUpdateRaw = () => {
    capacity.rawUpdate(selected.capPlan)
  }

  return (
    <>
      <Head>
        <title>Planning App | Capacity</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className="mt-4">
          <h2 className="text-center text-danger">Capacity</h2>
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

            <br></br>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <div className="me-4">
                    <Form.Label as="h4">From Week</Form.Label>
                    <DropdownButton
                      size="sm"
                      variant="danger"
                      className="me-2"
                      title={
                        selected.fromWeek
                          ? selected.fromWeek.code +
                            " - " +
                            selected.fromWeek.firstDate.split("T")[0]
                          : "Select a Week"
                      }
                      disabled={!selected.capPlan}
                    >
                      <ListGroup variant="flush">
                        {selected.capPlan &&
                          myWeeks.getWeekRange(selected.capPlan.firstWeek) &&
                          myWeeks
                            .getWeekRange(selected.capPlan.firstWeek)
                            .map((week) => (
                              <ListGroup.Item
                                key={week._id}
                                action
                                className={
                                  "rounded-0 flush" +
                                  (myWeeks.getCurrentWeek().code === week.code
                                    ? " border border-danger text-danger"
                                    : "")
                                }
                                variant={
                                  selected.week &&
                                  week.code === selected.week.code
                                    ? "warning"
                                    : "light"
                                }
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleSelect(week, "fromWeek")
                                }}
                              >
                                {week.firstDate.split("T")[0]}
                              </ListGroup.Item>
                            ))}
                      </ListGroup>
                    </DropdownButton>
                  </div>
                  <div>
                    <Form.Label as="h4">To Week</Form.Label>
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
                          myWeeks.getWeekRange(selected.capPlan.firstWeek) &&
                          myWeeks
                            .getWeekRange(selected.capPlan.firstWeek)
                            .map((week) => (
                              <ListGroup.Item
                                key={week._id}
                                action
                                className={
                                  "rounded-0 flush" +
                                  (myWeeks.getCurrentWeek().code === week.code
                                    ? " border border-danger text-danger"
                                    : "")
                                }
                                variant={
                                  selected.week &&
                                  week.code === selected.week.code
                                    ? "warning"
                                    : "light"
                                }
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleSelect(week, "week")
                                }}
                              >
                                {week.firstDate.split("T")[0]}
                              </ListGroup.Item>
                            ))}
                      </ListGroup>
                    </DropdownButton>
                  </div>
                </InputGroup>

                <br />

                <Button
                  size="sm"
                  onClick={() =>
                    capacity.generate(
                      selected.capPlan,
                      formInfo.toWeek,
                      selected.fromWeek
                    )
                  }
                  variant="dark"
                  disabled={!selected.week}
                >
                  GENERATE CAPACITY
                </Button>
                <Button
                  onClick={handleUpdateRaw}
                  size={"sm"}
                  disabled={!capacity.output}
                  variant="danger"
                  className="m-2"
                >
                  Update Raw
                </Button>
                <br />
                <br />
              </Col>
              <Col md={6}>
                <Form.Label as="h4">Entry Week</Form.Label>
                <DropdownButton
                  size="sm"
                  variant="warning"
                  className="me-2"
                  title={
                    selected.entryWeek
                      ? selected.entryWeek.code +
                        " - " +
                        selected.entryWeek.firstDate.split("T")[0]
                      : "Select a Week"
                  }
                  disabled={!selected.capPlan}
                >
                  <ListGroup variant="flush">
                    {selected.capPlan &&
                      myWeeks.getWeekRange(selected.capPlan.firstWeek) &&
                      myWeeks
                        .getWeekRange(selected.capPlan.firstWeek)
                        .map((week) => (
                          <ListGroup.Item
                            key={week._id}
                            action
                            className={
                              "rounded-0 flush" +
                              (myWeeks.getCurrentWeek().code === week.code
                                ? " border border-danger text-danger"
                                : "")
                            }
                            variant={
                              selected.entryWeek &&
                              week.code === selected.entryWeek.code
                                ? "warning"
                                : "light"
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              handleSelect(week, "entryWeek")
                            }}
                          >
                            {week.code + " - " + week.firstDate.split("T")[0]}
                          </ListGroup.Item>
                        ))}
                  </ListGroup>
                </DropdownButton>
                <br />

                <Button
                  size="sm"
                  onClick={handleShowModal}
                  variant="dark"
                  disabled={!selected.entryWeek}
                >
                  EDIT ENTRY
                </Button>
                <br />
                <br />
              </Col>
            </Row>
          </Form>
          <br />
          <br />
          {capacity.output && (
            <CapacityViewer
              data={data}
              capacity={capacity}
              outputType={"output"}
            ></CapacityViewer>
          )}
          <br />
          <br />

          {capacity.output && (
            <>
              <h3 className="text-center mb-0">FTE vs Attrition</h3>
              <TotalPercentageChart
                data={capacity.output}
                lines={["billableFTE", "totalFTE", "expectedFTE"]}
                percentages={["attrPercent", "fcAttrition"]}
              />
            </>
          )}
          <br />
          <br />

          {capacity.output && (
            <>
              <h3 className="text-center mb-0">Training</h3>
              <TotalPercentageChart
                data={capacity.output}
                lines={["trainees", "nesting"]}
                bars={["trCommit"]}
              />
            </>
          )}
          <br />
          <br />

          {capacity.output && (
            <SQLTable
              input={capacity.getTable(data.fields)}
              title="Capacity View"
            />
          )}

          <br />
        </Container>

        <Modal size="xl" show={modalShow} onHide={handleHideModal}>
          <Modal.Body>
            <EntriyForm
              selected={selected}
              week={selected.entryWeek}
              capacity={capacity}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleHideModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </>
  )
}

export default Capacity

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
    .sort({ order: 1 })
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
