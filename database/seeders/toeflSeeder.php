<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Toefl;
use App\Models\Subtest;
use App\Models\ToeflSubtest;
use App\Models\Passage;
use App\Models\questions;

class ToeflSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================
        // 1. TOEFL ENTRY
        // =========================================================
        $toefl = Toefl::create([
            'name' => 'tep',
            'code' => 'tep',
            'status' => 'active',
        ]);

        // =========================================================
        // 2. SUBTESTS MASTER (ID 1–5)
        // Urutan insert menentukan auto-increment ID:
        // ID 1 = Reading, ID 2 = Listening, ID 3 = Structure, ID 4 = Essay, ID 5 = Speaking
        // =========================================================
        $subtestReading = Subtest::create([
            'name' => 'Reading',
            'slug' => 'Reading Comprehension',
            'order' => 1,
            'instructions' => [
                [
                    'part' => 'Reading',
                    'text' => 'In this section you will read several passages. Each one is followed by questions about it. For each question, choose the one best answer, A, B, C, or D, based on what is stated or implied in the passage.',
                ],
            ],
        ]);

        $subtestListening = Subtest::create([
            'name' => 'Listening',
            'slug' => 'Listening Comprehension',
            'order' => 3,
            'instructions' => [
                [
                    'part' => 'Part A',
                    'text' => 'In Part A, you will hear short conversations between two people. After each conversation, you will hear a question about the conversation. The conversations and questions will not be repeated. After you hear a question, read the four possible answers in your test book and choose the best answer.',
                ],
                [
                    'part' => 'Part B',
                    'text' => 'In this part of the test, you will hear longer conversations. After each conversation, you will hear several questions. The conversations and questions will not be repeated. After you hear a question, read the four possible answers in your test book and choose the best answer.',
                ],
                [
                    'part' => 'Part C',
                    'text' => 'In this part of the test, you will hear several talks. After each talk, you will hear some questions. The talks and questions will not be repeated. After you hear a question, read the four possible answers in your test book and choose the best answer.',
                ],
            ],
        ]);

        $subtestStructure = Subtest::create([
            'name' => 'Structure',
            'slug' => 'Structure & Written Expression',
            'order' => 2,
            'instructions' => [
                [
                    'part' => 'Structure (1–15)',
                    'text' => 'Questions 1–15 are incomplete sentences. Beneath each sentence you will see four words or phrases, marked A, B, C, and D. Choose the one word or phrase that best completes the sentence.',
                ],
                [
                    'part' => 'Written Expression (16–40)',
                    'text' => 'In questions 16–40 each sentence has four underlined words or phrases. The four underlined parts of the sentence are marked A, B, C, and D. Identify the one underlined word or phrase that must be changed in order for the sentence to be correct.',
                ],
            ],
        ]);

        Subtest::create([
            'name' => 'Essay',
            'slug' => 'Essay',
            'order' => 4,
            'instructions' => [
                [
                    'part' => 'Essay Writing',
                    'text' => 'In this section, you will write an essay in response to a given topic. Your essay will be evaluated based on content, organization, vocabulary, and grammar. You will have 30 minutes to plan, write, and revise your essay.',
                ],
            ],
        ]);

        Subtest::create([
            'name' => 'Speaking',
            'slug' => 'Speaking Comprehension',
            'order' => 3,
            'instructions' => [
                [
                    'part' => 'Speaking',
                    'text' => 'In this section, you will demonstrate your ability to speak about a variety of topics. You will answer several questions and speak about what you read and listen to. You will have time to prepare your response.',
                ],
            ],
        ]);

        // =========================================================
        // 3. TOEFL_SUBTESTS (pivot + config)
        // =========================================================
        // Urutan standar TOEFL: Listening (1) → Structure (2) → Reading (3)
        $tsListening = ToeflSubtest::create([
            'toefl_id' => $toefl->id,
            'subtest_id' => $subtestListening->id, // ID 3
            'order' => 1,
            'duration_minutes' => 30,
            'passing_score' => 31,
            'total_questions' => 18,
        ]);

        $tsStructure = ToeflSubtest::create([
            'toefl_id' => $toefl->id,
            'subtest_id' => $subtestStructure->id, // ID 2
            'order' => 2,
            'duration_minutes' => 25,
            'passing_score' => 31,
            'total_questions' => 25,
        ]);

        $tsReading = ToeflSubtest::create([
            'toefl_id' => $toefl->id,
            'subtest_id' => $subtestReading->id, // ID 1
            'order' => 3,
            'duration_minutes' => 55,
            'passing_score' => 31,
            'total_questions' => 20,
        ]);

        // =========================================================
        // 4. PASSAGES & QUESTIONS — LISTENING
        // =========================================================

        // ---------- PART A: Short Conversations ----------
        $passagePartA = Passage::create([
            'subtest_id' => $subtestListening->id,
            'title' => 'Listening Part A – Short Conversations',
            'audio_url' => null,
            'text' => [
                'type' => 'listening',
                'actors' => [
                    ['id' => 'A1', 'name' => 'Woman'],
                    ['id' => 'A2', 'name' => 'Man'],
                ],
                'dialog' => [
                    ['actor_id' => 'A1', 'text' => 'Why did you get that kind of fruit?'],
                    ['actor_id' => 'A2', 'text' => 'I wouldn\'t have bought these cherries had I known that grapes were so cheap.'],

                    ['actor_id' => 'A2', 'text' => 'Were you upset by what Richard said to you?'],
                    ['actor_id' => 'A1', 'text' => 'I couldn\'t have been more infuriated.'],

                    ['actor_id' => 'A2', 'text' => 'How is your boss feeling about his retirement?'],
                    ['actor_id' => 'A1', 'text' => 'Oh, he isn\'t too unhappy to be retiring.'],

                    ['actor_id' => 'A2', 'text' => 'Why were you thanking Tom?'],
                    ['actor_id' => 'A1', 'text' => 'He lent me enough money to pay the rent.'],

                    ['actor_id' => 'A1', 'text' => 'Do you know where Debbie is?'],
                    ['actor_id' => 'A2', 'text' => 'Her purse is still here, so she must still be in the apartment.'],

                    ['actor_id' => 'A1', 'text' => 'How did Chuck look when you visited him in the hospital?'],
                    ['actor_id' => 'A2', 'text' => 'He\'s looked better.'],

                    ['actor_id' => 'A2', 'text' => 'Let me just get these last plates put away. Then I\'ll be ready to go.'],
                    ['actor_id' => 'A1', 'text' => 'So you did do the dishes.'],

                    ['actor_id' => 'A2', 'text' => 'What did the professor do in the first class? I missed it because I was late.'],
                    ['actor_id' => 'A1', 'text' => 'She outlined the course requirements.'],

                    ['actor_id' => 'A2', 'text' => 'Can I help you find something?'],
                    ['actor_id' => 'A1', 'text' => 'Yes, thank you. I need to get a new rug.'],

                    ['actor_id' => 'A2', 'text' => 'Why are you so late getting here?'],
                    ['actor_id' => 'A1', 'text' => 'Oh, I ran into my cousin Carl, and we stayed and talked for a while.'],
                ],
            ],
        ]);

        // Questions Part A (1–10) — answer key from Listening PDF
        $partAQuestions = [
            [
                'order' => 1,
                'question' => 'What does the man mean?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'He knew that cherries were pricier than grapes.',
                    'B' => 'He bought cherries and grapes because of not knowing their prices.',
                    'C' => 'He didn\'t know that cherries were pricier than grapes.',
                    'D' => 'He didn\'t buy either grapes or cherries because both were pricey.',
                ],
            ],
            [
                'order' => 2,
                'question' => 'What does the woman mean?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'She felt it wasn\'t fair.',
                    'B' => 'She was in rage.',
                    'C' => 'She felt inferior.',
                    'D' => 'She wasn\'t furious.',
                ],
            ],
            [
                'order' => 3,
                'question' => 'What does the woman imply about her boss?',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'He is unhappy at the thought of retiring.',
                    'B' => 'He hates to leave his job soon.',
                    'C' => 'He is retiring too fast.',
                    'D' => 'He is eager to leave his job.',
                ],
            ],
            [
                'order' => 4,
                'question' => 'What does the woman mean?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'The rent was given by her for Tom.',
                    'B' => 'She was asked money for paying the rent.',
                    'C' => 'Tom gave her money for the rent.',
                    'D' => 'The money was lent by Tom early this month.',
                ],
            ],
            [
                'order' => 5,
                'question' => 'What does the man say about Debbie?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'She shouldn\'t leave her purse here.',
                    'B' => 'She\'s probably in the apartment.',
                    'C' => 'Her purse must not be in the apartment.',
                    'D' => 'She left the apartment without taking her purse.',
                ],
            ],
            [
                'order' => 6,
                'question' => 'What does the man mean?',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Chuck looked at him in the hospital.',
                    'B' => 'Chuck didn\'t seem to be doing very well.',
                    'C' => 'This visit was better than the last.',
                    'D' => 'Chuck had improved.',
                ],
            ],
            [
                'order' => 7,
                'question' => 'What had the woman assumed?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'She didn\'t think that he\'d do the dishes.',
                    'B' => 'The plates did not need to be washed.',
                    'C' => 'She asked him to be ready to go.',
                    'D' => 'The dishes would not be done.',
                ],
            ],
            [
                'order' => 8,
                'question' => 'What does the woman mean?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Professor described the lesson for his class.',
                    'B' => 'There was a long line to register for the required class.',
                    'C' => 'Professor\'s requirement for the course is high.',
                    'D' => 'Professor required the class to outline his course.',
                ],
            ],
            [
                'order' => 9,
                'question' => 'What does the woman mean?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'She\'s shopping for a carpet.',
                    'B' => 'She needs to help him find something.',
                    'C' => 'She\'s found a new ring.',
                    'D' => 'She\'s thankful she has a rag.',
                ],
            ],
            [
                'order' => 10,
                'question' => 'What does the woman mean?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'She ran into another car at the corner.',
                    'B' => 'She ran to her cousin because she\'s scared.',
                    'C' => 'She unexpectedly met one of her relatives.',
                    'D' => 'Carl was running from place to place.',
                ],
            ],
        ];

        foreach ($partAQuestions as $q) {
            questions::create([
                'passage_id' => $passagePartA->id,
                'toefl_subtest_id' => $tsListening->id,
                'subtest_id' => $subtestListening->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // ---------- PART B: Longer Conversation — Space Garbage ----------
        $passagePartB = Passage::create([
            'subtest_id' => $subtestListening->id,
            'title' => 'Listening Part B – Space Garbage',
            'audio_url' => null,
            'text' => [
                'type' => 'listening',
                'actors' => [
                    ['id' => 'A1', 'name' => 'Man'],
                    ['id' => 'A2', 'name' => 'Woman'],
                ],
                'dialog' => [
                    ['actor_id' => 'A1', 'text' => 'Have you ever thought about all the tons of garbage that\'s out in space circling the Earth?'],
                    ['actor_id' => 'A2', 'text' => 'Tons of garbage circling the Earth? What do you mean?'],
                    ['actor_id' => 'A1', 'text' => 'I saw a television program about it last night...'],
                    ['actor_id' => 'A2', 'text' => 'Where did all this garbage come from?'],
                    ['actor_id' => 'A1', 'text' => 'Well, it comes from all those space missions...'],
                    ['actor_id' => 'A2', 'text' => 'Isn\'t it dangerous to have all this stuff out there?'],
                    ['actor_id' => 'A1', 'text' => 'Some space scientists are worried...'],
                    ['actor_id' => 'A2', 'text' => 'Well, I hope that they\'re going to do something about this...'],
                    ['actor_id' => 'A1', 'text' => 'Me too. I know that right now the problem is being studied...'],
                ],
            ],
        ]);

        $partBQuestions = [
            [
                'order' => 11,
                'question' => 'What are the man and woman discussing?',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Trash orbiting Earth.',
                    'B' => 'Becoming space scientists.',
                    'C' => 'A trip by an astronaut to the Moon.',
                    'D' => 'The overabundance of garbage on Earth.',
                ],
            ],
            [
                'order' => 12,
                'question' => 'Where did the woman learn about this problem?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'From a lecture.',
                    'B' => 'On a television program.',
                    'C' => 'In a magazine article.',
                    'D' => 'In a book.',
                ],
            ],
            [
                'order' => 13,
                'question' => 'Approximately how much metal is in orbit in space?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => '3,000 tons',
                    'B' => '3,000 pounds',
                    'C' => '13,000 pounds',
                    'D' => '300 tons',
                ],
            ],
            [
                'order' => 14,
                'question' => 'What does the woman hope will happen?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'The problem will take care of itself.',
                    'B' => 'Scientists will find solutions to the problem.',
                    'C' => 'She will be able to travel in space.',
                    'D' => 'The junk will fall to Earth.',
                ],
            ],
        ];

        foreach ($partBQuestions as $q) {
            questions::create([
                'passage_id' => $passagePartB->id,
                'toefl_subtest_id' => $tsListening->id,
                'subtest_id' => $subtestListening->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // ---------- PART C: Talk — Sociology Professor ----------
        $passagePartC = Passage::create([
            'subtest_id' => $subtestListening->id,
            'title' => 'Listening Part C – Sociology Professor Talk',
            'audio_url' => null,
            'text' => [
                'type' => 'listening',
                'part' => 'Part C',
                'actors' => ['Professor'],
                'dialog' => [
                    ['actor' => 'Professor', 'line' => 'Before I start today\'s sociology lecture, I\'d like to talk with you about the papers that you should be working on.'],
                    ['actor' => 'Professor', 'line' => 'As you know, the topic for the paper is the relationship between gun control and violence.'],
                    ['actor' => 'Professor', 'line' => 'The paper itself is due in two weeks, but I would like to see your outlines by Friday of this week so that I can be sure that you are on the right track with the assignment.'],
                    ['actor' => 'Professor', 'line' => 'You need to do some research for this paper, so you should be spending some time in the library. I would like you to have at least three books and at least three recent journal articles as sources.'],
                    ['actor' => 'Professor', 'line' => 'The paper should be five pages long. In addition to the five pages of composition, you should have a title page and a one-page reference list of the sources that you used in preparing the paper.'],
                ],
            ],
        ]);

        $partCQuestions = [
            [
                'order' => 15,
                'question' => 'When does this talk probably take place?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'On the first day of class.',
                    'B' => 'In the final week of the semester.',
                    'C' => 'In the middle of the semester.',
                    'D' => 'At the end of class.',
                ],
            ],
            [
                'order' => 16,
                'question' => 'When is the paper due?',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'In two weeks.',
                    'B' => 'In three weeks.',
                    'C' => 'Later today.',
                    'D' => 'By Friday of this week.',
                ],
            ],
            [
                'order' => 17,
                'question' => 'What types of references should be used in writing the paper?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Books listed in student journals.',
                    'B' => 'Books from outside the library.',
                    'C' => 'Both books and journals.',
                    'D' => 'Journal and magazine articles.',
                ],
            ],
            [
                'order' => 18,
                'question' => 'How many total pages should be in the paper, including the title page and the reference list?',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Two.',
                    'B' => 'Three.',
                    'C' => 'Five.',
                    'D' => 'Seven.',
                ],
            ],
        ];

        foreach ($partCQuestions as $q) {
            questions::create([
                'passage_id' => $passagePartC->id,
                'toefl_subtest_id' => $tsListening->id,
                'subtest_id' => $subtestListening->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // =========================================================
        // 5. PASSAGES & QUESTIONS — STRUCTURE & WRITTEN EXPRESSION
        // =========================================================
        $passageStructure = Passage::create([
            'subtest_id' => $subtestStructure->id,
            'title' => 'Structure and Written Expression – Section 2',
            'audio_url' => null,
            'text' => [
                'type' => 'structure',
                'description' => 'Choose the best answer to complete the sentence (1–15) or identify the underlined error (16–25).',
            ],
        ]);

        // Structure questions 1–15 (multiple choice / sentence completion)
        $structureQuestions = [
            [
                'order' => 1,
                'question' => 'According to somatotype, a category of human physique, endomorph ____ more muscle than either of the other body types.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'Tended to have',
                    'B' => 'Tends to have',
                    'C' => 'Has tended to have',
                    'D' => 'Had tended to have',
                ],
            ],
            [
                'order' => 2,
                'question' => 'Although debated by some, since 2012, after the end of third wave of feminism, the fourth one _____ on sexual harassment, body shaming, and rape culture, among other issues of women.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Focuses',
                    'B' => 'Focused',
                    'C' => 'Has focused',
                    'D' => 'Had focused',
                ],
            ],
            [
                'order' => 3,
                'question' => 'Gentrification describes a process ____ wealthy, college-educated individuals begin to move into poor or working-class communities, often originally occupied by communities of color.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'When',
                    'B' => 'What',
                    'C' => 'In which',
                    'D' => 'That',
                ],
            ],
            [
                'order' => 4,
                'question' => 'Most carnivores have relatively large brains, high levels of intelligence, and ____ complicated digestive systems than herbivores.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Less than',
                    'B' => 'More or less',
                    'C' => 'lesser',
                    'D' => 'less',
                ],
            ],
            [
                'order' => 5,
                'question' => 'Pythagoras who is recognized as the world\'s first mathematician in the year 500 before century ____ very hard at the arithmetical side of geometry.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Worked',
                    'B' => 'Works',
                    'C' => 'Has worked',
                    'D' => 'Had worked',
                ],
            ],
            [
                'order' => 6,
                'question' => 'When Columbus had arrived, he found the New World inhabited by people ____ originally come from the continent of Asia.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'which have',
                    'B' => 'who had',
                    'C' => 'that have',
                    'D' => 'whom had',
                ],
            ],
            [
                'order' => 7,
                'question' => 'During Covid-19 pandemic, online learning applied by many educational institutions _____ than the conventional one.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'is much effective',
                    'B' => 'is more effective',
                    'C' => 'are more effective',
                    'D' => 'are much more effectively',
                ],
            ],
            [
                'order' => 8,
                'question' => 'In the United States, the electoral system is either simple or _____ in representation.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'proportional',
                    'B' => 'proportionally',
                    'C' => 'proportion',
                    'D' => 'portion',
                ],
            ],
            [
                'order' => 9,
                'question' => 'A bad stigma and discrimination target severe _____ people and make them more depressed.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'mental ill',
                    'B' => 'mentally illness',
                    'C' => 'mentally ill',
                    'D' => 'mental illness',
                ],
            ],
            [
                'order' => 10,
                'question' => 'For years, although it is controversial, meme has been considered pop art using the imagery of mass-media, mass-production and ____.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'Mass-cultural',
                    'B' => 'Mass-culture',
                    'C' => 'Mass-cultured',
                    'D' => 'Mass-culturally',
                ],
            ],
            [
                'order' => 11,
                'question' => 'In the sea, a dolphin is considered the most intelligent mammal while the blue whale is _____.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'the largest',
                    'B' => 'the most large',
                    'C' => 'larger',
                    'D' => 'more large',
                ],
            ],
            [
                'order' => 12,
                'question' => 'The use of labor-saving devices in homes, ____, and factories added to the amount of leisure time people had.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'officially',
                    'B' => 'office',
                    'C' => 'to be officially',
                    'D' => 'offices',
                ],
            ],
            [
                'order' => 13,
                'question' => '_____, a diamond will glow red, then white due to reaction between the surface of diamond and the air.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'When first heated',
                    'B' => 'When first heating',
                    'C' => 'When heats',
                    'D' => 'When heats',
                ],
            ],
            [
                'order' => 14,
                'question' => 'Many renewable resources which emit less carbon dioxide and other greenhouse gases are now found to ____.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Supporting electricity',
                    'B' => 'Supporting electricities',
                    'C' => 'Support electricity',
                    'D' => 'Support electricities',
                ],
            ],
            [
                'order' => 15,
                'question' => 'During the pandemic, teachers of special needs students struggle with feelings of helplessness in handling students in one-on-one ____ .',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Intensive guidance',
                    'B' => 'Intensively guidance',
                    'C' => 'Intensified guidance',
                    'D' => 'Intensifying guidance',
                ],
            ],
        ];

        foreach ($structureQuestions as $q) {
            questions::create([
                'passage_id' => $passageStructure->id,
                'toefl_subtest_id' => $tsStructure->id,
                'subtest_id' => $subtestStructure->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // Written Expression questions 16–25 (identify underlined error)
        $writtenExpressionQuestions = [
            [
                'order' => 16,
                'question' => 'From all types of natural disaster, only [A]much of them [B]recorded in history is [C]considered deadly [D]for killing many victims.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'much of them',
                    'B' => 'recorded in history',
                    'C' => 'considered deadly',
                    'D' => 'for killing many victims',
                ],
            ],
            [
                'order' => 17,
                'question' => '[A]Nuclear, [B]because of many environmentalists oppose it, becomes a potential alternative and [C]radically reduces the world\'s carbon [D]emissions.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Nuclear',
                    'B' => 'because of many environmentalists oppose it',
                    'C' => 'radically reduces',
                    'D' => 'emissions',
                ],
            ],
            [
                'order' => 18,
                'question' => '[A]Normally done within a week, the [B]national exam for elementary, junior, and senior high school students [C]had been cancelled in [D]March 2020 due to the coronavirus pandemic.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Normally done within a week',
                    'B' => 'national exam for elementary, junior, and senior high school students',
                    'C' => 'had been cancelled',
                    'D' => 'March 2020 due to the coronavirus pandemic',
                ],
            ],
            [
                'order' => 19,
                'question' => '[A]As a part of macronutrients, [B]protein consists of amino acids and [C]its kinds are [D]about twenty.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'As a part of macronutrients',
                    'B' => 'protein consists of amino acids',
                    'C' => 'its kinds are',
                    'D' => 'about twenty',
                ],
            ],
            [
                'order' => 20,
                'question' => '[A]Not only can [B]an aircraft able to move around faster than rovers, but [C]also the Mars Helicopter is able to [D]reach areas.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Not only can',
                    'B' => 'an aircraft able to move around faster than rovers',
                    'C' => 'also the Mars Helicopter is able to',
                    'D' => 'reach areas',
                ],
            ],
            [
                'order' => 21,
                'question' => '[A]Fifteen minutes of high-intensity interval training [B]every day is [C]very effective in helping people to maintain [D]physically fitness.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'Fifteen minutes of high-intensity interval training',
                    'B' => 'every day is',
                    'C' => 'very effective in helping people to maintain',
                    'D' => 'physically fitness',
                ],
            ],
            [
                'order' => 22,
                'question' => '[A]Mark Twain, pseudonym of Samuel Langhorne Clemens, [B]born in [C]November 30, 1835, acquired [D]international fame for his travel narratives.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'Mark Twain, pseudonym of Samuel Langhorne Clemens',
                    'B' => 'born in',
                    'C' => 'November 30, 1835',
                    'D' => 'international fame for his travel narratives',
                ],
            ],
            [
                'order' => 23,
                'question' => '[A]Finding the results in their database, search engines [B]had been developed [C]since their first [D]launching in 1990.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Finding the results in their database',
                    'B' => 'had been developed',
                    'C' => 'since their first',
                    'D' => 'launching in 1990',
                ],
            ],
            [
                'order' => 24,
                'question' => '[A]Indigenous people had lived and [B]depend on the forest to sustain their life [C]until deforestation was done and [D]stopped by the government of nations.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Indigenous people had lived and',
                    'B' => 'depend on the forest to sustain their life',
                    'C' => 'until deforestation was done and',
                    'D' => 'stopped by the government of nations',
                ],
            ],
            [
                'order' => 25,
                'question' => 'The progressive reading methods at this school [A]given [B]credits for the [C]improved [D]test scores.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'given',
                    'B' => 'credits for the',
                    'C' => 'improved',
                    'D' => 'test scores',
                ],
            ],
        ];

        foreach ($writtenExpressionQuestions as $q) {
            questions::create([
                'passage_id' => $passageStructure->id,
                'toefl_subtest_id' => $tsStructure->id,
                'subtest_id' => $subtestStructure->id,
                'question' => $q['question'],
                'question_type' => 'written_expression',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // =========================================================
        // 6. PASSAGES & QUESTIONS — READING COMPREHENSION
        // =========================================================

        // ---------- Passage 1: Horse Breeding ----------
        $passageReading1 = Passage::create([
            'subtest_id' => $subtestReading->id,
            'title' => 'Passage 1 – Horse Breeding',
            'audio_url' => null,
            'text' => [
                'type' => 'reading',
                'body' => "Horse owners who plan to breed one or more mares should have a working knowledge of heredity and know how to care for breeding animals and foals. The number of mares bred that conceive varies from about 40 to 85 percent, with the average running less than 50 percent. Some mares that do conceive fail to produce living foals. This means that, on average, two mares are kept a whole year to produce one foal, and even then, some foals are disappointments from the standpoint of quality.\n\nBy careful selection, breeders throughout history have developed various kinds of horses with a wide variety of characteristics to suit many different needs. The Great Horse of the Middle Ages, for example, was bred for size and strength to carry a heavily armored knight. The massive horses of such breeds are often called \"cold blooded.\" The Arabs bred lithe desert horses that were small and swift. These animals are often referred to as \"hot blooded\". Cross-breeding of hot-blooded and cold-blooded horses for certain characteristics produced breeds ranging from riding horses to draft horses.\n\nThe Thoroughbred is considered by many to be the highpoint of elegance and fine selective breeding. Many persons mistakenly apply the name Thoroughbred to any purebred horse. But a Thoroughbred is a distinct breed of running horses that traces its ancestry through the male line directly back to three Eastern stallions as the Byerly Turk, the Darley Arabian, and the Godolphin Barb. For convenience the breeds of horses are often divided into three major groups: first is ponies; second is heavy, or draft horses; and the last is light horses.",
            ],
        ]);

        $reading1Questions = [
            [
                'order' => 1,
                'question' => 'What is the passage mainly about?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Horse breeding',
                    'B' => 'Horse farming',
                    'C' => 'Animal breeders',
                    'D' => 'Breeding knowledge',
                ],
            ],
            [
                'order' => 2,
                'question' => 'What percent is the average amount of mares bred conceive?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'about 45%',
                    'B' => 'around 85%',
                    'C' => 'more than 70%',
                    'D' => 'up to 50%',
                ],
            ],
            [
                'order' => 3,
                'question' => 'The word "conceive" in line 3 can be replaced by ____.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'become sick.',
                    'B' => 'become pregnant.',
                    'C' => 'die.',
                    'D' => 'be born.',
                ],
            ],
            [
                'order' => 4,
                'question' => 'Which of the following was NOT owned by Great Horse of the Middle Ages?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'Large size',
                    'B' => 'Beauty',
                    'C' => 'Strength',
                    'D' => 'Swiftness',
                ],
            ],
            [
                'order' => 5,
                'question' => 'The words "These" in line 9 refers to ____.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'Arabs',
                    'B' => 'Desert horses',
                    'C' => 'Breeds',
                    'D' => 'Animals',
                ],
            ],
            [
                'order' => 6,
                'question' => 'The word "highpoint" in line 12 can be replaced by ____.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'popularity.',
                    'B' => 'standard.',
                    'C' => 'massiveness.',
                    'D' => 'top.',
                ],
            ],
            [
                'order' => 7,
                'question' => 'According to the passage, which of the following horses is known as the finest purebred?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'Darley Arabian',
                    'B' => 'Thoroughbred',
                    'C' => 'Godolphin Barb',
                    'D' => 'Byerly Turk',
                ],
            ],
            [
                'order' => 8,
                'question' => 'It can be inferred from the passage why the cold-blooded and hot-blooded horses were cross-bred?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Cross-breeding was a safer means of reproduction.',
                    'B' => 'Cross-bred horses were preferred by Arabs.',
                    'C' => 'By cross-breeding, horses with desirable mixed characteristics could be produced.',
                    'D' => 'Cross-breeding produced Thoroughbred horses.',
                ],
            ],
            [
                'order' => 9,
                'question' => 'What is the origin of the Thoroughbred?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'A male lineage of Eastern stallion.',
                    'B' => 'A direct breed of running horses.',
                    'C' => 'A cross-breed of the Arabs.',
                    'D' => 'A purebred horse.',
                ],
            ],
            [
                'order' => 10,
                'question' => 'Which of the following is NOT one of the major divisions of horse breeds?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Draft horses.',
                    'B' => 'Ponies.',
                    'C' => 'Foals.',
                    'D' => 'Light horses.',
                ],
            ],
        ];

        foreach ($reading1Questions as $q) {
            questions::create([
                'passage_id' => $passageReading1->id,
                'toefl_subtest_id' => $tsReading->id,
                'subtest_id' => $subtestReading->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        // ---------- Passage 2: Archaeology ----------
        $passageReading2 = Passage::create([
            'subtest_id' => $subtestReading->id,
            'title' => 'Passage 2 – Archaeology',
            'audio_url' => null,
            'text' => [
                'type' => 'reading',
                'body' => "Archaeology is a source of history, not just a humble auxiliary discipline. Archaeological data are historical documents, not mere illustrations to written texts. Just as much as any other historian, an archaeologist studies and tries to reconstitute the process that has created the human world in which we live and us ourselves in so far as we are each creature of our age and social environment. Archaeological data are all changes in the material world resulting from human action or more succinctly the fossilized results of human behavior. The sum of these constitutes is what may be called as the archaeological record which it exhibits certain peculiarities and deficiencies the consequences of which produce a rather superficial contrast between archaeological history and the more familiar kind based upon written records.\n\nNot all human behavior fossilizes. The words I utter and you hear as vibrations in the air are certainly human changes in the material world and may be of great historical significance. Yet they leave no sort of trace in the archaeological records unless they are captured by a dictaphone or written down by a clerk. The movement of troops on the battlefield may \"change the course of history\", but this is equally ephemeral from the archaeologist's standpoint. What is perhaps worse, most organic materials being perishable. Everything made of wood, hide wool, linen, grass hair, and similar materials will decay and vanish in dust in a few years or centuries, save under very exceptional conditions. In a relatively brief period, the archaeological record is reduced to mere scraps of stone, bone, glass, metal, and earthenware. Still modern archaeology, by applying appropriate techniques and comparative methods, aided by a few lucky finds from peat bogs, deserts, and frozen soils can fill up a good deal of the gap.",
            ],
        ]);

        $reading2Questions = [
            [
                'order' => 11,
                'question' => 'What is the author\'s main purpose in the passage?',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'Pointing out the importance of recent advances in archaeology.',
                    'B' => 'Describing an archaeologist\'s education.',
                    'C' => 'Explaining how archaeology is a source of history.',
                    'D' => 'Encouraging more people to become archaeologists.',
                ],
            ],
            [
                'order' => 12,
                'question' => 'The word "discipline" in line 1 can be best replaced by ____.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'student',
                    'B' => 'course',
                    'C' => 'order',
                    'D' => 'method',
                ],
            ],
            [
                'order' => 13,
                'question' => 'The word "it" in line 7 refers to ____.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'the record',
                    'B' => 'the sum',
                    'C' => 'human behavior',
                    'D' => 'constitute',
                ],
            ],
            [
                'order' => 14,
                'question' => 'According to the passage, what does the archaeological record consist of?',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'spoken words of great historical significance',
                    'B' => 'the fossilized results of human activity',
                    'C' => 'organic materials',
                    'D' => 'ephemeral ideas',
                ],
            ],
            [
                'order' => 15,
                'question' => 'The word "they" in line 12 refers to ____.',
                'correct_answer' => 'B',
                'choices' => [
                    'A' => 'scraps',
                    'B' => 'words',
                    'C' => 'troops',
                    'D' => 'humans',
                ],
            ],
            [
                'order' => 16,
                'question' => 'In line 13, the phrase "change the course of history" can be considered as ____.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'a cause of different story in the past',
                    'B' => 'a reference of certain history',
                    'C' => 'a change in related history',
                    'D' => 'a matter of history course',
                ],
            ],
            [
                'order' => 17,
                'question' => 'Which of the following is NOT mentioned as an example of an organic material?',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'stone',
                    'B' => 'wool',
                    'C' => 'grass',
                    'D' => 'hair',
                ],
            ],
            [
                'order' => 18,
                'question' => 'The author mentions all the following archaeological discovery sites EXCEPT ____.',
                'correct_answer' => 'A',
                'choices' => [
                    'A' => 'urban areas',
                    'B' => 'peat bogs',
                    'C' => 'very hot and dry lands',
                    'D' => 'earth that has been frozen',
                ],
            ],
            [
                'order' => 19,
                'question' => 'The word "mere" in line 17 can be best replaced by ____.',
                'correct_answer' => 'D',
                'choices' => [
                    'A' => 'simple',
                    'B' => 'unimportant',
                    'C' => 'pure',
                    'D' => 'little',
                ],
            ],
            [
                'order' => 20,
                'question' => 'The paragraph following the passage most probably discusses ____.',
                'correct_answer' => 'C',
                'choices' => [
                    'A' => 'techniques for recording oral histories',
                    'B' => 'certain battlefield excavation methods',
                    'C' => 'some specific archaeological discoveries',
                    'D' => 'building materials of the nineteenth and twentieth centuries',
                ],
            ],
        ];

        foreach ($reading2Questions as $q) {
            questions::create([
                'passage_id' => $passageReading2->id,
                'toefl_subtest_id' => $tsReading->id,
                'subtest_id' => $subtestReading->id,
                'question' => $q['question'],
                'question_type' => 'multiple_choice',
                'choices' => $q['choices'],
                'correct_answer' => $q['correct_answer'],
                'point' => 1,
                'order' => $q['order'],
            ]);
        }

        $this->command->info('✅ ToeflLatihan1Seeder selesai:');
        $this->command->info('');
        $this->command->info('   [Subtests Master]');
        $this->command->info('   ID 1 → Reading');
        $this->command->info('   ID 2 → Listening');
        $this->command->info('   ID 3 → Structure');
        $this->command->info('   ID 4 → Essay');
        $this->command->info('   ID 5 → Speaking');
        $this->command->info('');
        $this->command->info('   [TOEFL Latihan 1]');
        $this->command->info('   • Listening  : 3 passage | 18 soal (Part A: 10, Part B: 4, Part C: 4)');
        $this->command->info('   • Structure  : 1 passage | 25 soal (Structure: 15, Written Expression: 10)');
        $this->command->info('   • Reading    : 2 passage | 20 soal (Passage 1: 10, Passage 2: 10)');
    }
}