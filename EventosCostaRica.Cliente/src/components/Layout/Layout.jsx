import Header from "./Header"
import Footer from "./Footer"
import "./Layout.css"

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="layout-main-content">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
