
const useWeeks = (data) => {

  const getCurrentWeek = () => {
    let today = new Date()
    return data.weeks.find(week =>
      week.firstDate > today.toISOString()
    )
  }

  const getWeek = ({ value, type }) => {
    return data.weeks.find(week => week[type] === value)
  }

  const getWeekRange = (fromWeek, toWeek) => {
    if (toWeek) {
      return data.weeks.slice(data.weeks.indexOf(getWeek({ value: fromWeek, type: "code" })), 1 + data.weeks.indexOf(getWeek({ value: toWeek, type: "code" })))
    } else {
      return data.weeks.slice(data.weeks.indexOf(getWeek({ value: fromWeek, type: "code" })))
    }

  }

  const getMonth = (week) => {
    return week.firstDate.split("T")[0].split("-")[2]
  }

  return (
    {
      getCurrentWeek,
      getWeek,
      getWeekRange,
      getMonth
    }
  )
}

export default useWeeks
