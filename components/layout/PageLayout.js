import Header from "./Header"


const PageLayout = (props) => {
  return (
    <>
      <Header />
      {props.children}
      <footer className="footer text-center mt-auto border-top container p-4">
        An app by <span className="text-danger">Mario Salgado</span>
      </footer>
    </>
  )
}

export default PageLayout
