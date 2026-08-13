<?php

namespace Database\Seeders;

use App\Models\EssayAnswer;
use App\Models\Questions;
use App\Models\Subtest;
use App\Models\TestAttempt;
use App\Models\TestScore;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class EssayAssessmentScoreSeeder extends Seeder
{
    private const TOEFL_CODE = 'tep';

    public function run(): void
    {
        $toefl = Toefl::where('code', self::TOEFL_CODE)->firstOrFail();

        $subtestIds = Subtest::whereIn('name', ['listening', 'structure', 'reading', 'essay'])
            ->pluck('id', 'name');

        $essayQuestions = $this->essayQuestions($toefl, $subtestIds['essay']);

        foreach ($this->scores() as $row) {
            $userNumber = $this->userNumber($row['user']);

            $user = User::firstOrCreate(
                ['name' => $row['user']],
                [
                    'email' => strtolower(str_replace(' ', '', $row['user'])) . '@essay-assessment.test',
                    'email_verified_at' => $this->timestampFor($userNumber, 0),
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'created_at' => $this->timestampFor($userNumber, 1),
                    'updated_at' => $this->timestampFor($userNumber, 2),
                ],
            );
            $user->forceFill([
                'email_verified_at' => $this->timestampFor($userNumber, 0),
                'created_at' => $this->timestampFor($userNumber, 1),
                'updated_at' => $this->timestampFor($userNumber, 2),
            ])->saveQuietly();

            $attempt = TestAttempt::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'toefl_id' => $toefl->id,
                ],
                [
                    'started_at' => $this->timestampFor($userNumber, 3),
                    'finished_at' => $this->timestampFor($userNumber, 4),
                    'created_at' => $this->timestampFor($userNumber, 5),
                    'updated_at' => $this->timestampFor($userNumber, 6),
                ],
            );
            $attempt->forceFill([
                'started_at' => $this->timestampFor($userNumber, 3),
                'finished_at' => $this->timestampFor($userNumber, 4),
                'created_at' => $this->timestampFor($userNumber, 5),
                'updated_at' => $this->timestampFor($userNumber, 6),
            ])->saveQuietly();

            foreach (['listening', 'structure', 'reading'] as $sectionIndex => $section) {
                $score = TestScore::updateOrCreate(
                    [
                        'test_attempt_id' => $attempt->id,
                        'subtest_id' => $subtestIds[$section],
                    ],
                    [
                        'raw_score' => $row[$section][0],
                        'scaled_score' => $row[$section][1],
                        'created_at' => $this->timestampFor($userNumber, 7 + ($sectionIndex * 2)),
                        'updated_at' => $this->timestampFor($userNumber, 8 + ($sectionIndex * 2)),
                    ],
                );
                $score->forceFill([
                    'created_at' => $this->timestampFor($userNumber, 7 + ($sectionIndex * 2)),
                    'updated_at' => $this->timestampFor($userNumber, 8 + ($sectionIndex * 2)),
                ])->saveQuietly();
            }

            $essayScore = TestScore::updateOrCreate(
                [
                    'test_attempt_id' => $attempt->id,
                    'subtest_id' => $subtestIds['essay'],
                ],
                [
                    'raw_score' => $row['essay'],
                    'scaled_score' => null,
                    'created_at' => $this->timestampFor($userNumber, 13),
                    'updated_at' => $this->timestampFor($userNumber, 14),
                ],
            );
            $essayScore->forceFill([
                'created_at' => $this->timestampFor($userNumber, 13),
                'updated_at' => $this->timestampFor($userNumber, 14),
            ])->saveQuietly();

            $this->seedEssayAnswers($attempt, $essayQuestions, $row, $userNumber);
        }
    }

    private function essayQuestions(Toefl $toefl, int $essaySubtestId)
    {
        $essayToeflSubtest = ToeflSubtest::where('toefl_id', $toefl->id)
            ->where('subtest_id', $essaySubtestId)
            ->firstOrFail();

        $questions = Questions::where('toefl_subtest_id', $essayToeflSubtest->id)
            ->whereIn('question_type', ['essay', 'written'])
            ->orderBy('order')
            ->limit(5)
            ->get();

        if ($questions->count() < 5) {
            throw new \RuntimeException("TEP essay subtest needs 5 essay questions, found {$questions->count()}.");
        }

        return $questions;
    }

    private function seedEssayAnswers(TestAttempt $attempt, $essayQuestions, array $row, int $userNumber): void
    {
        EssayAnswer::withoutEvents(function () use ($attempt, $essayQuestions, $row, $userNumber) {
            foreach ($essayQuestions->values() as $index => $question) {
                $answerText = $this->essayAnswerText($row['user'], $index + 1);
                $slot = 15 + ($index * 3);

                $essayAnswer = EssayAnswer::updateOrCreate(
                    [
                        'test_attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'answer_text' => $answerText,
                        'word_count' => str_word_count($answerText),
                        'content_cosine' => round($row['essay'] / 100, 4),
                        'content_scale' => $this->contentScale($row['essay']),
                        'content_category' => $this->scaleCategory($this->contentScale($row['essay'])),
                        'grammar_score' => $this->grammarScale($row['essay']),
                        'grammar_error_count' => $this->grammarErrorCount($row['essay']),
                        'grammar_error_ratio' => round($this->grammarErrorCount($row['essay']) / 20, 4),
                        'grammar_category' => $this->scaleCategory($this->grammarScale($row['essay'])),
                        'similarity_score' => $row['essay'],
                        'final_score' => $row['essay'],
                        'aes_status' => 'completed',
                        'kategori' => $this->kategori($row['essay']),
                        'scored_at' => $this->timestampFor($userNumber, $slot),
                        'aes_error_message' => null,
                        'created_at' => $this->timestampFor($userNumber, $slot + 1),
                        'updated_at' => $this->timestampFor($userNumber, $slot + 2),
                    ],
                );
                $essayAnswer->forceFill([
                    'scored_at' => $this->timestampFor($userNumber, $slot),
                    'created_at' => $this->timestampFor($userNumber, $slot + 1),
                    'updated_at' => $this->timestampFor($userNumber, $slot + 2),
                ])->saveQuietly();
            }
        });
    }

    private function timestampFor(int $userNumber, int $slot): Carbon
    {
        $sequence = (($userNumber - 1) * 30) + $slot;
        $secondsOffset = ($sequence * 137) % 3600;

        return now('Asia/Jakarta')
            ->startOfDay()
            ->setTime(8, 0)
            ->addSeconds($secondsOffset);
    }

    private function userNumber(string $user): int
    {
        return (int) str_replace('User ', '', $user);
    }

    private function essayAnswerText(string $user, int $questionNumber): string
    {
        return $this->essayAnswers()[$user][$questionNumber - 1];
    }

    private function essayAnswers(): array
    {
        return [
            'User 1' => [
                'a gadget we use everyday for chatting social media browsing internet taking photos and playing games whenever we get bored at school or work',
                'coz healthy food gives energy to do activities keeps body fit avoids getting sick easily and helps mind stay focused during class or work',
                'air pollution is harmful dirty air caused by vehicle fumes factory smoke forest fires and burning trash everywhere making people sick',
                'learning english is key for vocational school students so they can read technical manuals work in big companies and communicate with abroad clients',
                'teamwork is doing work together with teammates needed at work to make difficult project easier share creative ideas and meet tight deadlines',
            ],
            'User 2' => [
                'its handy device for internet surfing calling friends social media streaming music playing games and scanning barcode payments',
                'coz healthy meals give u solid energy keep sickness away make u feel light and active through whole busy work day',
                'air pollution is dirty contaminated air caused by car smoke motor exhaust factories and open burning of rubbish everywhere',
                'coz english helps smk students read tool manuals pass foreign job interview and get good job opportunity in global market',
                'teamwork is working together as team needed at work coz it makes heavy work light speeds up deadline and creates good teamwork',
            ],
            'User 3' => [
                'its mobile phone with internet main functions are social media video call playing online game and searching info fast',
                'healthy food gives body vital nutrients energy for tasks keeps illness away and makes u stay fit and healthy always',
                'air pollution is bad air caused by exhaust smoke from cars motorcycles industrial factories and people burning trash recklessly',
                'english is necessary for smk students to understand machine manual operate computer software and communicate with foreign clients easily',
                'teamwork is working with coworkers together needed at workplace to finish job quickly share ideas and lighten personal workload',
            ],
            'User 4' => [
                'its a digital device for communication main functions include texting calling browsing internet using apps for study and playing games',
                'because healthy food gives vitamins minerals energy prevents diseases and keeps body healthy and active all day',
                'air pollution is bad dirty air caused by vehicle fumes industrial plant smoke forest fires and burning open trash',
                'english helps vocational students understand technical terms read operation manual and apply for jobs in global multinational companies',
                'teamwork is collaborating with office colleagues needed to finish project faster share creative ideas and reduce work burden on individuals',
            ],
            'User 5' => [
                'Smartphone is essential daily device for calling texting browsing social media taking pics and using useful utility apps',
                'Eating healthy food daily ensures physical fitness mental clarity strong immune system and prevention against deadly lifestyle diseases',
                'Air pollution is atmosphere contamination caused by harmful gases from vehicle emissions industrial factories and burning waste materials',
                'English language skills enable vocational students to read complex technical manuals communicate with international clients and advance professional career',
                'Teamwork is structured collaboration among workforce required to achieve organizational goals foster workplace innovation and manage heavy workloads efficiently',
            ],
            'User 6' => [
                'Smartphone is handheld device integrated with internet access primary function is sending text making call camera streaming and running useful apps',
                'Eating healthy food provides vitamins minerals energy required for optimal body performance prevents chronic diseases and boosts overall wellbeing',
                'Air pollution refers to hazardous chemicals or gases in atmosphere primary causes include vehicle exhaust smoke industrial plants and trash burning',
                'English is important for vocational students to master technical terms read equipment guidelines communicate professionally and access international employment opportunities',
                'Teamwork refers to collective effort of team members needed in workplace to optimize productivity combine different skills and achieve targets efficiently',
            ],
            'User 7' => [
                'its a portable phone with internet capability function for chatting watching videos playing mobile games and work tasks fast n easy',
                'healthy eating gives u natural energy keeps body healthy avoids disease and helps brain work better for daily tasks and study',
                'dirty polluted air caused by heavy traffic exhaust factory smoke garbage burning and forest fires very bad for health',
                'english helps vocational grads to read tool manuals apply for multinational jobs and talk with overseas boss or customer easily',
                'teamwork is working together with office friends needed to complete big task quickly share good ideas and reduce personal work stress',
            ],
            'User 8' => [
                'Smartphone is modern hand held device meant for calling texting camera usage internet browsing and social media networking',
                'Eating healthy food is important to maintain strong immune system keep stamina up prevent diseases and support daily body functioning',
                'Air pollution is contamination of natural air quality caused by motor vehicle fumes factory smoke and burning fossil fuels or trash',
                'Studying English helps vocational students master industrial technology terminology read operation manuals and qualify for international job offers',
                'Teamwork is process of working collaboratively with group needed in workplace to enhance output solve operational issues and achieve team success',
            ],
            'User 9' => [
                'smartphone is handy phone with internet functions like calling texting social media online banking and taking pictures for memories',
                'healthy food is essential because it gives energy keeps immune strong prevents illness and helps us stay active throughout busy day',
                'air pollution is condition where air is contaminated caused by motor vehicle emissions factory fumes and open waste burning',
                'english is needed for vocational students to understand modern technical manuals job recruitment process and international workplace environment',
                'teamwork is working in group to finish job required in office to reduce stress share workload and achieve company target successfully',
            ],
            'User 10' => [
                'a small touchscreen device used for communication via apps internet browsing taking photos playing games and online learning',
                'because eating clean food provides proper nutrients boosts immune system keeps energy high and prevents getting sick easily',
                'air pollution means toxic dirty air caused by vehicle smoke factory emissions power plants and burning waste in open environment',
                'because vocational students require english to comprehend technical manuals communicate in workplace and get better employment opportunities after graduation',
                'teamwork means collaborating effectively with team members needed in workplace to achieve common goals increase productivity and share responsibilities evenly',
            ],
            'User 11' => [
                'smartphone is small gadget with web access mainly used to text call friends work online play games and browse stuff',
                'healthy eating gives u good energy keeps body fit prevents sickness like flu and keeps mind sharp for school or work',
                'dirty air full of toxic dust caused by vehicle smoke factories and burning trash that causes coughing and breathing issue',
                'english is key for smk kids to read technical manuals work in big foreign company and communicate with foreign engineers easily',
                'teamwork is working together with team members needed so heavy job becomes lighter problems get solved fast and work results get better',
            ],
            'User 12' => [
                'Smartphone is a multi functional mobile device main function to stay connected with people browsing social media and doing work on the go',
                'Eating healthy food gives proper nutrition to our body boosts immunity improves mental focus and prevents chronic illness in long run',
                'Air pollution is presence of harmful substances in air caused by vehicle exhaust industrial emissions factory smoke and burning fossil fuels',
                'Studying English is important for vocational students because technical terms instruction manuals and global workplace communication require fluent English skills',
                'Teamwork is collaborative effort of group to achieve shared goal needed in workplace to increase efficiency foster innovation and divide workload evenly',
            ],
            'User 13' => [
                'IT IS A PORTABLE ELECTRONIC DEVICE USED TO COMMUNICATE VIA CALLS OR MESSAGES AND ACCESS INTERNET APPLICATIONS FOR DAILY PRODUCTIVITY OR ENTERTAINMENT',
                'HEALTHY FOOD IS CRUCIAL TO MAINTAIN GOOD HEALTH BOOST IMMUNITY PROVIDE DAILY ENERGY AND PREVENT DANGEROUS ILLNESSES LIKE HEART DISEASE OR DIABETES',
                'AIR POLLUTION IS CONTAMINATION OF AIR BY HARMFUL CHEMICALS OR PARTICLES CAUSED BY VEHICLE SMOKE FACTORY EMISSIONS AND INDUSTRIAL WASTES',
                'ENGLISH IS ESSENTIAL FOR VOCATIONAL STUDENTS TO UNDERSTAND GLOBAL INDUSTRY MANUALS COMMUNICATE WITH FOREIGN CLIENTS AND FIND BETTER JOBS EASILY',
                'TEAMWORK IS COLLABORATIVE WORK AMONG EMPLOYEES NEEDED TO INCREASE WORK PRODUCTIVITY SOLVE PROBLEMS EFFICIENTLY AND ACHIEVE COMPANY GOALS TOGETHER',
            ],
            'User 14' => [
                'SMARTPHONE IS ELECTRONIC DEVICE DRIVEN BY OPERATING SYSTEM MAIN FUNCTIONS ARE VOICE CALL SOCIAL MEDIA INTERNET SEARCH AND ENTERTAINMENT CONTENT',
                'HEALTHY NUTRITION IS ESSENTIAL FOR BODY DEVELOPMENT PROVIDING ENERGY STRENGTHENING IMMUNITIES AND PREVENTING CHRONIC DISEASES IN FUTURE',
                'AIR POLLUTION IS POLLUTION OF AIR QUALITY CAUSED BY EXHAUST EMISSIONS FROM TRANSPORTATION INDUSTRIAL FACTORIES AND GARBAGE BURNING ACTIVITIES',
                'STUDYING ENGLISH EMPOWERS VOCATIONAL STUDENTS TO COMPREHEND TECHNICAL MANUALS ENTER GLOBAL WORKPLACE AND COMMUNICATE EFFECTIVELY WITH FOREIGN CUSTOMERS',
                'TEAMWORK IS COLLABORATIVE EFFORT TO REACH COMMON GOAL NEEDED IN WORKPLACE TO ENHANCE PRODUCTIVITY FOSTER INNOVATION AND SHARE WORK RESPONSIBILITY',
            ],
            'User 15' => [
                'a smart device used to make call send chat browse internet watch video work on document and play games on the go',
                'because proper nutrition builds immunity provides daily stamina protects against diseases and keeps mind clear and active',
                'dirty air containing toxic gases caused by vehicle exhaust factory fumes forest fires and open burning of rubbish',
                'because vocational students need english skills to read technical manuals operate modern machines and communicate with international companies',
                'teamwork is working together in unity needed in workplace to tackle difficult tasks improve work efficiency and achieve company objectives',
            ],
            'User 16' => [
                'SMARTPHONE IS ADVANCED MOBILE PHONE MAIN FUNCTIONS INCLUDE COMMUNICATION ENTERTAINMENT ONLINE SHOPPING AND FINDING INFORMATION QUICKLY VIA INTERNET',
                'STUDENTS AND WORKERS NEED HEALTHY FOOD TO GET ENERGY IMPROVE CONCENTRATION PREVENT ILLNESS AND MAINTAIN STRONG IMMUNE SYSTEM DAILY',
                'AIR POLLUTION IS AIR CONTAMINATION MAINLY CAUSED BY VEHICLE EXHAUST INDUSTRIAL SMOKE BURNING TRASH AND CHEMICAL EMISSIONS FROM FACTORIES',
                'VOCATIONAL STUDENTS NEED ENGLISH TO COMPETE IN GLOBAL WORK FORCE READ MACHINE MANUALS WORK IN MULTINATIONAL COMPANIES AND GROW CAREER',
                'TEAMWORK IS WORKING TOGETHER IN A GROUP TO REACH COMPANY OBJECTIVES NEEDED TO SPEED UP WORK SOLVE DIFFICULT PROBLEMS AND IMPROVE PRODUCTIVITY',
            ],
            'User 17' => [
                'a mobile phone with smart operating system mainly used for chatting on whatsapp scrolling instagram playing online games and photos',
                'coz healthy food gives u good vitamins keeps u active avoids heart problem or diabetes and makes u feel fresh everyday',
                'air pollution means dangerous dirty air in environment caused by vehicle smoke industrial waste fumes and open burning rubbish',
                'english is useful for vocational school students to read equipment manual interact with international clients and get hired by top company',
                'teamwork means working with coworkers nicely needed to speed up project solve office problem faster and build solid work atmosphere',
            ],
            'User 18' => [
                'cellphone that connects to internet useful for communication work online streaming music watching youtube videos anytime anywhere really convenient stuff',
                'healthy food gives u good energy keeps u fit prevents getting sick easily and makes u feel active all day long honestly',
                'dirty air full of smoke n dust caused by motorcycles cars factories burning trash that makes breathing dangerous for our lungs',
                'english is crucial for SMK students coz modern machinery manuals international company career and technical terms are all in english language',
                'teamwork means working together as group needed coz heavy job becomes lighter problem gets solved faster and working environment becomes nice',
            ],
            'User 19' => [
                'a smart phone is cell phone with advanced features main functions are browsing internet video call taking photos and social media app',
                'because healthy food keeps our body fit and strong gives energy for daily activity and protects us from getting sick easily every day',
                'air pollution means dirty unhealthful air caused by motor vehicle smoke power plants factory fumes and open burning of rubbish',
                'learning english helps vocational students to read user manual operate machine talk to foreign customers and get good career in future',
                'teamwork is working together as a team needed in workplace to complete heavy task faster share ideas and support each other',
            ],
            'User 20' => [
                'A SMARTPHONE IS MODERN TELEPHONE WITH COMPUTING CAPABILITY USED FOR COMMUNICATION ENTERTAINMENT STUDYING ONLINE AND TAKING PICTURES',
                'EAT HEALTHY FOOD TO SUPPLY VITAMINS AND MINERALS TO BODY MAINTAIN HIGH ENERGY LEVEL AND PREVENT CHRONIC ILLNESSES LIKE DIABETES',
                'AIR POLLUTION IS UNHEALTHY AIR CONDITION CAUSED BY MOTOR VEHICLE EXHAUST INDUSTRIAL EMISSIONS AND OPEN BURNING OF PLASTIC GARBAGE',
                'ENGLISH IS CRUCIAL FOR VOCATIONAL STUDENTS TO UNDERSTAND MACHINE MANUALS COMMUNICATE WITH FOREIGNERS AND BE READY FOR GLOBAL INDUSTRY WORK',
                'TEAMWORK IS COOPERATIVE WORK IN TEAM NEEDED IN WORKPLACE TO REACH GOAL FASTER SHARE WORKLOAD AND IMPROVE OVERALL WORK PERFORMANCE',
            ],
            'User 21' => [
                'SMARTPHONE IS HANDHELD DIGITAL DEVICE USED FOR MESSAGING BROWSING INTERNET TAKING PHOTO PLAYING GAMES AND WORKING REMOTELY',
                'HEALTHY FOOD DRIVES DAILY ENERGY STRENGTHENS IMMUNE DEFENSE PREVENTS SICKNESS AND ENSURES OPTIMAL BODY GROWTH AND LONGEVITY',
                'AIR POLLUTION IS HAZARDOUS CHEMICALS IN AIR CAUSED BY VEHICLE EMISSIONS INDUSTRIAL FACTORIES DUST AND BURNING TRASH IN OPEN FIELD',
                'ENGLISH DRIVES CAREER SUCCESS FOR VOCATIONAL STUDENTS TO READ EQUIPMENT MANUALS COMMUNICATE WITH INTERNATIONAL CLIENTS AND JOIN GLOBAL WORKFORCE',
                'TEAMWORK IS JOINT WORK EFFORT AMONG EMPLOYEES NEEDED IN WORKPLACE TO ACHIEVE TARGETS BOOST PRODUCTIVITY AND SOLVE COMPLEX ISSUES EFFICIENTLY',
            ],
            'User 22' => [
                'Smartphone is touchscreen device for calls texts internet access productivity tools like email and entertaining apps like tiktok youtube',
                'Eating healthy food daily nourishes body with essential vitamins improves immune function increases productivity and prevents chronic health issues',
                'Air pollution is harmful contamination of air caused by exhaust from cars trucks factories burning garbage and industrial activities',
                'Vocational students need English to understand equipment manuals communicate in foreign owned companies and stand out during job hiring process',
                'Teamwork is collaborative working style required in professional environment to combine different talent pool solve complex problems and boost overall productivity',
            ],
            'User 23' => [
                'a smart mobile phone that helps people connect access news use map navigation play games and take photos easily anywhere',
                'because good food gives energy keeps our immune strong protects body from sickness and makes us feel energized every single day',
                'air pollution is when air gets dirty from chemicals caused by motorcycle exhaust factory smoke burning trash and forest fires',
                'because vocational students must read machine instruction manuals in english use international software and communicate with global clients',
                'teamwork is doing tasks together as group needed at workplace to complete project faster share workload and learn from each other',
            ],
            'User 24' => [
                'SMARTPHONE IS COMPACT DEVICE WITH TOUCHSCREEN MAIN FUNCTION TO CONNECT PEOPLE VIA INTERNET ACCESS SOCIAL MEDIA AND DO DIGITAL WORK',
                'HEALTHY FOOD IS VERY IMPORTANT FOR ENERGY PRODUCTION IMMUNE SYSTEM SUPPORT DISEASE PREVENTION AND MAINTAINING OPTIMAL PHYSICAL HEALTH DAILY',
                'AIR POLLUTION IS CONTAMINATION OF ATMOSPHERE CAUSED BY MOTOR EXHAUST INDUSTRIAL EMISSIONS POWER PLANTS AND BURNING GARBAGE OUTDOORS',
                'ENGLISH IS ESSENTIAL FOR VOCATIONAL SCHOOL STUDENTS TO READ TECHNICAL GUIDES WORK IN MULTINATIONAL FIRMS AND CAREER ADVANCEMENT IN INDUSTRY',
                'TEAMWORK IS WORKING TOGETHER WITH COWORKERS TOWARD TARGET NEEDED IN WORKPLACE TO IMPROVE EFFICIENCY DIVIDE WORKLOAD AND CREATE POSITIVE ATMOSPHERE',
            ],
            'User 25' => [
                'SMARTPHONE IS MINI COMPUTER FOR CALL TEXT INTERNET MEDIA PLAYING GAME AND STUDY TOOL VERY IMPORTANT FOR MODERN LIFE TODAY',
                'HEALTHY FOOD PROVIDES NUTRIENTS ENERGY FOR BODY PREVENTS GETTING SICK BOOST IMMUNITY AND MAKES US LIVE LONGER HEALTHY LIFE',
                'AIR POLLUTION IS UNHEALTHY AIR FILLED WITH TOXIC GASES CAUSED BY VEHICLE EXHAUST FACTORY EMISSIONS AND BURNING GARBAGE IN OPEN AIR',
                'ENGLISH IS VERY IMPORTANT FOR SMK STUDENTS TO UNDERSTAND TECHNICAL MANUALS WORK IN INTERNATIONAL COMPANIES AND BOOST CAREER OPPORTUNITIES',
                'TEAMWORK IS WORKING TOGETHER IN TEAM TO FINISH WORK FAST NEEDED IN WORKPLACE TO HEAVY WORK BECOMES LIGHTER AND ACHIEVE COMPANY TARGET',
            ],
            'User 26' => [
                'A SMARTPHONE IS A HANDHELD COMPUTER WITH TELEPHONE CAPABILITIES USED PRIMARILY FOR COMMUNICATION WORK SOCIAL MEDIA AND ENTERTAINMENT PURPOSES',
                'IT IS VERY IMPORTANT TO EAT NUTRITIOUS FOOD DAILY TO MAINTAIN HEALTHY BODY WEIGHT BOOST IMMUNE SYSTEM AND PREVENT VARIOUS CHRONIC DISEASES',
                'AIR POLLUTION IS AIR CONTAMINATION BY TOXIC GASES AND DUST CAUSED BY INDUSTRIAL EMISSIONS VEHICLE EXHAUST AND OPEN BURNING OF WASTES',
                'STUDYING ENGLISH HELPS VOCATIONAL HIGH SCHOOL STUDENTS TO UNDERSTAND TECHNICAL MANUALS COMMUNICATE WITH INTERNATIONAL CLIENTS AND GET HIGHER SALARY JOBS',
                'TEAMWORK IS COLLABORATION BETWEEN COWORKERS TO REACH GOALS NEEDED IN WORKPLACE TO INCREASE PRODUCTIVITY SOLVE PROBLEMS AND BUILD GOOD RELATIONSHIPS',
            ],
            'User 27' => [
                'Smartphone is versatile mobile phone used to call text search google watch videos make digital payments and take high quality photos',
                'Eating healthy food daily builds strong immune system provides constant energy throughout day and protects body from various health problems',
                'Air pollution refers to dirty air containing toxic particles caused by vehicle exhaust smoke factory emissions and burning plastic waste',
                'Vocational students benefit from learning English by reading technical equipment manuals increasing employment chances and handling overseas business communication',
                'Teamwork represents joint effort of colleagues needed in workplace to improve productivity solve complicated tasks and achieve targets effectively',
            ],
            'User 28' => [
                'smartphone is basically a pocket computer used for calling texting surfing web playing games n managing daily tasks easily without needing laptop',
                'eating healthy food gives body essential nutrients to keep energy high boost immune system and prevent long term diseases like diabetes or heart trouble',
                'air pollution is dirty toxic gas in atmosphere caused mainly by vehicle exhaust factory emissions forest fire and burning garbage openly',
                'english is super important for vocational students to read technical manuals communicate with international clients and increase job opportunities after graduation',
                'teamwork means working together smoothly with colleagues to solve complex problems complete projects faster and achieve common business goals effectively',
            ],
            'User 29' => [
                'its a phone with touchscreen and web connection main job is for messaging phone call photo taking n listening to music',
                'because nutritious meal gives energy keeps immune system active avoids sickness and helps u stay fresh whole day long',
                'its dirty air contaminated by toxic gas caused by cars motorbikes factory smoke and people burning garbage outside',
                'coz vocational students need english to read machine manual pass job interview in foreign company and communicate with overseas client',
                'its working together as team needed at work coz one person cannot do everything alone and teamwork makes job easier n faster',
            ],
            'User 30' => [
                'its advanced gadget for communication main functions are online video call internet access mobile gaming and camera features',
                'healthy food is important because it provides vitamins gives energy prevents disease and keeps body fit for daily work',
                'dirty air that harms breathing caused by vehicle emissions factory fumes garbage burning and power plant smoke',
                'english helps vocational students read manual instructions work in international environment and improve career prospects after school',
                'teamwork is working together with team needed in office to reach company goal make job easier and increase work efficiency',
            ],
        ];
    }

    private function contentScale(int $essayScore): int
    {
        return match (true) {
            $essayScore >= 55 => 3,
            default => 2,
        };
    }

    private function grammarScale(int $essayScore): int
    {
        return match (true) {
            $essayScore >= 55 => 3,
            $essayScore >= 43 => 3,
            default => 2,
        };
    }

    private function grammarErrorCount(int $essayScore): int
    {
        return match (true) {
            $essayScore >= 55 => 3,
            $essayScore >= 43 => 6,
            default => 9,
        };
    }

    private function scaleCategory(int $scale): string
    {
        return match ($scale) {
            5 => 'Excellent',
            4 => 'Good',
            3 => 'Fair',
            2 => 'Poor',
            default => 'Very Poor',
        };
    }

    private function kategori(int $essayScore): string
    {
        return match (true) {
            $essayScore >= 76 => 'Sangat Baik',
            $essayScore >= 51 => 'Baik',
            $essayScore >= 26 => 'Cukup',
            default => 'Kurang',
        };
    }

    private function scores(): array
    {
        return [
            ['user' => 'User 1', 'listening' => [7, 36], 'structure' => [3, 34], 'reading' => [9, 38], 'essay' => 39],
            ['user' => 'User 2', 'listening' => [8, 37], 'structure' => [4, 35], 'reading' => [11, 39], 'essay' => 39],
            ['user' => 'User 3', 'listening' => [9, 38], 'structure' => [5, 36], 'reading' => [8, 37], 'essay' => 40],
            ['user' => 'User 4', 'listening' => [15, 42], 'structure' => [14, 44], 'reading' => [20, 46], 'essay' => 45],
            ['user' => 'User 5', 'listening' => [22, 47], 'structure' => [15, 45], 'reading' => [23, 48], 'essay' => 49],
            ['user' => 'User 6', 'listening' => [31, 54], 'structure' => [27, 56], 'reading' => [36, 58], 'essay' => 58],
            ['user' => 'User 7', 'listening' => [7, 36], 'structure' => [6, 37], 'reading' => [11, 39], 'essay' => 39],
            ['user' => 'User 8', 'listening' => [23, 48], 'structure' => [16, 46], 'reading' => [24, 49], 'essay' => 49],
            ['user' => 'User 9', 'listening' => [18, 44], 'structure' => [13, 43], 'reading' => [19, 45], 'essay' => 45],
            ['user' => 'User 10', 'listening' => [24, 49], 'structure' => [17, 47], 'reading' => [23, 48], 'essay' => 50],
            ['user' => 'User 11', 'listening' => [11, 39], 'structure' => [4, 35], 'reading' => [9, 38], 'essay' => 39],
            ['user' => 'User 12', 'listening' => [35, 57], 'structure' => [26, 55], 'reading' => [38, 59], 'essay' => 59],
            ['user' => 'User 13', 'listening' => [20, 46], 'structure' => [18, 48], 'reading' => [22, 47], 'essay' => 49],
            ['user' => 'User 14', 'listening' => [19, 45], 'structure' => [16, 46], 'reading' => [16, 43], 'essay' => 47],
            ['user' => 'User 15', 'listening' => [16, 43], 'structure' => [15, 45], 'reading' => [18, 44], 'essay' => 45],
            ['user' => 'User 16', 'listening' => [20, 46], 'structure' => [14, 44], 'reading' => [22, 47], 'essay' => 47],
            ['user' => 'User 17', 'listening' => [8, 37], 'structure' => [5, 36], 'reading' => [12, 40], 'essay' => 39],
            ['user' => 'User 18', 'listening' => [5, 35], 'structure' => [3, 34], 'reading' => [8, 37], 'essay' => 37],
            ['user' => 'User 19', 'listening' => [18, 44], 'structure' => [16, 46], 'reading' => [19, 45], 'essay' => 46],
            ['user' => 'User 20', 'listening' => [23, 48], 'structure' => [17, 47], 'reading' => [24, 49], 'essay' => 49],
            ['user' => 'User 21', 'listening' => [22, 47], 'structure' => [15, 45], 'reading' => [20, 46], 'essay' => 47],
            ['user' => 'User 22', 'listening' => [32, 55], 'structure' => [28, 57], 'reading' => [38, 59], 'essay' => 59],
            ['user' => 'User 23', 'listening' => [15, 42], 'structure' => [15, 45], 'reading' => [18, 44], 'essay' => 45],
            ['user' => 'User 24', 'listening' => [20, 46], 'structure' => [17, 47], 'reading' => [18, 44], 'essay' => 47],
            ['user' => 'User 25', 'listening' => [11, 39], 'structure' => [8, 38], 'reading' => [12, 40], 'essay' => 40],
            ['user' => 'User 26', 'listening' => [36, 58], 'structure' => [27, 56], 'reading' => [32, 55], 'essay' => 59],
            ['user' => 'User 27', 'listening' => [19, 45], 'structure' => [13, 43], 'reading' => [22, 47], 'essay' => 46],
            ['user' => 'User 28', 'listening' => [35, 57], 'structure' => [25, 54], 'reading' => [36, 58], 'essay' => 57],
            ['user' => 'User 29', 'listening' => [9, 38], 'structure' => [5, 36], 'reading' => [11, 39], 'essay' => 39],
            ['user' => 'User 30', 'listening' => [11, 39], 'structure' => [6, 37], 'reading' => [9, 38], 'essay' => 40],
        ];
    }
}
