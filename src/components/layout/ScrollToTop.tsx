import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const section = document.getElementById(hash.replace("#", ""))

      if (section) {
        requestAnimationFrame(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" })
        })

        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [hash, pathname, search])

  return null
}
