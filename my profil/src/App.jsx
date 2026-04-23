import { useEffect, useState } from 'react'
import './App.css'
import profilePhoto from './assets/profile-photo.jpg'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim() || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const profile = {
  name: 'Nithin M.U',
  initials: 'NM',
  title: 'Full Stack Developer | Front-End Developer | UI/UX Enthusiast | BCA Student',
  tagline:
    'Crafting modern, responsive web experiences with clean code, bold design, and pixel-perfect attention to detail.',
  status: 'Available for opportunities',
  location: 'India',
  email: 'munithin177@gmail.com',
  phone: '+91 9035886249',
  linkedin: 'https://www.linkedin.com/in/nithin-m-u-8bb2b0368/',
  summary:
    'I enjoy turning ideas into clean, accessible interfaces and growing through hands-on projects. My current focus is building reliable frontends, strengthening problem-solving skills, and creating applications that feel polished on both desktop and mobile.',
  highlights: [
    'React and modern JavaScript for interactive single-page apps.',
    'Responsive UI design with a strong focus on clarity and usability.',
    'A practical mindset shaped by project-based learning and continuous improvement.',
  ],
  skills: [
    'React',
    'JavaScript',
    'HTML5',
    'CSS3',
    'Responsive Design',
    'Full Stack Development',
    'Git & GitHub',
    'Java',
    'Python',
    'SQL',
    'Problem Solving',
  ],
  projects: [
    {
      title: 'Personal Portfolio',
      description:
        'A one-page portfolio that introduces my profile, technical strengths, and preferred way of working through a clean and mobile-friendly layout.',
      stack: 'React, Vite, CSS',
    },
    {
      title: 'Event Gift Planner',
      description:
        'A web application built with Angular and Firebase that helps users organize, track, and manage gifts for various events and occasions. Features include event planning, gift tracking, user authentication, and a responsive interface.',
      stack: 'Angular, TypeScript, Firebase, HTML, CSS',
      link: 'https://github.com/nithinmu177/gift-app',
    },
    {
      title: 'Frontend Practice Projects',
      description:
        'A collection of small applications built to strengthen component design, form handling, validation, and responsive user interfaces.',
      stack: 'React, JavaScript, APIs',
    },
    {
      title: 'UI Experiments and Learning Labs',
      description:
        'Hands-on interface exercises focused on layout systems, visual hierarchy, and translating concepts into usable web pages.',
      stack: 'HTML, CSS, JavaScript',
    },
  ],
}

const initialForm = {
  name: '',
  email: '',
  message: '',
}

function validateContact(values) {
  const errors = {}

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Please enter at least 2 characters.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  const messageLength = values.message.trim().length
  if (messageLength < 20 || messageLength > 1000) {
    errors.message = 'Message should be between 20 and 1000 characters.'
  }

  return errors
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking')

  const currentYear = new Date().getFullYear()
  const nameParts = profile.name.split(' ')
  const highlightedName = (
    <>
      {nameParts.slice(0, -1).join(' ')} <span className="hero-name-accent">{nameParts[nameParts.length - 1]}</span>
    </>
  )

  useEffect(() => {
    const healthUrl = `${apiBaseUrl}/api/health`

    const checkBackend = async () => {
      try {
        const response = await fetch(healthUrl)
        const payload = await response.json()

        setBackendStatus(payload?.ok ? 'online' : 'unavailable')
      } catch {
        setBackendStatus('offline')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateContact(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setToast('Please fix the highlighted fields before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result?.fieldErrors) {
          setErrors({
            name: result.fieldErrors.name?.[0] ?? '',
            email: result.fieldErrors.email?.[0] ?? '',
            message: result.fieldErrors.message?.[0] ?? '',
          })
        }

        throw new Error(result?.message || 'Unable to send your message right now.')
      }

      setToast(
        result?.email?.delivered
          ? 'Message sent successfully. Thanks for reaching out.'
          : 'Message saved successfully. Email notifications are not configured yet.',
      )
      setForm(initialForm)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while sending your message.'
      setToast(`Unable to send message. ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">{profile.initials}</span>
          <span>{profile.name}</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="status-badge">{profile.status}</p>
            <p className="eyebrow">Portfolio</p>
            <h1>{highlightedName}</h1>
            <p className="hero-title">{profile.title}</p>
            <p className="hero-summary">{profile.tagline}</p>

            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                Contact Me
              </a>
              <a className="button button-secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
                View LinkedIn
              </a>
            </div>
          </div>

          <aside className="hero-card" aria-label="Profile overview">
            <div className="avatar-frame">
              <img className="avatar-photo" src={profilePhoto} alt={`${profile.name} profile portrait`} />
            </div>
            <h2>{profile.name}</h2>
            <p>{profile.location}</p>
            <ul className="detail-list">
              <li>
                <span>Email</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
              <li>
                <span>Phone</span>
                <a href={`tel:${profile.phone.replace(/\s+/g, '')}`}>{profile.phone}</a>
              </li>
              <li>
                <span>LinkedIn</span>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  nithin-m-u-8bb2b0368
                </a>
              </li>
            </ul>
          </aside>
        </section>

        <section className="content-section" id="about">
          <div className="section-heading">
            <p className="eyebrow">About</p>
            <h2>Focused on practical growth and clean execution</h2>
          </div>

          <div className="about-grid">
            <p className="lead-text">
              I am building my career around frontend development, user-friendly interfaces, and the discipline of
              shipping work that is reliable and easy to understand. I like learning by doing, improving through
              iteration, and making each project cleaner than the last.
            </p>

            <div className="highlight-card">
              {profile.highlights.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section" id="skills">
          <div className="section-heading">
            <p className="eyebrow">Skills</p>
            <h2>Tools and strengths I bring to projects</h2>
          </div>

          <div className="chip-grid">
            {profile.skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="content-section" id="projects">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Work that reflects how I learn and build</h2>
          </div>

          <div className="project-grid">
            {profile.projects.map((project) => (
              <article className="project-card" key={project.title}>
                <p className="project-stack">{project.stack}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.link ? (
                  <a className="project-link" href={project.link} target="_blank" rel="noreferrer">
                    View Project
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="content-section contact-section" id="contact">
          <div className="section-heading">
            <p className="eyebrow">Contact</p>
            <h2>Let&apos;s talk about your next idea</h2>
          </div>

          <div className="contact-grid">
            <div className="contact-copy">
              <div className={`backend-status backend-status--${backendStatus}`}>
                Backend: {backendStatus === 'online' ? 'Connected' : backendStatus === 'checking' ? 'Checking...' : backendStatus === 'offline' ? 'Offline' : 'Unavailable'}
              </div>
              <p>
                If you&apos;re looking for someone who cares about clean UI, thoughtful implementation, and steady
                learning, I&apos;d love to connect.
              </p>
              <p>
                You can reach me directly at <a href={`mailto:${profile.email}`}>{profile.email}</a> or use the form
                to send your message through the portfolio backend.
              </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label>
                Name
                <input
                  className={errors.name ? 'input-error' : ''}
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
                {errors.name ? <span className="field-error">{errors.name}</span> : null}
              </label>

              <label>
                Email
                <input
                  className={errors.email ? 'input-error' : ''}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                {errors.email ? <span className="field-error">{errors.email}</span> : null}
              </label>

              <label>
                Message
                <textarea
                  className={errors.message ? 'input-error' : ''}
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me a bit about your idea, project, or collaboration."
                />
                {errors.message ? <span className="field-error">{errors.message}</span> : null}
              </label>

              <button className="button button-primary submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {toast ? <p className="toast-message">{toast}</p> : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>{profile.name} | {profile.email}</p>
        <p>Copyright {currentYear}. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
