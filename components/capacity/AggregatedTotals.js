import { Col, Row } from "react-bootstrap"


const AggregatedTotals = ({ capacity }) => {
  return (
    <>
      <Row>
        <Col>
          <span className="h3">Sums</span>
          {capacity.aggTotals && capacity.aggTotals.sums && capacity.aggTotals.sums.map(sum =>
            <h5 key={"sums-" + sum.field._id}>{`${sum.field.external} -> ${sum.value}`}</h5>
          )}
        </Col>
        <Col>
          <span className="h3">Averages</span>
          {capacity.aggTotals && capacity.aggTotals.averages && capacity.aggTotals.averages.map(sum =>
            <h5 key={"averages-" + sum.field._id}>{`${sum.field.external} -> ${Math.round(sum.value * 100) / 100}`}</h5>
          )}
        </Col>
        <Col>
          <span className="h3">Rates</span>
          {capacity.aggTotals && capacity.aggTotals.calculated && capacity.aggTotals.calculated.map(sum =>
            <h5 key={"calculated-" + sum.field._id}>{`${sum.field.external} -> ${Math.round(sum.value * 10000) / 100} %`}</h5>
          )}
        </Col>

      </Row>

    </>
  )
}

export default AggregatedTotals
