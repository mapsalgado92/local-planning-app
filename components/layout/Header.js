import Link from 'next/link'
import Image from 'next/image'


const Header = () => {

  return (
    <nav className="navbar">
      <div className="container">
        <div className="d-flex flex-row">
          <Image alt="logo" src={"/android-chrome-192x192.png"} height={40} width={40} ></Image>
          <Link href="/"><a className="navbar-brand text-danger ms-3">planning app</a></Link>
        </div>

        <ul className="navbar-nav mr-auto d-flex flex-row align-items-center">


          <li className="nav-item">
            <Link href="/management" ><a className="nav-link mx-3 border-bottom">Management</a></Link>
          </li>

          <li className="nav-item">
            <Link href="/entries" ><a className="nav-link mx-3 border-bottom">Entries</a></Link>
          </li>
          <li className="nav-item">
            <Link href="/capacity" ><a className="nav-link mx-3 border-bottom" >Capacity</a></Link>
          </li>
          <li className="nav-item">
            <Link href="/aggregate" ><a className="nav-link mx-3 border-bottom" >Aggregate</a></Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Header
