<?php

namespace Database\Seeders;

use App\Models\Passage;
use App\Models\Questions;
use App\Models\Subtest;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardPracticeBankSoalSeeder extends Seeder
{
  public function run(): void
  {
    DB::transaction(function () {
      $toefl = Toefl::updateOrCreate(
        ['code' => self::TOEFL['code']],
        [
          'name' => self::TOEFL['name'],
          'status' => self::TOEFL['status'],
        ],
      );

      $subtests = [];
      foreach (self::SUBTESTS as $key => $definition) {
        $subtests[$key] = Subtest::updateOrCreate(
          ['name' => $definition['name']],
          $definition,
        );
      }

      $toeflSubtests = [];
      foreach (self::TOEFL_SUBTESTS as $key => $definition) {
        $toeflSubtests[$key] = ToeflSubtest::updateOrCreate(
          [
            'toefl_id' => $toefl->id,
            'subtest_id' => $subtests[$key]->id,
          ],
          $definition,
        );
      }

      foreach ($toeflSubtests as $toeflSubtest) {
        Questions::where('toefl_subtest_id', $toeflSubtest->id)->delete();
      }

      $passages = [];
      foreach (self::PASSAGES as $definition) {
        $passageKey = [
          'subtest_id' => $subtests[$definition['subtest']]->id,
          'title' => $definition['title'],
        ];

        DB::table('passages')->updateOrInsert(
          $passageKey,
          [
            'text' => $definition['text'],
            'audio_url' => $definition['audio_url'],
            'created_at' => now(),
            'updated_at' => now(),
          ],
        );

        $passage = Passage::where($passageKey)->firstOrFail();

        $passages[$definition['key']] = $passage;
      }

      foreach (self::QUESTIONS as $definition) {
        Questions::create([
          'toefl_subtest_id' => $toeflSubtests[$definition['subtest']]->id,
          'subtest_id' => $subtests[$definition['subtest']]->id,
          'passage_id' => $definition['passage'] ? $passages[$definition['passage']]->id : null,
          'order' => $definition['order'],
          'question_type' => $definition['question_type'],
          'question' => $definition['question'],
          'question_audio_url' => $definition['question_audio_url'],
          'choices' => $definition['choices'],
          'correct_answer' => $definition['correct_answer'],
          'keywords' => $definition['keywords'],
          'min_words' => $definition['min_words'],
          'point' => $definition['point'],
        ]);
      }

      $this->command->newLine();
      $this->command->info('✅ Data hasil seed untuk TEP Practice masuk:');
      $this->command->newLine();

      $this->command->line('  toefls:');
      $this->command->line("  - id: {$toefl->id}");
      $this->command->line("  - name: {$toefl->name}");
      $this->command->line("  - code: {$toefl->code}");
      $this->command->line("  - status: {$toefl->status}");

      $this->command->newLine();
    });

  }
  private const TOEFL = array(
    'name' => 'TEP',
    'code' => 'tep',
    'status' => 'active',
  );

  private const SUBTESTS = array(
    'listening' =>
      array(
        'name' => 'listening',
        'slug' => 'listening Comprehension',
        'order' => 1,
        'instructions' =>
          array(
            0 => 'Listen carefully to each conversation or talk.',
            1 => 'The audio and question flow may only be played once during the test.',
            2 => 'Choose the best answer based on what the speakers say or imply.',
          ),
      ),
    'structure' =>
      array(
        'name' => 'structure',
        'slug' => 'Structure & Written Expression',
        'order' => 2,
        'instructions' =>
          array(
            0 => 'Choose the answer that best completes the sentence or identifies the error.',
            1 => 'Pay attention to grammar, word form, and sentence structure.',
            2 => 'Move on if unsure and manage your time carefully.',
          ),
      ),
    'reading' =>
      array(
        'name' => 'reading',
        'slug' => 'Reading Comprehension',
        'order' => 3,
        'instructions' =>
          array(
            0 => 'Read each passage carefully before answering the questions.',
            1 => 'Use information stated or implied in the passage.',
            2 => 'Choose the best answer for each question.',
          ),
      ),
    'essay' =>
      array(
        'name' => 'essay',
        'slug' => 'essay',
        'order' => 4,
        'instructions' =>
          array(
            0 => 'Write a clear response with an introduction, supporting body, and conclusion.',
            1 => 'Use relevant examples and reasons to support your opinion.',
            2 => 'Review your grammar and vocabulary before submitting.',
          ),
      ),
  );

  private const TOEFL_SUBTESTS = array(
    'listening' =>
      array(
        'order' => 1,
        'duration_minutes' => 35,
        'total_questions' => 50,
        'passing_score' => 50,
      ),
    'structure' =>
      array(
        'order' => 2,
        'duration_minutes' => 25,
        'total_questions' => 40,
        'passing_score' => 40,
      ),
    'reading' =>
      array(
        'order' => 3,
        'duration_minutes' => 55,
        'total_questions' => 50,
        'passing_score' => 50,
      ),
    'essay' =>
      array(
        'order' => 4,
        'duration_minutes' => 45,
        'total_questions' => 5,
        'passing_score' => 100,
      ),
  );

  private const PASSAGES = array(
    0 =>
      array(
        'key' => 'listening:Listening Item 1',
        'subtest' => 'listening',
        'title' => 'Listening Item 1',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"PhJpUX7d9G9aObDbTvTay\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Did you finish the homework for English class? \\"},{\\"actor_id\\":\\"PhJpUX7d9G9aObDbTvTay\\",\\"text\\":\\"Not yet. I\\u2019ll do it after dinner.\\"}]}"',
        'audio_url' => '/storage/audio/passage_1.wav',
      ),
    1 =>
      array(
        'key' => 'listening:Listening Item 2',
        'subtest' => 'listening',
        'title' => 'Listening Item 2',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"kk71Md507XPoGJzTpF0hs\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Are you going to the library now?\\"},{\\"actor_id\\":\\"kk71Md507XPoGJzTpF0hs\\",\\"text\\":\\" No, I\\u2019ll go after my meeting.\\"}]}"',
        'audio_url' => '/storage/audio/passage_2.wav',
      ),
    2 =>
      array(
        'key' => 'listening:Listening Item 3',
        'subtest' => 'listening',
        'title' => 'Listening Item 3',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"3FkXjQx8AZfpzz2BKEoy0\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The bus is late again\\"},{\\"actor_id\\":\\"3FkXjQx8AZfpzz2BKEoy0\\",\\"text\\":\\"You should try taking the train instead.\\"}]}"',
        'audio_url' => '/storage/audio/passage_3.wav',
      ),
    3 =>
      array(
        'key' => 'listening:Listening Item 4',
        'subtest' => 'listening',
        'title' => 'Listening Item 4',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"SkCLiJvNBHSDzj0lhXE7F\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I missed class yesterday. Did the teacher give homework?\\"},{\\"actor_id\\":\\"SkCLiJvNBHSDzj0lhXE7F\\",\\"text\\":\\"Yes, a short exercise on page 32.\\"}]}"',
        'audio_url' => '/storage/audio/passage_4.wav',
      ),
    4 =>
      array(
        'key' => 'listening:Listening Item 5',
        'subtest' => 'listening',
        'title' => 'Listening Item 5',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"QYXY2aG_SfRKzIMt4qaoc\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The doctor said I need more rest.\\"},{\\"actor_id\\":\\"QYXY2aG_SfRKzIMt4qaoc\\",\\"text\\":\\"I agree. You\\u2019ve been working too much.\\"}]}"',
        'audio_url' => '/storage/audio/passage_5.wav',
      ),
    5 =>
      array(
        'key' => 'listening:Listening Item 6',
        'subtest' => 'listening',
        'title' => 'Listening Item 6',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"bASxiuQoZmZheHGNx7x6t\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Did you like the concert?\\"},{\\"actor_id\\":\\"bASxiuQoZmZheHGNx7x6t\\",\\"text\\":\\"Not really. It was too loud.\\"}]}"',
        'audio_url' => '/storage/audio/passage_6.wav',
      ),
    6 =>
      array(
        'key' => 'listening:Listening Item 7',
        'subtest' => 'listening',
        'title' => 'Listening Item 7',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"Na5xZbiAkYJPKVGXD_qL_\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I can\\u2019t find my phone.\\"},{\\"actor_id\\":\\"Na5xZbiAkYJPKVGXD_qL_\\",\\"text\\":\\" Did you check your backpack?\\"}]}"',
        'audio_url' => '/storage/audio/passage_7.wav',
      ),
    7 =>
      array(
        'key' => 'listening:Listening Item 8',
        'subtest' => 'listening',
        'title' => 'Listening Item 8',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"erBN1MyPLbeLS2RF9NTdU\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Can we meet at 3 instead of 2? \\"},{\\"actor_id\\":\\"erBN1MyPLbeLS2RF9NTdU\\",\\"text\\":\\"Sure, that works.\\"}]}"',
        'audio_url' => '/storage/audio/passage_8.wav',
      ),
    8 =>
      array(
        'key' => 'listening:Listening Item 9',
        'subtest' => 'listening',
        'title' => 'Listening Item 9',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"3wrxT3KY2T6kCC1vppa6F\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The math exam was difficult.\\"},{\\"actor_id\\":\\"3wrxT3KY2T6kCC1vppa6F\\",\\"text\\":\\"I struggled too.\\"}]}"',
        'audio_url' => '/storage/audio/passage_9.wav',
      ),
    9 =>
      array(
        'key' => 'listening:Listening Item 10',
        'subtest' => 'listening',
        'title' => 'Listening Item 10',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"P4HP6mbsa2LqoLFbc83qz\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Do you need help with your project?\\"},{\\"actor_id\\":\\"P4HP6mbsa2LqoLFbc83qz\\",\\"text\\":\\" Yes, I\\u2019d appreciate that.\\"}]}"',
        'audio_url' => '/storage/audio/passage_10.wav',
      ),
    10 =>
      array(
        'key' => 'listening:Listening Item 11',
        'subtest' => 'listening',
        'title' => 'Listening Item 11',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"male\\"},{\\"id\\":\\"U4NwrXaBN3_wYpkupD371\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I missed the bus this morning.\\"},{\\"actor_id\\":\\"U4NwrXaBN3_wYpkupD371\\",\\"text\\":\\"Why don\\u2019t you leave home earlier?\\"}]}"',
        'audio_url' => '/storage/audio/passage_11.wav',
      ),
    11 =>
      array(
        'key' => 'listening:Listening Item 12',
        'subtest' => 'listening',
        'title' => 'Listening Item 12',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"40urUUKfcMcsvat8pslw5\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Do you want coffee or tea?\\"},{\\"actor_id\\":\\"40urUUKfcMcsvat8pslw5\\",\\"text\\":\\" Either is fine.\\"}]}"',
        'audio_url' => '/storage/audio/passage_12.wav',
      ),
    12 =>
      array(
        'key' => 'listening:Listening Item 13',
        'subtest' => 'listening',
        'title' => 'Listening Item 13',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"juz-WvEwPofp-oZVShQWg\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The presentation was excellent.\\"},{\\"actor_id\\":\\"juz-WvEwPofp-oZVShQWg\\",\\"text\\":\\"Thanks, but I was so nervous.\\"}]}"',
        'audio_url' => '/storage/audio/passage_13.wav',
      ),
    13 =>
      array(
        'key' => 'listening:Listening Item 14',
        'subtest' => 'listening',
        'title' => 'Listening Item 14',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"65JEnxTiRkWHJmaoOz8Vx\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I can\\u2019t print my file.\\"},{\\"actor_id\\":\\"65JEnxTiRkWHJmaoOz8Vx\\",\\"text\\":\\"Maybe the printer is out of ink.\\"}]}"',
        'audio_url' => '/storage/audio/passage_14.wav',
      ),
    14 =>
      array(
        'key' => 'listening:Listening Item 15',
        'subtest' => 'listening',
        'title' => 'Listening Item 15',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"DippvbiRoapdRdnO_IOgO\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The restaurant is full.\\"},{\\"actor_id\\":\\"DippvbiRoapdRdnO_IOgO\\",\\"text\\":\\"Let\\u2019s try the one across the street.\\"}]}"',
        'audio_url' => '/storage/audio/passage_15.wav',
      ),
    15 =>
      array(
        'key' => 'listening:Listening Item 16',
        'subtest' => 'listening',
        'title' => 'Listening Item 16',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"kLFzMbmqO8EbToKkljxnL\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Can you pick me up at 5?\\"},{\\"actor_id\\":\\"kLFzMbmqO8EbToKkljxnL\\",\\"text\\":\\"I\\u2019m afraid I\\u2019ll still be at work.\\"}]}"',
        'audio_url' => '/storage/audio/passage_16.wav',
      ),
    16 =>
      array(
        'key' => 'listening:Listening Item 17',
        'subtest' => 'listening',
        'title' => 'Listening Item 17',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"lx_Nae552kY3bs0iRnwE9\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Did you hear the news about the storm?\\"},{\\"actor_id\\":\\"lx_Nae552kY3bs0iRnwE9\\",\\"text\\":\\"Yes, classes might be canceled.\\"}]}"',
        'audio_url' => '/storage/audio/passage_17.wav',
      ),
    17 =>
      array(
        'key' => 'listening:Listening Item 18',
        'subtest' => 'listening',
        'title' => 'Listening Item 18',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"JXVy1AN3QogC8DW4jGNjE\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I lost my keys again.\\"},{\\"actor_id\\":\\"JXVy1AN3QogC8DW4jGNjE\\",\\"text\\":\\"You should keep them in one place.\\"}]}"',
        'audio_url' => '/storage/audio/passage_18.wav',
      ),
    18 =>
      array(
        'key' => 'listening:Listening Item 19',
        'subtest' => 'listening',
        'title' => 'Listening Item 19',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Woman: Do you mind opening the window?Man: Not at all.\\"}]}"',
        'audio_url' => '/storage/audio/passage_19.wav',
      ),
    19 =>
      array(
        'key' => 'listening:Listening Item 20',
        'subtest' => 'listening',
        'title' => 'Listening Item 20',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"6nNM266MzQvFpuzIecK_y\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I didn\\u2019t understand the last part of the lecture.\\"},{\\"actor_id\\":\\"6nNM266MzQvFpuzIecK_y\\",\\"text\\":\\"I can explain it to you later.\\"}]}"',
        'audio_url' => '/storage/audio/passage_20.wav',
      ),
    20 =>
      array(
        'key' => 'listening:Listening Item 21',
        'subtest' => 'listening',
        'title' => 'Listening Item 21',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"efHiBdsMAJ6Qu1CKVgO3p\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I\\u2019m really tired today.\\"},{\\"actor_id\\":\\"efHiBdsMAJ6Qu1CKVgO3p\\",\\"text\\":\\"Then you should take a break.\\"}]}"',
        'audio_url' => '/storage/audio/passage_21.wav',
      ),
    21 =>
      array(
        'key' => 'listening:Listening Item 22',
        'subtest' => 'listening',
        'title' => 'Listening Item 22',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"VsRigkoATK3_hcF8umaPv\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Do you know where my wallet is?\\"},{\\"actor_id\\":\\"VsRigkoATK3_hcF8umaPv\\",\\"text\\":\\"You left it on the kitchen table.\\"}]}"',
        'audio_url' => '/storage/audio/passage_22.wav',
      ),
    22 =>
      array(
        'key' => 'listening:Listening Item 23',
        'subtest' => 'listening',
        'title' => 'Listening Item 23',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"eEdRUQwYzppaZzaIJSOFh\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The weather is getting colder. \\"},{\\"actor_id\\":\\"eEdRUQwYzppaZzaIJSOFh\\",\\"text\\":\\"Yes, winter is coming.\\"}]}"',
        'audio_url' => '/storage/audio/passage_23.wav',
      ),
    23 =>
      array(
        'key' => 'listening:Listening Item 24',
        'subtest' => 'listening',
        'title' => 'Listening Item 24',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"9MNkTSSqj2Vznn2sJJNGe\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Can you help me with this report?\\"},{\\"actor_id\\":\\"9MNkTSSqj2Vznn2sJJNGe\\",\\"text\\":\\" I\\u2019d love to, but I\\u2019m busy right now.\\"}]}"',
        'audio_url' => '/storage/audio/passage_24.wav',
      ),
    24 =>
      array(
        'key' => 'listening:Listening Item 25',
        'subtest' => 'listening',
        'title' => 'Listening Item 25',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"AIidEKaQqV9HiwQjcFTzI\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I can\\u2019t open this jar. \\"},{\\"actor_id\\":\\"AIidEKaQqV9HiwQjcFTzI\\",\\"text\\":\\"Let me try.\\"}]}"',
        'audio_url' => '/storage/audio/passage_25.wav',
      ),
    25 =>
      array(
        'key' => 'listening:Listening Item 26',
        'subtest' => 'listening',
        'title' => 'Listening Item 26',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"bR76Uog6OWk3mn3NsWwvK\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The line is too long.\\"},{\\"actor_id\\":\\"bR76Uog6OWk3mn3NsWwvK\\",\\"text\\":\\"We should come earlier next time.\\"}]}"',
        'audio_url' => '/storage/audio/passage_26.wav',
      ),
    26 =>
      array(
        'key' => 'listening:Listening Item 27',
        'subtest' => 'listening',
        'title' => 'Listening Item 27',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"-mjY6iT2pkYA-NQmr_Y5z\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I think I failed the test. \\"},{\\"actor_id\\":\\"-mjY6iT2pkYA-NQmr_Y5z\\",\\"text\\":\\"Don\\u2019t worry. You always do well.\\"}]}"',
        'audio_url' => '/storage/audio/passage_27.wav',
      ),
    27 =>
      array(
        'key' => 'listening:Listening Item 28',
        'subtest' => 'listening',
        'title' => 'Listening Item 28',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"g1hQrG0wcrjCiAlQqZTb2\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"My computer keeps freezing.\\"},{\\"actor_id\\":\\"g1hQrG0wcrjCiAlQqZTb2\\",\\"text\\":\\"Maybe it needs an update.\\"}]}"',
        'audio_url' => '/storage/audio/passage_28.wav',
      ),
    28 =>
      array(
        'key' => 'listening:Listening Item 29',
        'subtest' => 'listening',
        'title' => 'Listening Item 29',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"E9qf5qXxiK8g1XxA-OTxL\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"This bag is too heavy.\\"},{\\"actor_id\\":\\"E9qf5qXxiK8g1XxA-OTxL\\",\\"text\\":\\"Let me carry it for you.\\"}]}"',
        'audio_url' => '/storage/audio/passage_29.wav',
      ),
    29 =>
      array(
        'key' => 'listening:Listening Item 30',
        'subtest' => 'listening',
        'title' => 'Listening Item 30',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"A\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"vYmvlMoBtjhzU7aPZYQLA\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Do you want to walk or take the bus?\\"},{\\"actor_id\\":\\"vYmvlMoBtjhzU7aPZYQLA\\",\\"text\\":\\"Let\\u2019s take the bus. I\\u2019m tired.\\"}]}"',
        'audio_url' => '/storage/audio/passage_30.wav',
      ),
    30 =>
      array(
        'key' => 'listening:Listening Item 31',
        'subtest' => 'listening',
        'title' => 'Listening Item 31',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"y4Q5KuHZeNBCrywUyXpR-\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I\\u2019m thinking about dropping my history class. It\\u2019s just too difficult, and I can\\u2019t keep up with the readings.\\"},{\\"actor_id\\":\\"y4Q5KuHZeNBCrywUyXpR-\\",\\"text\\":\\"Why don\\u2019t you talk to the professor first? He might give you some advice or extra time for the assignments.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"That\\u2019s a good idea. I\\u2019ll try meeting him after class today.\\"}]}"',
        'audio_url' => '/storage/audio/passage_31.wav',
      ),
    31 =>
      array(
        'key' => 'listening:Listening Item 32',
        'subtest' => 'listening',
        'title' => 'Listening Item 32',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"T2Tt9fGas0QnV7wfuw3P5\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Did you hear about the new gym on campus?\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Yes, I went there yesterday. It\\u2019s much bigger than the old one, and the equipment is brand new.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Really? I\\u2019ve been wanting to work out more often. Maybe I\\u2019ll check it out this weekend.\\"}]}"',
        'audio_url' => '/storage/audio/passage_32.wav',
      ),
    32 =>
      array(
        'key' => 'listening:Listening Item 33',
        'subtest' => 'listening',
        'title' => 'Listening Item 33',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"TZsR0r7aGbbUCjB1oyklf\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I\\u2019m having trouble choosing electives for next semester. There are so many interesting options.\\"},{\\"actor_id\\":\\"TZsR0r7aGbbUCjB1oyklf\\",\\"text\\":\\"Why not choose something you\\u2019ve never tried before? It could be a good chance to learn something new.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"That\\u2019s true. Maybe I\\u2019ll take the photography course.\\"}]}"',
        'audio_url' => '/storage/audio/passage_33.wav',
      ),
    33 =>
      array(
        'key' => 'listening:Listening Item 34',
        'subtest' => 'listening',
        'title' => 'Listening Item 34',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"f7T09rUy1ti7FUkgZLeiP\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I heard you\\u2019re working on a group project for your business class. How\\u2019s it going?\\"},{\\"actor_id\\":\\"f7T09rUy1ti7FUkgZLeiP\\",\\"text\\":\\"Not so well. Two of the group members haven\\u2019t done any work.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"That must be frustrating. Have you talked to them?\\"},{\\"actor_id\\":\\"f7T09rUy1ti7FUkgZLeiP\\",\\"text\\":\\"Yes, but they keep making excuses.\\"}]}"',
        'audio_url' => '/storage/audio/passage_34.wav',
      ),
    34 =>
      array(
        'key' => 'listening:Listening Item 35',
        'subtest' => 'listening',
        'title' => 'Listening Item 35',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"xtOMQHXwvYhPwhsu_xurR\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The cafeteria is serving free lunch today.\\"},{\\"actor_id\\":\\"xtOMQHXwvYhPwhsu_xurR\\",\\"text\\":\\"Really? What\\u2019s the occasion?\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"It\\u2019s part of the school\\u2019s anniversary celebration.\\"},{\\"actor_id\\":\\"xtOMQHXwvYhPwhsu_xurR\\",\\"text\\":\\"That explains why it\\u2019s so crowded.\\"}]}"',
        'audio_url' => '/storage/audio/passage_35.wav',
      ),
    35 =>
      array(
        'key' => 'listening:Listening Item 36',
        'subtest' => 'listening',
        'title' => 'Listening Item 36',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"3s93bdONKAmgFFW4qB4pw\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I\\u2019m thinking of buying a new laptop. Mine is getting too slow\\"},{\\"actor_id\\":\\"3s93bdONKAmgFFW4qB4pw\\",\\"text\\":\\"You should check out the sale at the electronics store. They have good discounts this week.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Great! Maybe I\\u2019ll go there after class.\\"}]}"',
        'audio_url' => '/storage/audio/passage_36.wav',
      ),
    36 =>
      array(
        'key' => 'listening:Listening Item 37',
        'subtest' => 'listening',
        'title' => 'Listening Item 37',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"},{\\"id\\":\\"qHxzzZDMic5nkcnjhrdF6\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Why weren\\u2019t you in class yesterday?\\"},{\\"actor_id\\":\\"qHxzzZDMic5nkcnjhrdF6\\",\\"text\\":\\"I had a doctor\\u2019s appointment. I wasn\\u2019t feeling well.\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I hope you\\u2019re okay now.\\"},{\\"actor_id\\":\\"qHxzzZDMic5nkcnjhrdF6\\",\\"text\\":\\"Yes, I\\u2019m feeling much better today\\"}]}"',
        'audio_url' => '/storage/audio/passage_37.wav',
      ),
    37 =>
      array(
        'key' => 'listening:Listening Item 38',
        'subtest' => 'listening',
        'title' => 'Listening Item 38',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"B\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"},{\\"id\\":\\"Mse32M8Yp-kSCVungEAPQ\\",\\"name\\":\\"Speaker 2\\",\\"gender\\":\\"male\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"I\\u2019m planning to take a trip during the holiday break\\"},{\\"actor_id\\":\\"Mse32M8Yp-kSCVungEAPQ\\",\\"text\\":\\"Are you going somewhere far?\\"},{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Not really. I just want to visit my grandparents.\\"},{\\"actor_id\\":\\"Mse32M8Yp-kSCVungEAPQ\\",\\"text\\":\\"That sounds nice.\\"}]}"',
        'audio_url' => '/storage/audio/passage_38.wav',
      ),
    38 =>
      array(
        'key' => 'listening:Listening Item 39',
        'subtest' => 'listening',
        'title' => 'Listening Item 39',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Welcome to the campus library. We are open from 8 a.m. to 10 p.m. on weekdays and from 9 a.m. to 6 p.m. on weekends. Please remember that food and drinks are not allowed inside the reading area. If you need help finding a book, feel free to ask the librarian at the front desk.\\"}]}"',
        'audio_url' => '/storage/audio/passage_39.wav',
      ),
    39 =>
      array(
        'key' => 'listening:Listening Item 40',
        'subtest' => 'listening',
        'title' => 'Listening Item 40',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Attention passengers. The 4:30 train to Green Valley will be delayed due to maintenance on the tracks. The new departure time is 5:00 p.m. We apologize for the inconvenience.\\"}]}"',
        'audio_url' => '/storage/audio/passage_40.wav',
      ),
    40 =>
      array(
        'key' => 'listening:Listening Item 41',
        'subtest' => 'listening',
        'title' => 'Listening Item 41',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Good morning, everyone. Today, we will be discussing the importance of regular exercise. Research shows that even 30 minutes of activity a day can improve your mood, increase energy, and reduce stress. Let\\u2019s start with some examples of simple exercises you can do at home.\\"}]}"',
        'audio_url' => '/storage/audio/passage_41.wav',
      ),
    41 =>
      array(
        'key' => 'listening:Listening Item 42',
        'subtest' => 'listening',
        'title' => 'Listening Item 42',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Welcome to the museum. Our newest exhibit features ancient tools used by early human civilizations. You\\u2019ll find displays showing how these tools were made and what they were used for. Please follow the signs to the first room on your right.\\"}]}"',
        'audio_url' => '/storage/audio/passage_42.wav',
      ),
    42 =>
      array(
        'key' => 'listening:Listening Item 43',
        'subtest' => 'listening',
        'title' => 'Listening Item 43',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"This is a reminder that the student club fair will be held tomorrow in the main hall from 10 a.m. to 3 p.m. All students are encouraged to attend and learn about the various clubs on campus.\\"}]}"',
        'audio_url' => '/storage/audio/passage_43.wav',
      ),
    43 =>
      array(
        'key' => 'listening:Listening Item 44',
        'subtest' => 'listening',
        'title' => 'Listening Item 44',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"If you\\u2019re looking for a quiet place to study, the second floor of the library has individual study rooms that can be reserved for up to two hours. Reservations can be made online through the library website.\\"}]}"',
        'audio_url' => '/storage/audio/passage_44.wav',
      ),
    44 =>
      array(
        'key' => 'listening:Listening Item 45',
        'subtest' => 'listening',
        'title' => 'Listening Item 45',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"The weather forecast predicts heavy rain this afternoon, so please bring an umbrella and be careful when driving. Temperatures are expected to drop by evening.\\"}]}"',
        'audio_url' => '/storage/audio/passage_45.wav',
      ),
    45 =>
      array(
        'key' => 'listening:Listening Item 46',
        'subtest' => 'listening',
        'title' => 'Listening Item 46',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"During today\\u2019s orientation, we will provide information about campus services, including the health center, counseling office, and student activities. After the presentation, you\\u2019ll be given a tour of the campus.\\"}]}"',
        'audio_url' => '/storage/audio/passage_46.wav',
      ),
    46 =>
      array(
        'key' => 'listening:Listening Item 47',
        'subtest' => 'listening',
        'title' => 'Listening Item 47',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Welcome to the city tour. Our first stop is the historic downtown area, where you\\u2019ll see buildings that are over 200 years old. Then we\\u2019ll head to the riverfront for lunch before visiting the art museum.\\"}]}"',
        'audio_url' => '/storage/audio/passage_47.wav',
      ),
    47 =>
      array(
        'key' => 'listening:Listening Item 48',
        'subtest' => 'listening',
        'title' => 'Listening Item 48',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"This is a reminder that maintenance work will be done on the dormitory elevators tomorrow from 9 a.m. to 1 p.m. During this time, the elevators will not be available, so please plan accordingly.\\"}]}"',
        'audio_url' => '/storage/audio/passage_48.wav',
      ),
    48 =>
      array(
        'key' => 'listening:Listening Item 49',
        'subtest' => 'listening',
        'title' => 'Listening Item 49',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"unknown\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"Thank you for calling Green Pharmacy. Our business hours are Monday through Friday, 9 a.m. to 8 p.m., and Saturday, 9 a.m. to 5 p.m. We are closed on Sundays.\\"}]}"',
        'audio_url' => '/storage/audio/passage_49.wav',
      ),
    49 =>
      array(
        'key' => 'listening:Listening Item 50',
        'subtest' => 'listening',
        'title' => 'Listening Item 50',
        'text' => '"{\\"type\\":\\"listening\\",\\"part\\":\\"C\\",\\"actors\\":[{\\"id\\":\\"speaker_1\\",\\"name\\":\\"Speaker 1\\",\\"gender\\":\\"female\\"}],\\"dialog\\":[{\\"actor_id\\":\\"speaker_1\\",\\"text\\":\\"We are excited to announce that our bookstore is offering a 20% discount on all textbooks this week. The discount applies only to in-store purchases, not online orders.\\"}]}"',
        'audio_url' => '/storage/audio/passage_50.wav',
      ),
    50 =>
      array(
        'key' => 'reading:Reading Passage 1',
        'subtest' => 'reading',
        'title' => 'Reading Passage 1',
        'text' => '"The widespread use of smartphones has significantly changed the way people communicate and interact with one another. In the past, face-to-face conversations were the primary mode of communication. Today, however, many individuals, especially younger generations, rely heavily on digital messaging platforms such as WhatsApp, Line, and social media applications. Although these tools provide convenience and allow instant communication across great distances, researchers argue that excessive reliance on digital communication may reduce the quality of interpersonal relationships.\\n\\nSeveral studies suggest that constant exposure to digital communication can affect social skills. For instance, young people who spend long hours interacting online may find it difficult to maintain eye contact or engage in deep, meaningful conversations during real-life interactions. Psychologists warn that this shift toward digital communication may lead to shallow relationships because online conversations are often shorter, faster, and less emotionally expressive than direct conversations.\\n\\nOn the other hand, smartphones also offer many positive effects. They enable individuals to stay connected with family and friends who live far away. For people who are introverted or have social anxiety, digital platforms provide a comfortable environment to communicate without pressure. In addition, smartphones serve as tools for education, entertainment, and productivity. Therefore, the impact of smartphones on social behavior depends largely on how they are used rather than the devices themselves."',
        'audio_url' => NULL,
      ),
    51 =>
      array(
        'key' => 'reading:Reading Passage 2',
        'subtest' => 'reading',
        'title' => 'Reading Passage 2',
        'text' => '"Climate change has become one of the most significant global issues affecting various sectors, including agriculture. Rising temperatures, unpredictable rainfall, and extreme weather events have created new challenges for farmers around the world. In many regions, crops that previously grew well are now facing reduced productivity due to shifting climate patterns. Corn, wheat, and rice\\u2014three of the most important staple crops\\u2014are particularly vulnerable to temperature fluctuations and prolonged dry seasons.\\n\\nFarmers in developing countries are among the most affected because they often lack access to modern farming technologies. Without advanced irrigation systems, improved seed varieties, or accurate weather forecasting tools, these farmers struggle to adapt to the changing environment. As a result, food security becomes a major concern, especially in areas where agriculture is the primary source of livelihood.\\n\\nDespite these challenges, researchers and agricultural experts are developing innovative solutions. One promising approach is the use of climate-resilient crops, which are engineered to withstand heat, drought, and pests. Additionally, digital agriculture technologies\\u2014such as satellite-based monitoring, automated irrigation, and mobile apps for weather prediction\\u2014offer farmers valuable tools to manage their farms more efficiently. While these solutions cannot completely eliminate the effects of climate change, they can significantly reduce the risks and help communities maintain stable food production."',
        'audio_url' => NULL,
      ),
    52 =>
      array(
        'key' => 'reading:Reading Passage 3',
        'subtest' => 'reading',
        'title' => 'Reading Passage 3',
        'text' => '"Sleep plays an essential role in maintaining overall health, but its impact on learning and memory is often underestimated. Many students, especially teenagers, tend to stay up late due to school assignments, electronic devices, or social activities. As a result, they often enter the classroom feeling tired and less prepared to concentrate. Researchers have found that insufficient sleep affects not only alertness but also the brain\\u2019s ability to store and retrieve information.\\n\\nDuring sleep, the brain goes through several cycles that help consolidate new memories. This process is crucial for students who need to remember lessons, vocabulary, or complex concepts learned during the day. When sleep is reduced or frequently interrupted, the brain does not complete these cycles effectively. Over time, this can lead to difficulties in academic performance, including slower problem-solving skills, weaker focus, and reduced creativity.\\n\\nDespite the importance of sleep, many students continue to underestimate its value. Schools, parents, and communities are encouraged to promote healthier sleep habits, such as setting earlier bedtimes, reducing screen time at night, and planning study schedules more effectively. By understanding how sleep affects learning, students may begin to prioritize rest as an important part of their academic success."',
        'audio_url' => NULL,
      ),
    53 =>
      array(
        'key' => 'reading:Reading Passage 4',
        'subtest' => 'reading',
        'title' => 'Reading Passage 4',
        'text' => '"Long before modern transportation systems were developed, ancient civilizations created various methods to move goods and people across long distances. One of the earliest systems was the network of trade routes used by the Mesopotamians and Egyptians. These routes connected major cities and allowed merchants to exchange valuable goods such as grain, pottery, and textiles. Transportation during this period relied heavily on animals like donkeys and camels, which were capable of carrying loads through harsh environments.\\n\\nAs civilizations expanded, transportation systems became more advanced. The Romans, for instance, built an extensive network of roads that covered much of Europe. These roads were constructed using layers of stone and were designed to last for centuries. They improved not only trade but also communication and military movement. The famous saying \\u201cAll roads lead to Rome\\u201d reflects the central role these roads played in connecting distant regions within the Roman Empire.\\n\\nIn addition to land transportation, water routes also contributed significantly to early trade. Ancient Chinese dynasties used the Grand Canal\\u2014one of the largest man-made waterways in the world\\u2014to transport rice, salt, and coal. This canal system helped unify the northern and southern regions of China. Similarly, the Vikings in Northern Europe relied on their longships, which were fast, lightweight, and ideal for navigating rivers and crossing open seas. These innovations highlight the importance of transportation in shaping early human societies and enabling cultural exchange."',
        'audio_url' => NULL,
      ),
    54 =>
      array(
        'key' => 'reading:Reading Passage 5',
        'subtest' => 'reading',
        'title' => 'Reading Passage 5',
        'text' => '"In recent years, online learning has become an increasingly popular option for students around the world. The rise of digital platforms has allowed educational institutions to offer flexible learning opportunities, enabling students to access courses from home or anywhere with an internet connection. This shift became even more significant during global health crises, when many schools were forced to transition to remote learning. Although online learning offers convenience and flexibility, its effectiveness continues to be a topic of debate among educators and researchers.\\n\\nOne major advantage of online learning is its ability to provide individualized instruction. Students can learn at their own pace, revisit materials they do not understand, and choose the time that suits their schedule. For students who are shy or reluctant to participate in traditional classrooms, online discussions and forums can provide a more comfortable environment. However, despite these benefits, online learning also presents several challenges. Some students struggle with self-discipline, time management, and maintaining motivation without direct supervision from teachers.\\n\\nAdditionally, the effectiveness of online learning greatly depends on the availability of technology and stable internet access. Students from rural or low-income areas may face difficulties due to limited devices or poor connectivity. Furthermore, subjects that require hands-on practice\\u2014such as laboratory work or performing arts\\u2014are harder to teach effectively in an online environment. Therefore, while online learning can enhance educational access, it may not fully replace traditional classroom experiences. A combination of both, known as blended learning, is increasingly seen as a balanced and effective approach."',
        'audio_url' => NULL,
      ),
  );

  private const QUESTIONS = array(
    0 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 1',
        'order' => 1,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She already finished it.',
            'B' => 'She will work on it later.',
            'C' => 'She forgot about it.',
            'D' => 'She needs help.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    1 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 2',
        'order' => 2,
        'question_type' => 'multiple_choice',
        'question' => 'When will the man go to the library?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Now',
            'B' => 'After his meeting',
            'C' => 'Tomorrow',
            'D' => 'Before the meeting',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    2 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 3',
        'order' => 3,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Wait for the bus',
            'B' => 'Walk instead',
            'C' => 'Take the train',
            'D' => 'Go home',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    3 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 4',
        'order' => 4,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man tell her?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'No homework',
            'B' => 'She can skip it',
            'C' => 'It’s on page 32',
            'D' => 'It’s very difficult',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    4 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 5',
        'order' => 5,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman imply?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He is lazy',
            'B' => 'He shouldn’t rest',
            'C' => 'He needs rest',
            'D' => 'The doctor is wrong',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    5 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 6',
        'order' => 6,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He enjoyed it',
            'B' => 'It was too quiet',
            'C' => 'The sound bothered him',
            'D' => 'He didn’t go',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    6 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 7',
        'order' => 7,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Buy a new phone',
            'B' => 'Call the phone',
            'C' => 'Check the backpack',
            'D' => 'Search outside',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    7 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 8',
        'order' => 8,
        'question_type' => 'multiple_choice',
        'question' => 'When will they meet?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => '2',
            'B' => '3',
            'C' => 'Tomorrow',
            'D' => 'Never',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    8 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 9',
        'order' => 9,
        'question_type' => 'multiple_choice',
        'question' => 'What can be inferred?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Both found it difficult',
            'B' => 'Only he did',
            'C' => 'It was easy',
            'D' => 'They didn\'t take it',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    9 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 10',
        'order' => 10,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He doesn’t need help',
            'B' => 'He wants help',
            'C' => 'He finished',
            'D' => 'He will help her',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    10 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 11',
        'order' => 11,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He should walk',
            'B' => 'He should wake up earlier',
            'C' => 'He should take a taxi',
            'D' => 'He should skip class',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    11 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 12',
        'order' => 12,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He wants both',
            'B' => 'He wants neither',
            'C' => 'He doesn’t care',
            'D' => 'He dislikes tea',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    12 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 13',
        'order' => 13,
        'question_type' => 'multiple_choice',
        'question' => 'How did the man feel?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Confident',
            'B' => 'Nervous',
            'C' => 'Angry',
            'D' => 'Bored',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    13 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 14',
        'order' => 14,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman imply?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The file is broken',
            'B' => 'The printer may need ink',
            'C' => 'The man forgot the file',
            'D' => 'The printer is turned off',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    14 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 15',
        'order' => 15,
        'question_type' => 'multiple_choice',
        'question' => 'What will they do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Wait',
            'B' => 'Go home',
            'C' => 'Try another place',
            'D' => 'Cook',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    15 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 16',
        'order' => 16,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She can pick him up',
            'B' => 'She will be busy',
            'C' => 'She will leave early',
            'D' => 'She forgot',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    16 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 17',
        'order' => 17,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man imply?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The storm is not serious',
            'B' => 'The school may close',
            'C' => 'He didn’t hear the news',
            'D' => 'He wants to go to school',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    17 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 18',
        'order' => 18,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Buy new keys',
            'B' => 'Be more organized',
            'C' => 'Call a locksmith',
            'D' => 'Check the car',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    18 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 19',
        'order' => 19,
        'question_type' => 'multiple_choice',
        'question' => 'What will the man probably do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Close it',
            'B' => 'Open it',
            'C' => 'Ignore her',
            'D' => 'Ask someone else',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    19 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 20',
        'order' => 20,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman offer?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'To send notes',
            'B' => 'To explain the topic',
            'C' => 'To talk to the teacher',
            'D' => 'To skip the lecture',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    20 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 21',
        'order' => 21,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Continue working',
            'B' => 'Take a rest',
            'C' => 'Drink coffee',
            'D' => 'Go home early',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    21 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 22',
        'order' => 22,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She lost it',
            'B' => 'He left it in his car',
            'C' => 'It is in the kitchen',
            'D' => 'She doesn’t know',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    22 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 23',
        'order' => 23,
        'question_type' => 'multiple_choice',
        'question' => 'What can be inferred?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The weather is warm',
            'B' => 'It is becoming cold',
            'C' => 'It is summertime',
            'D' => 'The man dislikes winter',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    23 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 24',
        'order' => 24,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She will help later',
            'B' => 'She doesn’t want to help',
            'C' => 'She finished the report',
            'D' => 'She needs his help',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    24 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 25',
        'order' => 25,
        'question_type' => 'multiple_choice',
        'question' => 'What will the man probably do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Ignore her',
            'B' => 'Open the jar',
            'C' => 'Buy a new jar',
            'D' => 'Call someone else',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    25 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 26',
        'order' => 26,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Leave the place',
            'B' => 'Wait in line',
            'C' => 'Come earlier next time',
            'D' => 'Skip the event',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    26 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 27',
        'order' => 27,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man mean?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She usually gets good scores',
            'B' => 'She never passes tests',
            'C' => 'He also failed',
            'D' => 'The test was easy',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    27 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 28',
        'order' => 28,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman suggest?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Buy a new computer',
            'B' => 'Restart the computer',
            'C' => 'Install updates',
            'D' => 'Call a technician',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    28 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 29',
        'order' => 29,
        'question_type' => 'multiple_choice',
        'question' => 'What does the man offer?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'To buy a new bag',
            'B' => 'To help carry the bag',
            'C' => 'To fix the bag',
            'D' => 'To leave the bag',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    29 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 30',
        'order' => 30,
        'question_type' => 'multiple_choice',
        'question' => 'What will they probably do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Walk',
            'B' => 'Take a taxi',
            'C' => 'Take the bus',
            'D' => 'Go home',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    30 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 31',
        'order' => 31,
        'question_type' => 'multiple_choice',
        'question' => 'What is the man planning to do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Drop the class immediately',
            'B' => 'Meet the professor for advice',
            'C' => 'Take another history course',
            'D' => 'Stop doing the readings',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    31 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 32',
        'order' => 32,
        'question_type' => 'multiple_choice',
        'question' => 'What does the woman plan to do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Join a fitness class',
            'B' => 'Visit the new gym',
            'C' => 'Buy new equipment',
            'D' => 'Renovate the old gym',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    32 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 33',
        'order' => 33,
        'question_type' => 'multiple_choice',
        'question' => 'What will the man probably take next semester?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Photography',
            'B' => 'History',
            'C' => 'Science',
            'D' => 'Music',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    33 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 34',
        'order' => 34,
        'question_type' => 'multiple_choice',
        'question' => 'What is the man’s problem?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'He lost his project',
            'B' => 'His group members are uncooperative',
            'C' => 'He doesn’t understand the assignment',
            'D' => 'The project is too easy',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    34 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 35',
        'order' => 35,
        'question_type' => 'multiple_choice',
        'question' => 'Why is the cafeteria crowded?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'There is free lunch',
            'B' => 'It is normally crowded',
            'C' => 'It is a holiday',
            'D' => 'It is the last day of school',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    35 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 36',
        'order' => 36,
        'question_type' => 'multiple_choice',
        'question' => 'What will the woman probably do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Repair her laptop',
            'B' => 'Go to the electronics store',
            'C' => 'Borrow a friend’s laptop',
            'D' => 'Delete old files',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    36 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 37',
        'order' => 37,
        'question_type' => 'multiple_choice',
        'question' => 'Why did the woman miss class?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'She overslept',
            'B' => 'She had a doctor’s appointment',
            'C' => 'She forgot the schedule',
            'D' => 'She had another class',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    37 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 38',
        'order' => 38,
        'question_type' => 'multiple_choice',
        'question' => 'What is the woman planning to do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Take a long trip',
            'B' => 'Visit her grandparents',
            'C' => 'Travel abroad',
            'D' => 'Skip the holiday',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    38 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 39',
        'order' => 39,
        'question_type' => 'multiple_choice',
        'question' => 'When is the library open on weekends?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => '7 a.m. – 10 p.m.',
            'B' => '8 a.m. – 10 p.m.',
            'C' => '9 a.m. – 6 p.m.',
            'D' => '10 a.m. – 5 p.m.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    39 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 40',
        'order' => 40,
        'question_type' => 'multiple_choice',
        'question' => 'Why is the train delayed?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Bad weather',
            'B' => 'Track maintenance',
            'C' => 'Passenger issues',
            'D' => 'A power failure',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    40 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 41',
        'order' => 41,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main topic of the talk?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Nutrition',
            'B' => 'Daily routines',
            'C' => 'Benefits of exercise',
            'D' => 'Stress management',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    41 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 42',
        'order' => 42,
        'question_type' => 'multiple_choice',
        'question' => 'What is the exhibit about?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Modern inventions',
            'B' => 'Ancient tools',
            'C' => 'Space exploration',
            'D' => 'Famous artists',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    42 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 43',
        'order' => 43,
        'question_type' => 'multiple_choice',
        'question' => 'When will the event take place?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Today',
            'B' => 'Tomorrow',
            'C' => 'Next week',
            'D' => 'This evening',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    43 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 44',
        'order' => 44,
        'question_type' => 'multiple_choice',
        'question' => 'What can students reserve?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Meeting halls',
            'B' => 'Computers',
            'C' => 'Study rooms',
            'D' => 'Classrooms',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    44 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 45',
        'order' => 45,
        'question_type' => 'multiple_choice',
        'question' => 'What is expected this afternoon?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Strong winds',
            'B' => 'Heavy rain',
            'C' => 'Clear skies',
            'D' => 'Snow',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    45 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 46',
        'order' => 46,
        'question_type' => 'multiple_choice',
        'question' => 'What will happen after the presentation?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'A written test',
            'B' => 'A campus tour',
            'C' => 'A group discussion',
            'D' => 'Lunch will be served',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    46 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 47',
        'order' => 47,
        'question_type' => 'multiple_choice',
        'question' => 'What will the group do after visiting downtown?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Go to the art museum',
            'B' => 'Return to the hotel',
            'C' => 'Have lunch at the riverfront',
            'D' => 'Visit another historic site',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    47 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 48',
        'order' => 48,
        'question_type' => 'multiple_choice',
        'question' => 'What will happen tomorrow morning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The dormitory will be closed',
            'B' => 'The elevators will be unavailable',
            'C' => 'New elevators will be installed',
            'D' => 'The power will be shut off',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    48 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 49',
        'order' => 49,
        'question_type' => 'multiple_choice',
        'question' => 'When is the pharmacy closed?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Sunday',
            'B' => 'Saturday',
            'C' => 'Weekdays',
            'D' => 'Every morning',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),

    49 =>
      array(
        'subtest' => 'listening',
        'passage' => 'listening:Listening Item 50',
        'order' => 50,
        'question_type' => 'multiple_choice',
        'question' => 'What is the discount for?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Online books only',
            'B' => 'All merchandise',
            'C' => 'Textbooks purchased in-store',
            'D' => 'Stationery items',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    50 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 1,
        'question_type' => 'multiple_choice',
        'question' => 'The teacher asked the students ___ their assignments by Friday.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'submit',
            'B' => 'submitted',
            'C' => 'to submit',
            'D' => 'submitting',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    51 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 2,
        'question_type' => 'multiple_choice',
        'question' => 'The new policy will take effect ___ January 1st.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'on',
            'B' => 'at',
            'C' => 'in',
            'D' => 'by',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    52 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 3,
        'question_type' => 'multiple_choice',
        'question' => 'Neither the manager nor the employees ___ satisfied with the current schedule.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'is',
            'B' => 'are',
            'C' => 'were',
            'D' => 'be',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    53 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 4,
        'question_type' => 'multiple_choice',
        'question' => 'The harder you study, ___ your grades will be.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'the best',
            'B' => 'better',
            'C' => 'the better',
            'D' => 'the best of',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    54 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 5,
        'question_type' => 'multiple_choice',
        'question' => 'She doesn’t enjoy the movie, and ___ does her brother.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'so',
            'B' => 'neither',
            'C' => 'either',
            'D' => 'too',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    55 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 6,
        'question_type' => 'multiple_choice',
        'question' => 'If I ___ enough money, I would buy a new laptop.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'have',
            'B' => 'had',
            'C' => 'will have',
            'D' => 'would have',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    56 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 7,
        'question_type' => 'multiple_choice',
        'question' => 'The book ___ on the table belongs to my sister.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'lying',
            'B' => 'lies',
            'C' => 'lay',
            'D' => 'lain',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    57 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 8,
        'question_type' => 'multiple_choice',
        'question' => 'The students were surprised because the test was ___ they expected.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'difficult than',
            'B' => 'more difficult than',
            'C' => 'most difficult',
            'D' => 'as difficult',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    58 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 9,
        'question_type' => 'multiple_choice',
        'question' => '___ the heavy rain, the match continued as planned.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Although',
            'B' => 'Despite',
            'C' => 'Because',
            'D' => 'Even',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    59 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 10,
        'question_type' => 'multiple_choice',
        'question' => 'Mr. David, ___ teaches math, is retiring next month.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'he',
            'B' => 'who',
            'C' => 'whose',
            'D' => 'whom',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    60 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 11,
        'question_type' => 'multiple_choice',
        'question' => 'The company plans to hire more workers once the project ___.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'completes',
            'B' => 'completed',
            'C' => 'has completed',
            'D' => 'is completed',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    61 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 12,
        'question_type' => 'multiple_choice',
        'question' => 'This restaurant is known ___ its delicious seafood.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'to',
            'B' => 'by',
            'C' => 'for',
            'D' => 'from',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    62 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 13,
        'question_type' => 'multiple_choice',
        'question' => 'I won’t go to the meeting unless he ___.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'comes',
            'B' => 'will come',
            'C' => 'come',
            'D' => 'coming',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    63 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 14,
        'question_type' => 'multiple_choice',
        'question' => 'The supervisor wants the report ___ before noon.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'finished',
            'B' => 'finish',
            'C' => 'finishing',
            'D' => 'to finish',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    64 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 15,
        'question_type' => 'multiple_choice',
        'question' => 'The scientist was unable to explain how the new species ___.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'evolve',
            'B' => 'evolved',
            'C' => 'evolving',
            'D' => 'evolution',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    65 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 16,
        'question_type' => 'written',
        'question' => 'The students was very excited about the field trip to the museum next week.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'was',
            'B' => 'about',
            'C' => 'to',
            'D' => 'next week',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    66 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 17,
        'question_type' => 'written',
        'question' => 'Each of the participants have submitted their registration form to the committee.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'have',
            'B' => 'their',
            'C' => 'form',
            'D' => 'to the committee',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    67 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 18,
        'question_type' => 'written',
        'question' => 'The conference starting tomorrow will feature speakers from various industry fields.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'starting',
            'B' => 'will feature',
            'C' => 'from',
            'D' => 'industry',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    68 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 19,
        'question_type' => 'written',
        'question' => 'The results of the experiment was surprising, showing significant improvement in the students’ performance.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'was',
            'B' => 'improvement',
            'C' => 'the',
            'D' => 'performance',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    69 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 20,
        'question_type' => 'written',
        'question' => 'The professor explained the concept clearly, but many students still found it confuse.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'clearly',
            'B' => 'still',
            'C' => 'it',
            'D' => 'confuse',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    70 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 21,
        'question_type' => 'written',
        'question' => 'The books on the table belongs to the new exchange student from Japan.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'belongs',
            'B' => 'exchange',
            'C' => 'student',
            'D' => 'from',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    71 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 22,
        'question_type' => 'written',
        'question' => 'The committee decide to postpone the event until further notice because of the weather.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'decide',
            'B' => 'until',
            'C' => 'notice',
            'D' => 'weather',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    72 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 23,
        'question_type' => 'written',
        'question' => 'The museum’s collection of ancient artifacts are considered among the most valuable in the country.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'are',
            'B' => 'the most valuable',
            'C' => 'country',
            'D' => 'collection',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    73 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 24,
        'question_type' => 'written',
        'question' => 'The scientific report requires precise data, so all measurements must be took carefully by the researchers.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'precise',
            'B' => 'must',
            'C' => 'took',
            'D' => 'by',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    74 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 25,
        'question_type' => 'written',
        'question' => 'The company is offering training sessions to employees who want to improve their skill in using the new software.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'who',
            'B' => 'improve',
            'C' => 'skill',
            'D' => 'software',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    75 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 26,
        'question_type' => 'written',
        'question' => 'The new regulations aims to reduce pollution by encouraging businesses to use cleaner technologies.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'aims',
            'B' => 'by',
            'C' => 'to',
            'D' => 'cleaner',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    76 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 27,
        'question_type' => 'written',
        'question' => 'The librarian suggested that students returned the borrowed books on time to avoid paying a fine.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'returned',
            'B' => 'on',
            'C' => 'paying',
            'D' => 'fine',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    77 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 28,
        'question_type' => 'written',
        'question' => 'Every year, thousands of tourists visits the national park to enjoy its natural beauty and wildlife habitats.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'visits',
            'B' => 'to enjoy',
            'C' => 'and',
            'D' => 'habitats',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    78 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 29,
        'question_type' => 'written',
        'question' => 'The meeting was canceled due the manager’s unexpected absence, which affected the schedule for the whole week.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'due',
            'B' => 'absence',
            'C' => 'the',
            'D' => 'the whole',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    79 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 30,
        'question_type' => 'written',
        'question' => 'The students were instructed to complete the assignment careful, paying attention to details throughout the process.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'to complete',
            'B' => 'careful',
            'C' => 'to',
            'D' => 'throughout',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    80 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 31,
        'question_type' => 'written',
        'question' => 'The new student was unfamiliar with the school, so a guide was assigned to help her find her classes.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'with',
            'B' => 'so',
            'C' => 'to help',
            'D' => 'find',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    81 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 32,
        'question_type' => 'written',
        'question' => 'Neither of the solutions were effective enough to solve the problem that had been reported.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'were',
            'B' => 'to solve',
            'C' => 'that',
            'D' => 'reported',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    82 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 33,
        'question_type' => 'written',
        'question' => 'Scientists have discovered a new species of insect that live exclusively in tropical forests.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'a new',
            'B' => 'that live',
            'C' => 'in',
            'D' => 'forests',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    83 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 34,
        'question_type' => 'written',
        'question' => 'The invitation sent to all employees include details about the event and the dress code.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'sent',
            'B' => 'include',
            'C' => 'and',
            'D' => 'code',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    84 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 35,
        'question_type' => 'written',
        'question' => 'Students are encouraged to participate in extracurricular activities that help develop their creativity and lead skills.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'to participate',
            'B' => 'that',
            'C' => 'creativity',
            'D' => 'lead',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    85 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 36,
        'question_type' => 'written',
        'question' => 'Researchers found that the new method was more effective then the traditional one in improving students’ motivation.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'more',
            'B' => 'then',
            'C' => 'in improving',
            'D' => 'motivation',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    86 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 37,
        'question_type' => 'written',
        'question' => 'The final exam, as well as the midterm tests, were scheduled by the academic department earlier this year.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'were',
            'B' => 'department',
            'C' => 'earlier',
            'D' => 'year',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    87 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 38,
        'question_type' => 'written',
        'question' => 'Many citizens believe that the government should increase funding for public transportation because it helps reduce traffic and environmental polluted.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'increase',
            'B' => 'because',
            'C' => 'and',
            'D' => 'polluted',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    88 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 39,
        'question_type' => 'written',
        'question' => 'The instructions for the new device was too complicated, causing many users to feel frustrated and confused.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'was',
            'B' => 'to feel',
            'C' => 'and',
            'D' => 'confused',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    89 =>
      array(
        'subtest' => 'structure',
        'passage' => NULL,
        'order' => 40,
        'question_type' => 'written',
        'question' => 'The workshop required participants to submit their projects by email before the deadline arrive.',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'to submit',
            'B' => 'by',
            'C' => 'before',
            'D' => 'arrive',
          ),
        'correct_answer' => 'D',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    90 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 1,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main idea of the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Smartphones have made people more productive.',
            'B' => 'Smartphones have changed communication habits in both positive and negative ways.',
            'C' => 'Young people prefer face-to-face communication.',
            'D' => 'Psychologists recommend avoiding smartphones completely.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    91 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 2,
        'question_type' => 'multiple_choice',
        'question' => 'According to the passage, how has communication changed over time?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'People communicate less frequently than before.',
            'B' => 'Face-to-face interaction has been replaced by digital messaging.',
            'C' => 'Messages are now longer and more expressive.',
            'D' => 'Technology has eliminated social communication.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    92 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 3,
        'question_type' => 'multiple_choice',
        'question' => 'What do researchers argue about excessive digital communication?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'It improves emotional intelligence.',
            'B' => 'It reduces the quality of interpersonal relationships.',
            'C' => 'It increases confidence in social situations.',
            'D' => 'It prevents social isolation.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    93 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 4,
        'question_type' => 'multiple_choice',
        'question' => 'What is one negative effect mentioned in paragraph two?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'It helps young people develop eye contact skills.',
            'B' => 'It leads to stronger family connections.',
            'C' => 'It may weaken real-life social skills.',
            'D' => 'It improves the ability to communicate emotions.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    94 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 5,
        'question_type' => 'multiple_choice',
        'question' => 'Why might digital conversations be considered “shallow”?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They are slow and require deep thinking.',
            'B' => 'They are shorter and less expressive.',
            'C' => 'They involve too many people.',
            'D' => 'They require strong emotional vocabulary.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    95 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 6,
        'question_type' => 'multiple_choice',
        'question' => 'According to the passage, what is one positive effect of smartphones?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They guarantee meaningful relationships.',
            'B' => 'They help people connect over long distances.',
            'C' => 'They prevent social anxiety.',
            'D' => 'They replace education tools.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    96 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 7,
        'question_type' => 'multiple_choice',
        'question' => 'Who benefits most from digital communication according to the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Individuals with social anxiety.',
            'B' => 'People who prefer face-to-face interaction.',
            'C' => 'Everyone equally.',
            'D' => 'Only teenagers.',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    97 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 8,
        'question_type' => 'multiple_choice',
        'question' => 'What does the author suggest determines the impact of smartphones?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The type of smartphone used.',
            'B' => 'The user’s age.',
            'C' => 'The way the device is used.',
            'D' => 'The number of apps installed.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    98 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 9,
        'question_type' => 'multiple_choice',
        'question' => 'The word “shallow” in paragraph two is closest in meaning to…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'boring',
            'B' => 'less meaningful',
            'C' => 'difficult',
            'D' => 'emotional',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    99 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 1',
        'order' => 10,
        'question_type' => 'multiple_choice',
        'question' => 'What is the author’s tone toward smartphone use?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Completely negative',
            'B' => 'Neutral and balanced',
            'C' => 'Extremely positive',
            'D' => 'Uncertain',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    100 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 11,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main idea of the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Climate change affects agriculture but new technologies offer solutions.',
            'B' => 'Farmers have successfully adapted to climate change.',
            'C' => 'Climate change only affects developing countries.',
            'D' => 'Food security is no longer an issue.',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    101 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 12,
        'question_type' => 'multiple_choice',
        'question' => 'Which of the following crops is mentioned as vulnerable to climate change?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Potatoes',
            'B' => 'Corn',
            'C' => 'Soybeans',
            'D' => 'Coffee',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    102 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 13,
        'question_type' => 'multiple_choice',
        'question' => 'Why are farmers in developing countries more affected?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They refuse to use modern tools.',
            'B' => 'They lack access to advanced farming technologies.',
            'C' => 'Their soil quality is poor.',
            'D' => 'They focus only on rice production.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    103 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 14,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main concern caused by reduced crop productivity?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Increased food exports',
            'B' => 'Food security',
            'C' => 'Better weather prediction',
            'D' => 'Higher employment rates',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    104 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 15,
        'question_type' => 'multiple_choice',
        'question' => 'What does the passage suggest about climate-resilient crops?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They completely eliminate farming risks.',
            'B' => 'They do not help in extreme conditions.',
            'C' => 'They are designed to survive harsh climates.',
            'D' => 'They reduce the need for farmers.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    105 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 16,
        'question_type' => 'multiple_choice',
        'question' => 'Which technology is mentioned as part of digital agriculture?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Solar-powered tractors',
            'B' => 'Robot-based fertilizer systems',
            'C' => 'Satellite monitoring and weather apps',
            'D' => 'Underground water tunnels',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    106 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 17,
        'question_type' => 'multiple_choice',
        'question' => 'What is a disadvantage faced by developing countries?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Lack of suitable farmland',
            'B' => 'Limited access to new seed varieties',
            'C' => 'Too many large companies compete with small farmers',
            'D' => 'Overproduction of crops',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    107 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 18,
        'question_type' => 'multiple_choice',
        'question' => 'The word “promising” in paragraph three is closest in meaning to…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'uncertain',
            'B' => 'hopeful',
            'C' => 'small',
            'D' => 'dangerous',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    108 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 19,
        'question_type' => 'multiple_choice',
        'question' => 'What is the purpose of digital agriculture technologies?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'To replace farmers entirely',
            'B' => 'To help farmers work more efficiently',
            'C' => 'To stop rainfall patterns from changing',
            'D' => 'To make farming more expensive',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    109 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 2',
        'order' => 20,
        'question_type' => 'multiple_choice',
        'question' => 'What is the author’s attitude toward technological solutions?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Completely pessimistic',
            'B' => 'Neutral but doubtful',
            'C' => 'Positive but realistic',
            'D' => 'Negative and critical',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    110 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 21,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main idea of the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Sleep is important for students’ learning and memory.',
            'B' => 'Technology improves sleep quality for students.',
            'C' => 'Students do not need much sleep to study effectively.',
            'D' => 'Physical exercise is more important than sleep.',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    111 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 22,
        'question_type' => 'multiple_choice',
        'question' => 'What happens when students do not get enough sleep?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Their memory improves significantly.',
            'B' => 'They become more active and creative.',
            'C' => 'They struggle to focus and remember information.',
            'D' => 'They perform better in school.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    112 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 23,
        'question_type' => 'multiple_choice',
        'question' => 'What role does sleep play in learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'It erases unnecessary information.',
            'B' => 'It helps consolidate new memories.',
            'C' => 'It increases competition among students.',
            'D' => 'It makes studying unnecessary.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    113 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 24,
        'question_type' => 'multiple_choice',
        'question' => 'What is one effect of incomplete sleep cycles?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Increased creativity',
            'B' => 'Improved problem-solving',
            'C' => 'Weaker academic performance',
            'D' => 'Better concentration',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    114 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 25,
        'question_type' => 'multiple_choice',
        'question' => 'What suggestion is given to improve students’ sleep habits?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Play games before bed',
            'B' => 'Increase screen time',
            'C' => 'Set earlier bedtimes',
            'D' => 'Study until midnight',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    115 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 26,
        'question_type' => 'multiple_choice',
        'question' => 'What does the word “consolidate” mean in the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'combine and strengthen',
            'B' => 'delete',
            'C' => 'ignore',
            'D' => 'divide',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    116 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 27,
        'question_type' => 'multiple_choice',
        'question' => 'Which of the following is mentioned as a cause of students staying up late?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Reading books',
            'B' => 'Physical activities',
            'C' => 'Electronic devices',
            'D' => 'Healthy habits',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    117 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 28,
        'question_type' => 'multiple_choice',
        'question' => 'According to the passage, students who sleep poorly might experience…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'faster learning',
            'B' => 'reduced creativity',
            'C' => 'improved vocabulary',
            'D' => 'better exam results',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    118 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 29,
        'question_type' => 'multiple_choice',
        'question' => 'What does the author suggest schools and parents should do?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Encourage students to finish homework late at night',
            'B' => 'Promote healthier sleep routines',
            'C' => 'Allow unlimited screen time',
            'D' => 'Reduce school hours',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    119 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 3',
        'order' => 30,
        'question_type' => 'multiple_choice',
        'question' => 'The author’s tone in this passage is…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'critical and negative',
            'B' => 'informative and encouraging',
            'C' => 'doubtful and uncertain',
            'D' => 'humorous',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    120 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 31,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main idea of the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Ancient transportation methods influenced trade and cultural exchange.',
            'B' => 'Modern transportation is more efficient than ancient systems.',
            'C' => 'The Romans invented all types of transportation.',
            'D' => 'Trade routes were only used in Europe.',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    121 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 32,
        'question_type' => 'multiple_choice',
        'question' => 'What was one of the earliest transportation systems mentioned?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Viking longships',
            'B' => 'Roman stone roads',
            'C' => 'Trade routes used by Mesopotamians and Egyptians',
            'D' => 'The Grand Canal in China',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    122 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 33,
        'question_type' => 'multiple_choice',
        'question' => 'What animals were commonly used for transportation in ancient times?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Horses and oxen',
            'B' => 'Donkeys and camels',
            'C' => 'Elephants and goats',
            'D' => 'Sheep and buffalo',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    123 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 34,
        'question_type' => 'multiple_choice',
        'question' => 'What was a major contribution of Roman roads?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They allowed boats to travel faster.',
            'B' => 'They improved trade, communication, and military movement.',
            'C' => 'They were used only for transporting grain.',
            'D' => 'They existed only in northern Europe.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    124 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 35,
        'question_type' => 'multiple_choice',
        'question' => 'The phrase “All roads lead to Rome” suggests that…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Rome was the only city in the empire.',
            'B' => 'All Romans traveled by foot.',
            'C' => 'Roman roads connected many regions to Rome.',
            'D' => 'Roads were built only inside Rome.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    125 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 36,
        'question_type' => 'multiple_choice',
        'question' => 'What major water transportation system was used in ancient China?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The Nile River',
            'B' => 'The Amazon River',
            'C' => 'The Grand Canal',
            'D' => 'The Black Sea',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    126 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 37,
        'question_type' => 'multiple_choice',
        'question' => 'The Grand Canal helped unify northern and southern China by…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'transporting military weapons',
            'B' => 'enabling large-scale communication',
            'C' => 'supporting transport of goods like rice and salt',
            'D' => 'dividing major regions into smaller provinces',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    127 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 38,
        'question_type' => 'multiple_choice',
        'question' => 'Why were Viking longships effective?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They were slow but sturdy.',
            'B' => 'They were fast and suitable for rivers and seas.',
            'C' => 'They carried heavy livestock.',
            'D' => 'They were only used for fishing.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    128 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 39,
        'question_type' => 'multiple_choice',
        'question' => 'What does the word “innovations” in paragraph three refer to?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'natural disasters',
            'B' => 'ancient buildings',
            'C' => 'new transportation methods',
            'D' => 'old traditions',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    129 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 4',
        'order' => 40,
        'question_type' => 'multiple_choice',
        'question' => 'According to the passage, early transportation systems were important because they…',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'helped develop modern airplanes',
            'B' => 'shaped societies and encouraged cultural exchange',
            'C' => 'prevented wars',
            'D' => 'discouraged trade between regions',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    130 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 41,
        'question_type' => 'multiple_choice',
        'question' => 'What is the main idea of the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Online learning is the best method of education.',
            'B' => 'Online learning has advantages and challenges, making its effectiveness debatable.',
            'C' => 'Students prefer face-to-face classes over online learning.',
            'D' => 'Online learning has no benefits compared to traditional learning.',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    131 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 42,
        'question_type' => 'multiple_choice',
        'question' => 'What has contributed to the rise of online learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Decreased interest in traditional schools',
            'B' => 'Improvements in transportation',
            'C' => 'The growth of digital platforms',
            'D' => 'Lack of teachers',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    132 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 43,
        'question_type' => 'multiple_choice',
        'question' => 'Why did online learning become more significant during certain periods?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Schools wanted to reduce costs.',
            'B' => 'Students demanded more flexible schedules.',
            'C' => 'Global health crises forced schools to shift to remote learning.',
            'D' => 'Governments required all learning to be online.',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    133 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 44,
        'question_type' => 'multiple_choice',
        'question' => 'What is one advantage of online learning mentioned in the passage?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Students must follow the same pace',
            'B' => 'It provides individualized instruction',
            'C' => 'It eliminates the need for teachers',
            'D' => 'It guarantees better learning outcomes',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    134 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 45,
        'question_type' => 'multiple_choice',
        'question' => 'Which type of student benefits from online discussions?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Students who are very outgoing',
            'B' => 'Students who dislike technology',
            'C' => 'Students who feel shy in traditional classrooms',
            'D' => 'Students who prefer working in groups',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    135 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 46,
        'question_type' => 'multiple_choice',
        'question' => 'What challenge do some students face in online learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Too much teacher supervision',
            'B' => 'Lack of self-discipline and motivation',
            'C' => 'Too many hands-on activities',
            'D' => 'Excessive group work',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    136 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 47,
        'question_type' => 'multiple_choice',
        'question' => 'What factor affects the effectiveness of online learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'The teacher’s age',
            'B' => 'The student\'s family background',
            'C' => 'Technology availability and internet stability',
            'D' => 'The number of assignments given',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    137 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 48,
        'question_type' => 'multiple_choice',
        'question' => 'Why are some subjects harder to teach online?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'They require physical practice or hands-on activities',
            'B' => 'They are too easy',
            'C' => 'They do not require explanation',
            'D' => 'Students prefer not to learn them',
          ),
        'correct_answer' => 'A',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    138 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 49,
        'question_type' => 'multiple_choice',
        'question' => 'What is blended learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'Learning that only uses textbooks',
            'B' => 'A combination of online and traditional classroom methods',
            'C' => 'Learning that removes all teacher interaction',
            'D' => 'Online games used in schools',
          ),
        'correct_answer' => 'B',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    139 =>
      array(
        'subtest' => 'reading',
        'passage' => 'reading:Reading Passage 5',
        'order' => 50,
        'question_type' => 'multiple_choice',
        'question' => 'What is the author’s final opinion about online learning?',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => 'It should replace classroom learning completely',
            'B' => 'It is ineffective for all subjects',
            'C' => 'It works best when combined with traditional learning',
            'D' => 'It should be avoided by schools',
          ),
        'correct_answer' => 'C',
        'keywords' => NULL,
        'min_words' => NULL,
        'point' => 1,
      ),
    140 =>
      array(
        'subtest' => 'essay',
        'passage' => NULL,
        'order' => 1,
        'question_type' => 'essay',
        'question' => 'What is a smartphone and what are its main functions? Explain briefly!',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => NULL,
            'B' => NULL,
            'C' => NULL,
            'D' => NULL,
          ),
        'correct_answer' => NULL,
        'keywords' => 'A smartphone is a mobile device that combines the functions of a phone and a computer. Its main functions include making calls, sending messages, browsing the internet, taking photos, and using various applications for daily needs.',
        'min_words' => 120,
        'point' => 100,
      ),
    141 =>
      array(
        'subtest' => 'essay',
        'passage' => NULL,
        'order' => 2,
        'question_type' => 'essay',
        'question' => 'Why is it important to eat healthy food every day? Give your explanation!',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => NULL,
            'B' => NULL,
            'C' => NULL,
            'D' => NULL,
          ),
        'correct_answer' => NULL,
        'keywords' => 'Eating healthy food every day is important because it provides essential nutrients that the body needs to function properly. It helps maintain energy, strengthens the immune system, prevents diseases, and supports physical and mental growth.',
        'min_words' => NULL,
        'point' => 1,
      ),
    142 =>
      array(
        'subtest' => 'essay',
        'passage' => NULL,
        'order' => 3,
        'question_type' => 'essay',
        'question' => 'What is air pollution and what causes it? Explain briefly!',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => NULL,
            'B' => NULL,
            'C' => NULL,
            'D' => NULL,
          ),
        'correct_answer' => NULL,
        'keywords' => 'Air pollution is the presence of harmful substances in the atmosphere that damage the environment and human health. It is mainly caused by vehicle emissions, factory smoke, burning of waste, and the use of chemical products in daily activities.',
        'min_words' => NULL,
        'point' => 1,
      ),
    143 =>
      array(
        'subtest' => 'essay',
        'passage' => NULL,
        'order' => 4,
        'question_type' => 'essay',
        'question' => '"Why is studying English important for students in vocational high school? Explain your answer!"',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => NULL,
            'B' => NULL,
            'C' => NULL,
            'D' => NULL,
          ),
        'correct_answer' => NULL,
        'keywords' => 'Studying English is important for vocational high school students because it prepares them for the global workforce. English helps them communicate with foreign clients, understand technical instructions, access international information, and improve their career opportunities in industry.',
        'min_words' => NULL,
        'point' => 1,
      ),
    144 =>
      array(
        'subtest' => 'essay',
        'passage' => NULL,
        'order' => 5,
        'question_type' => 'essay',
        'question' => '"What is teamwork and why is it needed in the workplace? Give your explanation!"',
        'question_audio_url' => NULL,
        'choices' =>
          array(
            'A' => NULL,
            'B' => NULL,
            'C' => NULL,
            'D' => NULL,
          ),
        'correct_answer' => NULL,
        'keywords' => 'Teamwork is the ability of a group of people to work together to achieve a common goal. It is needed in the workplace because it increases productivity, improves problem solving, builds good communication among colleagues, and creates a positive work environment.',
        'min_words' => NULL,
        'point' => 1,
      ),
  );
}
