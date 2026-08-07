import { useEffect } from 'react'

export function SEO({ title, description, keywords = '' }) {
  useEffect(() => {
    document.title = title
    
    // Description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }

    // Keywords
    const defaultKeywords = 'AI healthcare assistant, AI symptom checker, digital healthcare platform, medical AI assistant, personal health companion'
    const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', finalKeywords)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content = finalKeywords
      document.head.appendChild(meta)
    }
  }, [title, description, keywords])

  return null
}
