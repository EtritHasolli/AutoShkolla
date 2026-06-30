// Online theory courses. Authored by owner/admin, taken by students.
// Each question has multiple options; one or more can be correct (multi-select).

export const initialCourses = [
  {
    id: 'c1',
    title: 'Road Signs & Signals',
    desc: 'Recognise the most common Kosovo road signs and traffic signals.',
    questions: [
      {
        id: 'q1',
        text: 'Which of the following are mandatory (blue, round) signs?',
        image: null,
        explanation: 'Mandatory signs are blue and round — they tell you what you must do.',
        options: [
          { id: 'o1', text: 'Turn right ahead', correct: true },
          { id: 'o2', text: 'No entry', correct: false },
          { id: 'o3', text: 'Minimum speed', correct: true },
          { id: 'o4', text: 'Yield', correct: false },
        ],
      },
      {
        id: 'q2',
        text: 'A red triangular sign means…',
        image: null,
        explanation: 'Red triangular signs are warning signs.',
        options: [
          { id: 'o1', text: 'Warning / danger ahead', correct: true },
          { id: 'o2', text: 'Prohibition', correct: false },
          { id: 'o3', text: 'Information', correct: false },
        ],
      },
      {
        id: 'q3',
        text: 'When a traffic light shows amber (yellow), you should…',
        image: null,
        explanation: 'Amber means stop unless you are too close to do so safely.',
        options: [
          { id: 'o1', text: 'Stop if it is safe to do so', correct: true },
          { id: 'o2', text: 'Speed up to cross', correct: false },
          { id: 'o3', text: 'Continue only if already crossing', correct: true },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Right of Way Rules',
    desc: 'Priority at intersections, roundabouts and pedestrian crossings.',
    questions: [
      {
        id: 'q1',
        text: 'At an unmarked intersection, who has priority?',
        image: null,
        explanation: 'In right-hand traffic, give way to vehicles coming from your right.',
        options: [
          { id: 'o1', text: 'The vehicle coming from the right', correct: true },
          { id: 'o2', text: 'The faster vehicle', correct: false },
          { id: 'o3', text: 'The larger vehicle', correct: false },
        ],
      },
    ],
  },
];
