import { CSVDownloader } from "react-papaparse"

const SQLTable = ({ input, title }) => {
  return (
    <div className="d-flex flex-column align-items-center text-center ">
      <span className="h3">
        {title ? title : "DATA VIEWER"}
        {input.data.entries && (
          <CSVDownloader
            data={input.data.entries.map((entry) => {
              let entryObj = {}
              input.data.header.forEach((field, index) => {
                entryObj[field] = entry[index]
              })
              return entryObj
            })}
            filename={"data"}
          >
            <button className="btn btn-success btn-sm ms-2">
              Download CSV
            </button>
          </CSVDownloader>
        )}
      </span>
      <div className="sql-scroll w-100">
        {input.isConverted && input.data.entries.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                {input.data.header.map((item) => (
                  <th
                    scope="col"
                    className="text-nowrap"
                    key={"header-" + item}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {input.data.entries.map((entry, index1) => {
                return (
                  <tr key={"entry-" + index1}>
                    {entry.map((field, index2) => (
                      <td
                        key={"field-" + field + index1 + index2}
                        className="text-nowrap"
                      >
                        {field}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <span>Waiting for Data</span>
        )}
      </div>
    </div>
  )
}

export default SQLTable
