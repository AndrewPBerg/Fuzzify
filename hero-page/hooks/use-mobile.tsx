import * as React from "react"

export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024
export const DESKTOP_BREAKPOINT = 1280

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Create media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Define handler
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Use the newer addEventListener API with fallback
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    } else {
      // Fallback for older browsers
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    }
  }, [])

  return isMobile
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    // Initial check
    checkBreakpoint()
    
    // Add resize listener
    window.addEventListener('resize', checkBreakpoint)
    
    return () => {
      window.removeEventListener('resize', checkBreakpoint)
    }
  }, [])
  
  return breakpoint
}
