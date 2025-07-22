import { Footer } from "../components/Footer"
import { Navbar } from "../components/Navbar"
import { AboutEvent } from "../content-folders/About/About"

export const About = () => {
  return (
    <div>
        <Navbar/>
        <AboutEvent/>
        <Footer/>
    </div>
  )
}
