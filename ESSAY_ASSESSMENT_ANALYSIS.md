# Essay Assessment Analysis

Source files:

- `docs/Essay Assesment.xlsx`
- `docs/prompt.md`

Method:

- Each respondent has five short essay answers.
- Content and grammar are estimated as aggregate 1-5 scales across all five answers.
- Decimal scales are used because each respondent score is an average across five answers.
- Final Essay Score = `(Content * 0.7 + Grammar * 0.3) * 20`.
- CEFR follows `prompt.md`: 0-30 A1, 31-40 A2, 41-50 B1, 51-60 B2, 61-70 C1, 71-100 C2.
- Listening, Structure, and Reading are generated to follow essay ability with natural variation.

Distribution:

- A2: 10 respondents
- B1: 18 respondents
- B2: 7 respondents
- C1/C2: 0 respondents

| User    | Content | Grammar | Essay Final | CEFR | Listening | Structure | Reading | Notes                                                                              |
| ------- | ------: | ------: | ----------: | ---- | --------: | --------: | ------: | ---------------------------------------------------------------------------------- |
| User 1  |     2.0 |     1.8 |        38.8 | A2   |        36 |        34 |      38 | Relevant but informal, list-like answers with weak sentence control.               |
| User 2  |     2.0 |     1.9 |        39.4 | A2   |        37 |        35 |      39 | Relevant short answers; chat abbreviations and missing articles reduce grammar.    |
| User 3  |     2.0 |     2.0 |        40.0 | A2   |        38 |        36 |      37 | On topic with useful details, but basic structure and grammar gaps remain.         |
| User 4  |     2.2 |     2.4 |        45.2 | B1   |        42 |        44 |      46 | Clear enough and complete for short prompts, with recurring article/verb issues.   |
| User 5  |     2.4 |     2.5 |        48.6 | B1   |        47 |        45 |      48 | Good vocabulary for SMK topics, but responses remain brief and underdeveloped.     |
| User 6  |     2.9 |     2.9 |        58.0 | B2   |        54 |        56 |      58 | More formal, coherent, and complete; minor wording errors only.                    |
| User 7  |     2.0 |     1.8 |        38.8 | A2   |        36 |        37 |      39 | Relevant but informal with "u/n" style and limited control.                        |
| User 8  |     2.4 |     2.6 |        49.2 | B1   |        48 |        46 |      49 | Good topic coverage and vocabulary, but still concise and lightly formulaic.       |
| User 9  |     2.2 |     2.4 |        45.2 | B1   |        44 |        43 |      45 | Mostly accurate content with fair grammar and basic cohesion.                      |
| User 10 |     2.5 |     2.5 |        50.0 | B1   |        49 |        47 |      48 | Strong relevance and practical examples; grammar generally fair.                   |
| User 11 |     2.0 |     1.9 |        39.4 | A2   |        39 |        35 |      38 | Adequate answers but informal diction and sentence fragments lower control.        |
| User 12 |     3.0 |     2.9 |        59.4 | B2   |        57 |        55 |      59 | Best-developed set; consistent relevance, vocabulary, and coherence.               |
| User 13 |     2.5 |     2.4 |        49.4 | B1   |        46 |        48 |      47 | Formal vocabulary and relevant answers, but all-caps style and compressed grammar. |
| User 14 |     2.3 |     2.5 |        46.8 | B1   |        45 |        46 |      43 | Good relevance with formal vocabulary; several awkward phrases.                    |
| User 15 |     2.2 |     2.3 |        44.6 | B1   |        43 |        45 |      44 | Clear basic explanations with some grammar and article omissions.                  |
| User 16 |     2.3 |     2.5 |        46.8 | B1   |        46 |        44 |      47 | Relevant workplace-focused answers; grammar is fair but not consistently accurate. |
| User 17 |     2.0 |     1.9 |        39.4 | A2   |        37 |        36 |      40 | Informal and simple, with useful ideas but weak mechanics.                         |
| User 18 |     1.9 |     1.8 |        37.4 | A2   |        35 |        34 |      37 | Very conversational; relevant but grammar and academic style are weak.             |
| User 19 |     2.3 |     2.4 |        46.2 | B1   |        44 |        46 |      45 | Relevant and coherent enough, with common grammar omissions.                       |
| User 20 |     2.4 |     2.5 |        48.6 | B1   |        48 |        47 |      49 | Formal and relevant, but still short and formulaic.                                |
| User 21 |     2.3 |     2.5 |        46.8 | B1   |        47 |        45 |      46 | Good vocabulary and clear ideas, with occasional awkward collocation.              |
| User 22 |     2.9 |     3.0 |        58.6 | B2   |        55 |        57 |      59 | Strong set with coherent answers and fewer grammar problems.                       |
| User 23 |     2.2 |     2.4 |        45.2 | B1   |        42 |        45 |      44 | Clear ideas with basic grammar; answers remain compact.                            |
| User 24 |     2.3 |     2.5 |        46.8 | B1   |        46 |        47 |      44 | Relevant and fairly complete, with grammar/collocation issues.                     |
| User 25 |     2.0 |     2.0 |        40.0 | A2   |        39 |        38 |      40 | Relevant but grammar is weaker, especially in the teamwork answer.                 |
| User 26 |     3.0 |     2.9 |        59.4 | B2   |        58 |        56 |      55 | Among the strongest: clear, relevant, and mostly controlled.                       |
| User 27 |     2.3 |     2.4 |        46.2 | B1   |        45 |        43 |      47 | Good coverage but uneven structure and some informal wording.                      |
| User 28 |     2.9 |     2.8 |        57.4 | B2   |        57 |        54 |      58 | Strong content and fluency; minor informal diction remains.                        |
| User 29 |     2.4 |     2.4 |        48.0 | B1   |        47 |        46 |      44 | Clear B1-level responses with useful vocabulary and minor awkwardness.             |
| User 30 |     2.0 |     1.9 |        39.4 | A2   |        38 |        36 |      39 | Basic but relevant; frequent informal forms and simple grammar.                    |
| User 31 |     2.9 |     3.0 |        58.6 | B2   |        56 |        58 |      57 | Strong, coherent, and workplace-relevant responses.                                |
| User 32 |     2.3 |     2.5 |        46.8 | B1   |        44 |        45 |      47 | Relevant explanations with fair grammar and moderate vocabulary.                   |
| User 33 |     2.0 |     2.0 |        40.0 | A2   |        39 |        37 |      38 | Simple and relevant, but limited development and basic language.                   |
| User 34 |     2.3 |     2.4 |        46.2 | B1   |        46 |        44 |      45 | Clear ideas with fair grammar, though still short and repetitive.                  |
| User 35 |     3.0 |     2.9 |        59.4 | B2   |        58 |        55 |      59 | Strong relevance and vocabulary with generally controlled structure.               |

<!-- User 29,31,32,34,35  -->

Seeder:

- Laravel seeder: `database/seeders/EssayAssessmentScoreSeeder.php`
- Non-essay scores use `[raw_score, scaled_score]`.
- Essay is inserted into `raw_score`; `scaled_score` is `null`, matching the current essay scoring flow.
