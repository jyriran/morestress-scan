/*
 * MoreStress scan designs.
 *
 * Each entry is one printed design the scanner can recognise.
 * The ORDER matters: it must match the order of images compiled into
 * designs/targets.mind (the build workflow compiles them in this order).
 *
 * To add a design: flatten the print to designs/<id>/target.jpg, add an
 * entry below, push. The GitHub workflow recompiles targets.mind and
 * redeploys the site.
 *
 * overlay.box is where the animated stress meter is drawn on top of the
 * print, in fractions of the target image (0..1). Pick the printed area
 * the meter should replace, ideally a solid dark block.
 */
window.MS_DESIGNS = [
  {
    id: "academic-status",
    name: "Academic System Status",
    product: "Tee",
    target: "designs/academic-status/target.jpg",
    thumb: "designs/academic-status/thumb.jpg",
    // width / height of target.jpg
    width: 1000,
    height: 977,
    shopUrl: "https://www.etsy.com/listing/4574008871/funny-student-t-shirt-academic-system",
    shopLabel: "Get the tee on Etsy",
    overlay: {
      // the black STRESS LOAD panel on the print
      box: { x: 0.004, y: 0.447, w: 0.979, h: 0.305 },
      label: "STRESS LOAD",
      segments: 10,
      ink: "#0b0e0b",
      accent: "#c6ff00",
      text: "#f1f0e9",
      dim: "#3a4033",
      warn: "#ff5b3a"
    },
    verdicts: "student"
  }
];

/*
 * Verdict packs. A design points at one pack by name.
 * load = how full the meter gets (percent). Keep it student humour,
 * never a real assessment.
 */
window.MS_VERDICTS = {
  student: [
    { title: "LIGHTLY COOKED", load: 81, note: "Still attending. Mentally buffering." },
    { title: "FOCUS WINDOW: 11 MINUTES", load: 88, note: "Make them count. Or open another tab." },
    { title: "DEADLINE: SPIRITUALLY TOMORROW", load: 96, note: "Your calendar would like a word." },
    { title: "GROUP PROJECT: CONTRIBUTION PENDING", load: 92, note: "Someone is typing. Allegedly." },
    { title: "CREDITS: STILL UNCHANGED", load: 84, note: "All that effort. Same number of credits." },
    { title: "LOCK IN (UNFORTUNATELY)", load: 99, note: "The academic system requests your attention." },
    { title: "SYLLABUS: UNREAD", load: 87, note: "It was on the first page. It was always on the first page." },
    { title: "SLEEP DEBT: REFINANCED", load: 94, note: "Interest is due at 8am." },
    { title: "READING: SKIMMED THE TITLE", load: 83, note: "Confidence is carrying the discussion post." },
    { title: "ATTENDANCE: PHYSICALLY", load: 79, note: "Mind left the building around slide 4." },
    { title: "CAFFEINE: LOAD-BEARING", load: 97, note: "Do not remove. Structure may fail." },
    { title: "EMAIL DRAFT: 3 DAYS OLD", load: 86, note: "\"Sorry for the late reply\" is doing a lot of work." },
    { title: "OFFICE HOURS: AVOIDED", load: 82, note: "The professor is right there. You are not." },
    { title: "MIDTERM: VIBES-BASED", load: 93, note: "Studied the energy, not the material." },
    { title: "WORD COUNT: 212 OF 3000", load: 95, note: "Increasing font size is not a strategy." },
    { title: "BRAIN: 47 TABS OPEN", load: 91, note: "One of them is playing music. Find it." },
    { title: "TO-DO LIST: DECORATIVE", load: 85, note: "Color-coded. Untouched." },
    { title: "LAB REPORT: CONCEPTUAL", load: 89, note: "The data exists in your heart." },
    { title: "GPA: PLEASE HOLD", load: 90, note: "Your call is important to the registrar." },
    { title: "SEMESTER: SPEEDRUN MODE", load: 98, note: "Skipping cutscenes. And lectures." },
    { title: "NAP: STRATEGIC", load: 80, note: "Four hours is technically a nap." },
    { title: "PANIC: SCHEDULED", load: 96, note: "Pencilled in for the night before. As always." },
    { title: "PROCRASTINATION: PRODUCTIVE", load: 84, note: "Room is clean. Essay is not." },
    { title: "WIFI: BLAMED", load: 88, note: "The upload failed. Emotionally." },
    { title: "FINALS: LOADING", load: 99, note: "Please do not turn off your student." },
    { title: "BANK BALANCE: ACADEMIC", load: 92, note: "Instant noodles, but make it a lifestyle." },
    { title: "GROUP CHAT: 214 UNREAD", load: 87, note: "Someone made a decision without you. Good." },
    { title: "THESIS: AN IDEA, LOOSELY", load: 94, note: "Your advisor said \"interesting.\" Not in a good way." },
    { title: "PRINTER: AGAINST YOU", load: 91, note: "It knows it is due in 6 minutes." },
    { title: "EXTENSION: MANIFESTING", load: 89, note: "Drafting the email. Rewriting the email. Not sending the email." },
    { title: "MOTIVATION: OUT OF OFFICE", load: 86, note: "Auto-reply: back after finals." },
    { title: "ALARM: SNOOZED x6", load: 93, note: "Each snooze was a choice. Each was wrong." }
  ]
};
