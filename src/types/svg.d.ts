// SVG imports with ?url suffix for URL strings
declare module '*.svg?url' {
  const content: string
  export default content
}

// Default SVG imports as URL strings (for backward compatibility)
declare module '*.svg' {
  const content: string
  export default content
}

