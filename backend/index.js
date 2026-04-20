import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import nodemailer from 'nodemailer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const submissionsPath = path.join(dataDir, 'contact-submissions.json')

const app = express()
const port = Number(process.env.PORT || 3001)
const ownerEmail = process.env.OWNER_EMAIL || 'munithin177@gmail.com'
const allowedOrigins = new Set(
  [process.env.CLIENT_ORIGIN || 'http://localhost:5173', 'http://localhost:3001'].filter(Boolean),
)

const submissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(20).max(1000),
})

app.use(
  cors({
    origin(origin, callback) {
      const isLocalVite = typeof origin === 'string' && /^http:\/\/localhost:517\d$/.test(origin)

      if (!origin || allowedOrigins.has(origin) || isLocalVite) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
  }),
)
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    ok: true,
    message: 'Portfolio backend is running.',
    health: 'http://localhost:3001/api/health',
  })
})

function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  })
}

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true })

  try {
    await fs.access(submissionsPath)
  } catch {
    await fs.writeFile(submissionsPath, '[]', 'utf8')
  }
}

async function readSubmissions() {
  await ensureStorage()
  const raw = await fs.readFile(submissionsPath, 'utf8')
  return JSON.parse(raw)
}

async function writeSubmission(submission) {
  const submissions = await readSubmissions()
  submissions.unshift(submission)
  await fs.writeFile(submissionsPath, JSON.stringify(submissions, null, 2), 'utf8')
}

async function sendEmails(submission) {
  const transporter = createTransporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!transporter || !from) {
    return {
      delivered: false,
      reason: 'SMTP is not configured yet.',
    }
  }

  await transporter.sendMail({
    from,
    to: ownerEmail,
    replyTo: submission.email,
    subject: `New portfolio enquiry from ${submission.name}`,
    text: [
      'A new portfolio contact form submission was received.',
      '',
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      '',
      'Message:',
      submission.message,
    ].join('\n'),
  })

  await transporter.sendMail({
    from,
    to: submission.email,
    subject: 'Thanks for reaching out to Nithin M.U',
    text: [
      `Hi ${submission.name},`,
      '',
      'Thanks for reaching out through my portfolio.',
      'I received your message and will get back to you as soon as possible.',
      '',
      'Your message:',
      submission.message,
      '',
      'Best regards,',
      'Nithin M.U',
    ].join('\n'),
  })

  return {
    delivered: true,
  }
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    ownerEmail,
    smtpConfigured: Boolean(createTransporter()),
  })
})

app.post('/api/contact', async (request, response) => {
  try {
    const payload = submissionSchema.parse(request.body)
    const submission = {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    }

    await writeSubmission(submission)

    let emailResult = {
      delivered: false,
      reason: 'SMTP is not configured yet.',
    }

    try {
      emailResult = await sendEmails(submission)
    } catch (error) {
      emailResult = {
        delivered: false,
        reason: error instanceof Error ? error.message : 'Email delivery failed.',
      }
    }

    response.status(201).json({
      success: true,
      submission,
      email: emailResult,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({
        success: false,
        message: 'Please check the contact form fields.',
        fieldErrors: error.flatten().fieldErrors,
      })
      return
    }

    response.status(500).json({
      success: false,
      message: 'Unable to save your message right now.',
    })
  }
})

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`)
})
