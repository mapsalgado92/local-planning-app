import { OverlayTrigger, Tooltip } from "react-bootstrap"
import useWeeks from "../../hooks/useWeeks"

const CapacityViewer = ({ capacity, data, outputType, title, fromWeek }) => {

  const myWeeks = useWeeks(data)

  return (<>
    <span className="h3">{title ? title : "CAPACITY VIEWER"}
    </span>
    <div style={{ overflowX: "scroll" }} className="d-flex flex-row text-nowrap text-center w-100 ">
      <div className="d-flex flex-column bg-white sticky-horizontal border-end border-2 border-dark text-end">
        <h6 className="sticky-header-2 bg-primary text-white text-center mb-0 py-1 px-2">Field</h6>
        {data.fields && data.fields.filter(field => {
          if (outputType === "output") {
            return true
          } else {
            return field.aggregatable
          }
        }).map(field => <span className="border-bottom" key={field.internal}>{field.external}
          <OverlayTrigger
            overlay={
              <Tooltip>
                {field.description}
              </Tooltip>
            }
            placement="right"
          >
            <span className={"mx-2 " + (field.type === "capacity" ? " text-danger" : "")}><i className="fa fa-info-circle"></i></span>
          </OverlayTrigger>
        </span>)}
      </div>
      {
        capacity[outputType] && capacity[outputType].map(weekly => <div key={weekly.week.code} className="d-flex flex-column">
          <h6 className={"sticky-header-1 text-white border-end border-dark py-1 px-3 p-sticky mb-0 " + (myWeeks.getCurrentWeek().code === weekly.week.code ? "bg-danger" : "bg-dark")}>
            {weekly.week.firstDate.split("T")[0]}
            {weekly.Comment && <OverlayTrigger
              overlay={
                <Tooltip>
                  <p style={{ whiteSpace: "break-spaces" }} className="m-0 text-start">{weekly.Comment}</p>
                </Tooltip>
              }
              placement="bottom"

            >
              <i className="fa fa-exclamation-circle text-warning h6 position-absolute top-0"></i>

            </OverlayTrigger>
            }
          </h6>
          {
            data.fields && data.fields.filter(field => {
              if (outputType === "output") {
                return true
              } else {
                return field.aggregatable
              }
            }).map((field, index) => <span className={"border-bottom border-light " + (index % 2 === 0 ? "bg-light " : " ") + ((Math.round(weekly[field.internal] * 100) / 100) > 0 ? "text-primary" : (Math.round(weekly[field.internal] * 100) / 100) < 0 ? "text-danger" : "text-secondary")} key={field.internal + weekly.week.code}>{weekly[field.internal] ? Math.round(weekly[field.internal] * 100) / 100 : weekly[field.internal] === 0 ? 0 : "-"}</span>)
          }

        </div>)
      }
    </div >
  </>
  )
}

export default CapacityViewer
