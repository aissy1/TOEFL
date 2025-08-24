<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TestUnitController extends Controller
{
    public function ThrowSession(Request $request)
    {
        $username = $request->input('username');
        session(['username' => $username]);

        return redirect()->route('test.show', ['section' => 'general']);
    }


    public function subtestShow($section = 'general')
    {

        $username = session('username');
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);

        $answeredCounts = [
            'reading' => (bool) session("AnsweredCountReading", false),
            'listening' => (bool) session('AnsweredCountListening', false),
            'speaking' => (bool) session('AnsweredCountSpeaking', false),
            'writing' => (bool) session('AnsweredCountWriting', false),
        ];

        // render halaman test (test-question.tsx)
        if (str_ends_with($section, '-question')) {
            //render question
            $questions = match ($section) {
                'reading-question' => $this->getReadingQuestions(),
                'listening-question' => $this->getListeningQuestions(),
                'speaking-question' => $this->getSpeakingQuestions(),
                'writing-question' => $this->getWritingQuestions(),
                default => [],
            };

            return Inertia::render('test-question', [
                'section' => $section,
                'username' => $username,
                'readingScore' => $readingScore,
                'listeningScore' => $listeningScore,
                'speakingScore' => $speakingScore,
                'writingScore' => $writingScore,
                'answeredCounts' => $answeredCounts,
                'questions' => $questions,
            ]);
        }

        // render halaman info (test-unit.tsx)
        return Inertia::render('test-unit', [
            'section' => $section,
            'username' => $username,
            'readingScore' => $readingScore,
            'listeningScore' => $listeningScore,
            'speakingScore' => $speakingScore,
            'writingScore' => $writingScore,
        ]);
    }

    public function submitTest(Request $request)
    {
        $section = $request->input('section');
        $score = $request->input('score'); // jawaban user

        switch ($section) {
            case "reading-question":
                session(['ReadingScore' => $score]);
                session(['AnsweredCountReading' => true]);
                break;
            case "listening-question":
                session(['ListeningScore' => $score]);
                session(['AnsweredCountListening' => true]);
                break;
            case "speaking-question":
                session(['SpeakingScore' => $score]);
                session(['AnsweredCountSpeaking' => true]);
                break;
            case "writing-question":
                session(['WritingScore' => $score]);
                session(['AnsweredCountWriting' => true]);
                break;
        }
    }

    public function resetTest()
    {
        // Clear all test-related session data
        session()->forget([
            'ReadingScore',
            'ListeningScore',
            'SpeakingScore',
            'WritingScore',
            'AnsweredCountReading',
            'AnsweredCountListening',
            'AnsweredCountSpeaking',
            'AnsweredCountWriting'
        ]);

        return redirect()->route('home');
    }

    public function scoreboard()
    {
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);
        $username = session('username');

        return Inertia::render('scoreboard', [
            'readingScore' => $readingScore,
            'listeningScore' => $listeningScore,
            'speakingScore' => $speakingScore,
            'writingScore' => $writingScore,
            'username' => $username
        ]);
    }

    private function getReadingQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'The Impact of Urbanization on Biodiversity',
                'passage' => 'Urbanization, the process by which rural areas become increasingly urbanized, has become one of the most significant global trends of the 21st century. As cities expand and populations concentrate in urban areas, the transformation of natural landscapes into built environments has profound consequences for biodiversity. The relationship between urban development and ecological systems is complex, involving both direct and indirect effects on species composition, habitat availability, and ecosystem functioning.

Urban environments present unique challenges for wildlife. The fragmentation of natural habitats creates isolated patches of green space, making it difficult for species to move between areas and maintain viable populations. Road networks, buildings, and other infrastructure act as barriers to animal movement, often leading to population isolation and reduced genetic diversity. Additionally, urban areas typically experience altered microclimates, with higher temperatures due to the heat island effect, changed precipitation patterns, and increased air and noise pollution.

However, urbanization does not uniformly result in biodiversity loss. Some species have adapted remarkably well to urban environments, taking advantage of new ecological niches. Urban-adapted species often exhibit behavioral flexibility, dietary generalism, and tolerance to human disturbance. Birds such as house sparrows and pigeons, as well as mammals like raccoons and urban coyotes, have successfully colonized cities worldwide. These species demonstrate that urban environments can support wildlife when appropriate conditions are present.

Conservation biologists increasingly recognize that urban areas must be incorporated into broader conservation strategies. Green infrastructure, including parks, green roofs, and wildlife corridors, can provide habitat connectivity and support urban biodiversity. The design of cities can significantly influence their ecological impact, with sustainable urban planning offering opportunities to minimize negative effects on biodiversity while creating livable environments for both humans and wildlife.',
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'According to the passage, what is one of the main challenges that urbanization poses to wildlife?',
                        'choices' => [
                            'Increased competition for food resources',
                            'Fragmentation of natural habitats into isolated patches',
                            'Excessive exposure to sunlight in urban areas',
                            'Lack of suitable nesting materials in cities'
                        ],
                        'correctAnswer' => 'Fragmentation of natural habitats into isolated patches'
                    ],
                    [
                        'id' => 2,
                        'question' => 'The word "viable" in paragraph 2 is closest in meaning to',
                        'choices' => [
                            'sustainable',
                            'diverse',
                            'large',
                            'productive'
                        ],
                        'correctAnswer' => 'sustainable'
                    ],
                    [
                        'id' => 3,
                        'question' => 'Which of the following can be inferred from paragraph 3 about urban-adapted species?',
                        'choices' => [
                            'They require specialized diets to survive in cities',
                            'They are more aggressive than their rural counterparts',
                            'They possess characteristics that help them thrive in human-dominated environments',
                            'They are primarily nocturnal to avoid human contact'
                        ],
                        'correctAnswer' => 'They possess characteristics that help them thrive in human-dominated environments'
                    ],
                    [
                        'id' => 4,
                        'question' => 'What does the author suggest about the role of green infrastructure in urban environments?',
                        'choices' => [
                            'It is too expensive to implement in most cities',
                            'It can help maintain habitat connectivity for urban wildlife',
                            'It should replace all traditional urban planning methods',
                            'It is only effective in suburban areas'
                        ],
                        'correctAnswer' => 'It can help maintain habitat connectivity for urban wildlife'
                    ],
                    [
                        'id' => 5,
                        'question' => 'The primary purpose of this passage is to',
                        'choices' => [
                            'argue against further urban development',
                            'describe specific urban wildlife conservation programs',
                            'examine the complex relationship between urbanization and biodiversity',
                            'promote the economic benefits of green infrastructure'
                        ],
                        'correctAnswer' => 'examine the complex relationship between urbanization and biodiversity'
                    ],
                    [
                        'id' => 6,
                        'question' => 'According to the passage, all of the following are effects of urbanization on wildlife EXCEPT:',
                        'choices' => [
                            'altered microclimates in urban areas',
                            'barriers to animal movement created by infrastructure',
                            'increased genetic diversity within urban populations',
                            'changes in precipitation patterns'
                        ],
                        'correctAnswer' => 'increased genetic diversity within urban populations'
                    ]
                ]
            ],
            [
                'id' => 2,
                'title' => 'The Development of Jazz Music in America',
                'passage' => 'Jazz, one of America\'s most distinctive cultural contributions to world music, emerged in the early 20th century from the cultural melting pot of New Orleans. This innovative musical form represented a synthesis of African American musical traditions, including blues and spirituals, with European harmonic structures and instrumentation. The unique social and cultural environment of New Orleans, with its diverse population and relatively relaxed racial boundaries, provided fertile ground for this musical fusion.

The early pioneers of jazz, including Buddy Bolden, Jelly Roll Morton, and later Louis Armstrong, developed techniques that would become hallmarks of the genre. Improvisation, the spontaneous creation of melody and rhythm during performance, became jazz\'s most defining characteristic. This emphasis on individual expression within a collective musical framework reflected broader American values of individualism and democratic participation.

As jazz spread from New Orleans to other major cities, particularly Chicago and New York, it underwent significant evolution. The 1920s, often called the Jazz Age, saw the music gain widespread popularity and commercial success. Big bands led by Duke Ellington and Count Basie brought jazz to mainstream audiences, while smaller ensembles continued to push the boundaries of improvisation and harmonic complexity.

The influence of jazz extended far beyond music itself. It played a crucial role in breaking down racial barriers, as integrated audiences came together to appreciate this new art form. Jazz clubs became spaces where racial mixing was more accepted than in other social contexts. Furthermore, jazz influenced literature, visual arts, and dance, contributing to a broader cultural renaissance that challenged traditional American social norms and aesthetic conventions.',
                'questions' => [
                    [
                        'id' => 7,
                        'question' => 'According to the passage, what made New Orleans particularly suitable for the development of jazz?',
                        'choices' => [
                            'Its location near major European cultural centers',
                            'Its diverse population and relaxed racial boundaries',
                            'Its large number of professional musicians',
                            'Its economic prosperity during the early 1900s'
                        ],
                        'correctAnswer' => 'Its diverse population and relaxed racial boundaries'
                    ],
                    [
                        'id' => 8,
                        'question' => 'The word "synthesis" in paragraph 1 is closest in meaning to',
                        'choices' => [
                            'analysis',
                            'combination',
                            'replacement',
                            'criticism'
                        ],
                        'correctAnswer' => 'combination'
                    ],
                    [
                        'id' => 9,
                        'question' => 'What does the author suggest about the relationship between jazz improvisation and American values?',
                        'choices' => [
                            'Jazz improvisation contradicted traditional American musical preferences',
                            'The emphasis on individual expression reflected American individualism',
                            'Improvisation was borrowed from European classical traditions',
                            'Jazz musicians rejected all forms of collective musical participation'
                        ],
                        'correctAnswer' => 'The emphasis on individual expression reflected American individualism'
                    ],
                    [
                        'id' => 10,
                        'question' => 'It can be inferred from the passage that jazz clubs were significant because they',
                        'choices' => [
                            'provided the only venues for live music performance',
                            'were exclusively patronized by wealthy audiences',
                            'served as spaces where racial integration was more accepted',
                            'featured only traditional American musical forms'
                        ],
                        'correctAnswer' => 'served as spaces where racial integration was more accepted'
                    ]
                ]
            ]
        ];
    }


    private function getListeningQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'Conversation: Student and Academic Advisor',
                'type' => 'conversation',
                'audioScript' => 'Student: Hi, Professor Johnson. Thanks for meeting with me. I\'m having some trouble deciding on my major.

Advisor: Of course, that\'s what I\'m here for. What\'s your current situation?

Student: Well, I\'m a sophomore, and I\'ve been taking general education courses, but I need to declare a major soon. I\'m torn between psychology and business administration.

Advisor: Those are quite different fields. What draws you to each one?

Student: I\'ve always been interested in understanding how people think and behave, which is why psychology appeals to me. But I\'m also practical about my future - I want to make sure I can find a good job after graduation, and business seems more secure financially.

Advisor: That\'s a common concern. Have you considered that psychology can lead to many career paths? You could work in human resources, marketing research, counseling, or even pursue graduate studies.

Student: I hadn\'t thought about marketing research. How does psychology relate to that?

Advisor: Companies need to understand consumer behavior to develop effective marketing strategies. Psychology majors often work for advertising agencies or corporate marketing departments. The starting salaries can be quite competitive.

Student: That sounds interesting. But what about the coursework? I\'ve heard psychology requires a lot of statistics and research methods.

Advisor: That\'s true, but those skills are valuable in any field. Research and analytical skills are highly sought after by employers. Plus, if you find you enjoy research, you could consider graduate school.',
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'What is the student\'s main concern about choosing a major?',
                        'choices' => [
                            'She is not interested in any particular field',
                            'She wants to balance personal interest with career prospects',
                            'She does not have enough time to decide',
                            'She is not performing well in her current courses'
                        ],
                        'correctAnswer' => 'She wants to balance personal interest with career prospects'
                    ],
                    [
                        'id' => 2,
                        'question' => 'According to the advisor, what career path combines psychology with business?',
                        'choices' => [
                            'Human resources',
                            'Marketing research',
                            'Corporate consulting',
                            'Graduate school teaching'
                        ],
                        'correctAnswer' => 'Marketing research'
                    ],
                    [
                        'id' => 3,
                        'question' => 'What does the advisor say about psychology coursework?',
                        'choices' => [
                            'It is easier than business courses',
                            'It focuses mainly on theory',
                            'It develops valuable analytical skills',
                            'It requires no mathematical background'
                        ],
                        'correctAnswer' => 'It develops valuable analytical skills'
                    ],
                    [
                        'id' => 4,
                        'question' => 'What can be inferred about the student\'s attitude toward statistics?',
                        'choices' => [
                            'She enjoys mathematical subjects',
                            'She is concerned about taking statistics courses',
                            'She has already completed statistics requirements',
                            'She prefers statistics to research methods'
                        ],
                        'correctAnswer' => 'She is concerned about taking statistics courses'
                    ]
                ]
            ],
            [
                'id' => 2,
                'title' => 'Academic Lecture: Art History - Impressionism',
                'type' => 'lecture',
                'audioScript' => 'Professor: Today we\'re going to discuss Impressionism, one of the most revolutionary movements in art history. Impressionism emerged in France during the 1860s and 1870s, representing a dramatic break from traditional academic painting.

The term "Impressionism" actually came from a critic who was mocking the movement. He saw Claude Monet\'s painting "Impression, Sunrise" and used the title disparagingly to describe what he saw as unfinished, sloppy work. However, the artists embraced this term.

What made Impressionism so revolutionary? First, let\'s talk about their painting technique. Traditional academic painters worked in studios, building up layers of paint to create smooth, detailed surfaces. Impressionists, however, painted outdoors - "en plein air" as they called it. They used loose, visible brushstrokes and often applied paint directly from the tube without mixing it extensively.

The Impressionists were also obsessed with light and how it changes throughout the day. Monet, for example, painted the same haystack or cathedral at different times to capture these changes. This was radical because traditional art focused on timeless, idealized subjects.

Another key aspect was their choice of subject matter. Instead of historical, religious, or mythological scenes preferred by academic artists, Impressionists painted everyday life - people in cafes, dancers, landscapes, and street scenes. They wanted to capture modern life as it was happening.

The movement faced significant resistance from the established art world. The official Paris Salon repeatedly rejected their work, so the Impressionists organized their own independent exhibitions starting in 1874.',
                'questions' => [
                    [
                        'id' => 5,
                        'question' => 'How did the term "Impressionism" originate?',
                        'choices' => [
                            'Artists chose it to describe their technique',
                            'A critic used it mockingly to describe their work',
                            'It was named after a famous painting school',
                            'The French government assigned this classification'
                        ],
                        'correctAnswer' => 'A critic used it mockingly to describe their work'
                    ],
                    [
                        'id' => 6,
                        'question' => 'What does "en plein air" refer to?',
                        'choices' => [
                            'A type of paint mixing technique',
                            'Painting outdoors rather than in studios',
                            'A style of brushstroke application',
                            'A method of preparing canvases'
                        ],
                        'correctAnswer' => 'Painting outdoors rather than in studios'
                    ],
                    [
                        'id' => 7,
                        'question' => 'Why did Monet paint the same subjects multiple times?',
                        'choices' => [
                            'To practice and improve his technique',
                            'To show different artistic styles',
                            'To capture how light changes throughout the day',
                            'To meet demand from art collectors'
                        ],
                        'correctAnswer' => 'To capture how light changes throughout the day'
                    ],
                    [
                        'id' => 8,
                        'question' => 'What was the Impressionists\' response to rejection by the Paris Salon?',
                        'choices' => [
                            'They changed their painting style to conform',
                            'They stopped painting altogether',
                            'They organized their own independent exhibitions',
                            'They moved to other countries'
                        ],
                        'correctAnswer' => 'They organized their own independent exhibitions'
                    ]
                ]
            ]
        ];
    }
    private function getSpeakingQuestions()
    {
        return [
            'id' => 1,
            'title' => 'Independent Speaking Task',
            'type' => 'independent',
            'preparationTime' => 15,
            'responseTime' => 45,
            'question' => 'Some people prefer to live in a small town while others prefer to live in a big city. Which do you prefer? Use specific reasons and examples to support your answer.',
            'tips' => [
                'Take 15 seconds to prepare your response',
                'Speak for 45 seconds',
                'Give specific reasons and examples',
                'Organize your thoughts clearly',
                'State your preference clearly at the beginning',
                'Use transitional phrases to connect your ideas'
            ]
        ];
    }
    private function getWritingQuestions()
    {
        return [
            'id' => 1,
            'title' => 'Academic Discussion Writing Task',
            'type' => 'discussion',
            'timeLimit' => 10,
            'wordCount' => 'At least 100 words',
            'context' => 'Your professor is teaching a class on urban planning. You have been assigned to post in an online discussion forum for the class. Your professor asks:',
            'passage' => 'Many cities around the world are facing rapid population growth, leading to overcrowding and strain on infrastructure. Some urban planners believe that building vertically (constructing taller buildings) is the best solution, while others advocate for horizontal expansion (spreading the city outward). Which approach do you think is more effective for managing urban growth? Why?

Previous student responses:

Emma: "I think vertical growth is definitely the way to go. Building upward allows cities to accommodate more people without consuming additional land. This is especially important for preserving natural areas and farmland around cities. Plus, when people live in denser areas, public transportation becomes more efficient and cost-effective. Look at cities like Tokyo or New York - they handle millions of people efficiently because of their vertical development."

Marcus: "I disagree with Emma. Horizontal expansion is more sustainable in the long run. When cities spread outward, there\'s more space for parks, gardens, and recreational areas, which improve quality of life. Also, if there\'s an emergency like a fire or earthquake, it\'s much safer to evacuate low-rise buildings. Vertical cities create too much stress on infrastructure like water, electricity, and waste management systems. Suburbs also offer more affordable housing options for families."',
            'question' => [
                'id' => 1,
                'question' => 'In your response, take a clear position on whether vertical or horizontal urban development is more effective. You may agree with Emma, agree with Marcus, or present your own perspective. Support your argument with specific reasons and examples. Write at least 100 words in an academic discussion style.',
            ],
            'instructions' => [
                'You have 10 minutes to write your response',
                'Your response should be at least 100 words',
                'Take a clear position and support it with reasons',
                'You may agree with one student, disagree with both, or present a different perspective',
                'Use specific examples to support your argument',
                'Write in an academic discussion style'
            ]
        ];
    }

}

