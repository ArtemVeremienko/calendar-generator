import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const TEMPLATES_DIR_PATH = './templates'
const TEMPLATE_PATH = join(TEMPLATES_DIR_PATH, 'template.ics')
const NEW_CALENDAR_PATH = join(TEMPLATES_DIR_PATH, 'new-light.ics')

const createEvent = () => {
  return `BEGIN:VEVENT
DTSTART;TZID=Europe/Kiev:20230109T010000
DTEND;TZID=Europe/Kiev:20230109T050000
RRULE:FREQ=WEEKLY;BYDAY=MO
DTSTAMP:20240605T131334Z
UID:46bf67q1r9tqnhoh3m2cq9q09o@google.com
CLASS:PRIVATE
CREATED:20230104T134528Z
LAST-MODIFIED:20230104T135018Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:light on
TRANSP:OPAQUE
END:VEVENT`
}

const createCalendar = async () => {
  const template = await readFile(TEMPLATE_PATH, 'utf8')
  const event = createEvent()
  const calendar = template.replace('// insert events', event)
  writeFile(NEW_CALENDAR_PATH, calendar)
}

createCalendar()
