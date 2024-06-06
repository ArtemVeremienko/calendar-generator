import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { format, set, add, setDay } from 'date-fns'
import schedule from './schedule.json' with { type: 'json' }

const TEMPLATE_PATH = './template.ics'
const NEW_CALENDAR_PATH = join('./dist', 'blackout.ics')

const HOURS_IN_DAY = 24
const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const formatByDay = (dayOfWeek) => dayOfWeek.slice(0, 2).toUpperCase()

const formatDate = (date) => format(date, "yyyyMMdd'T'HHmmss")

const formatTimestampToUTC = (date) => {
  const dateWithoutTimezone = add(date, { minutes: date.getTimezoneOffset() })
  return format(dateWithoutTimezone, "yyyyMMdd'T'HHmmss'Z'")
}

const getDates = (start, end, dayIndex) => {
  const duration = (end + HOURS_IN_DAY - start) % HOURS_IN_DAY
  const initial = set(setDay(new Date(), dayIndex), {
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const startDatetime = set(initial, { hours: start })
  const endDatetime = add(startDatetime, { hours: duration })

  return {
    startDatetime: formatDate(startDatetime),
    endDatetime: formatDate(endDatetime),
    timestamp: formatTimestampToUTC(startDatetime),
  }
}

const createEvent = ({ summary, day, start, end, dayIndex }) => {
  // dtstamp, uid, dtstart, dtend | duraWtion - are required
  const byDay = formatByDay(day)
  const { startDatetime, endDatetime, timestamp } = getDates(
    start,
    end,
    dayIndex
  )

  return `BEGIN:VEVENT
DTSTAMP:${timestamp}
UID:${timestamp}@google.com
DTSTART;TZID=Europe/Kiev:${startDatetime}
DTEND;TZID=Europe/Kiev:${endDatetime}
RRULE:FREQ=WEEKLY;BYDAY=${byDay}
CLASS:PRIVATE
STATUS:CONFIRMED
SUMMARY:${summary}
TRANSP:OPAQUE
END:VEVENT`
}

const getRecords = (data) => {
  return Object.entries(data)
    .map(([day, records]) => {
      const dayIndex = DAYS_OF_WEEK.findIndex((d) => d === day)

      return records.map(({ summary, time }) => ({
        day,
        dayIndex,
        summary,
        start: parseInt(time.split('-')[0]),
        end: parseInt(time.split('-')[1]),
      }))
    })
    .flat()
}

const createCalendar = async () => {
  const template = await readFile(TEMPLATE_PATH, 'utf8')
  const records = getRecords(schedule)
  const events = records.map(createEvent).join('\n')
  const calendar = template.replace('// insert events', events)
  writeFile(NEW_CALENDAR_PATH, calendar)
}

createCalendar()
